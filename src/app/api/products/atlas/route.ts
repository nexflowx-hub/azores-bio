import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_ATLAS_API_URL || 'https://api.atlasglobal.digital';
const STORE_SLUG = process.env.NEXT_PUBLIC_STORE_SLUG || 'azores-bio';

/**
 * Map Shopify-style category strings to simple slugs.
 * The API returns categories like:
 *   "Chá dos Açores, Produtos por Ilhas > São Miguel"
 *   "Bebidas > Licores dos Açores"
 *   "Queijos DOP dos Açores, Produtos por Ilhas > São Jorge"
 * We extract the most specific sub-category and map it to a slug.
 */
const CATEGORY_KEYWORD_MAP: Record<string, string> = {
  // Queijos
  'queijo': 'queijos',
  'queijos': 'queijos',
  // Manteigas
  'manteiga': 'manteigas',
  'manteigas': 'manteigas',
  // Conservas
  'conserva': 'conservas',
  'conservas': 'conservas',
  // Vinhos
  'vinho': 'vinhos',
  'vinhos': 'vinhos',
  // Licores
  'licor': 'licores',
  'licores': 'licores',
  'aguardente': 'licores',
  // Chá
  'chá': 'cha',
  'cha': 'cha',
  // Pastelaria
  'pastelaria': 'pastelaria',
  'bolo': 'pastelaria',
  'biscoito': 'pastelaria',
  'cookies': 'pastelaria',
  // Compotas & Mel
  'compota': 'compotas',
  'compotas': 'compotas',
  'mel ': 'compotas',
  'doce': 'compotas',
  'doces': 'compotas',
  // Pimentas
  'pimenta': 'pimentas',
  'pimentas': 'pimentas',
  'especiaria': 'pimentas',
  'tempero': 'pimentas',
  // Bebidas
  'cerveja': 'bebidas',
  'sidra': 'bebidas',
  'refrigerante': 'bebidas',
  'água': 'bebidas',
  'bebida': 'bebidas',
  'bebidas': 'bebidas',
  // Charcutaria
  'charcutaria': 'charcutaria',
  'enchido': 'charcutaria',
  'salame': 'charcutaria',
  'morcela': 'charcutaria',
  // Outros
  'artesanato': 'outros',
  'cabaz': 'outros',
  'kit': 'outros',
  'pack': 'outros',
  'aperitivo': 'outros',
  'azeite': 'outros',
  'sal': 'outros',
  'café': 'outros',
};

function categoryToSlug(category: string): string {
  const lower = category.toLowerCase();

  // Check keywords from most specific to least specific
  for (const [keyword, slug] of Object.entries(CATEGORY_KEYWORD_MAP)) {
    if (lower.includes(keyword)) {
      return slug;
    }
  }

  return 'outros';
}

/**
 * Normalize a single product from the Atlas API so that:
 *  - priceEur is always a number (API may return string)
 *  - metadata.compareAtPrice is always a number or undefined
 *  - metadata.weight is always a number (default 0.5)
 *  - images is always an array
 *  - category is converted to a simple slug
 *  - First 8 products are marked as featured (if none are flagged)
 */
let featuredCounter = 0;

function normalizeProduct(raw: Record<string, unknown>) {
  const meta = (raw.metadata ?? {}) as Record<string, unknown>;
  const rawCategory = String(raw.category ?? 'outros');
  const slug = categoryToSlug(rawCategory);

  // Auto-feature the first 8 products if none have featured=true
  const isFeatured = Boolean(meta.featured) || featuredCounter < 8;
  if (!Boolean(meta.featured) && featuredCounter < 8) {
    featuredCounter++;
  }

  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    slug: String(raw.slug ?? ''),
    priceEur: typeof raw.priceEur === 'number' ? raw.priceEur : parseFloat(String(raw.priceEur ?? '0')),
    images: Array.isArray(raw.images) ? raw.images : [],
    category: slug,
    categoryOriginal: rawCategory, // keep original for reference
    description: String(raw.description ?? ''),
    metadata: {
      weight: typeof meta.weight === 'number' ? meta.weight : parseFloat(String(meta.weight ?? '0.5')) || 0.5,
      requiresColdTransport: Boolean(meta.requiresColdTransport),
      nameEn: meta.nameEn ? String(meta.nameEn) : undefined,
      nameFr: meta.nameFr ? String(meta.nameFr) : undefined,
      nameDe: meta.nameDe ? String(meta.nameDe) : undefined,
      descriptionEn: meta.descriptionEn ? String(meta.descriptionEn) : undefined,
      descriptionFr: meta.descriptionFr ? String(meta.descriptionFr) : undefined,
      descriptionDe: meta.descriptionDe ? String(meta.descriptionDe) : undefined,
      origin: meta.origin ? String(meta.origin) : undefined,
      sku: meta.sku ? String(meta.sku) : undefined,
      featured: isFeatured,
      stock: typeof meta.stock === 'number' ? meta.stock : parseInt(String(meta.stock ?? '0'), 10) || 0,
      compareAtPrice: meta.compareAtPrice
        ? (typeof meta.compareAtPrice === 'number' ? meta.compareAtPrice : parseFloat(String(meta.compareAtPrice)))
        : undefined,
    },
  };
}

export async function GET() {
  const url = `${API_URL}/api/v1/storefront/products?store=${STORE_SLUG}`;

  console.log(`[Atlas API] GET ${url}`);

  try {
    const res = await fetch(url, {
      next: { revalidate: 300 }, // cache for 5 min — server-side only
    });

    console.log(`[Atlas API] Response status: ${res.status} ${res.statusText}`);

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(`[Atlas API] Error body: ${body.slice(0, 500)}`);
      return NextResponse.json(
        { error: `Atlas API error: ${res.status}`, products: [] },
        { status: res.status }
      );
    }

    const data = await res.json();
    const rawProducts: unknown[] = Array.isArray(data) ? data : data.products ?? [];

    // Reset featured counter before normalizing
    featuredCounter = 0;

    // Normalize every product (fix string→number, category→slug, etc.)
    const products = rawProducts.map((raw) =>
      normalizeProduct(raw as Record<string, unknown>)
    );

    // Count products per category slug
    const catCounts: Record<string, number> = {};
    products.forEach((p) => {
      catCounts[p.category] = (catCounts[p.category] || 0) + 1;
    });

    console.log(`[Atlas API] Products fetched: ${products.length}`);
    console.log(`[Atlas API] Category distribution:`, JSON.stringify(catCounts));
    if (products.length > 0) {
      console.log(`[Atlas API] First product:`, JSON.stringify(products[0]).slice(0, 300));
    }

    return NextResponse.json({ products });
  } catch (err) {
    console.error('[Atlas API] fetch threw:', err);
    return NextResponse.json(
      { error: 'Failed to fetch products', products: [] },
      { status: 500 }
    );
  }
}

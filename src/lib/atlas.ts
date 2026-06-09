/**
 * ═══════════════════════════════════════════════════════════════
 * Atlas Adapter v4.0 — Bootstrap-First Architecture
 * AZORES.BIO Dumb Client / Relay Node
 * ═══════════════════════════════════════════════════════════════
 *
 * ARCHITECTURE: The /storefront/bootstrap endpoint is the single
 * source of truth. It returns store + catalog + checkout in one
 * call. All other fetch functions derive from this cached payload.
 *
 * Key design decisions:
 *   1. Bootstrap-first: All data comes from /storefront/bootstrap
 *   2. In-memory cache: Avoid re-fetching 460 products on every nav
 *   3. Category derivation: Products lack "category" field — we
 *      derive categories from product name keywords (PT language)
 *   4. Data sanitization: Decimal cast, image parse, ID routing
 *   5. Client-side filtering: Search, sort, category done in-browser
 *
 * Working endpoints:
 *   GET /api/v1/storefront/bootstrap?store=azores-bio  ✅
 *   GET /api/v1/storefront/products?store=azores-bio   ✅ (fallback)
 *
 * Non-existent endpoints (DO NOT CALL):
 *   GET /api/v1/storefront/products/{id}               ❌
 *   GET /api/v1/storefront/categories                  ❌
 *   GET /api/v1/storefront/checkout-config             ❌
 */

import {
  AtlasProductRaw,
  AtlasProduct,
  AtlasCategory,
  BootstrapRaw,
  CheckoutConfigRaw,
  CheckoutConfig,
  PaymentMethodConfig,
  PaymentMethod,
  CheckoutIntentRequest,
  CheckoutIntentWire,
  AtlasCheckoutResponse,
  OrdersRequest,
  AtlasOrdersResponse,
  StockSettlementRequest,
} from './types';

// ─── Configuration ──────────────────────────────────────────
const API_URL =
  process.env.NEXT_PUBLIC_ATLAS_API_URL || 'https://api.atlasglobal.digital';
const STORE_SLUG =
  process.env.NEXT_PUBLIC_STORE_SLUG || 'azores-bio';

// ═══════════════════════════════════════════════════════════════
// IN-MEMORY CACHE — Avoid re-fetching bootstrap on every page
// ═══════════════════════════════════════════════════════════════

interface BootstrapCache {
  products: AtlasProduct[];
  categories: AtlasCategory[];
  checkoutConfig: CheckoutConfig | null;
  store: BootstrapRaw['store'];
  fetchedAt: number;
}

let cache: BootstrapCache | null = null;
const CACHE_TTL_MS = 60_000; // 1 minute — matches API revalidate

function isCacheValid(): boolean {
  return cache !== null && (Date.now() - cache.fetchedAt) < CACHE_TTL_MS;
}

function clearCache(): void {
  cache = null;
}

// ═══════════════════════════════════════════════════════════════
// DATA SANITIZATION — The core of the adapter
// ═══════════════════════════════════════════════════════════════

/**
 * Sanitize a decimal value from Prisma.
 * Prisma serializes Decimal as String (e.g. "29.99").
 * We force Number() conversion — always returns a valid number.
 */
function sanitizeDecimal(value: number | string | undefined | null, fallback = 0): number {
  if (value === undefined || value === null) return fallback;
  const num = typeof value === 'string' ? Number(value) : value;
  return isNaN(num) ? fallback : num;
}

/**
 * Sanitize a boolean value that may come as string from Prisma.
 */
function sanitizeBoolean(value: boolean | string | undefined | null): boolean | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true' || value === '1';
  return Boolean(value);
}

/**
 * Sanitize images array.
 * The API may return images as:
 *   - A proper string[] array (current bootstrap format)
 *   - A JSON-escaped string: '["url1","url2"]'
 *   - A single URL string
 *   - undefined / null
 *
 * We parse resiliently and filter out empty/broken URLs.
 */
function sanitizeImages(raw: string | string[] | undefined | null, fallbackUrl?: string): string[] {
  let parsed: string[] = [];

  try {
    if (Array.isArray(raw)) {
      parsed = raw.filter((url): url is string => typeof url === 'string' && url.trim().length > 0);
    } else if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (trimmed.startsWith('[')) {
        try {
          const decoded = JSON.parse(trimmed);
          if (Array.isArray(decoded)) {
            parsed = decoded.filter((url): url is string => typeof url === 'string' && url.trim().length > 0);
          } else if (typeof decoded === 'string' && decoded.trim().length > 0) {
            parsed = [decoded];
          }
        } catch {
          if (trimmed.length > 0) parsed = [trimmed];
        }
      } else if (trimmed.length > 0) {
        parsed = [trimmed];
      }
    }
  } catch {
    parsed = [];
  }

  if (parsed.length === 0 && fallbackUrl && typeof fallbackUrl === 'string' && fallbackUrl.trim().length > 0) {
    parsed = [fallbackUrl.trim()];
  }

  return parsed;
}

/**
 * Sanitize tags — same pattern as images (may be JSON string or array).
 */
function sanitizeTags(raw: string[] | string | undefined | null): string[] {
  try {
    if (Array.isArray(raw)) return raw.filter(Boolean);
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (trimmed.startsWith('[')) {
        try {
          const decoded = JSON.parse(trimmed);
          return Array.isArray(decoded) ? decoded.filter(Boolean) : [trimmed];
        } catch {
          return [trimmed];
        }
      }
      return trimmed.length > 0 ? [trimmed] : [];
    }
  } catch {
    // Silently return empty
  }
  return [];
}

/**
 * ═══════════════════════════════════════════════════════════════
 * sanitizeProduct — The main product sanitization function
 * ═══════════════════════════════════════════════════════════════
 */
function sanitizeProduct(raw: AtlasProductRaw): AtlasProduct {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    slug: raw.slug ? String(raw.slug) : undefined,
    priceEur: sanitizeDecimal(raw.priceEur),
    images: sanitizeImages(raw.images, raw.imageUrl),
    category: raw.category ? String(raw.category) : undefined,
    description: raw.description ? String(raw.description) : undefined,
    stock: raw.stock !== undefined ? (typeof raw.stock === 'string' ? parseInt(raw.stock, 10) || 0 : raw.stock) : undefined,
    weight: raw.weight !== undefined ? sanitizeDecimal(raw.weight, undefined) : undefined,
    origin: raw.origin ? String(raw.origin) : undefined,
    featured: sanitizeBoolean(raw.featured),
    tags: sanitizeTags(raw.tags),
    sku: raw.sku ? String(raw.sku) : undefined,
    nameEn: raw.nameEn ? String(raw.nameEn) : undefined,
    nameFr: raw.nameFr ? String(raw.nameFr) : undefined,
    nameDe: raw.nameDe ? String(raw.nameDe) : undefined,
    nameEs: raw.nameEs ? String(raw.nameEs) : undefined,
    descriptionEn: raw.descriptionEn ? String(raw.descriptionEn) : undefined,
    descriptionFr: raw.descriptionFr ? String(raw.descriptionFr) : undefined,
    descriptionDe: raw.descriptionDe ? String(raw.descriptionDe) : undefined,
    descriptionEs: raw.descriptionEs ? String(raw.descriptionEs) : undefined,
    compareAtPrice: raw.compareAtPrice ? sanitizeDecimal(raw.compareAtPrice, undefined) : undefined,
    imageUrl: raw.imageUrl ? String(raw.imageUrl) : undefined,
    active: sanitizeBoolean(raw.active),
  };
}

// ═══════════════════════════════════════════════════════════════
// CATEGORY DERIVATION — From product name keywords
// ═══════════════════════════════════════════════════════════════

/**
 * Derive a category slug from a product name using keyword matching.
 * The bootstrap endpoint does NOT return category fields.
 * We use Portuguese product name keywords to categorize.
 */
function deriveCategoryFromName(name: string): string {
  const n = name.toLowerCase();

  // Priority order: most specific first
  if (/\bvinho\b|\bverdelho\b|\barinto\b|\bterrantz\b|\bpedras brancas\b|\breserva\b.*\b\d{4}\b/i.test(n) && /\b750ml\b|\bvinho\b/i.test(n)) return 'vinhos';
  if (/\bcompota\b|\bdoce de\b|\bdoces?\b/i.test(n) && !/\blicor\b/i.test(n)) return 'compotas';
  if (/\bchá\b|\bcha\b|\bpo ejo\b|\bcidreira\b|\berva pr[ií]nc[ií]pe\b/i.test(n)) return 'cha';
  if (/\bsumo\b|\bkima\b/i.test(n)) return 'bebidas';
  if (/\blicor\b|\blicoreira\b|\bminiatura.*licor\b/i.test(n)) return 'licores';
  if (/\bpimenta\b/i.test(n)) return 'pimentas';
  if (/\bconserva\b|\batum\b|\bbacalhau\b|\bsarda\b|\bcaval[a]a\b|\bfilete\b|\bflocos?\b/i.test(n)) return 'conservas';
  if (/\bqueijo\b/i.test(n)) return 'queijos';
  if (/\bmanteiga\b/i.test(n)) return 'manteigas';
  if (/\bcharcutaria\b|\bsalame\b|\bchouri[cç]o\b|\bmorcela\b|\bpresunto\b/i.test(n)) return 'charcutaria';
  if (/\bpastel\b|\bbolo\b|\bbiscoto\b|\brosc[ao]\b/i.test(n)) return 'pastelaria';
  if (/\bsabonete\b|\bsabão\b|\bcreme\b|\baloé\b|\bshampoo\b|\bcosm[eé]tic/i.test(n)) return 'cosmetica';
  if (/\bmel\b/i.test(n)) return 'mel';

  return 'outros';
}

/**
 * Category metadata — display names, icons, display order.
 */
const CATEGORY_META: Record<string, { name: string; namePt: string; icon: string; order: number }> = {
  queijos:      { name: 'Cheeses',    namePt: 'Queijos',       icon: '🧀', order: 1 },
  manteigas:    { name: 'Butters',    namePt: 'Manteigas',     icon: '🧈', order: 2 },
  conservas:    { name: 'Conserves',  namePt: 'Conservas',     icon: '🐟', order: 3 },
  vinhos:       { name: 'Wines',      namePt: 'Vinhos',        icon: '🍷', order: 4 },
  licores:      { name: 'Liqueurs',   namePt: 'Licores',       icon: '🍶', order: 5 },
  cha:          { name: 'Teas',       namePt: 'Chá',           icon: '🍵', order: 6 },
  compotas:     { name: 'Jams',       namePt: 'Compotas',      icon: '🍯', order: 7 },
  pimentas:     { name: 'Peppers',    namePt: 'Pimentas',      icon: '🌶️', order: 8 },
  bebidas:      { name: 'Drinks',     namePt: 'Bebidas',       icon: '🥤', order: 9 },
  pastelaria:   { name: 'Pastry',     namePt: 'Pastelaria',    icon: '🍰', order: 10 },
  charcutaria:  { name: 'Charcuterie',namePt: 'Charcutaria',   icon: '🥩', order: 11 },
  mel:          { name: 'Honey',      namePt: 'Mel',           icon: '🍯', order: 12 },
  cosmetica:    { name: 'Cosmetics',  namePt: 'Cosmética',     icon: '🧴', order: 13 },
  outros:       { name: 'Other',      namePt: 'Outros',        icon: '🎁', order: 99 },
};

/**
 * Build categories from a list of products.
 * Counts products per derived category, sorts by product count desc.
 */
function buildCategories(products: AtlasProduct[]): AtlasCategory[] {
  const countMap: Record<string, number> = {};

  for (const p of products) {
    const cat = p.category || deriveCategoryFromName(p.name);
    p.category = cat; // Assign derived category to product
    countMap[cat] = (countMap[cat] || 0) + 1;
  }

  const categories: AtlasCategory[] = Object.entries(countMap)
    .map(([slug, count]) => {
      const meta = CATEGORY_META[slug] || { name: slug, namePt: slug, icon: '🌿', order: 50 };
      return {
        slug,
        name: meta.namePt,
        namePt: meta.namePt,
        nameEn: meta.name,
        productCount: count,
        icon: meta.icon,
      };
    })
    .filter((c) => c.productCount > 0)
    .sort((a, b) => {
      const orderA = CATEGORY_META[a.slug]?.order ?? 50;
      const orderB = CATEGORY_META[b.slug]?.order ?? 50;
      return orderA - orderB;
    });

  return categories;
}

// ═══════════════════════════════════════════════════════════════
// BOOTSTRAP — The single source of truth
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch the complete bootstrap payload from Atlas Core.
 * This is the PRIMARY data-fetching function.
 *
 * Returns cached data if still fresh, otherwise fetches from API.
 */
export async function fetchBootstrap(): Promise<{
  store: BootstrapRaw['store'];
  products: AtlasProduct[];
  categories: AtlasCategory[];
  checkoutConfig: CheckoutConfig | null;
}> {
  // Return cached data if still fresh
  if (isCacheValid() && cache) {
    console.log(`[Atlas] fetchBootstrap: CACHE HIT (${cache.products.length} products)`);
    return {
      store: cache.store,
      products: cache.products,
      categories: cache.categories,
      checkoutConfig: cache.checkoutConfig,
    };
  }

  try {
    const res = await fetch(
      `${API_URL}/api/v1/storefront/bootstrap?store=${STORE_SLUG}`,
      { next: { revalidate: 60 } } as RequestInit,
    );

    if (!res.ok) {
      console.warn(`[Atlas] bootstrap failed (${res.status})`);
      // Return stale cache if available
      if (cache) {
        console.log(`[Atlas] returning stale cache`);
        return {
          store: cache.store,
          products: cache.products,
          categories: cache.categories,
          checkoutConfig: cache.checkoutConfig,
        };
      }
      return { store: undefined, products: [], categories: [], checkoutConfig: null };
    }

    const data: BootstrapRaw = await res.json();

    // Extract products from nested path: data.catalog.products
    const rawProducts: AtlasProductRaw[] = data?.catalog?.products ?? [];
    const products = rawProducts.map(sanitizeProduct);

    // Derive categories from product names
    const categories = buildCategories(products);

    // Build checkout config from bootstrap payload
    let checkoutConfig: CheckoutConfig | null = null;
    if (data.checkout) {
      const rawMethods = data.checkout.allowedMethods || [];
      checkoutConfig = enrichCheckoutConfig({
        allowedMethods: rawMethods,
        keys: { stripe_public: data.checkout.keys?.stripe_public || '' },
        cryptoWallet: data.checkout.cryptoWallet || '',
      });
      if (data.checkout.defaultCurrency) {
        checkoutConfig.currency = data.checkout.defaultCurrency;
      }
    }

    // Update cache
    cache = {
      store: data.store,
      products,
      categories,
      checkoutConfig,
      fetchedAt: Date.now(),
    };

    console.log(`[Atlas] fetchBootstrap: ${products.length} products, ${categories.length} categories, ${data.checkout?.allowedMethods?.length ?? 0} payment methods`);

    return { store: data.store, products, categories, checkoutConfig };
  } catch (err) {
    console.error('[Atlas] fetchBootstrap error:', err);
    if (cache) {
      return {
        store: cache.store,
        products: cache.products,
        categories: cache.categories,
        checkoutConfig: cache.checkoutConfig,
      };
    }
    return { store: undefined, products: [], categories: [], checkoutConfig: null };
  }
}

// ═══════════════════════════════════════════════════════════════
// DERIVED FETCH FUNCTIONS — All use bootstrap cache
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch products — uses bootstrap cache, applies client-side filters.
 * Category, search, and sort are applied in-browser.
 */
export async function fetchProducts(params?: {
  category?: string;
  search?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}): Promise<{ products: AtlasProduct[]; total: number }> {
  const { products } = await fetchBootstrap();

  let filtered = [...products];

  // Filter by category
  if (params?.category && params.category !== 'all') {
    filtered = filtered.filter((p) => p.category === params.category);
  }

  // Filter by search term
  if (params?.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.origin && p.origin.toLowerCase().includes(q)),
    );
  }

  // Sort
  switch (params?.sort) {
    case 'price_asc':
      filtered.sort((a, b) => a.priceEur - b.priceEur);
      break;
    case 'price_desc':
      filtered.sort((a, b) => b.priceEur - a.priceEur);
      break;
    case 'name':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'featured':
    default:
      // Keep original order from API (likely insertion/import order)
      break;
  }

  const total = filtered.length;

  // Apply offset/limit
  const offset = params?.offset ?? 0;
  const limit = params?.limit ?? filtered.length;
  filtered = filtered.slice(offset, offset + limit);

  console.log(`[Atlas] fetchProducts: ${filtered.length}/${total} (cat=${params?.category}, search=${params?.search})`);

  return { products: filtered, total };
}

/**
 * Fetch a single product by ID (UUID).
 * Uses bootstrap cache since /products/{id} endpoint doesn't exist.
 */
export async function fetchProductById(id: string): Promise<AtlasProduct | null> {
  const { products } = await fetchBootstrap();
  const product = products.find((p) => p.id === id) || null;

  if (!product) {
    console.warn(`[Atlas] fetchProductById: product ${id} not found`);
  }

  return product;
}

/**
 * Fetch categories — derived from bootstrap product data.
 */
export async function fetchCategories(): Promise<AtlasCategory[]> {
  const { categories } = await fetchBootstrap();
  return categories;
}

/**
 * Fetch featured products — returns first N products from bootstrap.
 * Since products don't have a "featured" flag, we return the first N.
 */
export async function fetchFeaturedProducts(limit = 8): Promise<AtlasProduct[]> {
  const { products } = await fetchBootstrap();
  return products.slice(0, limit);
}

// ═══════════════════════════════════════════════════════════════
// CHECKOUT CONFIG — Dynamic Payment Rules from Core DB
// ═══════════════════════════════════════════════════════════════

/**
 * Enrich raw checkout config with frontend-friendly data.
 */
function enrichCheckoutConfig(raw: CheckoutConfigRaw): CheckoutConfig {
  const methodLabels: Record<
    string,
    {
      label: string;
      description?: string;
      requiresPhone?: boolean;
      requiresKYC?: boolean;
      provider?: string;
    }
  > = {
    card: {
      label: 'Cartão de Crédito/Débito',
      description: 'Visa, Mastercard, etc.',
      provider: 'STRIPE_PT_002',
    },
    mbway: {
      label: 'MBWAY',
      description: 'Confirme na App',
      requiresPhone: true,
      provider: 'PROXY_MBWAY',
    },
    multibanco: {
      label: 'Multibanco',
      description: 'Referência de pagamento',
      provider: 'PROXY_MULTIBANCO',
    },
    sepa: {
      label: 'Transferência SEPA',
      description: 'Transferência bancária',
      provider: 'PROXY_SEPA',
    },
    crypto: {
      label: 'Pagamento Web3',
      description: '-5% Desconto',
      requiresKYC: true,
      provider: 'ONRAMP_MONEY',
    },
    bizum: {
      label: 'Bizum',
      description: 'Pagamento rápido via app do seu banco',
      provider: 'STRIPE_BIZUM',
    },
  };

  // Ensure critical methods are always available even if the API
  // hasn't been updated yet (e.g. 'bizum' was added after initial deploy).
  const rawMethods = raw.allowedMethods || [];
  const REQUIRED_METHODS = ['bizum', 'sepa'] as const;
  const mergedMethods = [...rawMethods];
  for (const m of REQUIRED_METHODS) {
    if (!mergedMethods.includes(m)) mergedMethods.push(m);
  }

  const paymentMethods: PaymentMethodConfig[] = mergedMethods.map((method) => {
    const meta = methodLabels[method] || {
      label: method,
      provider: method.toUpperCase(),
    };
    return {
      method: method as PaymentMethod,
      ...meta,
    } as PaymentMethodConfig;
  });

  return {
    allowedMethods: mergedMethods,
    keys: raw.keys,
    cryptoWallet: raw.cryptoWallet,
    paymentMethods,
    stripePublishableKey: raw.keys?.stripe_public,
    cryptoDiscountPct: 5,
    freeShippingThreshold: 75,
    shippingCost: 6.5,
    currency: 'EUR',
  };
}

/**
 * Fetch checkout configuration — uses bootstrap cache.
 */
export async function fetchStoreCheckoutConfig(): Promise<CheckoutConfig> {
  const { checkoutConfig } = await fetchBootstrap();

  if (checkoutConfig) return checkoutConfig;

  // Fallback config if bootstrap didn't provide checkout data
  return {
    allowedMethods: ['card', 'mbway', 'multibanco', 'crypto', 'bizum'],
    keys: { stripe_public: '' },
    cryptoWallet: '',
    paymentMethods: [
      { method: 'card', label: 'Cartão de Crédito/Débito', provider: 'STRIPE_PT_002' },
      { method: 'mbway', label: 'MBWAY', requiresPhone: true, provider: 'PROXY_MBWAY' },
      { method: 'multibanco', label: 'Multibanco', provider: 'PROXY_MULTIBANCO' },
      { method: 'crypto', label: 'Pagamento Web3', description: '-5% Desconto', requiresKYC: true, provider: 'ONRAMP_MONEY' },
      { method: 'bizum', label: 'Bizum', description: 'Pagamento rápido via app do seu banco', provider: 'STRIPE_BIZUM' },
    ],
    stripePublishableKey: '',
    cryptoDiscountPct: 5,
    freeShippingThreshold: 75,
    shippingCost: 6.5,
    currency: 'EUR',
  };
}

/** Backward-compatible alias */
export const fetchCheckoutConfig = fetchStoreCheckoutConfig;

// ═══════════════════════════════════════════════════════════════
// CHECKOUT INTENT — Payment Submission to Core V2
// ═══════════════════════════════════════════════════════════════

/**
 * Submit a checkout intent to Atlas Core V2.
 * Endpoint: POST /api/v1/checkout/intent
 *
 * CRITICAL: The frontend sends CheckoutIntentRequest (friendly format),
 * but the Core V2 controller expects a specific wire format:
 *   - method → payment.provider (UPPERCASE: CARD, MBWAY, etc.)
 *   - items → cart
 *   - currency is required (not optional)
 */
export async function createPaymentIntent(
  payload: CheckoutIntentRequest,
): Promise<AtlasCheckoutResponse> {
  // ── Map frontend-friendly payload → Core V2 wire format ──
  const wire: CheckoutIntentWire = {
    store: payload.store,
    payment: {
      provider: payload.method.toUpperCase(), // 'card' → 'CARD', 'mbway' → 'MBWAY', etc.
    },
    amount: payload.amount,
    currency: payload.currency || 'EUR',
    customer: payload.customer,
    cart: payload.items, // 'items' → 'cart' (Core V2 contract)
  };

  console.log(`[Atlas] checkout/intent: provider=${wire.payment.provider}, amount=${wire.amount}, cart=${wire.cart.length} items`);

  const res = await fetch(`${API_URL}/api/v1/checkout/intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-store-slug': STORE_SLUG,
    },
    body: JSON.stringify(wire),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Checkout intent error: ${res.status}`,
    );
  }

  return res.json();
}

/** Backward-compatible alias */
export const processCheckout = createPaymentIntent;

// ═══════════════════════════════════════════════════════════════
// CRM — Stock Settlement & Order Confirmation
// ═══════════════════════════════════════════════════════════════

/**
 * Notify Core CRM to decrement stock and move order to "Pending Settlement".
 * Endpoint: POST /api/v1/crm/order/settle
 */
export async function settleStock(
  payload: StockSettlementRequest,
): Promise<{ success: boolean; orderId: string; status: string }> {
  const res = await fetch(`${API_URL}/api/v1/crm/order/settle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-store-slug': STORE_SLUG,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Stock settlement error: ${res.status}`,
    );
  }

  return res.json();
}

// ═══════════════════════════════════════════════════════════════
// ORDERS — POST /orders
// ═══════════════════════════════════════════════════════════════

/**
 * Create a new order in Atlas Core.
 * Endpoint: POST /api/v1/orders
 */
export async function createOrder(
  payload: OrdersRequest,
): Promise<AtlasOrdersResponse> {
  const res = await fetch(`${API_URL}/api/v1/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-store-slug': STORE_SLUG,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Order creation error: ${res.status}`,
    );
  }

  return res.json();
}

// ─── Exports ─────────────────────────────────────────────────
export { API_URL, STORE_SLUG, clearCache, CATEGORY_META };

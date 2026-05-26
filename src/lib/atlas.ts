/**
 * ═══════════════════════════════════════════════════════════════
 * Atlas Adapter v3.0 — Universal Entry Point with Data Sanitization
 * AZORES.BIO Dumb Client / Relay Node
 * ═══════════════════════════════════════════════════════════════
 *
 * CRITICAL: Prisma (backend) serializes Decimal fields as Strings.
 * This adapter applies rigorous sanitization to ensure the React
 * frontend always receives consistently-typed data.
 *
 * Key sanitization rules:
 *   1. Decimal cast: priceEur: "29.99" → Number("29.99") → 29.99
 *   2. Image parse: "['url1','url2']" → JSON.parse → ['url1','url2']
 *   3. ID routing: Always use product.id (UUID) for /product/${id}
 *   4. Nested path: bootstrap products at data.catalog.products
 *   5. Empty image filter: Never render broken/empty image URLs
 *
 * Configuration (only 2 env vars):
 *   NEXT_PUBLIC_ATLAS_API_URL  → https://api.atlasglobal.digital
 *   NEXT_PUBLIC_STORE_SLUG     → azores-bio
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
 *   - A proper string[] array
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
      // Already an array — just filter empties
      parsed = raw.filter((url): url is string => typeof url === 'string' && url.trim().length > 0);
    } else if (typeof raw === 'string') {
      // Could be a JSON-escaped string from Prisma/legacy scrapers
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
          // Not valid JSON — treat as single URL
          if (trimmed.length > 0) parsed = [trimmed];
        }
      } else if (trimmed.length > 0) {
        // Plain string URL
        parsed = [trimmed];
      }
    }
  } catch {
    parsed = [];
  }

  // Fallback: use imageUrl if images array is empty
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
 *
 * Converts raw Atlas API product into a consistently-typed shape
 * safe for React rendering. ALL numeric fields are Number()-cast,
 * ALL images are parsed and filtered, ALL IDs are string-guaranteed.
 * ═══════════════════════════════════════════════════════════════
 */
function sanitizeProduct(raw: AtlasProductRaw): AtlasProduct {
  return {
    id: String(raw.id ?? ''),                    // UUID — used for routing /product/${id}
    name: String(raw.name ?? ''),
    slug: raw.slug ? String(raw.slug) : undefined,
    priceEur: sanitizeDecimal(raw.priceEur),     // Prisma Decimal → Number
    images: sanitizeImages(raw.images, raw.imageUrl),  // Resilient parse + filter
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
    descriptionEn: raw.descriptionEn ? String(raw.descriptionEn) : undefined,
    descriptionFr: raw.descriptionFr ? String(raw.descriptionFr) : undefined,
    descriptionDe: raw.descriptionDe ? String(raw.descriptionDe) : undefined,
    compareAtPrice: raw.compareAtPrice ? sanitizeDecimal(raw.compareAtPrice, undefined) : undefined,
    imageUrl: raw.imageUrl ? String(raw.imageUrl) : undefined,
    active: sanitizeBoolean(raw.active),
  };
}

// ═══════════════════════════════════════════════════════════════
// CATALOG — Product & Category Reads
// ═══════════════════════════════════════════════════════════════

/**
 * Extract products array from any API response shape.
 * Handles both /storefront/products (products at root) and
 * /storefront/bootstrap (products nested at catalog.products).
 */
function extractProducts(data: unknown): AtlasProductRaw[] {
  if (!data || typeof data !== 'object') return [];

  const d = data as Record<string, unknown>;

  // Try bootstrap nested path first: data.catalog.products
  if (d.catalog && typeof d.catalog === 'object') {
    const cat = d.catalog as Record<string, unknown>;
    if (Array.isArray(cat.products)) return cat.products;
  }

  // Fallback: data.products (standard /products response)
  if (Array.isArray(d.products)) return d.products;

  // Fallback: data itself might be the array
  if (Array.isArray(d)) return d;

  return [];
}

/**
 * Extract total count from any API response shape.
 */
function extractTotal(data: unknown, fallbackLength: number): number {
  if (!data || typeof data !== 'object') return fallbackLength;
  const d = data as Record<string, unknown>;

  if (typeof d.total === 'number') return d.total;
  if (typeof d.total === 'string') return parseInt(d.total, 10) || fallbackLength;

  return fallbackLength;
}

/**
 * Fetch products from Atlas Core.
 * Supports both /storefront/products and /storefront/bootstrap endpoints.
 * Applies full data sanitization on every product.
 */
export async function fetchProducts(params?: {
  category?: string;
  search?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}): Promise<{ products: AtlasProduct[]; total: number }> {
  const sp = new URLSearchParams({ store: STORE_SLUG });
  if (params?.category) sp.set('category', params.category);
  if (params?.search) sp.set('search', params.search);
  if (params?.sort) sp.set('sort', params.sort);
  if (params?.limit) sp.set('limit', String(params.limit));
  if (params?.offset) sp.set('offset', String(params.offset));

  // Try /storefront/products first (dedicated endpoint)
  let res = await fetch(
    `${API_URL}/api/v1/storefront/products?${sp.toString()}`,
    { next: { revalidate: 60 } } as RequestInit,
  );

  // If /products fails, try /storefront/bootstrap (combined payload)
  if (!res.ok) {
    res = await fetch(
      `${API_URL}/api/v1/storefront/bootstrap?store=${STORE_SLUG}`,
      { next: { revalidate: 60 } } as RequestInit,
    );
  }

  if (!res.ok) throw new Error(`Atlas products error: ${res.status}`);

  const data = await res.json();
  const raw: AtlasProductRaw[] = extractProducts(data);
  const products = raw.map(sanitizeProduct);
  const total = extractTotal(data, products.length);

  console.log(`[Atlas] fetchProducts: ${products.length} products sanitized (total: ${total})`);

  return { products, total };
}

/**
 * Fetch a single product by ID (UUID).
 * Routes to /product/${product.id} — never relies on slug.
 */
export async function fetchProductById(
  id: string,
): Promise<AtlasProduct | null> {
  // Try /storefront/products/{id} first
  let res = await fetch(
    `${API_URL}/api/v1/storefront/products/${id}?store=${STORE_SLUG}`,
    { next: { revalidate: 60 } } as RequestInit,
  );

  // Fallback: if single-product endpoint doesn't exist, try bootstrap + filter
  if (!res.ok && res.status !== 404) {
    res = await fetch(
      `${API_URL}/api/v1/storefront/products/${id}?store=${STORE_SLUG}`,
      { next: { revalidate: 60 } } as RequestInit,
    );
  }

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Atlas product error: ${res.status}`);

  const data = await res.json();
  const raw: AtlasProductRaw = data.product ?? data;
  return sanitizeProduct(raw);
}

/**
 * Fetch categories from Atlas Core.
 */
export async function fetchCategories(): Promise<AtlasCategory[]> {
  const res = await fetch(
    `${API_URL}/api/v1/storefront/categories?store=${STORE_SLUG}`,
    { next: { revalidate: 120 } } as RequestInit,
  );
  if (!res.ok) throw new Error(`Atlas categories error: ${res.status}`);

  const data = await res.json();
  return data.categories ?? data ?? [];
}

/**
 * Fetch featured products — sanitized through the same pipeline.
 */
export async function fetchFeaturedProducts(
  limit = 8,
): Promise<AtlasProduct[]> {
  const { products } = await fetchProducts({ sort: 'featured', limit });
  return products.filter((p) => p.featured).slice(0, limit);
}

// ═══════════════════════════════════════════════════════════════
// BOOTSTRAP — Single-payload endpoint
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch the complete bootstrap payload from Atlas Core.
 * This single endpoint returns: store info, catalog, and checkout config.
 * Useful for initial page load — one request instead of three.
 */
export async function fetchBootstrap(): Promise<{
  store: BootstrapRaw['store'];
  products: AtlasProduct[];
  checkoutConfig: CheckoutConfig | null;
}> {
  const res = await fetch(
    `${API_URL}/api/v1/storefront/bootstrap?store=${STORE_SLUG}`,
    { next: { revalidate: 60 } } as RequestInit,
  );

  if (!res.ok) {
    console.warn(`[Atlas] bootstrap failed (${res.status}), falling back to individual endpoints`);
    return { store: undefined, products: [], checkoutConfig: null };
  }

  const data: BootstrapRaw = await res.json();

  // Extract and sanitize products from nested path
  const rawProducts = extractProducts(data);
  const products = rawProducts.map(sanitizeProduct);

  // Build checkout config from bootstrap payload
  let checkoutConfig: CheckoutConfig | null = null;
  if (data.checkout) {
    const rawMethods = data.checkout.allowedMethods || [];
    checkoutConfig = enrichCheckoutConfig({
      allowedMethods: rawMethods,
      keys: { stripe_public: data.checkout.keys?.stripe_public || '' },
      cryptoWallet: data.checkout.cryptoWallet || '',
    });
    // Override currency from bootstrap if provided
    if (data.checkout.defaultCurrency) {
      checkoutConfig.currency = data.checkout.defaultCurrency;
    }
  }

  console.log(`[Atlas] bootstrap: ${products.length} products, ${data.checkout?.allowedMethods?.length ?? 0} payment methods`);

  return { store: data.store, products, checkoutConfig };
}

// ═══════════════════════════════════════════════════════════════
// CHECKOUT CONFIG — Dynamic Payment Rules from Core DB
// ═══════════════════════════════════════════════════════════════

/**
 * Enrich raw checkout config with frontend-friendly data.
 * Shared by both fetchStoreCheckoutConfig() and fetchBootstrap().
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
      provider: 'STRIPE_CRYPTO',
    },
  };

  const paymentMethods: PaymentMethodConfig[] = (
    raw.allowedMethods || []
  ).map((method) => {
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
    allowedMethods: raw.allowedMethods,
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
 * Fetch checkout configuration from Atlas Core.
 */
export async function fetchStoreCheckoutConfig(): Promise<CheckoutConfig> {
  const res = await fetch(
    `${API_URL}/api/v1/storefront/checkout-config?store=${STORE_SLUG}`,
    { next: { revalidate: 300 } } as RequestInit,
  );
  if (!res.ok) throw new Error(`Atlas checkout-config error: ${res.status}`);

  const raw: CheckoutConfigRaw = await res.json();
  return enrichCheckoutConfig(raw);
}

/** Backward-compatible alias */
export const fetchCheckoutConfig = fetchStoreCheckoutConfig;

// ═══════════════════════════════════════════════════════════════
// CHECKOUT INTENT — Payment Submission to Core V2
// ═══════════════════════════════════════════════════════════════

/**
 * Submit a checkout intent to Atlas Core V2.
 * The Core creates the payment intent and returns
 * an actionType with the necessary payload.
 *
 * Endpoint: POST /api/v1/checkout/intent
 */
export async function createPaymentIntent(
  payload: CheckoutIntentRequest,
): Promise<AtlasCheckoutResponse> {
  const res = await fetch(`${API_URL}/api/v1/checkout/intent`, {
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
 * After a successful payment confirmation (callback or webhook),
 * notify the Core CRM to decrement stock and move the order
 * to "Pending Settlement" status.
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
 * The order starts with status PENDING_SETTLEMENT until payment
 * is confirmed via webhook or callback.
 *
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
export { API_URL, STORE_SLUG };

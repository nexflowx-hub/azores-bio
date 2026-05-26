/**
 * ═══════════════════════════════════════════════════════════════
 * Atlas Adapter v2.0 — Universal Entry Point
 * AZORES.BIO Dumb Client / Relay Node
 * ═══════════════════════════════════════════════════════════════
 *
 * The frontend NEVER calls payment gateways or proxy directly.
 * All communication flows through Atlas Core V2, which decides
 * internal routing based on its DB payment_rules table.
 *
 * Configuration (only 2 env vars):
 *   NEXT_PUBLIC_ATLAS_API_URL  → https://api.atlasglobal.digital
 *   NEXT_PUBLIC_STORE_SLUG     → azores-bio
 */

import {
  AtlasProductRaw,
  AtlasProduct,
  AtlasCategory,
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

// ─── Normalization ──────────────────────────────────────────

/**
 * Convert raw Atlas product into a consistent, typed shape.
 * - priceEur: string | number → number  (safe for math in UI)
 * - images: string | string[] | JSONb → string[]  (safe for render)
 * - tags: string | string[] → string[]
 */
function normalizeProduct(raw: AtlasProductRaw): AtlasProduct {
  // priceEur: string | number → number
  const priceEur =
    typeof raw.priceEur === 'string'
      ? parseFloat(raw.priceEur)
      : raw.priceEur ?? 0;

  // compareAtPrice
  const compareAtPrice = raw.compareAtPrice
    ? typeof raw.compareAtPrice === 'string'
      ? parseFloat(raw.compareAtPrice)
      : raw.compareAtPrice
    : undefined;

  // images: string | string[] | JSONb → string[]
  let images: string[] = [];
  if (Array.isArray(raw.images)) {
    images = raw.images.filter(Boolean);
  } else if (typeof raw.images === 'string') {
    try {
      const parsed = JSON.parse(raw.images);
      images = Array.isArray(parsed) ? parsed.filter(Boolean) : [raw.images];
    } catch {
      images = raw.images ? [raw.images] : [];
    }
  }

  // Fallback: use imageUrl if images is empty
  if (images.length === 0 && raw.imageUrl) {
    images = [raw.imageUrl];
  }

  // tags: string | string[] → string[]
  let tags: string[] = [];
  if (Array.isArray(raw.tags)) {
    tags = raw.tags;
  } else if (typeof raw.tags === 'string') {
    try {
      const parsed = JSON.parse(raw.tags);
      tags = Array.isArray(parsed) ? parsed : [raw.tags];
    } catch {
      tags = raw.tags ? [raw.tags] : [];
    }
  }

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    priceEur,
    images,
    category: raw.category,
    description: raw.description,
    stock: raw.stock,
    weight: raw.weight,
    origin: raw.origin,
    featured: raw.featured,
    tags,
    sku: raw.sku,
    nameEn: raw.nameEn,
    nameFr: raw.nameFr,
    nameDe: raw.nameDe,
    descriptionEn: raw.descriptionEn,
    descriptionFr: raw.descriptionFr,
    descriptionDe: raw.descriptionDe,
    compareAtPrice,
    imageUrl: raw.imageUrl,
    active: raw.active,
  };
}

// ═══════════════════════════════════════════════════════════════
// CATALOG — Product & Category Reads
// ═══════════════════════════════════════════════════════════════

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

  const res = await fetch(
    `${API_URL}/api/v1/storefront/products?${sp.toString()}`,
    { next: { revalidate: 60 } } as RequestInit,
  );
  if (!res.ok) throw new Error(`Atlas products error: ${res.status}`);

  const data = await res.json();
  const raw: AtlasProductRaw[] = data.products ?? data ?? [];
  const products = raw.map(normalizeProduct);
  return { products, total: data.total ?? products.length };
}

export async function fetchProductById(
  id: string,
): Promise<AtlasProduct | null> {
  const res = await fetch(
    `${API_URL}/api/v1/storefront/products/${id}?store=${STORE_SLUG}`,
    { next: { revalidate: 60 } } as RequestInit,
  );
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Atlas product error: ${res.status}`);
  }

  const data = await res.json();
  return normalizeProduct(data.product ?? data);
}

export async function fetchCategories(): Promise<AtlasCategory[]> {
  const res = await fetch(
    `${API_URL}/api/v1/storefront/categories?store=${STORE_SLUG}`,
    { next: { revalidate: 120 } } as RequestInit,
  );
  if (!res.ok) throw new Error(`Atlas categories error: ${res.status}`);

  const data = await res.json();
  return data.categories ?? data ?? [];
}

export async function fetchFeaturedProducts(
  limit = 8,
): Promise<AtlasProduct[]> {
  const { products } = await fetchProducts({ sort: 'featured', limit });
  return products.filter((p) => p.featured).slice(0, limit);
}

// ═══════════════════════════════════════════════════════════════
// CHECKOUT CONFIG — Dynamic Payment Rules from Core DB
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch checkout configuration from Atlas Core.
 * This includes: payment methods, routes, shipping, discount rules,
 * crypto wallet, SEPA IBAN, and Stripe publishable keys.
 * The Core reads these from its payment_rules DB table.
 */
export async function fetchStoreCheckoutConfig(): Promise<CheckoutConfig> {
  const res = await fetch(
    `${API_URL}/api/v1/storefront/checkout-config?store=${STORE_SLUG}`,
    { next: { revalidate: 300 } } as RequestInit,
  );
  if (!res.ok) throw new Error(`Atlas checkout-config error: ${res.status}`);

  const raw: CheckoutConfigRaw = await res.json();

  // Enrich raw API response into frontend CheckoutConfig
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
    // Preserve raw fields
    allowedMethods: raw.allowedMethods,
    keys: raw.keys,
    cryptoWallet: raw.cryptoWallet,
    // Enriched fields
    paymentMethods,
    stripePublishableKey: raw.keys?.stripe_public,
    cryptoDiscountPct: 5, // Default crypto discount
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
 * The Core creates the order + payment intent and returns
 * an actionType with the necessary payload for the frontend
 * to render the appropriate payment flow.
 *
 * Endpoint: POST /api/v1/checkout/intent
 * The Core decides internal routing based on payment_rules DB table.
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

// ═══════════════════════════════════════════════════════════════
// AZORES.BIO — Type System v3.0 (Atlas Core V2 Dumb Client)
// Aligned with OpenAPI V3 — /storefront/bootstrap + /products
// ═══════════════════════════════════════════════════════════════

// ─── Payment Types ──────────────────────────────────────────
export type PaymentMethod = 'card' | 'mbway' | 'multibanco' | 'sepa' | 'crypto';

/**
 * ActionType returned by Atlas Core V2 on POST /checkout/intent.
 * The Core decides routing based on its DB payment_rules table.
 */
export type ActionType =
  | 'STRIPE_ELEMENTS'      // Core routed to STRIPE_PT_002 → card provider
  | 'SHOW_CRYPTO_WIDGET'   // Core routed to STRIPE_CRYPTO / ONRAMP_MONEY
  | 'REDIRECT_CRYPTO'      // Core routed to external crypto gateway
  | 'SHOW_MBWAY'           // Core routed to Proxy MBWAY
  | 'SHOW_MULTIBANCO'      // Core routed to Proxy Multibanco
  | 'SHOW_SEPA'            // Core routed to SEPA bank transfer
  | 'REDIRECT';            // Generic redirect

// ─── Atlas Product (raw from API — before sanitization) ────
/**
 * AtlasProductRaw — The raw shape as it arrives from the API.
 * Prisma (backend) serializes Decimal as Strings, images may be
 * a JSON-escaped string, and many fields are optional.
 * The adapter layer sanitizes all of this into AtlasProduct.
 */
export interface AtlasProductRaw {
  id: string;
  name: string;
  slug?: string;
  priceEur: number | string;        // Prisma Decimal → "29.99"
  images?: string | string[];       // May be JSON-escaped string
  category?: string;
  description?: string;
  stock?: number | string;          // Prisma may serialize as string
  weight?: number | string;
  origin?: string;
  featured?: boolean | string;
  tags?: string[] | string;
  sku?: string;
  nameEn?: string;
  nameFr?: string;
  nameDe?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  descriptionDe?: string;
  compareAtPrice?: number | string;  // Prisma Decimal → "39.99"
  imageUrl?: string;
  active?: boolean | string;
}

// ─── Normalized Product (after adapter sanitization) ───────
export interface AtlasProduct {
  id: string;             // UUID guaranteed by Atlas Core — used for routing
  name: string;
  slug?: string;
  priceEur: number;       // Always number after sanitization (Number())
  images: string[];       // Always string[] after sanitization — empty images filtered
  category?: string;      // Category slug
  description?: string;
  stock?: number;
  weight?: number;
  origin?: string;
  featured?: boolean;
  tags?: string[];
  sku?: string;
  nameEn?: string;
  nameFr?: string;
  nameDe?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  descriptionDe?: string;
  compareAtPrice?: number;
  imageUrl?: string;
  active?: boolean;
}

// ─── Atlas Category ─────────────────────────────────────────
export interface AtlasCategory {
  slug: string;
  name: string;
  namePt?: string;
  nameEn?: string;
  nameFr?: string;
  nameDe?: string;
  productCount?: number;
  image?: string;
  icon?: string;
}

// ═══════════════════════════════════════════════════════════════
// BOOTSTRAP — /storefront/bootstrap response
// ═══════════════════════════════════════════════════════════════

/**
 * BootstrapRaw — The raw shape from GET /storefront/bootstrap?store=azores-bio
 * Products are nested at data.catalog.products (NOT at root).
 */
export interface BootstrapRaw {
  store?: {
    id?: string;
    slug?: string;
    name?: string;
    tier?: string;
    status?: string;
  };
  catalog?: {
    stockManaged?: boolean;
    products?: AtlasProductRaw[];
  };
  checkout?: {
    allowedMethods?: string[];
    defaultCurrency?: string;
    cryptoWallet?: string | null;
    routing?: Record<string, unknown>;
    keys?: {
      stripe_public?: string | null;
    };
  };
}

// ═══════════════════════════════════════════════════════════════
// CHECKOUT CONFIG — Raw API Response vs Enriched Frontend Type
// ═══════════════════════════════════════════════════════════════

/**
 * CheckoutConfigRaw — Exact shape returned by
 * GET /storefront/checkout-config?store=azores-bio
 */
export interface CheckoutConfigRaw {
  allowedMethods: string[];
  keys: {
    stripe_public: string;
  };
  cryptoWallet: string;
}

/**
 * CheckoutConfig — Enriched version used by the frontend.
 */
export interface CheckoutConfig {
  allowedMethods?: string[];
  keys?: {
    stripe_public: string;
  };
  cryptoWallet?: string;
  paymentMethods: PaymentMethodConfig[];
  stripePublishableKey?: string;
  shipping?: ShippingConfig;
  freeShippingThreshold?: number;
  shippingCost?: number;
  cryptoDiscountPct?: number;
  iban?: string;
  beneficiary?: string;
  currency?: string;
  paymentRoutes?: PaymentRouteConfig[];
}

export interface PaymentMethodConfig {
  method: PaymentMethod;
  label: string;
  description?: string;
  badge?: string;
  icon?: string;
  requiresPhone?: boolean;
  requiresKYC?: boolean;
  provider?: string;
}

/** Dynamic payment route from Core DB */
export interface PaymentRouteConfig {
  method: PaymentMethod;
  provider: string;
  gateway?: string;
  wallet?: string;
}

export interface ShippingConfig {
  methods: ShippingMethodConfig[];
  defaultMethod?: string;
}

export interface ShippingMethodConfig {
  id: string;
  label: string;
  description?: string;
  cost: number;
  estimatedDays?: string;
  freeAbove?: number;
}

// ─── Checkout Intent Request (Core V2 Contract) ─────────────
export interface CheckoutIntentRequest {
  store: string;
  method: PaymentMethod;
  amount: number;
  currency?: string;
  customer: CheckoutCustomer;
  items: CheckoutItem[];
}

export interface CheckoutItem {
  productId: string;
  quantity: number;
  priceEur: number;
}

export interface CheckoutCustomer {
  email: string;
  fullName: string;
  nif?: string;
  birthDate?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

// ─── Checkout Intent Response (Core V2) ─────────────────────
export interface AtlasCheckoutResponse {
  transactionId: string;
  actionType: ActionType;
  payload: {
    clientSecret?: string;
    publishableKey?: string;
    orderId?: string;
    phone?: string;
    entity?: string;
    reference?: string;
    deadline?: string;
    amount?: number;
    iban?: string;
    beneficiary?: string;
    cryptoWallet?: string;
    url?: string;
  };
}

// ═══════════════════════════════════════════════════════════════
// ORDERS — POST /orders
// ═══════════════════════════════════════════════════════════════

export interface OrdersRequest {
  storeSlug: string;
  customer: CheckoutCustomer;
  items: CheckoutItem[];
}

export type OrderStatus =
  | 'PENDING_SETTLEMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface AtlasOrdersResponse {
  orderId: string;
  storeSlug: string;
  status: OrderStatus;
  customer: CheckoutCustomer;
  items: CheckoutItem[];
  totalEur: number;
  createdAt: string;
  updatedAt: string;
}

// ─── CRM Stock Settlement Request ───────────────────────────
export interface StockSettlementRequest {
  store: string;
  orderId: string;
  items: CheckoutItem[];
}

// ─── Cart Item (Frontend State) ─────────────────────────────
export interface CartItem {
  productId: string;       // UUID from Atlas — used for routing
  name: string;
  nameEn?: string | null;
  priceEur: number;        // Always EUR, always number
  quantity: number;
  image?: string | null;   // First image URL
  sku?: string | null;
  stock?: number;
}

// ═══════════════════════════════════════════════════════════════
// AZORES.BIO — Type System v2.0 (Atlas Core V2 Dumb Client)
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

// ─── Atlas Product (raw from API — before normalization) ────
export interface AtlasProductRaw {
  id: string;
  name: string;
  slug?: string;
  priceEur: number | string;
  images?: string | string[];
  category?: string;
  description?: string;
  stock?: number;
  weight?: number;
  origin?: string;
  featured?: boolean;
  tags?: string[] | string;
  sku?: string;
  nameEn?: string;
  nameFr?: string;
  nameDe?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  descriptionDe?: string;
  compareAtPrice?: number | string;
  imageUrl?: string;
  active?: boolean;
}

// ─── Normalized Product (after adapter) ─────────────────────
export interface AtlasProduct {
  id: string;             // UUID guaranteed by Atlas Core
  name: string;
  slug?: string;
  priceEur: number;       // Always number after normalization
  images: string[];       // Always string[] after normalization
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

// ─── Checkout Config (from Core DB payment_rules) ───────────
export interface CheckoutConfig {
  paymentMethods: PaymentMethodConfig[];
  stripePublishableKey?: string;
  shipping?: ShippingConfig;
  freeShippingThreshold?: number;
  shippingCost?: number;
  cryptoDiscountPct?: number;
  cryptoWallet?: string;     // Destination wallet from Core DB
  iban?: string;             // SEPA IBAN from Core DB
  beneficiary?: string;      // SEPA beneficiary from Core DB
  currency?: string;         // Default: "EUR"
  paymentRoutes?: PaymentRouteConfig[];  // Route rules from Core DB
}

export interface PaymentMethodConfig {
  method: PaymentMethod;
  label: string;
  description?: string;
  badge?: string;
  icon?: string;
  requiresPhone?: boolean;
  requiresKYC?: boolean;     // If true → NIF + birthDate mandatory
  provider?: string;         // e.g. "STRIPE_PT_002", "STRIPE_CRYPTO", "ONRAMP_MONEY"
}

/** Dynamic payment route from Core DB */
export interface PaymentRouteConfig {
  method: PaymentMethod;
  provider: string;          // e.g. "STRIPE_PT_002", "PROXY_MBWAY", "ONRAMP_MONEY"
  gateway?: string;          // e.g. "stripe", "proxy.nexflowx.tech"
  wallet?: string;           // crypto destination wallet (if applicable)
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
  store: string;                     // "azores-bio"
  method: PaymentMethod;             // "card" | "multibanco" | "mbway" | "crypto"
  amount: number;                    // Final amount in EUR (after discounts)
  currency: string;                  // "EUR"
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
  nif?: string;            // NIF / SSN — mandatory for crypto (KYC/AML)
  birthDate?: string;       // YYYY-MM-DD — mandatory for crypto (KYC/AML ≥18)
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
    clientSecret?: string;       // For STRIPE_ELEMENTS / SHOW_CRYPTO_WIDGET
    publishableKey?: string;     // Stripe public key for the specific route
    orderId?: string;
    phone?: string;              // MBWAY phone
    entity?: string;             // Multibanco entity
    reference?: string;          // Multibanco reference
    deadline?: string;           // Multibanco payment deadline
    amount?: number;
    iban?: string;               // SEPA IBAN
    beneficiary?: string;        // SEPA beneficiary
    cryptoWallet?: string;       // Destination wallet for crypto
    url?: string;                // Redirect URL
  };
}

// ─── CRM Stock Settlement Request ───────────────────────────
export interface StockSettlementRequest {
  store: string;
  orderId: string;
  items: CheckoutItem[];
}

// ─── Cart Item (Frontend State) ─────────────────────────────
export interface CartItem {
  productId: string;       // UUID from Atlas
  name: string;
  nameEn?: string | null;
  priceEur: number;        // Always EUR, always number
  quantity: number;
  image?: string | null;   // First image URL
  sku?: string | null;
  stock?: number;
}

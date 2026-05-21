// ─── Payment Types ──────────────────────────────────────────
export type PaymentMethod = 'card' | 'mbway' | 'multibanco' | 'sepa' | 'crypto';

export type ActionType =
  | 'STRIPE_ELEMENTS'
  | 'SHOW_CRYPTO_WIDGET'
  | 'REDIRECT_CRYPTO'
  | 'SHOW_MBWAY'
  | 'SHOW_MULTIBANCO'
  | 'SHOW_SEPA'
  | 'REDIRECT';

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
  id: string;             // UUID
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

// ─── Checkout Config (from Atlas) ───────────────────────────
export interface CheckoutConfig {
  paymentMethods: PaymentMethodConfig[];
  stripePublishableKey?: string;
  shipping?: ShippingConfig;
  freeShippingThreshold?: number;
}

export interface PaymentMethodConfig {
  method: PaymentMethod;
  label: string;
  description?: string;
  badge?: string;
  icon?: string;
  requiresPhone?: boolean;
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

// ─── Checkout Intent Request ────────────────────────────────
export interface CheckoutIntentRequest {
  storeSlug: string;
  items: CheckoutItem[];
  customer: CheckoutCustomer;
  shipping: CheckoutShipping;
  payment: {
    provider: string;
    phone?: string;
  };
  totalAmount: number;
}

export interface CheckoutItem {
  productId: string;
  quantity: number;
  priceEur: number;
}

export interface CheckoutCustomer {
  name: string;
  email: string;
  phone?: string;
  vat?: string;
  dob?: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CheckoutShipping {
  method: string;
  cost: number;
}

// ─── Checkout Intent Response ───────────────────────────────
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
    amount?: number;
    iban?: string;
    beneficiary?: string;
    url?: string;
  };
}

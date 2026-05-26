# Task 3 — Types Refactor Agent

## Task
Refactor `/home/z/my-project/src/lib/types.ts` to match OpenAPI V2 spec exactly.

## Summary of Changes

### New Types Added
1. **`CheckoutConfigRaw`** — Exact API response shape from `GET /storefront/checkout-config`:
   - `allowedMethods: string[]`
   - `keys: { stripe_public: string }`
   - `cryptoWallet: string`

2. **`OrdersRequest`** — POST /orders request body:
   - `storeSlug`, `customer`, `items`

3. **`AtlasOrdersResponse`** — POST /orders 201 response:
   - `orderId`, `storeSlug`, `status`, `customer`, `items`, `totalEur`, `createdAt`, `updatedAt`

4. **`OrderStatus`** — Union type for order lifecycle states

### Updated Types
1. **`CheckoutConfig`** — Added optional raw-API fields (`allowedMethods`, `keys`, `cryptoWallet`) while preserving all existing enriched fields

2. **`CheckoutIntentRequest`** — `currency` changed from required to optional

3. **`CheckoutCustomer.nif`** — JSDoc updated to `**mandatory for crypto (KYC/AML)**`

### Backward Compatibility
- All existing types preserved (AtlasProduct, AtlasProductRaw, AtlasCategory, CartItem, etc.)
- All existing consumer imports verified: ProductCard, StoreContext, checkout page, atlas.ts, etc.
- Zero breaking changes — lint passes cleanly

# Task 4 — Atlas API Refactor

## Summary
Refactored `/home/z/my-project/src/lib/atlas.ts` to match OpenAPI V2 spec.

## Changes Made

### 1. Updated Imports
Added `CheckoutConfigRaw`, `PaymentMethodConfig`, `PaymentMethod`, `OrdersRequest`, `AtlasOrdersResponse` to the import block from `./types`.

### 2. Refactored `fetchStoreCheckoutConfig()`
- Previously: returned raw API JSON directly as `CheckoutConfig`
- Now: parses as `CheckoutConfigRaw`, then enriches into `CheckoutConfig`
- Enrichment logic:
  - `methodLabels` lookup maps method names → {label, description, requiresPhone, requiresKYC, provider}
  - Builds `paymentMethods[]` array from `allowedMethods`
  - Maps `keys.stripe_public` → `stripePublishableKey`
  - Preserves raw fields on the enriched object
  - Adds defaults: `cryptoDiscountPct=5`, `freeShippingThreshold=75`, `shippingCost=6.5`, `currency='EUR'`

### 3. Added `createOrder()` Function
- Endpoint: `POST /api/v1/orders`
- Headers: `Content-Type: application/json`, `x-store-slug`
- Payload: `OrdersRequest` (storeSlug, customer, items)
- Response: `AtlasOrdersResponse` (orderId, status, customer, items, totalEur, timestamps)
- Error handling: parses JSON error body, falls back to status code

### 4. Preserved Existing Functions
- `fetchProducts`, `fetchProductById`, `fetchCategories`, `fetchFeaturedProducts` — unchanged
- `createPaymentIntent` — unchanged
- `settleStock` — unchanged (calls `/crm/order/settle`)
- Backward-compatible aliases: `fetchCheckoutConfig`, `processCheckout`

## Verification
- `bun run lint` passes with zero errors
- No breaking changes to existing consumers

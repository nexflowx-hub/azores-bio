# Task 2 - Backend API Agent Work Log

## Summary
Created all 8 backend API routes for the AZORES.BIO e-commerce store using Next.js App Router route handlers with Prisma ORM and SQLite.

## API Routes Created

### 1. Products API — `src/app/api/products/route.ts`
- **GET**: List products with filtering and pagination
  - Query params: `categorySlug`, `search`, `sort` (featured|price_asc|price_desc|name), `limit` (default 12), `offset` (default 0)
  - Includes category relation info
  - Returns `{ products, total, limit, offset }`

### 2. Product Detail API — `src/app/api/products/[id]/route.ts`
- **GET**: Get single product by ID with full category info
  - Returns 404 for inactive or non-existent products
  - Returns 400 for invalid product IDs

### 3. Featured Products API — `src/app/api/products/featured/route.ts`
- **GET**: Get up to 8 featured products with category info
  - Filters by `active: true` and `featured: true`

### 4. Categories API — `src/app/api/categories/route.ts`
- **GET**: List all categories with product count
  - Ordered by `sortOrder`
  - Only counts active products
  - Returns `{ categories }` with `productCount` field

### 5. Orders API — `src/app/api/orders/route.ts`
- **POST**: Create a new order with items and auto-generated invoice
  - Validates required fields and email format
  - Checks stock availability for all items
  - Calculates subtotal from product prices
  - Shipping: free above €75, otherwise €9.99
  - Generates order number: `AZB-{timestamp}-{random4}`
  - Generates invoice number: `FAT-{year}-{orderId padded 6 digits}`
  - Uses Prisma transaction for atomicity (order + invoice + stock decrement)
  - Returns 201 with complete order including items and invoice

### 6. Order Detail API — `src/app/api/orders/[orderNumber]/route.ts`
- **GET**: Get order by orderNumber with items and invoice
  - Returns 404 if order not found

### 7. Chat API — `src/app/api/chat/route.ts`
- **POST**: Send message to Maria da Terra AI assistant
  - Body: `{ sessionId, message, locale? }`
  - Loads/creates ChatSession from database
  - Uses `z-ai-web-dev-sdk` (ZAI.create() → client.chat.completions.create())
  - Maria da Terra system prompt (Azorean AI assistant for AZORES.BIO)
  - Keeps last 20 messages for context
  - Saves chat history back to ChatSession
  - Returns `{ message, sessionId }`

### 8. Stripe Payment Intent API — `src/app/api/stripe/payment-intent/route.ts`
- **POST**: Create a Stripe payment intent
  - Body: `{ amount, currency?, customerEmail?, customerName?, metadata? }`
  - Converts amount to cents for Stripe
  - Enables automatic payment methods
  - Handles Stripe-specific errors
  - Returns `{ clientSecret, paymentIntentId }`

## Technical Decisions
- Used `ZAI.create()` async factory pattern for z-ai-web-dev-sdk (the named export `chatCompletion` doesn't exist in the SDK)
- All API routes use proper error handling with try/catch and appropriate HTTP status codes
- Orders API uses Prisma `$transaction` for atomicity across order creation, invoice creation, and stock updates
- Chat API truncates history to last 20 messages to manage context window
- Stripe API validates amount and gracefully handles missing STRIPE_SECRET_KEY

## Lint & Testing
- ESLint passes with no errors
- All endpoints tested via curl and return expected responses
- Dev server shows no compilation errors

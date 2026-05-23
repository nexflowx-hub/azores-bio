# AZORES.BIO — Dossiê Técnico v2.0

> **Dumb Client / Relay Node** — E-commerce premium para produtos artesanais dos Açores  
> **Entidade:** Azores Meet, Lda | NIF: 513553169  
> **Sede:** Macela, 9875-030 Santo Antão, Calheta (São Jorge), Açores, Portugal  
> **Domínio:** [azores.bio](https://azores.bio)  
> **Core API:** [api.atlasglobal.digital](https://api.atlasglobal.digital)

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitetura do Sistema — Dumb Client / Relay Node](#3-arquitetura-do-sistema--dumb-client--relay-node)
4. [Estrutura do Projeto](#4-estrutura-do-projeto)
5. [Contrato de API — Atlas Core V2](#5-contrato-de-api--atlas-core-v2)
6. [Normalização de Dados](#6-normalização-de-dados)
7. [Sistema de Pagamentos](#7-sistema-de-pagamentos)
8. [Compliance KYC/AML (Crypto)](#8-compliance-kycaml-crypto)
9. [Rotas e Navegação](#9-rotas-e-navegação)
10. [i18n e Moeda](#10-i18n-e-moeda)
11. [Chatbot Maria da Terra](#11-chatbot-maria-da-terra)
12. [Variáveis de Ambiente](#12-variáveis-de-ambiente)
13. [Comandos](#13-comandos)
14. [Deploy no Vercel](#14-deploy-no-vercel)
15. [Roadmap](#15-roadmap)

---

## 1. Visão Geral

A **AZORES.BIO** é uma loja online de produtos premium provenientes das 9 ilhas dos Açores. O projeto opera como um **Dumb Client / Relay Node**: o frontend é puramente de apresentação e delega **toda a lógica de negócio** ao **Atlas Core V2** (`https://api.atlasglobal.digital`).

### Modelo de Negócio

- **Catálogo** com 11 categorias: queijos, vinhos, conservas, chás, compotas & mel, licores, pastelaria, pimentas, manteigas, bebidas, charcutaria e outros
- **Checkout multi-método**: Cartão (Stripe Elements), Crypto (Stripe Onramp), MBWAY, Multibanco e SEPA
- **Desconto crypto dinâmico**: 5% (valor proveniente da configuração do Core, não hardcoded)
- **Envio gratuito** a partir de €75 (threshold dinâmico do Core)
- **Internacionalização**: 4 locales (pt, en, fr, de) e 3 moedas (EUR, USD, GBP)

### Entidade Legal

| Campo | Valor |
|-------|-------|
| Razão Social | Azores Meet, Lda |
| NIF | 513553169 |
| Sede | Macela, 9875-030 Santo Antão, Calheta (São Jorge), Açores, Portugal |
| E-mail | info@azores.bio |

---

## 2. Stack Tecnológico

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 16.x |
| Linguagem | TypeScript | 5.x |
| UI Framework | React | 19.x |
| Estilização | Tailwind CSS | 4.x |
| Componentes UI | shadcn/ui (New York) | — |
| State Management | Zustand | 5.x |
| Ícones | Lucide React | 0.525+ |
| Server State | TanStack React Query | 5.x |
| Pagamentos (Card) | Stripe Elements (`@stripe/react-stripe-js` + `@stripe/stripe-js`) | 6.x / 9.x |
| Pagamentos (Crypto) | Stripe Crypto Onramp (`@stripe/crypto`) | 1.x |
| IA / Chat | z-ai-web-dev-sdk | 0.0.18 |
| Animações | Framer Motion | 12.x |
| Notificações | Sonner | 2.x |
| ID Generation | nanoid | 5.x |
| Formulários | react-hook-form + zod | 7.x / 4.x |
| Imagens | Sharp | 0.34+ |
| Package Manager | Bun | — |
| Deploy Target | Vercel | — |

### Princípio Fundamental

> O frontend **nunca** acede diretamente a gateways de pagamento, bases de dados ou serviços com secrets. Toda a comunicação flui pelo Atlas Core V2, que decide o encaminhamento interno com base na sua tabela `payment_rules`.

---

## 3. Arquitetura do Sistema — Dumb Client / Relay Node

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER (Client)                         │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────┐   │
│  │ Homepage │  │Store Page│  │  Product   │  │   Checkout   │   │
│  │          │  │          │  │  [UUID]    │  │  5 métodos   │   │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └──────┬───────┘   │
│       │              │              │                │            │
│  ┌────┴──────────────┴──────────────┴────────────────┴────────┐ │
│  │              StoreContext (React Context)                    │ │
│  │  • locale (pt|en|fr|de)   • currency (EUR|USD|GBP)         │ │
│  │  • cart (localStorage)     • t() translations               │ │
│  │  • formatPrice()          • getProductName()               │ │
│  └────────────────────────────┬────────────────────────────────┘ │
│                               │                                  │
│  ┌────────────────────────────┴────────────────────────────────┐ │
│  │             MariaChat (z-ai-web-dev-sdk)                     │ │
│  │             Sessões in-memory — zero persistência local      │ │
│  └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬──────────────────────────────────┘
                                │ fetch() via Atlas Adapter
┌───────────────────────────────┴──────────────────────────────────┐
│                   ATLAS CORE V2 (api.atlasglobal.digital)         │
│                                                                   │
│  O Core detém e gere:                                             │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │   Produtos      │  │   Categorias     │  │  Checkout      │  │
│  │   (catálogo)    │  │   (árvore)       │  │  Config        │  │
│  └─────────────────┘  └──────────────────┘  └────────────────┘  │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │ payment_rules   │  │  Stock           │  │  Orders / CRM  │  │
│  │ (routing DB)    │  │  (decremento)    │  │  (settlement)  │  │
│  └─────────────────┘  └──────────────────┘  └────────────────┘  │
│                                                                   │
│  O Core encaminha para:                                          │
│  ┌────────────┐ ┌────────────┐ ┌───────────┐ ┌───────────────┐  │
│  │STRIPE_PT   │ │STRIPE_CRYPTO│ │PROXY_MBWAY│ │PROXY_MULTIBAN │  │
│  │  _002      │ │/ONRAMP     │ │           │ │  /PROXY_SEPA  │  │
│  └─────┬──────┘ └─────┬──────┘ └─────┬─────┘ └──────┬────────┘  │
└────────┼──────────────┼──────────────┼───────────────┼───────────┘
         │              │              │               │
    ┌────┴────┐   ┌─────┴─────┐  ┌────┴─────┐  ┌─────┴──────┐
    │ Stripe  │   │ Stripe    │  │ Proxy    │  │ Proxy      │
    │ Elements│   │ Onramp    │  │ MBWAY    │  │ Multibanco │
    │ (card)  │   │ (crypto)  │  │ (push)   │  │ /SEPA      │
    └─────────┘   └───────────┘  └──────────┘  └────────────┘
```

### O que o frontend **NÃO** tem

| Ausência | Razão |
|----------|-------|
| Base de dados local | Toda a persistência é no Core |
| Secrets hardcoded | Zero chaves Stripe, zero IBANs, zero wallets no código |
| Lógica de preço server-side | Preços vêm do Core; o frontend apenas apresenta |
| Gestão de stock | O Core faz decremento via `POST /crm/order/settle` |
| Routing de pagamentos | O Core decide o gateway com base na tabela `payment_rules` |

### O que o frontend **TEM**

| Responsabilidade | Detalhe |
|------------------|---------|
| Apresentação de catálogo | Renderização de produtos, categorias, filtros |
| Formulário de checkout | Recolha de dados do cliente e renderização de widgets de pagamento |
| Estado do carrinho | `localStorage` via `StoreContext` (Zustand disponível) |
| i18n / moeda | 4 locales, 3 moedas, tradução inline |
| Chatbot | Maria da Terra via `z-ai-web-dev-sdk` (sessões in-memory) |
| Normalização de dados | Adapter que transforma dados raw do Core em tipos consistentes |

---

## 4. Estrutura do Projeto

```
azores-bio/
├── public/
│   ├── logo.svg                  # Favicon / logo SVG
│   └── robots.txt                # Directivas para crawlers
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout: Providers + Navbar + Footer + CartDrawer + MariaChat + Toaster
│   │   ├── page.tsx              # Homepage: hero, destaque, categorias, story, CTA
│   │   ├── not-found.tsx         # Página 404 personalizada
│   │   ├── globals.css           # Estilos globais + Tailwind 4 + custom tokens
│   │   ├── store/
│   │   │   └── page.tsx          # Listagem de produtos com filtros, pesquisa e ordenação
│   │   ├── product/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Detalhe do produto (UUID) + produtos relacionados
│   │   ├── checkout/
│   │   │   ├── page.tsx          # Checkout: dados pessoais, endereço, pagamento, Stripe/Crypto widgets
│   │   │   └── success/
│   │   │       └── page.tsx      # Confirmação pós-pagamento (detalhes MBWAY/Multibanco/SEPA)
│   │   ├── about/
│   │   │   └── page.tsx          # Página institucional (missão, valores, entidade legal)
│   │   └── api/
│   │       ├── route.ts          # Health check: GET → { message: "Hello, world!" }
│   │       └── chat/
│   │           └── route.ts      # POST /api/chat — Chatbot Maria da Terra (z-ai-web-dev-sdk)
│   ├── components/
│   │   ├── Navbar.tsx            # Navegação fixa com locale/currency selectors e carrinho
│   │   ├── Footer.tsx            # Rodapé 4 colunas: marca, loja, informações, contacto
│   │   ├── ProductCard.tsx       # Card de produto com badges, hover add-to-cart, preço
│   │   ├── CartDrawer.tsx        # Drawer lateral do carrinho com quantidades e totais
│   │   ├── MariaChat.tsx         # Chatbot IA flutuante com perguntas sugeridas por locale
│   │   ├── StripePaymentForm.tsx # Stripe Elements: <Elements> + <PaymentElement> + confirmPayment
│   │   ├── CryptoOnrampForm.tsx  # Stripe Crypto Onramp: loadStripeOnramp + session.mount()
│   │   ├── Providers.tsx         # QueryClientProvider (TanStack Query) + StoreProvider
│   │   └── ui/                   # 47 componentes shadcn/ui (accordion, alert, avatar, ...)
│   ├── contexts/
│   │   └── StoreContext.tsx      # Context global: i18n, cart, currency, translations, helpers
│   ├── hooks/
│   │   ├── use-toast.ts          # Toast hook (shadcn)
│   │   └── use-mobile.ts         # Mobile detection hook
│   └── lib/
│       ├── atlas.ts              # Atlas Adapter v2.0 — funções de API + normalização
│       ├── types.ts              # Type system: PaymentMethod, ActionType, CheckoutConfig, etc.
│       └── utils.ts              # cn() utility (clsx + tailwind-merge)
├── next.config.ts                # Next.js config (remotePatterns para Unsplash)
├── tailwind.config.ts            # Tailwind + shadcn tokens
├── postcss.config.mjs            # PostCSS para Tailwind 4
├── components.json               # Configuração shadcn/ui (New York style)
├── eslint.config.mjs             # ESLint flat config
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependências e scripts
└── README.md                     # Este ficheiro
```

---

## 5. Contrato de API — Atlas Core V2

Todas as chamadas são feitas pelo **Atlas Adapter** (`src/lib/atlas.ts`) e passam o parâmetro `store=azores-bio` para identificar o tenant.

### 5.1 `GET /api/v1/storefront/products`

Lista produtos com filtros, ordenação e paginação.

**URL:** `{API_URL}/api/v1/storefront/products?store=azores-bio`

**Parâmetros de Query:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `store` | string | ✅ | Slug da loja (`azores-bio`) |
| `category` | string | — | Slug da categoria para filtrar |
| `search` | string | — | Pesquisa em nome, descrição, origem |
| `sort` | string | — | `featured`, `price_asc`, `price_desc`, `name` |
| `limit` | number | — | Produtos por página (default: 12) |
| `offset` | number | — | Offset para paginação (default: 0) |

**Resposta:**

```json
{
  "products": [
    {
      "id": "uuid-xxx",
      "name": "Queijo São Jorge DOP Curado 7 Meses",
      "nameEn": "São Jorge DOP Aged Cheese 7 Months",
      "nameFr": "Fromage São Jorge DOP Affiné 7 Mois",
      "nameDe": "São Jorge DOP Käse 7 Monate Gereift",
      "description": "...",
      "descriptionEn": "...",
      "priceEur": "18.50",
      "compareAtPrice": "22.00",
      "images": "[\"https://cdn.example.com/img1.jpg\"]",
      "category": "queijos",
      "stock": 45,
      "weight": 0.5,
      "origin": "São Jorge, Açores",
      "featured": true,
      "tags": "[\"dop\",\"curado\"]",
      "sku": "QJ-DOP-7M",
      "active": true
    }
  ],
  "total": 250
}
```

**Implementação no Adapter:**

```typescript
export async function fetchProducts(params?: {
  category?: string; search?: string; sort?: string;
  limit?: number; offset?: number;
}): Promise<{ products: AtlasProduct[]; total: number }> {
  const sp = new URLSearchParams({ store: STORE_SLUG });
  if (params?.category) sp.set('category', params.category);
  if (params?.search)   sp.set('search', params.search);
  if (params?.sort)     sp.set('sort', params.sort);
  if (params?.limit)    sp.set('limit', String(params.limit));
  if (params?.offset)   sp.set('offset', String(params.offset));

  const res = await fetch(`${API_URL}/api/v1/storefront/products?${sp.toString()}`,
    { next: { revalidate: 60 } } as RequestInit,
  );
  // ...
}
```

> **Nota:** O parâmetro `next: { revalidate: 60 }` ativa o ISR do Next.js com revalidação a cada 60 segundos.

---

### 5.2 `GET /api/v1/storefront/products/${id}`

Retorna um produto específico pelo UUID.

**URL:** `{API_URL}/api/v1/storefront/products/{uuid}?store=azores-bio`

**Resposta:** Mesmo formato de um item do array `products` (ver 5.1).

**Implementação:**

```typescript
export async function fetchProductById(id: string): Promise<AtlasProduct | null> {
  const res = await fetch(
    `${API_URL}/api/v1/storefront/products/${id}?store=${STORE_SLUG}`,
    { next: { revalidate: 60 } } as RequestInit,
  );
  if (res.status === 404) return null;
  // ...
}
```

---

### 5.3 `GET /api/v1/storefront/categories`

Lista todas as categorias com contagem de produtos.

**URL:** `{API_URL}/api/v1/storefront/categories?store=azores-bio`

**Resposta:**

```json
{
  "categories": [
    {
      "slug": "queijos",
      "name": "Queijos",
      "namePt": "Queijos",
      "nameEn": "Cheeses",
      "nameFr": "Fromages",
      "nameDe": "Käse",
      "productCount": 21,
      "image": "https://cdn.example.com/cheese.jpg",
      "icon": "🧀"
    }
  ]
}
```

> **ISR:** `revalidate: 120` (2 minutos) — categorias mudam com menos frequência.

---

### 5.4 `GET /api/v1/storefront/checkout-config`

Retorna a configuração completa de checkout para a loja. O Core lê esta configuração da sua tabela `payment_rules`.

**URL:** `{API_URL}/api/v1/storefront/checkout-config?store=azores-bio`

**Resposta:**

```json
{
  "paymentMethods": [
    {
      "method": "card",
      "label": "Cartão de Crédito/Débito",
      "description": "Visa, Mastercard, etc.",
      "provider": "STRIPE_PT_002"
    },
    {
      "method": "mbway",
      "label": "MBWAY",
      "description": "Confirme na App",
      "requiresPhone": true,
      "provider": "PROXY_MBWAY"
    },
    {
      "method": "multibanco",
      "label": "Multibanco",
      "description": "Referência de pagamento",
      "provider": "PROXY_MULTIBANCO"
    },
    {
      "method": "sepa",
      "label": "Transferência SEPA",
      "description": "Transferência bancária",
      "provider": "PROXY_SEPA"
    },
    {
      "method": "crypto",
      "label": "Pagamento Web3",
      "description": "-5% Desconto",
      "requiresKYC": true,
      "provider": "STRIPE_CRYPTO"
    }
  ],
  "stripePublishableKey": "pk_live_...",
  "shipping": {
    "methods": [
      {
        "id": "standard",
        "label": "Envio Padrão",
        "cost": 6.5,
        "estimatedDays": "3-7",
        "freeAbove": 75
      }
    ],
    "defaultMethod": "standard"
  },
  "freeShippingThreshold": 75,
  "shippingCost": 6.5,
  "cryptoDiscountPct": 5,
  "cryptoWallet": "0x...",
  "iban": "PT50...",
  "beneficiary": "Azores Meet, Lda",
  "currency": "EUR",
  "paymentRoutes": [
    { "method": "card",        "provider": "STRIPE_PT_002",    "gateway": "stripe" },
    { "method": "crypto",      "provider": "STRIPE_CRYPTO",    "gateway": "stripe" },
    { "method": "mbway",       "provider": "PROXY_MBWAY",      "gateway": "proxy.nexflowx.tech" },
    { "method": "multibanco",  "provider": "PROXY_MULTIBANCO", "gateway": "proxy.nexflowx.tech" },
    { "method": "sepa",        "provider": "PROXY_SEPA",       "gateway": "proxy.nexflowx.tech" }
  ]
}
```

> **ISR:** `revalidate: 300` (5 minutos) — a configuração raramente muda, mas pode ser atualizada no Core sem redeploy.

---

### 5.5 `POST /api/v1/checkout/intent`

Submete uma intenção de checkout. O Core cria a encomenda + payment intent e retorna um `actionType` com o payload necessário para o frontend renderizar o fluxo de pagamento adequado.

**URL:** `{API_URL}/api/v1/checkout/intent`

**Headers:**

```
Content-Type: application/json
x-store-slug: azores-bio
```

**Request Body:**

```typescript
interface CheckoutIntentRequest {
  store: string;                     // "azores-bio"
  method: PaymentMethod;             // "card" | "mbway" | "multibanco" | "sepa" | "crypto"
  amount: number;                    // Valor final em EUR (após descontos)
  currency: string;                  // "EUR"
  customer: CheckoutCustomer;
  items: CheckoutItem[];
}

interface CheckoutCustomer {
  email: string;
  fullName: string;
  nif?: string;            // NIF/SSN — obrigatório para crypto (KYC/AML)
  birthDate?: string;      // YYYY-MM-DD — obrigatório para crypto (KYC/AML ≥18)
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

interface CheckoutItem {
  productId: string;       // UUID do Atlas Core
  quantity: number;
  priceEur: number;        // Preço unitário em EUR (sempre number após normalização)
}
```

**Exemplo de Request:**

```json
{
  "store": "azores-bio",
  "method": "card",
  "amount": 47.99,
  "currency": "EUR",
  "customer": {
    "email": "joao@example.com",
    "fullName": "João Silva",
    "phone": "+351912345678",
    "address": "Rua Principal, 123",
    "city": "Lisboa",
    "postalCode": "1000-001",
    "country": "Portugal"
  },
  "items": [
    { "productId": "uuid-xxx", "quantity": 2, "priceEur": 18.50 },
    { "productId": "uuid-yyy", "quantity": 1, "priceEur": 10.99 }
  ]
}
```

**Resposta:**

```typescript
interface AtlasCheckoutResponse {
  transactionId: string;
  actionType: ActionType;
  payload: {
    clientSecret?: string;       // STRIPE_ELEMENTS / SHOW_CRYPTO_WIDGET
    publishableKey?: string;     // Stripe public key para a route específica
    orderId?: string;
    phone?: string;              // SHOW_MBWAY
    entity?: string;             // SHOW_MULTIBANCO
    reference?: string;          // SHOW_MULTIBANCO
    deadline?: string;           // SHOW_MULTIBANCO
    amount?: number;
    iban?: string;               // SHOW_SEPA
    beneficiary?: string;        // SHOW_SEPA
    cryptoWallet?: string;       // Destination wallet
    url?: string;                // REDIRECT / REDIRECT_CRYPTO
  };
}
```

**Action Types e Routing:**

| `actionType` | Método Original | Provider (Core) | Ação do Frontend |
|---------------|----------------|-----------------|------------------|
| `STRIPE_ELEMENTS` | card | `STRIPE_PT_002` | Montar `<Elements>` com `clientSecret` |
| `SHOW_CRYPTO_WIDGET` | crypto | `STRIPE_CRYPTO` / `ONRAMP_MONEY` | Montar Stripe Onramp com `clientSecret` |
| `REDIRECT_CRYPTO` | crypto | Gateway externo | `window.location.href = payload.url` |
| `SHOW_MBWAY` | mbway | `PROXY_MBWAY` | Redirecionar para success com push approval |
| `SHOW_MULTIBANCO` | multibanco | `PROXY_MULTIBANCO` | Redirecionar para success com entidade + referência |
| `SHOW_SEPA` | sepa | `PROXY_SEPA` | Redirecionar para success com IBAN + beneficiário |
| `REDIRECT` | qualquer | Gateway genérico | `window.location.href = payload.url` |

---

### 5.6 `POST /api/v1/crm/order/settle`

Notifica o Core CRM para decrementar stock e mover a encomenda para o estado de "Pending Settlement" após confirmação de pagamento.

**URL:** `{API_URL}/api/v1/crm/order/settle`

**Headers:**

```
Content-Type: application/json
x-store-slug: azores-bio
```

**Request Body:**

```typescript
interface StockSettlementRequest {
  store: string;           // "azores-bio"
  orderId: string;         // ID da encomenda (transactionId ou orderId)
  items: CheckoutItem[];   // Mesmo formato do checkout intent
}
```

**Resposta:**

```json
{
  "success": true,
  "orderId": "uuid-order-xxx",
  "status": "pending_settlement"
}
```

> **Nota:** Esta chamada é **non-blocking**. Se falhar, o Core reconcilia via webhook. O frontend não bloqueia o fluxo de sucesso do utilizador.

---

## 6. Normalização de Dados

O Atlas Adapter (`src/lib/atlas.ts`) aplica normalização aos dados raw do Core antes de os expor ao frontend. Isto garante que os componentes recebem tipos consistentes, independentemente do formato devolvido pela API.

### Transformações

| Campo | Formato Raw (API) | Formato Normalizado | Lógica |
|-------|-------------------|---------------------|--------|
| `priceEur` | `string` ou `number` | `number` | `parseFloat()` se string; `0` se nulo |
| `compareAtPrice` | `string` ou `number` | `number` ou `undefined` | `parseFloat()` se string; omitido se nulo |
| `images` | `string` (JSONb), `string[]`, ou string URL | `string[]` | `JSON.parse()` se string; `.filter(Boolean)` |
| `tags` | `string` (JSONb) ou `string[]` | `string[]` | `JSON.parse()` se string; `.filter(Boolean)` |
| `imageUrl` | `string` ou nulo | Fallback para `images[0]` | Usado apenas se `images` ficar vazio |

### Código de Normalização

```typescript
function normalizeProduct(raw: AtlasProductRaw): AtlasProduct {
  // priceEur: string | number → number
  const priceEur = typeof raw.priceEur === 'string'
    ? parseFloat(raw.priceEur) : raw.priceEur ?? 0;

  // compareAtPrice
  const compareAtPrice = raw.compareAtPrice
    ? typeof raw.compareAtPrice === 'string'
      ? parseFloat(raw.compareAtPrice) : raw.compareAtPrice
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
  if (images.length === 0 && raw.imageUrl) {
    images = [raw.imageUrl];  // Fallback
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

  return { ...raw, priceEur, compareAtPrice, images, tags };
}
```

### Tipos Resultantes

```typescript
// Antes da normalização (raw da API)
interface AtlasProductRaw {
  priceEur: number | string;
  images?: string | string[];
  tags?: string[] | string;
  // ...
}

// Após normalização (usado pelo frontend)
interface AtlasProduct {
  priceEur: number;        // Sempre number
  images: string[];        // Sempre string[]
  tags?: string[];         // Sempre string[] (opcional)
  compareAtPrice?: number; // Sempre number (opcional)
  // ...
}
```

---

## 7. Sistema de Pagamentos

### Visão Geral

O sistema de pagamentos é **inteiramente dinâmico** e controlado pelo Atlas Core V2. O frontend não tem conhecimento prévio dos gateways, chaves ou configurações — tudo é obtido em runtime via `GET /checkout-config`.

### 5 Métodos de Pagamento

| Método | Provider (Core) | Widget Frontend | Fluxo |
|--------|----------------|-----------------|-------|
| **Card** | `STRIPE_PT_002` | `StripePaymentForm` (Stripe Elements) | Core retorna `STRIPE_ELEMENTS` → `clientSecret` + `publishableKey` → `<Elements>` + `<PaymentElement>` → `confirmPayment()` |
| **Crypto** | `STRIPE_CRYPTO` / `ONRAMP_MONEY` | `CryptoOnrampForm` (Stripe Onramp) | Core retorna `SHOW_CRYPTO_WIDGET` → `clientSecret` + `publishableKey` → `loadStripeOnramp()` → `createSession()` → `session.mount('#onramp-container')` |
| **MBWAY** | `PROXY_MBWAY` | Página de sucesso com push approval | Core retorna `SHOW_MBWAY` → Redireciona para `/checkout/success?type=mbway` |
| **Multibanco** | `PROXY_MULTIBANCO` | Página de sucesso com entidade + referência | Core retorna `SHOW_MULTIBANCO` → Redireciona para `/checkout/success?type=multibanco&entity=X&reference=Y` |
| **SEPA** | `PROXY_SEPA` | Página de sucesso com IBAN + beneficiário | Core retorna `SHOW_SEPA` → Redireciona para `/checkout/success?type=sepa&iban=X&beneficiary=Y` |

### Fluxo de Routing

```
Utilizador escolhe método → Frontend envia POST /checkout/intent
                                    │
                              Atlas Core V2
                                    │
                        Consulta payment_rules DB
                                    │
                     ┌──────────────┼──────────────┐
                     │              │              │
              method=card    method=crypto    method=mbway
                     │              │              │
             STRIPE_PT_002   STRIPE_CRYPTO    PROXY_MBWAY
                     │              │              │
          actionType=          actionType=     actionType=
          STRIPE_ELEMENTS     SHOW_CRYPTO     SHOW_MBWAY
                     │         WIDGET            │
                     │              │              │
          Render Stripe      Render Onramp    Redirect to
          Elements form      Widget           /success
```

### Desconto Crypto (5% dinâmico)

O desconto para pagamentos crypto é **dinâmico** e obtido do Core:

```typescript
const cryptoDiscountPct = checkoutConfig?.cryptoDiscountPct ?? 5;
const cryptoDiscount = paymentMethod === 'crypto'
  ? Number((total * cryptoDiscountPct / 100).toFixed(2))
  : 0;
const finalTotal = paymentMethod === 'crypto'
  ? Number((total * (1 - cryptoDiscountPct / 100)).toFixed(2))
  : total;
```

- O valor padrão é 5%, mas o Core pode alterá-lo sem redeploy
- O desconto é aplicado **antes** de enviar o `amount` ao `POST /checkout/intent`
- A UI mostra o preço riscado e o valor com desconto em verde

### Envio Gratuito

O threshold de envio gratuito também é dinâmico:

```typescript
const freeShippingThreshold = checkoutConfig?.freeShippingThreshold ?? 75;
const baseShippingCost = checkoutConfig?.shippingCost ?? 6.5;
const shippingCost = cartTotal >= freeShippingThreshold ? 0 : baseShippingCost;
```

---

## 8. Compliance KYC/AML (Crypto)

A regulamentação europeia **AMLD5** (5.ª Diretiva Anti-Branqueamento) exige verificação de identidade para transações crypto. O frontend implementa esta compliance da seguinte forma:

### Campos Obrigatórios para Crypto

Quando o utilizador seleciona o método `crypto`, dois campos adicionais tornam-se **obrigatórios**:

| Campo | Tipo | Validação | Propósito |
|-------|------|-----------|-----------|
| **NIF / SSN** | `customer.nif` | Mínimo 5 caracteres | Identificação fiscal (KYC) |
| **Data de Nascimento** | `customer.birthDate` | Formato `YYYY-MM-DD`, idade ≥ 18 | Verificação de maioridade (AML) |

### Bloqueio do Botão de Submissão

O botão "Finalizar Encomenda" permanece **bloqueado** enquanto o KYC não estiver completo:

```typescript
const isKycComplete = paymentMethod !== 'crypto' || (
  form.vat.trim().length >= 5 &&
  form.dob !== '' &&
  (() => {
    const bd = new Date(form.dob);
    const today = new Date();
    let age = today.getFullYear() - bd.getFullYear();
    const m = today.getMonth() - bd.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
    return age >= 18;
  })()
);

const isSubmitDisabled = isProcessing || configLoading || !isKycComplete;
```

### Envio ao Core

Os dados KYC são enviados no `POST /checkout/intent`:

```typescript
customer: {
  email: form.email,
  fullName: form.name,
  nif: paymentMethod === 'crypto' ? form.vat.trim() : (form.vat.trim() || undefined),
  birthDate: paymentMethod === 'crypto' ? form.dob : undefined,
  // ...
}
```

- `nif` e `birthDate` são enviados **apenas** quando o método é `crypto`
- Para outros métodos, o NIF é opcional (campo presente mas não obrigatório)
- O Core valida estes dados do lado do servidor antes de criar a intenção de pagamento

### Aviso Visual

Quando o KYC está incompleto, o frontend mostra um aviso em âmbar:

```tsx
{!isKycComplete && (
  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded flex items-start gap-2">
    <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
    <p className="text-[10px] text-amber-700 font-medium">
      Preencha o NIF e a Data de Nascimento para desbloquear o pagamento Crypto.
    </p>
  </div>
)}
```

E o botão de submissão mostra mensagem alternativa:

```tsx
{!isKycComplete ? (
  <><AlertTriangle size={14} /> Complete o KYC para pagar</>
) : (
  <><CreditCard size={14} /> Finalizar Encomenda</>
)}
```

---

## 9. Rotas e Navegação

### Rotas da Aplicação

| Rota | Ficheiro | Descrição |
|------|----------|-----------|
| `/` | `app/page.tsx` | Homepage com hero, destaque, categorias, story |
| `/store` | `app/store/page.tsx` | Catálogo com filtros, pesquisa e paginação |
| `/store?cat=queijos` | — | Filtragem por categoria via query param |
| `/product/[id]` | `app/product/[id]/page.tsx` | Detalhe do produto (UUID) |
| `/checkout` | `app/checkout/page.tsx` | Checkout com 5 métodos de pagamento |
| `/checkout/success` | `app/checkout/success/page.tsx` | Confirmação pós-pagamento |
| `/about` | `app/about/page.tsx` | Página institucional |
| 404 | `app/not-found.tsx` | Página não encontrada |

### UUID em vez de Slug

Todas as rotas de produto usam **UUID** (`/product/[id]`), **não slug**. Esta decisão é deliberada e resolve um problema crítico:

**Problema com slugs em Português:**

Nomes de produtos açorianos contêm caracteres especiais que causam problemas de URL encoding:

| Produto | Slug | Problema |
|---------|------|----------|
| Licor de Maracujá | `licor-de-maracuja` | `ç` → `%C3%A7` (pode causar 404) |
| Pimenta da Terra | `pimenta-da-terra` | `ã` → `%C3%A3` |
| Queijo São Jorge | `queijo-sao-jorge` | `ã` → `%C3%A3` |

**Solução com UUID:**

```
/product/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

- Sem problemas de encoding — UUIDs são ASCII puro
- Sem colisões — cada produto tem um UUID único garantido pelo Atlas Core
- Sem necessidade de normalização ou sanitização de slug
- O campo `slug` existe no modelo mas é utilizado apenas para SEO interno (canonical URLs), não para routing

---

## 10. i18n e Moeda

### Internacionalização

O sistema de i18n é **inline** (sem `next-intl`), implementado no `StoreContext`:

- **4 locales:** `pt` (default), `en`, `fr`, `de`
- **~70 chaves de tradução** por idioma (nav, home, categorias, produto, carrinho, checkout, loja, footer)
- **Fallback chain:** locale atual → `pt` → chave literal

**Uso:**

```typescript
const { t } = useStore();
<h1>{t('home.hero.title')}</h1>  // "O Sabor Autêntico dos Açores"
```

### Nomes de Produto por Idioma

O Core fornece nomes e descrições em 4 idiomas. O `StoreContext` resolve automaticamente:

```typescript
const { getProductName, getProductDescription } = useStore();

// Resolução por locale:
// pt → product.name
// en → product.nameEn || product.name
// fr → product.nameFr || product.nameEn || product.name
// de → product.nameDe || product.nameEn || product.name
```

### Conversão de Moeda

| Moeda | Taxa | Símbolo |
|-------|------|---------|
| EUR | 1.00 | € |
| USD | 1.08 | $ |
| GBP | 0.86 | £ |

**Implementação:**

```typescript
const convertPrice = (amount: number): number =>
  Math.round(amount * EXCHANGE_RATES[currency] * 100) / 100;

const formatPrice = (priceEur: number): string =>
  `${CURRENCY_SYMBOLS[currency]}${convertPrice(priceEur).toFixed(2)}`;
```

> **Importante:** Os preços na BD do Core são **sempre em EUR**. A conversão é apenas de apresentação no frontend. O checkout envia sempre o valor em EUR ao Core.

### Persistência

Locale e moeda são persistidos no `localStorage`:

```typescript
const CART_KEY = 'azoresbio-cart';
const LOCALE_KEY = 'azoresbio-locale';
const CURRENCY_KEY = 'azoresbio-currency';
```

---

## 11. Chatbot Maria da Terra

### Arquitetura

A Maria da Terra é um chatbot IA que ajuda os clientes a conhecer os produtos, envios e a cultura açoriana.

```
┌───────────────────┐     POST /api/chat     ┌──────────────────┐
│  MariaChat.tsx     │ ──────────────────────→│  chat/route.ts   │
│  (Client)          │                        │  (Server)        │
│                    │ ←──────────────────────│                  │
│  • sessionId       │     { message }        │  1. Load/create  │
│    (nanoid 10)     │                        │     session      │
│  • messages[]      │                        │  2. Add user msg │
│  • 4 perguntas     │                        │  3. Call Z-AI    │
│    sugeridas/locale│                        │  4. Add reply    │
└───────────────────┘                        │  5. Save & return│
                                             └──────────────────┘
```

### Armazenamento de Sessão

As sessões são **in-memory** (zero persistência local — princípio Dumb Client):

```typescript
const sessions = new Map<string, { messages: string; updatedAt: number }>();
```

- **TTL:** 24 horas
- **Pruning:** A cada 10 minutos, sessões expiradas são removidas
- **Context window:** Últimas 20 mensagens enviadas ao LLM
- **Loss on restart:** Se o servidor reiniciar, as sessões perdem-se (o Core é quem tem persistência)

### System Prompt

```
És a Maria da Terra, uma assistente açoriana calorosa e conhecedora da loja AZORES.BIO.

Personalidade:
- Açoriana orgulhosa, fala com carinho sobre as ilhas e os seus produtos
- Especialista em gastronomia, vinhos, queijos e cultura dos Açores
- Ajuda os clientes a escolher produtos, explica origens e métodos de produção

Conhecimento do catálogo:
- Queijo São Jorge DOP, Queijo do Faial, Manteiga dos Açores, AzorGhee
- Atum e Polvo em azeite, Vinhos do Pico, Licores de Maracujá e Ananás
- Chá Gorreana (desde 1883), Bolos Lêvedos das Furnas, Pimenta da Terra
- Mel das Flores e Cabazes Gourmet

Entidade legal: Azores Meet, Lda | NIF: 513553169
```

### Perguntas Sugeridas

4 perguntas por locale, apresentadas no início da conversa:

| PT | EN |
|----|-----|
| Que queijos dos Açores recomendam? | What Azorean cheeses do you recommend? |
| Qual o tempo de envio para Portugal? | What is the shipping time to Europe? |
| Têm vinhos da Ilha do Pico? | Do you have Pico Island wines? |
| Como posso pagar? | How can I pay? |

---

## 12. Variáveis de Ambiente

O projeto requer **apenas 2 variáveis de ambiente**. Isto reflete o princípio Dumb Client: zero secrets, zero configuração de gateway.

| Variável | Obrigatória | Default | Descrição |
|----------|-------------|---------|-----------|
| `NEXT_PUBLIC_ATLAS_API_URL` | ✅ | `https://api.atlasglobal.digital` | URL base do Atlas Core V2 |
| `NEXT_PUBLIC_STORE_SLUG` | ✅ | `azores-bio` | Identificador do tenant no Core |

### Configuração

```env
NEXT_PUBLIC_ATLAS_API_URL=https://api.atlasglobal.digital
NEXT_PUBLIC_STORE_SLUG=azores-bio
```

> **Nota:** Todas as chaves Stripe (publishable keys) vêm dinamicamente do `GET /checkout-config` e do `POST /checkout/intent` (via `payload.publishableKey`). Zero chaves hardcoded no código.

---

## 13. Comandos

```bash
# Instalar dependências
bun install

# Servidor de desenvolvimento (porta 3000, com log para dev.log)
bun run dev

# Build de produção
bun run build

# Verificar qualidade do código
bun run lint
```

### Scripts no `package.json`

```json
{
  "dev": "next dev -p 3000 2>&1 | tee dev.log",
  "build": "next build",
  "lint": "eslint ."
}
```

---

## 14. Deploy no Vercel

### Passos

1. Conectar o repositório GitHub ao Vercel
2. Configurar as variáveis de ambiente no dashboard
3. O Vercel deteta automaticamente o framework Next.js

### Variáveis de Ambiente em Produção

```env
NEXT_PUBLIC_ATLAS_API_URL=https://api.atlasglobal.digital
NEXT_PUBLIC_STORE_SLUG=azores-bio
```

### Build Command

```
next build
```

### Output Directory

```
.next
```

### Notas de Deploy

- **Sem base de dados local** — não é necessário configurar `DATABASE_URL` ou Prisma
- **Sem secrets** — as chaves Stripe são obtidas em runtime do Core
- **Imagens remotas** — `next.config.ts` tem `remotePatterns` configurado para `images.unsplash.com`
- **TypeScript** — `ignoreBuildErrors: true` está ativo (resolver antes de produção crítica)
- **React Strict Mode** — `reactStrictMode: false` (considerar ativar para detetar problemas)

---

## 15. Roadmap

### Estado Atual

| Feature | Estado |
|---------|--------|
| Catálogo de produtos (Core API) | ✅ Completo |
| Filtragem e pesquisa | ✅ Completo |
| Carrinho persistente (localStorage) | ✅ Completo |
| Checkout multi-método | ✅ Completo |
| Stripe Elements (Card) | ✅ Funcional |
| Stripe Crypto Onramp | ✅ Funcional |
| MBWAY / Multibanco / SEPA | ✅ Funcional (via Core proxy) |
| KYC/AML Compliance (Crypto) | ✅ Funcional |
| Chatbot IA (Maria da Terra) | ✅ Funcional |
| i18n (4 idiomas) | ✅ Inline |
| Multi-moeda | ✅ Client-side |
| Páginas legais | ⬜ Links no footer apontam para `#` |
| Notificações email | ⬜ Não implementado |
| Autenticação | ⬜ Não implementado |
| Painel admin | ⬜ Gesto de produtos e encomendas no Core |
| Webhooks Core → Frontend | ⬜ Atualização de status de encomenda |
| Testes | ⬜ Unit tests (Vitest), E2E (Playwright) |

### Plano Futuro

1. **Páginas legais** — Envios/Devoluções, Privacidade, Termos e Condições
2. **Webhooks Core** — Receber notificações de alteração de estado de encomenda
3. **Notificações email** — Confirmação de encomenda e atualizações de envio (Resend/SendGrid)
4. **Autenticação** — NextAuth.js com provider Google/Email para área de cliente
5. **Favoritos / Wishlist** — Persistidos no Core
6. **Avaliações de produto** — Reviews verificadas por compra
7. **SEO avançado** — Meta tags dinâmicas, structured data, sitemap XML
8. **PWA** — Service worker para experiência offline parcial
9. **Analytics** — Integração com PostHog ou similar (via Core)
10. **Testes** — Cobertura de testes unitários e E2E

---

## Paleta de Cores

| Token | Valor | Uso |
|-------|-------|-----|
| Primary | `#1a3a3a` | Fundo escuro, botões, headers, navbar |
| Primary Light | `#2d5a5a` | Hover states |
| Gold | `#b8962e` | Acentos, labels, ornamentos, destaque |
| Cream | `#f8f5f0` | Fundo principal |
| Sand | `#ede8e0` | Bordas, cards, separadores |
| Muted | `#6b6b6b` | Texto secundário |
| Dark Muted | `#3d3d3d` | Texto terciário |
| Light Gold | `#c8b89a` | Placeholders, ícones inativos |

## Tipografia

| Uso | Font | CSS |
|-----|------|-----|
| Títulos | Playfair Display | `fontFamily: "'Playfair Display', serif"` |
| Subtítulos/Labels | Inter | `fontFamily: "'Inter', sans-serif"` |
| Corpo/Citação | Cormorant Garamond | `fontFamily: "'Cormorant Garamond', serif", fontWeight: 300` |

---

*Dossiê técnico v2.0 — Arquitetura Dumb Client / Relay Node.*  
*Última atualização: março 2026.*

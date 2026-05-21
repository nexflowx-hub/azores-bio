# AZORES.BIO — Dossiê Técnico Completo

> Plataforma de e-commerce premium para produtos artesanais dos Açores  
> **Entidade:** Azores Meet, Lda | NIF: 513553169  
> **Sede:** Macela, 9875-030 Santo Antão, Calheta (São Jorge), Açores, Portugal  
> **Domínio:** [azores.bio](https://azores.bio)

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitetura do Sistema](#3-arquitetura-do-sistema)
4. [Estrutura do Projeto](#4-estrutura-do-projeto)
5. [Base de Dados (Prisma / SQLite)](#5-base-de-dados-prisma--sqlite)
6. [API Routes — Referência Completa](#6-api-routes--referência-completa)
7. [Integrações e Serviços Externos](#7-integrações-e-serviços-externos)
8. [Sistema de i18n e Moeda](#8-sistema-de-i18n-e-moeda)
9. [Fluxo de Checkout e Encomendas](#9-fluxo-de-checkout-e-encomendas)
10. [Chatbot — Maria da Terra](#10-chatbot--maria-da-terra)
11. [Componentes Frontend](#11-componentes-frontend)
12. [Variáveis de Ambiente](#12-variáveis-de-ambiente)
13. [Comandos de Desenvolvimento](#13-comandos-de-desenvolvimento)
14. [Deploy e Produção](#14-deploy-e-produção)
15. [Notas e Roadmap](#15-notas-e-roadmap)

---

## 1. Visão Geral

A **AZORES.BIO** é uma loja online de produtos premium provenientes das 9 ilhas dos Açores. O projeto é uma aplicação web fullstack construída com **Next.js 16 App Router**, que inclui:

- **Catálogo de produtos** com 11 categorias (queijos, vinhos, conservas, chás, compotas, licores, pastelaria, pimentas, manteigas, bebidas, outros)
- **Carrinho de compras** persistido em localStorage com suporte multi-moeda
- **Checkout** em 4 passos (Dados Pessoais → Endereço de Envio → Confirmação → Pedido Confirmado)
- **Gestão de encomendas** com criação automática de fatura e decremento de stock em transação Prisma
- **Chatbot IA** ("Maria da Terra") com contexto de sessão persistido em SQLite
- **Internacionalização** (PT, EN, FR, DE) com tradução inline e nomes de produto por idioma
- **Conversão de moeda** (EUR, USD, GBP) com taxas hardcoded

---

## 2. Stack Tecnológico

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 16.x |
| Linguagem | TypeScript | 5.x |
| UI Framework | React | 19.x |
| Estilização | Tailwind CSS | 4.x |
| Componentes UI | shadcn/ui (New York) | — |
| Ícones | Lucide React | 0.525+ |
| ORM | Prisma | 6.x |
| Base de Dados | SQLite | — |
| State Management | Zustand (disponível) / React Context | — |
| Server State | TanStack React Query | 5.x |
| Pagamentos | Stripe (SDK + API) | 22.x / 9.x |
| IA / Chat | z-ai-web-dev-sdk | 0.0.18 |
| Animações | Framer Motion | 12.x |
| Notificações | Sonner | 2.x |
| ID Generation | nanoid | 5.x |
| Formulários | react-hook-form + zod | 7.x / 4.x |
| Gráficos | Recharts | 2.x |
| Package Manager | Bun | — |
| Deploy Target | Vercel | — |

### Dependências Principais

```
@prisma/client, @stripe/stripe-js, @tanstack/react-query,
framer-motion, lucide-react, nanoid, next, next-auth, next-themes,
react, react-dom, react-hook-form, recharts, sharp, sonner,
stripe, tailwind-merge, z-ai-web-dev-sdk, zod, zustand
```

---

## 3. Arquitetura do Sistema

```
┌──────────────────────────────────────────────────────────┐
│                    BROWSER (Client)                       │
│  ┌─────────┐  ┌───────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Homepage│  │Store Page  │  │ Product  │  │ Checkout │ │
│  │  (SSR)  │  │(Client R.) │  │  Detail  │  │ 4 Steps  │ │
│  └────┬────┘  └─────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │             │              │              │        │
│  ┌────┴─────────────┴──────────────┴──────────────┴─────┐ │
│  │              StoreContext (React Context)             │ │
│  │  • locale (pt|en|fr|de)  • currency (EUR|USD|GBP)    │ │
│  │  • cart (localStorage)    • t() translations          │ │
│  │  • formatPrice()         • getProductName()          │ │
│  └──────────────────────────┬───────────────────────────┘ │
│                             │                              │
│  ┌──────────────────────────┴───────────────────────────┐ │
│  │              Maria da Terra (Chatbot IA)              │ │
│  │  • z-ai-web-dev-sdk  • Session persistence (SQLite)  │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────┬───────────────────────────────┘
                             │ fetch('/api/...')
┌────────────────────────────┴───────────────────────────────┐
│               NEXT.JS API ROUTES (Server)                   │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ /api/products    │  │ /api/categories   │                │
│  │ /api/products/   │  │ /api/orders       │                │
│  │  featured/[id]   │  │ /api/orders/      │                │
│  │                  │  │  [orderNumber]     │                │
│  └────────┬─────────┘  └────────┬──────────┘                │
│           │                      │                           │
│  ┌────────┴──────────────────────┴──────────┐               │
│  │            Prisma ORM (SQLite)            │               │
│  │  Category • Product • Order • OrderItem   │               │
│  │  Invoice • ChatSession                    │               │
│  └───────────────────────────────────────────┘               │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ /api/stripe/     │  │ /api/chat         │                │
│  │ payment-intent   │  │ (z-ai-web-dev-sdk)│                │
│  └────────┬─────────┘  └────────┬──────────┘                │
│           │                      │                           │
└───────────┼──────────────────────┼───────────────────────────┘
            │                      │
   ┌────────┴────────┐    ┌────────┴────────┐
   │  Stripe API      │    │  Z-AI LLM API   │
   │  (PaymentIntent) │    │  (Chatbot)       │
   └─────────────────┘    └──────────────────┘
```

---

## 4. Estrutura do Projeto

```
azores-bio/
├── prisma/
│   └── schema.prisma          # Schema da base de dados
├── db/
│   └── custom.db              # Base de dados SQLite
├── public/
│   └── logo.svg               # Favicon
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout (Providers + Navbar + Footer)
│   │   ├── page.tsx           # Homepage
│   │   ├── not-found.tsx      # 404 page
│   │   ├── globals.css        # Estilos globais + Tailwind
│   │   ├── store/
│   │   │   └── page.tsx       # Listagem de produtos com filtros
│   │   ├── product/
│   │   │   └── [id]/
│   │   │       └── page.tsx   # Detalhe do produto
│   │   ├── checkout/
│   │   │   └── page.tsx       # Checkout em 4 passos
│   │   ├── about/
│   │   │   └── page.tsx       # Página Sobre Nós
│   │   └── api/
│   │       ├── route.ts                          # Health check
│   │       ├── categories/route.ts               # GET /api/categories
│   │       ├── products/route.ts                 # GET /api/products
│   │       ├── products/featured/route.ts        # GET /api/products/featured
│   │       ├── products/[id]/route.ts            # GET /api/products/:id
│   │       ├── orders/route.ts                   # POST /api/orders
│   │       ├── orders/[orderNumber]/route.ts     # GET /api/orders/:orderNumber
│   │       ├── stripe/payment-intent/route.ts    # POST /api/stripe/payment-intent
│   │       └── chat/route.ts                     # POST /api/chat
│   ├── components/
│   │   ├── Navbar.tsx         # Navegação fixa com locale/currency
│   │   ├── Footer.tsx         # Rodapé com links e contacto
│   │   ├── ProductCard.tsx    # Card de produto com add-to-cart
│   │   ├── CartDrawer.tsx     # Drawer lateral do carrinho
│   │   ├── MariaChat.tsx      # Chatbot IA flutuante
│   │   ├── Providers.tsx      # QueryClientProvider + StoreProvider
│   │   └── ui/                # 47 componentes shadcn/ui
│   ├── contexts/
│   │   └── StoreContext.tsx   # Context global (i18n, cart, currency)
│   ├── hooks/
│   │   ├── use-toast.ts       # Toast hook (shadcn)
│   │   └── use-mobile.ts      # Mobile detection hook
│   └── lib/
│       ├── db.ts              # Prisma Client singleton
│       └── utils.ts           # cn() utility (clsx + twMerge)
├── .env                       # DATABASE_URL
├── next.config.ts             # Next.js config
├── tailwind.config.ts         # Tailwind + shadcn tokens
├── package.json               # Dependencies
└── README.md                  # Este ficheiro
```

---

## 5. Base de Dados (Prisma / SQLite)

### Diagrama ER

```
┌──────────────┐       ┌──────────────────┐
│  Category    │1─────*│  Product          │
├──────────────┤       ├──────────────────┤
│ id (PK)      │       │ id (PK)          │
│ slug (UQ)    │       │ sku (UQ?)        │
│ nameEn       │       │ name             │
│ namePt       │       │ nameEn/Fr/De     │
│ nameFr?      │       │ description*     │
│ nameDe?      │       │ price            │
│ description? │       │ compareAtPrice?  │
│ imageUrl?    │       │ stock            │
│ sortOrder    │       │ categoryId? (FK) │
│ createdAt    │       │ imageUrl         │
└──────────────┘       │ images (JSON)    │
                       │ weight?          │
                       │ origin?          │
                       │ featured         │
                       │ active           │
                       │ tags (JSON)      │
                       └──────────────────┘

┌──────────────────┐       ┌──────────────────┐
│  Order           │1─────*│  OrderItem       │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ orderNumber (UQ) │       │ orderId (FK)     │
│ userId?          │       │ productId        │
│ status           │       │ productName      │
│ customerName     │       │ productSku?      │
│ customerEmail    │       │ quantity         │
│ customerPhone?   │       │ unitPrice        │
│ customerVat?     │       │ totalPrice       │
│ shippingAddress  │       └──────────────────┘
│ shippingCity     │
│ shippingPostalCode│      ┌──────────────────┐
│ shippingCountry  │1─────1│  Invoice         │
│ subtotal         │       ├──────────────────┤
│ shippingCost     │       │ id (PK)          │
│ tax              │       │ invoiceNumber(UQ)│
│ total            │       │ orderId (UQ, FK) │
│ currency         │       │ issuerName       │
│ atlasPaymentId?  │       │ issuerVat        │
│ atlasPaymentStatus?│     │ issuerAddress    │
│ paidAt?          │       │ customerName     │
│ notes?           │       │ customerEmail    │
│ locale           │       │ customerVat?     │
└──────────────────┘       │ customerAddress? │
                           │ subtotal         │
┌──────────────────┐       │ tax              │
│  ChatSession     │       │ total            │
├──────────────────┤       │ currency         │
│ id (PK)          │       │ pdfUrl?          │
│ sessionId (UQ)   │       │ pdfKey?          │
│ userId?          │       │ status           │
│ messages (JSON)  │       └──────────────────┘
│ createdAt        │
│ updatedAt        │
└──────────────────┘
```

### Enums Implícitos

| Campo | Valores |
|-------|---------|
| `Order.status` | `pending` (default), `paid`, `shipped`, `delivered`, `cancelled` |
| `Invoice.status` | `issued` (default), `paid`, `void` |
| `Order.currency` | `EUR` (default), `USD`, `GBP` |
| `Order.locale` | `pt` (default), `en`, `fr`, `de` |

---

## 6. API Routes — Referência Completa

### `GET /api`
Health check. Retorna `{ message: "Hello, world!" }`.

---

### `GET /api/categories`
Lista todas as categorias com contagem de produtos ativos.

**Response:**
```json
{
  "categories": [
    {
      "id": 1,
      "slug": "queijos",
      "nameEn": "Cheeses",
      "namePt": "Queijos",
      "nameFr": "Fromages",
      "nameDe": "Käse",
      "description": "...",
      "imageUrl": "...",
      "sortOrder": 0,
      "productCount": 21
    }
  ]
}
```

---

### `GET /api/products`
Lista produtos com filtros, ordenação e paginação.

**Query Parameters:**
| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `categorySlug` | string | — | Filtrar por slug de categoria |
| `search` | string | — | Pesquisa em nome, descrição, origem (PT + EN) |
| `sort` | string | `featured` | `featured`, `price_asc`, `price_desc`, `name` |
| `limit` | int | `12` | Produtos por página |
| `offset` | int | `0` | Offset para paginação |

**Response:**
```json
{
  "products": [{ ... }],
  "total": 250,
  "limit": 12,
  "offset": 0
}
```

---

### `GET /api/products/featured`
Retorna os 8 produtos marcados como `featured: true`, ordenados por data de criação.

**Response:**
```json
{
  "products": [{ ... }]
}
```

---

### `GET /api/products/:id`
Retorna um produto específico pelo ID numérico, incluindo dados da categoria.

**Response:**
```json
{
  "product": {
    "id": 1,
    "name": "Queijo São Jorge DOP Curado 7 Meses",
    "nameEn": "São Jorge DOP Aged Cheese 7 Months",
    "price": 18.5,
    "stock": 45,
    "category": { "slug": "queijos", "namePt": "Queijos", "nameEn": "Cheeses" }
  }
}
```

---

### `POST /api/orders`
Cria uma encomenda com items, fatura e decremento de stock em transação atómica.

**Request Body:**
```json
{
  "customerName": "João Silva",
  "customerEmail": "joao@example.com",
  "customerPhone": "+351912345678",
  "customerVat": "123456789",
  "shippingAddress": "Rua Principal, 123",
  "shippingCity": "Lisboa",
  "shippingPostalCode": "1000-001",
  "shippingCountry": "Portugal",
  "notes": "Entregar após as 18h",
  "locale": "pt",
  "currency": "EUR",
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 5, "quantity": 1 }
  ]
}
```

**Lógica do Servidor:**
1. Validação de campos obrigatórios e formato de email
2. Busca produtos por ID (verifica `active: true`)
3. Verifica stock disponível para cada item
4. Calcula preços a partir da BD (server-side, não do cliente)
5. Calcula envio: **grátis acima de €75**, senão **€9.99**
6. Gera número de encomenda: `AZB-{timestamp}-{random4}`
7. Cria Order + OrderItems + Invoice numa transação Prisma
8. Decrementa stock de cada produto
9. Gera número de fatura: `FAT-{year}-{orderId padded 6 digits}`

**Response (201):**
```json
{
  "orderNumber": "AZB-1700000000000-1234",
  "invoiceNumber": "FAT-2026-000042",
  "total": 47.99,
  "orderId": 42
}
```

**Erros:**
| Status | Condição |
|--------|----------|
| 400 | Campos obrigatórios em falta / email inválido / produto inativo / stock insuficiente |
| 500 | Erro interno do servidor |

---

### `GET /api/orders/:orderNumber`
Retorna uma encomenda pelo número, incluindo items e fatura.

**Response:**
```json
{
  "order": {
    "id": 42,
    "orderNumber": "AZB-...",
    "status": "pending",
    "items": [...],
    "invoice": { "invoiceNumber": "FAT-2026-000042", ... }
  }
}
```

---

### `POST /api/stripe/payment-intent`
Cria um Stripe PaymentIntent (endpoint disponível, não integrado no checkout atual).

**Request Body:**
```json
{
  "amount": 47.99,
  "currency": "eur",
  "customerEmail": "joao@example.com",
  "customerName": "João Silva",
  "metadata": { "orderId": "42" }
}
```

**Requer:** `STRIPE_SECRET_KEY` configurada.

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_yyy",
  "paymentIntentId": "pi_xxx"
}
```

---

### `POST /api/chat`
Endpoint do chatbot Maria da Terra.

**Request Body:**
```json
{
  "sessionId": "abc123def4",
  "message": "Que queijos recomendam?",
  "locale": "pt"
}
```

**Lógica:**
1. Carrega ou cria sessão na BD (`ChatSession`)
2. Adiciona mensagem do utilizador ao histórico
3. Envia as últimas 20 mensagens + system prompt para o LLM
4. Adiciona resposta do assistente ao histórico
5. Persiste histórico atualizado na BD

**Response:**
```json
{
  "message": "Recomendo o Queijo São Jorge DOP... 🧀",
  "sessionId": "abc123def4"
}
```

---

## 7. Integrações e Serviços Externos

### 7.1 Stripe

| Componente | Pacote | Estado |
|------------|--------|--------|
| Payment Intent API | `stripe` (server) | ✅ Configurado (endpoint `/api/stripe/payment-intent`) |
| Stripe.js (client) | `@stripe/stripe-js` | ✅ Instalado |
| React Stripe.js | `@stripe/react-stripe-js` | ✅ Instalado |

**Fluxo de Pagamento (preparado mas não ativo no checkout):**
1. Cliente submete encomenda → `POST /api/stripe/payment-intent`
2. Servidor cria PaymentIntent via `stripe.paymentIntents.create()`
3. Retorna `clientSecret` ao cliente
4. Cliente monta `<Elements>` + `<PaymentElement>` com a chave
5. `stripe.confirmPayment()` processa o pagamento

**Configuração necessária:**
```env
STRIPE_SECRET_KEY=sk_live_...     # Chave privada (server-side)
NEXT_PUBLIC_STRIPE_KEY=pk_live_... # Chave pública (client-side)
```

**Nota:** O modelo `Order` já possui campos `atlasPaymentId` e `atlasPaymentStatus` preparados para integração com gateway de pagamentos externo (Atlas Core Banking).

---

### 7.2 Z-AI (Chatbot LLM)

| Componente | Pacote | Uso |
|------------|--------|-----|
| SDK Backend | `z-ai-web-dev-sdk` | Server-side chat completions |

**Configuração:**
```typescript
const client = await ZAI.create();
const response = await client.chat.completions.create({
  messages: [{ role: 'system', content: MARIA_SYSTEM_PROMPT }, ...chatHistory],
  model: 'default',
});
```

**System Prompt (resumo):**
- Nome: Maria da Terra
- Personalidade: Açoriana orgulhosa, especialista em gastronomia
- Conhecimento: Catálogo completo (queijos DOP, vinhos do Pico, chá Gorreana, etc.)
- Envios: Europa 3-7 dias, Internacional 7-14 dias, grátis acima de €75
- Entidade legal: Azores Meet, Lda | NIF: 513553169

---

### 7.3 NextAuth.js

O pacote `next-auth` está instalado mas **não configurado**. Os campos `userId` existem em `Order` e `ChatSession` para futura integração de autenticação.

---

## 8. Sistema de i18n e Moeda

### Internacionalização

O sistema de i18n é **inline** (sem next-intl ativo), implementado no `StoreContext`:

- **4 locales:** `pt` (default), `en`, `fr`, `de`
- **~70 chaves de tradução** por idioma (nav, home, categorias, produto, carrinho, checkout, loja, footer)
- **Fallback chain:** locale atual → `pt` → chave literal

**Nomes de produto por idioma:**
- BD: `name` (PT), `nameEn`, `nameFr`, `nameDe`
- Context: `getProductName(product)` — resolve pelo locale atual
- Mesma lógica para descrições e categorias

### Conversão de Moeda

| Moeda | Taxa | Símbolo |
|-------|------|---------|
| EUR | 1.00 | € |
| USD | 1.08 | $ |
| GBP | 0.86 | £ |

**Implementação:**
- Taxas hardcoded no `StoreContext` (atualização manual)
- Conversão client-side: `convertPrice(price)` = `Math.round(price * rate * 100) / 100`
- Formatação: `formatPrice(price)` = `€XX.XX` / `$XX.XX` / `£XX.XX`

**⚠️ Nota:** Os preços na BD são sempre em EUR. A conversão é apenas de apresentação no frontend. O checkout envia o preço original em EUR.

---

## 9. Fluxo de Checkout e Encomendas

### Fluxo do Utilizador

```
Homepage → Store → Product Detail → Add to Cart → Cart Drawer → Checkout (4 steps)
                                                                     │
                                                    Step 1: Dados Pessoais
                                                           │
                                                    Step 2: Endereço de Envio
                                                           │
                                                    Step 3: Confirmação
                                                           │
                                                    Step 4: Pedido Confirmado ✅
```

### Cálculos de Envio

| Contexto | Threshold Grátis | Custo Base |
|----------|-----------------|------------|
| CartDrawer (frontend) | €75 | €6.50 |
| Checkout (frontend) | €75 | €6.50 |
| Orders API (backend) | €75 | **€9.99** |

> ⚠️ **Inconsistência:** O frontend calcula €6.50 de envio mas o servidor cobra €9.99. O valor do servidor prevalece na encomenda criada.

### Geração de Números

| Tipo | Formato | Exemplo |
|------|---------|---------|
| Encomenda | `AZB-{timestamp}-{random4}` | `AZB-1700000000000-1234` |
| Fatura | `FAT-{year}-{orderId padded 6}` | `FAT-2026-000042` |

### Transação Atómica

A criação de encomenda usa `db.$transaction()` para garantir:
1. Criação de `Order` + `OrderItem[]`
2. Criação de `Invoice`
3. Decrementar `stock` em cada `Product`
4. Se qualquer passo falhar, tudo é revertido

---

## 10. Chatbot — Maria da Terra

### Arquitetura

```
┌───────────────┐     POST /api/chat     ┌──────────────────┐
│  MariaChat.tsx │ ──────────────────────→│  chat/route.ts   │
│  (Client)      │                        │  (Server)         │
│                │ ←──────────────────────│                   │
│  • sessionId   │     { message }        │  1. Load session  │
│  • messages[]  │                        │  2. Add user msg  │
│  • nanoid(10)  │                        │  3. Call Z-AI LLM │
└────────────────┘                        │  4. Save history  │
                                          │  5. Return reply  │
                                          └──────────────────┘
```

### Funcionalidades

- **Sessão persistente:** Histórico guardado em `ChatSession.messages` (JSON)
- **Context window:** Últimas 20 mensagens enviadas ao LLM
- **Perguntas sugeridas:** 4 por idioma (PT, EN, FR, DE)
- **Mensagem de boas-vindas:** Adaptada ao locale do utilizador
- **Auto-scroll:** Scroll automático para a última mensagem
- **Foco no input:** Focus automático ao abrir o chat

---

## 11. Componentes Frontend

### Componentes Customizados

| Componente | Ficheiro | Descrição |
|------------|----------|-----------|
| **Navbar** | `Navbar.tsx` | Barra de navegação fixa com logo, links, seletores de idioma/moeda, carrinho. Transparente na homepage, opaca com scroll. Menu mobile. |
| **Footer** | `Footer.tsx` | Rodapé 4 colunas: marca, loja, informações, contacto. Barra inferior com entidade legal e copyright. |
| **ProductCard** | `ProductCard.tsx` | Card de produto com imagem, badges (destaque, desconto, esgotado), botão hover add-to-cart, preço com desconto. |
| **CartDrawer** | `CartDrawer.tsx` | Drawer lateral direita com items, controlos de quantidade, barra de envio gratuito, totais, botão checkout. |
| **MariaChat** | `MariaChat.tsx` | Botão flutuante + janela de chat com header, mensagens, perguntas sugeridas, input. |
| **Providers** | `Providers.tsx` | Wrapper com QueryClientProvider (TanStack Query, staleTime 60s) + StoreProvider. |

### shadcn/ui Components

47 componentes disponíveis em `src/components/ui/`:
accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toaster, toggle, toggle-group, tooltip

### Tipografia

| Uso | Font | CSS |
|-----|------|-----|
| Títulos | Playfair Display | `fontFamily: "'Playfair Display', serif"` |
| Subtítulos/Labels | Inter | `fontFamily: "'Inter', sans-serif"` |
| Corpo/Citação | Cormorant Garamond | `fontFamily: "'Cormorant Garamond', serif", fontWeight: 300` |

### Paleta de Cores

| Token | Valor | Uso |
|-------|-------|-----|
| Primary | `#1a3a3a` | Fundo escuro, botões, headers |
| Primary Light | `#2d5a5a` | Hover states |
| Gold | `#b8962e` | Acentos, labels, ornamentos |
| Cream | `#f8f5f0` | Fundo principal |
| Sand | `#ede8e0` | Bordas, cards, separadores |
| Muted | `#6b6b6b` | Texto secundário |
| Dark Muted | `#3d3d3d` | Texto terciário |
| Light Gold | `#c8b89a` | Placeholders, ícones inativos |

---

## 12. Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | ✅ | URL de conexão SQLite (`file:./db/custom.db`) |
| `STRIPE_SECRET_KEY` | ⬜ | Chave privada Stripe para PaymentIntents |
| `NEXT_PUBLIC_STRIPE_KEY` | ⬜ | Chave pública Stripe para client-side |
| `NEXTAUTH_SECRET` | ⬜ | Secret para NextAuth.js (futuro) |
| `NEXTAUTH_URL` | ⬜ | URL base para NextAuth.js (futuro) |

### Configuração Atual (`.env`)
```env
DATABASE_URL=file:/home/z/my-project/db/custom.db
```

---

## 13. Comandos de Desenvolvimento

```bash
# Instalar dependências
bun install

# Iniciar servidor de desenvolvimento (porta 3000)
bun run dev

# Verificar qualidade do código
bun run lint

# Push do schema Prisma para a BD (sem migrações)
bun run db:push

# Gerar Prisma Client
bun run db:generate

# Criar migração
bun run db:migrate

# Reset da BD
bun run db:reset

# Build de produção
bun run build

# Iniciar servidor de produção
bun run start
```

---

## 14. Deploy e Produção

### Vercel (Recomendado)

1. Conectar repositório GitHub ao Vercel
2. Configurar variáveis de ambiente no dashboard
3. Build command: `next build`
4. Output directory: `.next`

### Variáveis de Ambiente em Produção

```env
DATABASE_URL=file:./db/custom.db
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_KEY=pk_live_...
NEXTAUTH_SECRET=<random-secret>
NEXTAUTH_URL=https://azores.bio
```

### Notas de Deploy

- **Base de dados:** SQLite funciona para deploys single-region. Para multi-region, migrar para PostgreSQL.
- **Imagens:** Configurar `next.config.ts` `remotePatterns` para domínios de CDN de imagens.
- **TypeScript:** `ignoreBuildErrors: true` está ativo — resolver antes de produção.
- **Strict Mode:** `reactStrictMode: false` — considerar ativar para detetar problemas.

---

## 15. Notas e Roadmap

### Estado Atual

| Feature | Estado |
|---------|--------|
| Catálogo de produtos | ✅ Completo |
| Filtragem e pesquisa | ✅ Completo |
| Carrinho persistente | ✅ Completo |
| Checkout 4 passos | ✅ Completo |
| Criação de encomendas | ✅ Completo (transação atómica) |
| Geração de faturas | ✅ Completo |
| Chatbot IA (Maria) | ✅ Funcional |
| i18n (4 idiomas) | ✅ Inline |
| Multi-moeda | ✅ Client-side (hardcoded) |
| Pagamento Stripe | ⬜ Endpoint criado, não integrado no checkout |
| Autenticação | ⬜ Dependência instalada, não configurada |
| Páginas legais | ⬜ Links no footer apontam para `#` |
| Página de sucesso | ⬜ Não existe `/checkout/success` |
| Notificações email | ⬜ Não implementado |
| Painel admin | ⬜ Não implementado |

### Problemas Conhecidos

1. **Inconsistência de envio:** Frontend calcula €6.50, API cobra €9.99
2. **TypeScript:** `ignoreBuildErrors: true` pode ocultar erros
3. **React Strict Mode:** Desativado — pode ocultar bugs de lifecycle
4. **Imagens:** Dependência de Unsplash URLs externas (sem fallback local)
5. **Preços:** Conversão de moeda é apenas visual; checkout usa sempre EUR
6. **SEO:** Páginas de produto usam `[id]` numérico em vez de slug SEO-friendly

### Roadmap Sugerido

1. **Integrar Stripe no checkout** — Substituir criação direta de encomenda por fluxo PaymentIntent
2. **Corrigir inconsistência de envio** — Unificar cálculo frontend/backend
3. **Criar páginas legais** — Envios/Devoluções, Privacidade, Termos e Condições
4. **Implementar autenticação** — NextAuth.js com provider Google/Email
5. **Migrar para PostgreSQL** — Para deploys multi-region no Vercel
6. **Slug de produto** — Migrar de `[id]` para `[slug]` para SEO
7. **Webhooks Stripe** — Confirmar pagamento e atualizar `Order.status`
8. **Notificações email** — Enviar confirmação de encomenda via Resend/SendGrid
9. **Painel admin** — Dashboard para gestão de produtos, encomendas e stock
10. **Testes** — Unit tests (Vitest), integration tests (Playwright)

---

## Repositório

**GitHub:** [nexflowx-hub/azores-bio](https://github.com/nexflowx-hub/azores-bio)

---

*Dossiê técnico gerado em março 2026. Última atualização: commit `874b421`.*

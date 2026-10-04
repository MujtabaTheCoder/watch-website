# Technical Requirement Document (TRD)
## MS VELLORE — High-Traffic Enterprise E-Commerce Architecture
*Fine Timepieces & Horology*

---

### 1. Architectural Overview & System Design

To sustain millions of concurrent visitors during limited luxury watch drops and daily browsing spikes without degrading response times or exhausting database resources, MS VELLORE adheres to a **Multi-Tier Edge-First Decoupled Architecture**.

```
                             [ Millions of Global Visitors / Bots ]
                                              │
                                              ▼
                         [ Cloudflare / Vercel Edge CDN & WAF ]
                             ├── Layer 7 DDoS Mitigation & Turnstile Bot Gate
                             └── Tier 1: CDN Edge Cache (HTML / Static Assets / 4K Media)
                                              │
                                              ▼
                          [ Next.js App Router (Node / Edge Runtime) ]
                             ├── SSG / ISR Product Catalog Pages (<30ms)
                             ├── Authenticated SSR & Admin Portal Pages
                             ├── Edge Middleware: Geo-IP Routing & Auth Tokens
                             └── API Route Handlers (Zod Input Validation)
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    ▼                                                   ▼
       [ Tier 2: Upstash Redis Cluster ]             [ Serverless Connection Pooler ]
        ├── Atomic Stock Reservations (Lua)             (Supabase Pooler / PgBouncer)
        ├── Sliding-Window API Rate Limiting            ├── Transaction Pooling (Max <100 conn)
        ├── Dynamic Catalog Filter Cache                └── Read-Replica Routing
        └── Session State & Invalidation Cache                          │
                                                                        ▼
                                                       [ Tier 3: PostgreSQL Database ]
                                                          ├── Primary Node (ACID Writes)
                                                          ├── Read Replicas (Complex Queries)
                                                          └── Row Level Security (RLS) Engine
```

---

### 2. Tech Stack Selection

| Layer | Technology | Version / Config | Rationale & Enterprise Justification |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | 15+ / React 19 | Hybrid rendering (Server Components, SSG, ISR, Streaming SSR) for ultra-fast first-paint and instant catalog navigation. |
| **Language** | TypeScript | 5.5+ (Strict Mode) | Zero `any`, complete compile-time type safety across data contracts, UI components, and API boundaries. |
| **Styling** | Tailwind CSS / CSS Modules | Latest | Utility-first, zero-runtime overhead, optimized CSS bundle, bespoke luxury dark-mode design tokens. |
| **Primary Database** | PostgreSQL via Supabase | 16+ | Enterprise relational integrity, ACID guarantees for financial transactions, native JSONB, GIN/GiST indexing, and native Row-Level Security (RLS). |
| **Connection Pooling** | Supabase Connection Pooler (PgBouncer) | Transaction Mode | Prevents database connection exhaustion during massive concurrent serverless invocations. |
| **In-Memory Cache & KV** | Upstash Redis | Global Serverless | Sub-5ms latency, atomic multi-key Lua scripting for distributed stock locks, edge-compatible HTTP/REST client. |
| **CDN & Edge Infrastructure**| Cloudflare Enterprise / Vercel Edge | Anycast CDN | Global edge caching, automated SSL, Web Application Firewall (WAF), and Cloudflare Turnstile anti-bot verification. |
| **Asset Storage & Media** | Cloudflare R2 / AWS S3 + Edge Transforms | S3 API | Zero egress fees for high-res 4K watch photography and 3D glTF/GLB models, with automated AVIF/WebP image optimization. |
| **Payments Integration** | Stripe Elements & Escrow Integration | PCI-DSS Level 1 | Client-side hosted fields for credit cards, Apple Pay, Google Pay, and escrow wire workflows for transactions >$50k. |
| **Testing Suite** | Jest / Vitest + Playwright | Modern runner | Vitest/Jest for fast unit testing and concurrent simulation; Playwright for end-to-end browser checkout verification. |

---

### 3. High Traffic & Anti-Crash Architecture

#### 3.1 Static Site Generation (SSG) & Incremental Static Regeneration (ISR)
- **Catalog & Product Detail Pages (PDP)**:
  - Top 1,000 popular references are pre-rendered at build time (SSG).
  - Long-tail references are generated on-demand using Incremental Static Regeneration (ISR) with a background revalidation cadence.
- **On-Demand Tagged Revalidation**:
  - Catalog and PDP routes are tagged using `revalidateTag('catalog')` and `revalidateTag('product-${id}')`.
  - When an admin updates price, specifications, or media, a targeted webhook triggers immediate revalidation of that specific tag without rebuilding unaffected pages.
- **Edge Cache Headers**:
  - `s-maxage=600, stale-while-revalidate=86400`. Unauthenticated visitors receive static HTML from edge CDN nodes within 15–30ms, completely bypassing the database.

#### 3.2 Serverless Database Connection Pooling Setup
- Direct connections in serverless environments cause immediate database pool exhaustion under high traffic spikes.
- **Pooler Architecture**:
  - All application queries connect exclusively via the **Supabase Connection Pooler (PgBouncer)** operating in **Transaction Mode** over port `6543`.
  - Pool size is strictly capped (e.g., maximum 60 connections on primary write instance, 120 on read-replicas).
  - Prisma / Drizzle ORM configurations disable connection pinning and use prepared statement workarounds compliant with transaction pooling.
  - Heavy read operations (e.g., catalog multi-filter searches, admin analytics) are routed to dedicated Read Replicas, isolating the Primary node for order writes and stock decrements.

#### 3.3 Redis Caching Strategy
1. **Catalog & Search Filter Cache**:
   - Faceted aggregation counts (brands, movements, case sizes, materials) cached under keys like `catalog:filters:hash` with a 5-minute TTL.
   - Cache invalidated automatically on product catalog mutations via cache tagging.
2. **Real-Time Stock Counts**:
   - Cached inventory counts stored in Redis keys `stock:available:{productId}` for sub-millisecond stock availability checks.
3. **User Session State & Token Revocation**:
   - Session tokens and role claims cached with TTL matching session lifetime. Revoked sessions immediately blacklisted in Redis to enforce real-time RBAC termination.

#### 3.4 Anti-Overselling & High-Concurrency Stock Reservation Engine
During limited-edition watch releases (e.g., 50 pieces of a tourbillon reference with 250,000 users attempting checkout simultaneously):
1. **Edge Pre-Check**:
   - Read `stock:available:{productId}` from Redis. If 0, instantly return HTTP 409 (Sold Out) without hitting the database.
2. **Atomic Lua Reservation**:
   - Execute an atomic Redis script executing stock decrement and reservation record creation with a 10-minute TTL:
   ```lua
   -- Atomic Stock Reservation Script
   local stock_key = KEYS[1]       -- 'stock:available:' .. productId
   local reserve_key = KEYS[2]     -- 'stock:reserved:' .. productId
   local user_id = ARGV[1]
   local qty = tonumber(ARGV[2])
   local ttl_seconds = tonumber(ARGV[3])

   local current_stock = tonumber(redis.call('get', stock_key) or '0')
   if current_stock >= qty then
       redis.call('decrby', stock_key, qty)
       redis.call('hset', reserve_key, user_id, qty)
       redis.call('expire', reserve_key, ttl_seconds)
       return 1 -- Success
   else
       return 0 -- Insufficient stock
   end
   ```
3. **Database Optimistic Concurrency Control (OCC) & Row-Level Locks**:
   - When the user submits payment, the backend executes an atomic PostgreSQL transaction with optimistic concurrency verification:
   ```sql
   BEGIN;
   -- Row-level lock on specific serialized inventory unit
   SELECT id, version, status 
   FROM inventory_units 
   WHERE id = $inventoryUnitId 
   FOR UPDATE;

   UPDATE inventory_units
   SET status = 'SOLD',
       reserved_by_user_id = $userId,
       version = version + 1,
       updated_at = NOW()
   WHERE id = $inventoryUnitId 
     AND version = $expectedVersion 
     AND status = 'RESERVED';

   COMMIT;
   ```
   If zero rows are updated, the transaction rolls back, releasing the lock, returning an explicit conflict error, and replenishing the Redis counter.

#### 3.5 CDN Edge Caching for Heavy Assets & 3D Models
- All high-res watch imagery, macro zoom slices, 360-degree rotation frames, and 3D glTF/GLB models are stored on Cloudflare R2 / S3.
- Edge caching rule: `Cache-Control: public, max-age=31536000, immutable`.
- Next.js Image Optimization runs at the edge, converting heavy raw PNG/JPEG source files into optimized WebP and AVIF formats with responsive `srcset` breakpoints.
- Large 3D models (>15MB) are streamed with progressive LOD (Level of Detail) meshes, loading the low-poly proxy first to keep the page interactive in <1 second.

#### 3.6 Rate Limiting & DDoS Protection
- **Sliding-Window Algorithm** implemented via Upstash Redis (`@upstash/ratelimit`):
  - Catalog browsing: 120 requests/min per IP.
  - Cart reservations (`/api/cart/reserve`): 10 requests/min per User/IP.
  - Checkout session creation (`/api/checkout/session`): 5 requests/min per User/IP.
  - Auth login / password reset (`/api/auth/*`): 5 requests per 15 minutes per IP.
- **Bot Deterrence**: Cloudflare Turnstile token verification enforced on all mutation endpoints before execution.

---

### 4. Database Schema Design (PostgreSQL DDL & Indexing)

```sql
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enum Types
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'SUPPORT_STAFF', 'INVENTORY_MANAGER', 'SUPER_ADMIN');
CREATE TYPE movement_type AS ENUM ('AUTOMATIC', 'MANUAL_WIND', 'TOURBILLON', 'PERPETUAL_CALENDAR', 'QUARTZ', 'SPRING_DRIVE');
CREATE TYPE case_material AS ENUM ('STAINLESS_STEEL', 'ROSE_GOLD', 'YELLOW_GOLD', 'WHITE_GOLD', 'PLATINUM', 'TITANIUM', 'CERAMIC', 'CARBON');
CREATE TYPE inventory_status AS ENUM ('AVAILABLE', 'RESERVED', 'IN_TRANSIT', 'SOLD', 'UNDER_INSPECTION');
CREATE TYPE order_status AS ENUM ('PENDING_PAYMENT', 'ESCROW_HELD', 'PROCESSING', 'DISPATCHED', 'DELIVERED', 'CANCELLED', 'REFUNDED');

-- Warehouses / Vaults
CREATE TABLE vaults (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    location_city VARCHAR(100) NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Brands Table
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    origin_country VARCHAR(60) NOT NULL DEFAULT 'Switzerland',
    description TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products Catalog (Horological Specifications)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
    reference_number VARCHAR(100) NOT NULL,
    model_name VARCHAR(150) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    retail_price_cents BIGINT NOT NULL, -- Stored in integer base cents (USD)
    movement movement_type NOT NULL,
    calibre VARCHAR(100),
    power_reserve_hours INT,
    case_diameter_mm NUMERIC(4,1) NOT NULL,
    case_thickness_mm NUMERIC(4,1),
    case_material case_material NOT NULL,
    water_resistance_atm INT NOT NULL DEFAULT 3,
    dial_color VARCHAR(50) NOT NULL,
    complications TEXT[] DEFAULT '{}',
    is_limited_edition BOOLEAN NOT NULL DEFAULT FALSE,
    total_production_limit INT,
    description TEXT NOT NULL,
    media_gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
    specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Serialized Inventory Units (Physical Timepieces)
CREATE TABLE inventory_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    vault_id UUID NOT NULL REFERENCES vaults(id) ON DELETE RESTRICT,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    condition_grade VARCHAR(50) NOT NULL DEFAULT 'UNWORN_MINT',
    box_and_papers BOOLEAN NOT NULL DEFAULT TRUE,
    status inventory_status NOT NULL DEFAULT 'AVAILABLE',
    reserved_by_user_id UUID,
    reservation_expires_at TIMESTAMPTZ,
    version INT NOT NULL DEFAULT 1, -- Optimistic concurrency control lock
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customer Profiles & Roles
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'CUSTOMER',
    full_name VARCHAR(150),
    phone_number VARCHAR(50),
    preferred_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    total_amount_cents BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status order_status NOT NULL DEFAULT 'PENDING_PAYMENT',
    payment_method VARCHAR(50) NOT NULL,
    payment_intent_id VARCHAR(120),
    armored_courier VARCHAR(100),
    tracking_number VARCHAR(120),
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Items (Linking Serialized Watch)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    inventory_unit_id UUID NOT NULL REFERENCES inventory_units(id),
    unit_price_cents BIGINT NOT NULL,
    authenticity_certificate_hash VARCHAR(128) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes for Search & Multi-Faceted Filters
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_movement ON products(movement);
CREATE INDEX idx_products_material ON products(case_material);
CREATE INDEX idx_products_price ON products(retail_price_cents);
CREATE INDEX idx_products_diameter ON products(case_diameter_mm);
CREATE INDEX idx_products_water_res ON products(water_resistance_atm);
CREATE INDEX idx_products_complications ON products USING GIN(complications);
CREATE INDEX idx_products_specs ON products USING GIN(specifications);
CREATE INDEX idx_products_trgm ON products USING GIN(model_name gin_trgm_ops, reference_number gin_trgm_ops);

-- Partial Indexes for Available Inventory & Expired Reservations
CREATE INDEX idx_inventory_available ON inventory_units(product_id, vault_id) WHERE status = 'AVAILABLE';
CREATE INDEX idx_inventory_active_reservations ON inventory_units(reservation_expires_at) WHERE status = 'RESERVED';
```

---

### 5. Row Level Security (RLS) Policies

```sql
-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read and update their own profile; Admins have full access
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Super Admins have full access to profiles" ON profiles
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
    );

-- Products: Anyone can read active products; Inventory Managers and Super Admins can insert/update
CREATE POLICY "Public can view active products" ON products
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('INVENTORY_MANAGER', 'SUPER_ADMIN')
        )
    );

-- Inventory Units: Internal staff only; customers cannot query raw serial units directly
CREATE POLICY "Staff can view and manage inventory units" ON inventory_units
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('INVENTORY_MANAGER', 'SUPER_ADMIN', 'SUPPORT_STAFF')
        )
    );

-- Orders: Customers can only see their own orders; Staff can inspect all orders
CREATE POLICY "Customers can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all orders" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('SUPPORT_STAFF', 'INVENTORY_MANAGER', 'SUPER_ADMIN')
        )
    );

CREATE POLICY "Admins can update orders" ON orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('SUPPORT_STAFF', 'INVENTORY_MANAGER', 'SUPER_ADMIN')
        )
    );
```

---

### 6. Testing & Quality Assurance Plan

#### 6.1 Strict TypeScript Compiler Configuration (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

#### 6.2 Unit and Integration Testing Rules (Jest / Vitest)
1. **Financial & Currency Math**:
   - Zero floating-point operations. All currency calculations must be executed in integer cents or using precision decimal libraries.
   - Comprehensive unit test suite validating tax rates, discounts, and currency conversion rounding.
2. **Filter Query Logic**:
   - Unit tests covering all filter permutation combinations (e.g., Rose Gold + Tourbillon + 40mm–42mm + $50k+).
3. **Concurrency Simulation**:
   - Integration tests utilizing Vitest and local Redis/PostgreSQL instances:
   - Run 100 concurrent checkout attempts against a single available inventory unit; assert that exactly 1 request succeeds and 99 fail with graceful conflict statuses.
4. **Zod Boundary Tests**:
   - Validate every API route request body against malformed payloads, injection strings, and unauthorized parameter overrides.

#### 6.3 End-to-End Testing (Playwright)
1. **Critical Path Visitor Journey**:
   - Search reference -> Multi-filter facets -> Open Product Page -> Reserve Watch (10-min countdown starts) -> Fill Checkout -> Complete Mock Stripe Tokenization -> Verify Order Tracking Page.
2. **Admin Operations Journey**:
   - Admin MFA login -> Navigate to Inventory Manager -> Update stock count -> Assert that public PDP updates via tagged revalidation.
   - Verify Support Staff cannot edit product pricing or access Super Admin configuration.

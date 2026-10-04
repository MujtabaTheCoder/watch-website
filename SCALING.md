# VELLORE — Architecture, Caching & Scaling Guide

## 1. Architectural Philosophy: Edge-First Protection

During high-traffic campaigns (Eid sales, Black Friday, viral social media bursts), 95%+ of incoming visitors must **never touch the primary PostgreSQL database**. VELLORE achieves this through a multi-tier caching architecture:

```
[ Visitor / Mobile Traffic in Pakistan ]
                 │
                 ▼
[ Cloudflare / Vercel Edge CDN ] ──── (Static Assets & ISR HTML: 120s TTL)
                 │
                 ▼ (Only Cache Misses / Revalidation)
[ Next.js Server Components with unstable_cache ]
                 │
                 ▼ (Only Writes / Checkout / Admin)
[ Supabase Transaction Pooler (Port 6543 / Supavisor) ]
                 │
                 ▼
[ PostgreSQL: Atomic RPC `create_order` with Row-Level Locks ]
```

---

## 2. What Is Cached vs. What Hits the Database

| Route / Asset | Cache Mechanism | Invalidation Strategy | Database Impact |
| :--- | :--- | :--- | :--- |
| **Homepage (`/`)** | Static ISR (120s) | `revalidatePath('/')` on admin edit | None (Served from CDN edge) |
| **Catalog (`/shop`)** | ISR (120s) with tag `products` | `revalidateTag('products')` on product changes | None for cached visitors |
| **Watch Detail (`/watches/:slug`)** | ISR (120s) + Static Params | `revalidatePath('/watches/[slug]')` | None |
| **About & Policies (`/about`, `/policies`)** | Fully Static (SSG) | Build-time or manual revalidation | Zero DB calls |
| **Images & 3D Assets** | Immutable CDN with Next Image AVIF/WebP | 1 Year `Cache-Control: public, max-age=31536000, immutable` | Zero DB calls |
| **Cart Bag (`/cart`)** | Client Zustand + LocalStorage | Client-side only | Zero DB calls |
| **Checkout Action** | **Dynamic Write Only** | Realtime | Hits Postgres RPC `create_order` with row locks |
| **Admin Command (`/admin/*`)** | Dynamic SSR + Realtime | Live queries with indexed filters | Protected behind admin session |

---

## 3. Order Spike Concurrency Safeguards

1. **Atomic Postgres RPC (`create_order`)**:
   - Executes inside a single transaction.
   - Uses `SELECT ... FOR UPDATE` row-level locks on product stock.
   - Even if 500 buyers click "Complete Order" simultaneously for the last remaining watch, exactly 1 will succeed and 499 will receive an instant, clean `OUT_OF_STOCK` error. Overselling is mathematically impossible.
2. **Idempotency Guarantee**:
   - The browser generates a unique UUID `idempotency_key` per checkout attempt.
   - Stored in a Postgres `UNIQUE` column.
   - Double-clicks, network retries, or mobile browser refreshes return the existing order without creating duplicates or deducting additional stock.
3. **Rate Limiting Protection**:
   - Built-in token-bucket rate limiter restricts aggressive checkout submissions per IP address (8/min) and per mobile number (4/min).
   - Zero-payload honeypot (`website_hp`) silently traps automated checkout scrapers.

---

## 4. Recommended Infrastructure Upgrades for Massive Scale

When scaling from thousands to millions of visitors:

1. **Cloudflare CDN in Front**:
   - Enable Cloudflare Enterprise / Pro with "Cache Everything" rules for `/shop` and `/` bypass on cookie.
   - Turn on Cloudflare Polish & Mirage for image optimization on slower 3G/4G Pakistani mobile carriers.
2. **Supabase Compute & Read Replicas**:
   - Upgrade Supabase project to **Small or Medium Compute** (gives dedicated CPU cores for PostgREST and Postgres).
   - Enable **Supavisor Transaction Connection Pooling** (port 6543) so thousands of Server Actions share a bounded set of database connections.
   - If analytics or reporting loads increase, deploy a read replica for `/admin` analytics.
3. **Upstash Redis for Distributed Rate Limiting**:
   - Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in production for distributed sliding-window rate limiting across all Vercel edge regions.
4. **Vercel Pro**:
   - For fast edge execution in the Middle East / Asia Pacific regions (e.g. `sin1`, `dxb1`).

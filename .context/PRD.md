# Product Requirement Document (PRD)
## MS VELLORE — Fine Timepieces & Horology
*Brand Positioning: Exceptional timepieces, precisely curated.*

---

### 1. Executive Summary & Product Vision

**MS VELLORE** is an enterprise-grade, high-performance digital flagship and private collector marketplace engineered specifically for ultra-luxury, high-horology timepieces (e.g., Patek Philippe, Audemars Piguet, Rolex, Vacheron Constantin, A. Lange & Söhne, Richard Mille, and premier independent horologists).

The platform bridges the exclusivity, white-glove curation, and tactile prestige of a private Swiss horology salon with the scale, speed, and resilience of tier-1 distributed e-commerce architecture. MS VELLORE is architected to handle millions of concurrent users during high-traffic limited flash drops and global traffic spikes without crashing, lagging, or allowing inventory data corruption or overselling.

---

### 2. Target Audience & User Personas

| Persona | Demographics & Profile | Primary Needs & Jobs to be Done | Pain Points to Solve |
| :--- | :--- | :--- | :--- |
| **Julian (The Elite Collector)** | Age 38–60, Net Worth >$5M, deep technical appreciation for horology. | Instant micro-faceted filtering (complications, movements, calibres, case dimensions), verifiable authenticity, provenance inspection, white-glove delivery. | Skeptical of online authenticity, slow-loading catalog interfaces, lack of high-res macro detail. |
| **Sophia (The Luxury Milestone Buyer)** | Age 28–45, purchasing an iconic heirloom or executive milestone gift. | Intuitive curation, guided fit/size breakdowns (lug-to-lug, wrist circumference matching), secure escrow financing, transparent warranty and return guarantees. | Intimidated by horological jargon, fear of purchasing wrong dimensions or counterfeit goods. |
| **Vikram (The Drop Enthusiast / Speculator)** | Age 24–40, competes in limited-run boutique releases and micro-brand allocations. | High-speed checkout, zero-lag countdown clocks, transparent reservation queues, instant allocation confirmations. | Losing out to automated bots, checkout crashing during flash releases, carts expiring due to database deadlocks. |
| **Marcus (Super Admin & Executive Director)** | Platform owner / Executive Director. | Full operational governance, platform analytics, global pricing controls, high-level role management, financial audit logs. | Lack of unified multi-warehouse visibility, fraud exposure, revenue leakage. |
| **Elena (Inventory & Warehouse Manager)** | Boutique vault director & inventory auditor. | Multi-warehouse inventory sync, serialized stock management, real-time low-stock alerts, condition grading, shipping dispatch. | Desynchronized inventory across global vaults, manual stock reconciliation, overselling rare singletons. |
| **Liam (Customer Support & VIP Concierge Staff)** | Dedicated client support specialist & certified horologist. | Order status inspection, customer ticket resolution, authorized refund/return processing, private concierge assistance. | Slow order lookup, disconnected communication channels, lack of customer purchase context. |

---

### 3. Storefront Features & Functional Requirements

#### 3.1 Watch Catalog & Multi-Faceted Filtering
- **Dynamic Catalog Showcase**:
  - High-performance grid and list views with responsive layouts.
  - 4K macro zoom gallery, 360-degree interactive viewer, movement complication visualizer, and wrist-size simulation.
  - Spec breakdowns: Calibre, Power Reserve, Frequency (vph), Jewels, Finishing, Water Resistance, Lug Width, and Certification (COSC, Geneva Seal, METAS).
- **Multi-Faceted Instant Filtering**:
  - **Movement**: Automatic, Manual Wind, Tourbillon, Perpetual Calendar, Quartz, Spring Drive.
  - **Case Dimensions**: Case Diameter (34mm to 48mm+), Case Thickness (<8mm ultra-thin to >15mm), Lug-to-Lug length.
  - **Case & Dial Materials**: Stainless Steel (904L/316L), Rose Gold, Yellow Gold, White Gold, Platinum (950), Titanium (Grade 2/5), Ceramic, Carbon Composite, Bronze.
  - **Price Range**: Adaptive slider with preset luxury brackets ($5,000–$25,000; $25,000–$100,000; $100,000+).
  - **Brand / Manufacture**: Filter by maison (Rolex, Patek Philippe, Audemars Piguet, Omega, Cartier, etc.).
  - **Water Resistance**: 30m (3 ATM) Dress, 50m (5 ATM), 100m–300m (10–30 ATM) Sports/Diver, 300m+ Professional Saturation.
  - **Complications**: Chronograph (Flyback, Split-Seconds/Rattrapante), Perpetual/Annual Calendar, Moonphase, GMT/World Time, Minute Repeater, Power Reserve Indicator.
- **Search Engine**: Sub-20ms instant full-text search with typo tolerance, brand synonym matching, and reference number lookup (e.g., "5711/1R", "116500LN", "Royal Oak Jumbo").

#### 3.2 High-Concurrency Cart & Checkout System
- **Atomic Stock Reservation**:
  - Adding a watch to the cart places an atomic hold (TTL: 10 minutes) backed by Redis.
  - Countdown timer displayed in the UI; if the user fails to complete checkout within 10 minutes, the hold expires and stock returns to the pool automatically.
- **Queue / Virtual Waiting Room**:
  - Automatic traffic shedding during high-traffic drops; users are queued fairly and allocated reservations based on timestamped tokens.
- **Anti-Bot & Anti-Scalping**:
  - Cloudflare Turnstile CAPTCHA verification before checkout session generation.
  - Cryptographic rate-limiting on cart reservation endpoints.
- **Checkout Processing**:
  - Seamless single-page checkout supporting Stripe Elements / Level-1 PCI-DSS compliant credit card processing, Apple Pay, Google Pay.
  - High-value wire transfer / escrow coordination for orders exceeding $50,000.
  - Real-time address validation and tax/VAT calculation.

#### 3.3 Real-Time Order Tracking & Notifications
- **Status Progression Pipeline**:
  - `Payment Confirmed` -> `Vault Inspection & Serialization Audit` -> `Armored Courier Handover (Brinks/Malca-Amit)` -> `In Transit` -> `Secured White-Glove Delivery`.
- **Live Notifications**:
  - Real-time updates delivered via WebSockets and automated SMS / Email notifications.
  - Verifiable digital Certificate of Authenticity (cryptographic passport) generated and tied to the order.

#### 3.4 Multi-Currency & Geo-IP Location Support
- **Automatic Geo-IP Detection**:
  - Automatically identifies visitor country/region via Edge headers (`cf-ipcountry` or Next.js geo headers).
  - Adjusts default currency across 30+ global currencies (USD, EUR, GBP, CHF, AED, JPY, SGD, HKD, etc.).
- **Localized Pricing & Duties**:
  - Live currency exchange rates cached at the Edge with periodic synchronization.
  - Automatic calculation of estimated import tariffs, local VAT/GST, and luxury excise taxes at checkout.
  - Manual currency switcher always accessible in navigation.

#### 3.5 User Profiles, Wishlist & Order History
- **Customer Account Dashboard**:
  - Profile management (shipping addresses, billing preferences, 2FA security settings).
  - **Interactive Wishlist**: Save favorite timepieces, receive real-time alerts when out-of-stock or rare references become available.
  - **Order History & Archive**: Complete historical purchases with downloadable VAT invoices, serialized certificates, and warranty cards.
  - **Virtual Watch Box (Collector Portfolio)**: Track current estimated market values, service records, and personalized horology notes.

---

### 4. Comprehensive Admin Portal Features

#### 4.1 Secure Admin Authentication & Role-Based Access Control (RBAC)
- **Role Hierarchy**:
  1. **Super Admin**:
     - Full system permissions: User management, role assignment, platform settings, payment gateway configurations, financial audit logs, system-wide overrides.
  2. **Inventory Manager**:
     - Full catalog access, product creation/editing, multi-warehouse stock allocations, low-stock monitoring, serial number assignments, vault audits.
  3. **Support Staff (Concierge & Support)**:
     - Customer order inspection, order status updates, customer ticket handling, return/refund initiation (subject to Super Admin approval threshold).
- **Security Protocols**:
  - Mandatory Multi-Factor Authentication (MFA / TOTP or WebAuthn/FIDO2).
  - Row Level Security (RLS) enforcement in database layer preventing privilege escalation.
  - Comprehensive immutable audit trail logging user ID, IP address, timestamp, and action for every administrative operation.

#### 4.2 Real-Time Inventory & Stock Management
- **Serialized Asset Tracking**:
  - Track individual physical watches by unique serial number and condition grade (`UNWORN_MINT`, `EXCELLENT`, `VINTAGE_CERTIFIED`).
- **Multi-Warehouse / Vault Sync**:
  - Global vault distribution tracking (Geneva, New York, London, Dubai, Singapore).
  - Real-time stock movement tracking between vaults and bonded warehouses.
- **Low Stock & Depletion Alerts**:
  - Automated threshold alerts (configurable per brand/reference) triggering dashboard warnings and automated email notifications to inventory managers.
- **Optimistic Stock Allocation**:
  - Prevention of double-allocation through atomic reservation locks.

#### 4.3 Product & Catalog Management
- **Watch Specs Editor**:
  - Intuitive, comprehensive form to create and update watch references with structured horological attributes (movement, calibre, case diameter, thickness, materials, water resistance, complications, production limits).
- **Dynamic Pricing & Currency Management**:
  - Set base retail price and configure promotional or market-adjusted pricing.
  - Multi-currency override rules (manual fix or automated floating rates with buffer margins).
- **Media Asset Uploads**:
  - Drag-and-drop media manager supporting high-res 4K macro photos, 360-degree frame sequences, 3D glTF/GLB models, and PDF specification sheets.
  - Automated background optimization into modern WebP/AVIF formats at multiple breakpoints.

#### 4.4 Order Management
- **Order Pipeline Control**:
  - View, filter, and inspect orders by status (`PENDING_PAYMENT`, `ESCROW_HELD`, `PROCESSING`, `DISPATCHED`, `DELIVERED`, `CANCELLED`, `REFUNDED`).
  - Update tracking numbers, select armored couriers, and generate tamper-evident packing slips.
- **Returns & Refunds Workflow**:
  - Dedicated return authorization pipeline with multi-step inspection approval.
  - Automated partial or full refunds processed through payment gateway webhooks.

#### 4.5 Sales & Traffic Analytics Dashboard
- **Executive Metric Cards**:
  - Real-time Gross Merchandise Value (GMV), Net Revenue, Average Order Value (AOV), and Conversion Rate.
- **Interactive Visualizations**:
  - Revenue trends over time (daily, weekly, monthly, quarterly).
  - Top-selling watch models, highest grossing brands, and category share breakdowns.
  - Live visitor count, regional traffic distribution heatmap, and checkout funnel conversion drops.

---

### 5. Non-Functional Requirements (NFRs)

| Dimension | Target / SLA | Engineering Approach |
| :--- | :--- | :--- |
| **API Response Time** | p95 < 100ms, p99 < 250ms under peak load | Multi-layer caching (CDN Edge -> Redis -> PgBouncer -> DB), query optimization, zero N+1 queries. |
| **System Uptime** | 99.99% Availability (<52 minutes downtime/year) | Distributed edge routing, serverless auto-scaling compute, multi-AZ database clustering with automatic failover. |
| **Concurrency & Scalability** | Millions of active sessions; 100,000+ simultaneous drop participants | Edge-rendered catalog (ISR/SSG), offloading checkout bursts to Redis-backed atomic reservation queues. |
| **Core Web Vitals** | **LCP** < 1.2s, **FID/INP** < 50ms, **CLS** < 0.05 | Next.js Image Optimization (AVIF/WebP), critical CSS inlining, font subsetting, lazy loading for heavy 3D assets. |
| **Data Consistency** | Zero overselling / duplicate reservation rate | Optimistic concurrency control (OCC) + Redis distributed reservation locks with atomic Lua scripts. |
| **Fault Recovery** | RPO = 0 (zero transaction loss), RTO < 5 minutes | Continuous PostgreSQL WAL archiving, automated Point-in-Time Recovery (PITR). |

---

### 6. Security & Regulatory Compliance

1. **Payment Compliance (PCI-DSS)**:
   - Level 1 PCI-DSS compliant payment integration using client-side tokenization (Stripe Elements / Adyen).
   - Zero PAN (Primary Account Number), CVV, or raw cardholder data ever enters or passes through MS VELLORE servers.
2. **Data Privacy & Protection**:
   - Comprehensive GDPR & CCPA compliance: Right to be forgotten (data erasure pipeline), automated data export tool, and granular consent management.
   - All customer PII (Personally Identifiable Information) encrypted at rest using AES-256 and in transit via TLS 1.3.
3. **Role-Based Access Control (RBAC) Enforcement**:
   - Administrative endpoints strictly guarded by JWT validation and database-level Row Level Security (RLS).
   - Principle of Least Privilege (PoLP) strictly enforced across all user and API service accounts.
4. **Anti-DDoS & API Protection**:
   - Cloudflare WAF, automated DDoS mitigation, IP reputation scoring, and sliding-window rate limiting on critical endpoints.

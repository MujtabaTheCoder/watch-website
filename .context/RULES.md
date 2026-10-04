# Operational Rules & Context Engineering Protocols
## MS VELLORE — Fine Timepieces & Horology
*Autonomous & Pair Programming Directives*

---

### 1. Fundamental Principle: No Guess Coding

Under no circumstances should implementation code, schema alterations, or system refactors be written based on assumptions. Every engineering step must strictly adhere to the project specifications codified in:
- [`.context/PRD.md`](file:///c:/Users/DELL/Desktop/watch%20website/.context/PRD.md)
- [`.context/TRD.md`](file:///c:/Users/DELL/Desktop/watch%20website/.context/TRD.md)

If a requested feature, design token, or edge case is ambiguous or unaddressed in the documentation:
1. **Halt code execution**.
2. **Draft the proposed architectural or specification change**.
3. **Update `.context/PRD.md` or `.context/TRD.md` first**.
4. **Present the update to the user and obtain explicit confirmation before touching application code**.

---

### 2. Step-by-Step Execution Protocol

Every development task must follow this 5-stage lifecycle without exception:

```
[ Stage 1: Read Context ]
       │  Review PRD, TRD, and relevant existing codebase modules
       ▼
[ Stage 2: Draft Plan ]
       │  Outline exact files to create/modify, types, endpoints, and test cases
       ▼
[ Stage 3: Synchronize Docs ]
       │  If any new interface, schema, or rule is introduced, update PRD/TRD
       ▼
[ Stage 4: Atomic Execution ]
       │  Implement code adhering to TypeScript Strict, SOLID, and DRY guidelines
       ▼
[ Stage 5: Verification & Testing ]
          Run type checks, linter, unit tests, and verify against NFR targets
```

1. **Stage 1 — Read Context**:
   - Check [PRD](file:///c:/Users/DELL/Desktop/watch%20website/.context/PRD.md) for business requirements, user personas, and acceptance criteria.
   - Check [TRD](file:///c:/Users/DELL/Desktop/watch%20website/.context/TRD.md) for data schemas, performance thresholds, and architectural patterns.
2. **Stage 2 — Draft Plan**:
   - Formulate a clear, actionable plan broken down into discrete steps.
   - Flag potential performance bottlenecks, concurrency risks, or security concerns.
3. **Stage 3 — Synchronize Docs**:
   - Ensure the documentation remains the single source of truth (SSOT).
4. **Stage 4 — Atomic Execution**:
   - Write clean, modular, self-documenting code. Keep commits/changes focused.
5. **Stage 5 — Verification & Testing**:
   - Verify TypeScript compilation with zero errors (`tsc --noEmit`).
   - Run unit and integration tests.
   - Verify UI responsiveness and accessibility.

---

### 3. Code Style & Architectural Constraints

#### 3.1 Architecture & Design Patterns
- **Clean Architecture & Separation of Concerns**:
  - `presentation/`: UI components, layout, and client interaction.
  - `application/`: Use cases, orchestrators, state management hooks.
  - `domain/`: Business entities, horological calculations, and validation rules.
  - `infrastructure/`: Database queries, Redis client, payment gateway adapters, third-party APIs.
- **Server Component vs. Client Component Separation (Next.js App Router)**:
  - **Server Components by Default**: All layout and data-fetching components must remain React Server Components (RSC) to minimize client-side bundle size, enable direct streaming, and eliminate client-side watermarks.
  - **Client Components ('use client')**: Strictly reserved for interactive leaves of the component tree (e.g., interactive filters, 360 viewer, cart drawers, forms, and countdown timers).
  - Never wrap an entire page in `'use client'`. Keep the boundary as low in the component hierarchy as possible.
- **SOLID Principles**:
  - **Single Responsibility (SRP)**: Every component, hook, and service must have exactly one reason to change.
  - **Open/Closed (OCP)**: Design modules to be extensible without modifying existing core logic (e.g., pluggable payment gateways).
  - **Liskov Substitution (LSP)**: Interchangeable payment and storage adapters implementing strict interfaces.
  - **Interface Segregation (ISP)**: Clients should not be forced to depend on interfaces they do not use.
  - **Dependency Inversion (DIP)**: High-level modules must not depend on low-level details; both depend on abstractions.
- **DRY (Don't Repeat Yourself)**:
  - Centralize domain logic (e.g., price formatting, currency conversions, dimension parsers, stock check logic).
  - Common UI primitives must be reusable design system tokens.

#### 3.2 Strict TypeScript & Data Validation
- **Zero `any` Policy**: Never use `any` or loose type assertions (`as unknown as T`).
- **Strict Null Checks**: Explicitly handle `null` and `undefined`.
- **Runtime Boundary Validation**: All external inputs (request bodies, query params, environment variables, webhook payloads) must be validated using **Zod** schemas before reaching domain logic.
- **Branded Types / Domain Primitives**: Use branded types for IDs (e.g., `BrandId`, `ProductId`, `SerialNumber`) and currency amounts (e.g., `Cents`) to prevent unit confusion.

#### 3.3 High-Concurrency & Anti-Crash Safety Rules
- **No Unbounded Queries**: Never perform `SELECT *` without pagination (`limit` and `offset`/cursor-based).
- **Atomic Stock Operations**: Never mutate stock counts via read-modify-write patterns in application memory. Always utilize Redis atomic Lua scripts or PostgreSQL `UPDATE ... WHERE stock >= qty` with optimistic locking.
- **Graceful Degradation**: Always provide fallback handling for cache misses and external API failures (circuit breaker pattern).
- **Connection Hygiene**: Never hold open database connections during external API calls (e.g., Stripe, shipping APIs). Complete the DB transaction before or after external calls.

#### 3.4 Aesthetics & Visual Standards
- **Ultra-Luxury Aesthetic**: Bespoke dark horology palette (obsidian, deep titanium, brushed gold, crisp sapphire accents), high-contrast readability, polished micro-interactions.
- **No Placeholders**: Never use broken image URLs, lorem ipsum text, or generic colored boxes. Always generate or integrate realistic luxury horological assets and accurate technical specifications.
- **Performance Budget**: Initial load JavaScript bundle under 100kB (gzipped) for critical path; images served in modern AVIF/WebP formats with appropriate `sizes` attributes.

-- ============================================================================
-- MS VELLORE — FINE TIMEPIECES & HOROLOGY
-- MASTER SUPABASE DATABASE INITIALIZATION, SCHEMA, RLS & SEED DATA
-- Fully Idempotent, Safe for Supabase SQL Editor execution
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ----------------------------------------------------------------------------
-- 2. ENUM TYPES
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'CUSTOMER', 
        'SUPPORT_STAFF', 
        'INVENTORY_MANAGER', 
        'SUPER_ADMIN'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE movement_type AS ENUM (
        'AUTOMATIC', 
        'MANUAL_WIND', 
        'TOURBILLON', 
        'PERPETUAL_CALENDAR', 
        'QUARTZ', 
        'SPRING_DRIVE'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE case_material AS ENUM (
        'STAINLESS_STEEL', 
        'ROSE_GOLD', 
        'YELLOW_GOLD', 
        'WHITE_GOLD', 
        'PLATINUM', 
        'TITANIUM', 
        'CERAMIC', 
        'CARBON'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE inventory_status AS ENUM (
        'AVAILABLE', 
        'RESERVED', 
        'IN_TRANSIT', 
        'SOLD', 
        'UNDER_INSPECTION'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM (
        'PENDING_PAYMENT', 
        'ESCROW_HELD', 
        'PROCESSING', 
        'DISPATCHED', 
        'DELIVERED', 
        'CANCELLED', 
        'REFUNDED'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ----------------------------------------------------------------------------
-- 3. UTILITY FUNCTIONS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 4. TABLES (8 CORE TABLES REQUIRED BY MS VELLORE)
-- ----------------------------------------------------------------------------

-- 4.1 Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'CUSTOMER',
    full_name VARCHAR(150),
    phone_number VARCHAR(50),
    preferred_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.2 Warehouses / High-Security Vaults Table
CREATE TABLE IF NOT EXISTS public.vaults (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    location_city VARCHAR(100) NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.3 Brands Table (Manufactures)
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    origin_country VARCHAR(60) NOT NULL DEFAULT 'Switzerland',
    description TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.4 Products Catalog Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE RESTRICT,
    reference_number VARCHAR(100) NOT NULL,
    model_name VARCHAR(150) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    retail_price_cents BIGINT NOT NULL,
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

-- 4.5 Serialized Physical Inventory Units (High-Concurrency Locks)
CREATE TABLE IF NOT EXISTS public.inventory_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    vault_id UUID NOT NULL REFERENCES public.vaults(id) ON DELETE RESTRICT,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    condition_grade VARCHAR(50) NOT NULL DEFAULT 'UNWORN_MINT',
    box_and_papers BOOLEAN NOT NULL DEFAULT TRUE,
    status inventory_status NOT NULL DEFAULT 'AVAILABLE',
    reserved_by_user_id UUID,
    reservation_expires_at TIMESTAMPTZ,
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.6 Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
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

-- 4.7 Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    inventory_unit_id UUID NOT NULL REFERENCES public.inventory_units(id) ON DELETE RESTRICT,
    unit_price_cents BIGINT NOT NULL,
    authenticity_certificate_hash VARCHAR(128) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.8 Audit Logs Table (Immutable Audit Trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_email VARCHAR(255) NOT NULL,
    actor_role VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER',
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address VARCHAR(64) DEFAULT '127.0.0.1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. AUTOMATED TIMESTAMP TRIGGERS
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at 
    BEFORE UPDATE ON public.products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_inventory_units_updated_at ON public.inventory_units;
CREATE TRIGGER trg_inventory_units_updated_at 
    BEFORE UPDATE ON public.inventory_units 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at 
    BEFORE UPDATE ON public.orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auth trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'CUSTOMER'::user_role)
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW; -- Safeguard auth signup if profile insert encounters error
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DO $$ BEGIN
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ----------------------------------------------------------------------------
-- 6. INDEXES FOR PERFORMANCE
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(retail_price_cents);
CREATE INDEX IF NOT EXISTS idx_products_movement ON public.products(movement);
CREATE INDEX IF NOT EXISTS idx_products_case_material ON public.products(case_material);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_brands_slug ON public.brands(slug);
CREATE INDEX IF NOT EXISTS idx_inventory_lookup ON public.inventory_units(product_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);

-- ----------------------------------------------------------------------------
-- 7. ATOMIC RESERVATION PROCEDURES (RPCs)
-- ----------------------------------------------------------------------------

-- 7.1 Atomic Stock Reservation Procedure (Prevents overselling under extreme flash traffic)
CREATE OR REPLACE FUNCTION public.reserve_watch_unit(
    p_product_id UUID,
    p_user_id UUID,
    p_ttl_minutes INT DEFAULT 10
)
RETURNS TABLE (
    inventory_unit_id UUID,
    serial_number VARCHAR(100),
    expires_at TIMESTAMPTZ,
    status_code VARCHAR(50)
) AS $$
DECLARE
    v_unit_id UUID;
    v_serial VARCHAR(100);
    v_expires TIMESTAMPTZ;
BEGIN
    -- 1. Calculate expiration timestamp
    v_expires := NOW() + (p_ttl_minutes || ' minutes')::INTERVAL;

    -- 2. Find and lock an available unit using FOR UPDATE SKIP LOCKED
    SELECT id, inventory_units.serial_number
    INTO v_unit_id, v_serial
    FROM public.inventory_units
    WHERE product_id = p_product_id
      AND (
          status = 'AVAILABLE' 
          OR (status = 'RESERVED' AND reservation_expires_at < NOW())
      )
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

    -- 3. If no unit found, return OUT_OF_STOCK
    IF v_unit_id IS NULL THEN
        RETURN QUERY SELECT 
            NULL::UUID, 
            NULL::VARCHAR(100), 
            NULL::TIMESTAMPTZ, 
            'OUT_OF_STOCK'::VARCHAR(50);
        RETURN;
    END IF;

    -- 4. Atomically mark as RESERVED
    UPDATE public.inventory_units
    SET status = 'RESERVED',
        reserved_by_user_id = p_user_id,
        reservation_expires_at = v_expires,
        version = version + 1,
        updated_at = NOW()
    WHERE id = v_unit_id;

    RETURN QUERY SELECT 
        v_unit_id, 
        v_serial, 
        v_expires, 
        'RESERVED_SUCCESSFULLY'::VARCHAR(50);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7.2 Background Cleanup of Expired Reservations
CREATE OR REPLACE FUNCTION public.release_expired_reservations()
RETURNS INT AS $$
DECLARE
    v_released_count INT;
BEGIN
    WITH expired AS (
        SELECT id 
        FROM public.inventory_units
        WHERE status = 'RESERVED'
          AND reservation_expires_at < NOW()
        FOR UPDATE SKIP LOCKED
    ),
    updated AS (
        UPDATE public.inventory_units
        SET status = 'AVAILABLE',
            reserved_by_user_id = NULL,
            reservation_expires_at = NULL,
            version = version + 1,
            updated_at = NOW()
        WHERE id IN (SELECT id FROM expired)
        RETURNING id
    )
    SELECT COUNT(*)::INT INTO v_released_count FROM updated;

    RETURN v_released_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check if current auth user has any of the required roles
CREATE OR REPLACE FUNCTION public.check_user_role(required_roles user_role[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND role = ANY(required_roles)
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 8.1 Brands Policies
DROP POLICY IF EXISTS "Public can view brands" ON public.brands;
CREATE POLICY "Public can view brands" ON public.brands FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can manage brands" ON public.brands;
CREATE POLICY "Staff can manage brands" ON public.brands FOR ALL USING (true);

-- 8.2 Vaults Policies
DROP POLICY IF EXISTS "Public can view vaults" ON public.vaults;
CREATE POLICY "Public can view vaults" ON public.vaults FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can manage vaults" ON public.vaults;
CREATE POLICY "Staff can manage vaults" ON public.vaults FOR ALL USING (true);

-- 8.3 Products Policies
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Staff can manage products" ON public.products;
CREATE POLICY "Staff can manage products" ON public.products FOR ALL USING (true);

-- 8.4 Inventory Units Policies
DROP POLICY IF EXISTS "Public can view inventory" ON public.inventory_units;
CREATE POLICY "Public can view inventory" ON public.inventory_units FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can manage inventory" ON public.inventory_units;
CREATE POLICY "Staff can manage inventory" ON public.inventory_units FOR ALL USING (true);

-- 8.5 Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR auth.uid() IS NULL);

-- 8.6 Orders Policies
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert orders" ON public.orders;
CREATE POLICY "Users can insert orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can update orders" ON public.orders;
CREATE POLICY "Staff can update orders" ON public.orders FOR UPDATE USING (true);

-- 8.7 Order Items Policies
DROP POLICY IF EXISTS "Public can view order items" ON public.order_items;
CREATE POLICY "Public can view order items" ON public.order_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert order items" ON public.order_items;
CREATE POLICY "Users can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- 8.8 Audit Logs Policies
DROP POLICY IF EXISTS "Public can insert audit logs" ON public.audit_logs;
CREATE POLICY "Public can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view audit logs" ON public.audit_logs;
CREATE POLICY "Public can view audit logs" ON public.audit_logs FOR SELECT USING (true);

-- ----------------------------------------------------------------------------
-- 9. SCHEMA PERMISSIONS & API ACCESS GRANTS
-- (CRITICAL: Allows PostgREST anon & authenticated roles to query tables & RPCs)
-- ----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 10. PRODUCTION SEED DATA (VAULTS, MAISONS, TIMEPIECES, INVENTORY & AUDIT)
-- ----------------------------------------------------------------------------

-- 10.1 Vaults
INSERT INTO public.vaults (id, name, location_city, country_code) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Geneva FreePort Vault', 'Geneva', 'CH'),
    ('a0000000-0000-0000-0000-000000000002', 'Manhattan Flagship Vault', 'New York', 'US'),
    ('a0000000-0000-0000-0000-000000000003', 'Mayfair Bonded Vault', 'London', 'GB'),
    ('a0000000-0000-0000-0000-000000000004', 'DIFC High Security Vault', 'Dubai', 'AE'),
    ('a0000000-0000-0000-0000-000000000005', 'Le Freeport Singapore', 'Singapore', 'SG')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    location_city = EXCLUDED.location_city,
    country_code = EXCLUDED.country_code;

-- 10.2 Brands (Maisons)
INSERT INTO public.brands (id, name, slug, origin_country, description, logo_url) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'Patek Philippe', 'patek-philippe', 'Switzerland', 'Genevan manufacture renowned for creating the world''s most prestigious complications since 1839.', '/brands/patek.svg'),
    ('b0000000-0000-0000-0000-000000000002', 'Audemars Piguet', 'audemars-piguet', 'Switzerland', 'Master of Haute Horlogerie from Le Brassus, pioneer of the luxury sports watch.', '/brands/ap.svg'),
    ('b0000000-0000-0000-0000-000000000003', 'Rolex', 'rolex', 'Switzerland', 'The benchmark in precision, durability, and global prestige horology.', '/brands/rolex.svg'),
    ('b0000000-0000-0000-0000-000000000004', 'A. Lange & Söhne', 'a-lange-soehne', 'Germany', 'Glashütte precision craftsmanship, unmatched German silver three-quarter plates and hand-engraved balance cocks.', '/brands/lange.svg'),
    ('b0000000-0000-0000-0000-000000000005', 'Vacheron Constantin', 'vacheron-constantin', 'Switzerland', 'The world''s oldest continuously operating watchmaker, crafting Haute Horlogerie since 1755.', '/brands/vc.svg'),
    ('b0000000-0000-0000-0000-000000000006', 'Richard Mille', 'richard-mille', 'Switzerland', 'Avant-garde racing machines on the wrist engineered with aerospace-grade carbon and titanium.', '/brands/rm.svg')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description;

-- 10.3 Curated Timepiece References
INSERT INTO public.products (
    id, brand_id, reference_number, model_name, slug, retail_price_cents, 
    movement, calibre, power_reserve_hours, case_diameter_mm, case_thickness_mm, 
    case_material, water_resistance_atm, dial_color, complications, 
    is_limited_edition, total_production_limit, description, media_gallery, specifications
) VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    '5711/1R-001',
    'Nautilus Rose Gold',
    'patek-philippe-nautilus-5711-1r',
    14800000,
    'AUTOMATIC',
    'Calibre 26-330 S C',
    45,
    40.0,
    8.3,
    'ROSE_GOLD',
    12,
    'Brown Sunburst',
    ARRAY['Date', 'Center Sweep Seconds'],
    false,
    null,
    'An iconic Gérald Genta design in solid 18K rose gold with warm brown gradated dial and integrated bracelet.',
    '[{"url":"https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop","isPrimary":true,"type":"image"}]'::jsonb,
    '{"crystal":"Sapphire with anti-reflective coating","bracelet":"18K Rose Gold with Nautilus fold-over clasp","jewels":30}'::jsonb
),
(
    'c0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000002',
    '15510ST.OO.1320ST.06',
    'Royal Oak Selfwinding 50th Anniversary',
    'audemars-piguet-royal-oak-15510st-blue',
    5250000,
    'AUTOMATIC',
    'Calibre 4302',
    70,
    41.0,
    10.5,
    'STAINLESS_STEEL',
    5,
    'Bleu Nuit, Nuage 50',
    ARRAY['Date'],
    false,
    null,
    'The classic octagonal bezel with 8 hexagonal screws, Petite Tapisserie dial in iconic Bleu Nuit Nuage 50, and Calibre 4302.',
    '[{"url":"https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop","isPrimary":true,"type":"image"}]'::jsonb,
    '{"frequency_vph":28800,"bracelet":"Integrated Stainless Steel AP folding clasp","jewels":32}'::jsonb
),
(
    'c0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000003',
    '126500LN-0001',
    'Cosmograph Daytona Panda Dial',
    'rolex-cosmograph-daytona-126500ln-panda',
    3450000,
    'AUTOMATIC',
    'Calibre 4131',
    72,
    40.0,
    11.9,
    'STAINLESS_STEEL',
    10,
    'White Lacquer Panda',
    ARRAY['Chronograph', 'Tachymeter Bezel'],
    false,
    null,
    'The ultimate sports chronograph with Cerachrom ceramic tachymeter bezel, Oystersteel case, and column-wheel Calibre 4131.',
    '[{"url":"https://images.unsplash.com/photo-1547996160-71dfabbce5fa?q=80&w=1200&auto=format&fit=crop","isPrimary":true,"type":"image"}]'::jsonb,
    '{"crystal":"Scratch-resistant sapphire","bracelet":"Oystersteel with Oysterlock clasp and Easylink extension","certification":"Superlative Chronometer"}'::jsonb
),
(
    'c0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000004',
    '191.039',
    'Lange 1 White Gold',
    'a-lange-soehne-lange-1-white-gold',
    4320000,
    'MANUAL_WIND',
    'Calibre L121.1',
    72,
    38.5,
    9.8,
    'WHITE_GOLD',
    3,
    'Solid Silver Argenté',
    ARRAY['Outsize Date', 'Power Reserve Indicator', 'Off-Center Time'],
    false,
    null,
    'Saxon watchmaking masterpiece featuring the iconic outsize date, decentralized dial architecture, and hand-finished movement.',
    '[{"url":"https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=1200&auto=format&fit=crop","isPrimary":true,"type":"image"}]'::jsonb,
    '{"plates":"Untreated German silver 3/4 plate","strap":"Hand-stitched alligator leather","balance_cock":"Hand-engraved floral pattern"}'::jsonb
),
(
    'c0000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000005',
    '4500V/110A-B128',
    'Overseas Self-Winding Deep Blue',
    'vacheron-constantin-overseas-4500v-blue',
    3180000,
    'AUTOMATIC',
    'Calibre 5100',
    60,
    41.0,
    11.0,
    'STAINLESS_STEEL',
    15,
    'Translucent Lacquered Blue',
    ARRAY['Date', 'Interchangeable Strap System'],
    false,
    null,
    'The spirit of luxury travel with Maltese cross bezel, soft iron inner ring for anti-magnetic protection, and Hallmark of Geneva.',
    '[{"url":"https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=1200&auto=format&fit=crop","isPrimary":true,"type":"image"}]'::jsonb,
    '{"hallmark":"Hallmark of Geneva certified","rotor":"22K gold Overseas oscillating weight","straps_included":["Steel bracelet","Rubber strap","Mississippiensis alligator strap"]}'::jsonb
),
(
    'c0000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000006',
    'RM 67-02',
    'RM 67-02 Extra Flat Automatic',
    'richard-mille-rm-67-02-extra-flat',
    29500000,
    'AUTOMATIC',
    'Calibre CRMA7',
    50,
    38.7,
    7.8,
    'CARBON',
    5,
    'Skeletonized Titanium Dial',
    ARRAY['Skeletonized Calibre', 'Variable-Geometry Rotor'],
    true,
    50,
    'Ultra-lightweight sports watch weighing just 32 grams including strap, machined from Carbon TPT and Grade 5 titanium.',
    '[{"url":"https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=1200&auto=format&fit=crop","isPrimary":true,"type":"image"}]'::jsonb,
    '{"total_weight_grams":32,"baseplate":"Grade 5 titanium DLC treated","case_material_detail":"Quartz TPT and Carbon TPT composite"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    model_name = EXCLUDED.model_name,
    retail_price_cents = EXCLUDED.retail_price_cents,
    description = EXCLUDED.description,
    media_gallery = EXCLUDED.media_gallery;

-- 10.4 Serialized Physical Inventory Units
INSERT INTO public.inventory_units (id, product_id, vault_id, serial_number, condition_grade, status) VALUES
    ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'PP-5711R-892104', 'UNWORN_MINT', 'AVAILABLE'),
    ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'PP-5711R-892105', 'UNWORN_MINT', 'AVAILABLE'),
    ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'AP-15510-449102', 'UNWORN_MINT', 'AVAILABLE'),
    ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'RLX-126500-78120', 'UNWORN_MINT', 'AVAILABLE'),
    ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'ALS-191039-21804', 'UNWORN_MINT', 'AVAILABLE'),
    ('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', 'VC-4500V-993210', 'UNWORN_MINT', 'AVAILABLE'),
    ('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000005', 'RM-6702-0044/50', 'UNWORN_MINT', 'AVAILABLE')
ON CONFLICT (id) DO NOTHING;

-- 10.5 Initial Audit Log
INSERT INTO public.audit_logs (id, actor_email, actor_role, action, entity, entity_id, metadata, ip_address) VALUES
    ('e0000000-0000-0000-0000-000000000001', 'system@msvellore.internal', 'SUPER_ADMIN', 'SCHEMA_INITIALIZED', 'DATABASE', 'ms_vellore_db', '{"version":"2026.1","environment":"production"}'::jsonb, '127.0.0.1')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 11. NOTIFY POSTGREST TO RELOAD SCHEMA CACHE IMMEDIATELY
-- ----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';

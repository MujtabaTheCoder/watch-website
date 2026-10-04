-- ============================================================================
-- MS VELLORE — Fine Timepieces & Horology
-- Production Supabase Database Migration (Step 1)
-- High-Performance Enterprise Horology E-Commerce
-- Schema: Enums, Tables, Indexes, RLS, Concurrency Lock Functions & Realtime
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. ENUM TYPES
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

-- 3. UTILITY FUNCTIONS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. TABLES DEFINITION

-- 4.1 Profiles Table (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
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

-- 4.4 Products Catalog Table (Watch Specifications)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE RESTRICT,
    reference_number VARCHAR(100) NOT NULL,
    model_name VARCHAR(150) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    retail_price_cents BIGINT NOT NULL, -- Stored in base USD cents ($50k = 5,000,000)
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
    media_gallery JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of high-res/3D assets
    specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.5 Serialized Physical Inventory Units (Optimistic Concurrency & High-Traffic Lock)
CREATE TABLE IF NOT EXISTS public.inventory_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    vault_id UUID NOT NULL REFERENCES public.vaults(id) ON DELETE RESTRICT,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    condition_grade VARCHAR(50) NOT NULL DEFAULT 'UNWORN_MINT',
    box_and_papers BOOLEAN NOT NULL DEFAULT TRUE,
    status inventory_status NOT NULL DEFAULT 'AVAILABLE',
    reserved_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reservation_expires_at TIMESTAMPTZ,
    version INT NOT NULL DEFAULT 1, -- Optimistic Concurrency Control (OCC)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.6 Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
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

-- 4.7 Order Items Table (Serialized Watch Linkage)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    inventory_unit_id UUID NOT NULL REFERENCES public.inventory_units(id) ON DELETE RESTRICT,
    unit_price_cents BIGINT NOT NULL,
    authenticity_certificate_hash VARCHAR(128) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. AUTOMATED TIMESTAMP TRIGGERS
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

-- 6. AUTH SIGNUP TRIGGER (Automatic Profile Sync)
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. PERFORMANCE INDEXES (Sub-20ms Micro-Faceted Search & Filters)
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_movement ON public.products(movement);
CREATE INDEX IF NOT EXISTS idx_products_case_material ON public.products(case_material);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(retail_price_cents);
CREATE INDEX IF NOT EXISTS idx_products_diameter ON public.products(case_diameter_mm);
CREATE INDEX IF NOT EXISTS idx_products_water_res ON public.products(water_resistance_atm);
CREATE INDEX IF NOT EXISTS idx_products_complications ON public.products USING GIN(complications);
CREATE INDEX IF NOT EXISTS idx_products_specs ON public.products USING GIN(specifications);
CREATE INDEX IF NOT EXISTS idx_products_search_trgm ON public.products USING GIN(model_name gin_trgm_ops, reference_number gin_trgm_ops);

-- Partial Indexes for Available Inventory & Expired Reservation Cleanup
CREATE INDEX IF NOT EXISTS idx_inventory_available_lookup 
    ON public.inventory_units(product_id, status) 
    WHERE status = 'AVAILABLE';

CREATE INDEX IF NOT EXISTS idx_inventory_expired_reservations 
    ON public.inventory_units(reservation_expires_at) 
    WHERE status = 'RESERVED';

CREATE INDEX IF NOT EXISTS idx_orders_user_created 
    ON public.orders(user_id, created_at DESC);

-- 8. HIGH-CONCURRENCY ATOMIC RESERVATION FUNCTIONS

-- 8.1 Atomic Stock Reservation Procedure (Prevents overselling under extreme flash traffic)
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

-- 8.2 Background Cleanup of Expired Reservations
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
    )
    UPDATE public.inventory_units u
    SET status = 'AVAILABLE',
        reserved_by_user_id = NULL,
        reservation_expires_at = NULL,
        version = version + 1,
        updated_at = NOW()
    FROM expired
    WHERE u.id = expired.id;

    GET DIAGNOSTICS v_released_count = ROW_COUNT;
    RETURN v_released_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8.3 Order Confirmation & Atomic Stock Finalization
CREATE OR REPLACE FUNCTION public.confirm_order_and_sell_unit(
    p_order_id UUID,
    p_inventory_unit_id UUID,
    p_user_id UUID,
    p_certificate_hash VARCHAR(128)
)
RETURNS BOOLEAN AS $$
DECLARE
    v_unit_status inventory_status;
    v_reserved_user UUID;
    v_expires TIMESTAMPTZ;
BEGIN
    -- Lock inventory unit row
    SELECT status, reserved_by_user_id, reservation_expires_at
    INTO v_unit_status, v_reserved_user, v_expires
    FROM public.inventory_units
    WHERE id = p_inventory_unit_id
    FOR UPDATE;

    -- Verify reservation integrity
    IF v_unit_status != 'RESERVED' OR v_reserved_user != p_user_id OR v_expires < NOW() THEN
        RAISE EXCEPTION 'Reservation is invalid or has expired.';
    END IF;

    -- Transition unit to SOLD
    UPDATE public.inventory_units
    SET status = 'SOLD',
        reserved_by_user_id = p_user_id,
        reservation_expires_at = NULL,
        version = version + 1,
        updated_at = NOW()
    WHERE id = p_inventory_unit_id;

    -- Update Order status
    UPDATE public.orders
    SET status = 'PROCESSING',
        updated_at = NOW()
    WHERE id = p_order_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

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

-- 9.1 Profiles Policies
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Staff can view all profiles" 
    ON public.profiles FOR SELECT 
    USING (public.check_user_role(ARRAY['SUPPORT_STAFF', 'INVENTORY_MANAGER', 'SUPER_ADMIN']::user_role[]));

CREATE POLICY "Super Admins can manage all profiles" 
    ON public.profiles FOR ALL 
    USING (public.check_user_role(ARRAY['SUPER_ADMIN']::user_role[]));

-- 9.2 Vaults Policies
CREATE POLICY "Public can view active vaults" 
    ON public.vaults FOR SELECT 
    USING (is_active = TRUE);

CREATE POLICY "Inventory Managers and Admins can manage vaults" 
    ON public.vaults FOR ALL 
    USING (public.check_user_role(ARRAY['INVENTORY_MANAGER', 'SUPER_ADMIN']::user_role[]));

-- 9.3 Brands Policies
CREATE POLICY "Public can view brands" 
    ON public.brands FOR SELECT 
    USING (TRUE);

CREATE POLICY "Admins can manage brands" 
    ON public.brands FOR ALL 
    USING (public.check_user_role(ARRAY['INVENTORY_MANAGER', 'SUPER_ADMIN']::user_role[]));

-- 9.4 Products Policies
CREATE POLICY "Public can view active products" 
    ON public.products FOR SELECT 
    USING (is_active = TRUE);

CREATE POLICY "Staff can view all products" 
    ON public.products FOR SELECT 
    USING (public.check_user_role(ARRAY['SUPPORT_STAFF', 'INVENTORY_MANAGER', 'SUPER_ADMIN']::user_role[]));

CREATE POLICY "Inventory Managers and Admins can manage products" 
    ON public.products FOR ALL 
    USING (public.check_user_role(ARRAY['INVENTORY_MANAGER', 'SUPER_ADMIN']::user_role[]));

-- 9.5 Inventory Units Policies
CREATE POLICY "Customers cannot view raw inventory units" 
    ON public.inventory_units FOR SELECT 
    USING (public.check_user_role(ARRAY['SUPPORT_STAFF', 'INVENTORY_MANAGER', 'SUPER_ADMIN']::user_role[]));

CREATE POLICY "Inventory Managers and Super Admins can manage inventory units" 
    ON public.inventory_units FOR ALL 
    USING (public.check_user_role(ARRAY['INVENTORY_MANAGER', 'SUPER_ADMIN']::user_role[]));

-- 9.6 Orders Policies
CREATE POLICY "Customers can view their own orders" 
    ON public.orders FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Customers can insert their own orders" 
    ON public.orders FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view all orders" 
    ON public.orders FOR SELECT 
    USING (public.check_user_role(ARRAY['SUPPORT_STAFF', 'INVENTORY_MANAGER', 'SUPER_ADMIN']::user_role[]));

CREATE POLICY "Staff can update orders" 
    ON public.orders FOR UPDATE 
    USING (public.check_user_role(ARRAY['SUPPORT_STAFF', 'INVENTORY_MANAGER', 'SUPER_ADMIN']::user_role[]));

-- 9.7 Order Items Policies
CREATE POLICY "Customers can view their own order items" 
    ON public.order_items FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
              AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Staff can view all order items" 
    ON public.order_items FOR SELECT 
    USING (public.check_user_role(ARRAY['SUPPORT_STAFF', 'INVENTORY_MANAGER', 'SUPER_ADMIN']::user_role[]));

CREATE POLICY "Staff can manage order items" 
    ON public.order_items FOR ALL 
    USING (public.check_user_role(ARRAY['INVENTORY_MANAGER', 'SUPER_ADMIN']::user_role[]));

-- 10. SUPABASE STORAGE BUCKETS & POLICIES
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('watch-media', 'watch-media', true),
    ('watch-documents', 'watch-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Public can read watch-media (Product photos, 4K zooms, 360 frames)
CREATE POLICY "Public Access for Watch Media"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'watch-media');

-- Staff can upload and manage watch-media
CREATE POLICY "Staff Upload Watch Media"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'watch-media' 
        AND public.check_user_role(ARRAY['INVENTORY_MANAGER', 'SUPER_ADMIN']::user_role[])
    );

CREATE POLICY "Staff Manage Watch Media"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'watch-media' 
        AND public.check_user_role(ARRAY['INVENTORY_MANAGER', 'SUPER_ADMIN']::user_role[])
    );

-- Private documents access (Certificates of Authenticity & Invoices)
CREATE POLICY "Users Read Own Documents"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'watch-documents' 
        AND (auth.uid())::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Staff Access All Documents"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'watch-documents' 
        AND public.check_user_role(ARRAY['SUPPORT_STAFF', 'INVENTORY_MANAGER', 'SUPER_ADMIN']::user_role[])
    );

-- 11. SUPABASE REALTIME CONFIGURATION
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_units;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

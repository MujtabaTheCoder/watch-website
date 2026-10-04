-- ============================================================================
-- VELLORE — "Time, Refined."
-- Master Supabase Database Migration
-- Production-Grade E-Commerce Schema for High Traffic & Concurrency
-- Tables: products, orders, order_items, settings, admins
-- Atomic RPC: create_order (with row-locks & idempotency)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. ADMINS TABLE & IS_ADMIN FUNCTION
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        auth.uid() IN (SELECT id FROM public.admins)
        OR (auth.jwt() ->> 'role') = 'service_role'
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL,
    discount_price NUMERIC,
    category TEXT NOT NULL,
    images TEXT[] NOT NULL DEFAULT '{}',
    specs JSONB NOT NULL DEFAULT '{}'::jsonb,
    model_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    stock INTEGER NOT NULL DEFAULT 10,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    idempotency_key TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    notes TEXT,
    payment_method TEXT NOT NULL DEFAULT 'COD',
    status TEXT NOT NULL DEFAULT 'Pending',
    subtotal NUMERIC NOT NULL,
    delivery_fee NUMERIC NOT NULL DEFAULT 0,
    total NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    name_snapshot TEXT NOT NULL,
    price_snapshot NUMERIC NOT NULL,
    quantity INTEGER NOT NULL,
    image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ORDER NUMBER SEQUENCE
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1001;

-- 7. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_created ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON public.products USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_idempotency ON public.orders(idempotency_key);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- 8. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Products RLS: Anyone can view, only admins can modify
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL USING (public.is_admin());

-- Orders RLS: Privacy enforced. Only admins can read/update orders.
-- Customers insert orders exclusively via the create_order RPC (SECURITY DEFINER).
DROP POLICY IF EXISTS "Admins can view orders" ON public.orders;
CREATE POLICY "Admins can view orders" ON public.orders
    FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders" ON public.orders
    FOR UPDATE USING (public.is_admin());

-- Order Items RLS: Only admins can view
DROP POLICY IF EXISTS "Admins can view order items" ON public.order_items;
CREATE POLICY "Admins can view order items" ON public.order_items
    FOR SELECT USING (public.is_admin());

-- Settings RLS: Public read, Admin write
DROP POLICY IF EXISTS "Public can view settings" ON public.settings;
CREATE POLICY "Public can view settings" ON public.settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;
CREATE POLICY "Admins can manage settings" ON public.settings
    FOR ALL USING (public.is_admin());

-- Admins table RLS: Admin only
DROP POLICY IF EXISTS "Admins can view admins" ON public.admins;
CREATE POLICY "Admins can view admins" ON public.admins
    FOR ALL USING (public.is_admin());

-- 9. ATOMIC ORDER CREATION RPC (IDEMPOTENCY + ROW LEVEL LOCKING)
CREATE OR REPLACE FUNCTION public.create_order(
    p_customer_name TEXT,
    p_phone TEXT,
    p_city TEXT,
    p_address TEXT,
    p_notes TEXT,
    p_payment_method TEXT,
    p_idempotency_key TEXT,
    p_items JSONB
)
RETURNS JSONB AS $$
DECLARE
    v_order_id UUID;
    v_order_number TEXT;
    v_item RECORD;
    v_prod RECORD;
    v_subtotal NUMERIC := 0;
    v_item_price NUMERIC := 0;
    v_delivery_fee NUMERIC := 250;
    v_total NUMERIC := 0;
    v_existing_order RECORD;
BEGIN
    -- 1. Idempotency Check: Return existing order if already processed
    SELECT id, order_number, total INTO v_existing_order
    FROM public.orders
    WHERE idempotency_key = p_idempotency_key;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', true,
            'order_id', v_existing_order.id,
            'order_number', v_existing_order.order_number,
            'total', v_existing_order.total,
            'is_duplicate', true
        );
    END IF;

    -- 2. Validate Items
    IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Order must contain at least one item.';
    END IF;

    -- 3. Row-level Lock on Products & Deduct Stock Atomically
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        product_id UUID,
        quantity INT
    )
    LOOP
        IF v_item.quantity <= 0 THEN
            RAISE EXCEPTION 'Invalid item quantity: %', v_item.quantity;
        END IF;

        -- Lock the row to prevent race conditions during traffic spikes
        SELECT id, name, price, discount_price, stock, images
        INTO v_prod
        FROM public.products
        WHERE id = v_item.product_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product with ID % not found.', v_item.product_id;
        END IF;

        IF v_prod.stock < v_item.quantity THEN
            RAISE EXCEPTION 'OUT_OF_STOCK: % (Available: %)', v_prod.name, v_prod.stock;
        END IF;

        -- Atomically update inventory
        UPDATE public.products
        SET stock = stock - v_item.quantity,
            updated_at = NOW()
        WHERE id = v_item.product_id;

        -- Recalculate price on server (never trust client amounts)
        v_item_price := COALESCE(v_prod.discount_price, v_prod.price);
        v_subtotal := v_subtotal + (v_item_price * v_item.quantity);
    END LOOP;

    -- 4. Calculate Delivery Charges
    IF v_subtotal >= 15000 THEN
        v_delivery_fee := 0;
    ELSE
        v_delivery_fee := 250;
    END IF;
    v_total := v_subtotal + v_delivery_fee;

    -- 5. Human-readable Sequential Order Number
    v_order_number := 'VL-' || lpad(nextval('order_number_seq')::text, 4, '0');

    -- 6. Insert Order
    INSERT INTO public.orders (
        order_number,
        idempotency_key,
        customer_name,
        phone,
        city,
        address,
        notes,
        payment_method,
        status,
        subtotal,
        delivery_fee,
        total
    ) VALUES (
        v_order_number,
        p_idempotency_key,
        p_customer_name,
        p_phone,
        p_city,
        p_address,
        p_notes,
        COALESCE(p_payment_method, 'COD'),
        'Pending',
        v_subtotal,
        v_delivery_fee,
        v_total
    ) RETURNING id INTO v_order_id;

    -- 7. Insert Order Items Snapshots
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        product_id UUID,
        quantity INT
    )
    LOOP
        SELECT name, price, discount_price, images INTO v_prod
        FROM public.products
        WHERE id = v_item.product_id;

        v_item_price := COALESCE(v_prod.discount_price, v_prod.price);

        INSERT INTO public.order_items (
            order_id,
            product_id,
            name_snapshot,
            price_snapshot,
            quantity,
            image
        ) VALUES (
            v_order_id,
            v_item.product_id,
            v_prod.name,
            v_item_price,
            v_item.quantity,
            COALESCE(v_prod.images[1], '')
        );
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'order_number', v_order_number,
        'total', v_total,
        'is_duplicate', false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. REALTIME PUBLICATION
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 11. ADMIN DASHBOARD STATS VIEW
CREATE OR REPLACE VIEW public.admin_dashboard_stats AS
SELECT
    COUNT(*) AS total_orders,
    COUNT(*) FILTER (WHERE status = 'Pending') AS pending_orders,
    COUNT(*) FILTER (WHERE status = 'Confirmed') AS confirmed_orders,
    COUNT(*) FILTER (WHERE status = 'Shipped') AS shipped_orders,
    COUNT(*) FILTER (WHERE status = 'Delivered') AS delivered_orders,
    COUNT(*) FILTER (WHERE status = 'Cancelled') AS cancelled_orders,
    COALESCE(SUM(total) FILTER (WHERE status != 'Cancelled'), 0) AS total_revenue,
    COUNT(*) FILTER (WHERE created_at >= date_trunc('day', now())) AS today_orders,
    COALESCE(SUM(total) FILTER (WHERE created_at >= date_trunc('day', now()) AND status != 'Cancelled'), 0) AS today_revenue
FROM public.orders;

-- 12. INITIAL SETTINGS
INSERT INTO public.settings (key, value) VALUES
    ('store_name', 'VELLORE'),
    ('tagline', 'Time, Refined.'),
    ('whatsapp_number', '+923001234567'),
    ('standard_delivery_fee', '250'),
    ('free_delivery_threshold', '15000'),
    ('support_email', 'concierge@vellore.pk'),
    ('support_phone', '+923001234567')
ON CONFLICT (key) DO NOTHING;

-- 13. STORAGE BUCKET CONFIGURATION (Idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Read Product Images" ON storage.objects;
CREATE POLICY "Public Read Product Images" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admins Insert Product Images" ON storage.objects;
CREATE POLICY "Admins Insert Product Images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins Update Product Images" ON storage.objects;
CREATE POLICY "Admins Update Product Images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins Delete Product Images" ON storage.objects;
CREATE POLICY "Admins Delete Product Images" ON storage.objects
    FOR DELETE USING (bucket_id = 'product-images' AND public.is_admin());

-- 14. API PERMISSIONS
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

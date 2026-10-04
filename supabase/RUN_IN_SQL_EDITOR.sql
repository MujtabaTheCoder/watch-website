-- ============================================================================
-- VELLORE — COMPLETE DATABASE INITIALIZATION (SCHEMA + RLS + RPC + SEED)
-- Paste this entire file into your Supabase Dashboard -> SQL Editor and click RUN.
-- Safe to re-run multiple times (Fully Idempotent).
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. ADMINS TABLE & IS_ADMIN FUNCTION
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

-- 3. PRODUCTS TABLE
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

-- 4. ORDERS TABLE
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

-- 5. ORDER ITEMS TABLE
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

-- 6. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ORDER NUMBER SEQUENCE
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1001;

-- 8. INDEXES
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_created ON public.products(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_idempotency ON public.orders(idempotency_key);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- 9. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view orders" ON public.orders;
CREATE POLICY "Admins can view orders" ON public.orders
    FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders" ON public.orders
    FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view order items" ON public.order_items;
CREATE POLICY "Admins can view order items" ON public.order_items
    FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Public can view settings" ON public.settings;
CREATE POLICY "Public can view settings" ON public.settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;
CREATE POLICY "Admins can manage settings" ON public.settings
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view admins" ON public.admins;
CREATE POLICY "Admins can view admins" ON public.admins
    FOR ALL USING (public.is_admin());

-- 10. ATOMIC ORDER CREATION RPC
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

    IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Order must contain at least one item.';
    END IF;

    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        product_id UUID,
        quantity INT
    )
    LOOP
        IF v_item.quantity <= 0 THEN
            RAISE EXCEPTION 'Invalid item quantity: %', v_item.quantity;
        END IF;

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

        UPDATE public.products
        SET stock = stock - v_item.quantity,
            updated_at = NOW()
        WHERE id = v_item.product_id;

        v_item_price := COALESCE(v_prod.discount_price, v_prod.price);
        v_subtotal := v_subtotal + (v_item_price * v_item.quantity);
    END LOOP;

    IF v_subtotal >= 15000 THEN
        v_delivery_fee := 0;
    ELSE
        v_delivery_fee := 250;
    END IF;
    v_total := v_subtotal + v_delivery_fee;

    v_order_number := 'VL-' || lpad(nextval('order_number_seq')::text, 4, '0');

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

-- 11. REALTIME & VIEWS
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

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

-- 12. DEFAULT SETTINGS
INSERT INTO public.settings (key, value) VALUES
    ('store_name', 'VELLORE'),
    ('tagline', 'Time, Refined.'),
    ('whatsapp_number', '+923001234567'),
    ('standard_delivery_fee', '250'),
    ('free_delivery_threshold', '15000'),
    ('support_email', 'concierge@vellore.pk'),
    ('support_phone', '+923001234567')
ON CONFLICT (key) DO NOTHING;

-- 13. SEED 12 LUXURY WATCHES (ZERO DEMO ORDERS)
INSERT INTO public.products (
    id, name, slug, description, price, discount_price, category, images, specs, model_config, stock, featured
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'VELLORE Sovereign Chronograph',
    'vellore-sovereign-chronograph',
    'Forged from surgical-grade 316L stainless steel with champagne gold accents. The Sovereign Chronograph embodies understated authority, featuring precision sub-dials, a ceramic tachymeter bezel, and a sunburst obsidian dial.',
    28500,
    24900,
    'Luxury',
    ARRAY[
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'
    ],
    '{"case_size": "41mm", "movement": "Precision Mecha-Quartz Chronograph", "strap": "Hand-stitched Tuscan Full-Grain Leather (Espresso)", "water_resistance": "5 ATM (50 Meters)", "glass": "Double-Domed Sapphire Crystal with Anti-Reflective Coating", "warranty": "2 Years Official International Warranty"}'::jsonb,
    '{"case_color": "#C6A15B", "dial_color": "#0B0B0F", "strap_color": "#2C1810", "accents": "#C6A15B"}'::jsonb,
    14,
    true
),
(
    '00000000-0000-0000-0000-000000000002',
    'VELLORE Nocturne Minimalist',
    'vellore-nocturne-minimalist',
    'A study in quiet luxury. Ultra-slim profile measuring merely 6.8mm, featuring an austere matte midnight dial devoid of unnecessary clutter, encased in brushed titanium PVD.',
    16500,
    14500,
    'Minimalist',
    ARRAY[
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80',
        'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80'
    ],
    '{"case_size": "39mm", "movement": "Miyota Slim Quartz Calibre", "strap": "Milanese Mesh in Matte Graphite", "water_resistance": "3 ATM (30 Meters)", "glass": "Scratch-Resistant Sapphire Crystal", "warranty": "2 Years Official International Warranty"}'::jsonb,
    '{"case_color": "#202026", "dial_color": "#111116", "strap_color": "#1A1A20", "accents": "#A0A0A5"}'::jsonb,
    22,
    true
),
(
    '00000000-0000-0000-0000-000000000003',
    'VELLORE Royal Marine Diver',
    'vellore-royal-marine-diver',
    'Engineered for oceanic depths and black-tie galas alike. Features a deep ocean blue ceramic unidirectional 120-click bezel, superluminova markers, and an oyster-link brushed steel bracelet.',
    22000,
    19500,
    'Sports',
    ARRAY[
        'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80',
        'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'
    ],
    '{"case_size": "42mm", "movement": "Calibre NH35 Automatic Self-Winding (41h Reserve)", "strap": "316L Solid Link Stainless Steel Bracelet", "water_resistance": "20 ATM (200 Meters)", "glass": "Flat Sapphire Crystal with Cyclops Date Magnifier", "warranty": "3 Years Official International Warranty"}'::jsonb,
    '{"case_color": "#C0C0C6", "dial_color": "#0F2848", "strap_color": "#A8A8B0", "accents": "#FFFFFF"}'::jsonb,
    8,
    true
),
(
    '00000000-0000-0000-0000-000000000004',
    'VELLORE Elysium Openwork',
    'vellore-elysium-openwork',
    'Architectural horology at its peak. The Elysium reveals its intricate mechanical heartbeat through a custom openworked skeleton dial, framed in high-sheen satin finish titanium.',
    38000,
    34500,
    'Luxury',
    ARRAY[
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80'
    ],
    '{"case_size": "41.5mm", "movement": "Custom Skeletonized Automatic Calibre 8N24", "strap": "Alligator-Grain Matte Black Italian Leather", "water_resistance": "5 ATM (50 Meters)", "glass": "Exhibition Double Sapphire Front & Caseback", "warranty": "3 Years Official International Warranty"}'::jsonb,
    '{"case_color": "#8A8D93", "dial_color": "#16161D", "strap_color": "#18181A", "accents": "#C6A15B"}'::jsonb,
    5,
    true
),
(
    '00000000-0000-0000-0000-000000000005',
    'VELLORE Heritage Classic',
    'vellore-heritage-classic',
    'A timeless tribute to vintage 1950s dress watches. Features a warm cream enamel dial, blued steel leaf hands, and an opulent 18K rose gold PVD case.',
    19500,
    17200,
    'Classic',
    ARRAY[
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',
        'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80'
    ],
    '{"case_size": "38mm", "movement": "Swiss Ronda 715 High-Precision Quartz", "strap": "Cognac Vintage Calfskin Leather with Quick-Release", "water_resistance": "5 ATM (50 Meters)", "glass": "Box-Domed Sapphire Crystal", "warranty": "2 Years Official International Warranty"}'::jsonb,
    '{"case_color": "#D4A373", "dial_color": "#F7F4EB", "strap_color": "#633B20", "accents": "#1E3A5F"}'::jsonb,
    18,
    false
),
(
    '00000000-0000-0000-0000-000000000006',
    'VELLORE Astral Moonphase',
    'vellore-astral-moonphase',
    'Capturing the celestial cycle on your wrist. The Astral Moonphase tracks the lunar orbit across a deep aventurine starfield dial, complemented by roman numeral indices.',
    32000,
    28900,
    'Luxury',
    ARRAY[
        'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80',
        'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80'
    ],
    '{"case_size": "40mm", "movement": "Miyota 6P24 Complication Moonphase", "strap": "Midnight Navy Hand-Finished Suede", "water_resistance": "5 ATM (50 Meters)", "glass": "Curved Anti-Scratch Sapphire", "warranty": "2 Years Official International Warranty"}'::jsonb,
    '{"case_color": "#D8D8E0", "dial_color": "#0B1528", "strap_color": "#121C30", "accents": "#C6A15B"}'::jsonb,
    9,
    true
),
(
    '00000000-0000-0000-0000-000000000007',
    'VELLORE Aurelia Petite',
    'vellore-aurelia-petite',
    'Exquisite grace crafted specifically for smaller wrists. An iridescent genuine white mother-of-pearl dial is framed by a fluted bezel in polished champagne gold.',
    18500,
    15900,
    'Women',
    ARRAY[
        'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80',
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80'
    ],
    '{"case_size": "32mm", "movement": "Swiss Ronda Calibre 762 Slimline", "strap": "Polished Five-Link Jubilee Bracelet in Champagne Gold", "water_resistance": "3 ATM (30 Meters)", "glass": "Scratch-Resistant Sapphire Crystal", "warranty": "2 Years Official International Warranty"}'::jsonb,
    '{"case_color": "#C6A15B", "dial_color": "#F3ECE1", "strap_color": "#C6A15B", "accents": "#C6A15B"}'::jsonb,
    15,
    true
),
(
    '00000000-0000-0000-0000-000000000008',
    'VELLORE Zenith Chrono Steel',
    'vellore-zenith-chrono-steel',
    'Industrial brilliance rendered in cold stainless steel. High-contrast reverse panda dial layout with tactile pump pushers and a matching brushed H-link bracelet.',
    25500,
    22800,
    'Sports',
    ARRAY[
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',
        'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80'
    ],
    '{"case_size": "42mm", "movement": "Seiko VK63 Meca-Quartz Chrono Movement", "strap": "Brushed & Polished 316L Stainless Steel Bracelet", "water_resistance": "10 ATM (100 Meters)", "glass": "Sapphire Crystal with Blue Anti-Reflective Tint", "warranty": "2 Years Official International Warranty"}'::jsonb,
    '{"case_color": "#B8BCC2", "dial_color": "#1C1D21", "strap_color": "#A0A4AC", "accents": "#E8E8EC"}'::jsonb,
    12,
    false
),
(
    '00000000-0000-0000-0000-000000000009',
    'VELLORE Eclipse Ceramic',
    'vellore-eclipse-ceramic',
    'Stealth sophistication in high-tech zirconium oxide ceramic. Lightweight, impervious to scratches, and cool against the wrist with a deep onyx monochrome look.',
    29000,
    25900,
    'Minimalist',
    ARRAY[
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80',
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80'
    ],
    '{"case_size": "40mm", "movement": "Swiss Quartz Ultra-Flat", "strap": "High-Density Vulcanized FKM Rubber in Obsidian", "water_resistance": "5 ATM (50 Meters)", "glass": "Anti-Glare Double Sapphire Crystal", "warranty": "2 Years Official International Warranty"}'::jsonb,
    '{"case_color": "#141418", "dial_color": "#0E0E12", "strap_color": "#101014", "accents": "#4A4D57"}'::jsonb,
    7,
    false
),
(
    '00000000-0000-0000-0000-000000000010',
    'VELLORE Seraphina Rose',
    'vellore-seraphina-rose',
    'A radiant celebration of feminine elegance. Features a warm rose-gold case, a powder-blush sunray dial with crystal hour indices, and an ultra-soft Milanese strap.',
    17500,
    15200,
    'Women',
    ARRAY[
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80',
        'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80'
    ],
    '{"case_size": "34mm", "movement": "Japanese Citizen Miyota Quartz", "strap": "Magnetic Mesh Strap in Polished Rose Gold", "water_resistance": "3 ATM (30 Meters)", "glass": "Mineral Hardlex Crystal with Sapphire Coating", "warranty": "2 Years Official International Warranty"}'::jsonb,
    '{"case_color": "#E0A899", "dial_color": "#EED8D2", "strap_color": "#DCA092", "accents": "#E0A899"}'::jsonb,
    11,
    false
),
(
    '00000000-0000-0000-0000-000000000011',
    'VELLORE Grand Heritage Emerald',
    'vellore-grand-heritage-emerald',
    'A commanding presence combining British racing emerald green with 18K yellow gold ion plating. Features a coin-edge bezel and gold applied indices.',
    21500,
    18800,
    'Classic',
    ARRAY[
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',
        'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80',
        'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80'
    ],
    '{"case_size": "40mm", "movement": "Automatic Self-Winding Movement with Date Display", "strap": "Saddle Brown Crazy Horse Leather with Contrast Stitch", "water_resistance": "5 ATM (50 Meters)", "glass": "Sapphire-Coated Crystal", "warranty": "2 Years Official International Warranty"}'::jsonb,
    '{"case_color": "#D4AF37", "dial_color": "#0B2E1D", "strap_color": "#4A2E18", "accents": "#D4AF37"}'::jsonb,
    16,
    false
),
(
    '00000000-0000-0000-0000-000000000012',
    'VELLORE Vanguard Stealth',
    'vellore-vanguard-stealth',
    'Built for dynamic lifestyles and tactical precision. Matte charcoal case, high-luminescence numerals, and an ultra-durable NATO sailcloth strap designed for endurance.',
    15500,
    13200,
    'Sports',
    ARRAY[
        'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'
    ],
    '{"case_size": "43mm", "movement": "High-Shock Resistance Quartz Chronograph", "strap": "Ballistic NATO Cordura Strap in Slate Gray", "water_resistance": "10 ATM (100 Meters)", "glass": "Military-Grade Hardened Sapphire Crystal", "warranty": "2 Years Official International Warranty"}'::jsonb,
    '{"case_color": "#2A2D34", "dial_color": "#181A1F", "strap_color": "#3D414D", "accents": "#C6A15B"}'::jsonb,
    20,
    false
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    discount_price = EXCLUDED.discount_price,
    category = EXCLUDED.category,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    model_config = EXCLUDED.model_config,
    stock = EXCLUDED.stock,
    featured = EXCLUDED.featured,
    updated_at = NOW();

-- End of complete database setup

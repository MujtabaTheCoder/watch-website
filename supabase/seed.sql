-- ============================================================================
-- VELLORE — SEED DATA (12 Watches across Men, Women, Unisex)
-- Strict Compliance: NO demo orders, NO fake reviews, NO fake stats.
-- Authentic product details, specs, and procedural 3D model configurations.
-- ============================================================================

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
    '{
        "case_size": "41mm",
        "movement": "Precision Mecha-Quartz Chronograph",
        "strap": "Hand-stitched Tuscan Full-Grain Leather (Espresso)",
        "water_resistance": "5 ATM (50 Meters)",
        "glass": "Double-Domed Sapphire Crystal with Anti-Reflective Coating",
        "warranty": "2 Years Official International Warranty"
    }'::jsonb,
    '{
        "case_color": "#C6A15B",
        "dial_color": "#0B0B0F",
        "strap_color": "#2C1810",
        "accents": "#C6A15B"
    }'::jsonb,
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
    '{
        "case_size": "39mm",
        "movement": "Miyota Slim Quartz Calibre",
        "strap": "Milanese Mesh in Matte Graphite",
        "water_resistance": "3 ATM (30 Meters)",
        "glass": "Scratch-Resistant Sapphire Crystal",
        "warranty": "2 Years Official International Warranty"
    }'::jsonb,
    '{
        "case_color": "#202026",
        "dial_color": "#111116",
        "strap_color": "#1A1A20",
        "accents": "#A0A0A5"
    }'::jsonb,
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
    '{
        "case_size": "42mm",
        "movement": "Calibre NH35 Automatic Self-Winding (41h Reserve)",
        "strap": "316L Solid Link Stainless Steel Bracelet",
        "water_resistance": "20 ATM (200 Meters)",
        "glass": "Flat Sapphire Crystal with Cyclops Date Magnifier",
        "warranty": "3 Years Official International Warranty"
    }'::jsonb,
    '{
        "case_color": "#C0C0C6",
        "dial_color": "#0F2848",
        "strap_color": "#A8A8B0",
        "accents": "#FFFFFF"
    }'::jsonb,
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
    '{
        "case_size": "41.5mm",
        "movement": "Custom Skeletonized Automatic Calibre 8N24",
        "strap": "Alligator-Grain Matte Black Italian Leather",
        "water_resistance": "5 ATM (50 Meters)",
        "glass": "Exhibition Double Sapphire Front & Caseback",
        "warranty": "3 Years Official International Warranty"
    }'::jsonb,
    '{
        "case_color": "#8A8D93",
        "dial_color": "#16161D",
        "strap_color": "#18181A",
        "accents": "#C6A15B"
    }'::jsonb,
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
    '{
        "case_size": "38mm",
        "movement": "Swiss Ronda 715 High-Precision Quartz",
        "strap": "Cognac Vintage Calfskin Leather with Quick-Release",
        "water_resistance": "5 ATM (50 Meters)",
        "glass": "Box-Domed Sapphire Crystal",
        "warranty": "2 Years Official International Warranty"
    }'::jsonb,
    '{
        "case_color": "#D4A373",
        "dial_color": "#F7F4EB",
        "strap_color": "#633B20",
        "accents": "#1E3A5F"
    }'::jsonb,
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
    '{
        "case_size": "40mm",
        "movement": "Miyota 6P24 Complication Moonphase",
        "strap": "Midnight Navy Hand-Finished Suede",
        "water_resistance": "5 ATM (50 Meters)",
        "glass": "Curved Anti-Scratch Sapphire",
        "warranty": "2 Years Official International Warranty"
    }'::jsonb,
    '{
        "case_color": "#D8D8E0",
        "dial_color": "#0B1528",
        "strap_color": "#121C30",
        "accents": "#C6A15B"
    }'::jsonb,
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
    '{
        "case_size": "32mm",
        "movement": "Swiss Ronda Calibre 762 Slimline",
        "strap": "Polished Five-Link Jubilee Bracelet in Champagne Gold",
        "water_resistance": "3 ATM (30 Meters)",
        "glass": "Scratch-Resistant Sapphire Crystal",
        "warranty": "2 Years Official International Warranty"
    }'::jsonb,
    '{
        "case_color": "#C6A15B",
        "dial_color": "#F3ECE1",
        "strap_color": "#C6A15B",
        "accents": "#C6A15B"
    }'::jsonb,
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
    '{
        "case_size": "42mm",
        "movement": "Seiko VK63 Meca-Quartz Chrono Movement",
        "strap": "Brushed & Polished 316L Stainless Steel Bracelet",
        "water_resistance": "10 ATM (100 Meters)",
        "glass": "Sapphire Crystal with Blue Anti-Reflective Tint",
        "warranty": "2 Years Official International Warranty"
    }'::jsonb,
    '{
        "case_color": "#B8BCC2",
        "dial_color": "#1C1D21",
        "strap_color": "#A0A4AC",
        "accents": "#E8E8EC"
    }'::jsonb,
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
    '{
        "case_size": "40mm",
        "movement": "Swiss Quartz Ultra-Flat",
        "strap": "High-Density Vulcanized FKM Rubber in Obsidian",
        "water_resistance": "5 ATM (50 Meters)",
        "glass": "Anti-Glare Double Sapphire Crystal",
        "warranty": "2 Years Official International Warranty"
    }'::jsonb,
    '{
        "case_color": "#141418",
        "dial_color": "#0E0E12",
        "strap_color": "#101014",
        "accents": "#4A4D57"
    }'::jsonb,
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
    '{
        "case_size": "34mm",
        "movement": "Japanese Citizen Miyota Quartz",
        "strap": "Magnetic Mesh Strap in Polished Rose Gold",
        "water_resistance": "3 ATM (30 Meters)",
        "glass": "Mineral Hardlex Crystal with Sapphire Coating",
        "warranty": "2 Years Official International Warranty"
    }'::jsonb,
    '{
        "case_color": "#E0A899",
        "dial_color": "#EED8D2",
        "strap_color": "#DCA092",
        "accents": "#E0A899"
    }'::jsonb,
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
    '{
        "case_size": "40mm",
        "movement": "Automatic Self-Winding Movement with Date Display",
        "strap": "Saddle Brown Crazy Horse Leather with Contrast Stitch",
        "water_resistance": "5 ATM (50 Meters)",
        "glass": "Sapphire-Coated Crystal",
        "warranty": "2 Years Official International Warranty"
    }'::jsonb,
    '{
        "case_color": "#D4AF37",
        "dial_color": "#0B2E1D",
        "strap_color": "#4A2E18",
        "accents": "#D4AF37"
    }'::jsonb,
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
    '{
        "case_size": "43mm",
        "movement": "High-Shock Resistance Quartz Chronograph",
        "strap": "Ballistic NATO Cordura Strap in Slate Gray",
        "water_resistance": "10 ATM (100 Meters)",
        "glass": "Military-Grade Hardened Sapphire Crystal",
        "warranty": "2 Years Official International Warranty"
    }'::jsonb,
    '{
        "case_color": "#2A2D34",
        "dial_color": "#181A1F",
        "strap_color": "#3D414D",
        "accents": "#C6A15B"
    }'::jsonb,
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

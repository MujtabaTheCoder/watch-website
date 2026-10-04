export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: "Horology Guide" | "Style & Etiquette" | "Care & Maintenance" | "Materials & Craft" | "Gifting";
  readTime: string;
  publishedAt: string;
  excerpt: string;
  coverImage: string;
  author: {
    name: string;
    role: string;
  };
  content: {
    lead: string;
    sections: {
      heading: string;
      body: string[];
    }[];
    relatedProductSlug?: string;
  };
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-01",
    slug: "how-to-choose-dial-size",
    title: "How to Choose the Ideal Dial Size for Your Wrist",
    category: "Horology Guide",
    readTime: "4 min read",
    publishedAt: "October 2026",
    excerpt:
      "From 36mm dress classics to 42mm sports chronographs, discover how lug-to-lug proportions and wrist geometry determine the perfect fit.",
    coverImage: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1000&q=80",
    author: {
      name: "Tariq Horology Advisory",
      role: "Lead Watchmaker",
    },
    content: {
      lead:
        "One of the most frequent questions we receive at VELLORE is: 'Will this watch look too big or too small on my wrist?' Wrist presence is not simply about case diameter; it is an interplay of lug-to-lug length, case thickness, and dial opening.",
      sections: [
        {
          heading: "1. The Golden Lug-to-Lug Rule",
          body: [
            "While most buyers look strictly at the stated diameter (e.g. 40mm or 42mm), the true determinant of whether a watch overhangs your wrist is the 'lug-to-lug' measurement. The lugs should never extend beyond the flat plane of your wrist.",
            "For wrist circumferences between 6.0 and 6.75 inches, watches between 36mm and 39mm (such as the VELLORE Noir Meridian or Seraphine Rose) provide a tailored, timeless silhouette that tucks neatly under a shirt cuff.",
            "For wrists 7.0 inches and above, 40mm to 43mm cases (such as the Aurelian Classic or Vanta Chrono) sit with commanding authority without appearing oversized.",
          ],
        },
        {
          heading: "2. The Visual Impact of the Bezel",
          body: [
            "A watch with an ultra-thin bezel will visually appear larger because the dial extends almost to the edge of the crystal. Conversely, sports watches with wider dive or tachymeter bezels wear smaller and more compact than their dimensions suggest.",
            "If you prefer a clean, expansive dial look, the ultra-slim Silvermist Slim wears with a luminous presence despite its restrained 38mm profile.",
          ],
        },
        {
          heading: "3. Quick Measuring Tip at Home",
          body: [
            "Take a flexible measuring tape or wrap a strip of paper around your wrist right behind the wrist bone. Mark the point of overlap and measure with a ruler. If your wrist is under 17cm (6.7 in), opt for 36mm–40mm. Above 17cm, 40mm–43mm will fit naturally.",
          ],
        },
      ],
      relatedProductSlug: "aurelian-classic",
    },
  },
  {
    id: "blog-02",
    slug: "automatic-vs-quartz-movement-guide",
    title: "Automatic vs Quartz: Which Movement Fits Your Lifestyle?",
    category: "Horology Guide",
    readTime: "5 min read",
    publishedAt: "September 2026",
    excerpt:
      "A mechanical balance wheel that lives and breathes on your wrist, or high-frequency quartz calibrated to seconds per month? Here is how to decide.",
    coverImage: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=1000&q=80",
    author: {
      name: "VELLORE Technical Desk",
      role: "Horological Engineering",
    },
    content: {
      lead:
        "The movement—or calibre—is the beating heart of every timepiece. While collectors often celebrate the romantic poetry of mechanical gears, modern quartz delivers peerless daily reliability.",
      sections: [
        {
          heading: "1. The Soul of Automatic Mechanicals",
          body: [
            "An automatic watch contains a weighted rotor that spins with the natural motion of your wrist, winding a coiled mainspring. The sweeping seconds hand glides across the dial with hypnotic fluidity.",
            "Automatic timepieces require no battery replacements. As long as you wear them, they run perpetually. They represent centuries of miniature micro-mechanics and craftsmanship.",
          ],
        },
        {
          heading: "2. The Precision and Ease of Quartz",
          body: [
            "Quartz movements rely on a tiny synthetic quartz crystal vibrating at 32,768 hertz when stimulated by an electric current. This delivers pinpoint accuracy—often within +/- 15 seconds per month.",
            "For busy professionals who want a 'grab-and-go' watch that is always set to the exact second without winding or date resets on Monday morning, a high-grade quartz calibre is ideal.",
          ],
        },
        {
          heading: "3. Which Should You Pick?",
          body: [
            "If you cherish mechanical craftsmanship, pick automatic models like our Tidewave Diver. If you value ultra-thin profiles under 7mm and zero-maintenance precision, our Noir Meridian and Silvermist Slim are the ultimate companions.",
          ],
        },
      ],
      relatedProductSlug: "vanta-chrono",
    },
  },
  {
    id: "blog-03",
    slug: "wedding-and-formal-watch-styling-guide",
    title: "Wedding & Black-Tie Horology: Styling in Pakistan",
    category: "Style & Etiquette",
    readTime: "4 min read",
    publishedAt: "September 2026",
    excerpt:
      "How to pair rose-gold and leather timepieces with bespoke sherwanis, prince coats, and three-piece dinner suits for Pakistan's festive season.",
    coverImage: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1000&q=80",
    author: {
      name: "S. Farooq",
      role: "Style Director",
    },
    content: {
      lead:
        "Pakistani weddings and formal evening galas demand sartorial harmony. While heavily embellished formalwear commands attention, a discreet, well-chosen watch provides the decisive mark of refinement.",
      sections: [
        {
          heading: "1. Metal Tones & Embroidery",
          body: [
            "When wearing traditional ivory, cream, or gold-accented sherwanis, a warm gold or rose-gold timepiece like the Aurelian Classic creates an exquisite tonal complement.",
            "If your dinner suit features silver cufflinks, mother-of-pearl shirt studs, or cool-grey suiting fabrics, pair with brushed 316L stainless steel or polished silver cases.",
          ],
        },
        {
          heading: "2. Leather Strap vs Steel Bracelet",
          body: [
            "For Barat and Valima evening receptions, a genuine black or deep espresso calfskin strap exudes timeless formality. Match your leather strap color with your shoes and belt.",
            "Milanese mesh and link bracelets offer versatility, transitioning seamlessly from morning corporate presentations to late-night festive banquets.",
          ],
        },
      ],
      relatedProductSlug: "aurelian-classic",
    },
  },
  {
    id: "blog-04",
    slug: "caring-for-leather-watch-straps",
    title: "Caring for Genuine Leather Straps in Warm Climates",
    category: "Care & Maintenance",
    readTime: "3 min read",
    publishedAt: "August 2026",
    excerpt:
      "Humidity, perspiration, and sunlight can wear fine calfskin leather. Simple daily practices to preserve the suppleness and longevity of your strap.",
    coverImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&q=80",
    author: {
      name: "Atelier Care Team",
      role: "Leather Specialist",
    },
    content: {
      lead:
        "Full-grain and top-grain calfskin leather straps develop a rich patina over time. However, South Asian heat and humidity require mindful care to prevent premature wear.",
      sections: [
        {
          heading: "1. The 24-Hour Rest Period",
          body: [
            "Leather needs time to breathe. Avoid wearing the same leather watch on consecutive days during hot summer months. Rotating between a leather strap and a steel bracelet allows trapped moisture to evaporate naturally.",
          ],
        },
        {
          heading: "2. Gentle Wipe-Down Routine",
          body: [
            "At the end of the day, use a dry micro-fiber cloth to gently wipe the inner lining of the strap. Never use harsh chemical cleaners, alcohol rubs, or excessive water.",
            "Store your watch in its presentation box away from direct sunlight, which can dry out leather oils and cause micro-cracking.",
          ],
        },
      ],
      relatedProductSlug: "oakline-field",
    },
  },
  {
    id: "blog-05",
    slug: "why-sapphire-crystal-matters",
    title: "Why Sapphire Crystal is Essential for Every Luxury Watch",
    category: "Materials & Craft",
    readTime: "3 min read",
    publishedAt: "August 2026",
    excerpt:
      "Ranking 9 on the Mohs mineral hardness scale, synthetic sapphire is virtually scratch-proof against keys, zippers, and daily desk friction.",
    coverImage: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=1000&q=80",
    author: {
      name: "Material Research Lab",
      role: "Engineering",
    },
    content: {
      lead:
        "A watch can have the finest dial in the world, but if the crystal becomes scratched within months of daily wear, the entire timepiece loses its luster. This is why VELLORE specifies sapphire crystal.",
      sections: [
        {
          heading: "1. Sapphire vs Mineral Glass vs Acrylic",
          body: [
            "Standard high-street watches frequently use cheap mineral glass or acrylic plastic, both of which scratch easily from casual contact with car keys, door handles, or desk surfaces.",
            "Synthetic sapphire is created by crystallizing aluminum oxide at over 2,000°C. Only a diamond or another sapphire can scratch it.",
          ],
        },
        {
          heading: "2. Anti-Reflective Clarity",
          body: [
            "VELLORE treats each sapphire crystal with double anti-reflective coatings. This eliminates harsh glare under direct Pakistani sunlight, allowing the dial texture and hands to be legible from any viewing angle.",
          ],
        },
      ],
      relatedProductSlug: "vanta-chrono",
    },
  },
  {
    id: "blog-06",
    slug: "the-art-of-watch-gifting-milestones",
    title: "The Art of Watch Gifting: Marking Life's Milestones",
    category: "Gifting",
    readTime: "4 min read",
    publishedAt: "July 2026",
    excerpt:
      "From graduations to milestone anniversaries, a timepiece is the only luxury accessory that counts the seconds of memories yet to come.",
    coverImage: "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=1000&q=80",
    author: {
      name: "VELLORE Concierge",
      role: "Client Relations",
    },
    content: {
      lead:
        "Jewelry is decorative, but a fine watch is both functional and sentimental. When you gift a watch, you are gifting time itself.",
      sections: [
        {
          heading: "1. For Him and For Her: Matched Pairs",
          body: [
            "Anniversaries and wedding gifts are best marked with harmonized pairs. The VELLORE Eclipse Pair features dual his-and-hers timepieces presented together in a velvet-lined gift case.",
          ],
        },
        {
          heading: "2. Unboxing Experience",
          body: [
            "Every VELLORE watch arrives gift-ready: a rigid matte presentation box, textured cushion, warranty registration certificate, and care card. No extra gift-wrapping needed.",
          ],
        },
      ],
      relatedProductSlug: "eclipse-pair",
    },
  },
];

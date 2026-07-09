export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string | number;
  slug: string;
  name: string;
  description: string;
  price?: string;
  oldPrice?: string | null;
  estValue?: string;
  lookingFor?: string;
  rating: number;
  reviewsCount: number;
  images: string[];
  tag?: string | null;
  tagType?: 'sale' | 'new' | 'condition' | 'wanted' | string | null;
  variant: 'shop' | 'swap';
  specs: ProductSpec[];
}

export const products: Product[] = [
  // --- SHOP PRODUCTS (12 items) ---
  {
    id: "s1",
    slug: "visionary-vr-headset-pro",
    name: "Visionary VR Headset Pro",
    description: "Experience the next level of immersive digital environments with the Visionary VR Headset Pro. Engineered with ultra-low latency tracking, custom OLED displays, and a breathtaking 120Hz refresh rate.",
    price: "$499.00",
    rating: 4.8,
    reviewsCount: 124,
    images: [
      "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1622979136979-99bbccb28859?q=80&w=800&auto=format&fit=crop"
    ],
    tag: "Trending",
    tagType: "sale",
    variant: "shop",
    specs: [
      { label: "Display", value: "Dual Custom OLED" },
      { label: "Refresh Rate", value: "120Hz" },
      { label: "Field of View", value: "110 degrees" }
    ]
  },
  {
    id: "s2",
    slug: "pro-smartphone-15",
    name: "Pro Smartphone 15",
    description: "The ultimate flagship device featuring a titanium chassis, cutting-edge AI processing, and a revolutionary triple-lens camera system.",
    price: "$999.00",
    oldPrice: "$1099.00",
    rating: 4.9,
    reviewsCount: 842,
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1592899677974-c466c4f1c9bb?q=80&w=800&auto=format&fit=crop"
    ],
    tag: "Sale",
    tagType: "sale",
    variant: "shop",
    specs: [
      { label: "Screen", value: "6.7-inch OLED" },
      { label: "Processor", value: "A17 Pro Bionic" },
      { label: "Camera", value: "48MP Main, 12MP Ultra-wide" }
    ]
  },
  {
    id: "s3",
    slug: "noise-cancelling-headphones-x",
    name: "Noise-Cancelling Headphones X",
    description: "Immerse yourself in pure studio sound with industry-leading active noise cancellation and 40 hours of battery life.",
    price: "$349.00",
    rating: 4.7,
    reviewsCount: 312,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop"
    ],
    tag: "New",
    tagType: "new",
    variant: "shop",
    specs: [
      { label: "Battery", value: "40 Hours" },
      { label: "Bluetooth", value: "5.3 Multi-point" },
      { label: "Weight", value: "250g" }
    ]
  },
  {
    id: "s4",
    slug: "creator-tablet-pro",
    name: "Creator Tablet Pro",
    description: "Your digital canvas. Featuring a breathtaking liquid retina display and seamless stylus integration for unmatched creative workflows.",
    price: "$799.00",
    rating: 4.9,
    reviewsCount: 56,
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?q=80&w=800&auto=format&fit=crop"
    ],
    tag: "Popular",
    tagType: "new",
    variant: "shop",
    specs: [
      { label: "Screen", value: "11-inch Liquid Retina" },
      { label: "Storage", value: "256GB / 512GB" },
      { label: "Stylus", value: "Included" }
    ]
  },
  {
    id: "s5",
    slug: "next-gen-console-elite",
    name: "Next-Gen Console Elite",
    description: "Push the boundaries of gaming with 4K resolution at 120fps, ray tracing, and ultra-high-speed SSD loading.",
    price: "$499.00",
    rating: 4.8,
    reviewsCount: 1045,
    images: [
      "https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=800&auto=format&fit=crop"
    ],
    variant: "shop",
    specs: [
      { label: "Resolution", value: "4K UHD" },
      { label: "Storage", value: "1TB Custom NVMe SSD" },
      { label: "Max FPS", value: "120 fps" }
    ]
  },
  {
    id: "s6",
    slug: "premium-home-soundbar",
    name: "Premium Home Soundbar",
    description: "Cinematic audio in your living room. Featuring Dolby Atmos and adaptive sound technology for immersive movie nights.",
    price: "$299.00",
    oldPrice: "$399.00",
    rating: 4.6,
    reviewsCount: 88,
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1558089687-f282ffcbc126?q=80&w=800&auto=format&fit=crop"
    ],
    tag: "Sale",
    tagType: "sale",
    variant: "shop",
    specs: [
      { label: "Audio", value: "Dolby Atmos 5.1.2" },
      { label: "Connectivity", value: "HDMI eARC, Bluetooth" },
      { label: "Subwoofer", value: "Wireless Included" }
    ]
  },
  {
    id: "s7",
    slug: "ultralight-laptop-m2",
    name: "Ultralight Laptop M2",
    description: "Feather-light design meets heavy-weight performance. The ultimate machine for professionals on the move.",
    price: "$1299.00",
    rating: 4.9,
    reviewsCount: 420,
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1531297172868-edf656ce2903?q=80&w=800&auto=format&fit=crop"
    ],
    tag: "New",
    tagType: "new",
    variant: "shop",
    specs: [
      { label: "Processor", value: "M2 Chip" },
      { label: "RAM", value: "16GB Unified" },
      { label: "Battery", value: "18 Hours" }
    ]
  },
  {
    id: "s8",
    slug: "titanium-smartwatch-series-9",
    name: "Titanium Smartwatch Series 9",
    description: "Advanced health tracking, cellular connectivity, and a rugged titanium case designed for extreme adventures.",
    price: "$799.00",
    rating: 4.7,
    reviewsCount: 156,
    images: [
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800&auto=format&fit=crop"
    ],
    variant: "shop",
    specs: [
      { label: "Case", value: "49mm Aerospace Titanium" },
      { label: "Water Resistance", value: "100m" },
      { label: "Sensors", value: "ECG, Blood Oxygen, GPS" }
    ]
  },
  {
    id: "s9",
    slug: "smart-home-hub",
    name: "Smart Home Hub Gen 3",
    description: "Control your entire house from one central hub. Featuring a 10-inch touchscreen and smart voice assistant integration.",
    price: "$149.00",
    oldPrice: "$199.00",
    rating: 4.5,
    reviewsCount: 231,
    images: [
      "https://images.unsplash.com/photo-1558089687-f282ffcbc126?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop"
    ],
    tag: "Sale",
    tagType: "sale",
    variant: "shop",
    specs: [
      { label: "Screen", value: "10-inch HD" },
      { label: "Connectivity", value: "WiFi 6, Zigbee, Matter" },
      { label: "Camera", value: "12MP with auto-framing" }
    ]
  },
  {
    id: "s10",
    slug: "mechanical-keyboard-pro",
    name: "Mechanical Keyboard Pro",
    description: "Precision-engineered mechanical keyboard with tactile switches, hot-swappable PCB, and full RGB backlighting.",
    price: "$189.00",
    rating: 4.8,
    reviewsCount: 310,
    images: [
      "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop"
    ],
    variant: "shop",
    specs: [
      { label: "Switches", value: "Tactile Brown" },
      { label: "Layout", value: "75% Compact" },
      { label: "Connectivity", value: "Bluetooth, 2.4GHz, Wired" }
    ]
  },
  {
    id: "s11",
    slug: "4k-mirrorless-camera",
    name: "4K Mirrorless Camera Alpha",
    description: "Capture the world in stunning detail. Fast autofocus, robust in-body stabilization, and uncropped 4K video.",
    price: "$2199.00",
    rating: 4.9,
    reviewsCount: 125,
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=800&auto=format&fit=crop"
    ],
    tag: "Pro",
    tagType: "new",
    variant: "shop",
    specs: [
      { label: "Sensor", value: "33MP Full-Frame" },
      { label: "Video", value: "4K 60p 10-bit" },
      { label: "Autofocus", value: "Real-time Eye AF" }
    ]
  },
  {
    id: "s12",
    slug: "portable-ssd-2tb",
    name: "Portable SSD 2TB Extreme",
    description: "Rugged, ultra-fast external storage. Drop resistant and featuring speeds up to 2000MB/s.",
    price: "$229.00",
    oldPrice: "$299.00",
    rating: 4.8,
    reviewsCount: 512,
    images: [
      "https://images.unsplash.com/photo-1620283085068-5aab1b4da67e?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544865882-646ce6691c2b?q=80&w=800&auto=format&fit=crop"
    ],
    tag: "Sale",
    tagType: "sale",
    variant: "shop",
    specs: [
      { label: "Capacity", value: "2TB" },
      { label: "Speed", value: "Up to 2000 MB/s" },
      { label: "Durability", value: "IP65 Water/Dust Resistant" }
    ]
  },

  // --- SWAP PRODUCTS (8 items) ---
  {
    id: "w1",
    slug: "swap-iphone-13-pro-max",
    name: "iPhone 13 Pro Max (Pristine)",
    description: "Well cared for iPhone 13 Pro Max. Battery health at 92%. Looking to swap for an equivalent Android flagship.",
    estValue: "$650",
    lookingFor: "Samsung Galaxy S23 Ultra",
    rating: 4.5,
    reviewsCount: 0,
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1605236453806-6ff36851218e?q=80&w=800&auto=format&fit=crop"
    ],
    tag: "Mint",
    tagType: "condition",
    variant: "swap",
    specs: [
      { label: "Condition", value: "Mint (9/10)" },
      { label: "Storage", value: "256GB" },
      { label: "Battery Health", value: "92%" }
    ]
  },
  {
    id: "w2",
    slug: "swap-macbook-pro-m1",
    name: "MacBook Pro M1 2020",
    description: "Excellent condition M1 MacBook Pro. Used strictly for light coding. Need a lighter machine for travel.",
    estValue: "$750",
    lookingFor: "MacBook Air M2",
    rating: 4.8,
    reviewsCount: 3,
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop"
    ],
    tag: "Used",
    tagType: "condition",
    variant: "swap",
    specs: [
      { label: "Processor", value: "M1 8-Core" },
      { label: "RAM / Storage", value: "16GB / 512GB" },
      { label: "Condition", value: "Great (8/10)" }
    ]
  },
  {
    id: "w3",
    slug: "swap-dji-mini-3-pro",
    name: "DJI Mini 3 Pro Drone",
    description: "Flown less than 10 times. Comes with Fly More kit and ND filters. Want to trade for camera gear.",
    estValue: "$700",
    lookingFor: "Sony A6400 or similar",
    rating: 5.0,
    reviewsCount: 1,
    images: [
      "https://images.unsplash.com/photo-1579829366248-204fe8413f31?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=800&auto=format&fit=crop"
    ],
    tag: "Like New",
    tagType: "condition",
    variant: "swap",
    specs: [
      { label: "Flight Time", value: "< 5 hours total" },
      { label: "Includes", value: "Fly More Combo, Hard Case" }
    ]
  },
  {
    id: "w4",
    slug: "swap-ipad-air-4th-gen",
    name: "iPad Air 4th Gen + Pencil",
    description: "Perfect drawing tablet setup. Has a paper-like screen protector applied since day one.",
    estValue: "$450",
    lookingFor: "Gaming Monitor (1440p 144Hz+)",
    rating: 4.6,
    reviewsCount: 5,
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?q=80&w=800&auto=format&fit=crop"
    ],
    tag: "Good",
    tagType: "condition",
    variant: "swap",
    specs: [
      { label: "Storage", value: "64GB" },
      { label: "Accessories", value: "Apple Pencil Gen 2" }
    ]
  },
  {
    id: "w5",
    slug: "swap-nintendo-switch-oled",
    name: "Nintendo Switch OLED",
    description: "Comes with pro controller and 3 physical games (Zelda, Mario Kart, Smash).",
    estValue: "$350",
    lookingFor: "Steam Deck",
    rating: 4.9,
    reviewsCount: 2,
    images: [
      "https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1578308434778-95a205a26b2b?q=80&w=800&auto=format&fit=crop"
    ],
    variant: "swap",
    specs: [
      { label: "Model", value: "OLED White" },
      { label: "Games", value: "3 Cartridges included" }
    ]
  },
  {
    id: "w6",
    slug: "swap-sony-wh-1000xm4",
    name: "Sony WH-1000XM4",
    description: "Excellent noise-cancelling headphones. Used primarily at the desk. Earpads recently replaced.",
    estValue: "$180",
    lookingFor: "AirPods Pro Gen 2",
    rating: 4.7,
    reviewsCount: 8,
    images: [
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop"
    ],
    variant: "swap",
    specs: [
      { label: "Color", value: "Matte Black" },
      { label: "Condition", value: "Good (7/10)" }
    ]
  },
  {
    id: "w7",
    slug: "swap-rtx-3080-gpu",
    name: "NVIDIA RTX 3080 10GB",
    description: "Never mined on, strictly used for gaming (mostly weekend racing sims). Excellent thermals.",
    estValue: "$400",
    lookingFor: "PS5 Disc Edition",
    rating: 4.9,
    reviewsCount: 4,
    images: [
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?q=80&w=800&auto=format&fit=crop"
    ],
    tag: "Testing required",
    tagType: "wanted",
    variant: "swap",
    specs: [
      { label: "VRAM", value: "10GB GDDR6X" },
      { label: "Condition", value: "Used - Very Good" }
    ]
  },
  {
    id: "w8",
    slug: "swap-keychron-q1",
    name: "Keychron Q1 Custom Keyboard",
    description: "Fully modded Keychron Q1. Lubed Gateron Oil Kings, tape mod, force break mod. Sounds incredible.",
    estValue: "$200",
    lookingFor: "High-end Gaming Mouse + Cash",
    rating: 5.0,
    reviewsCount: 1,
    images: [
      "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop"
    ],
    variant: "swap",
    specs: [
      { label: "Switches", value: "Gateron Oil Kings (Lubed)" },
      { label: "Keycaps", value: "GMK clones" }
    ]
  }
];

export const getProductBySlug = (slug: string): Product | undefined => {
  return products.find(p => p.slug === slug);
};

export const getShopProducts = (): Product[] => {
  return products.filter(p => p.variant === 'shop');
};

export const getSwapProducts = (): Product[] => {
  return products.filter(p => p.variant === 'swap');
};

export const getTrendingProducts = (limit: number = 6): Product[] => {
  // Just returning the first 'limit' shop products for trending
  return products.filter(p => p.variant === 'shop').slice(0, limit);
};

export type RewardCategory = {
  id: string;
  name: string;
  itemCount: number;
};

export type RewardProduct = {
  id: string;
  name: string;
  category: string;
  points: number;
  image?: string;
  imageBg: string;
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  description?: string;
  brand?: string;
  redemptions?: number;
  trending?: boolean;
};

export const MY_POINTS = 28628;

export const REWARD_CATEGORIES: RewardCategory[] = [
  { id: "clothes", name: "Clothes", itemCount: 12368 },
  { id: "shoes", name: "Shoes", itemCount: 8768 },
  { id: "accessories", name: "Accessories", itemCount: 6246 },
  { id: "electronics", name: "Electronics", itemCount: 3124 },
  { id: "vouchers", name: "Vouchers", itemCount: 1842 },
];

export const REWARD_PRODUCTS: RewardProduct[] = [
  {
    id: "p-cl-1",
    name: "Linen Tee — Cream",
    category: "clothes",
    points: 1500,
    image: "/m/images/products/linen-tee.jpg",
    imageBg: "linear-gradient(135deg, #f5e9d4, #e8d5b1)",
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Cream", hex: "#f5e9d4" }, { name: "Sand", hex: "#e8d5b1" }],
    description: "Lightweight breathable linen tee. Made from 100% European flax.",
    brand: "Northshore Co.",
    redemptions: 142,
  },
  {
    id: "p-cl-2",
    name: "Heritage Hoodie",
    category: "clothes",
    points: 2800,
    image: "/m/images/products/heritage-hoodie.jpg",
    imageBg: "linear-gradient(135deg, #4a3528, #2d2018)",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Espresso", hex: "#2d2018" }, { name: "Charcoal", hex: "#3a3a3a" }],
    description: "Heavyweight French terry hoodie. Boxy relaxed fit.",
    brand: "Northshore Co.",
    redemptions: 318,
    trending: true,
  },
  {
    id: "p-cl-3",
    name: "Essential Crew Tee",
    category: "clothes",
    points: 900,
    image: "/m/images/products/crew-tee.jpg",
    imageBg: "linear-gradient(135deg, #fafafa, #e7e5e4)",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [{ name: "White", hex: "#fafafa" }, { name: "Black", hex: "#1c1917" }],
    description: "Soft cotton crew neck. Designed for everyday wear.",
    brand: "Basics Lab",
    redemptions: 264,
    trending: true,
  },
  {
    id: "p-cl-4",
    name: "Knit Polo",
    category: "clothes",
    points: 2100,
    image: "/m/images/products/knit-polo.jpg",
    imageBg: "linear-gradient(135deg, #c9a08a, #a47b62)",
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Camel", hex: "#a47b62" }, { name: "Navy", hex: "#1e3a5f" }],
    description: "Fine-gauge knit polo with mother-of-pearl buttons.",
    brand: "Northshore Co.",
    redemptions: 78,
  },
  {
    id: "p-sh-1",
    name: "Lavie Sport 33L",
    category: "shoes",
    points: 4000,
    image: "/m/images/products/lavie-sport.jpg",
    imageBg: "linear-gradient(135deg, #4a3a30, #2a1f17)",
    sizes: ["40 EU", "41 EU", "42 EU", "43 EU", "44 EU", "45 EU"],
    colors: [{ name: "Brown", hex: "#4a3a30" }, { name: "Black", hex: "#1c1917" }],
    description: "Trail runner with Vibram outsole. Built for technical terrain.",
    brand: "ROA",
    redemptions: 412,
    trending: true,
  },
  {
    id: "p-sh-2",
    name: "Court Classic",
    category: "shoes",
    points: 2400,
    image: "/m/images/products/court-classic.jpg",
    imageBg: "linear-gradient(135deg, #fafafa, #d6d3d1)",
    sizes: ["40 EU", "41 EU", "42 EU", "43 EU", "44 EU"],
    colors: [{ name: "White", hex: "#fafafa" }],
    description: "Minimal leather sneaker. Italian-made.",
    brand: "Veja",
    redemptions: 195,
  },
  {
    id: "p-sh-3",
    name: "Trail Runner Pro",
    category: "shoes",
    points: 3200,
    image: "/m/images/products/trail-runner.jpg",
    imageBg: "linear-gradient(135deg, #1c1917, #292927)",
    sizes: ["41 EU", "42 EU", "43 EU", "44 EU", "45 EU"],
    colors: [{ name: "Black", hex: "#1c1917" }],
    description: "Full-grain leather hiking shoe with Gore-Tex membrane.",
    brand: "Salomon",
    redemptions: 156,
  },
  {
    id: "p-sh-4",
    name: "Studio Slipper",
    category: "shoes",
    points: 1800,
    image: "/m/images/products/studio-slipper.jpg",
    imageBg: "linear-gradient(135deg, #4a5d3a, #2e3d23)",
    sizes: ["40 EU", "41 EU", "42 EU", "43 EU", "44 EU"],
    colors: [{ name: "Olive", hex: "#4a5d3a" }],
    description: "Lo-fi suede slipper with cork footbed.",
    brand: "Birkenstock",
    redemptions: 89,
  },
  {
    id: "p-ac-1",
    name: "Field Watch",
    category: "accessories",
    points: 8500,
    image: "/m/images/products/field-watch.jpg",
    imageBg: "linear-gradient(135deg, #2d2d2d, #1a1a1a)",
    description: "Mechanical field watch with sapphire crystal and 38mm case.",
    brand: "Hamilton",
    redemptions: 34,
  },
  {
    id: "p-ac-2",
    name: "Leather Cardholder",
    category: "accessories",
    points: 1200,
    image: "/m/images/products/cardholder.jpg",
    imageBg: "linear-gradient(135deg, #6b4423, #3e2817)",
    colors: [{ name: "Cognac", hex: "#6b4423" }, { name: "Black", hex: "#1c1917" }],
    description: "Slim Italian leather cardholder. Holds 6 cards.",
    brand: "Bellroy",
    redemptions: 221,
    trending: true,
  },
  {
    id: "p-ac-3",
    name: "Sunglasses",
    category: "accessories",
    points: 3600,
    image: "/m/images/products/sunglasses.jpg",
    imageBg: "linear-gradient(135deg, #312e2b, #1c1a18)",
    colors: [{ name: "Black", hex: "#1c1917" }, { name: "Tortoise", hex: "#8b6943" }],
    description: "Polarized acetate sunglasses with green CR-39 lenses.",
    brand: "Ray-Ban",
    redemptions: 167,
  },
  {
    id: "p-el-1",
    name: "Wireless Buds",
    category: "electronics",
    points: 5200,
    image: "/m/images/products/wireless-buds.jpg",
    imageBg: "linear-gradient(135deg, #fafafa, #d6d3d1)",
    description: "Active noise cancellation, 30hr battery, USB-C wireless charging.",
    brand: "Sony",
    redemptions: 376,
    trending: true,
  },
  {
    id: "p-el-2",
    name: "Mechanical Keyboard",
    category: "electronics",
    points: 6800,
    image: "/m/images/products/mech-keyboard.jpg",
    imageBg: "linear-gradient(135deg, #292927, #1c1917)",
    description: "65% layout, hot-swap PCB, brown switches.",
    brand: "Keychron",
    redemptions: 102,
  },
  {
    id: "p-vo-1",
    name: "Amazon Voucher — $50",
    category: "vouchers",
    points: 5000,
    imageBg: "linear-gradient(135deg, #ff9900, #ffaa1d)",
    description: "Digital code, redeemable instantly. Valid worldwide.",
    brand: "Amazon",
    redemptions: 489,
    trending: true,
  },
  {
    id: "p-vo-2",
    name: "Spotify — 6 months",
    category: "vouchers",
    points: 3000,
    imageBg: "linear-gradient(135deg, #1db954, #0e8a3a)",
    description: "Spotify Premium for 6 months. Individual plan.",
    brand: "Spotify",
    redemptions: 256,
    trending: true,
  },
];

export function getProduct(id: string): RewardProduct | undefined {
  return REWARD_PRODUCTS.find((p) => p.id === id);
}

export function getProductsByCategory(categoryId: string): RewardProduct[] {
  return REWARD_PRODUCTS.filter((p) => p.category === categoryId);
}

export function getTrendingProducts(limit = 5): RewardProduct[] {
  return [...REWARD_PRODUCTS]
    .filter((p) => p.trending)
    .sort((a, b) => (b.redemptions ?? 0) - (a.redemptions ?? 0))
    .slice(0, limit);
}

import rawProducts from './products.json';

export type StockLevel = 'in' | 'low' | 'out';

/* ── Sub-types ─────────────────────────────────────── */

export interface ProductImage {
  id: number;
  url: string;
  alt: string;
  primary: boolean;
}

export interface ProductReview {
  id: string;
  author: string;
  avatar: string | null;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  helpful?: number;
}

export interface ProductShipping {
  freeShipping: boolean;
  freeShippingThreshold?: number;
  estimatedDelivery: string;
  expedited?: {
    available: boolean;
    label: string;
    price: number;
  };
  weight?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
}

export interface ProductWarranty {
  duration: string;
  type: string;
  extendable: boolean;
  extensionOptions?: string[];
}

export interface ProductReturns {
  window: number;
  windowUnit: string;
  condition: string;
  freeReturns: boolean;
}

export interface ProductCompatibility {
  notes: string;
  testedBoards?: string[];
}

export interface ProductMetadata {
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  visible: boolean;
  featured: boolean;
}

/* ── Main Product interface ─────────────────────────── */

export interface Product {
  id: number;
  brand: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  icon: string;
  price: number;
  oldPrice: number | null;
  currency: string;
  savings: number | null;
  savingsPercent: number | null;
  stock: string;
  stockLabel: string;
  stockCount?: number;
  rating: string;
  reviewCount: number;
  sku?: string;
  upc?: string;
  partNumber?: string;
  shortDescription: string;
  images: ProductImage[];
  specs: Record<string, string>;
  tags: string[];
  badges?: string[];
  highlights?: string[];
  bundledItems?: { name: string; quantity: number }[];
  shipping?: ProductShipping;
  warranty?: ProductWarranty;
  returns?: ProductReturns;
  compatibility?: ProductCompatibility;
  reviews?: {
    average: number;
    total: number;
    distribution: Record<string, number>;
    featured?: ProductReview[];
  };
  relatedProductIds?: number[];
  frequentlyBoughtWith?: number[];
  metadata?: ProductMetadata;
}

/* ── Compatibility shims (used by existing components) ─
   These computed helpers bridge the old short-field names
   to the new rich schema so no component breaks.        */

/** Primary image URL — first image marked primary, fallback to first */
export function productImg(p: Product): string {
  return (p.images.find((i) => i.primary) ?? p.images[0])?.url ?? '';
}

/** Old price (compat shim for `p.old`) */
export function productOld(p: Product): number | null {
  return p.oldPrice;
}

/** Review count (compat shim for `p.rev`) */
export function productRev(p: Product): number {
  return p.reviewCount;
}

/** Specs as flat string array for badges/cart (compat shim for `p.specs[]`) */
export function productSpecList(p: Product): string[] {
  return Object.values(p.specs).slice(0, 4);
}

/** ic icon id derived from categorySlug */
export function productIc(p: Product): string {
  const map: Record<string, string> = {
    gpus: 'i-gpu', cpus: 'i-cpu', motherboards: 'i-mobo',
    ram: 'i-ram', psus: 'i-psu', storage: 'i-ssd',
    cooling: 'i-fan', cases: 'i-case', peripherals: 'i-periph',
  };
  return map[p.categorySlug] ?? 'i-gpu';
}

/** Primary tag string (first entry in tags[], or undefined) */
export function productTag(p: Product): string | undefined {
  return p.tags?.[0];
}

/* ── Data ───────────────────────────────────────────── */

export interface Category {
  n: string;
  ic: string;
}

export const CATS: Category[] = [
  { n: 'GPUs',         ic: 'i-gpu'   },
  { n: 'CPUs',         ic: 'i-cpu'   },
  { n: 'Motherboards', ic: 'i-mobo'  },
  { n: 'RAM',          ic: 'i-ram'   },
  { n: 'PSUs',         ic: 'i-psu'   },
  { n: 'Storage',      ic: 'i-ssd'   },
  { n: 'Cooling',      ic: 'i-fan'   },
  { n: 'Cases',        ic: 'i-case'  },
  { n: 'Peripherals',  ic: 'i-periph'},
];

export const PRODUCTS: Product[] = rawProducts as unknown as Product[];

export const STOCK_MAP: Record<StockLevel, [string, string]> = {
  in:  ['badge-success', 'In Stock'],
  low: ['badge-warning', 'Low Stock'],
  out: ['badge-danger',  'Out of Stock'],
};

export function fmt(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function productPath(id: number): string {
  const p = PRODUCTS.find(p => p.id === id);
  if (!p) return '/shop';
  return `/product/${id}/${p.slug ?? slugify(p.name)}`;
}

export const CATEGORY_SLUGS: Record<string, string> = {
  gpus:         'GPUs',
  cpus:         'CPUs',
  motherboards: 'Motherboards',
  ram:          'RAM',
  psus:         'PSUs',
  storage:      'Storage',
  cooling:      'Cooling',
  cases:        'Cases',
  peripherals:  'Peripherals',
};

export function categorySlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export function getProductsByCategory(category: string): Product[] {
  return PRODUCTS.filter(p => p.category === category);
}

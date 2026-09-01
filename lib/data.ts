import productsJson from './products.json';

export type StockLevel = 'in' | 'low' | 'out';

export interface Product {
  id: number;
  brand: string;
  name: string;
  category: string;
  ic: string;
  img: string;
  price: number;
  old: number | null;
  rating: string;
  rev: number;
  stock: StockLevel;
  specs: string[];
  tag?: string;
}

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

export const PRODUCTS: Product[] = productsJson as Product[];

export const STOCK_MAP: Record<StockLevel, [string, string]> = {
  in:  ['badge-success', 'In Stock'],
  low: ['badge-warning', 'Low Stock'],
  out: ['badge-danger',  'Out of Stock'],
};

export function fmt(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Generate a URL-safe slug from a product name */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Get the URL path for a product */
export function productPath(id: number): string {
  const p = PRODUCTS.find(p => p.id === id);
  if (!p) return '/shop';
  return `/product/${id}/${slugify(p.name)}`;
}

/** Category slug map */
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

/** Get URL slug for a category name */
export function categorySlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

/** Get products filtered by category name */
export function getProductsByCategory(category: string): Product[] {
  return PRODUCTS.filter(p => p.category === category);
}

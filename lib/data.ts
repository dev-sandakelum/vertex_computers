export type StockLevel = 'in' | 'low' | 'out';

export interface Product {
  id: number;
  brand: string;
  name: string;
  ic: string;
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
  { n: 'GPUs', ic: 'i-gpu' },
  { n: 'CPUs', ic: 'i-cpu' },
  { n: 'Motherboards', ic: 'i-mobo' },
  { n: 'RAM', ic: 'i-ram' },
  { n: 'PSUs', ic: 'i-psu' },
  { n: 'Storage', ic: 'i-ssd' },
  { n: 'Cooling', ic: 'i-fan' },
  { n: 'Cases', ic: 'i-case' },
  { n: 'Peripherals', ic: 'i-periph' },
];

export const PRODUCTS: Product[] = [
  { id: 0,  brand: 'Nova',  name: 'Nova RTX 9090 16GB Graphics Card',      ic: 'i-gpu',  price: 899, old: 999,  rating: '4.8', rev: 231, stock: 'in',  specs: ['16GB GDDR7', 'PCIe 5.0', '320W'],    tag: 'Sale' },
  { id: 1,  brand: 'Apex',  name: 'Apex R9 9800X 12-Core Processor',       ic: 'i-cpu',  price: 449, old: null, rating: '4.9', rev: 412, stock: 'in',  specs: ['12C / 24T', '5.4 GHz', 'AM6'] },
  { id: 2,  brand: 'Nova',  name: 'Nova RTX 9070 12GB Graphics Card',      ic: 'i-gpu',  price: 649, old: 699,  rating: '4.7', rev: 188, stock: 'in',  specs: ['12GB GDDR7', 'PCIe 5.0', '250W'],    tag: 'Sale' },
  { id: 3,  brand: 'Volt',  name: 'Volt 64GB DDR5 6000MHz Kit (2×32)',     ic: 'i-ram',  price: 219, old: null, rating: '4.8', rev: 96,  stock: 'in',  specs: ['64GB', '6000 MT/s', 'CL30'] },
  { id: 4,  brand: 'Surge', name: 'Surge 1000W Platinum Modular PSU',      ic: 'i-psu',  price: 179, old: 209,  rating: '4.6', rev: 143, stock: 'low', specs: ['1000W', '80+ Platinum', 'ATX 3.1'],  tag: 'Deal' },
  { id: 5,  brand: 'Apex',  name: 'Apex X9 6900 XT Motherboard',           ic: 'i-mobo', price: 379, old: null, rating: '4.5', rev: 77,  stock: 'in',  specs: ['AM6', 'DDR5', 'WiFi 7'] },
  { id: 6,  brand: 'Frost', name: 'Frost 360 AIO Liquid Cooler RGB',       ic: 'i-fan',  price: 149, old: 169,  rating: '4.7', rev: 205, stock: 'in',  specs: ['360mm', 'ARGB', 'LGA/AM6'],          tag: 'Deal' },
  { id: 7,  brand: 'Bolt',  name: 'Bolt 4TB NVMe Gen5 SSD',                ic: 'i-ssd',  price: 329, old: null, rating: '4.9', rev: 164, stock: 'in',  specs: ['4TB', '12,400 MB/s', 'Gen5'] },
  { id: 8,  brand: 'Titan', name: 'Titan RTX Mid-Tower Case — Glass',      ic: 'i-case', price: 129, old: null, rating: '4.6', rev: 88,  stock: 'in',  specs: ['ATX', 'Tempered Glass', 'USB-C'] },
  { id: 9,  brand: 'Nova',  name: 'Nova RTX 9060 8GB Graphics Card',       ic: 'i-gpu',  price: 379, old: null, rating: '4.4', rev: 59,  stock: 'low', specs: ['8GB GDDR6', 'PCIe 4.0', '170W'] },
  { id: 10, brand: 'Volt',  name: 'Volt 32GB DDR5 5600MHz Kit (2×16)',     ic: 'i-ram',  price: 99,  old: 119,  rating: '4.7', rev: 301, stock: 'in',  specs: ['32GB', '5600 MT/s', 'CL36'],         tag: 'Sale' },
  { id: 11, brand: 'Apex',  name: 'Apex R5 9600 6-Core Processor',         ic: 'i-cpu',  price: 229, old: null, rating: '4.6', rev: 154, stock: 'out', specs: ['6C / 12T', '5.0 GHz', 'AM6'] },
];

export const STOCK_MAP: Record<StockLevel, [string, string]> = {
  in:  ['badge-success', 'In Stock'],
  low: ['badge-warning', 'Low Stock'],
  out: ['badge-danger',  'Out of Stock'],
};

export function fmt(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

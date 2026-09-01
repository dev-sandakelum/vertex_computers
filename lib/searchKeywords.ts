/**
 * Search keywords and suggestion data for Vertex Computers.
 */

import { PRODUCTS } from './data';

export interface SearchSuggestion {
  label: string;
  tag?: string;
  icon?: string;
}

/* ── Trending / popular searches ────────────────────────────────────────── */
export const TRENDING: string[] = [
  'RTX 9090',
  'DDR5 RAM',
  'NVMe Gen5 SSD',
  'AIO Liquid Cooler',
  'AM6 Motherboard',
  'Modular PSU',
  'Tempered Glass Case',
  'PCIe 5.0 GPU',
];

/* ── Category icon map ───────────────────────────────────────────────────── */
const CAT_ICON: Record<string, string> = {
  GPUs:         'i-gpu',
  CPUs:         'i-cpu',
  Motherboards: 'i-mobo',
  RAM:          'i-ram',
  PSUs:         'i-psu',
  Storage:      'i-ssd',
  Cooling:      'i-fan',
  Cases:        'i-case',
  Peripherals:  'i-periph',
};

/* ── Category shortcuts ───────────────────────────────────────────────────── */
export const CATEGORY_SHORTCUTS = [
  { label: 'GPUs',         icon: 'i-gpu'    },
  { label: 'CPUs',         icon: 'i-cpu'    },
  { label: 'Motherboards', icon: 'i-mobo'   },
  { label: 'RAM',          icon: 'i-ram'    },
  { label: 'PSUs',         icon: 'i-psu'    },
  { label: 'Storage',      icon: 'i-ssd'    },
  { label: 'Cooling',      icon: 'i-fan'    },
  { label: 'Cases',        icon: 'i-case'   },
  { label: 'Peripherals',  icon: 'i-periph' },
];

/* ── Static keyword suggestions ──────────────────────────────────────────── */
export const KEYWORDS: SearchSuggestion[] = [
  // GPUs
  { label: 'graphics card 4K gaming',     tag: 'GPU',         icon: 'i-gpu' },
  { label: 'GPU PCIe 5.0',               tag: 'GPU',         icon: 'i-gpu' },
  { label: 'GDDR7 graphics card',         tag: 'GPU',         icon: 'i-gpu' },
  { label: 'triple fan GPU',              tag: 'GPU',         icon: 'i-gpu' },
  // CPUs
  { label: 'AM6 socket processor',        tag: 'CPU',         icon: 'i-cpu' },
  { label: 'processor 5GHz+',             tag: 'CPU',         icon: 'i-cpu' },
  { label: '12 core CPU',                 tag: 'CPU',         icon: 'i-cpu' },
  // Motherboards
  { label: 'AM6 motherboard DDR5',        tag: 'Motherboard', icon: 'i-mobo' },
  { label: 'WiFi 7 motherboard',          tag: 'Motherboard', icon: 'i-mobo' },
  { label: 'ATX motherboard',             tag: 'Motherboard', icon: 'i-mobo' },
  // RAM
  { label: 'DDR5 RAM kit',                tag: 'RAM',         icon: 'i-ram' },
  { label: '32GB DDR5',                   tag: 'RAM',         icon: 'i-ram' },
  { label: '64GB DDR5',                   tag: 'RAM',         icon: 'i-ram' },
  { label: 'CL30 memory',                 tag: 'RAM',         icon: 'i-ram' },
  // PSUs
  { label: '80+ Platinum power supply',   tag: 'PSU',         icon: 'i-psu' },
  { label: 'modular PSU ATX 3.1',         tag: 'PSU',         icon: 'i-psu' },
  { label: '1000W PSU',                   tag: 'PSU',         icon: 'i-psu' },
  // Storage
  { label: 'NVMe Gen5 SSD',               tag: 'Storage',     icon: 'i-ssd' },
  { label: '4TB SSD',                     tag: 'Storage',     icon: 'i-ssd' },
  { label: 'M.2 SSD 12000 MB/s',          tag: 'Storage',     icon: 'i-ssd' },
  // Cooling
  { label: '360mm AIO liquid cooler',     tag: 'Cooling',     icon: 'i-fan' },
  { label: 'ARGB CPU cooler',             tag: 'Cooling',     icon: 'i-fan' },
  // Cases
  { label: 'tempered glass case ATX',     tag: 'Case',        icon: 'i-case' },
  { label: 'mid tower PC case',           tag: 'Case',        icon: 'i-case' },
  // Peripherals
  { label: 'gaming keyboard',             tag: 'Peripherals', icon: 'i-periph' },
  { label: 'gaming mouse',               tag: 'Peripherals', icon: 'i-periph' },
  { label: '4K gaming monitor',           tag: 'Peripherals', icon: 'i-periph' },
  // Intent
  { label: 'budget gaming build',         tag: 'Guides' },
  { label: 'high-end PC build',           tag: 'Guides' },
  { label: 'best value GPU 2026',         tag: 'Guides' },
  { label: 'PC parts on sale',            tag: 'Deals' },
];

/* ── Search matching helper ───────────────────────────────────────────────── */
/**
 * Returns up to `limit` suggestions matching `query`.
 * Sources: product names (from actual products.json) + static keywords.
 * Deduplicates by label.
 */
export function getSearchSuggestions(query: string, limit = 8): SearchSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const seen = new Set<string>();
  const results: SearchSuggestion[] = [];

  function add(s: SearchSuggestion) {
    const key = s.label.toLowerCase();
    if (!seen.has(key) && results.length < limit) {
      seen.add(key);
      results.push(s);
    }
  }

  /* 1. Exact product name matches (highest priority) */
  PRODUCTS
    .filter(p => p.name.toLowerCase().includes(q))
    .slice(0, 4)
    .forEach(p => add({ label: p.name, tag: p.category, icon: CAT_ICON[p.category] }));

  /* 2. Brand matches */
  PRODUCTS
    .filter(p => p.brand.toLowerCase().includes(q))
    .slice(0, 2)
    .forEach(p => add({ label: `${p.brand} ${p.category}`, tag: p.category, icon: CAT_ICON[p.category] }));

  /* 3. Static keyword matches */
  KEYWORDS
    .filter(k => k.label.toLowerCase().includes(q) || k.tag?.toLowerCase().includes(q))
    .forEach(k => add(k));

  return results;
}

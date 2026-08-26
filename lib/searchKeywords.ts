/**
 * Search keywords and suggestion data for Vertex Computers.
 * Edit this file to add/remove suggestions, trending terms, and categories.
 */

export interface SearchSuggestion {
  label: string;
  /** Category tag shown on the right side of the suggestion */
  tag?: string;
  /** Icon id from SvgDefs (e.g. "i-gpu"). Omit for text-only entries */
  icon?: string;
}

/* ── Trending / popular searches ─────────────────────────────────────────── */
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

/* ── Full keyword → suggestion map ───────────────────────────────────────── */
export const KEYWORDS: SearchSuggestion[] = [
  // GPUs
  { label: 'Nova RTX 9090 16GB',          tag: 'GPU',          icon: 'i-gpu' },
  { label: 'Nova RTX 9070 12GB',          tag: 'GPU',          icon: 'i-gpu' },
  { label: 'Nova RTX 9060 8GB',           tag: 'GPU',          icon: 'i-gpu' },
  { label: 'RTX graphics card',           tag: 'GPU',          icon: 'i-gpu' },
  { label: 'graphics card 4K gaming',     tag: 'GPU',          icon: 'i-gpu' },
  { label: 'GPU PCIe 5.0',               tag: 'GPU',          icon: 'i-gpu' },
  { label: 'GDDR7 graphics card',         tag: 'GPU',          icon: 'i-gpu' },
  { label: 'triple fan GPU',              tag: 'GPU',          icon: 'i-gpu' },

  // CPUs
  { label: 'Apex R9 9800X 12-Core',       tag: 'CPU',          icon: 'i-cpu' },
  { label: 'Apex R5 9600 6-Core',         tag: 'CPU',          icon: 'i-cpu' },
  { label: 'AM6 socket processor',        tag: 'CPU',          icon: 'i-cpu' },
  { label: 'processor 5GHz+',             tag: 'CPU',          icon: 'i-cpu' },
  { label: '12 core CPU',                 tag: 'CPU',          icon: 'i-cpu' },

  // Motherboards
  { label: 'Apex X9 6900 XT Motherboard', tag: 'Motherboard',  icon: 'i-mobo' },
  { label: 'AM6 motherboard DDR5',        tag: 'Motherboard',  icon: 'i-mobo' },
  { label: 'WiFi 7 motherboard',          tag: 'Motherboard',  icon: 'i-mobo' },
  { label: 'ATX motherboard',             tag: 'Motherboard',  icon: 'i-mobo' },

  // RAM
  { label: 'Volt 64GB DDR5 6000MHz',      tag: 'RAM',          icon: 'i-ram' },
  { label: 'Volt 32GB DDR5 5600MHz',      tag: 'RAM',          icon: 'i-ram' },
  { label: 'DDR5 RAM kit',                tag: 'RAM',          icon: 'i-ram' },
  { label: '32GB DDR5',                   tag: 'RAM',          icon: 'i-ram' },
  { label: '64GB DDR5',                   tag: 'RAM',          icon: 'i-ram' },
  { label: 'CL30 memory',                 tag: 'RAM',          icon: 'i-ram' },

  // PSUs
  { label: 'Surge 1000W Platinum PSU',    tag: 'PSU',          icon: 'i-psu' },
  { label: '80+ Platinum power supply',   tag: 'PSU',          icon: 'i-psu' },
  { label: 'modular PSU ATX 3.1',         tag: 'PSU',          icon: 'i-psu' },
  { label: '1000W PSU',                   tag: 'PSU',          icon: 'i-psu' },
  { label: '750W power supply',           tag: 'PSU',          icon: 'i-psu' },

  // Storage
  { label: 'Bolt 4TB NVMe Gen5 SSD',      tag: 'Storage',      icon: 'i-ssd' },
  { label: 'NVMe Gen5 SSD',               tag: 'Storage',      icon: 'i-ssd' },
  { label: '4TB SSD',                     tag: 'Storage',      icon: 'i-ssd' },
  { label: 'fast NVMe storage',           tag: 'Storage',      icon: 'i-ssd' },
  { label: 'M.2 SSD 12000 MB/s',          tag: 'Storage',      icon: 'i-ssd' },

  // Cooling
  { label: 'Frost 360 AIO Cooler RGB',    tag: 'Cooling',      icon: 'i-fan' },
  { label: '360mm AIO liquid cooler',     tag: 'Cooling',      icon: 'i-fan' },
  { label: 'ARGB CPU cooler',             tag: 'Cooling',      icon: 'i-fan' },
  { label: 'air cooler LGA AM6',          tag: 'Cooling',      icon: 'i-fan' },

  // Cases
  { label: 'Titan RTX Mid-Tower Case',    tag: 'Case',         icon: 'i-case' },
  { label: 'tempered glass case ATX',     tag: 'Case',         icon: 'i-case' },
  { label: 'mid tower PC case',           tag: 'Case',         icon: 'i-case' },
  { label: 'USB-C front panel case',      tag: 'Case',         icon: 'i-case' },

  // Peripherals
  { label: 'gaming keyboard',             tag: 'Peripherals',  icon: 'i-periph' },
  { label: 'mechanical keyboard',         tag: 'Peripherals',  icon: 'i-periph' },
  { label: 'gaming mouse',                tag: 'Peripherals',  icon: 'i-periph' },
  { label: '4K gaming monitor',           tag: 'Peripherals',  icon: 'i-periph' },

  // Generic / intent-based
  { label: 'budget gaming build',         tag: 'Guides' },
  { label: 'high-end PC build',           tag: 'Guides' },
  { label: 'streaming build components',  tag: 'Guides' },
  { label: 'best value GPU 2026',         tag: 'Guides' },
  { label: 'PC parts on sale',            tag: 'Deals' },
  { label: 'clearance components',        tag: 'Deals' },
];

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

/* ── Search matching helper ───────────────────────────────────────────────── */
/**
 * Returns up to `limit` suggestions that match `query`.
 * Matching is case-insensitive and checks both label and tag.
 */
export function getSearchSuggestions(query: string, limit = 6): SearchSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return KEYWORDS
    .filter((k) =>
      k.label.toLowerCase().includes(q) ||
      k.tag?.toLowerCase().includes(q)
    )
    .slice(0, limit);
}

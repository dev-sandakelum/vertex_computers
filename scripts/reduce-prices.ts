/**
 * scripts/reduce-prices.ts
 *
 * Reduces every product's `price` by a percentage (default 30%) in
 * lib/products.json — the canonical source of truth that the admin
 * push-products route later syncs to MongoDB.
 *
 * Behaviour:
 *  - Multiplies `price` by (1 - pct/100), rounded to 2 decimals
 *    (matches the 2-decimal convention used throughout the dataset).
 *  - For products that already have an `oldPrice`, recomputes `savings`
 *    and `savingsPercent` so the discount badge stays coherent with the
 *    new lower price. `oldPrice` itself is left untouched (it's the
 *    original MSRP).
 *  - Products without an `oldPrice` just get the price cut; no sale
 *    badge is introduced.
 *
 * Usage (run from the project root):
 *
 *   Dry-run (default — writes nothing, just prints a preview):
 *     npx tsx scripts/reduce-prices.ts
 *
 *   Apply the change (overwrites lib/products.json):
 *     npx tsx scripts/reduce-prices.ts --apply
 *
 *   Custom percentage (default 30):
 *     npx tsx scripts/reduce-prices.ts --pct 25 --apply
 *
 * After applying, re-run the admin push-products flow in the dashboard
 * (or POST to /api/admin/push-products with mode "reset") to sync the
 * updated prices into MongoDB.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

/* ── Config ─────────────────────────────────────────────── */

const PRODUCTS_PATH = resolve(process.cwd(), 'lib', 'products.json');

interface RawProduct {
  id: number;
  name: string;
  price: number;
  oldPrice?: number | null;
  savings?: number | null;
  savingsPercent?: number | null;
  [key: string]: unknown;
}

/* ── Helpers ────────────────────────────────────────────── */

/** Round to 2 decimals, matching the dataset's existing convention. */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

interface CliArgs {
  apply: boolean;
  pct: number;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { apply: false, pct: 30 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--apply') {
      args.apply = true;
    } else if (a === '--pct') {
      args.pct = Number(argv[++i]);
    } else if (a.startsWith('--pct=')) {
      args.pct = Number(a.slice('--pct='.length));
    } else if (a === '-h' || a === '--help') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${a}`);
    }
  }
  if (!Number.isFinite(args.pct) || args.pct < 0 || args.pct > 100) {
    throw new Error(`Invalid --pct value: ${args.pct} (must be 0–100)`);
  }
  return args;
}

function printHelp(): void {
  console.log(`
reduce-prices.ts — cut every product's price by a percentage

Usage:
  npx tsx scripts/reduce-prices.ts [options]

Options:
  --apply       Overwrite lib/products.json (default: dry-run)
  --pct <n>     Percentage to reduce by, 0–100 (default: 30)
  -h, --help    Show this help

Examples:
  npx tsx scripts/reduce-prices.ts                  # dry-run, 30% preview
  npx tsx scripts/reduce-prices.ts --apply           # apply 30% cut
  npx tsx scripts/reduce-prices.ts --pct 25 --apply  # apply 25% cut
`);
}

/* ── Main ───────────────────────────────────────────────── */

function main(): void {
  const { apply, pct } = parseArgs(process.argv.slice(2));
  const factor = 1 - pct / 100;

  if (!existsSync(PRODUCTS_PATH)) {
    throw new Error(
      `products.json not found at ${PRODUCTS_PATH}\n` +
        'Run this script from the project root (where package.json lives).',
    );
  }

  console.log(`\nReducing prices by ${pct}% (multiplier ${factor})`);
  console.log(`Source: ${PRODUCTS_PATH}`);
  console.log(apply ? 'Mode: APPLY — file will be overwritten\n' : 'Mode: DRY-RUN — no file changes\n');

  const products: RawProduct[] = JSON.parse(readFileSync(PRODUCTS_PATH, 'utf8'));

  let withOldPrice = 0;
  let withoutOldPrice = 0;
  const samples: string[] = [];

  for (const p of products) {
    const oldPriceValue = p.price;
    const newPrice = round2(p.price * factor);

    if (typeof p.oldPrice === 'number' && p.oldPrice > 0) {
      // Keep oldPrice (original MSRP), recompute the discount fields so the
      // badge stays consistent with the new lower price.
      p.savings = round2(p.oldPrice - newPrice);
      p.savingsPercent = Math.round((p.savings / p.oldPrice) * 100);
      withOldPrice++;
    } else {
      withoutOldPrice++;
    }

    p.price = newPrice;

    if (samples.length < 5) {
      samples.push(
        `  #${String(p.id).padStart(3)} ${p.name.slice(0, 42).padEnd(44)} $${oldPriceValue.toFixed(2)} → $${newPrice.toFixed(2)}`,
      );
    }
  }

  console.log(`Total products:    ${products.length}`);
  console.log(`  with oldPrice:   ${withOldPrice} (savings recomputed)`);
  console.log(`  without oldPrice: ${withoutOldPrice} (price cut only)`);
  console.log('\nSample (first 5):');
  console.log(samples.join('\n'));

  if (apply) {
    writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2) + '\n', 'utf8');
    console.log('\n✓ lib/products.json updated.');
    console.log('  Re-run the admin push-products flow to sync MongoDB.');
  } else {
    console.log('\nDry-run only. Re-run with --apply to write the changes.');
  }
}

main();

# products.json — Required Changes Task List

These are the field-level changes needed to make `lib/products.json` compatible
with the `Product` interface in `lib/data.ts` without modifying the interface or
using `unknown` casts.

---

## Summary of Issues

The current `products.json` uses the full schema from `example-product.json` (the
detailed docs schema). The app's `Product` interface uses a leaner set of fields
with different names. Every product object needs the following changes.

---

## Task 1 — Rename `icon` → `ic`

**Field:** `icon`
**Rename to:** `ic`
**Applies to:** All 100 products

```diff
- "icon": "i-gpu",
+ "ic": "i-gpu",
```

Valid values: `i-gpu`, `i-cpu`, `i-mobo`, `i-ram`, `i-psu`, `i-ssd`, `i-fan`, `i-case`, `i-periph`

---

## Task 2 — Rename `oldPrice` → `old`

**Field:** `oldPrice`
**Rename to:** `old`
**Applies to:** All 100 products

```diff
- "oldPrice": 999.00,
+ "old": 999.00,
```

Keep `null` values as-is — `null` is valid for `old`.

---

## Task 3 — Rename `reviewCount` → `rev`

**Field:** `reviewCount`
**Rename to:** `rev`
**Applies to:** All 100 products

```diff
- "reviewCount": 231,
+ "rev": 231,
```

---

## Task 4 — Add `img` field (primary image path)

**Field:** `img` (new, does not exist yet)
**Value:** The `url` from the first image in the `images[]` array where `primary: true`
**Applies to:** All 100 products

```diff
+ "img": "/items/gpu/1.jpg",
```

Extract from `images[0].url` (the primary image). See `docs/image-assets.md` for
the full list of available paths per category.

---

## Task 5 — Simplify `specs` to a flat string array

**Field:** `specs`
**Current shape:** Object with named keys (e.g. `{ "Memory": "16GB GDDR7", "Interface": "PCIe 5.0", ... }`)
**Required shape:** Plain `string[]` with 2–4 short spec strings

```diff
- "specs": {
-   "Memory": "16GB GDDR7",
-   "Interface": "PCIe 5.0",
-   "TDP": "320W"
- },
+ "specs": ["16GB GDDR7", "PCIe 5.0", "320W"],
```

Keep each string under 20 characters. Max 4 items per product.

---

## Task 6 — Remove unused fields

The following fields exist in the current JSON but are not part of the `Product`
interface and should be removed to keep the file lean:

| Field to remove     | Reason |
|---------------------|--------|
| `slug`              | Computed at runtime by `slugify(name)` |
| `categorySlug`      | Computed at runtime by `categorySlug(category)` |
| `currency`          | Always USD, not used in UI |
| `savings`           | Computed: `old - price` |
| `savingsPercent`    | Computed: `Math.round((1 - price/old) * 100)` |
| `stockLabel`        | Derived from `STOCK_MAP[stock]` |
| `stockCount`        | Not displayed in current UI |
| `sku`               | Not used in current UI |
| `upc`               | Not used in current UI |
| `partNumber`        | Not used in current UI |
| `shortDescription`  | Not used in current UI |
| `images[]`          | Replaced by flat `img` field (Task 4) |
| `specs{}` (object)  | Replaced by flat `specs[]` array (Task 5) |
| `tags[]`            | Replaced by single `tag?` string |
| `badges[]`          | Not used in current UI |
| `highlights[]`      | Not used in current UI |
| `bundledItems[]`    | Not used in current UI |
| `shipping{}`        | Not used in current UI |
| `warranty{}`        | Not used in current UI |
| `returns{}`         | Not used in current UI |
| `compatibility{}`   | Not used in current UI |
| `reviews{}`         | Not used in current UI |
| `relatedProductIds[]` | Hardcoded in `ProductView` for now |
| `frequentlyBoughtWith[]` | Hardcoded in `ProductView` for now |
| `metadata{}`        | Not used in current UI |

---

## Task 7 — Flatten `tag` from array to optional string

**Field:** `tags[]` → `tag?`
**Current:** `"tags": ["Sale"]` or `"tags": []`
**Required:** `"tag": "Sale"` or omit the field entirely

```diff
- "tags": ["Sale"],
+ "tag": "Sale",
```

If `tags` is empty (`[]`), omit the `tag` field entirely.

---

## Final Required Shape Per Product

After all tasks above, each product object should look exactly like this:

```json
{
  "id": 0,
  "brand": "Nova",
  "name": "Nova RTX 9090 16GB Graphics Card",
  "category": "GPUs",
  "ic": "i-gpu",
  "img": "/items/gpu/1.jpg",
  "price": 899.00,
  "old": 999.00,
  "rating": "4.8",
  "rev": 231,
  "stock": "in",
  "specs": ["16GB GDDR7", "PCIe 5.0", "320W"],
  "tag": "Sale"
}
```

Minimum required fields (no sale tag, no old price):

```json
{
  "id": 1,
  "brand": "Apex",
  "name": "Apex R9 9800X 12-Core Processor",
  "category": "CPUs",
  "ic": "i-cpu",
  "img": "/items/cpu/1.jpg",
  "price": 449.00,
  "old": null,
  "rating": "4.9",
  "rev": 412,
  "stock": "in",
  "specs": ["12C / 24T", "5.4 GHz", "AM6"]
}
```

---

## Checklist

- [ ] Task 1 — Rename `icon` → `ic` (100 items)
- [ ] Task 2 — Rename `oldPrice` → `old` (100 items)
- [ ] Task 3 — Rename `reviewCount` → `rev` (100 items)
- [ ] Task 4 — Add `img` from primary image URL (100 items)
- [ ] Task 5 — Convert `specs{}` object → `specs[]` array (100 items)
- [ ] Task 6 — Remove 22 unused fields (100 items)
- [ ] Task 7 — Flatten `tags[]` → `tag?` string (100 items)

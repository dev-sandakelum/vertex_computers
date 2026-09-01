# Product Data Schema

Reference for all fields in a Vertex Computers product object.
See [`example-product.json`](./example-product.json) for a complete working example.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Required |
| ⚪ | Optional |
| `null` | Allowed to be null |

---

## Top-level Fields

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| `id` | `number` | ✅ | Integer ≥ 0, unique across all products | Primary key |
| `brand` | `string` | ✅ | 1–60 chars | e.g. `"Apex"`, `"Nova"` |
| `name` | `string` | ✅ | 1–120 chars | Full product name shown in UI |
| `slug` | `string` | ✅ | URL-safe, lowercase, hyphens only, 1–160 chars | Used in `/product/[id]/[slug]` route |
| `category` | `string` | ✅ | One of the valid categories (see below) | Display name |
| `categorySlug` | `string` | ✅ | Lowercase, hyphenated form of `category` | Used in `/shop/[category]` route |
| `icon` | `string` | ✅ | One of the valid icon IDs (see below) | References SVG `<use>` symbol |
| `price` | `number` | ✅ | Float, ≥ 0.01, max 2 decimal places | Current selling price in USD |
| `oldPrice` | `number \| null` | ✅ | Float ≥ 0.01, must be > `price` if set; or `null` | Original/crossed-out price |
| `currency` | `string` | ✅ | ISO 4217, 3 chars | Always `"USD"` for now |
| `savings` | `number \| null` | ⚪ | Derived: `oldPrice - price`; or `null` | Can be computed, not stored |
| `savingsPercent` | `number \| null` | ⚪ | 0–100 integer; or `null` | Can be computed, not stored |
| `stock` | `string` | ✅ | `"in"` \| `"low"` \| `"out"` | Drives badge colour in UI |
| `stockLabel` | `string` | ✅ | `"In Stock"` \| `"Low Stock"` \| `"Out of Stock"` | Human-readable stock status |
| `stockCount` | `number` | ⚪ | Integer ≥ 0 | Actual units on hand; hide in UI if sensitive |
| `rating` | `string` | ✅ | Numeric string, 1 decimal place, range `"1.0"`–`"5.0"` | e.g. `"4.9"` |
| `reviewCount` | `number` | ✅ | Integer ≥ 0 | Total number of reviews |
| `sku` | `string` | ✅ | 1–40 chars, uppercase recommended | Internal stock-keeping unit |
| `upc` | `string` | ⚪ | 12–14 digit string (UPC-A or EAN-13) | Barcode identifier |
| `partNumber` | `string` | ⚪ | 1–60 chars | Manufacturer part number |
| `shortDescription` | `string` | ✅ | 10–300 chars | Shown below product title on PDP |
| `tags` | `string[]` | ⚪ | Each tag 1–30 chars, array max 5 items | e.g. `"Sale"`, `"New Arrival"`, `"Best Seller"` |
| `badges` | `string[]` | ⚪ | Each badge 1–20 chars, array max 3 items | Short promo labels on product card |
| `highlights` | `string[]` | ⚪ | Each item 10–160 chars, array 1–8 items | Bullet-point selling points |
| `relatedProductIds` | `number[]` | ⚪ | Array of valid product `id`s, max 8 items | Powers "You may also like" section |
| `frequentlyBoughtWith` | `number[]` | ⚪ | Array of valid product `id`s, max 4 items | Powers "Frequently Bought Together" |

---

## `images[]`

Array of product images. At least one image with `primary: true` is required.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `id` | `number` | ✅ | Integer ≥ 1, unique within the array |
| `url` | `string` | ✅ | Absolute path or HTTPS URL, max 2048 chars |
| `alt` | `string` | ✅ | 5–125 chars — required for accessibility |
| `primary` | `boolean` | ✅ | Exactly one image in the array must be `true` |

**Array constraints:** min 1 item, max 8 items.

---

## `specs{}`

Free-form key-value map of technical specifications. Keys and values are both strings.

| Constraint | Value |
|------------|-------|
| Min keys | 1 |
| Max keys | 30 |
| Key length | 1–60 chars |
| Value length | 1–120 chars |

Common keys by category:

| Category | Typical Keys |
|----------|-------------|
| CPUs | Architecture, Socket, Cores, Threads, Base Clock, Boost Clock, L2 Cache, L3 Cache, TDP, Memory Support |
| GPUs | GPU Chipset, VRAM, Memory Type, Boost Clock, Memory Bus, Interface, Power Draw, Outputs |
| Motherboards | Socket, Form Factor, Chipset, Memory Slots, Max Memory, PCIe Slots, M.2 Slots, USB Ports |
| RAM | Capacity, Speed, Latency (CL), Voltage, Form Factor, ECC Support |
| Storage | Capacity, Interface, Sequential Read, Sequential Write, Form Factor, NAND Type |
| PSUs | Wattage, Efficiency Rating, Modularity, ATX Version, Fan Size |
| Cooling | Type, Radiator Size, Fan Count, Fan Size, Noise Level, Socket Support |
| Cases | Form Factor, Material, Drive Bays, Expansion Slots, Front I/O, Max GPU Length |

---

## `bundledItems[]`

Items included in the box alongside the product.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | `string` | ✅ | 1–80 chars |
| `quantity` | `number` | ✅ | Integer ≥ 1, max 99 |

**Array constraints:** optional, max 10 items.

---

## `shipping{}`

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `freeShipping` | `boolean` | ✅ | |
| `freeShippingThreshold` | `number` | ⚪ | USD amount ≥ 0; only meaningful if `freeShipping` is conditional |
| `estimatedDelivery` | `string` | ✅ | 1–60 chars, e.g. `"2–4 business days"` |
| `expedited.available` | `boolean` | ⚪ | |
| `expedited.label` | `string` | ⚪ | 1–60 chars |
| `expedited.price` | `number` | ⚪ | Float ≥ 0 |
| `weight` | `string` | ⚪ | Format: `"0.83 kg"` or `"1.8 lb"` |
| `dimensions.length` | `number` | ⚪ | Float > 0 |
| `dimensions.width` | `number` | ⚪ | Float > 0 |
| `dimensions.height` | `number` | ⚪ | Float > 0 |
| `dimensions.unit` | `string` | ⚪ | `"cm"` or `"in"` |

---

## `warranty{}`

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `duration` | `string` | ✅ | 1–40 chars, e.g. `"2 years"` |
| `type` | `string` | ✅ | 1–80 chars |
| `extendable` | `boolean` | ✅ | |
| `extensionOptions` | `string[]` | ⚪ | Each item 1–60 chars, max 4 items |

---

## `returns{}`

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `window` | `number` | ✅ | Integer ≥ 1, typically 14 or 30 |
| `windowUnit` | `string` | ✅ | `"days"` |
| `condition` | `string` | ✅ | 1–160 chars |
| `freeReturns` | `boolean` | ✅ | |

---

## `compatibility{}`

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `notes` | `string` | ✅ | 1–400 chars |
| `testedBoards` | `string[]` | ⚪ | Each item 1–80 chars, max 10 items |

---

## `reviews{}`

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `average` | `number` | ✅ | Float 1.0–5.0, 1 decimal place |
| `total` | `number` | ✅ | Integer ≥ 0, must match `reviewCount` at top level |
| `distribution["1"–"5"]` | `number` | ✅ | Integer ≥ 0; all five keys required; must sum to `total` |
| `featured` | `Review[]` | ⚪ | 0–5 featured reviews (see below) |

### `reviews.featured[]`

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | Unique, format `"r-NNN"` |
| `author` | `string` | ✅ | 1–60 chars |
| `avatar` | `string \| null` | ⚪ | URL or `null` |
| `rating` | `number` | ✅ | Integer 1–5 |
| `title` | `string` | ✅ | 5–100 chars |
| `body` | `string` | ✅ | 20–1000 chars |
| `date` | `string` | ✅ | ISO 8601 date: `"YYYY-MM-DD"` |
| `verified` | `boolean` | ✅ | Whether this is a verified purchase |
| `helpful` | `number` | ⚪ | Integer ≥ 0, "X people found this helpful" |

---

## `metadata{}`

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `createdAt` | `string` | ✅ | ISO 8601 datetime with `Z` suffix |
| `updatedAt` | `string` | ✅ | ISO 8601 datetime with `Z` suffix; ≥ `createdAt` |
| `publishedAt` | `string \| null` | ✅ | ISO 8601 datetime or `null` if not yet published |
| `visible` | `boolean` | ✅ | Controls whether product appears in listings |
| `featured` | `boolean` | ✅ | Controls whether product appears in featured/homepage slots |

---

## Valid Category Values

| `category` | `categorySlug` | `icon` |
|------------|---------------|--------|
| `GPUs` | `gpus` | `i-gpu` |
| `CPUs` | `cpus` | `i-cpu` |
| `Motherboards` | `motherboards` | `i-mobo` |
| `RAM` | `ram` | `i-ram` |
| `PSUs` | `psus` | `i-psu` |
| `Storage` | `storage` | `i-ssd` |
| `Cooling` | `cooling` | `i-fan` |
| `Cases` | `cases` | `i-case` |
| `Peripherals` | `peripherals` | `i-periph` |

---

## Valid `stock` Values

| Value | `stockLabel` | UI Badge |
|-------|-------------|----------|
| `"in"` | `"In Stock"` | Green (`badge-success`) |
| `"low"` | `"Low Stock"` | Yellow (`badge-warning`) |
| `"out"` | `"Out of Stock"` | Red (`badge-danger`) |

---

## Valid `tags` Values

Predefined tags recognised by the UI. Custom strings are accepted but won't trigger special styling.

| Tag | Usage |
|-----|-------|
| `"Sale"` | Shown as a coloured pill on product card |
| `"Deal"` | Same as Sale, orange styling |
| `"New Arrival"` | Blue pill |
| `"Best Seller"` | Gold pill |
| `"Top Rated"` | Shown when `rating` ≥ 4.8 |
| `"Low Stock"` | Auto-applied when `stock` is `"low"` |

---

## Field Length Quick Reference

| Field | Min | Max |
|-------|-----|-----|
| `name` | 1 | 120 |
| `slug` | 1 | 160 |
| `brand` | 1 | 60 |
| `shortDescription` | 10 | 300 |
| `sku` | 1 | 40 |
| `partNumber` | 1 | 60 |
| `highlights[]` item | 10 | 160 |
| `highlights[]` count | 1 | 8 |
| `images[]` count | 1 | 8 |
| `images[].alt` | 5 | 125 |
| `specs{}` keys | 1 | 30 |
| `specs{}` key length | 1 | 60 |
| `specs{}` value length | 1 | 120 |
| `bundledItems[]` count | 0 | 10 |
| `reviews.featured[]` count | 0 | 5 |
| `reviews.featured[].body` | 20 | 1000 |
| `relatedProductIds[]` | 0 | 8 |
| `frequentlyBoughtWith[]` | 0 | 4 |
| `tags[]` count | 0 | 5 |
| `warranty.extensionOptions[]` | 0 | 4 |
| `compatibility.testedBoards[]` | 0 | 10 |

---

## Numeric Range Quick Reference

| Field | Min | Max | Type |
|-------|-----|-----|------|
| `id` | 0 | — | integer |
| `price` | 0.01 | — | float, 2 dp |
| `oldPrice` | > `price` | — | float, 2 dp |
| `stockCount` | 0 | — | integer |
| `rating` | 1.0 | 5.0 | string (1 dp) |
| `reviewCount` | 0 | — | integer |
| `reviews.average` | 1.0 | 5.0 | float, 1 dp |
| `reviews.distribution` each | 0 | — | integer |
| `reviews.featured[].rating` | 1 | 5 | integer |
| `returns.window` | 1 | — | integer |
| `bundledItems[].quantity` | 1 | 99 | integer |
| `shipping.expedited.price` | 0 | — | float |
| `shipping.dimensions.*` | > 0 | — | float |

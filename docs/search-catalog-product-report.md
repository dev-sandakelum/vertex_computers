# Search, Sorting, Catalog & Product Detail Report — Vertex Computers

A full walkthrough of how browsing, searching, filtering, sorting, and product pages work.

---

## 1. Search

### Entry Points

There are two search surfaces in the UI:

| Surface | File | When it shows |
|---|---|---|
| Desktop header search bar | `Header.tsx` | Always visible in the site header |
| Mobile full-screen search sheet | `SearchSheet.tsx` | Opens when the search icon is tapped on mobile |

Both surfaces share the same core logic — they use the `getSearchSuggestions()` function from `lib/searchKeywords.ts` and the `useSearchKeyboard` hook from `SearchSuggestions.tsx`.

---

### How Suggestions Work

The suggestion engine lives in `lib/searchKeywords.ts` and runs entirely on the client — no server call is made.

When a user types, `getSearchSuggestions(query, limit = 8)` runs these steps in priority order:

1. **Product name matches** — filters `PRODUCTS` where `name` contains the query string (case-insensitive). Up to 4 results.
2. **Brand matches** — filters `PRODUCTS` where `brand` contains the query. Up to 2 results. Formats as _"[Brand] [Category]"_ (e.g. "NVIDIA GPUs").
3. **Static keyword matches** — searches the hardcoded `KEYWORDS` list in `searchKeywords.ts` for matches in either the label or the tag.

All results are deduplicated by label. The final list is capped at 8 entries.

#### Empty state (no query yet)

When the input is blank, the panel shows:
- **Trending** — 8 hardcoded popular search terms (e.g. "RTX 9090", "DDR5 RAM")
- **Browse by category** — shortcut buttons for all 9 categories, each with its SVG icon

#### No results state

If `getSearchSuggestions` returns an empty array, a "No results" message is shown with a hint to try a product name, category, or spec value.

---

### Suggestion Panel UI

Each suggestion row (`SuggestionItem`) renders:
- A category SVG icon (or a generic search icon if none)
- The suggestion label, with the matched substring **bold-highlighted** using `<mark>`
- A tag badge (e.g. "GPU", "RAM", "Deals")
- An `↗` arrow

---

### Keyboard Navigation

The `useSearchKeyboard` hook handles all keyboard interactions:

| Key | Behaviour |
|---|---|
| `ArrowDown` | Moves highlight to the next suggestion |
| `ArrowUp` | Moves highlight to the previous suggestion |
| `Enter` | Selects the highlighted suggestion, or submits the raw query if none highlighted |
| `Escape` | Clears the active highlight and closes the panel |

---

### Submitting a Search

When a suggestion is selected or Enter is pressed:

- The user is navigated to `/shop?q=<encoded query>`
- `CategoryView` reads this `?q=` URL param and uses it as a search filter against the product list

On mobile, the full-screen search sheet (`SearchSheet.tsx`) closes automatically after navigation.

---

## 2. Catalog — Shop & Category Pages

### Routes

| URL | Page file | What it shows |
|---|---|---|
| `/shop` | `app/(main)/shop/page.tsx` | All products (no category filter) |
| `/shop/[category]` | `app/(main)/shop/[category]/page.tsx` | Products in a specific category |
| `/shop?q=...` | same `CategoryView` | Full-text search across all products |
| `/shop?tag=deal` | same `CategoryView` | Products tagged as deals |

Both `/shop` and `/shop/[category]` render the same `CategoryView` component. When a category slug is provided (e.g. `/shop/gpus`), it maps through `CATEGORY_SLUGS` to get the display name (e.g. `"GPUs"`) and passes it as the `activeCategory` prop.

Category pages are **statically generated** at build time via `generateStaticParams()`, which produces a page for each key in `CATEGORY_SLUGS`.

---

### CategoryView — Core Logic

`app/components/views/CategoryView.tsx` is the main catalog component. It handles filtering, sorting, and pagination all in one place using `useMemo` for performance.

#### State

```ts
sortKey   : 'pop' | 'lo' | 'hi' | 'new' | 'rating'   // current sort
page      : number                                      // current pagination page
filters   : FilterState                                // sidebar filter values
```

The `?q=` and `?tag=` values are read directly from the URL via `useSearchParams()` — they are not local state.

#### Data pipeline

```
PRODUCTS (all)
    │
    ▼  applyFilters()
Filtered list
    │
    ▼  sortProducts()
Sorted list
    │
    ▼  .slice( (page-1)*12, page*12 )
Current page (up to 12 items)
    │
    ▼
ProductCard × N
```

---

## 3. Filtering

### Filter State

```ts
interface FilterState {
  brands     : Set<string>   // selected brands (multi-select)
  categories : Set<string>   // selected categories (multi-select, only on /shop)
  minPrice   : string        // numeric string, empty = no limit
  maxPrice   : string        // numeric string, empty = no limit
  inStockOnly: boolean
  onSaleOnly : boolean
}
```

### Filter Logic (`applyFilters`)

Filters are applied in this sequence:

1. **Category from route** — if `activeCategory` is set (e.g. on `/shop/gpus`), only that category's products are shown. The category filter panel is hidden.
2. **Category from filter panel** — only active on `/shop` (all products page). Multi-select.
3. **Brand** — multi-select, hides brands with 0 products in the current scope.
4. **Price range** — `min` and/or `max`. Parses as float; ignores empty strings.
5. **In stock only** — excludes products where `stock === "out"`.
6. **On sale only** — requires `oldPrice !== null && oldPrice > price`.
7. **Tag filter** (`?tag=`)  — checks if any of the product's `tags[]` includes the tag string (case-insensitive).
8. **Search query** (`?q=`) — matches against `name`, `brand`, `category`, all spec values (joined as a string), and `shortDescription`. All case-insensitive.

### Active Filter Chips

Every active filter shows as a dismissible chip in the toolbar above the product grid. Clicking `×` on a chip removes just that one filter. A "Clear all" button wipes everything including URL params.

The filter count badge (shown on the mobile Filters button) counts:
- 1 for `?q=` if present
- 1 for `?tag=` if present
- 1 per selected brand
- 1 per selected category
- 1 for min price, 1 for max price
- 1 for in-stock-only
- 1 for on-sale-only

### Filter Panels

- **Desktop** — a persistent sidebar card (`<aside class="filters card">`) always visible on the left.
- **Mobile** — a bottom drawer that slides up when the "Filters" button in the sticky toolbar is tapped. Controlled by `filterDrawerOpen` state in `AppProvider`. Includes a "Show N results" button at the bottom to close it.

---

## 4. Sorting

The sort dropdown is available in both the desktop toolbar and the mobile sticky toolbar.

| Sort option | `SortKey` | Logic |
|---|---|---|
| Popularity (default) | `pop` | Descending by `reviewCount` |
| Price: Low → High | `lo` | Ascending by `price` |
| Price: High → Low | `hi` | Descending by `price` |
| Newest First | `new` | Descending by `id` (higher ID = newer) |
| Highest Rated | `rating` | Descending by `rating` (parsed as float) |

Changing the sort resets pagination back to page 1.

---

## 5. Pagination

- Page size: **12 products per page**
- Rendered as numbered page buttons with `‹` / `›` prev/next arrows
- Disabled automatically when at the first or last page
- Scrolls to the top of the page (`window.scrollTo`) when navigating pages
- `totalPages = Math.ceil(filteredSortedCount / 12)`, minimum 1
- The current page is clamped to `totalPages` if filters reduce the result count

---

## 6. Product Detail Page

### Route

`/product/[id]/[slug]` — the slug is generated from the product name for SEO purposes (via `slugify()`).

The page renders `ProductView` with the numeric product ID extracted from the URL.

### Layout

The page has a **two-column desktop layout** and a **single-column mobile layout** with accordion sections.

#### Gallery
- Main large image (switches when a thumbnail is clicked)
- Up to 4 thumbnail buttons below the main image
- Falls back to the category SVG icon if no images exist

#### Info panel

| Element | Source |
|---|---|
| Brand + SKU | `p.brand`, `p.sku` (auto-generated if missing) |
| Product name | `p.name` |
| Star rating | `p.rating` (display only, 5-star render) |
| Review count | `p.reviewCount` |
| Stock badge | `p.stock` → `STOCK_MAP` → `badge-success / badge-warning / badge-danger` |
| Price | `p.price` with strikethrough `p.oldPrice` if on sale |
| Savings callout | Shown if `oldPrice` exists: "You save $X (Y%)" |
| Short description | `p.shortDescription` |

#### Buy controls (desktop)
- Quantity stepper (− / + buttons, min 1)
- "Add to Cart" button → calls `addToCart(p.id, qty)` + toast
- Wishlist (♡) button → shows toast (UI demo only)

#### Trust badges
Four icons shown below the buy controls:
- Free shipping over $99
- Warranty duration + return window (from `p.warranty` / `p.returns`, with defaults)
- "Compatibility-checked with your cart" (informational)
- Secure checkout

---

### Tabs / Accordion (Specs, Reviews, Q&A)

**Desktop** uses tab buttons. **Mobile** uses an accordion (one section open at a time).

#### Full Specifications tab
Renders `Object.entries(p.specs)` as an HTML table. Shows up to 12 key-value pairs.

If `p.specs` is empty, falls back to basic fields: Brand, Price, Rating, Stock.

#### Reviews tab
If `p.reviews.featured` has entries:
- Shows aggregate score (large number + star row)
- Shows a rating distribution bar chart (5★ down to 1★ with percentage bars)
- Lists each featured review: author, verified badge, star rating, date, title, body, helpful count

If no featured reviews: shows "No reviews yet."

#### Q&A tab
Placeholder with a "Q&A coming soon" message.

---

### Frequently Bought Together

Below the tabs, up to 4 related products are shown sourced from `p.relatedProductIds[]`.

- **Desktop:** standard product grid with add buttons
- **Mobile:** horizontal scroll row (`hscroll` class)

Each card has a `+` add button that calls `addToCart(rp.id, 1)` directly.

---

### Mobile Sticky Buy Bar

On mobile, a sticky bar is pinned to the bottom of the screen containing:
- Quantity stepper
- "Add to Cart" button (full width)
- Wishlist button

This ensures the buy action is always reachable without scrolling back up.

---

## 7. Key Files Reference

| File | Role |
|---|---|
| `lib/searchKeywords.ts` | Suggestion data (trending, keywords, categories) + `getSearchSuggestions()` |
| `app/components/ui/SearchSuggestions.tsx` | Suggestion panel UI + `useSearchKeyboard` hook |
| `app/components/layout/Header.tsx` | Desktop search bar, cart badge, category nav |
| `app/components/layout/SearchSheet.tsx` | Mobile full-screen search overlay |
| `app/(main)/shop/page.tsx` | `/shop` route (all products) |
| `app/(main)/shop/[category]/page.tsx` | `/shop/[category]` route, static params |
| `app/components/views/CategoryView.tsx` | Catalog view: filter, sort, paginate, filter drawer |
| `app/components/views/ProductView.tsx` | Product detail page: gallery, buy controls, specs, reviews |
| `app/components/ui/ProductCard.tsx` | Product grid card with add-to-cart |
| `lib/data.ts` | Product types, `PRODUCTS` array, helper functions |

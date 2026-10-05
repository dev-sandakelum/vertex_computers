# Vertex Computers — Route Functionalities

## Home Route (`/`)

### Hero Section
- Eyebrow label announcing the latest product line (e.g. "New — Nova RTX 9090 Series")
- Headline and tagline copy
- Two CTA buttons: **Shop the Sale** (→ `/shop`) and **Flagship GPU** (→ product detail page)
- Spec chips below the CTAs highlighting key product features (e.g. ⚡ 16GB GDDR7, ❄ Triple-Fan, 🎮 4K Ready)
- Hero product card on the right showing the flagship product's name, brand, top 3 specs, price, and star rating with review count
- "New Release" badge on the product card

### Promo Band (mobile only)
- Sticky top banner showing: free shipping threshold, return policy, and live chat availability

### Shop by Category
- **Desktop**: Grid of category tiles, each linking to `/shop/[category-slug]`
- **Mobile**: Horizontally scrollable row of category tiles
- Categories: GPUs, CPUs, Motherboards, RAM, PSUs, Storage, Cooling, Cases, Peripherals
- Each tile has an SVG icon and category name
- "Browse all →" link to `/shop`

### Brand Carousel
- Auto-scrolling, seamlessly looping carousel of 54 partner brand logos
- Logos loaded lazily; second copy is `aria-hidden` for accessibility
- "Trusted Brands" label header

### Featured This Week
- Grid of 4 hand-picked featured products
- "View all →" link to `/shop`
- Each product rendered as a `ProductCard` (see Product Card below)

### Hot Deals
- Grid of 4 discounted / deal-tagged products
- "All →" link to `/shop?tag=deal`
- Each product rendered as a `ProductCard`

### Promo Strip (desktop) / Promo List (mobile)
- Three trust-building value propositions displayed differently per breakpoint:
  - **Compatibility Checked** — socket & wattage mismatch warnings
  - **2-Year Warranty** — on every component sold
  - **Live Expert Chat** — real builders, 7 days a week

---

## Shop Routes (`/shop` and `/shop/[category]`)

Both routes render the same `CategoryView` component. `/shop` shows all products; `/shop/[category]` pre-filters to that category. Static paths are pre-generated for all 9 category slugs.

### Page Metadata
- Dynamic `<title>` and `<description>` — generic for `/shop`, category-specific for `/shop/[category]`
- Wrapped in `<Suspense>` with a "Loading products…" fallback

### Breadcrumb Navigation
- Displays: Home / Components / **[Current Category or "All Components"]**
- Each segment is a link

### Mobile Sticky Toolbar
- Shows live result count
- **Filters button** — opens the mobile filter drawer; displays a badge with the active filter count when filters are applied
- **Sort select** — inline dropdown (same options as desktop)

### Sidebar Filters (desktop)
- Always visible on desktop as a card aside
- Shows live result count
- "Clear all" button appears when any filter is active
- Contains all filter groups (see Filter Groups below)

### Filter Groups
| Filter | Type | Behaviour |
|---|---|---|
| **Category** | Multi-select checkboxes | Only shown on `/shop` (hidden when a route category is active); shows product count per category |
| **Brand** | Multi-select checkboxes | Lists all brands that have ≥ 1 product in the current scope; shows count per brand |
| **Price Range** | Two numeric inputs (Min / Max) | Filters products with `price >= min` and/or `price <= max` |
| **Availability** | Two checkboxes | "In stock only" (excludes `out` stock); "On sale" (requires `oldPrice > price`) |

### Sorting
Five sort options available via dropdown on both mobile toolbar and desktop toolbar:
- Popularity (default) — sorted by review count descending
- Price: Low → High
- Price: High → Low
- Newest First — sorted by product `id` descending
- Highest Rated — sorted by rating descending

### Active Filter Chips (desktop toolbar)
- Each active filter renders as a removable chip (accent-coloured pill)
- Clicking `×` removes just that filter and resets to page 1
- URL query `?q=` and `?tag=` params also appear as chips
- "Clear all filters" button on empty-state resets everything including URL params

### URL-driven Filtering
- `?q=` — search query; matches against product name, brand, category, spec values, and short description
- `?tag=` — tag filter (e.g. `?tag=deal` shows Hot Deals)
- Both params coexist with local filter state and are reflected as removable chips

### Product Grid
- Responsive grid of `ProductCard` components
- Shows 12 products per page (`PAGE_SIZE = 12`)
- Empty state ("🔍 No products found") with "Clear all filters" button when no results match

### Pagination
- Only rendered when total pages > 1
- Previous `‹` / Next `›` buttons (disabled at boundaries)
- Numbered page buttons; active page highlighted
- Clicking any page button scrolls to the top of the page smoothly

### Mobile Filter Drawer
- Slides in from the side when the Filters button is tapped
- Backdrop overlay closes the drawer on click
- Scrollable filter group content
- Footer with "Clear all" and "Show N results" buttons
- `role="dialog"` / `aria-modal="true"` for accessibility

---

## Product Card (used on both routes)

Each card is a full `<Link>` to the product detail page and displays:

| Element | Detail |
|---|---|
| Product image | Primary image from `images[]`; falls back to category SVG icon |
| Sale tag | First entry in `tags[]` (e.g. "SALE", "NEW") shown as a pill badge |
| Brand name | |
| Product name | |
| Star rating | Five filled stars + numeric rating |
| Spec badges | Up to 2 key spec values |
| Stock badge | "In Stock" (green), "Low Stock" (amber), or "Out of Stock" (red) |
| Price | Current price; struck-through old price shown when on sale |
| Add to Cart button | Disabled and dimmed when out of stock; on click adds 1 unit to cart and shows a toast notification |

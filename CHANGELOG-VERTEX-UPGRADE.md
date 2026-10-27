# VERTEX Computers — Front-end Upgrade Changelog

Base: commit `23d9477073ea3851fe13b5a62623ec8015cf7966` (PR #4 merge, `development`)
Scope: Tasks 1–7 (category skeletons, UI audit fixes, premium receipt, SVG icon
system, navbar rework, motion system, tooling/patch).

---

## Task 1 — Category pages + skeleton loading

**Added**
- `app/components/ui/Skeleton.tsx` — `Skel`, `ProductCardSkeleton`,
  `SkeletonGrid`, `CategoryPageSkeleton`, `ProductViewSkeleton`, plus a
  visually-hidden `role="status"` announcement for screen readers.
  Skeletons reuse the real component classes (`.pcard`, `.pdp`, `.shop-layout`…)
  so they occupy the exact final geometry at every breakpoint — **zero layout
  shift** when content swaps in.
- `app/(main)/shop/loading.tsx`, `app/(main)/product/[id]/[slug]/loading.tsx`
  — route-level skeletons during client-side navigation.
- `app/(main)/shop/error.tsx`, `app/(main)/product/[id]/[slug]/error.tsx` +
  shared `app/components/ui/RouteErrorPanel.tsx` — friendly error states with
  retry.
- Shimmer CSS (`.skel` + `@keyframes shimmer`) — animates only `transform`,
  disabled under `prefers-reduced-motion`.

**Changed**
- `shop/page.tsx`, `shop/[category]/page.tsx` — data fetching now happens
  *inside* the Suspense boundary (the previous fallbacks were dead code — the
  await happened before render, so skeletons never showed).
- `CategoryView` — remounted per category via `key={name}` (each category page
  keeps its own filter/sort/page state); pagination resets when the search
  query/tag changes.

---

## Task 2 — UI audit & fixes

Audit method: automated DOM audit (overflow, offscreen elements, broken images,
missing alt, unnamed icon buttons) across 12 routes × 3 viewports
(1440/820/390), VLM visual review of full-page screenshots, and manual
bisection of concrete bugs.

| # | Issue | Fix |
|---|-------|-----|
| 1 | `/shop` horizontal overflow (2766px > viewport): pagination rendered ~60 non-wrapping buttons | Windowed pagination (`pageWindow()` with ellipsis), `flex-wrap`, `:disabled` styles |
| 2 | Product grid blowout when an image is broken/slow (intrinsic 1254px drove track sizing) | `.product-grid > *` and `.pcard` get `min-width: 0` |
| 3 | Mobile filter sheet was **fake** — hardcoded "148 products", decorative checkboxes, not wired to state | Deleted the fake sheet from `MobileSheets`; the real `FilterDrawer` (CategoryView) now renders as a mobile bottom sheet (`.filter-drawer` restyled ≤640px + `.fd-backdrop`) |
| 4 | Tablet (641–1024px) sticky shop toolbar hidden behind the sticky header when scrolling | `@media (min-width:641px) and (max-width:1024px) { .shop-toolbar-sticky { top: 118px } }` |
| 5 | Flash-deals countdown had no unit labels | `hrs / min / sec` labels |
| 6 | Cart-drawer note `#B0BCDA` on `#FAFCFF` (contrast ≈1.9:1) | `var(--muted)` |
| 7 | Mobile newsletter button height mismatch (38px vs ~43px input) | `.nl-row .btn { height:auto; min-height:42px }` |
| 8 | Pagination prev/next kept hover styling while disabled | `:hover:not(:disabled)` + `:disabled` rule |

---

## Task 3 — Premium payment receipt

**Added**
- `app/components/payment/ReceiptTicket.tsx` — ticket-style receipt shown on
  `/payment/success` for PAID orders:
  - light gradient page, rounded white card, soft layered shadow
  - **real side notches** cut via a 3-layer intersecting CSS mask at a
    JS-measured `--notch-y` (always aligned with the dashed divider), plus a
    **scalloped bottom edge**
  - celebration icon with animated sparks, "Thank you!" + subtext
  - fields: Order ID, Amount, Date & Time, payment method (brand mark,
    cardholder name, masked last 4 — hidden if the gateway sent none)
  - itemized purchases, subtotal / tax / shipping (FREE) / total
  - **genuine Code 39 barcode** generated from the order ID
    (`app/components/ui/Barcode39.tsx` encoder — scannable, deterministic)
  - entrance: card slide/scale-in, staggered fields/items, dash reveal,
    barcode fade — transform/opacity only
- "Download receipt" → print-optimized export (`window.print()` + print
  stylesheet that isolates the ticket, forces animation end-states and
  `print-color-adjust: exact`), with the document title temporarily set to
  `Vertex-Receipt-<orderId>`.

**Changed (data layer — all real data, nothing hardcoded)**
- `lib/payhere/types.ts`, `lib/models/Order.ts` — optional `cardHolder`,
  `cardLast4`, `cardBrand` on the order (last 4 digits only; the full number
  is never stored).
- `/api/payhere/notify` — captures `card_holder_name` + masked `card_no` from
  the PayHere IPN when the payment succeeds.
- `/api/payhere/status/[orderId]` — now also returns `lastName`, `subtotal`,
  `tax`, derived `shipping`, item unit prices, and the card snapshot (PAID
  only).
- `PaymentSuccessView` — PAID state renders `ReceiptTicket`; non-paid states
  use icon-library SVGs instead of emoji.

---

## Task 4 — Missing SVGs

**Added** `app/components/icons/index.tsx` — one organized icon set:
- UI icons (24×24, strokeWidth 2, round caps, `currentColor` → themeable):
  search/search-x, truck, shield, chat, check/check-circle, flame, user,
  cart, box/package-x, download, close, menu, plus/minus, trash, heart,
  refresh, settings, sign-out, orders, zoom-in, home, lock, chevron-down,
  thumb-up, arrow-up/right, celebration.
- Social: Facebook, Instagram, YouTube, X (`currentColor`).
- Payment marks: Visa, Mastercard, Amex, PayPal, generic chip-card (fixed
  brand colors), `paymentBrandMark()` / `paymentBrandLabel()` helpers.

**Replaced every emoji/text placeholder found by a repo-wide sweep**: footer
social (`f / ig / ▶ / 𝕏`) and payment marks (`VISA/Mastercard/PayPal` text),
topbar 🚚, 🔥 Deals, drawer 🏠/👤/🛒, close ✕ buttons, footer chevrons ▾,
empty states 🔍/🛒/📦/🏠/♡/↩️, zoom hint 🔍, 👍 helpful, ✓ verified, step ✓,
🔒 lock notes. Icon accessibility: `aria-hidden` by default; parents carry
aria-labels.

---

## Task 5 — Navbar changes

**5a Account section**
- Avatar with graceful chain: profile picture (`AuthUser.picture`, wired
  through `/api/auth/me`) → initials → ghost user icon when signed out.
- Animated dropdown (Profile / Orders / Settings / Sign out) with
  `aria-haspopup`, `aria-expanded`, Escape + click-outside closing, chevron
  rotation, `menuIn` spring. Links deep-link to `/account?tab=…` (AccountView
  now honors the tab param; `settings` maps to the profile/settings tab).
- Cart label fix: the `&nbsp;` filler hack replaced by a real
  "N items / Cart" label.

**5b Compact navbar on scroll**
- Scroll direction detector: down past 140px → compact (row 72→54px, logo
  34→26px, search collapses to an "Expand search" icon button which restores
  and focuses the input, category row hides); scrolling up restores.
- All transitions use the shared motion tokens.
- Fixed a scroll-anchoring feedback loop (browser nudged scrollY when the
  header height changed → oscillated) with `html { overflow-anchor: none }`.

---

## Task 6 — Animations everywhere

- Shared tokens in `:root`: `--dur-fast/base/slow`, `--ease-out/io/smooth/
  spring`.
- Page transitions: `app/(main)/template.tsx` + `.page-transition` fadeUp.
- Product cards: hover lift (existing) + image zoom (transform only).
- Button press feedback across `.btn`, `.icon-btn`, `.add-btn`, `.hact`,
  pagination, qty steppers, checkout CTA.
- Add-to-cart: cart badges (header, mobile top bar, bottom nav) are keyed by
  count so the spring bounce replays on every add.
- Dropdowns/menus/sheets: account menu animated; cart-drawer items stagger
  in on open; cart page rows stagger; toasts already animated.
- Tab/filter changes: PDP tab panel keyed by tab (fadeUp replay); filter
  chips pop in.
- List stagger-in for `.product-grid` / `.pg5` (45ms steps, capped at 12).
- Scroll-reveal: `app/components/ui/Reveal.tsx` (IntersectionObserver, once,
  class-toggle without re-renders) on home category grid, promos, feature
  strip, newsletter.
- `prefers-reduced-motion`: global kill-switch extended (smooth scrolling,
  reveals, page transition, brand track, shimmer) + JS fast-path in Reveal.
- Performance: everything animates `transform`/`opacity` only. The two
  deliberate exceptions are the navbar height collapse (Task 5 explicitly
  requires height animation) and the pre-existing accordions.

---

## Task 7 — Build, lint, patch

- `npm run build` — **passes** (static + SSG routes as before).
- `npm run lint` — **0 errors** (was 17 errors). Fixed:
  - new-code errors via proper patterns ("adjust state during render" in
    Header/CategoryView/AccountView, render-time bail-out in
    PaymentSuccessView, class-toggle Reveal, hoisted `Stars`/`EmptyCart`/
    `Summary` components, dynamic import in `orderStore`);
  - pre-existing errors in AdminShell/CheckoutViews covered by justified,
    documented `eslint-disable` lines (async fetch-on-mount / post-mount
    sessionStorage hydration are intentional patterns).
  - Remaining 47 warnings are pre-existing (`no-img-element` matches the
    repo's `<img>` convention, unused vars in admin).
- `git.patch` — generated with
  `git add -A && git diff --cached 23d9477073ea3851fe13b5a62623ec8015cf7966 > git.patch`
  and verified on a **fresh clone** of that commit: `git apply --check`
  passes, the patch applies for real, and the patched tree typechecks
  (`tsc --noEmit` = 0).

---

## Assumptions & notes

1. **Receipt PDF export** uses the browser's print pipeline ("Save as PDF")
   rather than adding a heavy dependency (jsPDF/html2canvas). The print
   stylesheet reproduces the on-screen ticket 1:1 (verified by PDF text
   extraction: only receipt content, all chrome excluded).
2. **Card details on the receipt** come exclusively from the PayHere IPN
   (`card_holder_name`, masked `card_no`, `method`). When the gateway does
   not supply them, the last-4 row is simply not rendered — never faked.
3. **Auth avatar**: the User model has no `picture` field today; the client
   renders it the moment one exists (`AuthUser.picture` is wired end-to-end),
   otherwise initials/icon fallback per the brief.
4. **Broken product images**: the GitHub-raw CDN was intermittently
   unreachable during the audit; the existing `onError → pending.png`
   fallback now cannot break layout anymore (fix #2 above).
5. **Deals** remains `/shop?tag=deal` (a filtered view of the shop), which
   satisfies the category-page requirements through the same
   skeleton/filter/sort/empty/error machinery.
6. `.env.local` used for local end-to-end payment testing is gitignored and
   **not** part of the patch.

---

# Part 2 — Follow-up Issues (Infinite Scroll, Image Optimization, Store Badges)

Base commit unchanged: `23d9477` — this part layers on top of Part 1.

## ISSUE 1 — Pagination → continuous loading (infinite scroll)

**Deleted (all pagination code):**
- `CategoryView.tsx`: `PAGE_SIZE`, `pageWindow()`, `page`/`setPage` state,
  `prevQueryKey` reset logic, `resetPage`, `totalPages`, `safePage`,
  `pageItems`, and the entire `<nav class="pagination">` markup.
- `Skeleton.tsx`: the fake pagination block inside `CategoryPageSkeleton`.
- `globals.css`: all `.pagination` rules (base block, `:hover`, `.on`,
  `:disabled`, `.pg-gap`, `:active` press-feedback line).
- No standalone pagination component file existed (it was inline).

**Architecture:**
- `app/(main)/shop/page.tsx` + `app/(main)/shop/[category]/page.tsx` stay
  Server Components that fetch + render the FIRST batch (12) for SEO/fast
  first paint, plus the total count and sidebar facet counts.
- New `app/components/ui/ProductGrid.tsx` (client) receives the first batch
  as props and loads further batches.
- New `app/api/products/route.ts` — **Route Handler chosen over a Server
  Action** because it is a cacheable GET that pairs naturally with plain
  `fetch()` + `AbortController` (Server Actions are POSTs with awkward
  cancellation), and it matches the repo's existing `app/api/*` convention.
- **Offset-based paging chosen over cursor**: the catalog is static/
  read-mostly with deterministic sorts and no concurrent writes, so keyset
  cursors add complexity for zero benefit; offsets are trivially resumable
  after an error. Dedupe-by-id already guards the shift case.
- Trigger: IntersectionObserver on a sentinel div, `rootMargin: 300px` —
  no scroll listeners. Duplicate requests blocked by `loadingRef`;
  duplicate products dropped by a `Set` of ids.
- Skeleton cards render INSIDE the grid while a batch loads (zero jump).
  End of list: observer disconnected + "You've reached the end".
- Errors: "Failed to load. Retry" — retry resumes from the SAME offset
  (verified live by blocking `/api/products` and unblocking).
- Filters/sort/category changes: filters now live in searchParams
  (`brands, cats, min, max, stock, sale, sort, q, tag` — shareable URLs),
  `ProductGrid` is keyed by the canonical query string, so any change
  remounts it → list, cursor and observer reset to batch 1, and the unmount
  cleanup aborts the in-flight request. Scroll resets to the results header
  (`scroll-margin-top` clears the sticky header).
- Back-navigation: loaded batches + scroll offset are cached in
  sessionStorage (15-min TTL, capped at 240 items, single-entry pruning)
  and restored on back/forward. On Chromium/Next 16 the restore is gated on
  the **Navigation API `traverse` event** (Next renders the destination
  BEFORE `popstate` fires — a popstate-only flag would be too late; found
  and fixed during live testing). Verified: 55/55 cards + exact scrollY
  restored after PDP → back.
- Shared pure query engine `lib/catalog.ts` used by both pages and the API
  route so they can never drift.

## ISSUE 2 — Category-page image optimization

- `ProductCard` now uses `next/image` with `fill` inside the existing
  `position:relative` `.pcard-img` (fixed 160px height) → box fully
  reserved before load → **zero CLS**; `object-fit: cover` kept.
- `next.config.ts`: `images.formats = ['image/avif','image/webp']`,
  `remotePatterns` scoped to `raw.githubusercontent.com/dev-sandakelum/
  product-images-for-vertex-computers/**`, `minimumCacheTTL` = 30 days
  (sources are path-versioned/immutable).
- `sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"` —
  mobile downloads ~2x smaller files.
- `quality={75}` for grid thumbnails (PDP keeps full-size images).
- `priority` ONLY for the first 4 above-the-fold cards of the initial
  server batch (verified: eager + 4 preload links); every batch-loaded
  card is lazy.
- `placeholder="blur"` with a shared tiny gradient `blurDataURL`
  (per-image blur hashes unavailable at build for 723 remote images).
- `onError` swaps to the new local `/placeholder-product.png`
  (generated 800×800 neutral fallback).
- `React.memo` on ProductCard — appending batches re-renders the grid but
  skips every existing card (stable object references).
- Measured on a live card (worst-case largest candidate): 169KB source
  JPEG → 77KB WebP / **46KB AVIF (−73%)**; at the actual rendered
  ~360px cell the optimizer serves ~10–20KB.
- Grid entrance stagger capped at 12 cards; appended cards animate with
  zero delay so batches feel instant.
- NOTE (follow-up, out of scope): `(main)/layout.tsx` still ships the full
  723-product catalog (~3.2MB) to `AppProvider` for cart/wishlist lookups,
  and `lib/data.ts` bundles `products.json` into client JS. Moving those
  to on-demand `/api/products` lookups is the single biggest remaining
  page-weight win.

## ISSUE 3 — Google Play / App Store badges

- New `app/components/ui/StoreBadge.tsx` — reusable badge
  (`store: "google" | "apple"`, optional `href`).
- Inline SVG marks added to the organized icon library
  (`GooglePlayMark`, `AppleMark`) following the existing brand-mark
  conventions; no external icon libs.
- Dark navy (#0C111D), 1px subtle border, 10px radius, 168×52, kicker +
  bold store name; hover = translateY(-2px) + soft shadow + brighter bg
  (200ms); `:focus-visible` ring; aria-labels; `target="_blank"
  rel="noopener noreferrer"`.
- Store URLs centralized in `lib/siteConfig.ts` (`STORE_LINKS`) — swap
  the two placeholders when the listings go live.
- Responsive: stacked in the desktop footer column → side by side on
  tablet (641–1024px) → full-width stacked on small mobile (added the
  badges to `MobileFooter.tsx` too, since `footer.site` is hidden ≤640px).
- Old plain-text `.apps` styles replaced; VLM-verified both marks render
  correctly.

## Verification (Part 2)

- `npm run build` ✓, `tsc --noEmit` ✓, `npm run lint` = **0 errors**
  (warnings unchanged, pre-existing).
- Live-tested with dev server + headless browser:
  - /shop/gpus: 12 → 24 → 36 → 55 cards while scrolling; 4 API calls;
    end message; sentinel unmounted.
  - Brand filter → `?brands=Ashenfire+Graphics` (11 cards), sort=lo,
    stock=1, min=99999 → server-rendered empty state → Clear all.
  - Deep links work cold: `/shop?q=rtx` → 35 results.
  - Blocked `/api/products` → retry banner → unblock → retry resumed at
    the same offset (12→12 in the request log).
  - Back-nav: 55 cards + exact scroll offset restored (Navigation API fix).
  - AVIF/WebP content negotiation verified via curl.
  - Badges: desktop/tablet/mobile layouts + VLM visual check, 0 console
    errors on all tested routes.

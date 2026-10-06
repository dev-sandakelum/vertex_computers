# Cart System Report — Vertex Computers

A full walkthrough of how the cart works in this Next.js e-commerce app, from data structure through to checkout.

---

## 1. Data Structure

Each cart item is a minimal object defined in `lib/store.ts`:

```ts
interface CartItem {
  id: number;   // matches a product's id in products.json
  q: number;    // quantity
}
```

The cart is just an array of these objects: `CartItem[]`. Product details (name, price, images, etc.) are always looked up from the static `PRODUCTS` array in `lib/data.ts` using the `id` — nothing is duplicated inside the cart itself.

---

## 2. State Management — `AppProvider`

The entire cart state lives in `app/components/providers/AppProvider.tsx`. This is a React Context + `useReducer` setup that wraps the whole app.

### State shape

```ts
interface AppState {
  cart: CartItem[];
  theme: 'light' | 'dark';
  toast: string;
  toastVisible: boolean;
  // ...drawer/search flags
}
```

### Cart actions (dispatched to the reducer)

| Action type | What it does |
|---|---|
| `ADD_TO_CART` | Adds a product by `id`. If it already exists in the cart, increments `q` instead of duplicating. |
| `CHANGE_QTY` | Increments or decrements `q` for the item at a given array index. Minimum quantity is `1`. |
| `REMOVE_ITEM` | Removes a single item by its array index. |
| `REMOVE_ITEMS` | Removes multiple items by an array of indices (bulk delete). |
| `CLEAR_CART` | Empties the entire cart. |

### Derived computed values

These are calculated on every render inside `AppProvider` and exposed via context:

```ts
cartCount    = sum of all item quantities
cartSubtotal = sum of (product.price × item.q) for every item
cartTax      = cartSubtotal × 0.0725   // 7.25% flat rate
cartTotal    = cartSubtotal + cartTax
```

---

## 3. Persistence — `cartStorage.ts`

The cart survives page refreshes via `localStorage`.

```
Key: "vertex_cart"
Value: JSON string of CartItem[]
```

### How it works

1. **On mount** — `AppProvider` runs `loadCart()` and dispatches `ADD_TO_CART` for each saved item. This happens client-side only (after hydration) to avoid SSR mismatches.
2. **On every change** — a `useEffect` watching `state.cart` calls `saveCart(state.cart)` automatically.
3. **First-ever visit** — if no cart exists in `localStorage`, `defaultCart()` pre-populates 3 demo items (product IDs 0, 3, 4).

---

## 4. Adding Items to the Cart

There are three places in the UI where users can add items:

### A. Product Card (`ProductCard.tsx`)
Every card shown on the shop/category page has an `+` button in the bottom-right corner.

- Clicking it calls `addToCart(p.id, 1)`.
- If the product's `stock` is `"out"`, the button is disabled and visually greyed out.
- A toast notification appears: _"Added to cart — [Product name] ✓"_

### B. Product Detail Page (`ProductView.tsx`)
The full product page has a quantity selector + "Add to Cart" button.

- Users can set a quantity (minimum 1) before adding.
- Calls `addToCart(p.id, qty)` with the chosen quantity.
- The same toast feedback appears.
- "Frequently Bought Together" related products also have their own `+` add buttons.

### C. Mobile sticky buy bar
On mobile, the product detail page shows a sticky bar pinned to the bottom of the screen with the same quantity control and "Add to Cart" button.

---

## 5. The Cart Page (`/cart`)

Route: `app/(main)/cart/page.tsx` → renders `CartView.tsx`

### What's displayed

- Item count in the heading: _"Your Cart (N items)"_
- For each cart item:
  - SVG icon from the product's category
  - Product name, brand, first spec value, stock badge
  - Quantity stepper (− / +), capped at minimum 1
  - Line total: `product.price × quantity`
  - Remove button (single item)
  - Checkbox for bulk selection

### Bulk delete
Users can tick checkboxes on individual items to select them. A bulk action bar appears showing:
- A "Select all / Deselect all" toggle
- Count of selected items
- A red "🗑 Delete selected (N)" button

After bulk delete, the selection state is cleared and a toast confirms removal.

### Order Summary sidebar
Always visible alongside the item list (or below on mobile):

| Line | Value |
|---|---|
| Subtotal | Sum of all line totals |
| Shipping | FREE (always) |
| Est. tax | 7.25% of subtotal |
| **Total** | Subtotal + tax |

There is also a promo code input field. Applying any code shows a toast but does not actually change the total (UI demo only).

### Empty state
If the cart is empty, a friendly empty state is shown with a link to `/shop`.

---

## 6. Checkout Flow

From the cart, clicking "Proceed to Checkout" navigates to a 3-step checkout:

```
/checkout/shipping  →  /checkout/review  →  /checkout/confirm
```

A step indicator at the top shows progress. All three steps are rendered by `CheckoutViews.tsx`.

### Step 1 — Shipping (`/checkout/shipping`)
Collects:
- Name, email, phone
- Full shipping address (street, city, state, ZIP, country)
- Shipping method: Standard (FREE, 5–7 days) or Express ($24.90, 2 days)

### Step 2 — Review (`/checkout/review`)
Shows:
- Shipping address summary (with Edit link back to step 1)
- Payment form (card number, expiry, CVC, name on card)
- Mini cart (each item with name, qty, and line total)
- "Place Order — $XX.XX" CTA

### Step 3 — Confirmation (`/checkout/confirm`)
- Order confirmed screen with a check animation
- Static order number (`#VX-2026081617`)
- Confirmation email notice
- Estimated delivery window
- Links to Track Order and Continue Shopping

> **Note:** The checkout is a UI prototype. No payment is processed and the cart is not cleared after "placing" an order.

---

## 7. Cart Count Badge in the Header

`Header.tsx` reads `cartCount` from the context. When `cartCount > 0`, a red badge overlays the cart icon showing the total item count. It updates in real time as items are added or removed.

---

## 8. Toast Notifications

Every cart action triggers a short toast via `showToast(msg)` in `AppProvider`. The toast auto-dismisses after **2400ms**. If a new toast is triggered before the previous one clears, the timer resets.

---

## 9. Data Flow Summary

```
User clicks "Add to Cart"
        │
        ▼
addToCart(id, qty)          ← exposed from useApp() context
        │
        ▼
dispatch ADD_TO_CART        ← reducer merges or appends to cart array
        │
        ▼
state.cart updates
        │
        ├── saveCart() → localStorage["vertex_cart"]   (persisted)
        │
        ├── cartCount / cartSubtotal / cartTax / cartTotal recomputed
        │
        └── CartView / Header badge / Checkout summary re-render
```

---

## 10. Key Files Reference

| File | Role |
|---|---|
| `lib/store.ts` | `CartItem` type definition |
| `lib/cartStorage.ts` | localStorage read/write helpers + default cart |
| `lib/data.ts` | Product types, `PRODUCTS` array, price/format helpers |
| `app/components/providers/AppProvider.tsx` | Global state, reducer, context, derived totals |
| `app/components/ui/ProductCard.tsx` | Add-to-cart from shop/category grid |
| `app/components/views/ProductView.tsx` | Add-to-cart from product detail page |
| `app/components/views/CartView.tsx` | Full cart UI (items, summary, bulk delete) |
| `app/components/views/CheckoutViews.tsx` | Shipping, Review, Confirmation steps |
| `app/(main)/cart/page.tsx` | Next.js route for `/cart` |

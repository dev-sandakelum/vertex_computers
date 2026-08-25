// Pure types — no external dependencies
export interface CartItem {
  id: number;
  q: number;
}

export type AppView =
  | 'home'
  | 'category'
  | 'product'
  | 'cart'
  | 'checkout-shipping'
  | 'checkout-review'
  | 'checkout-confirm'
  | 'login'
  | 'register'
  | 'account';

/**
 * PayHere integration — shared types & constants
 */

/** Maps PayHere's numeric status_code to a readable status */
export type PayHereStatusCode = 2 | 0 | -1 | -2 | -3;

export const PAYHERE_STATUS: Record<PayHereStatusCode, OrderStatus> = {
  2:  'PAID',
  0:  'PENDING',
  '-1': 'CANCELLED',
  '-2': 'FAILED',
  '-3': 'REFUNDED',
};

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

/** A single cart item snapshot stored in the order */
export interface OrderItem {
  productId: number;
  name: string;
  price: number;       // unit price at time of order
  quantity: number;
  lineTotal: number;
}

/** The order record stored server-side (and in localStorage for the client) */
export interface Order {
  orderId: string;        // e.g. ORDER-20261005-XXXX
  userId: string;         // user email (client-side "ID")
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;       // "USD"
  status: OrderStatus;
  payherePaymentId?: string;
  paymentMethod?: string;
  createdAt: string;      // ISO timestamp
  updatedAt: string;      // ISO timestamp

  // Shipping snapshot
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

/** Body the client POSTs to /api/payhere/hash */
export interface CreateOrderRequest {
  cartItems: { id: number; q: number }[];
  shipping: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
  };
}

/** Response from /api/payhere/hash */
export interface CreateOrderResponse {
  orderId: string;
  hash: string;
  merchantId: string;
  amount: string;          // formatted "1000.00"
  currency: string;
  sandbox: boolean;
  items: string;           // human-readable description for PayHere
}

/** Notification body posted by PayHere to /api/payhere/notify */
export interface PayHereNotification {
  merchant_id: string;
  order_id: string;
  payment_id: string;
  payhere_amount: string;
  payhere_currency: string;
  status_code: string;
  md5sig: string;
  method?: string;
  status_message?: string;
  custom_1?: string;
  custom_2?: string;
  card_holder_name?: string;
  card_no?: string;
  card_expiry?: string;
}

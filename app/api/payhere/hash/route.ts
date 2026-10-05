/**
 * POST /api/payhere/hash
 *
 * Creates a pending order and returns the PayHere checkout hash.
 * The hash is generated server-side — the merchant secret never leaves the server.
 *
 * Request body: CreateOrderRequest
 * Response:     CreateOrderResponse
 */

import { NextRequest, NextResponse } from 'next/server';
import { PRODUCTS } from '@/lib/data';
import { getMerchantId, getMerchantSecret, isSandbox, getAppUrl } from '@/lib/payhere/config';
import { generateCheckoutHash, formatAmount } from '@/lib/payhere/hash';
import { generateOrderId, saveOrder } from '@/lib/orderStore';
import type { CreateOrderRequest, CreateOrderResponse, Order, OrderItem } from '@/lib/payhere/types';

export async function POST(req: NextRequest) {
  try {
    const body: CreateOrderRequest = await req.json();

    // ── 1. Validate shipping info ────────────────────────────────
    const { shipping, cartItems } = body;

    if (
      !shipping?.firstName?.trim() ||
      !shipping?.lastName?.trim() ||
      !shipping?.email?.trim() ||
      !shipping?.phone?.trim() ||
      !shipping?.address?.trim() ||
      !shipping?.city?.trim() ||
      !shipping?.country?.trim()
    ) {
      return NextResponse.json(
        { error: 'Shipping information is incomplete.' },
        { status: 400 },
      );
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty.' },
        { status: 400 },
      );
    }

    // ── 2. Resolve products from server-side data (never trust client price) ──
    const orderItems: OrderItem[] = [];
    for (const item of cartItems) {
      const product = PRODUCTS.find((p) => p.id === item.id);
      if (!product) {
        return NextResponse.json(
          { error: `Product with ID ${item.id} not found.` },
          { status: 400 },
        );
      }
      if (product.stock === 'out') {
        return NextResponse.json(
          { error: `"${product.name}" is out of stock.` },
          { status: 400 },
        );
      }
      const qty = Math.max(1, Math.floor(Number(item.q) || 1));
      orderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: qty,
        lineTotal: parseFloat((product.price * qty).toFixed(2)),
      });
    }

    // ── 3. Compute totals server-side ────────────────────────────
    const subtotal = orderItems.reduce((sum, i) => sum + i.lineTotal, 0);
    const tax      = parseFloat((subtotal * 0.0725).toFixed(2));
    const total    = parseFloat((subtotal + tax).toFixed(2));
    const currency = 'USD';

    // ── 4. Generate order ID and create pending order ────────────
    const orderId = generateOrderId();
    const now = new Date().toISOString();

    const order: Order = {
      orderId,
      userId: shipping.email.toLowerCase().trim(), // email as userId (no server auth)
      items: orderItems,
      subtotal,
      tax,
      total,
      currency,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
      firstName: shipping.firstName.trim(),
      lastName:  shipping.lastName.trim(),
      email:     shipping.email.trim(),
      phone:     shipping.phone.trim(),
      address:   shipping.address.trim(),
      city:      shipping.city.trim(),
      country:   shipping.country.trim(),
    };

    saveOrder(order);

    // ── 5. Generate checkout hash ────────────────────────────────
    const amountStr = formatAmount(total);
    const hash = generateCheckoutHash(
      getMerchantId(),
      orderId,
      amountStr,
      currency,
      getMerchantSecret(),
    );

    // ── 6. Build item description string for PayHere "items" field ──
    const itemDescription =
      orderItems.length === 1
        ? `${orderItems[0].name} ×${orderItems[0].quantity}`
        : `${orderItems.length} items from Vertex Computers`;

    const appUrl = getAppUrl();

    const response: CreateOrderResponse & {
      returnUrl: string;
      cancelUrl: string;
      notifyUrl: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      country: string;
    } = {
      orderId,
      hash,
      merchantId: getMerchantId(),
      amount: amountStr,
      currency,
      sandbox: isSandbox(),
      items: itemDescription,
      returnUrl: `${appUrl}/payment/success?orderId=${orderId}`,
      cancelUrl:  `${appUrl}/payment/cancel?orderId=${orderId}`,
      notifyUrl:  `${appUrl}/api/payhere/notify`,
      firstName: order.firstName,
      lastName:  order.lastName,
      email:     order.email,
      phone:     order.phone,
      address:   order.address,
      city:      order.city,
      country:   order.country,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    console.error('[payhere/hash] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 },
    );
  }
}

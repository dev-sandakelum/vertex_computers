/**
 * Mongoose model for Order.
 * Mirrors the Order interface in lib/payhere/types.ts.
 * Replaces Upstash Redis as the server-side order store when MONGODB_URI is set.
 */

import mongoose, { Schema, model, models, Document } from 'mongoose';
import type { OrderStatus } from '@/lib/payhere/types';

const OrderItemSchema = new Schema(
  {
    productId: { type: Number, required: true },
    name:      { type: String, required: true },
    price:     { type: Number, required: true },
    quantity:  { type: Number, required: true },
    lineTotal: { type: Number, required: true },
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    orderId:           { type: String, required: true, unique: true, index: true },
    userId:            { type: String, required: true, index: true },
    items:             { type: [OrderItemSchema], required: true },
    subtotal:          { type: Number, required: true },
    tax:               { type: Number, required: true },
    total:             { type: Number, required: true },
    currency:          { type: String, required: true, default: 'USD' },
    status:            {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED'],
      required: true,
      default: 'PENDING',
    },
    payherePaymentId:  String,
    paymentMethod:     String,
    createdAt:         { type: String, required: true },
    updatedAt:         { type: String, required: true },

    // Shipping snapshot
    firstName: { type: String, required: true },
    lastName:  { type: String, required: true },
    email:     { type: String, required: true },
    phone:     { type: String, required: true },
    address:   { type: String, required: true },
    city:      { type: String, required: true },
    country:   { type: String, required: true },
  },
  {
    // We manage createdAt/updatedAt as ISO strings ourselves (matching the
    // existing Order interface) — disable Mongoose auto timestamps here.
    timestamps: false,
    collection: 'orders',
  },
);

export interface OrderDocument extends Document {
  orderId: string;
  userId: string;
  status: OrderStatus;
  total: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

const OrderModel =
  (models.Order as mongoose.Model<OrderDocument>) ??
  model<OrderDocument>('Order', OrderSchema);

export default OrderModel;

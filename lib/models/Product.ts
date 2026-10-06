/**
 * Mongoose model for Product.
 * Mirrors the Product interface in lib/data.ts exactly so local JSON
 * and DB documents stay in sync.
 *
 * The `id` field (numeric, from local JSON) is preserved as-is alongside
 * MongoDB's own `_id`. This lets existing code that relies on `product.id`
 * continue to work after fetching from the DB.
 */

import mongoose, { Schema, model, models, Document } from 'mongoose';

/* ── Sub-schemas ─────────────────────────────────────────── */

const ImageSchema = new Schema(
  { id: Number, url: String, alt: String, primary: Boolean },
  { _id: false },
);

const ReviewEntrySchema = new Schema(
  {
    id: String, author: String, avatar: Schema.Types.Mixed,
    rating: Number, title: String, body: String,
    date: String, verified: Boolean, helpful: Number,
  },
  { _id: false },
);

const ShippingSchema = new Schema(
  {
    freeShipping: Boolean,
    freeShippingThreshold: Number,
    estimatedDelivery: String,
    expedited: { available: Boolean, label: String, price: Number },
    weight: String,
    dimensions: { length: Number, width: Number, height: Number, unit: String },
  },
  { _id: false },
);

const WarrantySchema = new Schema(
  { duration: String, type: String, extendable: Boolean, extensionOptions: [String] },
  { _id: false },
);

const ReturnsSchema = new Schema(
  { window: Number, windowUnit: String, condition: String, freeReturns: Boolean },
  { _id: false },
);

const CompatibilitySchema = new Schema(
  { notes: String, testedBoards: [String] },
  { _id: false },
);

const MetadataSchema = new Schema(
  { createdAt: String, updatedAt: String, publishedAt: Schema.Types.Mixed, visible: Boolean, featured: Boolean },
  { _id: false },
);

/* ── Main Product schema ─────────────────────────────────── */

const ProductSchema = new Schema(
  {
    id:               { type: Number, required: true, unique: true },
    brand:            { type: String, required: true },
    name:             { type: String, required: true },
    slug:             { type: String, required: true },
    category:         { type: String, required: true },
    categorySlug:     { type: String, required: true },
    icon:             String,
    price:            { type: Number, required: true },
    oldPrice:         Schema.Types.Mixed,
    currency:         String,
    savings:          Schema.Types.Mixed,
    savingsPercent:   Schema.Types.Mixed,
    stock:            String,
    stockLabel:       String,
    stockCount:       Number,
    rating:           String,
    reviewCount:      Number,
    sku:              String,
    upc:              String,
    partNumber:       String,
    shortDescription: String,
    images:           [ImageSchema],
    specs:            { type: Map, of: String },
    tags:             [String],
    badges:           [String],
    highlights:       [String],
    bundledItems:     [{ name: String, quantity: Number }],
    shipping:         ShippingSchema,
    warranty:         WarrantySchema,
    returns:          ReturnsSchema,
    compatibility:    CompatibilitySchema,
    reviews: {
      average: Number,
      total: Number,
      distribution: { type: Map, of: Number },
      featured: [ReviewEntrySchema],
    },
    relatedProductIds:       [Number],
    frequentlyBoughtWith:    [Number],
    metadata:                MetadataSchema,
  },
  {
    timestamps: true,   // adds createdAt / updatedAt at the document level
    collection: 'products',
  },
);

/* ── Text search index: name, brand, category, shortDescription ── */
ProductSchema.index({ name: 'text', brand: 'text', category: 'text', shortDescription: 'text' });

export interface ProductDocument extends Document {
  id: number;
  brand: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  price: number;
  [key: string]: unknown;
}

// `models.Product` guard prevents "OverwriteModelError" on hot-reload
const ProductModel =
  (models.Product as mongoose.Model<ProductDocument>) ??
  model<ProductDocument>('Product', ProductSchema);

export default ProductModel;

/**
 * Mongoose model for Brand.
 * Mirrors the shape of lib/brands.json.
 */

import mongoose, { Schema, model, models, Document } from 'mongoose';

const BrandSchema = new Schema(
  {
    id:       { type: String, required: true, unique: true, index: true },
    name:     { type: String, required: true },
    logo:     { type: String, required: true },
    tagline:  String,
    category: String,
    website:  String,
    featured: { type: Boolean, default: false },
    products: [String],
  },
  { timestamps: true, collection: 'brands' },
);

export interface BrandDocument extends Document {
  id: string;
  name: string;
  logo: string;
  [key: string]: unknown;
}

const BrandModel =
  (models.Brand as mongoose.Model<BrandDocument>) ??
  model<BrandDocument>('Brand', BrandSchema);

export default BrandModel;

/**
 * Mongoose model for User.
 * Passwords are hashed with bcryptjs before storage.
 */

import mongoose, { Schema, model, models, Document } from 'mongoose';

const AddressSchema = new Schema(
  {
    _id:       { type: String, required: true },  // client-generated uuid
    label:     { type: String, default: 'Home' }, // e.g. "Home", "Work"
    firstName: String,
    lastName:  String,
    address:   String,
    apt:       String,
    city:      String,
    state:     String,
    zip:       String,
    country:   String,
    phone:     String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: false },
);

const UserSchema = new Schema(
  {
    firstName:     { type: String, required: true },
    lastName:      { type: String, required: true },
    email:         { type: String, required: true, unique: true, index: true },
    phone:         { type: String, required: true },
    password:      { type: String, required: true }, // bcrypt hash
    rememberMe:    { type: Boolean, default: false },
    acceptedTerms: { type: Boolean, default: false },
    createdAt:     { type: String, required: true },
    role:          { type: String, enum: ['user', 'admin'], default: 'user' },
    addresses:     { type: [AddressSchema], default: [] },
    wishlist:      { type: [Number], default: [] }, // product IDs
  },
  { timestamps: false, collection: 'users' },
);

export interface Address {
  _id: string;
  label: string;
  firstName: string;
  lastName: string;
  address: string;
  apt: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface UserDocument extends Document {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  role: string;
  createdAt: string;
  addresses: Address[];
  wishlist: number[];
  [key: string]: unknown;
}

const UserModel =
  (models.User as mongoose.Model<UserDocument>) ??
  model<UserDocument>('User', UserSchema);

export default UserModel;

/**
 * Mongoose model for system activity logs.
 * Captures admin push events, payment events, and errors.
 */

import mongoose, { Schema, model, models, Document } from 'mongoose';

const LogSchema = new Schema(
  {
    level:     { type: String, enum: ['info', 'warn', 'error', 'success'], default: 'info' },
    category:  { type: String, required: true }, // e.g. "push", "payment", "auth"
    message:   { type: String, required: true },
    meta:      { type: Schema.Types.Mixed },      // arbitrary extra data
    timestamp: { type: String, required: true },  // ISO string
  },
  { timestamps: false, collection: 'logs' },
);

LogSchema.index({ category: 1, timestamp: -1 });

export interface LogDocument extends Document {
  level: string;
  category: string;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

const LogModel =
  (models.Log as mongoose.Model<LogDocument>) ??
  model<LogDocument>('Log', LogSchema);

export default LogModel;

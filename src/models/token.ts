// models/token.ts
import mongoose, { Schema, Model, Document, Types } from 'mongoose';

export interface TokenAttrs {
  userId: Types.ObjectId; // references the user document
  token: string;
}

export interface TokenDoc extends Document, TokenAttrs {
  createdAt: Date;
}

export interface TokenModel extends Model<TokenDoc> {}

const tokenSchema = new Schema<TokenDoc>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'user' }, // use "User" if your model is named that
    token: { type: String, required: true },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 3600, // TTL: 1 hour
    },
  },
  { versionKey: false }
);

// Reuse existing model in dev/hot-reload environments
export const Token: TokenModel = mongoose.models.Token || mongoose.model<TokenDoc, TokenModel>('Token', tokenSchema);

export default Token;

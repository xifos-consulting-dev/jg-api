// models/Owner.ts
import { Schema, model } from 'mongoose';

const OwnerSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    identification: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true, index: true },
    phone: { type: String, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
  },
  { timestamps: true }
);

OwnerSchema.virtual('id').get(function () {
  return this._id.toString();
});

OwnerSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: Record<string, unknown>) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
export default model('owners', OwnerSchema);

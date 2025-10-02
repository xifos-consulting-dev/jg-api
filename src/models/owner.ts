// models/Owner.ts
import { Schema, model } from 'mongoose';

const OwnerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    displayName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true, index: true },
    phone: { type: String, trim: true },
    identification: { type: String, trim: true },

    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },

    propertyIds: [{ type: Schema.Types.ObjectId, ref: 'Property', index: true }],

    metrics: {
      stances: { type: Number, default: 0, min: 0 },
      income: { type: Number, default: 0, min: 0 },
      expenses: { type: Number, default: 0, min: 0 },
    },
  },
  { timestamps: true }
);

// convenient virtual for UI
OwnerSchema.virtual('fullName').get(function () {
  return this.displayName || `${this.name}`.trim();
});

OwnerSchema.index({ lastName: 1, name: 1 });
export default model('Owner', OwnerSchema);

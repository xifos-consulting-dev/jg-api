// models/Venue.ts
import { Schema, model } from 'mongoose';

const AddressSchema = new Schema(
  {
    line1: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
  },
  { _id: false }
);

const VenueSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 140 },
    slug: { type: String, trim: true, lowercase: true, index: true },
    status: { type: String, enum: ['available', 'unavailable', 'maintenance'], default: 'available', index: true },
    stances: { type: Number, min: 0, default: 0 }, // the numeric UI field
    ownerId: { type: Schema.Types.ObjectId, ref: 'Owner', required: true, index: true },
    description: { type: String, trim: true, maxlength: 5000 },
    address: { type: AddressSchema },
    tags: { type: [String], default: [] },
    // Images: store just URLs (as requested)
    coverImageUrl: { type: String, trim: true },
    imageUrls: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Helpful indexes and virtuals
VenueSchema.index({ name: 'text', description: 'text', tags: 1 });

VenueSchema.virtual('images', {
  get(this: any) {
    // convenience to always return cover + gallery (unique, ordered)
    const all = [this.coverImageUrl, ...(this.imageUrls || [])].filter(Boolean);
    return Array.from(new Set(all));
  },
});

export default model('Venue', VenueSchema);

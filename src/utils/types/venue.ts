export type VenueStatus = 'available' | 'unavailable' | 'maintenance';

export interface Venue {
  _id: string;
  name: string;
  slug?: string; // for pretty URLs
  status: VenueStatus; // matches UI dropdown
  stances?: number; // the numeric field in the UI/table
  ownerId: string; // ref to Owner._id
  coverImageUrl?: string; // single cover image URL
  imageUrls: string[]; // additional image URLs
  description?: string;

  // Optional extras you might add later:
  address?: {
    line1?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  tags?: string[]; // e.g., ["beach", "wifi"]

  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

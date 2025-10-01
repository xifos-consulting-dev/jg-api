import { Document } from 'mongoose';
export type OwnerStatus = 'active' | 'inactive';

export interface Owner extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  email?: string;
  phone?: string;
  taxId?: string; // local tax identifier if needed

  status: OwnerStatus; // active/inactive
  notes?: string;

  // Relations (denormalized helpers)
  propertyIds: string[]; // ObjectId[] in DB
  // Optional aggregates for the table/filtering:
  metrics?: {
    stances?: number; // stays/period count shown in the table
    income?: number; // e.g., current period or lifetime (define in your service)
    expenses?: number; // same scope as income
  };

  createdAt: string; // ISO Date
  updatedAt: string; // ISO Date
}

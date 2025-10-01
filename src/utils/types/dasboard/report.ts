import { Types, Document } from 'mongoose';

export interface Report extends Document {
  propertyId: Types.ObjectId; // the apartment/house this report belongs to
  createdBy: Types.ObjectId; // user who submitted it
  period: {
    // report period (e.g., May 2025)
    year: number; // 4-digit year
    month: number; // 1–12
  };
}

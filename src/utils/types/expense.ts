import { Document } from 'mongoose';

type Money = number; // USD amount, e.g., 121.00

interface IOtherExpense {
  name: string;
  amount: Money;
  description?: string;
}

export interface Expense extends Document {
  common: {
    electricity?: Money;
    water?: Money;
    internet?: Money;
    managementFee?: Money;
    cleaningService?: Money;
    gardeningService?: Money;
    poolMaintenance?: Money;
  };

  other: IOtherExpense[];
  notes?: string;
  totalCommon: number;
  totalOther: number;
  grandTotal: number;
}

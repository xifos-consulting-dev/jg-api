import { Schema, Document } from 'mongoose';

type Money = number;

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

  // virtuals
  totalCommon: number;
  totalOther: number;
  grandTotal: number;
}

// ----- Schemas -----
const moneyField = (required = false) => ({ type: Number, required, min: 0, validate: Number.isFinite }) as const;

const OtherExpenseSchema = new Schema<IOtherExpense>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    amount: moneyField(true),
    description: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const ExpenseSchema = new Schema<Expense>(
  {
    common: {
      electricity: moneyField(),
      water: moneyField(),
      internet: moneyField(),
      managementFee: moneyField(),
      cleaningService: moneyField(),
      gardeningService: moneyField(),
      poolMaintenance: moneyField(),
    },
    other: { type: [OtherExpenseSchema], default: [] },
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ----- Virtual totals -----
ExpenseSchema.virtual('totalOther').get(function (this: Expense) {
  return (this.other || []).reduce((sum, it) => sum + (it.amount || 0), 0);
});

ExpenseSchema.virtual('grandTotal').get(function (this: Expense) {
  return this.totalCommon + this.totalOther;
});
export default ExpenseSchema;

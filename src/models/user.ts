// models/user-credential.ts
import mongoose, { Schema, Model, Document } from 'mongoose';
import { object, string, boolean, InferType, ValidationError } from 'yup';

export type UserCredential = {
  id: string;
  user: string; // username or email (your call)
  password: string; // hashed or plain (validate accordingly)
  name: string;
  role: string; // e.g., "admin" | "user"
  active: boolean;
};

// If you're creating/updating via API, you usually don't accept `id` from clients:
export type UserCredentialInput = Omit<UserCredential, 'id'>;

// ---- 2) Mongoose Doc & Model types ----
export interface UserCredentialDoc extends Document {
  email: string;
  password: string;
  name: string;
  role: string;
  active: boolean;
}

export interface UserCredentialModel extends Model<UserCredentialDoc> {}

// ---- 3) Mongoose schema/model ----
const userCredentialSchema = new Schema<UserCredentialDoc>(
  {
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    password: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true }, // optionally restrict with enum
    active: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        // expose `id` instead of `_id`, remove internal fields
        if (ret && typeof ret._id !== 'undefined' && ret._id !== null) {
          const maybe = ret._id as mongoose.Types.ObjectId | { toString?: () => string } | string | number | null | undefined;
          const asString =
            typeof maybe === 'string'
              ? maybe
              : typeof maybe === 'number'
                ? String(maybe)
                : typeof maybe === 'object' && maybe !== null && typeof maybe.toString === 'function'
                  ? maybe.toString()
                  : undefined;
          if (asString) {
            ret.id = asString;
          }
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Optional unique username/email:
// userCredentialSchema.index({ user: 1 }, { unique: true });

export const UserCredentialModel: UserCredentialModel = mongoose.models.UserCredential || mongoose.model<UserCredentialDoc, UserCredentialModel>('UserCredential', userCredentialSchema);

// ---- 4) Yup validation (API boundary) ----
// Adjust rules to your product needs (min length, role enum, etc.)
export const userCredentialYup = object({
  user: string()
    .trim()
    .required('user is required')
    // If 'user' is an email, add .email("must be a valid email")
    .min(3, 'user must be at least 3 characters'),
  password: string().required('password is required').min(8, 'password must be at least 8 characters'),
  name: string().trim().required('name is required').min(2).max(120),
  role: string().trim().required('role is required'),
  active: boolean().required('active is required'),
}).noUnknown(true, ({ unknown }) => `Unknown field(s): ${unknown.join(', ')}`);

// Type inferred from Yup schema (what controllers should accept)
export type UserCredentialValidated = InferType<typeof userCredentialYup>;

// ---- 5) Helper to run validation and return a friendly shape ----
export type ValidationErrorDetail = { path?: string | undefined; message: string };
export type ValidationResult<T> = { value: T; error: null } | { value: null; error: { message: string; details: ValidationErrorDetail[] } };

export async function validateUserCredential(payload: unknown): Promise<ValidationResult<UserCredentialInput>> {
  try {
    const value = await userCredentialYup.validate(payload, { abortEarly: false });
    return { value, error: null };
  } catch (err) {
    if (!(err instanceof ValidationError)) {
      return {
        value: null,
        error: {
          message: 'Validation failed',
          details: [{ message: 'Unknown validation error' }],
        },
      };
    }

    const details: ValidationErrorDetail[] =
      err.inner && err.inner.length > 0
        ? err.inner.map((validationError) => ({
            path: validationError.path ?? undefined,
            message: validationError.message,
          }))
        : [{ path: err.path ?? undefined, message: err.message }];
    return { value: null, error: { message: 'Validation failed', details } };
  }
}

export default UserCredentialModel;

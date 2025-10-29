export type OwnerStatus = 'active' | 'inactive';

export interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email?: string | null;
  phone?: string | null;
  identification: string;
  status: OwnerStatus;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

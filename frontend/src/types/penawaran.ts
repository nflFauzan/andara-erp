export type PenawaranStatus = 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface PenawaranDetail {
  id: number;
  penawaranId: number;
  kegiatanId?: number;
  kegiatanName?: string;
  kegiatanItemId?: number;
  description: string;
  volume: number;
  unit: string;
  unitPrice: number;
  amount: number;
  sortOrder: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Penawaran {
  id: number;
  number: string;
  customerId: number;
  customerCode: string;
  customerName: string;
  date: string;
  status: PenawaranStatus;
  statusLabel: string;
  notes?: string;
  terms?: string;
  totalAmount: number;
  itemCount: number;
  details: PenawaranDetail[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreatePenawaranDetailInput {
  kegiatanId?: number;
  kegiatanItemId?: number;
  description: string;
  volume: number;
  unit: string;
  unitPrice: number;
  sortOrder?: number;
  notes?: string;
}

export interface CreatePenawaranInput {
  customerId: number;
  number?: string;
  date?: string;
  notes?: string;
  terms?: string;
  items: CreatePenawaranDetailInput[];
}

export interface UpdatePenawaranInput {
  customerId: number;
  date?: string;
  notes?: string;
  terms?: string;
  items: CreatePenawaranDetailInput[];
}

export interface UpdatePenawaranStatusInput {
  status: PenawaranStatus;
  notes?: string;
}

export interface PenawaranQueryParams {
  search?: string;
  customerId?: number;
  status?: PenawaranStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'ASC' | 'DESC';
}

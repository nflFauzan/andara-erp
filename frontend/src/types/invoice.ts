export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'CANCELLED';
export type InvoicePaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

export interface InvoiceDetail {
  id: number;
  invoiceId: number;
  sourcePenawaranDetailId?: number;
  sphKegiatanId?: number;
  sphKegiatanName?: string;
  sourceKegiatanId?: number;
  sourceKegiatanName?: string;
  sourceKegiatanItemId?: number;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  sortOrder: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Invoice {
  id: number;
  number: string;
  customerId: number;
  customerCode: string;
  customerName: string;
  customerAddress?: string;
  customerPhone?: string;
  sourcePenawaranId?: number;
  sourcePenawaranNumber?: string;
  workLocation?: string;
  date: string;
  dueDate?: string;
  status: InvoiceStatus;
  statusLabel: string;
  paymentStatus: InvoicePaymentStatus;
  paymentStatusLabel: string;
  totalAmount: number;
  paidAmount: number;
  outstanding: number;
  notes?: string;
  terms?: string;
  itemCount: number;
  details: InvoiceDetail[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateInvoiceDetailInput {
  sourcePenawaranDetailId?: number;
  sphKegiatanId?: number;
  sourceKegiatanId?: number;
  sourceKegiatanItemId?: number;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  sortOrder?: number;
  notes?: string;
}

export interface CreateInvoiceInput {
  customerId: number;
  sourcePenawaranId?: number;
  workLocation?: string;
  date: string;
  dueDate?: string;
  notes?: string;
  terms?: string;
  details: CreateInvoiceDetailInput[];
}

export interface UpdateInvoiceInput {
  customerId: number;
  workLocation?: string;
  date: string;
  dueDate?: string;
  notes?: string;
  terms?: string;
  details: CreateInvoiceDetailInput[];
}

export interface UpdateInvoiceStatusInput {
  status: InvoiceStatus;
}

export interface PenawaranBillableItem {
  penawaranDetailId: number;
  sphKegiatanId?: number;
  sphKegiatanName?: string;
  kegiatanId?: number;
  kegiatanName?: string;
  kegiatanItemId?: number;
  description: string;
  unit: string;
  unitPrice: number;
  originalVolume: number;
  alreadyBilledVolume: number;
  remainingBillableVolume: number;
  fullyBilled: boolean;
  sortOrder: number;
  notes?: string;
}

export interface InvoiceQueryParams {
  search?: string;
  customerId?: number;
  status?: InvoiceStatus;
  paymentStatus?: InvoicePaymentStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

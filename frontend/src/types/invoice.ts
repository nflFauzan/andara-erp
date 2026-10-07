export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'CANCELLED';
export type InvoicePaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';
export type TaxPpnType = 'NONE' | 'INCLUDE' | 'EXCLUDE_11' | 'EXCLUDE_12';
export type TaxPphType = 'NONE' | 'PPH23_2' | 'PPH_FINAL_KONSTRUKSI_1_75' | 'PPH_FINAL_KONSTRUKSI_2_65';

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
  clientPoNumber?: string;
  clientSpkNumber?: string;
  bastNumber?: string;
  date: string;
  dueDate?: string;
  status: InvoiceStatus;
  statusLabel: string;
  paymentStatus: InvoicePaymentStatus;
  paymentStatusLabel: string;
  subtotalDpp: number;
  taxPpnType: TaxPpnType;
  taxPpnTypeLabel?: string;
  taxPpnRate: number;
  taxPpnAmount: number;
  taxPphType: TaxPphType;
  taxPphTypeLabel?: string;
  taxPphRate: number;
  taxPphAmount: number;
  totalAmount: number;
  netTotalAmount: number;
  paidAmount: number;
  outstanding: number;
  notes?: string;
  terms?: string;
  itemCount: number;
  details: InvoiceDetail[];
  payments?: InvoicePaymentItem[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface InvoicePaymentItem {
  id: number;
  paymentId?: number;
  paymentNumber: string;
  paymentDate: string;
  paymentMethod: string;
  paymentMethodLabel?: string;
  amount: number;
  notes?: string;
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
  clientPoNumber?: string;
  clientSpkNumber?: string;
  bastNumber?: string;
  taxPpnType?: TaxPpnType;
  taxPpnRate?: number;
  taxPphType?: TaxPphType;
  taxPphRate?: number;
  date: string;
  dueDate?: string;
  notes?: string;
  terms?: string;
  details: CreateInvoiceDetailInput[];
}

export interface UpdateInvoiceInput {
  customerId: number;
  workLocation?: string;
  clientPoNumber?: string;
  clientSpkNumber?: string;
  bastNumber?: string;
  taxPpnType?: TaxPpnType;
  taxPpnRate?: number;
  taxPphType?: TaxPphType;
  taxPphRate?: number;
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

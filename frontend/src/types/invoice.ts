export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'CANCELLED';
export type InvoicePaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';
export type TaxPpnType = 'NONE' | 'INCLUDE' | 'EXCLUDE_11' | 'EXCLUDE_12';
export type TaxPphType = 'NONE' | 'PPH23_2' | 'PPH_FINAL_KONSTRUKSI_1_75' | 'PPH_FINAL_KONSTRUKSI_2_65';

export type BillingMode = 'ITEM_VOLUME' | 'PERCENTAGE_TERMIN';
export type InvoiceItemType = 'STANDARD' | 'DP_DEDUCTION' | 'RETENTION_DEDUCTION';

export interface InvoiceDetail {
  id: number;
  invoiceId: number;
  sourcePenawaranId?: number;
  sourcePenawaranNumber?: string;
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
  isDeduction?: boolean;
  itemType?: InvoiceItemType;
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
  isRetentionInvoice?: boolean;
  applyRetention?: boolean;
  retentionPercentage?: number;
  retentionAmount?: number;
  retentionMonths?: number;
  retentionDueDate?: string;
  parentSettlementInvoiceId?: number;
  parentSettlementInvoiceNumber?: string;
  retentionInvoiceId?: number;
  retentionInvoiceNumber?: string;
  billingMode?: BillingMode;
  billingModeLabel?: string;
  terminPercentage?: number;
  terminName?: string;
  previousDpInvoiceId?: number;
  previousDpInvoiceNumber?: string;
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
  sourcePenawaranId?: number;
  sourcePenawaranDetailId?: number;
  sphKegiatanId?: number;
  sourceKegiatanId?: number;
  sourceKegiatanItemId?: number;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  sortOrder?: number;
  isDeduction?: boolean;
  itemType?: InvoiceItemType;
  notes?: string;
}

export interface CreateInvoiceInput {
  customerId: number;
  sourcePenawaranId?: number;
  sourcePenawaranIds?: number[];
  billingMode?: BillingMode;
  terminPercentage?: number;
  terminName?: string;
  previousDpInvoiceId?: number;
  applyRetention?: boolean;
  retentionPercentage?: number;
  retentionMonths?: number;
  retentionDueDate?: string;
  isRetentionInvoice?: boolean;
  parentSettlementInvoiceId?: number;
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
  sourcePenawaranIds?: number[];
  billingMode?: BillingMode;
  terminPercentage?: number;
  terminName?: string;
  previousDpInvoiceId?: number;
  applyRetention?: boolean;
  retentionPercentage?: number;
  retentionMonths?: number;
  retentionDueDate?: string;
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
  penawaranId?: number;
  penawaranNumber?: string;
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

export interface RetentionMonitoringItem {
  invoiceId: number;
  invoiceNumber: string;
  customerId?: number;
  customerCode?: string;
  customerName?: string;
  sourcePenawaranId?: number;
  sourcePenawaranNumber?: string;
  parentSettlementInvoiceId?: number;
  parentSettlementInvoiceNumber?: string;
  retentionPercentage?: number;
  retentionAmount?: number;
  retentionDueDate?: string;
  daysRemaining?: number;
  overdue: boolean;
  readyToBill: boolean;
  status: InvoiceStatus;
  statusLabel: string;
  paymentStatus: InvoicePaymentStatus;
  paymentStatusLabel: string;
}

export interface BilledTerminItem {
  invoiceId: number;
  invoiceNumber: string;
  terminName: string;
  terminPercentage: number;
  subtotalDpp: number;
  totalAmount: number;
  date: string;
  status: InvoiceStatus;
  paymentStatus: InvoicePaymentStatus;
}

export interface AvailableDpInvoice {
  invoiceId: number;
  invoiceNumber: string;
  terminName: string;
  terminPercentage: number;
  subtotalDpp: number;
  totalAmount: number;
  paidAmount: number;
  date: string;
}

export interface PenawaranTerminSummary {
  penawaranId: number;
  penawaranNumber: string;
  totalPenawaranAmount: number;
  alreadyBilledPercentage: number;
  remainingPercentage: number;
  billedInvoices: BilledTerminItem[];
  availableDpInvoices: AvailableDpInvoice[];
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

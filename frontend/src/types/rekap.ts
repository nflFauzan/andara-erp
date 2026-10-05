export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  empty: boolean;
}

export interface RekapCustomer {
  customerId: number;
  customerCode: string;
  customerName: string;
  companyName: string | null;
  phone: string | null;
  totalKegiatan: number;
  totalInvoices: number;
  totalInvoiceAmount: number;
  totalPaidAmount: number;
  totalOutstanding: number;
  depositBalance: number;
}

export interface RekapCustomerSummary {
  page: PageResponse<RekapCustomer>;
  totalCustomers: number;
  grandTotalInvoiceAmount: number;
  grandTotalPaidAmount: number;
  grandTotalOutstanding: number;
  grandTotalDepositBalance: number;
}

export interface RekapInvoice {
  id: number;
  number: string;
  date: string;
  dueDate: string | null;
  customerId: number;
  customerCode: string;
  customerName: string;
  companyName: string | null;
  totalAmount: number;
  paidAmount: number;
  outstanding: number;
  status: string;
  paymentStatus: string;
}

export interface RekapInvoiceSummary {
  page: PageResponse<RekapInvoice>;
  totalInvoices: number;
  grandTotalAmount: number;
  grandTotalPaidAmount: number;
  grandTotalOutstanding: number;
}

export interface RekapPayment {
  id: number;
  number: string;
  date: string;
  customerId: number;
  customerCode: string;
  customerName: string;
  companyName: string | null;
  amount: number;
  allocatedAmount: number;
  excessDeposit: number;
  paymentMethod: string;
  destinationAccount: string | null;
  status: string;
  reference: string | null;
}

export interface RekapPaymentSummary {
  page: PageResponse<RekapPayment>;
  totalPayments: number;
  grandTotalAmount: number;
  grandTotalAllocatedAmount: number;
  grandTotalExcessDeposit: number;
}

export interface RekapKegiatan {
  id: number;
  code: string;
  name: string;
  customerId: number;
  customerCode: string;
  customerName: string;
  companyName: string | null;
  location: string | null;
  status: string;
  totalValue: number;
  itemCount: number;
  penawaranCount: number;
  invoiceCount: number;
  createdAt: string;
}

export interface RekapKegiatanSummary {
  page: PageResponse<RekapKegiatan>;
  totalKegiatan: number;
  grandTotalValue: number;
}

export interface RekapPenawaran {
  id: number;
  number: string;
  date: string;
  customerId: number;
  customerCode: string;
  customerName: string;
  companyName: string | null;
  kegiatanSummary: string;
  kegiatanCount: number;
  totalAmount: number;
  status: string;
  invoiceCount: number;
  invoicedAmount: number;
  unbilledAmount: number;
}

export interface RekapPenawaranSummary {
  page: PageResponse<RekapPenawaran>;
  totalPenawaran: number;
  grandTotalAmount: number;
  approvedCount: number;
  approvedTotalAmount: number;
  acceptedCount?: number;
  acceptedTotalAmount?: number;
  sentCount: number;
  sentTotalAmount: number;
  draftCount: number;
  draftTotalAmount: number;
  rejectedCount: number;
  rejectedTotalAmount: number;
  grandTotalInvoicedAmount: number;
  grandTotalUnbilledAmount: number;
}

export type AgingBucket = 'ALL' | 'CURRENT' | 'DAYS_1_30' | 'DAYS_31_60' | 'DAYS_61_90' | 'DAYS_OVER_90';

export interface RekapPiutang {
  invoiceId: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  customerId: number;
  customerCode: string;
  customerName: string;
  companyName: string | null;
  totalAmount: number;
  paidAmount: number;
  outstanding: number;
  daysOverdue: number;
  agingBucket: AgingBucket;
  invoiceStatus: string;
  paymentStatus: string;
}

export interface RekapPiutangSummary {
  page: PageResponse<RekapPiutang>;
  totalInvoicesWithOutstanding: number;
  grandTotalOutstanding: number;
  currentAmount: number;
  currentCount: number;
  overdueAmount: number;
  overdueCount: number;
  bucket1To30Amount: number;
  bucket1To30Count: number;
  bucket31To60Amount: number;
  bucket31To60Count: number;
  bucket61To90Amount: number;
  bucket61To90Count: number;
  bucketOver90Amount: number;
  bucketOver90Count: number;
}

export type StatementItemType = 'KEGIATAN' | 'SPH' | 'INVOICE' | 'PAYMENT' | 'DEPOSIT';

export interface CustomerStatementItem {
  date: string;
  type: StatementItemType;
  referenceId: number;
  referenceNo: string;
  description: string;
  status: string;
  amount: number;
  debit: number;
  credit: number;
  runningBalance: number;
  notes: string | null;
}

export interface CustomerStatement {
  customerId: number;
  customerName: string;
  customerCode: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  depositBalance: number;
  totalKegiatanCount: number;
  totalKegiatanAmount: number;
  totalPenawaranCount: number;
  totalPenawaranAmount: number;
  totalInvoiceCount: number;
  totalInvoiceAmount: number;
  totalPaidAmount: number;
  totalOutstandingAmount: number;
  items: CustomerStatementItem[];
}

// Fase 4: Analisis Silang Types
export interface InvoiceBrief {
  id: number;
  number: string;
  date: string;
  amount: number;
  status: string;
}

export type UnbilledStatusFilter = 'ALL' | 'UNBILLED' | 'PARTIALLY_BILLED' | 'FULLY_BILLED';

export interface RekapUnbilledSph {
  id: number;
  number: string;
  date: string;
  customerId: number;
  customerCode: string;
  customerName: string;
  companyName: string | null;
  totalAmount: number;
  invoicedAmount: number;
  unbilledAmount: number;
  status: string;
  billingStatus: 'UNBILLED' | 'PARTIALLY_BILLED' | 'FULLY_BILLED';
  invoices: InvoiceBrief[];
}

export interface RekapUnbilledSummary {
  page: PageResponse<RekapUnbilledSph>;
  totalSph: number;
  totalSphAmount: number;
  totalInvoicedAmount: number;
  totalUnbilledAmount: number;
  unbilledCount: number;
  partiallyBilledCount: number;
  fullyBilledCount: number;
}

export interface InvoiceSettlementAllocation {
  allocationId: number;
  paymentId: number;
  paymentNumber: string;
  paymentDate: string;
  allocatedAmount: number;
  paymentMethod: string;
  destinationAccount: string | null;
  paymentStatus: string;
}

export interface InvoiceSettlement {
  invoiceId: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  customerId: number;
  customerCode: string;
  customerName: string;
  companyName: string | null;
  totalAmount: number;
  paidAmount: number;
  outstanding: number;
  paymentStatus: string;
  status: string;
  allocations: InvoiceSettlementAllocation[];
}

export interface InvoiceSettlementSummary {
  page: PageResponse<InvoiceSettlement>;
  totalInvoices: number;
  grandTotalAmount: number;
  grandTotalPaidAmount: number;
  grandTotalOutstanding: number;
  unpaidCount: number;
  partiallyPaidCount: number;
  paidCount: number;
}

export interface MonthlyTrendItem {
  month: number;
  monthName: string;
  sphCount: number;
  sphAmount: number;
  invoicedCount: number;
  invoicedAmount: number;
  paymentCount: number;
  paymentAmount: number;
  outstandingAmount: number;
  collectionRate: number;
  momRevenueGrowth: number | null;
}

export interface YearlyTrendSummary {
  year: number;
  totalSphAmount: number;
  totalInvoicedAmount: number;
  totalPaymentAmount: number;
  totalOutstandingAmount: number;
  averageCollectionRate: number;
  peakInvoicedMonth: string | null;
  peakInvoicedAmount: number;
  peakPaymentMonth: string | null;
  peakPaymentAmount: number;
  months: MonthlyTrendItem[];
}




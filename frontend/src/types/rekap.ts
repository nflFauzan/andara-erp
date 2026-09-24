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

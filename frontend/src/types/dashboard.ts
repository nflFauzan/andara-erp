export interface DashboardInvoice {
  id: number;
  number: string;
  date: string;
  dueDate: string | null;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  outstanding: number;
  status: string;
  paymentStatus: string;
}

export interface DashboardPayment {
  id: number;
  number: string;
  date: string;
  customerName: string;
  amount: number;
  paymentMethod: string;
  destinationAccount: string | null;
  status: string;
}

export interface MonthlyTrend {
  month: string;
  monthLabel: string;
  invoiceAmount: number;
  paymentAmount: number;
}

export interface DashboardSummary {
  totalActiveCustomers: number;
  totalActiveKegiatan: number;
  totalPenawaran: number;
  totalPenawaranAmount: number;
  totalInvoices: number;
  totalInvoiceAmount: number;
  totalPayments: number;
  totalOutstanding: number;
  totalCustomerDeposit: number;
  unpaidInvoiceCount: number;
  recentUnpaidInvoices: DashboardInvoice[];
  recentPayments: DashboardPayment[];
  monthlyTrends: MonthlyTrend[];
}

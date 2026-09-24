export type ReceiptStatus = 'VALID' | 'CANCELLED';

export interface ReceiptAllocationSummary {
  invoiceId: number;
  invoiceNumber: string;
  invoiceDate: string;
  allocatedAmount: number;
  notes?: string;
}

export interface Receipt {
  id: number;
  number: string;
  paymentId: number;
  paymentNumber: string;
  paymentMethod: string;
  paymentReference?: string;
  paymentDestinationAccount?: string;
  customerId: number;
  customerName: string;
  customerCode: string;
  customerCompanyName?: string;
  customerAddress?: string;
  customerPhone?: string;
  date: string;
  receivedFrom: string;
  amount: number;
  spelledOut: string;
  description: string;
  notes?: string;
  status: ReceiptStatus;
  allocations: ReceiptAllocationSummary[];
  createdAt: string;
  createdBy?: string;
}

export interface CreateReceiptInput {
  paymentId: number;
  receiptDate?: string;
  receivedFrom?: string;
  description?: string;
  notes?: string;
}

export interface ReceiptQueryParams {
  search?: string;
  customerId?: number;
  status?: ReceiptStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export type PaymentMethod = 'BANK_TRANSFER' | 'CASH' | 'GIRO' | 'OTHER';
export type PaymentStatus = 'CONFIRMED' | 'CANCELLED';

export interface PaymentAllocation {
  id: number;
  paymentId: number;
  paymentNumber: string;
  invoiceId: number;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceTotalAmount: number;
  invoicePaidAmount: number;
  invoiceOutstanding: number;
  allocatedAmount: number;
  notes?: string;
  createdAt: string;
  createdBy?: string;
}

export interface Payment {
  id: number;
  number: string;
  customerId: number;
  customerName: string;
  customerCode: string;
  date: string;
  amount: number;
  allocatedAmount: number;
  excessAmount: number;
  paymentMethod: PaymentMethod;
  destinationAccount?: string;
  reference?: string;
  notes?: string;
  status: PaymentStatus;
  allocations: PaymentAllocation[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface AllocationItemInput {
  invoiceId: number;
  amount: number;
  notes?: string;
}

export interface CreatePaymentInput {
  customerId: number;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  destinationAccount?: string;
  reference?: string;
  notes?: string;
  allocations: AllocationItemInput[];
}

export interface PaymentQueryParams {
  search?: string;
  customerId?: number;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

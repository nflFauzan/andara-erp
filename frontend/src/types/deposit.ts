export type DepositTransactionType = 'DEPOSIT_IN' | 'DEPOSIT_USED' | 'DEPOSIT_REFUND' | 'DEPOSIT_ADJUSTMENT';

export interface DepositTransaction {
  id: number;
  customerId: number;
  customerName: string;
  customerCode: string;
  type: DepositTransactionType;
  amount: number;
  balanceAfter: number;
  referenceType?: string;
  referenceId?: number;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
  createdBy?: string;
}

export interface CustomerDepositSummary {
  customerId: number;
  customerCode: string;
  customerName: string;
  companyName?: string;
  depositBalance: number;
  totalDepositIn: number;
  totalDepositUsed: number;
  transactionCount: number;
}

export interface UseDepositInput {
  customerId: number;
  invoiceId: number;
  amount: number;
  notes?: string;
}

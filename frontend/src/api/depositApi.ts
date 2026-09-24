import api from '../lib/axios';
import { ApiResponse } from '../types/api';
import { PageResponse } from '../types/customer';
import {
  CustomerDepositSummary,
  DepositTransaction,
  UseDepositInput,
} from '../types/deposit';

export const depositApi = {
  async getCustomerDeposits(): Promise<CustomerDepositSummary[]> {
    const response = await api.get<ApiResponse<CustomerDepositSummary[]>>('/deposits');
    return response.data.data!;
  },

  async getCustomerDepositHistory(customerId: number, page: number = 0, size: number = 10): Promise<PageResponse<DepositTransaction>> {
    const response = await api.get<ApiResponse<PageResponse<DepositTransaction>>>(`/deposits/customer/${customerId}`, {
      params: { page, size },
    });
    return response.data.data!;
  },

  async getCustomerDepositBalance(customerId: number): Promise<number> {
    const response = await api.get<ApiResponse<number>>(`/deposits/customer/${customerId}/balance`);
    return response.data.data!;
  },

  async useDeposit(data: UseDepositInput): Promise<DepositTransaction> {
    const response = await api.post<ApiResponse<DepositTransaction>>('/deposits/use', data);
    return response.data.data!;
  },
};

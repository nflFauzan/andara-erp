import api from '../lib/axios';
import { ApiResponse } from '../types/api';
import { PageResponse } from '../types/customer';
import {
  Receipt,
  CreateReceiptInput,
  ReceiptQueryParams,
} from '../types/receipt';

export const receiptApi = {
  async getReceiptList(params: ReceiptQueryParams = {}): Promise<PageResponse<Receipt>> {
    const queryParams: Record<string, any> = {};
    if (params.search) queryParams.search = params.search;
    if (params.customerId) queryParams.customerId = params.customerId;
    if (params.status) queryParams.status = params.status;
    if (params.startDate) queryParams.startDate = params.startDate;
    if (params.endDate) queryParams.endDate = params.endDate;
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.size !== undefined) queryParams.size = params.size;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortDir) queryParams.sortDir = params.sortDir.toLowerCase();

    const response = await api.get<ApiResponse<PageResponse<Receipt>>>('/kwitansi', {
      params: queryParams,
    });
    return response.data.data!;
  },

  async getReceiptById(id: number): Promise<Receipt> {
    const response = await api.get<ApiResponse<Receipt>>(`/kwitansi/${id}`);
    return response.data.data!;
  },

  async getReceiptByPaymentId(paymentId: number): Promise<Receipt> {
    const response = await api.get<ApiResponse<Receipt>>(`/kwitansi/payment/${paymentId}`);
    return response.data.data!;
  },

  async generateReceipt(data: CreateReceiptInput): Promise<Receipt> {
    const response = await api.post<ApiResponse<Receipt>>('/kwitansi', data);
    return response.data.data!;
  },

  async cancelReceipt(id: number): Promise<Receipt> {
    const response = await api.post<ApiResponse<Receipt>>(`/kwitansi/${id}/cancel`);
    return response.data.data!;
  },
};

import api from '../lib/axios';
import { ApiResponse } from '../types/api';
import { PageResponse } from '../types/customer';
import {
  Payment,
  CreatePaymentInput,
  PaymentQueryParams,
} from '../types/payment';

export const paymentApi = {
  async getPaymentList(params: PaymentQueryParams = {}): Promise<PageResponse<Payment>> {
    const queryParams: Record<string, any> = {};
    if (params.search) queryParams.search = params.search;
    if (params.customerId) queryParams.customerId = params.customerId;
    if (params.status) queryParams.status = params.status;
    if (params.paymentMethod) queryParams.paymentMethod = params.paymentMethod;
    if (params.startDate) queryParams.startDate = params.startDate;
    if (params.endDate) queryParams.endDate = params.endDate;
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.size !== undefined) queryParams.size = params.size;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortDir) queryParams.sortDir = params.sortDir.toLowerCase();

    const response = await api.get<ApiResponse<PageResponse<Payment>>>('/pembayaran', {
      params: queryParams,
    });
    return response.data.data!;
  },

  async getPaymentById(id: number): Promise<Payment> {
    const response = await api.get<ApiResponse<Payment>>(`/pembayaran/${id}`);
    return response.data.data!;
  },

  async createPayment(data: CreatePaymentInput): Promise<Payment> {
    const response = await api.post<ApiResponse<Payment>>('/pembayaran', data);
    return response.data.data!;
  },

  async cancelPayment(id: number): Promise<Payment> {
    const response = await api.post<ApiResponse<Payment>>(`/pembayaran/${id}/cancel`);
    return response.data.data!;
  },
};

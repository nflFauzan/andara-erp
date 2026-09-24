import api from '../lib/axios';
import { ApiResponse } from '../types/api';
import { PageResponse } from '../types/customer';
import {
  Invoice,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  UpdateInvoiceStatusInput,
  PenawaranBillableItem,
  InvoiceQueryParams,
} from '../types/invoice';

export const invoiceApi = {
  async getInvoiceList(params: InvoiceQueryParams = {}): Promise<PageResponse<Invoice>> {
    const queryParams: Record<string, any> = {};
    if (params.search) queryParams.search = params.search;
    if (params.customerId) queryParams.customerId = params.customerId;
    if (params.status) queryParams.status = params.status;
    if (params.paymentStatus) queryParams.paymentStatus = params.paymentStatus;
    if (params.startDate) queryParams.startDate = params.startDate;
    if (params.endDate) queryParams.endDate = params.endDate;
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.size !== undefined) queryParams.size = params.size;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortDir) queryParams.sortDir = params.sortDir.toLowerCase();

    const response = await api.get<ApiResponse<PageResponse<Invoice>>>('/faktur', {
      params: queryParams,
    });
    return response.data.data!;
  },

  async getInvoiceById(id: number): Promise<Invoice> {
    const response = await api.get<ApiResponse<Invoice>>(`/faktur/${id}`);
    return response.data.data!;
  },

  async getBillableItemsFromPenawaran(penawaranId: number): Promise<PenawaranBillableItem[]> {
    const response = await api.get<ApiResponse<PenawaranBillableItem[]>>(`/faktur/penawaran/${penawaranId}/billable`);
    return response.data.data!;
  },

  async createInvoice(data: CreateInvoiceInput): Promise<Invoice> {
    const response = await api.post<ApiResponse<Invoice>>('/faktur', data);
    return response.data.data!;
  },

  async updateInvoice(id: number, data: UpdateInvoiceInput): Promise<Invoice> {
    const response = await api.put<ApiResponse<Invoice>>(`/faktur/${id}`, data);
    return response.data.data!;
  },

  async updateStatus(id: number, data: UpdateInvoiceStatusInput): Promise<Invoice> {
    const response = await api.patch<ApiResponse<Invoice>>(`/faktur/${id}/status`, data);
    return response.data.data!;
  },

  async deleteInvoice(id: number): Promise<void> {
    await api.delete(`/faktur/${id}`);
  },
};

import api from '../lib/axios';
import { ApiResponse } from '../types/api';
import { PageResponse } from '../types/customer';
import {
  Penawaran,
  CreatePenawaranInput,
  UpdatePenawaranInput,
  UpdatePenawaranStatusInput,
  PenawaranQueryParams,
} from '../types/penawaran';

export const penawaranApi = {
  async getPenawaranList(params: PenawaranQueryParams = {}): Promise<PageResponse<Penawaran>> {
    const queryParams: Record<string, any> = {};
    if (params.search) queryParams.search = params.search;
    if (params.customerId) queryParams.customerId = params.customerId;
    if (params.status) queryParams.status = params.status;
    if (params.startDate) queryParams.startDate = params.startDate;
    if (params.endDate) queryParams.endDate = params.endDate;
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.size !== undefined) queryParams.size = params.size;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.direction) queryParams.sortDir = params.direction.toLowerCase();

    const response = await api.get<ApiResponse<PageResponse<Penawaran>>>('/penawaran', {
      params: queryParams,
    });
    return response.data.data!;
  },

  async getPenawaranById(id: number): Promise<Penawaran> {
    const response = await api.get<ApiResponse<Penawaran>>(`/penawaran/${id}`);
    return response.data.data!;
  },

  async createPenawaran(data: CreatePenawaranInput): Promise<Penawaran> {
    const response = await api.post<ApiResponse<Penawaran>>('/penawaran', data);
    return response.data.data!;
  },

  async updatePenawaran(id: number, data: UpdatePenawaranInput): Promise<Penawaran> {
    const response = await api.put<ApiResponse<Penawaran>>(`/penawaran/${id}`, data);
    return response.data.data!;
  },

  async updateStatus(id: number, data: UpdatePenawaranStatusInput): Promise<Penawaran> {
    const response = await api.patch<ApiResponse<Penawaran>>(`/penawaran/${id}/status`, data);
    return response.data.data!;
  },

  async deletePenawaran(id: number): Promise<void> {
    await api.delete(`/penawaran/${id}`);
  },
};

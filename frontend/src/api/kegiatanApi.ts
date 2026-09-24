import api from '../lib/axios';
import { ApiResponse } from '../types/api';
import { PageResponse } from '../types/customer';
import {
  Kegiatan,
  KegiatanItem,
  KegiatanStatus,
  CreateKegiatanInput,
  UpdateKegiatanInput,
  KegiatanItemInput,
} from '../types/kegiatan';

export interface KegiatanQueryParams {
  search?: string;
  customerId?: number;
  status?: KegiatanStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export const kegiatanApi = {
  async getKegiatan(params: KegiatanQueryParams = {}): Promise<PageResponse<Kegiatan>> {
    const queryParams: Record<string, any> = {};
    if (params.search) queryParams.search = params.search;
    if (params.customerId) queryParams.customerId = params.customerId;
    if (params.status) queryParams.status = params.status;
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.size !== undefined) queryParams.size = params.size;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortDir) queryParams.sortDir = params.sortDir;

    const response = await api.get<ApiResponse<PageResponse<Kegiatan>>>('/kegiatan', {
      params: queryParams,
    });
    return response.data.data!;
  },

  async getKegiatanById(id: number): Promise<Kegiatan> {
    const response = await api.get<ApiResponse<Kegiatan>>(`/kegiatan/${id}`);
    return response.data.data!;
  },

  async getKegiatanByCustomer(customerId: number): Promise<Kegiatan[]> {
    const response = await api.get<ApiResponse<Kegiatan[]>>(`/kegiatan/customer/${customerId}`);
    return response.data.data || [];
  },

  async createKegiatan(data: CreateKegiatanInput): Promise<Kegiatan> {
    const response = await api.post<ApiResponse<Kegiatan>>('/kegiatan', data);
    return response.data.data!;
  },

  async updateKegiatan(id: number, data: UpdateKegiatanInput): Promise<Kegiatan> {
    const response = await api.put<ApiResponse<Kegiatan>>(`/kegiatan/${id}`, data);
    return response.data.data!;
  },

  async updateStatus(id: number, status: KegiatanStatus): Promise<Kegiatan> {
    const response = await api.patch<ApiResponse<Kegiatan>>(`/kegiatan/${id}/status`, null, {
      params: { status },
    });
    return response.data.data!;
  },

  async deleteKegiatan(id: number): Promise<void> {
    await api.delete(`/kegiatan/${id}`);
  },

  async addItem(kegiatanId: number, data: KegiatanItemInput): Promise<KegiatanItem> {
    const response = await api.post<ApiResponse<KegiatanItem>>(`/kegiatan/${kegiatanId}/items`, data);
    return response.data.data!;
  },

  async updateItem(
    kegiatanId: number,
    itemId: number,
    data: KegiatanItemInput
  ): Promise<KegiatanItem> {
    const response = await api.put<ApiResponse<KegiatanItem>>(
      `/kegiatan/${kegiatanId}/items/${itemId}`,
      data
    );
    return response.data.data!;
  },

  async deleteItem(kegiatanId: number, itemId: number): Promise<void> {
    await api.delete(`/kegiatan/${kegiatanId}/items/${itemId}`);
  },
};

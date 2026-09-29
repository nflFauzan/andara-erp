import api from '../lib/axios';
import { ApiResponse } from '../types/api';
import { PageResponse } from '../types/customer';
import {
  ItemCatalog,
  CreateItemCatalogInput,
  UpdateItemCatalogInput,
  ItemCatalogQueryParams,
} from '../types/itemCatalog';

export const itemCatalogApi = {
  async getItems(params: ItemCatalogQueryParams = {}): Promise<PageResponse<ItemCatalog>> {
    const queryParams: Record<string, any> = {};
    if (params.search) queryParams.search = params.search;
    if (params.category) queryParams.category = params.category;
    if (params.active !== undefined) queryParams.isActive = params.active;
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.size !== undefined) queryParams.size = params.size;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.direction) queryParams.sortDir = params.direction.toLowerCase();

    const response = await api.get<ApiResponse<PageResponse<ItemCatalog>>>('/master-items', {
      params: queryParams,
    });
    return response.data.data!;
  },

  async getActiveItems(): Promise<ItemCatalog[]> {
    const response = await api.get<ApiResponse<ItemCatalog[]>>('/master-items/active');
    return response.data.data!;
  },

  async getCategories(): Promise<string[]> {
    const response = await api.get<ApiResponse<string[]>>('/master-items/categories');
    return response.data.data!;
  },

  async getItemById(id: number): Promise<ItemCatalog> {
    const response = await api.get<ApiResponse<ItemCatalog>>(`/master-items/${id}`);
    return response.data.data!;
  },

  async createItem(data: CreateItemCatalogInput): Promise<ItemCatalog> {
    const response = await api.post<ApiResponse<ItemCatalog>>('/master-items', data);
    return response.data.data!;
  },

  async updateItem(id: number, data: UpdateItemCatalogInput): Promise<ItemCatalog> {
    const response = await api.put<ApiResponse<ItemCatalog>>(`/master-items/${id}`, data);
    return response.data.data!;
  },

  async deleteItem(id: number): Promise<void> {
    await api.delete(`/master-items/${id}`);
  },

  async toggleItemStatus(id: number, active: boolean): Promise<ItemCatalog> {
    const response = await api.patch<ApiResponse<ItemCatalog>>(`/master-items/${id}/status`, null, {
      params: { active },
    });
    return response.data.data!;
  },
};

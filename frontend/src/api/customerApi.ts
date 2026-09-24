import api from '../lib/axios';
import { ApiResponse } from '../types/api';
import { Customer, CreateCustomerInput, UpdateCustomerInput, PageResponse } from '../types/customer';

export interface CustomerQueryParams {
  search?: string;
  active?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'ASC' | 'DESC';
}

export const customerApi = {
  async getCustomers(params: CustomerQueryParams = {}): Promise<PageResponse<Customer>> {
    const queryParams: Record<string, any> = {};
    if (params.search) queryParams.search = params.search;
    if (params.active !== undefined) queryParams.isActive = params.active;
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.size !== undefined) queryParams.size = params.size;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.direction) queryParams.direction = params.direction;

    const response = await api.get<ApiResponse<PageResponse<Customer>>>('/customers', {
      params: queryParams,
    });
    return response.data.data!;
  },

  async getActiveCustomers(): Promise<Customer[]> {
    const response = await api.get<ApiResponse<Customer[]>>('/customers/active');
    return response.data.data!;
  },

  async getCustomerById(id: number): Promise<Customer> {
    const response = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
    return response.data.data!;
  },

  async createCustomer(data: CreateCustomerInput): Promise<Customer> {
    const response = await api.post<ApiResponse<Customer>>('/customers', data);
    return response.data.data!;
  },

  async updateCustomer(id: number, data: UpdateCustomerInput): Promise<Customer> {
    const response = await api.put<ApiResponse<Customer>>(`/customers/${id}`, data);
    return response.data.data!;
  },

  async deleteCustomer(id: number): Promise<void> {
    await api.delete(`/customers/${id}`);
  },

  async toggleCustomerStatus(id: number, active: boolean): Promise<Customer> {
    const response = await api.patch<ApiResponse<Customer>>(`/customers/${id}/status`, null, {
      params: { active },
    });
    return response.data.data!;
  },
};

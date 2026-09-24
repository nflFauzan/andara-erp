import api from '@/lib/axios';
import { DashboardSummary } from '@/types/dashboard';

export interface DashboardParams {
  startDate?: string;
  endDate?: string;
  customerId?: number;
}

export const getDashboardSummary = async (params?: DashboardParams): Promise<DashboardSummary> => {
  const response = await api.get<{ success: boolean; data: DashboardSummary }>('/dashboard', {
    params,
  });
  return response.data.data;
};

import api from '@/lib/axios';
import {
  RekapCustomerSummary,
  RekapInvoiceSummary,
  RekapPaymentSummary,
  RekapKegiatanSummary,
} from '@/types/rekap';

export const getRekapCustomers = async (params?: {
  search?: string;
  page?: number;
  size?: number;
}): Promise<RekapCustomerSummary> => {
  const response = await api.get<{ success: boolean; data: RekapCustomerSummary }>(
    '/rekap/customers',
    { params }
  );
  return response.data.data;
};

export const getRekapInvoices = async (params?: {
  startDate?: string;
  endDate?: string;
  customerId?: number;
  status?: string;
  paymentStatus?: string;
  search?: string;
  page?: number;
  size?: number;
}): Promise<RekapInvoiceSummary> => {
  const response = await api.get<{ success: boolean; data: RekapInvoiceSummary }>(
    '/rekap/invoices',
    { params }
  );
  return response.data.data;
};

export const getRekapPayments = async (params?: {
  startDate?: string;
  endDate?: string;
  customerId?: number;
  status?: string;
  method?: string;
  search?: string;
  page?: number;
  size?: number;
}): Promise<RekapPaymentSummary> => {
  const response = await api.get<{ success: boolean; data: RekapPaymentSummary }>(
    '/rekap/payments',
    { params }
  );
  return response.data.data;
};

export const getRekapKegiatan = async (params?: {
  customerId?: number;
  status?: string;
  search?: string;
  page?: number;
  size?: number;
}): Promise<RekapKegiatanSummary> => {
  const response = await api.get<{ success: boolean; data: RekapKegiatanSummary }>(
    '/rekap/kegiatan',
    { params }
  );
  return response.data.data;
};

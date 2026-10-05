import api from '@/lib/axios';
import {
  RekapCustomerSummary,
  RekapInvoiceSummary,
  RekapPaymentSummary,
  RekapKegiatanSummary,
  RekapPenawaranSummary,
  RekapPiutangSummary,
  CustomerStatement,
} from '@/types/rekap';

export const getRekapCustomers = async (params?: {
  startDate?: string;
  endDate?: string;
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
  startDate?: string;
  endDate?: string;
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

export const getRekapPenawaran = async (params?: {
  startDate?: string;
  endDate?: string;
  customerId?: number;
  status?: string;
  search?: string;
  page?: number;
  size?: number;
}): Promise<RekapPenawaranSummary> => {
  const response = await api.get<{ success: boolean; data: RekapPenawaranSummary }>(
    '/rekap/penawaran',
    { params }
  );
  return response.data.data;
};

export const getRekapPiutang = async (params?: {
  asOfDate?: string;
  customerId?: number;
  agingBucket?: string;
  search?: string;
  page?: number;
  size?: number;
}): Promise<RekapPiutangSummary> => {
  const response = await api.get<{ success: boolean; data: RekapPiutangSummary }>(
    '/rekap/piutang',
    { params }
  );
  return response.data.data;
};

export const getCustomerStatement = async (
  customerId: number,
  params?: {
    startDate?: string;
    endDate?: string;
  }
): Promise<CustomerStatement> => {
  const response = await api.get<{ success: boolean; data: CustomerStatement }>(
    `/rekap/customers/${customerId}/statement`,
    { params }
  );
  return response.data.data;
};


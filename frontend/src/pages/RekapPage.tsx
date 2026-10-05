import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileSpreadsheet,
  Users,
  Receipt,
  CreditCard,
  HardHat,
  Printer,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import {
  getRekapCustomers,
  getRekapInvoices,
  getRekapPayments,
  getRekapKegiatan,
} from '@/api/rekapApi';
import { customerApi } from '@/api/customerApi';
import { Customer } from '@/types/customer';
import { BentoCard } from '@/components/common/BentoCard';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  UniversalPeriodFilter,
  FilterState,
  RekapTab,
} from '@/components/rekap/UniversalPeriodFilter';

const formatCurrency = (val: number | null | undefined): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val || 0);
};

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const RekapPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RekapTab>('CUSTOMERS');

  // Unified Universal Filter State
  const [filters, setFilters] = useState<FilterState>({
    preset: 'ALL_TIME',
    startDate: '',
    endDate: '',
    customerId: '',
    status: '',
    search: '',
  });

  const [page, setPage] = useState(0);
  const pageSize = 15;

  // Active customers list
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['activeCustomers'],
    queryFn: () => customerApi.getActiveCustomers(),
  });

  // Query 1: Rekap Customers
  const { data: customerRekap, isLoading: loadingCustomers } = useQuery({
    queryKey: ['rekapCustomers', filters.search, filters.startDate, filters.endDate, page],
    queryFn: () =>
      getRekapCustomers({
        search: filters.search || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        page,
        size: pageSize,
      }),
    enabled: activeTab === 'CUSTOMERS',
  });

  // Query 2: Rekap Invoices
  const { data: invoiceRekap, isLoading: loadingInvoices } = useQuery({
    queryKey: [
      'rekapInvoices',
      filters.search,
      filters.customerId,
      filters.startDate,
      filters.endDate,
      filters.status,
      page,
    ],
    queryFn: () =>
      getRekapInvoices({
        search: filters.search || undefined,
        customerId: filters.customerId ? Number(filters.customerId) : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        status: ['DRAFT', 'ISSUED', 'CANCELLED'].includes(filters.status) ? filters.status : undefined,
        paymentStatus: ['UNPAID', 'PARTIALLY_PAID', 'PAID'].includes(filters.status)
          ? filters.status
          : undefined,
        page,
        size: pageSize,
      }),
    enabled: activeTab === 'INVOICES',
  });

  // Query 3: Rekap Payments
  const { data: paymentRekap, isLoading: loadingPayments } = useQuery({
    queryKey: [
      'rekapPayments',
      filters.search,
      filters.customerId,
      filters.startDate,
      filters.endDate,
      filters.status,
      page,
    ],
    queryFn: () =>
      getRekapPayments({
        search: filters.search || undefined,
        customerId: filters.customerId ? Number(filters.customerId) : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        status: ['CONFIRMED', 'CANCELLED'].includes(filters.status) ? filters.status : undefined,
        method: ['TRANSFER', 'CASH', 'GIRO', 'CHEQUE'].includes(filters.status) ? filters.status : undefined,
        page,
        size: pageSize,
      }),
    enabled: activeTab === 'PAYMENTS',
  });

  // Query 4: Rekap Kegiatan
  const { data: kegiatanRekap, isLoading: loadingKegiatan } = useQuery({
    queryKey: [
      'rekapKegiatan',
      filters.search,
      filters.customerId,
      filters.startDate,
      filters.endDate,
      filters.status,
      page,
    ],
    queryFn: () =>
      getRekapKegiatan({
        search: filters.search || undefined,
        customerId: filters.customerId ? Number(filters.customerId) : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        status: filters.status || undefined,
        page,
        size: pageSize,
      }),
    enabled: activeTab === 'KEGIATAN',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleTabChange = (tab: RekapTab) => {
    setActiveTab(tab);
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <PageHeader
        title="Rekap Transaksi & Analitik Terpadu"
        subtitle="Monitoring data teragregasi per customer, faktur penjualan, realisasi kas, dan kegiatan proyek."
        badge={
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Laporan Keuangan
          </span>
        }
        actions={
          <button
            onClick={handlePrint}
            className="print:hidden neu-btn-primary text-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / PDF</span>
          </button>
        }
      />

      {/* Control Card: Tabs & Universal Filter Bar */}
      <BentoCard padding="default" className="print:hidden space-y-4">
        {/* Tab Selector Hub */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleTabChange('CUSTOMERS')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'CUSTOMERS'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Rekap Customer</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('KEGIATAN')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'KEGIATAN'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
              }`}
            >
              <HardHat className="w-4 h-4" />
              <span>Rekap Kegiatan Proyek</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('INVOICES')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'INVOICES'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Rekap Faktur Penjualan</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('PAYMENTS')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'PAYMENTS'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Rekap Pembayaran Kas</span>
            </button>
          </div>

          {/* Roadmap Indicator for Upcoming Tier 1 & 2 Tabs */}
          <div className="hidden xl:flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-navy-900/60 border border-slate-200/60 dark:border-navy-700/60">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Fase 2: SPH &amp; Aging Piutang</span>
            </span>
          </div>
        </div>

        {/* Universal Filter Component */}
        <div className="pt-2 border-t border-slate-100 dark:border-navy-700/80">
          <UniversalPeriodFilter
            filters={filters}
            onChange={(newFilters) => {
              setFilters(newFilters);
              setPage(0);
            }}
            customers={customers}
            activeTab={activeTab}
            onReset={() => {
              setFilters({
                preset: 'ALL_TIME',
                startDate: '',
                endDate: '',
                customerId: '',
                status: '',
                search: '',
              });
              setPage(0);
            }}
          />
        </div>
      </BentoCard>

      {/* TAB 1: REKAP CUSTOMER */}
      {activeTab === 'CUSTOMERS' && (
        <div className="space-y-4">
          {/* Summary KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <BentoCard padding="default">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Tagihan</span>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono">
                {formatCurrency(customerRekap?.grandTotalInvoiceAmount || 0)}
              </div>
            </BentoCard>
            <BentoCard padding="default">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Dibayar</span>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                {formatCurrency(customerRekap?.grandTotalPaidAmount || 0)}
              </div>
            </BentoCard>
            <BentoCard padding="default">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Piutang</span>
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1 font-mono">
                {formatCurrency(customerRekap?.grandTotalOutstanding || 0)}
              </div>
            </BentoCard>
            <BentoCard padding="default">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Saldo Deposit Mengendap</span>
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-1 font-mono">
                {formatCurrency(customerRekap?.grandTotalDepositBalance || 0)}
              </div>
            </BentoCard>
          </div>

          {/* Table */}
          <BentoCard padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-navy-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200/80 dark:border-navy-700/80">
                  <tr>
                    <th className="py-3.5 px-4">Kode & Customer</th>
                    <th className="py-3.5 px-4">Kontak / Telp</th>
                    <th className="py-3.5 px-4 text-center">Kegiatan</th>
                    <th className="py-3.5 px-4 text-center">Faktur</th>
                    <th className="py-3.5 px-4 text-right">Total Faktur</th>
                    <th className="py-3.5 px-4 text-right">Total Bayar</th>
                    <th className="py-3.5 px-4 text-right">Outstanding</th>
                    <th className="py-3.5 px-4 text-right">Deposit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                  {loadingCustomers ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400 dark:text-slate-500">
                        Memuat data rekap customer...
                      </td>
                    </tr>
                  ) : customerRekap?.page.content && customerRekap.page.content.length > 0 ? (
                    customerRekap.page.content.map((row) => (
                      <tr key={row.customerId} className="hover:bg-slate-50/70 dark:hover:bg-navy-800/40 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{row.customerName}</div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                            {row.customerCode} {row.companyName ? `• ${row.companyName}` : ''}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{row.phone || '-'}</td>
                        <td className="py-3 px-4 text-center font-medium text-slate-700 dark:text-slate-300">
                          {row.totalKegiatan}
                        </td>
                        <td className="py-3 px-4 text-center font-medium text-slate-700 dark:text-slate-300">
                          {row.totalInvoices}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100 font-mono">
                          {formatCurrency(row.totalInvoiceAmount)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          {formatCurrency(row.totalPaidAmount)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-amber-600 dark:text-amber-400 font-mono">
                          {formatCurrency(row.totalOutstanding)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-purple-600 dark:text-purple-400 font-mono">
                          {formatCurrency(row.depositBalance)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400 dark:text-slate-500">
                        Tidak ada data customer yang cocok dengan filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {customerRekap?.page && customerRekap.page.totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Halaman {customerRekap.page.number + 1} dari {customerRekap.page.totalPages} (Total{' '}
                  {customerRekap.page.totalElements} mitra)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-navy-800"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page >= customerRekap.page.totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-navy-800"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </BentoCard>
        </div>
      )}

      {/* TAB 2: REKAP FAKTUR PENJUALAN */}
      {activeTab === 'INVOICES' && (
        <div className="space-y-4">
          {/* Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <BentoCard padding="default">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Grand Total Nilai Faktur</span>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono">
                {formatCurrency(invoiceRekap?.grandTotalAmount || 0)}
              </div>
            </BentoCard>
            <BentoCard padding="default">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Grand Total Pelunasan</span>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                {formatCurrency(invoiceRekap?.grandTotalPaidAmount || 0)}
              </div>
            </BentoCard>
            <BentoCard padding="default">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Grand Total Sisa Piutang</span>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 font-mono">
                {formatCurrency(invoiceRekap?.grandTotalOutstanding || 0)}
              </div>
            </BentoCard>
          </div>

          <BentoCard padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-navy-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200/80 dark:border-navy-700/80">
                  <tr>
                    <th className="py-3.5 px-4">No. Faktur</th>
                    <th className="py-3.5 px-4">Tanggal & Jatuh Tempo</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Status Bayar</th>
                    <th className="py-3.5 px-4 text-right">Nilai Faktur</th>
                    <th className="py-3.5 px-4 text-right">Dibayar</th>
                    <th className="py-3.5 px-4 text-right">Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                  {loadingInvoices ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400 dark:text-slate-500">
                        Memuat data rekap faktur...
                      </td>
                    </tr>
                  ) : invoiceRekap?.page.content && invoiceRekap.page.content.length > 0 ? (
                    invoiceRekap.page.content.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-navy-800/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{row.number}</td>
                        <td className="py-3 px-4">
                          <div className="text-slate-800 dark:text-slate-200">{formatDate(row.date)}</div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500">
                            JT: {row.dueDate ? formatDate(row.dueDate) : '-'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{row.customerName}</div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{row.customerCode}</div>
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={row.paymentStatus} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100 font-mono">
                          {formatCurrency(row.totalAmount)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          {formatCurrency(row.paidAmount)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-amber-600 dark:text-amber-400 font-mono">
                          {formatCurrency(row.outstanding)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400 dark:text-slate-500">
                        Tidak ada data faktur penjualan yang cocok.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {invoiceRekap?.page && invoiceRekap.page.totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Halaman {invoiceRekap.page.number + 1} dari {invoiceRekap.page.totalPages} (Total{' '}
                  {invoiceRekap.page.totalElements} faktur)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-navy-800"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page >= invoiceRekap.page.totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-navy-800"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </BentoCard>
        </div>
      )}

      {/* TAB 3: REKAP PEMBAYARAN */}
      {activeTab === 'PAYMENTS' && (
        <div className="space-y-4">
          <BentoCard padding="default" className="max-w-sm">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Grand Total Realisasi Kas</span>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              {formatCurrency(paymentRekap?.grandTotalAmount || 0)}
            </div>
          </BentoCard>

          <BentoCard padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-navy-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200/80 dark:border-navy-700/80">
                  <tr>
                    <th className="py-3.5 px-4">No. Bukti Bayar</th>
                    <th className="py-3.5 px-4">Tanggal</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Metode & Rekening</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Nominal Diterima</th>
                    <th className="py-3.5 px-4 text-right">Alokasi Faktur</th>
                    <th className="py-3.5 px-4 text-right">Deposit Terbentuk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                  {loadingPayments ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400 dark:text-slate-500">
                        Memuat data pembayaran...
                      </td>
                    </tr>
                  ) : paymentRekap?.page.content && paymentRekap.page.content.length > 0 ? (
                    paymentRekap.page.content.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-navy-800/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{row.number}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{formatDate(row.date)}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{row.customerName}</div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{row.customerCode}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800 dark:text-slate-200">{row.paymentMethod}</span>
                          {row.destinationAccount && (
                            <div className="text-[11px] text-slate-400 dark:text-slate-500">{row.destinationAccount}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={row.status} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-right font-black text-emerald-600 dark:text-emerald-400 font-mono">
                          {formatCurrency(row.amount)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-800 dark:text-slate-200 font-mono">
                          {formatCurrency(row.allocatedAmount)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-purple-600 dark:text-purple-400 font-mono">
                          {formatCurrency(row.excessDeposit)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400 dark:text-slate-500">
                        Tidak ada riwayat pembayaran yang cocok.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {paymentRekap?.page && paymentRekap.page.totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Halaman {paymentRekap.page.number + 1} dari {paymentRekap.page.totalPages} (Total{' '}
                  {paymentRekap.page.totalElements} pembayaran)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-navy-800"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page >= paymentRekap.page.totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-navy-800"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </BentoCard>
        </div>
      )}

      {/* TAB 4: REKAP KEGIATAN */}
      {activeTab === 'KEGIATAN' && (
        <div className="space-y-4">
          <BentoCard padding="default" className="max-w-sm">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Grand Total Nilai Kegiatan Proyek</span>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono">
              {formatCurrency(kegiatanRekap?.grandTotalValue || 0)}
            </div>
          </BentoCard>

          <BentoCard padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-navy-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200/80 dark:border-navy-700/80">
                  <tr>
                    <th className="py-3.5 px-4">Kode & Nama Kegiatan</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Lokasi</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Rincian Item</th>
                    <th className="py-3.5 px-4 text-right">Nilai Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                  {loadingKegiatan ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400 dark:text-slate-500">
                        Memuat data kegiatan...
                      </td>
                    </tr>
                  ) : kegiatanRekap?.page.content && kegiatanRekap.page.content.length > 0 ? (
                    kegiatanRekap.page.content.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-navy-800/40 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{row.name}</div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{row.code}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{row.customerName}</div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{row.customerCode}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{row.location || '-'}</td>
                        <td className="py-3 px-4 text-center">
                          <StatusBadge status={row.status} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-center font-medium text-slate-700 dark:text-slate-300">
                          {row.itemCount} item
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100 font-mono">
                          {formatCurrency(row.totalValue)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400 dark:text-slate-500">
                        Tidak ada kegiatan proyek yang cocok.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {kegiatanRekap?.page && kegiatanRekap.page.totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Halaman {kegiatanRekap.page.number + 1} dari {kegiatanRekap.page.totalPages} (Total{' '}
                  {kegiatanRekap.page.totalElements} kegiatan)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-navy-800"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page >= kegiatanRekap.page.totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-navy-800"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </BentoCard>
        </div>
      )}
    </div>
  );
};
export default RekapPage;

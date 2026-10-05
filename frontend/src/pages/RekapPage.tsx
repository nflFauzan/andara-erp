import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import {
  getRekapCustomers,
  getRekapInvoices,
  getRekapPayments,
  getRekapKegiatan,
  getRekapPenawaran,
  getRekapPiutang,
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
import { CustomerStatementDrawer } from '@/components/rekap/CustomerStatementDrawer';

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

const renderAgingBadge = (bucket: string, daysOverdue: number) => {
  switch (bucket) {
    case 'CURRENT':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Lancar (Belum JT)
        </span>
      );
    case 'DAYS_1_30':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
          1–30 Hari (+{daysOverdue}h)
        </span>
      );
    case 'DAYS_31_60':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          31–60 Hari (+{daysOverdue}h)
        </span>
      );
    case 'DAYS_61_90':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border border-orange-200/60 dark:border-orange-800/60">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          61–90 Hari (+{daysOverdue}h)
        </span>
      );
    case 'DAYS_OVER_90':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-300/80 dark:border-rose-800/80">
          <AlertTriangle className="w-3 h-3 text-rose-500" />
          &gt;90 Hari (+{daysOverdue}h)
        </span>
      );
  }
};

export const RekapPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<RekapTab>('CUSTOMERS');
  const [statementCustomer, setStatementCustomer] = useState<{ id: number; name: string } | null>(null);

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

  // Query 5: Rekap SPH / Penawaran
  const { data: penawaranRekap, isLoading: loadingPenawaran } = useQuery({
    queryKey: [
      'rekapPenawaran',
      filters.search,
      filters.customerId,
      filters.startDate,
      filters.endDate,
      filters.status,
      page,
    ],
    queryFn: () =>
      getRekapPenawaran({
        search: filters.search || undefined,
        customerId: filters.customerId ? Number(filters.customerId) : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        status: filters.status || undefined,
        page,
        size: pageSize,
      }),
    enabled: activeTab === 'SPH',
  });

  // Query 6: Rekap Piutang & Aging Schedule
  const { data: piutangRekap, isLoading: loadingPiutang } = useQuery({
    queryKey: [
      'rekapPiutang',
      filters.search,
      filters.customerId,
      filters.status,
      page,
    ],
    queryFn: () =>
      getRekapPiutang({
        search: filters.search || undefined,
        customerId: filters.customerId ? Number(filters.customerId) : undefined,
        agingBucket: filters.status || undefined,
        page,
        size: pageSize,
      }),
    enabled: activeTab === 'PIUTANG',
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
        subtitle="Monitoring data teragregasi per customer, kegiatan proyek, SPH, faktur penjualan, aging piutang, dan kas."
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
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
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
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'KEGIATAN'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
              }`}
            >
              <HardHat className="w-4 h-4" />
              <span>Rekap Kegiatan</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('SPH')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'SPH'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Rekap SPH / Penawaran</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('INVOICES')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'INVOICES'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Rekap Faktur</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('PIUTANG')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'PIUTANG'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Aging Piutang</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('PAYMENTS')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'PAYMENTS'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Rekap Kas Masuk</span>
            </button>
          </div>

          <div className="hidden xl:flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Fase 2 Aktif: SPH &amp; Aging Piutang</span>
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
                    <th className="py-3.5 px-4 text-center">Buku Besar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                  {loadingCustomers ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-slate-400 dark:text-slate-500">
                        Memuat data rekap customer...
                      </td>
                    </tr>
                  ) : customerRekap?.page.content && customerRekap.page.content.length > 0 ? (
                    customerRekap.page.content.map((row) => (
                      <tr key={row.customerId} className="hover:bg-slate-50/70 dark:hover:bg-navy-800/40 transition group">
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => setStatementCustomer({ id: row.customerId, name: row.customerName })}
                            className="text-left group/cust"
                            title="Klik untuk membuka Buku Besar / Riwayat Lengkap Customer"
                          >
                            <div className="font-bold text-slate-900 dark:text-slate-100 group-hover/cust:text-indigo-600 dark:group-hover/cust:text-brand-gold transition-colors flex items-center gap-1.5">
                              {row.customerName}
                              <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover/cust:opacity-100 text-indigo-500 dark:text-brand-gold transition-opacity" />
                            </div>
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                              {row.customerCode} {row.companyName ? `• ${row.companyName}` : ''}
                            </div>
                          </button>
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
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setStatementCustomer({ id: row.customerId, name: row.customerName })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-navy-700 text-indigo-700 dark:text-brand-gold border border-indigo-200/60 dark:border-navy-600 hover:bg-indigo-100 dark:hover:bg-navy-600 transition shadow-2xs"
                            title="Buka Customer Statement & Ledger"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Statement</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-slate-400 dark:text-slate-500">
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
                      <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-navy-800/40 transition group">
                        <td className="py-3 px-4 font-mono font-bold">
                          <button
                            type="button"
                            onClick={() => navigate(`/faktur/${row.id}`)}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 group/inv text-left"
                            title={`Lihat detail faktur ${row.number}`}
                          >
                            <span>{row.number}</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover/inv:opacity-100 transition-opacity" />
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-800 dark:text-slate-200">{formatDate(row.date)}</div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500">
                            JT: {row.dueDate ? formatDate(row.dueDate) : '-'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => setStatementCustomer({ id: row.customerId, name: row.customerName })}
                            className="text-left group/cust"
                            title="Buka Statement Customer"
                          >
                            <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover/cust:text-indigo-600 dark:group-hover/cust:text-brand-gold transition-colors flex items-center gap-1">
                              {row.customerName}
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover/cust:opacity-100 text-brand-gold transition-opacity" />
                            </div>
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{row.customerCode}</div>
                          </button>
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
                      <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-navy-800/40 transition group">
                        <td className="py-3 px-4 font-mono font-bold">
                          <button
                            type="button"
                            onClick={() => navigate(`/pembayaran/${row.id}`)}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 group/pay text-left"
                            title={`Lihat detail pembayaran ${row.number}`}
                          >
                            <span>{row.number}</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover/pay:opacity-100 transition-opacity" />
                          </button>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{formatDate(row.date)}</td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => setStatementCustomer({ id: row.customerId, name: row.customerName })}
                            className="text-left group/cust"
                            title="Buka Statement Customer"
                          >
                            <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover/cust:text-indigo-600 dark:group-hover/cust:text-brand-gold transition-colors flex items-center gap-1">
                              {row.customerName}
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover/cust:opacity-100 text-brand-gold transition-opacity" />
                            </div>
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{row.customerCode}</div>
                          </button>
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

      {/* TAB: REKAP KEGIATAN */}
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
                    <th className="py-3.5 px-4 text-center">SPH Terkait</th>
                    <th className="py-3.5 px-4 text-center">Faktur Terbit</th>
                    <th className="py-3.5 px-4 text-right">Nilai Total Proyek</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                  {loadingKegiatan ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400 dark:text-slate-500">
                        Memuat data kegiatan...
                      </td>
                    </tr>
                  ) : kegiatanRekap?.page.content && kegiatanRekap.page.content.length > 0 ? (
                    kegiatanRekap.page.content.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-navy-800/40 transition group">
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => navigate(`/kegiatan/${row.id}`)}
                            className="text-left group/keg"
                            title={`Lihat detail proyek kegiatan ${row.name}`}
                          >
                            <div className="font-bold text-slate-900 dark:text-slate-100 group-hover/keg:text-indigo-600 dark:group-hover/keg:text-brand-gold transition-colors flex items-center gap-1.5">
                              {row.name}
                              <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover/keg:opacity-100 text-indigo-500 dark:text-brand-gold transition-opacity" />
                            </div>
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{row.code}</div>
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => setStatementCustomer({ id: row.customerId, name: row.customerName })}
                            className="text-left group/cust"
                            title="Buka Statement Customer"
                          >
                            <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover/cust:text-indigo-600 dark:group-hover/cust:text-brand-gold transition-colors flex items-center gap-1">
                              {row.customerName}
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover/cust:opacity-100 text-brand-gold transition-opacity" />
                            </div>
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{row.customerCode}</div>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{row.location || '-'}</td>
                        <td className="py-3 px-4 text-center">
                          <StatusBadge status={row.status} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-center font-medium text-slate-700 dark:text-slate-300">
                          {row.itemCount} item
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            row.penawaranCount > 0
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}>
                            {row.penawaranCount} SPH
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            row.invoiceCount > 0
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}>
                            {row.invoiceCount} Faktur
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100 font-mono">
                          {formatCurrency(row.totalValue)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400 dark:text-slate-500">
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

      {/* TAB: REKAP SPH / PENAWARAN */}
      {activeTab === 'SPH' && (
        <div className="space-y-4">
          {/* Summary KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            <BentoCard padding="default">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Total SPH Terbit
              </span>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono">
                {formatCurrency(penawaranRekap?.grandTotalAmount || 0)}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {penawaranRekap?.totalPenawaran || 0} berkas penawaran
              </div>
            </BentoCard>

            <BentoCard padding="default">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Disetujui (Approved)
              </span>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                {formatCurrency(penawaranRekap?.approvedTotalAmount || 0)}
              </div>
              <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                {penawaranRekap?.approvedCount || 0} SPH disetujui mitra
              </div>
            </BentoCard>

            <BentoCard padding="default">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Diajukan (Sent)
              </span>
              <div className="text-lg font-bold text-sky-600 dark:text-sky-400 mt-1 font-mono">
                {formatCurrency(penawaranRekap?.sentTotalAmount || 0)}
              </div>
              <div className="text-[11px] text-sky-600/80 dark:text-sky-400/80 mt-0.5">
                {penawaranRekap?.sentCount || 0} SPH proses review
              </div>
            </BentoCard>

            <BentoCard padding="default">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Realisasi Faktur Terbit
              </span>
              <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1 font-mono">
                {formatCurrency(penawaranRekap?.grandTotalInvoicedAmount || 0)}
              </div>
              <div className="text-[11px] text-indigo-600/80 dark:text-indigo-400/80 mt-0.5">
                Nilai tagihan yang sudah terbit
              </div>
            </BentoCard>

            <BentoCard padding="default">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Sisa Belum Ditagih
              </span>
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1 font-mono">
                {formatCurrency(penawaranRekap?.grandTotalUnbilledAmount || 0)}
              </div>
              <div className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">
                Potensi penagihan berikutnya
              </div>
            </BentoCard>
          </div>

          {/* Table */}
          <BentoCard padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-navy-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200/80 dark:border-navy-700/80">
                  <tr>
                    <th className="py-3.5 px-4">No. SPH</th>
                    <th className="py-3.5 px-4">Tanggal</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Kegiatan Proyek Dicakup</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Nilai SPH</th>
                    <th className="py-3.5 px-4 text-right">Faktur Terbit</th>
                    <th className="py-3.5 px-4 text-right">Belum Ditagih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                  {loadingPenawaran ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400 dark:text-slate-500">
                        Memuat data rekap SPH / penawaran...
                      </td>
                    </tr>
                  ) : penawaranRekap?.page.content && penawaranRekap.page.content.length > 0 ? (
                    penawaranRekap.page.content.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-navy-800/40 transition group">
                        <td className="py-3 px-4 font-mono font-bold">
                          <button
                            type="button"
                            onClick={() => navigate(`/penawaran/${row.id}`)}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 group/sph text-left"
                            title={`Lihat detail penawaran SPH ${row.number}`}
                          >
                            <span>{row.number}</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover/sph:opacity-100 transition-opacity" />
                          </button>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {formatDate(row.date)}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => setStatementCustomer({ id: row.customerId, name: row.customerName })}
                            className="text-left group/cust"
                            title="Buka Statement Customer"
                          >
                            <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover/cust:text-indigo-600 dark:group-hover/cust:text-brand-gold transition-colors flex items-center gap-1">
                              {row.customerName}
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover/cust:opacity-100 text-brand-gold transition-opacity" />
                            </div>
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                              {row.customerCode} {row.companyName ? `• ${row.companyName}` : ''}
                            </div>
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                            {row.kegiatanSummary}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500">
                            {row.kegiatanCount} kegiatan
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <StatusBadge status={row.status} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100 font-mono">
                          {formatCurrency(row.totalAmount)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-700 dark:text-slate-300 font-mono">
                          <div>{formatCurrency(row.invoicedAmount)}</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500">
                            {row.invoiceCount} faktur
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-bold font-mono">
                          <span className={row.unbilledAmount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}>
                            {formatCurrency(row.unbilledAmount)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400 dark:text-slate-500">
                        Tidak ada data SPH / penawaran yang cocok dengan filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {penawaranRekap?.page && penawaranRekap.page.totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Halaman {penawaranRekap.page.number + 1} dari {penawaranRekap.page.totalPages} (Total{' '}
                  {penawaranRekap.page.totalElements} SPH)
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
                    disabled={page >= penawaranRekap.page.totalPages - 1}
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

      {/* TAB: REKAP PIUTANG & AGING SCHEDULE */}
      {activeTab === 'PIUTANG' && (
        <div className="space-y-4">
          {/* Aging Schedule Interactive Filter Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 1. All Outstanding */}
            <div
              onClick={() => {
                setFilters({ ...filters, status: '' });
                setPage(0);
              }}
              className={`cursor-pointer rounded-2xl p-3.5 transition-all border ${
                filters.status === ''
                  ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 shadow-xs'
                  : 'bg-white dark:bg-navy-800/80 border-slate-200/80 dark:border-navy-700/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                <span>Total Piutang</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-navy-700 font-mono">Semua</span>
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono">
                {formatCurrency(piutangRekap?.grandTotalOutstanding || 0)}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {piutangRekap?.totalInvoicesWithOutstanding || 0} faktur
              </div>
            </div>

            {/* 2. Lancar (Belum JT) */}
            <div
              onClick={() => {
                setFilters({ ...filters, status: filters.status === 'CURRENT' ? '' : 'CURRENT' });
                setPage(0);
              }}
              className={`cursor-pointer rounded-2xl p-3.5 transition-all border ${
                filters.status === 'CURRENT'
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 shadow-xs'
                  : 'bg-white dark:bg-navy-800/80 border-slate-200/80 dark:border-navy-700/80 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase">
                <span>Lancar</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                {formatCurrency(piutangRekap?.currentAmount || 0)}
              </div>
              <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                {piutangRekap?.currentCount || 0} faktur belum JT
              </div>
            </div>

            {/* 3. 1 - 30 Hari */}
            <div
              onClick={() => {
                setFilters({ ...filters, status: filters.status === 'DAYS_1_30' ? '' : 'DAYS_1_30' });
                setPage(0);
              }}
              className={`cursor-pointer rounded-2xl p-3.5 transition-all border ${
                filters.status === 'DAYS_1_30'
                  ? 'bg-sky-50/90 dark:bg-sky-950/40 border-sky-500 shadow-xs'
                  : 'bg-white dark:bg-navy-800/80 border-slate-200/80 dark:border-navy-700/80 hover:border-sky-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-sky-700 dark:text-sky-400 uppercase">
                <span>1–30 Hari</span>
                <span className="w-2 h-2 rounded-full bg-sky-500" />
              </div>
              <div className="text-base font-bold text-sky-600 dark:text-sky-400 mt-1 font-mono">
                {formatCurrency(piutangRekap?.bucket1To30Amount || 0)}
              </div>
              <div className="text-[11px] text-sky-600/80 dark:text-sky-400/80 mt-0.5">
                {piutangRekap?.bucket1To30Count || 0} faktur
              </div>
            </div>

            {/* 4. 31 - 60 Hari */}
            <div
              onClick={() => {
                setFilters({ ...filters, status: filters.status === 'DAYS_31_60' ? '' : 'DAYS_31_60' });
                setPage(0);
              }}
              className={`cursor-pointer rounded-2xl p-3.5 transition-all border ${
                filters.status === 'DAYS_31_60'
                  ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-500 shadow-xs'
                  : 'bg-white dark:bg-navy-800/80 border-slate-200/80 dark:border-navy-700/80 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase">
                <span>31–60 Hari</span>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
              <div className="text-base font-bold text-amber-600 dark:text-amber-400 mt-1 font-mono">
                {formatCurrency(piutangRekap?.bucket31To60Amount || 0)}
              </div>
              <div className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">
                {piutangRekap?.bucket31To60Count || 0} faktur
              </div>
            </div>

            {/* 5. 61 - 90 Hari */}
            <div
              onClick={() => {
                setFilters({ ...filters, status: filters.status === 'DAYS_61_90' ? '' : 'DAYS_61_90' });
                setPage(0);
              }}
              className={`cursor-pointer rounded-2xl p-3.5 transition-all border ${
                filters.status === 'DAYS_61_90'
                  ? 'bg-orange-50/90 dark:bg-orange-950/40 border-orange-500 shadow-xs'
                  : 'bg-white dark:bg-navy-800/80 border-slate-200/80 dark:border-navy-700/80 hover:border-orange-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-orange-700 dark:text-orange-400 uppercase">
                <span>61–90 Hari</span>
                <span className="w-2 h-2 rounded-full bg-orange-500" />
              </div>
              <div className="text-base font-bold text-orange-600 dark:text-orange-400 mt-1 font-mono">
                {formatCurrency(piutangRekap?.bucket61To90Amount || 0)}
              </div>
              <div className="text-[11px] text-orange-600/80 dark:text-orange-400/80 mt-0.5">
                {piutangRekap?.bucket61To90Count || 0} faktur
              </div>
            </div>

            {/* 6. > 90 Hari */}
            <div
              onClick={() => {
                setFilters({ ...filters, status: filters.status === 'DAYS_OVER_90' ? '' : 'DAYS_OVER_90' });
                setPage(0);
              }}
              className={`cursor-pointer rounded-2xl p-3.5 transition-all border ${
                filters.status === 'DAYS_OVER_90'
                  ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-500 shadow-xs'
                  : 'bg-white dark:bg-navy-800/80 border-slate-200/80 dark:border-navy-700/80 hover:border-rose-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-rose-700 dark:text-rose-400 uppercase">
                <span>&gt; 90 Hari</span>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <div className="text-base font-bold text-rose-600 dark:text-rose-400 mt-1 font-mono">
                {formatCurrency(piutangRekap?.bucketOver90Amount || 0)}
              </div>
              <div className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-0.5">
                {piutangRekap?.bucketOver90Count || 0} faktur risiko tinggi
              </div>
            </div>
          </div>

          {/* Table */}
          <BentoCard padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-navy-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200/80 dark:border-navy-700/80">
                  <tr>
                    <th className="py-3.5 px-4">No. Faktur</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Tanggal & Jatuh Tempo</th>
                    <th className="py-3.5 px-4 text-center">Status Umur (Aging)</th>
                    <th className="py-3.5 px-4 text-right">Nilai Faktur</th>
                    <th className="py-3.5 px-4 text-right">Terbayar</th>
                    <th className="py-3.5 px-4 text-right">Sisa Piutang</th>
                    <th className="py-3.5 px-4 text-center">Status Bayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                  {loadingPiutang ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400 dark:text-slate-500">
                        Memuat data aging piutang...
                      </td>
                    </tr>
                  ) : piutangRekap?.page.content && piutangRekap.page.content.length > 0 ? (
                    piutangRekap.page.content.map((row) => (
                      <tr key={row.invoiceId} className="hover:bg-slate-50/70 dark:hover:bg-navy-800/40 transition group">
                        <td className="py-3 px-4 font-mono font-bold">
                          <button
                            type="button"
                            onClick={() => navigate(`/faktur/${row.invoiceId}`)}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 group/inv text-left"
                            title={`Lihat detail faktur ${row.invoiceNumber}`}
                          >
                            <span>{row.invoiceNumber}</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover/inv:opacity-100 transition-opacity" />
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => setStatementCustomer({ id: row.customerId, name: row.customerName })}
                            className="text-left group/cust"
                            title="Buka Statement Customer"
                          >
                            <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover/cust:text-indigo-600 dark:group-hover/cust:text-brand-gold transition-colors flex items-center gap-1">
                              {row.customerName}
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover/cust:opacity-100 text-brand-gold transition-opacity" />
                            </div>
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                              {row.customerCode} {row.companyName ? `• ${row.companyName}` : ''}
                            </div>
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-800 dark:text-slate-200">{formatDate(row.invoiceDate)}</div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500">
                            JT: {row.dueDate ? formatDate(row.dueDate) : '-'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {renderAgingBadge(row.agingBucket, row.daysOverdue)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100 font-mono">
                          {formatCurrency(row.totalAmount)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-emerald-600 dark:text-emerald-400 font-mono">
                          {formatCurrency(row.paidAmount)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold font-mono">
                          <span className={row.daysOverdue > 60 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}>
                            {formatCurrency(row.outstanding)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <StatusBadge status={row.paymentStatus} size="sm" />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400 dark:text-slate-500">
                        Tidak ada catatan piutang yang cocok dengan filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {piutangRekap?.page && piutangRekap.page.totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Halaman {piutangRekap.page.number + 1} dari {piutangRekap.page.totalPages} (Total{' '}
                  {piutangRekap.page.totalElements} faktur berpiutang)
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
                    disabled={page >= piutangRekap.page.totalPages - 1}
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

      {/* Customer Financial Statement Drawer */}
      {statementCustomer && (
        <CustomerStatementDrawer
          customerId={statementCustomer.id}
          customerName={statementCustomer.name}
          initialStartDate={filters.startDate}
          initialEndDate={filters.endDate}
          onClose={() => setStatementCustomer(null)}
        />
      )}
    </div>
  );
};
export default RekapPage;

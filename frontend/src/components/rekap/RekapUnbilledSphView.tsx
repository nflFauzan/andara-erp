import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  AlertTriangle,
  Receipt,
  PlusCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  User,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { getRekapUnbilledSph } from '@/api/rekapApi';
import { FilterState } from './UniversalPeriodFilter';
import { BentoCard } from '@/components/common/BentoCard';
import { RekapUnbilledSph } from '@/types/rekap';

interface RekapUnbilledSphViewProps {
  filters: FilterState;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  onCustomerClick: (id: number, name: string) => void;
  onNavigate: (path: string) => void;
}

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

export const RekapUnbilledSphView: React.FC<RekapUnbilledSphViewProps> = ({
  filters,
  page,
  pageSize,
  onPageChange,
  onCustomerClick,
  onNavigate,
}) => {
  const { data, isLoading } = useQuery({
    queryKey: [
      'rekapUnbilledSph',
      filters.search,
      filters.customerId,
      filters.startDate,
      filters.endDate,
      filters.status,
      page,
      pageSize,
    ],
    queryFn: () =>
      getRekapUnbilledSph({
        search: filters.search || undefined,
        customerId: filters.customerId ? Number(filters.customerId) : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        billingStatus: filters.status || undefined,
        page,
        size: pageSize,
      }),
  });

  const summary = data;
  const list = summary?.page?.content || [];
  const totalElements = summary?.page?.totalElements || 0;
  const totalPages = summary?.page?.totalPages || 0;

  const renderBillingBadge = (status: RekapUnbilledSph['billingStatus']) => {
    switch (status) {
      case 'FULLY_BILLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Lengkap Ditagih
          </span>
        );
      case 'PARTIALLY_BILLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Sebagian Ditagih
          </span>
        );
      case 'UNBILLED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            Belum Ditagih (0%)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Leakage Alert Notice */}
      {summary && summary.totalUnbilledAmount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <span>Potensi Pendapatan Tertunda (Unbilled Leakage)</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white">
                {formatCurrency(summary.totalUnbilledAmount)}
              </span>
            </h4>
            <p className="text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
              Terdapat <strong>{summary.unbilledCount + summary.partiallyBilledCount}</strong> SPH yang telah disetujui namun nilainya belum diterbitkan faktur penjualan secara penuh. Segera buat faktur agar tagihan tidak terlupakan dan piutang dapat ditagihkan tepat waktu.
            </p>
          </div>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total SPH Disetujui */}
        <BentoCard padding="default" className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total SPH Disetujui
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(summary?.totalSphAmount)}
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {summary?.totalSph || 0}
              </span>
              <span>dokumen penawaran disetujui</span>
            </div>
          </div>
        </BentoCard>

        {/* Card 2: Total Telah Difakturkan */}
        <BentoCard padding="default" className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Telah Difakturkan
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(summary?.totalInvoicedAmount)}
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span>Rasio penagihan:</span>
              <strong className="text-emerald-600 dark:text-emerald-400">
                {summary && summary.totalSphAmount > 0
                  ? ((summary.totalInvoicedAmount / summary.totalSphAmount) * 100).toFixed(1)
                  : 0}%
              </strong>
            </div>
          </div>
        </BentoCard>

        {/* Card 3: Sisa Belum Ditagih */}
        <BentoCard padding="default" className="relative overflow-hidden border-rose-200/60 dark:border-rose-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              Sisa Belum Ditagih (Unbilled)
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
              {formatCurrency(summary?.totalUnbilledAmount)}
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span>Outstanding SPH:</span>
              <strong className="text-rose-600 dark:text-rose-400">
                {summary && summary.totalSphAmount > 0
                  ? ((summary.totalUnbilledAmount / summary.totalSphAmount) * 100).toFixed(1)
                  : 0}%
              </strong>
            </div>
          </div>
        </BentoCard>

        {/* Card 4: Status Penagihan Distribusi */}
        <BentoCard padding="default" className="relative overflow-hidden">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            Status Kelengkapan Penagihan
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Belum Ditagih (0%):
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {summary?.unbilledCount || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Sebagian Ditagih:
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {summary?.partiallyBilledCount || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Lengkap (100%):
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {summary?.fullyBilledCount || 0}
              </span>
            </div>
          </div>
        </BentoCard>
      </div>

      {/* Main Table Card */}
      <BentoCard padding="none" className="overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-navy-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Matriks Konversi SPH &rarr; Faktur Penjualan
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Total {totalElements} dokumen SPH
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 dark:bg-navy-900/50 border-b border-slate-100 dark:border-navy-700/80 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">No. SPH &amp; Tanggal</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold text-right">Nilai SPH</th>
                <th className="py-3 px-4 font-semibold text-right">Telah Difakturkan</th>
                <th className="py-3 px-4 font-semibold text-right">Sisa Belum Ditagih</th>
                <th className="py-3 px-4 font-semibold text-center">Status Tagihan</th>
                <th className="py-3 px-4 font-semibold">Faktur Terbit</th>
                <th className="py-3 px-4 font-semibold text-center print:hidden">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Memuat matriks analisis silang SPH &times; Faktur...
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ada data SPH disetujui pada filter ini.
                  </td>
                </tr>
              ) : (
                list.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-navy-800/40 transition"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onNavigate(`/penawaran`)}
                          className="text-indigo-600 dark:text-indigo-400 hover:underline font-mono inline-flex items-center gap-1"
                          title="Buka modul Penawaran"
                        >
                          {row.number}
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {formatDate(row.date)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => onCustomerClick(row.customerId, row.customerName)}
                        className="text-left group flex items-start gap-1.5"
                        title="Buka Statement Customer"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 mt-0.5 shrink-0" />
                        <div>
                          <div className="font-medium text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                            {row.customerName}
                          </div>
                          {row.companyName && (
                            <div className="text-[11px] text-slate-400">
                              {row.companyName}
                            </div>
                          )}
                        </div>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-800 dark:text-slate-100">
                      {formatCurrency(row.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(row.invoicedAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold">
                      <span
                        className={
                          row.unbilledAmount > 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-400'
                        }
                      >
                        {formatCurrency(row.unbilledAmount)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {renderBillingBadge(row.billingStatus)}
                    </td>
                    <td className="py-3.5 px-4">
                      {row.invoices && row.invoices.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {row.invoices.map((inv) => (
                            <button
                              key={inv.id}
                              type="button"
                              onClick={() => onNavigate(`/invoices`)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50 text-[11px] font-mono transition"
                              title={`Tanggal: ${inv.date} | Nilai: ${formatCurrency(inv.amount)}`}
                            >
                              <span>{inv.number}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          Belum ada faktur
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center print:hidden">
                      {row.unbilledAmount > 0 ? (
                        <button
                          type="button"
                          onClick={() => onNavigate(`/invoices?penawaranId=${row.id}`)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-medium shadow-xs transition"
                          title="Terbitkan faktur untuk SPH ini"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Buat Faktur</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Tuntas
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-navy-700/80 flex items-center justify-between text-xs text-slate-500">
            <div>
              Halaman {page + 1} dari {totalPages} (Total {totalElements} data)
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => onPageChange(page - 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => onPageChange(page + 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </BentoCard>
    </div>
  );
};

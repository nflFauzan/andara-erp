import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Receipt,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  User,
  ArrowDownRight,
  Landmark,
  Wallet
} from 'lucide-react';
import { getRekapInvoiceSettlements } from '@/api/rekapApi';
import { FilterState } from './UniversalPeriodFilter';
import { BentoCard } from '@/components/common/BentoCard';
import { InvoiceSettlement } from '@/types/rekap';

interface RekapSettlementsViewProps {
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

export const RekapSettlementsView: React.FC<RekapSettlementsViewProps> = ({
  filters,
  page,
  pageSize,
  onPageChange,
  onCustomerClick,
  onNavigate,
}) => {
  const [expandedInvoiceIds, setExpandedInvoiceIds] = useState<Set<number>>(new Set());

  const toggleExpand = (invoiceId: number) => {
    setExpandedInvoiceIds((prev) => {
      const next = new Set(prev);
      if (next.has(invoiceId)) {
        next.delete(invoiceId);
      } else {
        next.add(invoiceId);
      }
      return next;
    });
  };

  const expandAll = (list: InvoiceSettlement[]) => {
    setExpandedInvoiceIds(new Set(list.map((i) => i.invoiceId)));
  };

  const collapseAll = () => {
    setExpandedInvoiceIds(new Set());
  };

  const { data, isLoading } = useQuery({
    queryKey: [
      'rekapInvoiceSettlements',
      filters.search,
      filters.customerId,
      filters.startDate,
      filters.endDate,
      filters.status,
      page,
      pageSize,
    ],
    queryFn: () =>
      getRekapInvoiceSettlements({
        search: filters.search || undefined,
        customerId: filters.customerId ? Number(filters.customerId) : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        paymentStatus: filters.status || undefined,
        page,
        size: pageSize,
      }),
  });

  const summary = data;
  const list = summary?.page?.content || [];
  const totalElements = summary?.page?.totalElements || 0;
  const totalPages = summary?.page?.totalPages || 0;

  const renderPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Lunas
          </span>
        );
      case 'PARTIALLY_PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
            <Clock className="w-3 h-3 text-amber-500" />
            Sebagian Dibayar
          </span>
        );
      case 'UNPAID':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60">
            <AlertTriangle className="w-3 h-3 text-rose-500" />
            Belum Bayar
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Faktur Terbit */}
        <BentoCard padding="default" className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Tagihan Faktur
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(summary?.grandTotalAmount)}
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {summary?.totalInvoices || 0}
              </span>
              <span>total faktur penjualan</span>
            </div>
          </div>
        </BentoCard>

        {/* Card 2: Total Kas Terbayar */}
        <BentoCard padding="default" className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Terbayar (Settle)
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(summary?.grandTotalPaidAmount)}
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span>Collection rate:</span>
              <strong className="text-emerald-600 dark:text-emerald-400">
                {summary && summary.grandTotalAmount > 0
                  ? ((summary.grandTotalPaidAmount / summary.grandTotalAmount) * 100).toFixed(1)
                  : 0}%
              </strong>
            </div>
          </div>
        </BentoCard>

        {/* Card 3: Sisa Piutang */}
        <BentoCard padding="default" className="relative overflow-hidden border-rose-200/60 dark:border-rose-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              Sisa Piutang Berjalan
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
              {formatCurrency(summary?.grandTotalOutstanding)}
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span>Outstanding rate:</span>
              <strong className="text-rose-600 dark:text-rose-400">
                {summary && summary.grandTotalAmount > 0
                  ? ((summary.grandTotalOutstanding / summary.grandTotalAmount) * 100).toFixed(1)
                  : 0}%
              </strong>
            </div>
          </div>
        </BentoCard>

        {/* Card 4: Status Pelunasan */}
        <BentoCard padding="default" className="relative overflow-hidden">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            Status Pelunasan Faktur
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Belum Bayar (Unpaid):
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {summary?.unpaidCount || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Sebagian (Cicilan):
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {summary?.partiallyPaidCount || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Lunas Penuh (Paid):
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {summary?.paidCount || 0}
              </span>
            </div>
          </div>
        </BentoCard>
      </div>

      {/* Main Subledger Table Card */}
      <BentoCard padding="none" className="overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-navy-700/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Subledger Pelunasan Faktur &amp; Jejak Alokasi Kas
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => expandAll(list)}
              className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition"
            >
              Buka Semua Jejak
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition"
            >
              Tutup Semua
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 dark:bg-navy-900/50 border-b border-slate-100 dark:border-navy-700/80 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="w-8 py-3 px-3 text-center"></th>
                <th className="py-3 px-3 font-semibold">No. Faktur &amp; Tgl</th>
                <th className="py-3 px-3 font-semibold">Customer</th>
                <th className="py-3 px-3 font-semibold">Jatuh Tempo</th>
                <th className="py-3 px-3 font-semibold text-right">Nilai Faktur</th>
                <th className="py-3 px-3 font-semibold text-right">Terbayar</th>
                <th className="py-3 px-3 font-semibold text-right">Sisa Piutang</th>
                <th className="py-3 px-3 font-semibold text-center">Status</th>
                <th className="py-3 px-3 font-semibold text-center">Alokasi Kas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Memuat subledger pelunasan faktur...
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Tidak ada data faktur pada filter ini.
                  </td>
                </tr>
              ) : (
                list.map((row) => {
                  const isExpanded = expandedInvoiceIds.has(row.invoiceId);
                  const allocCount = row.allocations ? row.allocations.length : 0;

                  return (
                    <React.Fragment key={row.invoiceId}>
                      <tr
                        className={`hover:bg-slate-50/60 dark:hover:bg-navy-800/40 transition cursor-pointer ${
                          isExpanded ? 'bg-slate-50/40 dark:bg-navy-900/30' : ''
                        }`}
                        onClick={() => toggleExpand(row.invoiceId)}
                      >
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(row.invoiceId);
                            }}
                            className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-400"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                        <td className="py-3.5 px-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigate('/invoices');
                            }}
                            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline font-mono inline-flex items-center gap-1"
                            title="Buka modul Faktur"
                          >
                            {row.invoiceNumber}
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </button>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {formatDate(row.invoiceDate)}
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCustomerClick(row.customerId, row.customerName);
                            }}
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
                        <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                          {formatDate(row.dueDate)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-medium text-slate-800 dark:text-slate-100">
                          {formatCurrency(row.totalAmount)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(row.paidAmount)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-semibold">
                          <span
                            className={
                              row.outstanding > 0
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-slate-400'
                            }
                          >
                            {formatCurrency(row.outstanding)}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          {renderPaymentStatusBadge(row.paymentStatus)}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${
                              allocCount > 0
                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                                : 'bg-slate-100 text-slate-400 dark:bg-navy-800'
                            }`}
                          >
                            <ArrowDownRight className="w-3 h-3" />
                            {allocCount} Alokasi
                          </span>
                        </td>
                      </tr>

                      {/* Expanded Subledger Detail */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80 dark:bg-navy-950/40 border-y border-indigo-100 dark:border-indigo-950">
                          <td colSpan={9} className="py-3 px-6">
                            <div className="pl-6 border-l-2 border-indigo-500 py-2 space-y-2">
                              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
                                <span className="inline-flex items-center gap-1.5">
                                  <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                                  Rincian Alokasi Kas Pelunas Fakt #{row.invoiceNumber}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  Total Alokasi Masuk: {formatCurrency(row.paidAmount)}
                                </span>
                              </div>

                              {row.allocations && row.allocations.length > 0 ? (
                                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-navy-700/80 bg-white dark:bg-navy-900">
                                  <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 dark:bg-navy-800/80 border-b border-slate-200 dark:border-navy-700 text-slate-500">
                                      <tr>
                                        <th className="py-2 px-3 font-semibold">No. Bukti Kas Masuk</th>
                                        <th className="py-2 px-3 font-semibold">Tgl Bayar</th>
                                        <th className="py-2 px-3 font-semibold text-right">Nominal Dialokasikan</th>
                                        <th className="py-2 px-3 font-semibold">Metode Pembayaran</th>
                                        <th className="py-2 px-3 font-semibold">Rekening / Kas Tujuan</th>
                                        <th className="py-2 px-3 font-semibold text-center">Status Bukti</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                                      {row.allocations.map((alloc) => (
                                        <tr
                                          key={alloc.allocationId}
                                          className="hover:bg-slate-50 dark:hover:bg-navy-800/40"
                                        >
                                          <td className="py-2.5 px-3">
                                            <button
                                              type="button"
                                              onClick={() => onNavigate('/payments')}
                                              className="font-mono text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                                            >
                                              {alloc.paymentNumber}
                                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                            </button>
                                          </td>
                                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                                            {formatDate(alloc.paymentDate)}
                                          </td>
                                          <td className="py-2.5 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(alloc.allocatedAmount)}
                                          </td>
                                          <td className="py-2.5 px-3">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 text-[11px]">
                                              <Wallet className="w-3 h-3 text-slate-400" />
                                              {alloc.paymentMethod || 'TRANSFER'}
                                            </span>
                                          </td>
                                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                                            <span className="inline-flex items-center gap-1">
                                              <Landmark className="w-3 h-3 text-slate-400" />
                                              {alloc.destinationAccount || 'Rekening Utama CV. Andara'}
                                            </span>
                                          </td>
                                          <td className="py-2.5 px-3 text-center">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                                              <CheckCircle2 className="w-2.5 h-2.5" />
                                              {alloc.paymentStatus}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="p-3 rounded-xl bg-slate-100 dark:bg-navy-900 border border-dashed border-slate-200 dark:border-navy-700 text-center text-slate-400 text-xs">
                                  Belum ada pembayaran kas yang dialokasikan ke faktur ini (Outstanding 100%).
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
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

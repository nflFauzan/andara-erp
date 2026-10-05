import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Receipt,
  CreditCard,
  Percent,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { getMonthlyTrend } from '@/api/rekapApi';
import { FilterState } from './UniversalPeriodFilter';
import { BentoCard } from '@/components/common/BentoCard';

interface RekapMonthlyTrendViewProps {
  filters: FilterState;
  onCustomerClick?: (id: number, name: string) => void;
  onNavigate?: (path: string) => void;
}

const formatCurrency = (val: number | null | undefined): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val || 0);
};

export const RekapMonthlyTrendView: React.FC<RekapMonthlyTrendViewProps> = ({
  filters,
}) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const { data: trendData, isLoading } = useQuery({
    queryKey: ['rekapMonthlyTrend', selectedYear, filters.customerId],
    queryFn: () =>
      getMonthlyTrend({
        year: selectedYear,
        customerId: filters.customerId ? Number(filters.customerId) : undefined,
      }),
  });

  const months = trendData?.months || [];

  // Find maximum values for visual bars scaling
  const maxInvoiced = Math.max(...months.map((m) => m.invoicedAmount), 1);
  const maxPayment = Math.max(...months.map((m) => m.paymentAmount), 1);
  const chartMax = Math.max(maxInvoiced, maxPayment, 1);

  const renderMomBadge = (val: number | null) => {
    if (val === null || val === undefined) {
      return (
        <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-400">
          <Minus className="w-3 h-3" /> Base
        </span>
      );
    }
    if (val > 0) {
      return (
        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
          <ArrowUpRight className="w-3 h-3 text-emerald-500" />
          +{val.toFixed(1)}%
        </span>
      );
    }
    if (val < 0) {
      return (
        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
          <ArrowDownRight className="w-3 h-3 text-rose-500" />
          {val.toFixed(1)}%
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-400">
        <Minus className="w-3 h-3" /> 0.0%
      </span>
    );
  };

  const renderCollectionRateBar = (rate: number) => {
    let colorClass = 'bg-rose-500';
    let textClass = 'text-rose-600 dark:text-rose-400';

    if (rate >= 100) {
      colorClass = 'bg-emerald-500';
      textClass = 'text-emerald-600 dark:text-emerald-400 font-bold';
    } else if (rate >= 75) {
      colorClass = 'bg-sky-500';
      textClass = 'text-sky-600 dark:text-sky-400 font-semibold';
    } else if (rate >= 50) {
      colorClass = 'bg-amber-500';
      textClass = 'text-amber-600 dark:text-amber-400';
    }

    return (
      <div className="flex items-center justify-end gap-2 w-full max-w-[140px] ml-auto">
        <div className="w-16 h-2 rounded-full bg-slate-100 dark:bg-navy-800 overflow-hidden">
          <div
            className={`h-full rounded-full ${colorClass}`}
            style={{ width: `${Math.min(rate, 100)}%` }}
          />
        </div>
        <span className={`text-[11px] font-mono min-w-[45px] text-right ${textClass}`}>
          {rate.toFixed(1)}%
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Year Picker Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-700/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>Analisis Tren Bulanan (MoM) Tahun {selectedYear}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluasi kinerja pendapatan faktur bulanan, penerimaan arus kas, dan rasio ketepatan penagihan.
            </p>
          </div>
        </div>

        {/* Year Navigator */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedYear((y) => y - 1)}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300 transition"
            title="Tahun Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-slate-800 dark:text-slate-100 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {[currentYear + 1, currentYear, currentYear - 1, currentYear - 2, currentYear - 3].map((y) => (
              <option key={y} value={y}>
                Tahun {y}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setSelectedYear((y) => y + 1)}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300 transition"
            title="Tahun Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Omzet Faktur */}
        <BentoCard padding="default" className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Omzet Faktur ({selectedYear})
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(trendData?.totalInvoicedAmount)}
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span>Peak:</span>
              <strong className="text-indigo-600 dark:text-indigo-400">
                {trendData?.peakInvoicedMonth || '-'} ({formatCurrency(trendData?.peakInvoicedAmount)})
              </strong>
            </div>
          </div>
        </BentoCard>

        {/* Card 2: Realisasi Kas Masuk */}
        <BentoCard padding="default" className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Realisasi Kas Masuk ({selectedYear})
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(trendData?.totalPaymentAmount)}
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span>Peak Kas:</span>
              <strong className="text-emerald-600 dark:text-emerald-400">
                {trendData?.peakPaymentMonth || '-'} ({formatCurrency(trendData?.peakPaymentAmount)})
              </strong>
            </div>
          </div>
        </BentoCard>

        {/* Card 3: Rata-rata Collection Rate */}
        <BentoCard padding="default" className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Rerata Collection Rate
            </span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-sky-600 dark:text-sky-400">
              {trendData?.averageCollectionRate !== undefined
                ? Number(trendData.averageCollectionRate).toFixed(1)
                : 0}%
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Rasio efektivitas penagihan piutang tahunan
            </div>
          </div>
        </BentoCard>

        {/* Card 4: Sisa Piutang Berjalan */}
        <BentoCard padding="default" className="relative overflow-hidden border-rose-200/60 dark:border-rose-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              Total Sisa Piutang ({selectedYear})
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
              {formatCurrency(trendData?.totalOutstandingAmount)}
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Faktur terbit {selectedYear} yang belum lunas
            </div>
          </div>
        </BentoCard>
      </div>

      {/* Visual Chart Bars: Monthly Comparison */}
      <BentoCard padding="default" className="overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-700/80 mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Grafik Komparasi Bulanan: Faktur (Omzet) vs Kas Masuk
            </h4>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-indigo-500" />
              <span className="text-slate-600 dark:text-slate-300">Faktur Terbit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-300">Kas Masuk</span>
            </div>
          </div>
        </div>

        {/* 12-Month Bars Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-2 pt-2">
          {months.map((m) => {
            const invoicedPercent = chartMax > 0 ? (m.invoicedAmount / chartMax) * 100 : 0;
            const paymentPercent = chartMax > 0 ? (m.paymentAmount / chartMax) * 100 : 0;

            return (
              <div
                key={m.month}
                className="flex flex-col items-center p-2.5 rounded-xl bg-slate-50/80 dark:bg-navy-950/40 border border-slate-100 dark:border-navy-800 text-center"
              >
                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2 truncate w-full">
                  {m.monthName.slice(0, 3)}
                </div>

                {/* Bars column container */}
                <div className="h-28 w-full flex items-end justify-center gap-1.5 pb-1">
                  {/* Invoiced Bar */}
                  <div className="w-3 bg-slate-200/60 dark:bg-navy-800 rounded-t-sm h-full flex items-end">
                    <div
                      className="w-full bg-indigo-500 rounded-t-sm transition-all duration-500"
                      style={{ height: `${Math.max(invoicedPercent, 4)}%` }}
                      title={`Faktur: ${formatCurrency(m.invoicedAmount)}`}
                    />
                  </div>
                  {/* Payment Bar */}
                  <div className="w-3 bg-slate-200/60 dark:bg-navy-800 rounded-t-sm h-full flex items-end">
                    <div
                      className="w-full bg-emerald-500 rounded-t-sm transition-all duration-500"
                      style={{ height: `${Math.max(paymentPercent, 4)}%` }}
                      title={`Kas: ${formatCurrency(m.paymentAmount)}`}
                    />
                  </div>
                </div>

                {/* Micro info */}
                <div className="mt-1 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  {m.collectionRate.toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
      </BentoCard>

      {/* 12-Month Table Matrix */}
      <BentoCard padding="none" className="overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-navy-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Matriks Distribusi 12 Bulan &amp; Pertumbuhan MoM ({selectedYear})
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Januari s/d Desember
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 dark:bg-navy-900/50 border-b border-slate-100 dark:border-navy-700/80 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Bulan</th>
                <th className="py-3 px-4 font-semibold text-right">SPH Diterbitkan</th>
                <th className="py-3 px-4 font-semibold text-right">Faktur Terbit (Omzet)</th>
                <th className="py-3 px-4 font-semibold text-center">MoM Growth</th>
                <th className="py-3 px-4 font-semibold text-right">Realisasi Kas Masuk</th>
                <th className="py-3 px-4 font-semibold text-right">Sisa Piutang</th>
                <th className="py-3 px-4 font-semibold text-right">Collection Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Memuat matriks tren bulanan...
                  </td>
                </tr>
              ) : months.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada transaksi tercatat untuk tahun {selectedYear}.
                  </td>
                </tr>
              ) : (
                months.map((row) => (
                  <tr
                    key={row.month}
                    className="hover:bg-slate-50/60 dark:hover:bg-navy-800/40 transition"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-100">
                      {row.monthName}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600 dark:text-slate-300 font-medium">
                      <div>{formatCurrency(row.sphAmount)}</div>
                      <div className="text-[10px] text-slate-400">{row.sphCount} SPH</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-900 dark:text-slate-100">
                      <div>{formatCurrency(row.invoicedAmount)}</div>
                      <div className="text-[10px] text-slate-400">{row.invoicedCount} Faktur</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {renderMomBadge(row.momRevenueGrowth)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      <div>{formatCurrency(row.paymentAmount)}</div>
                      <div className="text-[10px] text-slate-400">{row.paymentCount} Transaksi</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold">
                      <span
                        className={
                          row.outstandingAmount > 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-400'
                        }
                      >
                        {formatCurrency(row.outstandingAmount)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {renderCollectionRateBar(row.collectionRate)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Table Footer: Year Grand Total */}
            {trendData && (
              <tfoot className="bg-slate-50/90 dark:bg-navy-900/90 font-bold border-t-2 border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-100">
                <tr>
                  <td className="py-3.5 px-4">TOTAL TAHUNAN</td>
                  <td className="py-3.5 px-4 text-right">
                    {formatCurrency(trendData.totalSphAmount)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(trendData.totalInvoicedAmount)}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-400">-</td>
                  <td className="py-3.5 px-4 text-right text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(trendData.totalPaymentAmount)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-rose-600 dark:text-rose-400">
                    {formatCurrency(trendData.totalOutstandingAmount)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {Number(trendData.averageCollectionRate).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </BentoCard>
    </div>
  );
};

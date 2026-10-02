import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Receipt,
  CreditCard,
  Wallet,
  Users,
  Briefcase,
  FileText,
  AlertCircle,
  ArrowUpRight,
  Filter,
  RefreshCw,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import { getDashboardSummary, DashboardParams } from '@/api/dashboardApi';
import { customerApi } from '@/api/customerApi';
import { Customer } from '@/types/customer';
import { useAuth } from '@/context/AuthContext';
import { BentoCard } from '@/components/common/BentoCard';
import { PageHeader } from '@/components/common/PageHeader';

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

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const isOperator = user?.role === 'OPERATOR';

  // Filters state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [periodPreset, setPeriodPreset] = useState<'ALL' | 'THIS_MONTH' | 'THIS_YEAR'>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Handle preset change
  const handlePresetChange = (preset: 'ALL' | 'THIS_MONTH' | 'THIS_YEAR') => {
    setPeriodPreset(preset);
    const now = new Date();
    if (preset === 'THIS_MONTH') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(lastDay);
    } else if (preset === 'THIS_YEAR') {
      const firstDay = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(lastDay);
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  // Customers for filter dropdown
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['activeCustomers'],
    queryFn: () => customerApi.getActiveCustomers(),
  });

  // Query params
  const dashboardParams: DashboardParams = {
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
    ...(selectedCustomerId ? { customerId: Number(selectedCustomerId) } : {}),
  };

  const {
    data: summary,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['dashboardSummary', dashboardParams],
    queryFn: () => getDashboardSummary(dashboardParams),
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Page Header */}
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard Operasional & Keuangan"
        subtitle="Ringkasan performa bisnis, arus kas, faktur piutang, dan deposit customer real-time."
        actions={
          <div className="flex items-center gap-2.5">
            <Link
              to="/rekap"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200/80 dark:border-slate-700 transition shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              Rekap Laporan
            </Link>
            {isOperator && (
              <Link
                to="/pembayaran/create"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs font-bold transition shadow-md shadow-brand-500/25 active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                Catat Pembayaran
              </Link>
            )}
          </div>
        }
      />

      {/* Filter Bento Card */}
      <BentoCard className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-brand-500" />
              Periode:
            </span>
            <div className="inline-flex rounded-xl p-1 bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handlePresetChange('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  periodPreset === 'ALL'
                    ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('THIS_MONTH')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  periodPreset === 'THIS_MONTH'
                    ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Bulan Ini
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('THIS_YEAR')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  periodPreset === 'THIS_YEAR'
                    ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Tahun Ini
              </button>
            </div>

            {/* Customer Dropdown */}
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-3.5 py-1.5 focus:ring-2 focus:ring-brand-500 focus:outline-none transition"
            >
              <option value="">Semua Customer</option>
              {customers.map((c: Customer) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition border border-slate-200 dark:border-slate-700 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin text-brand-500' : ''}`} />
            Perbarui Data
          </button>
        </div>
      </BentoCard>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Omset Faktur */}
        <BentoCard hoverable className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Omset Faktur
            </span>
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-500/20">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(summary?.totalInvoiceAmount || 0)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>{summary?.totalInvoices || 0} faktur diterbitkan</span>
            </div>
          </div>
          <Link
            to="/faktur"
            className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            <span>Buka Faktur</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </BentoCard>

        {/* Realisasi Kas (Pembayaran) */}
        <BentoCard hoverable className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Realisasi Pembayaran
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatCurrency(summary?.totalPayments || 0)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>Dana masuk terkonfirmasi</span>
            </div>
          </div>
          <Link
            to="/pembayaran"
            className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span>Buka Pembayaran</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </BentoCard>

        {/* Sisa Piutang (Outstanding) */}
        <BentoCard hoverable className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Sisa Piutang
            </span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              (summary?.totalOutstanding || 0) > 0
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
            }`}>
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-black tracking-tight ${
              (summary?.totalOutstanding || 0) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'
            }`}>
              {formatCurrency(summary?.totalOutstanding || 0)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>{summary?.unpaidInvoiceCount || 0} faktur belum lunas</span>
            </div>
          </div>
          <Link
            to="/faktur"
            className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
          >
            <span>Tagih Piutang</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </BentoCard>

        {/* Saldo Deposit Customer */}
        <BentoCard hoverable className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Saldo Deposit Customer
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
              {formatCurrency(summary?.totalCustomerDeposit || 0)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>Saldo mengendap di kas</span>
            </div>
          </div>
          <Link
            to="/deposits"
            className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
          >
            <span>Buku Kas Deposit</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </BentoCard>
      </div>

      {/* Secondary Indicators Bento Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <BentoCard className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Penawaran Aktif</div>
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {formatCurrency(summary?.totalPenawaranAmount || 0)}
              </div>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {summary?.totalPenawaran || 0} dok
          </span>
        </BentoCard>

        <BentoCard className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Kegiatan Proyek Berjalan</div>
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {summary?.totalActiveKegiatan || 0} Kegiatan
              </div>
            </div>
          </div>
          <Link to="/kegiatan" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">
            Lihat
          </Link>
        </BentoCard>

        <BentoCard className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Mitra Customer Aktif</div>
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {summary?.totalActiveCustomers || 0} Mitra
              </div>
            </div>
          </div>
          <Link to="/customers" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            Kelola
          </Link>
        </BentoCard>
      </div>

      {/* Monthly Financial Trend Visualizer */}
      <BentoCard className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              Tren Finansial 6 Bulan Terakhir
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Perbandingan total omset faktur penjualan dengan realisasi kas yang diterima
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <span className="w-3 h-3 rounded-md bg-brand-500 inline-block" />
              Omset Ditagihkan
            </span>
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" />
              Kas Diterima
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {summary?.monthlyTrends?.map((item) => (
            <div
              key={item.month}
              className="p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 hover:bg-white/70 dark:hover:bg-slate-900/70 transition"
            >
              <div className="text-xs font-bold text-slate-700 dark:text-slate-200">{item.monthLabel}</div>
              <div className="mt-2 space-y-1">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Omset</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(item.invoiceAmount)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Kas</div>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(item.paymentAmount)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </BentoCard>

      {/* Two Column Layout: Recent Unpaid Invoices & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unpaid Invoices Alert List */}
        <BentoCard className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Faktur Perlu Pelunasan
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Daftar faktur dengan sisa piutang yang perlu ditindaklanjuti
              </p>
            </div>
            <Link to="/faktur" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
              Lihat Semua
            </Link>
          </div>

          <div className="divide-y divide-slate-200/60 dark:divide-slate-800">
            {summary?.recentUnpaidInvoices && summary.recentUnpaidInvoices.length > 0 ? (
              summary.recentUnpaidInvoices.map((inv) => (
                <div key={inv.id} className="py-3 flex items-center justify-between hover:bg-white/40 dark:hover:bg-slate-800/40 rounded-xl px-2 transition">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Link to={`/faktur/${inv.id}`} className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
                        {inv.number}
                      </Link>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        inv.paymentStatus === 'PARTIAL'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                      }`}>
                        {inv.paymentStatus === 'PARTIAL' ? 'Sebagian' : 'Belum Bayar'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{inv.customerName}</p>
                    <p className="text-[11px] text-slate-400">
                      Jatuh Tempo: {inv.dueDate ? formatDate(inv.dueDate) : '-'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-amber-600 dark:text-amber-400">
                      {formatCurrency(inv.outstanding)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Total: {formatCurrency(inv.totalAmount)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Semua faktur saat ini telah lunas tercatat.
              </div>
            )}
          </div>
        </BentoCard>

        {/* Recent Payments Feed */}
        <BentoCard className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Penerimaan Pembayaran Terbaru
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Riwayat transaksi kas dan transfer bank yang berhasil dibukukan
              </p>
            </div>
            <Link to="/pembayaran" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
              Lihat Semua
            </Link>
          </div>

          <div className="divide-y divide-slate-200/60 dark:divide-slate-800">
            {summary?.recentPayments && summary.recentPayments.length > 0 ? (
              summary.recentPayments.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between hover:bg-white/40 dark:hover:bg-slate-800/40 rounded-xl px-2 transition">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Link to={`/pembayaran/${p.id}`} className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
                        {p.number}
                      </Link>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {p.paymentMethod}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{p.customerName}</p>
                    <p className="text-[11px] text-slate-400">
                      Tanggal: {formatDate(p.date)} {p.destinationAccount ? `• ${p.destinationAccount}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(p.amount)}
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-medium">
                      {p.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Belum ada transaksi pembayaran yang tercatat.
              </div>
            )}
          </div>
        </BentoCard>
      </div>
    </div>
  );
};

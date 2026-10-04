import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Receipt,
  CreditCard,
  Wallet,
  Users,
  HardHat,
  FileText,
  ArrowUpRight,
  Filter,
  RefreshCw,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  ChevronRight
} from 'lucide-react';
import { getDashboardSummary, DashboardParams } from '@/api/dashboardApi';
import { customerApi } from '@/api/customerApi';
import { Customer } from '@/types/customer';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { TrendFinancialChart } from '@/components/dashboard/TrendFinancialChart';

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
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* 
        💎 Dashboard Header 
        Title, subtitle, soft glowing icon badge & prominent action buttons
      */}
      <PageHeader
        title="Ringkasan Operasional & Keuangan"
        subtitle="Pantauan performa penagihan, arus kas pembayaran, dan aktivitas bisnis CV. ANDARA secara real-time."
        icon={LayoutDashboard}
        actions={
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/rekap"
              className="glass-btn"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Rekap Laporan</span>
            </Link>

            {isOperator && (
              <Link
                to="/pembayaran/create"
                className="glass-btn-primary"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Catat Pembayaran</span>
              </Link>
            )}
          </div>
        }
      />

      {/* 
        💎 Floating Glass Filter Bar 
        Segmented control for period, customer selector, and compact refresh button
      */}
      <div className="glass-panel p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pl-1">
              <Filter className="w-3.5 h-3.5 text-blue-500" />
              Periode:
            </span>
            <div className="glass-segmented-track">
              <button
                type="button"
                onClick={() => handlePresetChange('ALL')}
                className={`glass-segmented-item ${
                  periodPreset === 'ALL' ? 'active' : ''
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('THIS_MONTH')}
                className={`glass-segmented-item ${
                  periodPreset === 'THIS_MONTH' ? 'active' : ''
                }`}
              >
                Bulan Ini
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('THIS_YEAR')}
                className={`glass-segmented-item ${
                  periodPreset === 'THIS_YEAR' ? 'active' : ''
                }`}
              >
                Tahun Ini
              </button>
            </div>

            {/* Customer Dropdown */}
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="glass-select text-xs font-semibold rounded-2xl min-w-[180px]"
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
            className="glass-btn text-xs py-2 px-3.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin text-blue-500' : ''}`} />
            <span>Perbarui Data</span>
          </button>
        </div>
      </div>

      {/* 
        💎 4 Semantic KPI Glass Cards 
        Omset (Blue), Pembayaran (Green), Piutang (Orange), Deposit (Purple)
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Total Omset Faktur (Blue) */}
        <div className="glass-card-omset rounded-3xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-xs">
                  <Receipt className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Total Omset Faktur
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-400/50 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
            </div>

            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {formatCurrency(summary?.totalInvoiceAmount || 0)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {summary?.totalInvoices || 0} faktur diterbitkan
              </div>
            </div>
          </div>

          <Link
            to="/faktur"
            className="mt-5 pt-3.5 border-t border-blue-200/60 dark:border-blue-500/20 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition"
          >
            <span>Buka Faktur</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 2. Realisasi Pembayaran (Green) */}
        <div className="glass-card-payment rounded-3xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-xs">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Realisasi Pembayaran
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-400/50 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
            </div>

            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {formatCurrency(summary?.totalPayments || 0)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Dana masuk terkonfirmasi
              </div>
            </div>
          </div>

          <Link
            to="/pembayaran"
            className="mt-5 pt-3.5 border-t border-emerald-200/60 dark:border-emerald-500/20 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition"
          >
            <span>Buka Pembayaran</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3. Sisa Piutang (Orange) */}
        <div className="glass-card-piutang rounded-3xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Sisa Piutang
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400/50 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
            </div>

            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                {formatCurrency(summary?.totalOutstanding || 0)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {summary?.unpaidInvoiceCount || 0} faktur belum lunas
              </div>
            </div>
          </div>

          <Link
            to="/faktur"
            className="mt-5 pt-3.5 border-t border-amber-200/60 dark:border-amber-500/20 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition"
          >
            <span>Tagih Piutang</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4. Saldo Deposit Customer (Purple) */}
        <div className="glass-card-deposit rounded-3xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 shadow-xs">
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Saldo Deposit Customer
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-400/50 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
            </div>

            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
                {formatCurrency(summary?.totalCustomerDeposit || 0)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Saldo mengendap di kas
              </div>
            </div>
          </div>

          <Link
            to="/deposits"
            className="mt-5 pt-3.5 border-t border-purple-200/60 dark:border-purple-500/20 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 transition"
          >
            <span>Buku Kas Deposit</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 
        💎 3 Supporting Summary Cards 
        Penawaran Aktif, Kegiatan Proyek Berjalan, Mitra Customer Aktif
      */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel p-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Total Penawaran Aktif</div>
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {formatCurrency(summary?.totalPenawaranAmount || 0)}
              </div>
            </div>
          </div>
          <span className="glass-pill text-[10px] font-black uppercase text-blue-700 dark:text-blue-300">
            {summary?.totalPenawaran || 0} DOK
          </span>
        </div>

        <div className="glass-panel p-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Kegiatan Proyek Berjalan</div>
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {summary?.totalActiveKegiatan || 0} Kegiatan
              </div>
            </div>
          </div>
          <Link to="/kegiatan" className="glass-btn text-xs py-1.5 px-3">
            Lihat
          </Link>
        </div>

        <div className="glass-panel p-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Mitra Customer Aktif</div>
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {summary?.totalActiveCustomers || 0} Mitra
              </div>
            </div>
          </div>
          <Link to="/customers" className="glass-btn text-xs py-1.5 px-3">
            Kelola
          </Link>
        </div>
      </div>

      {/* 
        💎 Chart Container: Tren Finansial 6 Bulan Terakhir
        Professional smooth Bezier area chart with interactive tooltips
      */}
      <div className="glass-panel p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/50 dark:border-slate-800/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Tren Finansial 6 Bulan Terakhir
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Perbandingan total omset faktur penjualan dengan realisasi kas yang diterima
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] inline-block" />
              Omset Ditagihkan
            </span>
            <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] inline-block" />
              Kas Diterima
            </span>
            <span className="glass-pill text-[11px] font-bold text-slate-600 dark:text-slate-300 hidden md:inline-flex">
              6 Bulan Terakhir
            </span>
          </div>
        </div>

        {/* SVG Fluid Trend Wave Chart */}
        <div className="pt-2">
          <TrendFinancialChart
            data={summary?.monthlyTrends}
            formatCurrency={formatCurrency}
          />
        </div>

        {/* Monthly Quick Scanning Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {summary?.monthlyTrends?.map((item) => (
            <div
              key={item.month}
              className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 hover:border-blue-400/40 transition-all"
            >
              <div className="text-xs font-black text-slate-800 dark:text-slate-200">{item.monthLabel}</div>
              <div className="mt-2 space-y-1">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Omset</div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">
                    {formatCurrency(item.invoiceAmount)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Kas</div>
                  <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(item.paymentAmount)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 
        💎 Two Column Layout: Recent Unpaid Invoices & Recent Payments
        Updated with Glass Panel and Colorful Status Badges
      */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unpaid Invoices Alert List */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/60 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  Faktur Perlu Pelunasan
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Daftar faktur dengan sisa piutang yang perlu ditindaklanjuti
                </p>
              </div>
            </div>
            <Link to="/faktur" className="glass-btn text-xs py-1 px-3">
              Lihat Semua
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {summary?.recentUnpaidInvoices && summary.recentUnpaidInvoices.length > 0 ? (
              summary.recentUnpaidInvoices.map((inv) => (
                <div key={inv.id} className="py-3 flex items-center justify-between hover:bg-white/40 dark:hover:bg-slate-800/40 rounded-2xl px-2.5 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link to={`/faktur/${inv.id}`} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                        {inv.number}
                      </Link>
                      <StatusBadge status={inv.paymentStatus} size="sm" />
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-bold">{inv.customerName}</p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Jatuh Tempo: {inv.dueDate ? formatDate(inv.dueDate) : '-'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400">
                      {formatCurrency(inv.outstanding)}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
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
        </div>

        {/* Recent Payments Feed */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/60 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  Penerimaan Pembayaran Terbaru
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Riwayat transaksi kas dan transfer bank yang berhasil dibukukan
                </p>
              </div>
            </div>
            <Link to="/pembayaran" className="glass-btn text-xs py-1 px-3">
              Lihat Semua
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {summary?.recentPayments && summary.recentPayments.length > 0 ? (
              summary.recentPayments.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between hover:bg-white/40 dark:hover:bg-slate-800/40 rounded-2xl px-2.5 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link to={`/pembayaran/${p.id}`} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                        {p.number}
                      </Link>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        {p.paymentMethod}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-bold">{p.customerName}</p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Tanggal: {formatDate(p.date)} {p.destinationAccount ? `• ${p.destinationAccount}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(p.amount)}
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
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
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

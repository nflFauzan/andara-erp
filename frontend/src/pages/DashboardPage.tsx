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
  Clock
} from 'lucide-react';
import { getDashboardSummary, DashboardParams } from '@/api/dashboardApi';
import { customerApi } from '@/api/customerApi';
import { Customer } from '@/types/customer';
import { useAuth } from '@/context/AuthContext';

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
      {/* Top Banner & Quick Filter */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Sistem Operasional Aktif • Live Aggregate
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Dashboard Keuangan & Operasional
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Ringkasan KPI real-time CV. ANDARA. Seluruh angka dihitung langsung dari basis data transaksi,
              alokasi kas, dan ledger deposit customer.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/rekap"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition backdrop-blur-sm border border-white/10 shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Rekap Laporan
            </Link>
            {isOperator && (
              <Link
                to="/pembayaran/create"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition shadow-md shadow-brand-500/30"
              >
                <PlusCircle className="w-4 h-4" />
                Catat Pembayaran
              </Link>
            )}
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              Filter Periode:
            </span>
            <div className="inline-flex rounded-lg p-0.5 bg-slate-800/80 border border-slate-700">
              <button
                type="button"
                onClick={() => handlePresetChange('ALL')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  periodPreset === 'ALL'
                    ? 'bg-brand-500 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('THIS_MONTH')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  periodPreset === 'THIS_MONTH'
                    ? 'bg-brand-500 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Bulan Ini
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('THIS_YEAR')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  periodPreset === 'THIS_YEAR'
                    ? 'bg-brand-500 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Tahun Ini
              </button>
            </div>

            {/* Customer Dropdown */}
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-brand-500 focus:outline-none"
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin text-brand-400' : ''}`} />
            Perbarui
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Omset Faktur */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Omset Faktur
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(summary?.totalInvoiceAmount || 0)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <span>{summary?.totalInvoices || 0} faktur diterbitkan</span>
            </div>
          </div>
          <Link
            to="/faktur"
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>Buka Faktur</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Realisasi Kas (Pembayaran) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Realisasi Pembayaran
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600 tracking-tight">
              {formatCurrency(summary?.totalPayments || 0)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <span>Dana masuk terkonfirmasi</span>
            </div>
          </div>
          <Link
            to="/pembayaran"
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            <span>Buka Pembayaran</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Sisa Piutang (Outstanding) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Sisa Piutang
            </span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              (summary?.totalOutstanding || 0) > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'
            }`}>
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-black tracking-tight ${
              (summary?.totalOutstanding || 0) > 0 ? 'text-amber-600' : 'text-slate-900'
            }`}>
              {formatCurrency(summary?.totalOutstanding || 0)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <span>{summary?.unpaidInvoiceCount || 0} faktur belum lunas</span>
            </div>
          </div>
          <Link
            to="/faktur"
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-600 hover:text-amber-700"
          >
            <span>Tagih Piutang</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Saldo Deposit Customer */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Saldo Deposit Customer
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-purple-600 tracking-tight">
              {formatCurrency(summary?.totalCustomerDeposit || 0)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <span>Saldo mengendap di ledger</span>
            </div>
          </div>
          <Link
            to="/deposits"
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-600 hover:text-purple-700"
          >
            <span>Buku Kas Deposit</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Secondary Indicators (Quotation & Active Counts) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Total Penawaran Aktif</div>
              <div className="text-base font-bold text-slate-900">
                {formatCurrency(summary?.totalPenawaranAmount || 0)}
              </div>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {summary?.totalPenawaran || 0} dok
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Kegiatan Proyek Berjalan</div>
              <div className="text-base font-bold text-slate-900">
                {summary?.totalActiveKegiatan || 0} Kegiatan
              </div>
            </div>
          </div>
          <Link to="/kegiatan" className="text-xs font-semibold text-teal-600 hover:underline">
            Lihat
          </Link>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Mitra Customer Aktif</div>
              <div className="text-base font-bold text-slate-900">
                {summary?.totalActiveCustomers || 0} Mitra
              </div>
            </div>
          </div>
          <Link to="/customers" className="text-xs font-semibold text-indigo-600 hover:underline">
            Kelola
          </Link>
        </div>
      </div>

      {/* Monthly Financial Trend Visualizer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-600" />
              Tren Finansial 6 Bulan Terakhir
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Perbandingan total omset faktur penjualan dengan realisasi kas yang diterima
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-brand-500 inline-block" />
              Omset Ditagihkan
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
              Kas Diterima
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {summary?.monthlyTrends?.map((item) => (
            <div
              key={item.month}
              className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition"
            >
              <div className="text-xs font-semibold text-slate-700">{item.monthLabel}</div>
              <div className="mt-2 space-y-1">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Omset</div>
                  <div className="text-xs font-bold text-slate-900">
                    {formatCurrency(item.invoiceAmount)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Kas</div>
                  <div className="text-xs font-bold text-emerald-600">
                    {formatCurrency(item.paymentAmount)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Recent Unpaid Invoices & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unpaid Invoices Alert List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Faktur Perlu Pelunasan
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar faktur dengan sisa piutang yang perlu ditindaklanjuti
              </p>
            </div>
            <Link to="/faktur" className="text-xs font-semibold text-brand-600 hover:underline">
              Lihat Semua
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {summary?.recentUnpaidInvoices && summary.recentUnpaidInvoices.length > 0 ? (
              summary.recentUnpaidInvoices.map((inv) => (
                <div key={inv.id} className="py-3 flex items-center justify-between hover:bg-slate-50/50 rounded-lg px-2 transition">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Link to={`/faktur/${inv.id}`} className="text-xs font-bold text-brand-600 hover:underline">
                        {inv.number}
                      </Link>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        inv.paymentStatus === 'PARTIAL'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {inv.paymentStatus === 'PARTIAL' ? 'Sebagian' : 'Belum Bayar'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{inv.customerName}</p>
                    <p className="text-[11px] text-slate-400">
                      Jatuh Tempo: {inv.dueDate ? formatDate(inv.dueDate) : '-'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-amber-600">
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
        </div>

        {/* Recent Payments Feed */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Penerimaan Pembayaran Terbaru
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Riwayat transaksi kas dan transfer bank yang berhasil dibukukan
              </p>
            </div>
            <Link to="/pembayaran" className="text-xs font-semibold text-brand-600 hover:underline">
              Lihat Semua
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {summary?.recentPayments && summary.recentPayments.length > 0 ? (
              summary.recentPayments.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between hover:bg-slate-50/50 rounded-lg px-2 transition">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Link to={`/pembayaran/${p.id}`} className="text-xs font-bold text-brand-600 hover:underline">
                        {p.number}
                      </Link>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        {p.paymentMethod}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{p.customerName}</p>
                    <p className="text-[11px] text-slate-400">
                      Tanggal: {formatDate(p.date)} {p.destinationAccount ? `• ${p.destinationAccount}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-emerald-600">
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
        </div>
      </div>
    </div>
  );
};

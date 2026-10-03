import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Eye,
  Wallet,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { paymentApi } from '../api/paymentApi';
import { customerApi } from '../api/customerApi';
import { Payment, PaymentStatus, PaymentMethod } from '../types/payment';
import { Customer } from '../types/customer';
import { useAuth } from '../context/AuthContext';
import { BentoCard } from '@/components/common/BentoCard';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';

const METHOD_LABELS: Record<PaymentMethod, string> = {
  BANK_TRANSFER: 'Transfer Bank',
  CASH: 'Tunai',
  GIRO: 'Giro',
  OTHER: 'Lainnya',
};

export const PaymentListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOperator = user?.role === 'OPERATOR';

  const [paymentList, setPaymentList] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus | undefined>();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | undefined>();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Aggregate statistics for cards
  const [totalPaymentAmount, setTotalPaymentAmount] = useState(0);
  const [totalAllocatedAmount, setTotalAllocatedAmount] = useState(0);
  const [totalExcessAmount, setTotalExcessAmount] = useState(0);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    loadPayments();
  }, [search, selectedCustomer, selectedStatus, selectedMethod, startDate, endDate, currentPage]);

  const loadCustomers = async () => {
    try {
      const data = await customerApi.getActiveCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Gagal memuat customer:', err);
    }
  };

  const loadPayments = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await paymentApi.getPaymentList({
        search: search.trim() || undefined,
        customerId: selectedCustomer,
        status: selectedStatus,
        paymentMethod: selectedMethod,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: currentPage,
        size: pageSize,
        sortBy: 'date',
        sortDir: 'desc',
      });

      setPaymentList(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);

      // Compute aggregates on current view
      const sumAmount = res.content.reduce((acc, p) => p.status === 'CONFIRMED' ? acc + Number(p.amount) : acc, 0);
      const sumAllocated = res.content.reduce((acc, p) => p.status === 'CONFIRMED' ? acc + Number(p.allocatedAmount) : acc, 0);
      const sumExcess = res.content.reduce((acc, p) => p.status === 'CONFIRMED' ? acc + Number(p.excessAmount) : acc, 0);

      setTotalPaymentAmount(sumAmount);
      setTotalAllocatedAmount(sumAllocated);
      setTotalExcessAmount(sumExcess);
    } catch (err: any) {
      console.error('Gagal memuat pembayaran:', err);
      setErrorMsg(err.response?.data?.message || 'Gagal memuat daftar pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number | undefined) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <PageHeader
        icon={CreditCard}
        title="Pembayaran & Alokasi Pelunasan"
        subtitle="Pencatatan bukti penerimaan uang, alokasi settlement faktur, dan manajemen deposit pelanggan."
        badge={
          <span className="text-[11px] bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold px-2.5 py-0.5 rounded-full border border-brand-500/20">
            Kas & Settlement
          </span>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/deposits')}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Wallet className="w-4 h-4 text-amber-500" />
              Deposit Customer
            </button>

            {isOperator ? (
              <button
                onClick={() => navigate('/pembayaran/create')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/25 transition"
              >
                <Plus className="w-4 h-4" />
                Catat Pembayaran Baru
              </button>
            ) : (
              <div className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5" title="Hanya Operator yang berhak mencatat mutasi pembayaran">
                <ShieldAlert className="w-4 h-4 text-slate-400" />
                Mode Read-Only (Admin)
              </div>
            )}
          </div>
        }
      />

      {/* Admin Notice Banner if logged in as Admin */}
      {!isOperator && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
            <span className="font-bold">Catatan Akses Admin:</span> Sesuai regulasi sistem CV. ANDARA & dokumen tata kelola (AGENTS.md §11), hak akses Admin dibatasi untuk membaca rekap/faktur. Pencatatan pembayaran, pembatalan, dan alokasi saldo deposit dilindungi ketat dan hanya dapat dijalankan oleh <span className="font-bold underline">Operator</span>.
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BentoCard className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Pembayaran
            </span>
            <div className="mt-2 text-2xl font-black font-mono text-slate-900 dark:text-white">
              {formatCurrency(totalPaymentAmount)}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">Akumulasi penerimaan pembayaran aktif di halaman ini</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/20">
            <CreditCard className="w-6 h-6" />
          </div>
        </BentoCard>

        <BentoCard className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Teralokasi ke Faktur
            </span>
            <div className="mt-2 text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalAllocatedAmount)}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">Settlement langsung terhadap tagihan faktur</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </BentoCard>

        <BentoCard className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Masuk Deposit Customer
            </span>
            <div className="mt-2 text-2xl font-black font-mono text-amber-500">
              {formatCurrency(totalExcessAmount)}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">Kelebihan bayar otomatis masuk ledger deposit</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Wallet className="w-6 h-6" />
          </div>
        </BentoCard>
      </div>

      {/* Filter Bar */}
      {/* Filter Bar with Defined 1.5px Outlines */}
      <BentoCard className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-brand-500" />
          Filter & Pencarian Pembayaran
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari no. pembayaran, referensi, catatan..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-white/95 dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-xl border-[1.5px] border-blue-200/90 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-xs transition"
            />
          </div>

          {/* Customer */}
          <div>
            <select
              value={selectedCustomer || ''}
              onChange={(e) => {
                setSelectedCustomer(e.target.value ? Number(e.target.value) : undefined);
                setCurrentPage(0);
              }}
              className="w-full px-3 py-2 text-xs font-semibold bg-white/95 dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-xl border-[1.5px] border-blue-200/90 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-xs transition truncate"
            >
              <option value="">Semua Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <select
              value={selectedMethod || ''}
              onChange={(e) => {
                setSelectedMethod(e.target.value ? (e.target.value as PaymentMethod) : undefined);
                setCurrentPage(0);
              }}
              className="w-full px-3 py-2 text-xs font-semibold bg-white/95 dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-xl border-[1.5px] border-blue-200/90 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-xs transition"
            >
              <option value="">Semua Metode</option>
              <option value="BANK_TRANSFER">Transfer Bank</option>
              <option value="CASH">Tunai</option>
              <option value="GIRO">Giro</option>
              <option value="OTHER">Lainnya</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={selectedStatus || ''}
              onChange={(e) => {
                setSelectedStatus(e.target.value ? (e.target.value as PaymentStatus) : undefined);
                setCurrentPage(0);
              }}
              className="w-full px-3 py-2 text-xs font-semibold bg-white/95 dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-xl border-[1.5px] border-blue-200/90 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-xs transition"
            >
              <option value="">Semua Status</option>
              <option value="CONFIRMED">Dikonfirmasi</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-center">
            <button
              onClick={() => {
                setSearch('');
                setSelectedCustomer(undefined);
                setSelectedStatus(undefined);
                setSelectedMethod(undefined);
                setStartDate('');
                setEndDate('');
                setCurrentPage(0);
              }}
              className="w-full px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white/95 dark:bg-slate-900 hover:bg-blue-50/60 dark:hover:bg-slate-800 border-[1.5px] border-blue-200/90 dark:border-slate-700 rounded-xl transition shadow-xs"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </BentoCard>

      {/* Main Table */}
      <BentoCard className="overflow-hidden p-0">
        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border-b border-rose-500/20 text-rose-800 dark:text-rose-300 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50/90 dark:bg-slate-900/90 border-b-[1.5px] border-blue-100 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4">No. Pembayaran</th>
                <th className="px-4 py-4">Tanggal</th>
                <th className="px-4 py-4">Customer</th>
                <th className="px-4 py-4">Metode & Rekening</th>
                <th className="px-4 py-4 text-right">Jumlah Bayar</th>
                <th className="px-4 py-4 text-right">Teralokasi</th>
                <th className="px-4 py-4 text-right">Kelebihan / Deposit</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-5 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                      <span className="text-xs font-semibold">Memuat data pembayaran...</span>
                    </div>
                  </td>
                </tr>
              ) : paymentList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-400">
                    <CreditCard className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    Belum ada data pembayaran yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                paymentList.map((payment) => {
                  return (
                    <tr key={payment.id} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/40 transition group">
                      <td className="px-5 py-4">
                        <span className="font-bold text-brand-600 dark:text-brand-400 font-mono">
                          {payment.number}
                        </span>
                        {payment.reference && (
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            Ref: {payment.reference}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {payment.date}
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{payment.customerName}</div>
                        <div className="text-xs text-slate-400 font-mono">{payment.customerCode}</div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                          {METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod}
                        </div>
                        {payment.destinationAccount && (
                          <div className="text-[11px] text-slate-400 line-clamp-1">
                            {payment.destinationAccount}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4 text-right font-bold text-slate-900 dark:text-white font-mono">
                        {formatCurrency(payment.amount)}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          {formatCurrency(payment.allocatedAmount)}
                        </span>
                        <div className="text-[11px] text-slate-400">
                          {payment.allocations?.length || 0} faktur
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right">
                        {Number(payment.excessAmount) > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            +{formatCurrency(payment.excessAmount)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <StatusBadge status={payment.status} />
                      </td>

                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/pembayaran/${payment.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50/80 dark:bg-slate-800 dark:hover:bg-slate-700 border-[1.5px] border-blue-200 dark:border-slate-700 text-blue-600 dark:text-slate-200 rounded-xl text-xs font-bold shadow-xs transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-brand-500" />
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-5 py-4 bg-white/40 dark:bg-slate-900/40 border-t-[1.5px] border-blue-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Menampilkan {paymentList.length} dari {totalElements} data
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1.5 text-xs font-semibold bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-40 hover:bg-white dark:hover:bg-slate-800 transition"
              >
                Sebelumnya
              </button>
              <span className="text-xs font-medium px-2">
                Halaman {currentPage + 1} dari {totalPages}
              </span>
              <button
                disabled={currentPage + 1 >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1.5 text-xs font-semibold bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-40 hover:bg-white dark:hover:bg-slate-800 transition"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </BentoCard>
    </div>
  );
};

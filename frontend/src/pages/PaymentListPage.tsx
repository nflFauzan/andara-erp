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
  ShieldAlert,
  Info
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
  DEPOSIT: 'Saldo Deposit',
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
        subtitle="Pencatatan bukti penerimaan uang kas/bank dari pelanggan, alokasi settlement faktur, dan manajemen deposit."
        badge={
          <span className="neu-badge">
            <CreditCard className="w-3.5 h-3.5" />
            Kas & Settlement
          </span>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/deposits')}
              className="neu-btn text-amber-700 dark:text-amber-300"
            >
              <Wallet className="w-4 h-4 text-amber-500" />
              <span>Deposit Customer</span>
            </button>

            {isOperator ? (
              <button
                onClick={() => navigate('/pembayaran/create')}
                className="neu-btn-primary"
              >
                <Plus className="w-4 h-4" />
                <span>Catat Pembayaran Baru</span>
              </button>
            ) : (
              <div className="neu-badge text-slate-500" title="Hanya Operator yang berhak mencatat mutasi pembayaran">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                <span>Mode Read-Only (Admin)</span>
              </div>
            )}
          </div>
        }
      />

      {/* 💡 Panduan Cepat untuk Orang Awam */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3 shadow-neu-convex-xs">
        <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-black text-emerald-950 dark:text-emerald-200">
            Alur Pembayaran & Deposit Pelanggan
          </p>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            Menu ini mencatat uang fisik atau transfer bank yang diterima dari pelanggan. Dana yang masuk langsung dialokasikan untuk melunasi tagihan faktur. 
            Jika pelanggan mentransfer lebih dari nilai tagihan, uang lebih tersebut otomatis aman tersimpan sebagai <strong className="text-emerald-700 dark:text-emerald-300">Deposit Customer</strong> untuk digunakan melunasi faktur di masa depan.
          </p>
        </div>
      </div>

      {/* Admin Notice Banner if logged in as Admin */}
      {!isOperator && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 shadow-neu-convex-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-300 leading-relaxed font-medium">
            <span className="font-black">Catatan Akses Admin:</span> Sesuai regulasi sistem CV. ANDARA & dokumen tata kelola (AGENTS.md §11), hak akses Admin dibatasi untuk membaca rekap/faktur. Pencatatan pembayaran, pembatalan, dan alokasi saldo deposit dilindungi ketat dan hanya dapat dijalankan oleh <span className="font-black underline">Operator</span>.
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BentoCard className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Pembayaran Masuk
            </span>
            <div className="mt-2 text-2xl font-black font-mono text-slate-900 dark:text-white">
              {formatCurrency(totalPaymentAmount)}
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Akumulasi uang kas/transfer aktif (halaman ini)</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-neu-canvas shadow-neu-inset-xs text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-neu-border/60">
            <CreditCard className="w-6 h-6" />
          </div>
        </BentoCard>

        <BentoCard className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Teralokasi ke Faktur
            </span>
            <div className="mt-2 text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalAllocatedAmount)}
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Dana yang sudah memotong tagihan piutang</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-neu-canvas shadow-neu-inset-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-neu-border/60">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </BentoCard>

        <BentoCard className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Masuk Deposit Customer
            </span>
            <div className="mt-2 text-2xl font-black font-mono text-purple-600 dark:text-purple-400">
              {formatCurrency(totalExcessAmount)}
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Kelebihan transfer tersimpan untuk faktur nanti</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-neu-canvas shadow-neu-inset-xs text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-neu-border/60">
            <Wallet className="w-6 h-6" />
          </div>
        </BentoCard>
      </div>

      {/* Filter Bar with Neumorphic Inset Wells */}
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
              className="neu-input w-full pl-9 pr-3 py-2 text-xs font-semibold"
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
              className="neu-input w-full px-3 py-2 text-xs font-bold truncate cursor-pointer"
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
              className="neu-input w-full px-3 py-2 text-xs font-bold cursor-pointer"
            >
              <option value="">Semua Metode</option>
              <option value="BANK_TRANSFER">Transfer Bank</option>
              <option value="CASH">Tunai</option>
              <option value="GIRO">Giro</option>
              <option value="DEPOSIT">Saldo Deposit</option>
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
              className="neu-input w-full px-3 py-2 text-xs font-bold cursor-pointer"
            >
              <option value="">Semua Status</option>
              <option value="CONFIRMED">Dikonfirmasi (Sah)</option>
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
              className="neu-btn w-full text-xs"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </BentoCard>

      {/* Main Table */}
      <BentoCard className="overflow-hidden p-0">
        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border-b border-rose-500/20 text-rose-800 dark:text-rose-300 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-neu-canvas border-b border-neu-border/60 text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4">No. Pembayaran</th>
                <th className="px-4 py-4">Tanggal Masuk</th>
                <th className="px-4 py-4">Pelanggan</th>
                <th className="px-4 py-4">Metode Bayar</th>
                <th className="px-4 py-4 text-right">Uang Diterima</th>
                <th className="px-4 py-4 text-right">Teralokasi</th>
                <th className="px-4 py-4 text-right">Masuk Deposit</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-5 py-4 text-center">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neu-border/40">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                      <span className="text-xs font-bold">Memuat data pembayaran...</span>
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
                    <tr key={payment.id} className="hover:bg-neu-canvas/50 transition group">
                      <td className="px-5 py-4">
                        <span className="font-black text-brand-600 dark:text-brand-400 font-mono text-xs">
                          {payment.number}
                        </span>
                        {payment.reference && (
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            Ref: {payment.reference}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300 font-semibold">
                        {payment.date}
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-black text-slate-900 dark:text-slate-100 text-xs">{payment.customerName}</div>
                        <div className="text-xs text-slate-400 font-mono font-bold">{payment.customerCode}</div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                          {payment.cashAmount && payment.depositAmount && payment.cashAmount > 0 && payment.depositAmount > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-black bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/25">
                              ⚡ Kas + Deposit
                            </span>
                          ) : payment.paymentMethod === 'DEPOSIT' || (payment.depositAmount && payment.depositAmount > 0 && (!payment.cashAmount || payment.cashAmount === 0)) ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-black bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/25">
                              🪙 Saldo Deposit
                            </span>
                          ) : (
                            METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod
                          )}
                        </div>
                        {payment.cashAmount && payment.depositAmount && payment.cashAmount > 0 && payment.depositAmount > 0 ? (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Kas: {formatCurrency(payment.cashAmount)} • Dep: {formatCurrency(payment.depositAmount)}
                          </div>
                        ) : payment.destinationAccount ? (
                          <div className="text-[11px] text-slate-400 line-clamp-1">
                            {payment.destinationAccount}
                          </div>
                        ) : null}
                      </td>

                      <td className="px-4 py-4 text-right font-black text-slate-900 dark:text-white font-mono">
                        {formatCurrency(payment.amount)}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono">
                          {formatCurrency(payment.allocatedAmount)}
                        </span>
                        <div className="text-[10.5px] text-slate-400 font-medium">
                          {payment.allocations?.length || 0} faktur terpotong
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right">
                        {Number(payment.excessAmount) > 0 ? (
                          <span className="neu-badge text-purple-700 dark:text-purple-400 bg-purple-500/10 border-purple-500/30">
                            +{formatCurrency(payment.excessAmount)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <StatusBadge status={payment.status} size="sm" />
                      </td>

                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/pembayaran/${payment.id}`)}
                          className="neu-btn text-xs py-1.5 px-3 cursor-pointer"
                          title="Buka rincian pembayaran & alokasi"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Rincian</span>
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
          <div className="px-5 py-4 border-t border-neu-border/60 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 bg-neu-surface">
            <span>
              Menampilkan {paymentList.length} dari {totalElements} data
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="neu-btn px-3 py-1.5 disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <span className="text-xs font-bold px-2">
                Halaman {currentPage + 1} dari {totalPages}
              </span>
              <button
                disabled={currentPage + 1 >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="neu-btn px-3 py-1.5 disabled:opacity-40"
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

export default PaymentListPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Ban,
  Wallet,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { paymentApi } from '../api/paymentApi';
import { customerApi } from '../api/customerApi';
import { Payment, PaymentStatus, PaymentMethod } from '../types/payment';
import { Customer } from '../types/customer';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG: Record<PaymentStatus, { label: string; bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  CONFIRMED: {
    label: 'Dikonfirmasi',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    text: 'text-emerald-600',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Dibatalkan',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    text: 'text-rose-600',
    icon: Ban,
  },
};

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

      // Compute aggregates on current view or elements
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-indigo-600" />
            Pembayaran & Alokasi Pelunasan
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Pencatatan bukti penerimaan uang, alokasi settlement faktur, dan manajemen deposit customer
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/deposits')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-sm font-medium transition shadow-sm"
          >
            <Wallet className="w-4 h-4 text-amber-600" />
            Deposit Customer
          </button>

          {isOperator ? (
            <button
              onClick={() => navigate('/pembayaran/create')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition shadow-sm hover:shadow"
            >
              <Plus className="w-4 h-4" />
              Catat Pembayaran Baru
            </button>
          ) : (
            <div className="px-3.5 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium border border-slate-200 flex items-center gap-1.5" title="Hanya Operator yang berhak mencatat mutasi pembayaran">
              <ShieldAlert className="w-4 h-4 text-slate-500" />
              Mode Read-Only (Admin)
            </div>
          )}
        </div>
      </div>

      {/* Admin Notice Banner if logged in as Admin */}
      {!isOperator && (
        <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">Catatan Akses Admin:</span> Sesuai regulasi sistem CV. ANDARA & dokumen tata kelola (AGENTS.md §11), hak akses Admin dibatasi untuk membaca rekap/faktur. Pencatatan pembayaran, pembatalan, dan alokasi saldo deposit dilindungi ketat dan hanya dapat dijalankan oleh <span className="font-semibold">Operator</span>.
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pembayaran Diterima</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">
            {formatCurrency(totalPaymentAmount)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Akumulasi penerimaan pembayaran aktif di halaman ini</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Teralokasi ke Faktur</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-emerald-600">
            {formatCurrency(totalAllocatedAmount)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Settlement langsung terhadap tagihan faktur</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Masuk Deposit Customer</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-amber-600">
            {formatCurrency(totalExcessAmount)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Kelebihan bayar otomatis masuk ledger deposit</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-indigo-500" />
          Filter & Pencarian
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
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
              className="w-full px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {errorMsg && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-700 text-sm">
            {errorMsg}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
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
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      Memuat data pembayaran...
                    </div>
                  </td>
                </tr>
              ) : paymentList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-400">
                    <CreditCard className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    Belum ada data pembayaran yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                paymentList.map((payment) => {
                  const statusCfg = STATUS_CONFIG[payment.status] || STATUS_CONFIG.CONFIRMED;
                  const StatusIcon = statusCfg.icon;

                  return (
                    <tr key={payment.id} className="hover:bg-slate-50/60 transition group">
                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                          {payment.number}
                        </span>
                        {payment.reference && (
                          <div className="text-xs text-slate-400 font-mono mt-0.5">
                            Ref: {payment.reference}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-slate-700">
                        {payment.date}
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">{payment.customerName}</div>
                        <div className="text-xs text-slate-400">{payment.customerCode}</div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-800">
                          {METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod}
                        </div>
                        {payment.destinationAccount && (
                          <div className="text-xs text-slate-400 line-clamp-1">
                            {payment.destinationAccount}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4 text-right font-semibold text-slate-900">
                        {formatCurrency(payment.amount)}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <span className="font-medium text-emerald-600">
                          {formatCurrency(payment.allocatedAmount)}
                        </span>
                        <div className="text-xs text-slate-400">
                          {payment.allocations?.length || 0} faktur
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right">
                        {Number(payment.excessAmount) > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            +{formatCurrency(payment.excessAmount)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusCfg.bg}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusCfg.label}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/pembayaran/${payment.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-lg text-xs font-medium transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
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
          <div className="px-5 py-4 bg-slate-50/60 border-t border-slate-200/80 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Menampilkan {paymentList.length} dari {totalElements} data
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 transition"
              >
                Sebelumnya
              </button>
              <span className="text-xs text-slate-600 px-2">
                Halaman {currentPage + 1} dari {totalPages}
              </span>
              <button
                disabled={currentPage + 1 >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 transition"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

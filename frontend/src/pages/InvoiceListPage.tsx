import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Ban,
  FileCheck2,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { invoiceApi } from '../api/invoiceApi';
import { customerApi } from '../api/customerApi';
import { Invoice, InvoiceStatus, InvoicePaymentStatus } from '../types/invoice';
import { Customer } from '../types/customer';

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  DRAFT: {
    label: 'Draft',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    text: 'text-slate-600',
    icon: Clock,
  },
  ISSUED: {
    label: 'Diterbitkan',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    text: 'text-blue-600',
    icon: FileCheck2,
  },
  CANCELLED: {
    label: 'Dibatalkan',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    text: 'text-amber-600',
    icon: Ban,
  },
};

const PAYMENT_STATUS_CONFIG: Record<InvoicePaymentStatus, { label: string; bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  UNPAID: {
    label: 'Belum Bayar',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    text: 'text-rose-600',
    icon: AlertCircle,
  },
  PARTIAL: {
    label: 'Sebagian',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    text: 'text-amber-600',
    icon: AlertTriangle,
  },
  PAID: {
    label: 'Lunas',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    text: 'text-emerald-600',
    icon: CheckCircle2,
  },
};

export const InvoiceListPage: React.FC = () => {
  const navigate = useNavigate();
  const [invoiceList, setInvoiceList] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const params: any = {
        page,
        size: 10,
        sortBy: 'createdAt',
        sortDir: 'desc',
      };

      if (search.trim()) params.search = search.trim();
      if (selectedStatus) params.status = selectedStatus;
      if (selectedPaymentStatus) params.paymentStatus = selectedPaymentStatus;
      if (selectedCustomer) params.customerId = Number(selectedCustomer);

      const response = await invoiceApi.getInvoiceList(params);
      setInvoiceList(response.content || []);
      setTotalPages(response.totalPages || 1);
      setTotalElements(response.totalElements || 0);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal memuat data faktur.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    customerApi.getActiveCustomers().then(setCustomers).catch(console.error);
  }, []);

  useEffect(() => {
    loadData();
  }, [page, selectedStatus, selectedPaymentStatus, selectedCustomer]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadData();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // KPIs
  const totalNominal = invoiceList.reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);
  const totalOutstanding = invoiceList.reduce((acc, inv) => acc + (inv.outstanding || 0), 0);
  const countPaid = invoiceList.filter((inv) => inv.paymentStatus === 'PAID').length;
  const countUnpaid = invoiceList.filter((inv) => inv.paymentStatus === 'UNPAID').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-slate-800">
            <Receipt className="w-6 h-6 text-brand-600" />
            <h1 className="text-2xl font-bold tracking-tight">Faktur Penjualan (Invoices)</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Kelola penagihan piutang, keterkaitan penawaran proyek, termin pembayaran, dan riwayat pelunasan.
          </p>
        </div>

        <button
          onClick={() => navigate('/faktur/create')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 active:bg-brand-800 shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Buat Faktur Baru
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Faktur</p>
            <p className="text-xl font-bold text-slate-900">{totalElements}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Tagihan (Halaman)</p>
            <p className="text-lg font-bold text-slate-900 truncate">{formatCurrency(totalNominal)}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Sisa Tagihan / Piutang</p>
            <p className="text-lg font-bold text-rose-700 truncate">{formatCurrency(totalOutstanding)}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Status Pembayaran</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {countPaid} Lunas
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                {countUnpaid} Belum
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3 flex-wrap">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor faktur atau catatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </form>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(0);
            }}
            className="text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="">Semua Status Faktur</option>
            <option value="DRAFT">DRAFT</option>
            <option value="ISSUED">ISSUED (Diterbitkan)</option>
            <option value="CANCELLED">CANCELLED (Dibatalkan)</option>
          </select>

          <select
            value={selectedPaymentStatus}
            onChange={(e) => {
              setSelectedPaymentStatus(e.target.value);
              setPage(0);
            }}
            className="text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="">Semua Status Bayar</option>
            <option value="UNPAID">Belum Bayar (UNPAID)</option>
            <option value="PARTIAL">Sebagian (PARTIAL)</option>
            <option value="PAID">Lunas (PAID)</option>
          </select>

          <select
            value={selectedCustomer}
            onChange={(e) => {
              setSelectedCustomer(e.target.value);
              setPage(0);
            }}
            className="text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white max-w-[200px] truncate"
          >
            <option value="">Semua Customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-sm font-medium text-slate-600">Memuat data faktur...</span>
          </div>
        ) : invoiceList.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-base font-semibold text-slate-700">Belum ada faktur penjualan</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Buat faktur baru secara mandiri atau tarik item kegiatan dari surat penawaran harga yang telah disetujui.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Nomor Faktur</th>
                  <th className="py-3 px-4">Tanggal / Jatuh Tempo</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Sumber Penawaran</th>
                  <th className="py-3 px-4 text-right">Total Tagihan</th>
                  <th className="py-3 px-4 text-right">Sisa (Outstanding)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Pembayaran</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {invoiceList.map((inv) => {
                  const statusMeta = STATUS_CONFIG[inv.status] || STATUS_CONFIG.DRAFT;
                  const StatusIcon = statusMeta.icon;
                  const payMeta = PAYMENT_STATUS_CONFIG[inv.paymentStatus] || PAYMENT_STATUS_CONFIG.UNPAID;
                  const PayIcon = payMeta.icon;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-700">
                        {inv.number}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>
                          {new Date(inv.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        {inv.dueDate && (
                          <div className="text-xs text-slate-400 mt-0.5">
                            Tempo: {new Date(inv.dueDate).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{inv.customerName}</div>
                        <div className="text-xs text-slate-400 font-mono">{inv.customerCode}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {inv.sourcePenawaranNumber ? (
                          <button
                            onClick={() => navigate(`/penawaran/${inv.sourcePenawaranId}`)}
                            className="text-xs font-mono font-medium text-brand-600 hover:text-brand-800 hover:underline inline-flex items-center gap-1"
                          >
                            <FileCheck2 className="w-3 h-3" />
                            {inv.sourcePenawaranNumber}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Langsung (Non-Penawaran)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(inv.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold">
                        <span className={inv.outstanding > 0 ? 'text-rose-600' : 'text-slate-400'}>
                          {formatCurrency(inv.outstanding)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusMeta.bg}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${payMeta.bg}`}
                        >
                          <PayIcon className="w-3.5 h-3.5" />
                          {payMeta.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => navigate(`/faktur/${inv.id}`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Rincian
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Menampilkan halaman {page + 1} dari {totalPages} ({totalElements} total faktur)
            </span>
            <div className="flex gap-1">
              <button
                disabled={page === 0}
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                className="px-3 py-1.5 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                Sebelumnya
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((prev) => prev + 1)}
                className="px-3 py-1.5 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceListPage;

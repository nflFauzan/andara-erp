import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  FileCheck2,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { invoiceApi } from '../api/invoiceApi';
import { customerApi } from '../api/customerApi';
import { Invoice } from '../types/invoice';
import { Customer } from '../types/customer';
import { BentoCard } from '@/components/common/BentoCard';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const InvoiceListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOperator = user?.role === 'OPERATOR';
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
      setErrorMsg(err.response?.data?.message || 'Gagal memuat daftar faktur.');
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <PageHeader
        icon={Receipt}
        title="Faktur Penjualan (Invoices)"
        subtitle="Kelola penagihan piutang, keterkaitan SPH proyek, termin pembayaran, dan pelunasan kas."
        actions={
          <button
            onClick={() => navigate('/faktur/create')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs font-bold shadow-md shadow-brand-500/25 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Buat Faktur Baru
          </button>
        }
      />

      {/* KPI Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BentoCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border-[1.5px] border-blue-200 dark:border-blue-500/20 shadow-xs">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Faktur</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{totalElements}</p>
          </div>
        </BentoCard>

        <BentoCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border-[1.5px] border-indigo-200 dark:border-indigo-500/20 shadow-xs">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tagihan (Halaman)</p>
            <p className="text-base font-black text-slate-900 dark:text-white truncate mt-0.5">{formatCurrency(totalNominal)}</p>
          </div>
        </BentoCard>

        <BentoCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border-[1.5px] border-amber-200 dark:border-amber-500/20 shadow-xs">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sisa Piutang</p>
            <p className="text-base font-black text-amber-600 dark:text-amber-400 truncate mt-0.5">{formatCurrency(totalOutstanding)}</p>
          </div>
        </BentoCard>

        <BentoCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border-[1.5px] border-emerald-200 dark:border-emerald-500/20 shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status Bayar</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                {countPaid} Lunas
              </span>
              <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                {countUnpaid} Belum
              </span>
            </div>
          </div>
        </BentoCard>
      </div>

      {/* Filter and Search Bar with Defined 1.5px Outlines */}
      <BentoCard className="p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3 flex-wrap">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor faktur atau catatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs font-medium pl-10 pr-4 py-2.5 rounded-xl border-[1.5px] border-blue-200/90 dark:border-slate-700 bg-white/95 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs transition"
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
            className="text-xs font-semibold px-3 py-2.5 rounded-xl border-[1.5px] border-blue-200/90 dark:border-slate-700 bg-white/95 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs transition"
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
            className="text-xs font-semibold px-3 py-2.5 rounded-xl border-[1.5px] border-blue-200/90 dark:border-slate-700 bg-white/95 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs transition"
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
            className="text-xs font-semibold px-3 py-2.5 rounded-xl border-[1.5px] border-blue-200/90 dark:border-slate-700 bg-white/95 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs transition max-w-[200px] truncate"
          >
            <option value="">Semua Customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>
      </BentoCard>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 flex items-center gap-3 text-sm shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Data Table */}
      <BentoCard padding="none" className="overflow-hidden">
        {loading ? (
          <div className="p-16 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Memuat data faktur...</span>
          </div>
        ) : invoiceList.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Receipt className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-base font-bold text-slate-800 dark:text-slate-200">Belum ada faktur penjualan</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Buat faktur baru secara mandiri atau tarik rincian item kegiatan dari surat penawaran harga yang telah disetujui.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/90 dark:bg-slate-900/90 border-b-[1.5px] border-blue-100 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Nomor Faktur</th>
                  <th className="py-3.5 px-4">Tanggal / Jatuh Tempo</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Sumber SPH</th>
                  <th className="py-3.5 px-4 text-right">Total Tagihan</th>
                  <th className="py-3.5 px-4 text-right">Sisa Piutang</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Pembayaran</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {invoiceList.map((inv) => {
                  return (
                    <tr key={inv.id} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => navigate(`/faktur/${inv.id}`)}
                          className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline cursor-pointer text-left transition"
                        >
                          {inv.number}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 text-xs font-medium">
                        <div>
                          {new Date(inv.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        {inv.dueDate && (
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                            Tempo: {new Date(inv.dueDate).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs">{inv.customerName}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{inv.customerCode}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {inv.sourcePenawaranNumber ? (
                          <button
                            onClick={() => navigate(`/penawaran/${inv.sourcePenawaranId}`)}
                            className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                          >
                            <FileCheck2 className="w-3 h-3" />
                            {inv.sourcePenawaranNumber}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">Langsung (Non-SPH)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(inv.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold">
                        <span className={inv.outstanding > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}>
                          {formatCurrency(inv.outstanding)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={inv.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge
                          status={inv.paymentStatus === 'PAID' ? 'LUNAS' : inv.paymentStatus === 'PARTIAL' ? 'SEBAGIAN' : 'BELUM BAYAR'}
                          size="sm"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isOperator && inv.status === 'ISSUED' && inv.outstanding > 0 && (
                            <button
                              type="button"
                              onClick={() => navigate(`/pembayaran/create?invoiceId=${inv.id}&customerId=${inv.customerId}`)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 border-[1.5px] border-emerald-300 dark:border-emerald-800 transition shadow-xs"
                              title="Catat pembayaran langsung untuk faktur ini"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Bayar
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => navigate(`/faktur/${inv.id}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 dark:text-slate-200 bg-white hover:bg-blue-50/80 dark:bg-slate-800 dark:hover:bg-slate-700 border-[1.5px] border-blue-200 dark:border-slate-700 shadow-xs transition"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-500 dark:text-slate-400" />
                            Rincian
                          </button>
                        </div>
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
          <div className="p-4 border-t-[1.5px] border-blue-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>
              Menampilkan halaman {page + 1} dari {totalPages} ({totalElements} total faktur)
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={page === 0}
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 disabled:opacity-30 hover:bg-white dark:hover:bg-slate-700 transition"
              >
                Sebelumnya
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((prev) => prev + 1)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 disabled:opacity-30 hover:bg-white dark:hover:bg-slate-700 transition"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </BentoCard>
    </div>
  );
};

export default InvoiceListPage;

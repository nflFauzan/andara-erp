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
  CreditCard,
  Info
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
  const countUnpaid = invoiceList.filter((inv) => inv.paymentStatus === 'UNPAID' || inv.paymentStatus === 'PARTIAL').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <PageHeader
        icon={Receipt}
        title="Faktur Penjualan (Invoices)"
        subtitle="Kelola surat tagihan pembayaran ke pelanggan, termin proyek, serta pemantauan sisa piutang."
        badge={
          <span className="neu-badge">
            <Receipt className="w-3.5 h-3.5" />
            Dokumen Penagihan
          </span>
        }
        actions={
          <button
            onClick={() => navigate('/faktur/create')}
            className="neu-btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Faktur Baru</span>
          </button>
        }
      />

      {/* 💡 Panduan Cepat untuk Orang Awam / Gaptek */}
      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-start gap-3 shadow-neu-convex-xs">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-black text-blue-950 dark:text-blue-200">
            Alur Kerja Faktur Penjualan (Invoice)
          </p>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            Faktur adalah surat tagihan resmi kepada pelanggan. Anda dapat menerbitkan faktur dari penawaran harga (SPH) atau langsung.
            Saat pelanggan melakukan transfer pembayaran, klik tombol <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">Bayar</span> untuk mencatat uang masuk dan melunasi sisa piutang.
          </p>
        </div>
      </div>

      {/* KPI Bento Cards with Crystal Clear Labels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Faktur */}
        <BentoCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-neu-canvas shadow-neu-inset-xs text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-neu-border/60">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Faktur</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{totalElements} Faktur</p>
            <p className="text-[10px] text-slate-400 font-medium">Lembar tagihan dibuat</p>
          </div>
        </BentoCard>

        {/* Total Nilai Tagihan */}
        <BentoCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-neu-canvas shadow-neu-inset-xs text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-neu-border/60">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Tagihan (Halaman Ini)</p>
            <p className="text-base font-black text-slate-900 dark:text-white truncate mt-0.5">{formatCurrency(totalNominal)}</p>
            <p className="text-[10px] text-slate-400 font-medium truncate">Total nilai omset tagihan</p>
          </div>
        </BentoCard>

        {/* Sisa Piutang */}
        <BentoCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-neu-canvas shadow-neu-inset-xs text-amber-500 flex items-center justify-center shrink-0 border border-neu-border/60">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sisa Belum Bayar (Piutang)</p>
            <p className="text-base font-black text-amber-600 dark:text-amber-400 truncate mt-0.5">{formatCurrency(totalOutstanding)}</p>
            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold truncate">Wajib ditagih ke pelanggan</p>
          </div>
        </BentoCard>

        {/* Status Pelunasan */}
        <BentoCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-neu-canvas shadow-neu-inset-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-neu-border/60">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status Pelunasan</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                {countPaid} Lunas
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                {countUnpaid} Belum
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Performa penagihan kas</p>
          </div>
        </BentoCard>
      </div>

      {/* Filter and Search Bar with Neumorphic Inset Wells */}
      <BentoCard className="p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3 flex-wrap">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor faktur, proyek, atau catatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="neu-input w-full pl-10 pr-4 py-2.5 text-xs font-semibold"
          />
        </form>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          
          {/* Status Dokumen */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(0);
            }}
            className="neu-input text-xs font-bold px-3 py-2.5 cursor-pointer"
          >
            <option value="">Semua Status Dokumen</option>
            <option value="DRAFT">Konsep (Draft)</option>
            <option value="ISSUED">Resmi Diterbitkan (Issued)</option>
            <option value="CANCELLED">Dibatalkan (Cancelled)</option>
          </select>

          {/* Status Bayar */}
          <select
            value={selectedPaymentStatus}
            onChange={(e) => {
              setSelectedPaymentStatus(e.target.value);
              setPage(0);
            }}
            className="neu-input text-xs font-bold px-3 py-2.5 cursor-pointer"
          >
            <option value="">Semua Status Pembayaran</option>
            <option value="UNPAID">Belum Dibayar (Unpaid)</option>
            <option value="PARTIAL">Sebagian Dicicil (Partial)</option>
            <option value="PAID">Lunas (Paid)</option>
          </select>

          {/* Pelanggan */}
          <select
            value={selectedCustomer}
            onChange={(e) => {
              setSelectedCustomer(e.target.value);
              setPage(0);
            }}
            className="neu-input text-xs font-bold px-3 py-2.5 max-w-[200px] truncate cursor-pointer"
          >
            <option value="">Semua Pelanggan</option>
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
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 flex items-center gap-3 text-sm font-semibold shadow-neu-convex-xs">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Data Table */}
      <BentoCard padding="none" className="overflow-hidden">
        {loading ? (
          <div className="p-16 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-sm font-bold text-slate-600 dark:text-slate-400">Memuat data faktur...</span>
          </div>
        ) : invoiceList.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Receipt className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-base font-black text-slate-800 dark:text-slate-200">Belum ada faktur penjualan</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed font-medium">
              Buat faktur baru secara mandiri atau tarik rincian item kegiatan dari surat penawaran harga (SPH) yang telah disetujui.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-neu-canvas border-b border-neu-border/60 text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Nomor Faktur</th>
                  <th className="py-3.5 px-4">Tanggal / Jatuh Tempo</th>
                  <th className="py-3.5 px-4">Pelanggan (Customer)</th>
                  <th className="py-3.5 px-4">Asal Penawaran (SPH)</th>
                  <th className="py-3.5 px-4 text-right">Nilai Tagihan</th>
                  <th className="py-3.5 px-4 text-right">Sisa Belum Bayar</th>
                  <th className="py-3.5 px-4 text-center">Status Dokumen</th>
                  <th className="py-3.5 px-4 text-center">Status Bayar</th>
                  <th className="py-3.5 px-4 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neu-border/40 text-slate-800 dark:text-slate-200">
                {invoiceList.map((inv) => {
                  return (
                    <tr key={inv.id} className="hover:bg-neu-canvas/50 transition-colors">
                      {/* Nomor Faktur */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => navigate(`/faktur/${inv.id}`)}
                          className="font-mono font-black text-xs text-brand-600 dark:text-brand-400 hover:underline cursor-pointer text-left transition"
                          title="Klik untuk membuka rincian faktur"
                        >
                          {inv.number}
                        </button>
                      </td>

                      {/* Tanggal / Jatuh Tempo */}
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <div>
                          {new Date(inv.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        {inv.dueDate && (
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                            Tempo: {new Date(inv.dueDate).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        )}
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-black text-slate-900 dark:text-slate-100 text-xs">{inv.customerName}</div>
                        <div className="text-[10.5px] text-slate-400 font-mono font-bold mt-0.5">{inv.customerCode}</div>
                      </td>

                      {/* Sumber SPH */}
                      <td className="py-3.5 px-4">
                        {inv.sourcePenawaranNumber ? (
                          <button
                            onClick={() => navigate(`/penawaran/${inv.sourcePenawaranId}`)}
                            className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1.5"
                            title="Buka dokumen penawaran asal"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                            {inv.sourcePenawaranNumber}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic font-medium">Langsung (Non-SPH)</span>
                        )}
                      </td>

                      {/* Nilai Tagihan */}
                      <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 dark:text-slate-100">
                        {formatCurrency(inv.totalAmount)}
                      </td>

                      {/* Sisa Piutang */}
                      <td className="py-3.5 px-4 text-right font-mono">
                        {inv.outstanding > 0 ? (
                          <div>
                            <span className="font-black text-xs text-amber-600 dark:text-amber-400">
                              {formatCurrency(inv.outstanding)}
                            </span>
                            <div className="text-[10px] text-amber-700 dark:text-amber-500 font-bold uppercase tracking-wider">
                              Perlu Ditagih
                            </div>
                          </div>
                        ) : (
                          <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                            Rp 0 (Lunas)
                          </span>
                        )}
                      </td>

                      {/* Status Dokumen */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <StatusBadge status={inv.status} size="sm" />
                      </td>

                      {/* Status Pembayaran */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <StatusBadge
                          status={inv.paymentStatus === 'PAID' ? 'LUNAS' : inv.paymentStatus === 'PARTIAL' ? 'SEBAGIAN DIBAYAR' : 'BELUM BAYAR'}
                          size="sm"
                        />
                      </td>

                      {/* Aksi Cepat */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {isOperator && inv.status === 'ISSUED' && inv.outstanding > 0 && (
                            <button
                              type="button"
                              onClick={() => navigate(`/pembayaran/create?invoiceId=${inv.id}&customerId=${inv.customerId}`)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30 transition cursor-pointer"
                              title="Catat uang masuk / pelunasan untuk faktur ini"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Bayar</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => navigate(`/faktur/${inv.id}`)}
                            className="neu-btn text-xs py-1.5 px-2.5 cursor-pointer"
                            title="Buka rincian dokumen & cetak faktur"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Rincian</span>
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
          <div className="p-4 border-t border-neu-border/60 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 bg-neu-surface">
            <span>
              Menampilkan halaman {page + 1} dari {totalPages} ({totalElements} total faktur)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                className="neu-btn px-3.5 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((prev) => prev + 1)}
                className="neu-btn px-3.5 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
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

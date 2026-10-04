import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Clock,
  Info
} from 'lucide-react';
import { penawaranApi } from '../api/penawaranApi';
import { customerApi } from '../api/customerApi';
import { Penawaran, PenawaranStatus } from '../types/penawaran';
import { Customer } from '../types/customer';
import { formatRupiah } from '../lib/utils';
import { BentoCard } from '@/components/common/BentoCard';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';

export const PenawaranListPage: React.FC = () => {
  const navigate = useNavigate();

  // State List & Filter
  const [penawaranList, setPenawaranList] = useState<Penawaran[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    loadPenawaran();
  }, [page, selectedStatus, selectedCustomer]);

  const loadCustomers = async () => {
    try {
      const data = await customerApi.getActiveCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Gagal mengambil daftar customer:', err);
    }
  };

  const loadPenawaran = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await penawaranApi.getPenawaranList({
        page,
        size: pageSize,
        search: search.trim() || undefined,
        status: (selectedStatus as PenawaranStatus) || undefined,
        customerId: selectedCustomer ? Number(selectedCustomer) : undefined,
      });

      setPenawaranList(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal memuat data penawaran.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadPenawaran();
  };

  // Quick stats calculations
  const totalNominal = penawaranList.reduce((acc, p) => acc + (p.totalAmount || 0), 0);
  const countApproved = penawaranList.filter((p) => p.status === 'APPROVED').length;
  const countSent = penawaranList.filter((p) => p.status === 'SENT').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <PageHeader
        icon={FileText}
        title="Surat Penawaran Harga (SPH)"
        subtitle="Kelola estimasi biaya proyek, rincian item pekerjaan per kegiatan, dan persetujuan penawaran resmi ke klien."
        badge={
          <span className="neu-badge">
            <FileText className="w-3.5 h-3.5" />
            Pra-Penjualan
          </span>
        }
        actions={
          <button
            onClick={() => navigate('/penawaran/create')}
            className="neu-btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Penawaran Baru</span>
          </button>
        }
      />

      {/* 💡 Panduan Cepat untuk Orang Awam */}
      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-start gap-3 shadow-neu-convex-xs">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-black text-blue-950 dark:text-blue-200">
            Alur Penawaran Harga (SPH)
          </p>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            SPH diajukan ke calon pelanggan sebagai estimasi biaya sebelum proyek dimulai. 
            Setelah penawaran disetujui pelanggan (status <span className="font-bold text-emerald-700 dark:text-emerald-400">Disetujui</span>), 
            Anda dapat langsung menerbitkan <strong>Faktur Penjualan</strong> dengan memilih penawaran ini tanpa perlu input ulang rincian kegiatan.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BentoCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-neu-canvas shadow-neu-inset-xs text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-neu-border/60">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Penawaran</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{totalElements} SPH</p>
            <p className="text-[10px] text-slate-400 font-medium">Dokumen dibuat</p>
          </div>
        </BentoCard>

        <BentoCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-neu-canvas shadow-neu-inset-xs text-amber-500 flex items-center justify-center shrink-0 border border-neu-border/60">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estimasi Nilai (Halaman)</p>
            <p className="text-base font-black text-amber-600 dark:text-amber-400 truncate mt-0.5">{formatRupiah(totalNominal)}</p>
            <p className="text-[10px] text-slate-400 font-medium truncate">Total nilai penawaran</p>
          </div>
        </BentoCard>

        <BentoCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-neu-canvas shadow-neu-inset-xs text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-neu-border/60">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sedang Diajukan</p>
            <p className="text-xl font-black text-sky-600 dark:text-sky-400 mt-0.5">{countSent} SPH</p>
            <p className="text-[10px] text-slate-400 font-medium">Menunggu respon klien</p>
          </div>
        </BentoCard>

        <BentoCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-neu-canvas shadow-neu-inset-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-neu-border/60">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Disetujui Klien</p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{countApproved} SPH</p>
            <p className="text-[10px] text-slate-400 font-medium">Siap dijadikan faktur</p>
          </div>
        </BentoCard>
      </div>

      {/* Filter and Search Bar */}
      <BentoCard className="p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3 flex-wrap">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor penawaran, proyek, atau catatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="neu-input w-full pl-10 pr-4 py-2.5 text-xs font-semibold"
          />
        </form>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(0);
            }}
            className="neu-input text-xs font-bold px-3 py-2.5 cursor-pointer"
          >
            <option value="">Semua Status Penawaran</option>
            <option value="DRAFT">Konsep (Draft)</option>
            <option value="SENT">Diajukan ke Klien (Sent)</option>
            <option value="APPROVED">Disetujui (Approved)</option>
            <option value="REJECTED">Ditolak (Rejected)</option>
            <option value="CANCELLED">Dibatalkan (Cancelled)</option>
          </select>

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
            <span className="ml-3 text-sm font-bold text-slate-600 dark:text-slate-400">Memuat data penawaran...</span>
          </div>
        ) : penawaranList.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-base font-black text-slate-800 dark:text-slate-200">Belum ada surat penawaran harga</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed font-medium">
              Buat penawaran harga pertama Anda untuk mengajukan estimasi biaya proyek ke pelanggan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-neu-canvas border-b border-neu-border/60 text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Nomor SPH</th>
                  <th className="py-3.5 px-4">Tanggal Penawaran</th>
                  <th className="py-3.5 px-4">Pelanggan (Customer)</th>
                  <th className="py-3.5 px-4">Jumlah Kegiatan</th>
                  <th className="py-3.5 px-4 text-right">Total Estimasi Nilai</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neu-border/40 text-slate-800 dark:text-slate-200">
                {penawaranList.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-neu-canvas/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => navigate(`/penawaran/${p.id}`)}
                          className="font-mono font-black text-xs text-brand-600 dark:text-brand-400 hover:underline cursor-pointer text-left transition"
                          title="Klik untuk membuka rincian penawaran"
                        >
                          {p.number}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {new Date(p.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-black text-slate-900 dark:text-slate-100 text-xs">{p.customerName}</div>
                        <div className="text-[10.5px] text-slate-400 font-mono font-bold mt-0.5">{p.customerCode}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                        {p.details?.length || 0} Item Kegiatan
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 dark:text-slate-100">
                        {formatRupiah(p.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <StatusBadge status={p.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => navigate(`/penawaran/${p.id}`)}
                          className="neu-btn text-xs py-1.5 px-3 cursor-pointer"
                          title="Buka rincian & cetak dokumen SPH"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Rincian</span>
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
          <div className="p-4 border-t border-neu-border/60 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 bg-neu-surface">
            <span>
              Menampilkan halaman {page + 1} dari {totalPages} ({totalElements} total dokumen)
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

export default PenawaranListPage;

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
        subtitle="Kelola estimasi biaya proyek, rincian item pekerjaan per kegiatan, dan persetujuan penawaran resmi."
        badge={
          <span className="text-[11px] bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold px-3 py-1 rounded-full border-[1.5px] border-blue-300 dark:border-blue-500/30">
            Penawaran Resmi
          </span>
        }
        actions={
          <button
            onClick={() => navigate('/penawaran/create')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition"
          >
            <Plus className="w-4 h-4" />
            Buat Penawaran Baru
          </button>
        }
      />

      {/* KPI Cards with 1.5px Outlines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BentoCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border-[1.5px] border-blue-200 dark:border-blue-500/20 shadow-xs">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Penawaran</p>
            <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">{totalElements}</p>
          </div>
        </BentoCard>

        <BentoCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border-[1.5px] border-amber-200 dark:border-amber-500/20 shadow-xs">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Nilai (Halaman)</p>
            <p className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400 truncate mt-0.5">{formatRupiah(totalNominal)}</p>
          </div>
        </BentoCard>

        <BentoCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border-[1.5px] border-sky-200 dark:border-sky-500/20 shadow-xs">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Diajukan (SENT)</p>
            <p className="text-xl font-bold font-mono text-sky-600 dark:text-sky-400 mt-0.5">{countSent}</p>
          </div>
        </BentoCard>

        <BentoCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border-[1.5px] border-emerald-200 dark:border-emerald-500/20 shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Disetujui (APPROVED)</p>
            <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">{countApproved}</p>
          </div>
        </BentoCard>
      </div>

      {/* Filter and Search Bar with Defined 1.5px Outlines */}
      <BentoCard className="p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3 flex-wrap">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor penawaran atau catatan..."
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
            <option value="">Semua Status</option>
            <option value="DRAFT">DRAFT</option>
            <option value="SENT">SENT (Diajukan)</option>
            <option value="APPROVED">APPROVED (Disetujui)</option>
            <option value="REJECTED">REJECTED (Ditolak)</option>
            <option value="CANCELLED">CANCELLED (Dibatalkan)</option>
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
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border-[1.5px] border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 flex items-center gap-3 text-sm shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Data Table */}
      <BentoCard padding="none" className="overflow-hidden">
        {loading ? (
          <div className="p-16 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Memuat data penawaran...</span>
          </div>
        ) : penawaranList.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-base font-bold text-slate-800 dark:text-slate-200">Belum ada penawaran</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Mulai buat surat penawaran harga untuk customer dengan tombol "Buat Penawaran Baru".
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/90 dark:bg-slate-900/90 border-b-[1.5px] border-blue-100 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Nomor Dokumen</th>
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4 text-center">Jml Item</th>
                  <th className="py-3.5 px-4 text-right">Total Nilai</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {penawaranList.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {p.number}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {new Date(p.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs">{p.customerName}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{p.customerCode}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-[1.5px] border-slate-200 dark:border-slate-700 font-semibold shadow-2xs">
                          {p.itemCount} item
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatRupiah(p.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={p.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => navigate(`/penawaran/${p.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 dark:text-slate-200 bg-white hover:bg-blue-50/80 dark:bg-slate-800 dark:hover:bg-slate-700 border-[1.5px] border-blue-200 dark:border-slate-700 shadow-xs transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-500 dark:text-slate-400" />
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
          <div className="p-4 border-t-[1.5px] border-blue-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>
              Menampilkan halaman {page + 1} dari {totalPages} ({totalElements} total penawaran)
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={page === 0}
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                className="px-3 py-1.5 rounded-xl border-[1.5px] border-blue-200 dark:border-slate-800 disabled:opacity-40 hover:bg-white dark:hover:bg-slate-800 font-semibold transition shadow-xs"
              >
                Sebelumnya
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((prev) => prev + 1)}
                className="px-3 py-1.5 rounded-xl border-[1.5px] border-blue-200 dark:border-slate-800 disabled:opacity-40 hover:bg-white dark:hover:bg-slate-800 font-semibold transition shadow-xs"
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

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import { penawaranApi } from '../api/penawaranApi';
import { customerApi } from '../api/customerApi';
import { Penawaran } from '../types/penawaran';
import { Customer } from '../types/customer';
import { BentoCard } from '@/components/common/BentoCard';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';

export const PenawaranListPage: React.FC = () => {
  const navigate = useNavigate();
  const [penawaranList, setPenawaranList] = useState<Penawaran[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
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
        direction: 'DESC',
      };

      if (search.trim()) params.search = search.trim();
      if (selectedStatus) params.status = selectedStatus;
      if (selectedCustomer) params.customerId = Number(selectedCustomer);

      const response = await penawaranApi.getPenawaranList(params);
      setPenawaranList(response.content || []);
      setTotalPages(response.totalPages || 1);
      setTotalElements(response.totalElements || 0);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal memuat data penawaran.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    customerApi.getActiveCustomers().then(setCustomers).catch(console.error);
  }, []);

  useEffect(() => {
    loadData();
  }, [page, selectedStatus, selectedCustomer]);

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
          <span className="text-[11px] bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold px-2.5 py-0.5 rounded-full border border-brand-500/20">
            Penawaran Resmi
          </span>
        }
        actions={
          <button
            onClick={() => navigate('/penawaran/create')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 active:scale-95 text-white text-xs font-bold shadow-md shadow-brand-500/25 transition"
          >
            <Plus className="w-4 h-4" />
            Buat Penawaran Baru
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BentoCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Penawaran</p>
            <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">{totalElements}</p>
          </div>
        </BentoCard>

        <BentoCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Nilai (Halaman)</p>
            <p className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400 truncate">{formatCurrency(totalNominal)}</p>
          </div>
        </BentoCard>

        <BentoCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Diajukan (SENT)</p>
            <p className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">{countSent}</p>
          </div>
        </BentoCard>

        <BentoCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Disetujui (APPROVED)</p>
            <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{countApproved}</p>
          </div>
        </BentoCard>
      </div>

      {/* Filter and Search Bar */}
      <BentoCard className="p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor penawaran atau catatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs font-medium pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30 bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100"
          />
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(0);
            }}
            className="text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30 bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100"
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
            className="text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30 bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 max-w-[200px] truncate"
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
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Data Table */}
      <BentoCard className="overflow-hidden p-0">
        {loading ? (
          <div className="p-16 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
            <span className="ml-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Memuat data penawaran...</span>
          </div>
        ) : penawaranList.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-base font-bold text-slate-700 dark:text-slate-300">Belum ada penawaran</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Mulai buat surat penawaran harga untuk customer dengan tombol "Buat Penawaran Baru".
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100/70 dark:bg-slate-900/70 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  <th className="py-3 px-4">Nomor Dokumen</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-center">Jml Item</th>
                  <th className="py-3 px-4 text-right">Total Nilai</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {penawaranList.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                        {p.number}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {new Date(p.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{p.customerName}</div>
                        <div className="text-xs text-slate-400 font-mono">{p.customerCode}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 font-semibold">
                          {p.itemCount} item
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(p.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => navigate(`/penawaran/${p.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-brand-500" />
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
          <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Menampilkan halaman {page + 1} dari {totalPages} ({totalElements} total penawaran)
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={page === 0}
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-white dark:hover:bg-slate-800 font-semibold transition"
              >
                Sebelumnya
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((prev) => prev + 1)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-white dark:hover:bg-slate-800 font-semibold transition"
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

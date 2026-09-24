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
  XCircle,
  Ban,
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import { penawaranApi } from '../api/penawaranApi';
import { customerApi } from '../api/customerApi';
import { Penawaran, PenawaranStatus } from '../types/penawaran';
import { Customer } from '../types/customer';

const STATUS_CONFIG: Record<PenawaranStatus, { label: string; bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  DRAFT: {
    label: 'Draft',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    text: 'text-slate-600',
    icon: Clock,
  },
  SENT: {
    label: 'Diajukan',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    text: 'text-blue-600',
    icon: Clock,
  },
  APPROVED: {
    label: 'Disetujui',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    text: 'text-emerald-600',
    icon: CheckCircle2,
  },
  REJECTED: {
    label: 'Ditolak',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    text: 'text-rose-600',
    icon: XCircle,
  },
  CANCELLED: {
    label: 'Dibatalkan',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    text: 'text-amber-600',
    icon: Ban,
  },
};

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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-slate-800">
            <FileText className="w-6 h-6 text-brand-600" />
            <h1 className="text-2xl font-bold tracking-tight">Surat Penawaran Harga (Quotation)</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Kelola estimasi biaya proyek, rincian item kegiatan, dan status persetujuan penawaran resmi.
          </p>
        </div>

        <button
          onClick={() => navigate('/penawaran/create')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 active:bg-brand-800 shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Buat Penawaran Baru
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Penawaran</p>
            <p className="text-xl font-bold text-slate-900">{totalElements}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Nilai (Halaman)</p>
            <p className="text-lg font-bold text-slate-900 truncate">{formatCurrency(totalNominal)}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Menunggu (SENT)</p>
            <p className="text-xl font-bold text-blue-700">{countSent}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Disetujui (APPROVED)</p>
            <p className="text-xl font-bold text-emerald-700">{countApproved}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor penawaran atau catatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
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
            className="text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
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
            <span className="ml-3 text-sm font-medium text-slate-600">Memuat data penawaran...</span>
          </div>
        ) : penawaranList.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-base font-semibold text-slate-700">Belum ada penawaran</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Mulai buat surat penawaran harga untuk customer dengan tombol "Buat Penawaran Baru".
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Nomor Dokumen</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-center">Jml Item</th>
                  <th className="py-3 px-4 text-right">Total Nilai</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {penawaranList.map((p) => {
                  const statusMeta = STATUS_CONFIG[p.status] || STATUS_CONFIG.DRAFT;
                  const StatusIcon = statusMeta.icon;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-700">
                        {p.number}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {new Date(p.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{p.customerName}</div>
                        <div className="text-xs text-slate-400 font-mono">{p.customerCode}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                          {p.itemCount} item
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(p.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusMeta.bg}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => navigate(`/penawaran/${p.id}`)}
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
              Menampilkan halaman {page + 1} dari {totalPages} ({totalElements} total penawaran)
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

export default PenawaranListPage;

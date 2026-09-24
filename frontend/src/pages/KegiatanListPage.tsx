import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Layers,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Building,
  MapPin,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Calendar
} from 'lucide-react';
import { kegiatanApi, KegiatanQueryParams } from '../api/kegiatanApi';
import { customerApi } from '../api/customerApi';
import { Kegiatan, CreateKegiatanInput, UpdateKegiatanInput, KegiatanStatus } from '../types/kegiatan';
import { KegiatanModal } from '../components/kegiatan/KegiatanModal';
import { formatRupiah } from '../lib/utils';

export const KegiatanListPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<KegiatanStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKegiatan, setSelectedKegiatan] = useState<Kegiatan | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch Customers for filter dropdown
  const { data: activeCustomers = [] } = useQuery({
    queryKey: ['active-customers'],
    queryFn: () => customerApi.getActiveCustomers(),
  });

  // Query Params
  const queryParams: KegiatanQueryParams = {
    search: searchTerm.trim() || undefined,
    customerId: selectedCustomerId,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    page,
    size: pageSize,
    sortBy: 'createdAt',
    sortDir: 'desc',
  };

  // Fetch Kegiatan
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['kegiatan', queryParams],
    queryFn: () => kegiatanApi.getKegiatan(queryParams),
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (newKegiatan: CreateKegiatanInput) => kegiatanApi.createKegiatan(newKegiatan),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['kegiatan'] });
      setIsModalOpen(false);
      setFeedbackMessage({
        type: 'success',
        text: `Kegiatan '${data.name}' (${data.code}) berhasil dibuat.`,
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal membuat kegiatan baru.';
      setFeedbackMessage({ type: 'error', text: msg });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateKegiatanInput }) =>
      kegiatanApi.updateKegiatan(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['kegiatan'] });
      setIsModalOpen(false);
      setSelectedKegiatan(null);
      setFeedbackMessage({
        type: 'success',
        text: `Data kegiatan '${data.name}' berhasil diperbarui.`,
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal memperbarui data kegiatan.';
      setFeedbackMessage({ type: 'error', text: msg });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => kegiatanApi.deleteKegiatan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kegiatan'] });
      setFeedbackMessage({
        type: 'success',
        text: 'Kegiatan berhasil dihapus.',
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal menghapus kegiatan.';
      setFeedbackMessage({ type: 'error', text: msg });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
  });

  const handleOpenCreateModal = () => {
    setSelectedKegiatan(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (k: Kegiatan) => {
    setSelectedKegiatan(k);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData: CreateKegiatanInput | UpdateKegiatanInput) => {
    if (selectedKegiatan) {
      await updateMutation.mutateAsync({ id: selectedKegiatan.id, input: formData as UpdateKegiatanInput });
    } else {
      await createMutation.mutateAsync(formData as CreateKegiatanInput);
    }
  };

  const kegiatanList = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  const renderStatusBadge = (status: KegiatanStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Aktif
          </span>
        );
      case 'PLANNED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            Direncanakan
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Selesai
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Ditutup
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Dibatalkan
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-indigo-600" />
            Kegiatan & Rincian Item Pekerjaan
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pencatatan proyek operasional, rincian volume & harga satuan, serta dasar penawaran dan faktur penjualan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 rounded-xl hover:bg-slate-50 transition shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kegiatan</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between transition-all ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2.5 text-sm font-medium">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs font-semibold underline ml-4 hover:opacity-80"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row gap-3 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              placeholder="Cari kode, nama proyek, lokasi..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          {/* Customer Dropdown */}
          <div className="w-full sm:w-64">
            <select
              value={selectedCustomerId || ''}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value ? Number(e.target.value) : undefined);
                setPage(0);
              }}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            >
              <option value="">-- Semua Customer --</option>
              {activeCustomers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold shrink-0">
            {(['ALL', 'ACTIVE', 'PLANNED', 'COMPLETED', 'CLOSED', 'CANCELLED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(0);
                }}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  statusFilter === st
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'Semua' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Kegiatan Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Kode & Tanggal</th>
                <th className="py-3.5 px-4">Nama Kegiatan & Lokasi</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Item</th>
                <th className="py-3.5 px-4 text-right">Total Nilai</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                      <p className="text-xs">Memuat data kegiatan...</p>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-rose-500 text-sm">
                    Terjadi kesalahan saat memuat data kegiatan. Silakan refresh halaman.
                  </td>
                </tr>
              ) : kegiatanList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Layers className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                      <p className="font-medium text-slate-600">Tidak ada kegiatan ditemukan</p>
                      <p className="text-xs text-slate-400">
                        {searchTerm ? 'Coba ubah kata kunci pencarian Anda.' : 'Klik "Tambah Kegiatan" untuk mencatat proyek baru.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                kegiatanList.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50/70 transition-colors group">
                    {/* Kode & Tanggal */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                        {k.code}
                      </span>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(k.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                    </td>

                    {/* Nama Kegiatan & Lokasi */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">
                        <Link
                          to={`/kegiatan/${k.id}`}
                          className="hover:text-indigo-600 transition hover:underline"
                        >
                          {k.name}
                        </Link>
                      </div>
                      {k.location && (
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-xs">{k.location}</span>
                        </div>
                      )}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/customers/${k.customerId}`}
                        className="font-medium text-slate-700 hover:text-indigo-600 hover:underline flex items-center gap-1 text-xs"
                      >
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{k.customerName}</span>
                      </Link>
                      {k.customerCompanyName && (
                        <span className="text-[11px] text-slate-400 block ml-4.5">
                          {k.customerCompanyName}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {renderStatusBadge(k.status)}
                    </td>

                    {/* Jumlah Item */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                        {k.itemsCount} item
                      </span>
                    </td>

                    {/* Total Nilai */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="font-mono font-bold text-sm text-slate-900">
                        {formatRupiah(k.totalAmount)}
                      </div>
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1">
                        <Link
                          to={`/kegiatan/${k.id}`}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Lihat Detail & Item Pekerjaan"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(k)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Edit Kegiatan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus kegiatan '${k.name}'?`)) {
                              deleteMutation.mutate(k.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Kegiatan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/50">
          <div>
            Menampilkan{' '}
            <span className="font-semibold text-slate-700">
              {totalElements === 0 ? 0 : page * pageSize + 1}
            </span>{' '}
            -{' '}
            <span className="font-semibold text-slate-700">
              {Math.min((page + 1) * pageSize, totalElements)}
            </span>{' '}
            dari <span className="font-semibold text-slate-700">{totalElements}</span> kegiatan
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || isLoading}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-slate-700">
              Halaman {totalPages === 0 ? 0 : page + 1} dari {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || isLoading}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <KegiatanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedKegiatan(null);
        }}
        onSubmit={handleModalSubmit}
        kegiatan={selectedKegiatan}
        defaultCustomerId={selectedCustomerId}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  HardHat,
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
import { BentoCard } from '@/components/common/BentoCard';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <PageHeader
        icon={HardHat}
        title="Kegiatan & Rincian Item Pekerjaan"
        subtitle="Pencatatan proyek operasional, rincian volume & harga satuan, serta dasar penawaran dan faktur penjualan."
        badge={
          <span className="text-[11px] bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold px-2.5 py-0.5 rounded-full border border-brand-500/20">
            Operasional
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="p-2 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition shadow-xs"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/25 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kegiatan</span>
            </button>
          </div>
        }
      />

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between transition-all ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/20'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs font-bold underline ml-4 hover:opacity-80"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <BentoCard className="p-4 flex flex-col lg:flex-row gap-3 items-center justify-between">
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
              className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-white/95 dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-xl border-[1.5px] border-blue-200/90 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-xs transition"
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
              className="w-full px-3.5 py-2.5 text-xs font-semibold bg-white/95 dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-xl border-[1.5px] border-blue-200/90 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-xs transition truncate"
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
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0">
            <Filter className="w-3.5 h-3.5 text-blue-500" />
            <span>Status:</span>
          </div>
          <div className="inline-flex p-1 bg-white/80 dark:bg-slate-800/80 rounded-full text-xs font-bold shrink-0 border border-slate-200/80 dark:border-slate-700 shadow-xs">
            {([
              { key: 'ALL', label: 'Semua', dot: '' },
              { key: 'ACTIVE', label: 'Berjalan', dot: 'bg-emerald-500' },
              { key: 'PLANNED', label: 'Direncanakan', dot: 'bg-sky-500' },
              { key: 'COMPLETED', label: 'Selesai', dot: 'bg-teal-500' },
              { key: 'CLOSED', label: 'Ditutup', dot: 'bg-indigo-400' },
              { key: 'CANCELLED', label: 'Dibatalkan', dot: 'bg-rose-500' },
            ] as const).map((st) => (
              <button
                key={st.key}
                onClick={() => {
                  setStatusFilter(st.key as KegiatanStatus | 'ALL');
                  setPage(0);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  statusFilter === st.key
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st.dot && <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />}
                <span>{st.label}</span>
              </button>
            ))}
          </div>
        </div>
      </BentoCard>

      {/* Kegiatan Data Table */}
      <BentoCard className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm text-slate-600 dark:text-slate-300">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-900/90 border-b-[1.5px] border-blue-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                <th className="py-3.5 px-4">Kode & Tanggal</th>
                <th className="py-3.5 px-4">Nama Kegiatan & Lokasi</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Item</th>
                <th className="py-3.5 px-4 text-right">Total Nilai</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                      <p className="text-xs font-semibold">Memuat data kegiatan...</p>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-rose-500 text-sm font-semibold">
                    Terjadi kesalahan saat memuat data kegiatan. Silakan refresh halaman.
                  </td>
                </tr>
              ) : kegiatanList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <HardHat className="w-10 h-10 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                      <p className="font-bold text-slate-700 dark:text-slate-300">Tidak ada kegiatan ditemukan</p>
                      <p className="text-xs text-slate-400">
                        {searchTerm ? 'Coba ubah kata kunci pencarian Anda.' : 'Klik "Tambah Kegiatan" untuk mencatat proyek baru.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                kegiatanList.map((k) => (
                  <tr key={k.id} className="hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors group">
                    {/* Kode & Tanggal */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-md border border-brand-500/20">
                        {k.code}
                      </span>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 font-medium">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(k.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                    </td>

                    {/* Nama Kegiatan & Lokasi */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        <Link
                          to={`/kegiatan/${k.id}`}
                          className="hover:text-brand-600 dark:hover:text-brand-400 transition hover:underline"
                        >
                          {k.name}
                        </Link>
                      </div>
                      {k.location && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-xs">{k.location}</span>
                        </div>
                      )}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/customers/${k.customerId}`}
                        className="font-bold text-slate-800 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 hover:underline flex items-center gap-1 text-xs"
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
                      <StatusBadge status={k.status} />
                    </td>

                    {/* Jumlah Item */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full border border-slate-200/80 dark:border-slate-700">
                        {k.itemsCount} item
                      </span>
                    </td>

                    {/* Total Nilai */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                        {formatRupiah(k.totalAmount)}
                      </div>
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1">
                        <Link
                          to={`/kegiatan/${k.id}`}
                          className="p-1.5 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition"
                          title="Lihat Detail & Item Pekerjaan"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(k)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition"
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
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition"
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="bg-white/40 dark:bg-slate-900/40 px-5 py-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div>
              Menampilkan {page * pageSize + 1} -{' '}
              {Math.min((page + 1) * pageSize, totalElements)} dari {totalElements} kegiatan
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page === 0 || isLoading}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition"
              >
                <ChevronLeft className="w-3.5 h-3.5 inline mr-1" /> Sebelumnya
              </button>
              <span className="px-2 font-semibold text-slate-700 dark:text-slate-300">
                {page + 1} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1 || isLoading}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition"
              >
                Berikutnya <ChevronRight className="w-3.5 h-3.5 inline ml-1" />
              </button>
            </div>
          </div>
        )}
      </BentoCard>

      {/* Kegiatan Modal Create/Edit */}
      <KegiatanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        kegiatan={selectedKegiatan}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};

export default KegiatanListPage;

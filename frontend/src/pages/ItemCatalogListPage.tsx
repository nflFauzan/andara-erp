import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Layers,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { itemCatalogApi } from '../api/itemCatalogApi';
import { ItemCatalog, CreateItemCatalogInput, UpdateItemCatalogInput, ItemCatalogQueryParams } from '../types/itemCatalog';
import { ItemCatalogModal } from '../components/items/ItemCatalogModal';
import { formatRupiah } from '../lib/utils';
import { BentoCard } from '@/components/common/BentoCard';
import { PageHeader } from '@/components/common/PageHeader';

export const ItemCatalogListPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemCatalog | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Prepare query params
  const queryParams: ItemCatalogQueryParams = {
    search: searchTerm.trim() || undefined,
    category: categoryFilter || undefined,
    active: statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE',
    page,
    size: pageSize,
    sortBy: 'name',
    direction: 'ASC',
  };

  // Fetch items
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['item-catalog', queryParams],
    queryFn: () => itemCatalogApi.getItems(queryParams),
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['item-catalog-categories'],
    queryFn: () => itemCatalogApi.getCategories(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (newItem: CreateItemCatalogInput) => itemCatalogApi.createItem(newItem),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['item-catalog'] });
      queryClient.invalidateQueries({ queryKey: ['item-catalog-categories'] });
      setIsModalOpen(false);
      setFeedbackMessage({
        type: 'success',
        text: `Item master '${data.name}' (${data.code}) berhasil ditambahkan.`,
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal menambahkan item master.';
      setFeedbackMessage({ type: 'error', text: msg });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateItemCatalogInput }) =>
      itemCatalogApi.updateItem(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['item-catalog'] });
      queryClient.invalidateQueries({ queryKey: ['item-catalog-categories'] });
      setIsModalOpen(false);
      setSelectedItem(null);
      setFeedbackMessage({
        type: 'success',
        text: `Perubahan item '${data.name}' berhasil disimpan.`,
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal memperbarui item master.';
      setFeedbackMessage({ type: 'error', text: msg });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      itemCatalogApi.toggleItemStatus(id, active),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['item-catalog'] });
      setFeedbackMessage({
        type: 'success',
        text: `Status item '${data.name}' berhasil diubah menjadi ${data.active ? 'Aktif' : 'Nonaktif'}.`,
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal mengubah status item master.';
      setFeedbackMessage({ type: 'error', text: msg });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
  });

  const handleOpenCreateModal = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ItemCatalog) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData: CreateItemCatalogInput | UpdateItemCatalogInput) => {
    if (selectedItem) {
      await updateMutation.mutateAsync({ id: selectedItem.id, input: formData as UpdateItemCatalogInput });
    } else {
      await createMutation.mutateAsync(formData as CreateItemCatalogInput);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <PageHeader
        icon={Package}
        title="Master Data Item"
        subtitle="Pustaka item pekerjaan dan material standar yang dapat dipilih otomatis saat pembuatan SPH."
        badge={
          <span className="text-[11px] bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold px-2.5 py-0.5 rounded-full border border-brand-500/20">
            Katalog Standar
          </span>
        }
        actions={
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/25 transition"
          >
            <Plus className="w-4 h-4" />
            Tambah Item Master
          </button>
        }
      />

      {/* Feedback Toast Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in duration-200 ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/20'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Filter and Search Bar with Defined 1.5px Outlines */}
      <BentoCard className="p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            placeholder="Cari uraian pekerjaan, kode, atau spesifikasi..."
            className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-white/95 dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-xl border-[1.5px] border-blue-200/90 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-xs transition"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(0);
            }}
            className="text-xs font-semibold rounded-xl px-3 py-2 bg-white/95 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-[1.5px] border-blue-200/90 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-xs transition"
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setPage(0);
            }}
            className="text-xs font-semibold rounded-xl px-3 py-2 bg-white/95 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-[1.5px] border-blue-200/90 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-xs transition"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Aktif Saja</option>
            <option value="INACTIVE">Nonaktif Saja</option>
          </select>

          <button
            onClick={() => refetch()}
            title="Muat ulang data"
            className="p-2 border-[1.5px] border-blue-200/90 dark:border-slate-700 bg-white/95 dark:bg-slate-900 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white shadow-xs transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </BentoCard>

      {/* Table Data */}
      <BentoCard className="overflow-hidden p-0">
        {isLoading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Memuat data katalog item master...</p>
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-slate-500">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Gagal memuat katalog item</p>
            <p className="text-xs text-slate-400 mt-1">Silakan periksa koneksi atau coba muat ulang.</p>
            <button
              onClick={() => refetch()}
              className="mt-3 px-4 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl"
            >
              Coba Lagi
            </button>
          </div>
        ) : !data || data.content.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-700 dark:text-slate-300">Belum ada item master</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchTerm || categoryFilter || statusFilter !== 'ALL'
                ? 'Tidak ada item yang cocok dengan kriteria pencarian dan filter.'
                : 'Mulai tambahkan uraian pekerjaan atau material ke master data item.'}
            </p>
            {!searchTerm && !categoryFilter && (
              <button
                onClick={handleOpenCreateModal}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-500 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Item Sekarang
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm text-slate-600 dark:text-slate-300">
              <thead>
                <tr className="bg-slate-50/90 dark:bg-slate-900/90 border-b-[1.5px] border-blue-100 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Kode</th>
                  <th className="py-3.5 px-4">Nama Item / Uraian Pekerjaan</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Satuan</th>
                  <th className="py-3.5 px-4 text-right">Harga Default</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {data.content.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Code */}
                    <td className="py-3.5 px-4 font-mono text-xs font-bold">
                      <span className="bg-brand-500/10 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded border border-brand-500/20">
                        {item.code || '-'}
                      </span>
                    </td>

                    {/* Name & Description */}
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="font-bold text-slate-900 dark:text-slate-100 leading-snug">{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{item.description}</div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      {item.category ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200/80 dark:border-slate-700">
                          <Layers className="w-3 h-3 text-slate-400" />
                          {item.category}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>

                    {/* Unit */}
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20">
                        {item.defaultUnit}
                      </span>
                    </td>

                    {/* Default Price */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatRupiah(item.defaultPrice)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => toggleStatusMutation.mutate({ id: item.id, active: !item.active })}
                        disabled={toggleStatusMutation.isPending}
                        title={`Klik untuk ${item.active ? 'menonaktifkan' : 'mengaktifkan'}`}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors ${
                          item.active
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {item.active ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Aktif</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>Nonaktif</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-colors"
                        title="Ubah data item"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {data && data.totalPages > 1 && (
          <div className="bg-white/40 dark:bg-slate-900/40 px-5 py-4 border-t-[1.5px] border-blue-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div>
              Menampilkan {data.number * data.size + 1} -{' '}
              {Math.min((data.number + 1) * data.size, data.totalElements)} dari {data.totalElements} item
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={data.first}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition"
              >
                <ChevronLeft className="w-3.5 h-3.5 inline mr-1" /> Sebelumnya
              </button>
              <span className="px-2 font-semibold text-slate-700 dark:text-slate-300">
                {data.number + 1} / {data.totalPages}
              </span>
              <button
                disabled={data.last}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition"
              >
                Berikutnya <ChevronRight className="w-3.5 h-3.5 inline ml-1" />
              </button>
            </div>
          </div>
        )}
      </BentoCard>

      {/* Item Modal Create/Edit */}
      <ItemCatalogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        item={selectedItem}
        isLoading={createMutation.isPending || updateMutation.isPending}
        categories={categories}
      />
    </div>
  );
};

export default ItemCatalogListPage;

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
        text: `Status item '${data.name}' diubah menjadi ${data.active ? 'Aktif' : 'Nonaktif'}.`,
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal mengubah status item.';
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center border border-brand-500/20">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Master Data Item</h1>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                Katalog Pekerjaan & Material
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Pustaka item pekerjaan dan material standar yang dapat dipilih saat pembuatan SPH
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-semibold rounded-xl shadow-sm shadow-brand-600/30 transition-all hover:scale-[1.01]"
        >
          <Plus className="w-4 h-4" />
          Tambah Item Master
        </button>
      </div>

      {/* Feedback Toast Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm animate-in fade-in duration-200 ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
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
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
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
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-brand-500 outline-none"
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
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-brand-500 outline-none"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Aktif Saja</option>
            <option value="INACTIVE">Nonaktif Saja</option>
          </select>

          <button
            onClick={() => refetch()}
            title="Muat ulang data"
            className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-medium">Memuat data katalog item master...</p>
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-slate-500">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">Gagal memuat katalog item</p>
            <p className="text-xs text-slate-400 mt-1">Silakan periksa koneksi atau coba muat ulang.</p>
            <button
              onClick={() => refetch()}
              className="mt-3 px-4 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
            >
              Coba Lagi
            </button>
          </div>
        ) : !data || data.content.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-700">Belum ada item master</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchTerm || categoryFilter || statusFilter !== 'ALL'
                ? 'Tidak ada item yang cocok dengan kriteria pencarian dan filter.'
                : 'Mulai tambahkan uraian pekerjaan atau material ke master data item.'}
            </p>
            {!searchTerm && !categoryFilter && (
              <button
                onClick={handleOpenCreateModal}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-700"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Item Sekarang
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Kode</th>
                  <th className="py-3.5 px-4">Nama Item / Uraian Pekerjaan</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Satuan</th>
                  <th className="py-3.5 px-4 text-right">Harga Default</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {data.content.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Code */}
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500 font-semibold">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        {item.code || '-'}
                      </span>
                    </td>

                    {/* Name & Description */}
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="font-medium text-slate-900 leading-snug">{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.description}</div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      {item.category ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                          <Layers className="w-3 h-3 text-slate-400" />
                          {item.category}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>

                    {/* Unit */}
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200/50">
                        {item.defaultUnit}
                      </span>
                    </td>

                    {/* Default Price */}
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-900">
                      {formatRupiah(item.defaultPrice)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => toggleStatusMutation.mutate({ id: item.id, active: !item.active })}
                        disabled={toggleStatusMutation.isPending}
                        title={`Klik untuk ${item.active ? 'menonaktifkan' : 'mengaktifkan'}`}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          item.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
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
                        className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
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
          <div className="bg-slate-50/80 px-4 py-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <div>
              Menampilkan {data.number * data.size + 1} -{' '}
              {Math.min((data.number + 1) * data.size, data.totalElements)} dari {data.totalElements} item
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={data.first}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
              </button>
              <span className="px-3 py-1 font-semibold text-slate-700">
                {data.number + 1} / {data.totalPages}
              </span>
              <button
                disabled={data.last}
                onClick={() => setPage((p) => p + 1)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium"
              >
                Berikutnya <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

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

import React, { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Building,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Paperclip,
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  FileText,
  Calculator,
  ExternalLink
} from 'lucide-react';
import { kegiatanApi } from '../api/kegiatanApi';
import { attachmentApi } from '../api/attachmentApi';
import { KegiatanModal } from '../components/kegiatan/KegiatanModal';
import { KegiatanItemModal } from '../components/kegiatan/KegiatanItemModal';
import { KegiatanItem, KegiatanItemInput, UpdateKegiatanInput, KegiatanStatus } from '../types/kegiatan';
import { Attachment } from '../types/attachment';
import { formatRupiah } from '../lib/utils';

export const KegiatanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const kegiatanId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KegiatanItem | null>(null);
  const [activeTab, setActiveTab] = useState<'items' | 'attachments' | 'documents'>('items');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch Kegiatan Detail (including items)
  const {
    data: kegiatan,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['kegiatan', kegiatanId],
    queryFn: () => kegiatanApi.getKegiatanById(kegiatanId),
    enabled: !isNaN(kegiatanId),
  });

  // Fetch Attachments
  const {
    data: attachments = [],
    isLoading: isAttachmentsLoading,
  } = useQuery({
    queryKey: ['attachments', 'KEGIATAN', kegiatanId],
    queryFn: () => attachmentApi.getAttachments('KEGIATAN', kegiatanId),
    enabled: !isNaN(kegiatanId),
  });

  // Update Kegiatan Header Mutation
  const updateMutation = useMutation({
    mutationFn: (input: UpdateKegiatanInput) => kegiatanApi.updateKegiatan(kegiatanId, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['kegiatan', kegiatanId] });
      queryClient.invalidateQueries({ queryKey: ['kegiatan'] });
      setIsEditModalOpen(false);
      setFeedbackMessage({
        type: 'success',
        text: `Data kegiatan '${data.name}' berhasil diperbarui.`,
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal memperbarui kegiatan.';
      setFeedbackMessage({ type: 'error', text: msg });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: KegiatanStatus) => kegiatanApi.updateStatus(kegiatanId, newStatus),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['kegiatan', kegiatanId] });
      queryClient.invalidateQueries({ queryKey: ['kegiatan'] });
      setFeedbackMessage({
        type: 'success',
        text: `Status kegiatan diubah menjadi ${data.status}.`,
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal mengubah status kegiatan.';
      setFeedbackMessage({ type: 'error', text: msg });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
  });

  // Add Item Mutation
  const addItemMutation = useMutation({
    mutationFn: (data: KegiatanItemInput) => kegiatanApi.addItem(kegiatanId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kegiatan', kegiatanId] });
      queryClient.invalidateQueries({ queryKey: ['kegiatan'] });
      setIsItemModalOpen(false);
      setSelectedItem(null);
      setFeedbackMessage({
        type: 'success',
        text: 'Item pekerjaan berhasil ditambahkan dan total nilai dihitung ulang.',
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal menambahkan item pekerjaan.';
      setFeedbackMessage({ type: 'error', text: msg });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
  });

  // Update Item Mutation
  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, data }: { itemId: number; data: KegiatanItemInput }) =>
      kegiatanApi.updateItem(kegiatanId, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kegiatan', kegiatanId] });
      queryClient.invalidateQueries({ queryKey: ['kegiatan'] });
      setIsItemModalOpen(false);
      setSelectedItem(null);
      setFeedbackMessage({
        type: 'success',
        text: 'Item pekerjaan berhasil diperbarui.',
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal memperbarui item pekerjaan.';
      setFeedbackMessage({ type: 'error', text: msg });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
  });

  // Delete Item Mutation
  const deleteItemMutation = useMutation({
    mutationFn: (itemId: number) => kegiatanApi.deleteItem(kegiatanId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kegiatan', kegiatanId] });
      queryClient.invalidateQueries({ queryKey: ['kegiatan'] });
      setFeedbackMessage({
        type: 'success',
        text: 'Item berhasil dihapus dan total nilai kegiatan dihitung ulang.',
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal menghapus item pekerjaan.';
      setFeedbackMessage({ type: 'error', text: msg });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
  });

  // Upload Attachment Mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => attachmentApi.uploadAttachment(file, 'KEGIATAN', kegiatanId),
    onSuccess: (newAttachment) => {
      queryClient.invalidateQueries({ queryKey: ['attachments', 'KEGIATAN', kegiatanId] });
      setFeedbackMessage({
        type: 'success',
        text: `Berkas '${newAttachment.originalFilename}' berhasil diunggah.`,
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal mengunggah berkas. Maks 10MB.';
      setFeedbackMessage({ type: 'error', text: msg });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
  });

  // Delete Attachment Mutation
  const deleteAttachmentMutation = useMutation({
    mutationFn: (attId: number) => attachmentApi.deleteAttachment(attId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', 'KEGIATAN', kegiatanId] });
      setFeedbackMessage({
        type: 'success',
        text: 'Berkas lampiran berhasil dihapus.',
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal menghapus lampiran.';
      setFeedbackMessage({ type: 'error', text: msg });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > 10 * 1024 * 1024) {
        setFeedbackMessage({ type: 'error', text: 'Ukuran file melebihi batas 10 MB.' });
        return;
      }
      uploadMutation.mutate(file);
    }
  };

  const handleItemSubmit = async (data: KegiatanItemInput) => {
    if (selectedItem) {
      await updateItemMutation.mutateAsync({ itemId: selectedItem.id, data });
    } else {
      await addItemMutation.mutateAsync(data);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Memuat detail data kegiatan...</p>
      </div>
    );
  }

  if (isError || !kegiatan) {
    return (
      <div className="py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Kegiatan Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          Data kegiatan dengan ID {id} tidak tersedia atau telah dihapus.
        </p>
        <Link
          to="/kegiatan"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Kegiatan</span>
        </Link>
      </div>
    );
  }

  const items = kegiatan.items || [];

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/kegiatan')}
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition shadow-sm"
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                {kegiatan.code}
              </span>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                {kegiatan.name}
              </h1>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <Link
                to={`/customers/${kegiatan.customerId}`}
                className="hover:text-indigo-600 hover:underline flex items-center gap-1 font-medium text-slate-600"
              >
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{kegiatan.customerName}</span>
                {kegiatan.customerCompanyName && <span>({kegiatan.customerCompanyName})</span>}
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>
              {kegiatan.location && (
                <span className="flex items-center gap-1 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{kegiatan.location}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons & Status Selector */}
        <div className="flex items-center gap-2.5">
          <select
            value={kegiatan.status}
            onChange={(e) => updateStatusMutation.mutate(e.target.value as KegiatanStatus)}
            disabled={updateStatusMutation.isPending}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="PLANNED">Direncanakan (PLANNED)</option>
            <option value="ACTIVE">Sedang Berjalan (ACTIVE)</option>
            <option value="COMPLETED">Selesai (COMPLETED)</option>
            <option value="CLOSED">Ditutup (CLOSED)</option>
            <option value="CANCELLED">Dibatalkan (CANCELLED)</option>
          </select>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-xl hover:bg-slate-50 shadow-sm transition"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Data</span>
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

      {/* Financial Highlight Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              <span>Total Nilai Kegiatan (Authoritative Backend Sum)</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1.5 text-white font-mono">
              {formatRupiah(kegiatan.totalAmount)}
            </div>
            <p className="text-xs text-slate-300 mt-2 max-w-xl leading-relaxed">
              Total nilai dihitung secara mutlak di backend dari penjumlahan rincian seluruh item pekerjaan: <span className="font-mono font-semibold text-white">Σ (Volume × Harga Satuan)</span>.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 text-xs text-indigo-100 shrink-0 sm:w-60">
            <div className="font-semibold text-white mb-2">Informasi Rincian</div>
            <div className="flex justify-between py-1 border-b border-white/10">
              <span className="text-indigo-200">Jumlah Item:</span>
              <span className="font-bold text-white">{items.length} item</span>
            </div>
            <div className="flex justify-between py-1 pt-1.5">
              <span className="text-indigo-200">Status Proyek:</span>
              <span className="font-semibold text-emerald-400">{kegiatan.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-3">
          <button
            onClick={() => setActiveTab('items')}
            className={`flex items-center space-x-2 py-3 px-4 font-semibold text-sm border-b-2 transition ${
              activeTab === 'items'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Rincian Item Pekerjaan ({items.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('attachments')}
            className={`flex items-center space-x-2 py-3 px-4 font-semibold text-sm border-b-2 transition ${
              activeTab === 'attachments'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Paperclip className="w-4 h-4" />
            <span>Lampiran & Berkas Dokumen ({attachments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center space-x-2 py-3 px-4 font-semibold text-sm border-b-2 transition ${
              activeTab === 'documents'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Penawaran & Faktur Terkait</span>
          </button>
        </div>

        <div className="p-6">
          {/* TAB 1: ITEM PEKERJAAN */}
          {activeTab === 'items' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Daftar Item & Rincian Nilai</h3>
                  <p className="text-xs text-slate-500">
                    Setiap perubahan volume atau harga satuan langsung memperbarui total nilai kegiatan.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    setIsItemModalOpen(true);
                  }}
                  className="inline-flex items-center space-x-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Item Pekerjaan</span>
                </button>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <th className="py-3 px-3 text-center w-12">No</th>
                      <th className="py-3 px-4">Deskripsi / Uraian Pekerjaan</th>
                      <th className="py-3 px-4 text-center">Volume</th>
                      <th className="py-3 px-4 text-center">Satuan</th>
                      <th className="py-3 px-4 text-right">Harga Satuan</th>
                      <th className="py-3 px-4 text-right">Subtotal</th>
                      <th className="py-3 px-4 text-center w-24">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-slate-400">
                          <Calculator className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="font-medium text-slate-600">Belum ada item rincian pekerjaan</p>
                          <p className="text-[11px] text-slate-400">
                            Klik tombol "Tambah Item Pekerjaan" untuk mulai memasukkan rincian.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-3 text-center text-slate-400 font-mono">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-slate-800 block">
                              {item.description}
                            </span>
                            {item.notes && (
                              <span className="text-[11px] text-slate-400 block mt-0.5">
                                Catatan: {item.notes}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-medium text-slate-700">
                            {item.volume}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200 text-[11px]">
                              {item.unit}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-700">
                            {formatRupiah(item.unitPrice)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            {formatRupiah(item.subtotal)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => {
                                  setSelectedItem(item);
                                  setIsItemModalOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                                title="Edit Item"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Hapus item '${item.description}'?`)) {
                                    deleteItemMutation.mutate(item.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Hapus Item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {items.length > 0 && (
                    <tfoot>
                      <tr className="bg-slate-50/90 font-semibold text-xs border-t-2 border-slate-200">
                        <td colSpan={5} className="py-3 px-4 text-right text-slate-600 uppercase tracking-wider">
                          Total Nilai Kegiatan:
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-sm font-bold text-indigo-900">
                          {formatRupiah(kegiatan.totalAmount)}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: LAMPIRAN & BERKAS */}
          {activeTab === 'attachments' && (
            <div className="space-y-6">
              {/* Upload Box */}
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-indigo-400 transition group">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
                  disabled={uploadMutation.isPending}
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-3 bg-white rounded-full shadow-sm text-indigo-600 group-hover:scale-110 transition">
                    {uploadMutation.isPending ? (
                      <div className="w-6 h-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadMutation.isPending}
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                      Pilih berkas untuk diunggah
                    </button>
                    <span className="text-sm text-slate-500"> (Dokumen proyek, SPK, RAB, foto lapangan)</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Maksimal 10 MB per berkas (PDF, Gambar, Word, Excel)
                  </p>
                </div>
              </div>

              {/* Attachments List */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-700">Berkas Lampiran Kegiatan</h3>
                {isAttachmentsLoading ? (
                  <div className="py-8 text-center text-xs text-slate-400">Memuat daftar lampiran...</div>
                ) : attachments.length === 0 ? (
                  <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-slate-100 text-slate-400">
                    <Paperclip className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs">Belum ada berkas lampiran yang diunggah untuk kegiatan ini.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {attachments.map((att: Attachment) => (
                      <div
                        key={att.id}
                        className="bg-white border border-slate-200/90 rounded-xl p-3.5 flex items-center justify-between hover:shadow-sm transition"
                      >
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-medium text-slate-800 truncate" title={att.originalFilename}>
                              {att.originalFilename}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                              <span>{formatFileSize(att.sizeBytes)}</span>
                              <span>•</span>
                              <span>{new Date(att.createdAt).toLocaleDateString('id-ID')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0 ml-2">
                          <a
                            href={attachmentApi.getDownloadUrl(att.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Unduh Berkas"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus lampiran '${att.originalFilename}'?`)) {
                                deleteAttachmentMutation.mutate(att.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Berkas"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PENAWARAN & FAKTUR */}
          {activeTab === 'documents' && (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700 text-sm">Integrasi Penawaran & Faktur</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Kegiatan dan rincian item ini siap dipanggil saat pembuatan Penawaran (Fase 5) dan penagihan Faktur Penjualan (Fase 6).
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Kegiatan Modal */}
      <KegiatanModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={async (data) => {
          await updateMutation.mutateAsync(data as UpdateKegiatanInput);
        }}
        kegiatan={kegiatan}
        isLoading={updateMutation.isPending}
      />

      {/* Add / Edit Item Modal */}
      <KegiatanItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={handleItemSubmit}
        item={selectedItem}
        isLoading={addItemMutation.isPending || updateItemMutation.isPending}
      />
    </div>
  );
};

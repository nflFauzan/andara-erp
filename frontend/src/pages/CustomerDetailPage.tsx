import React, { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  User as UserIcon,
  Wallet,
  Calendar,
  Clock,
  Paperclip,
  Upload,
  Download,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Layers
} from 'lucide-react';
import { customerApi } from '../api/customerApi';
import { attachmentApi } from '../api/attachmentApi';
import { kegiatanApi } from '../api/kegiatanApi';
import { CustomerModal } from '../components/customer/CustomerModal';
import { KegiatanModal } from '../components/kegiatan/KegiatanModal';
import { Attachment } from '../types/attachment';
import { UpdateCustomerInput } from '../types/customer';
import { CreateKegiatanInput, Kegiatan } from '../types/kegiatan';
import { formatRupiah } from '../lib/utils';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const customerId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateKegiatanOpen, setIsCreateKegiatanOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'attachments' | 'activities'>('attachments');

  // Fetch Customer
  const {
    data: customer,
    isLoading: isCustomerLoading,
    isError: isCustomerError,
  } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customerApi.getCustomerById(customerId),
    enabled: !isNaN(customerId),
  });

  // Fetch Attachments
  const {
    data: attachments = [],
    isLoading: isAttachmentsLoading,
  } = useQuery({
    queryKey: ['attachments', 'CUSTOMER', customerId],
    queryFn: () => attachmentApi.getAttachments('CUSTOMER', customerId),
    enabled: !isNaN(customerId),
  });

  // Fetch Kegiatan for this customer
  const {
    data: customerKegiatan = [],
    isLoading: isKegiatanLoading,
  } = useQuery({
    queryKey: ['kegiatan-by-customer', customerId],
    queryFn: () => kegiatanApi.getKegiatanByCustomer(customerId),
    enabled: !isNaN(customerId),
  });

  // Create Kegiatan mutation
  const createKegiatanMutation = useMutation({
    mutationFn: (newKegiatan: CreateKegiatanInput) => kegiatanApi.createKegiatan(newKegiatan),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['kegiatan-by-customer', customerId] });
      queryClient.invalidateQueries({ queryKey: ['kegiatan'] });
      setIsCreateKegiatanOpen(false);
      setFeedbackMessage({
        type: 'success',
        text: `Kegiatan '${data.name}' (${data.code}) berhasil dibuat.`,
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal membuat kegiatan.';
      setFeedbackMessage({ type: 'error', text: msg });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
  });

  // Update customer mutation
  const updateMutation = useMutation({
    mutationFn: (input: UpdateCustomerInput) => customerApi.updateCustomer(customerId, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsEditModalOpen(false);
      setFeedbackMessage({
        type: 'success',
        text: `Data customer '${data.name}' berhasil diperbarui.`,
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal memperbarui profil customer.';
      setFeedbackMessage({ type: 'error', text: msg });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (active: boolean) => customerApi.toggleCustomerStatus(customerId, active),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setFeedbackMessage({
        type: 'success',
        text: `Status customer diubah menjadi ${data.active ? 'Aktif' : 'Nonaktif'}.`,
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal mengubah status customer.';
      setFeedbackMessage({ type: 'error', text: msg });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
  });

  // Upload attachment mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => attachmentApi.uploadAttachment(file, 'CUSTOMER', customerId),
    onSuccess: (newAttachment) => {
      queryClient.invalidateQueries({ queryKey: ['attachments', 'CUSTOMER', customerId] });
      setFeedbackMessage({
        type: 'success',
        text: `Berkas '${newAttachment.originalFilename}' berhasil diunggah.`,
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal mengunggah berkas. Pastikan ukuran < 10MB.';
      setFeedbackMessage({ type: 'error', text: msg });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
  });

  // Delete attachment mutation
  const deleteAttachmentMutation = useMutation({
    mutationFn: (attId: number) => attachmentApi.deleteAttachment(attId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', 'CUSTOMER', customerId] });
      setFeedbackMessage({
        type: 'success',
        text: 'Berkas lampiran berhasil dihapus.',
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal menghapus berkas.';
      setFeedbackMessage({ type: 'error', text: msg });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > 10 * 1024 * 1024) {
        setFeedbackMessage({ type: 'error', text: 'Ukuran file melebihi batas maksimal 10 MB.' });
        return;
      }
      uploadMutation.mutate(file);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isCustomerLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Memuat profil customer...</p>
      </div>
    );
  }

  if (isCustomerError || !customer) {
    return (
      <div className="py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Customer Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          Data customer dengan ID {id} tidak tersedia atau telah dihapus.
        </p>
        <Link
          to="/customers"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Customer</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/customers')}
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition shadow-sm"
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                {customer.code}
              </span>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                {customer.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  customer.active
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    customer.active ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                />
                {customer.active ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
            {customer.companyName && (
              <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{customer.companyName}</span>
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-sm font-semibold rounded-xl hover:bg-slate-50 shadow-sm transition"
          >
            <Edit2 className="w-4 h-4 text-slate-500" />
            <span>Edit Profil</span>
          </button>
          <button
            onClick={() => toggleStatusMutation.mutate(!customer.active)}
            disabled={toggleStatusMutation.isPending}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl transition shadow-sm ${
              customer.active
                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            {customer.active ? (
              <>
                <XCircle className="w-4 h-4" />
                <span>Nonaktifkan</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Aktifkan</span>
              </>
            )}
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

      {/* Highlight Card: Saldo Deposit Customer */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider">
              <Wallet className="w-4 h-4" />
              <span>Saldo Deposit Pelanggan (Customer Deposit Balance)</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1.5 text-white">
              {formatRupiah(customer.depositBalance)}
            </div>
            <p className="text-xs text-indigo-200/80 mt-2 max-w-xl leading-relaxed">
              Saldo deposit bersumber dari kelebihan pembayaran (overpayment) atau alokasi deposit. Saldo ini dilindungi secara mutlak dan hanya dapat bermutasi melalui transaksi ledger pembayaran resmi.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 text-xs text-indigo-100 shrink-0 sm:w-60">
            <div className="font-semibold text-white mb-1">Status Keuangan</div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`w-2 h-2 rounded-full ${customer.depositBalance > 0 ? 'bg-emerald-400' : 'bg-slate-400'}`} />
              <span>{customer.depositBalance > 0 ? 'Tersedia Saldo Deposit' : 'Tidak Ada Saldo Deposit'}</span>
            </div>
            <div className="text-[11px] text-indigo-200/70 mt-1">
              Dapat digunakan otomatis saat pelunasan faktur berikutnya.
            </div>
          </div>
        </div>
      </div>

      {/* Customer Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Identitas & Kontak */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-indigo-600" />
            <span>Kontak & PIC</span>
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-slate-400 block">Person In Charge (PIC)</span>
              <span className="font-medium text-slate-800">{customer.picName || '-'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Nomor Telepon / WhatsApp</span>
              <span className="font-medium text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {customer.phone || '-'}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Alamat Email</span>
              <span className="font-medium text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {customer.email || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Alamat & Catatan */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <span>Lokasi & Catatan</span>
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-slate-400 block">Alamat Korespondensi</span>
              <p className="font-medium text-slate-800 leading-snug mt-0.5">{customer.address || '-'}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Catatan Tambahan</span>
              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1">
                {customer.notes || 'Tidak ada catatan khusus.'}
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Jejak Audit */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Jejak Audit</span>
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-slate-400 block">Dibuat Pada</span>
              <span className="font-medium text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(customer.createdAt).toLocaleString('id-ID')}
              </span>
              {customer.createdBy && (
                <span className="text-xs text-slate-400">oleh: {customer.createdBy}</span>
              )}
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Terakhir Diperbarui</span>
              <span className="font-medium text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {new Date(customer.updatedAt).toLocaleString('id-ID')}
              </span>
              {customer.updatedBy && (
                <span className="text-xs text-slate-400">oleh: {customer.updatedBy}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-3">
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
            onClick={() => setActiveTab('activities')}
            className={`flex items-center space-x-2 py-3 px-4 font-semibold text-sm border-b-2 transition ${
              activeTab === 'activities'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Kegiatan & Riwayat Transaksi</span>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'attachments' ? (
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
                    <span className="text-sm text-slate-500"> atau tarik berkas ke area ini</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Mendukung format PDF, PNG, JPG, DOCX, XLSX (Maksimal 10 MB per file)
                  </p>
                </div>
              </div>

              {/* Attachments List */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-700">Daftar Dokumen Tersimpan</h3>
                {isAttachmentsLoading ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Memuat daftar lampiran...
                  </div>
                ) : attachments.length === 0 ? (
                  <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-slate-100 text-slate-400">
                    <Paperclip className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs">Belum ada berkas lampiran yang diunggah untuk pelanggan ini.</p>
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
                            <p
                              className="text-sm font-medium text-slate-800 truncate"
                              title={att.originalFilename}
                            >
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
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Daftar Kegiatan Customer</h3>
                  <p className="text-xs text-slate-500">
                    Proyek dan pekerjaan aktif yang terkait langsung dengan pelanggan ini.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateKegiatanOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Tambah Kegiatan</span>
                </button>
              </div>

              {isKegiatanLoading ? (
                <div className="py-8 text-center text-xs text-slate-400">Memuat data kegiatan...</div>
              ) : customerKegiatan.length === 0 ? (
                <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-slate-100 text-slate-400">
                  <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs">Belum ada kegiatan yang didaftarkan untuk customer ini.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {customerKegiatan.map((k: Kegiatan) => (
                    <div
                      key={k.id}
                      className="p-4 bg-white hover:bg-slate-50 flex items-center justify-between transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                            {k.code}
                          </span>
                          <Link
                            to={`/kegiatan/${k.id}`}
                            className="font-medium text-sm text-slate-800 hover:text-indigo-600 hover:underline"
                          >
                            {k.name}
                          </Link>
                          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {k.status}
                          </span>
                        </div>
                        {k.location && (
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{k.location}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0 ml-4">
                        <div className="font-mono font-bold text-sm text-slate-900">
                          {formatRupiah(k.totalAmount)}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {k.itemsCount} rincian item
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Kegiatan Modal */}
      <KegiatanModal
        isOpen={isCreateKegiatanOpen}
        onClose={() => setIsCreateKegiatanOpen(false)}
        onSubmit={async (data) => {
          await createKegiatanMutation.mutateAsync(data as CreateKegiatanInput);
        }}
        defaultCustomerId={customerId}
        isLoading={createKegiatanMutation.isPending}
      />

      {/* Edit Customer Modal */}
      <CustomerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={async (data) => {
          await updateMutation.mutateAsync(data);
        }}
        customer={customer}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
};

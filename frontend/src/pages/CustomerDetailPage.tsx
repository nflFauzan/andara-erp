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
import { penawaranApi } from '../api/penawaranApi';
import { CustomerModal } from '../components/customer/CustomerModal';
import { KegiatanModal } from '../components/kegiatan/KegiatanModal';
import { Attachment } from '../types/attachment';
import { CreateKegiatanInput, Kegiatan } from '../types/kegiatan';
import { Penawaran } from '../types/penawaran';
import { formatRupiah } from '../lib/utils';
import { BentoCard } from '@/components/common/BentoCard';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';

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
  const [activeTab, setActiveTab] = useState<'sph' | 'activities' | 'attachments'>('sph');

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

  // Fetch SPH (Penawaran) for this customer
  const {
    data: customerPenawaran = [],
    isLoading: isPenawaranLoading,
  } = useQuery({
    queryKey: ['penawaran-by-customer', customerId],
    queryFn: () => penawaranApi.getPenawaranByCustomerId(customerId),
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
      const msg = error.response?.data?.message || 'Gagal membuat kegiatan baru.';
      setFeedbackMessage({ type: 'error', text: msg });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
  });

  // Update customer mutation
  const updateMutation = useMutation({
    mutationFn: (input: any) => customerApi.updateCustomer(customerId, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsEditModalOpen(false);
      setFeedbackMessage({
        type: 'success',
        text: `Profil customer '${data.name}' berhasil diperbarui.`,
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
        text: `Customer ${data.name} kini ${data.active ? 'Aktif' : 'Nonaktif'}.`,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', 'CUSTOMER', customerId] });
      setFeedbackMessage({ type: 'success', text: 'Berkas lampiran berhasil diunggah.' });
      setTimeout(() => setFeedbackMessage(null), 4000);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal mengunggah berkas.';
      setFeedbackMessage({ type: 'error', text: msg });
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
  });

  // Delete attachment mutation
  const deleteAttachmentMutation = useMutation({
    mutationFn: (attachmentId: number) => attachmentApi.deleteAttachment(attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', 'CUSTOMER', customerId] });
      setFeedbackMessage({ type: 'success', text: 'Berkas lampiran berhasil dihapus.' });
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
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Memuat profil customer...</p>
      </div>
    );
  }

  if (isCustomerError || !customer) {
    return (
      <BentoCard className="max-w-xl mx-auto py-16 text-center space-y-3">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Customer Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Data customer dengan ID {id} tidak tersedia atau telah dihapus.
        </p>
        <Link
          to="/customers"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl text-xs font-bold shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Customer</span>
        </Link>
      </BentoCard>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Navigation & Actions */}
      <PageHeader
        icon={Building2}
        backUrl="/customers"
        title={customer.name}
        subtitle={customer.companyName ? customer.companyName : `Kode Pelanggan: ${customer.code}`}
        badge={
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-md border border-brand-500/20">
              {customer.code}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                customer.active
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${customer.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              {customer.active ? 'Aktif' : 'Nonaktif'}
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/penawaran/create?customerId=${customer.id}`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/25 transition"
            >
              <FileText className="w-4 h-4" />
              <span>+ Buat SPH</span>
            </button>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl shadow-xs transition"
            >
              <Edit2 className="w-4 h-4 text-amber-500" />
              <span>Edit Profil</span>
            </button>
            <button
              onClick={() => toggleStatusMutation.mutate(!customer.active)}
              disabled={toggleStatusMutation.isPending}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition shadow-xs ${
                customer.active
                  ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/30'
                  : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
              }`}
            >
              {customer.active ? (
                <>
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <span>Nonaktifkan</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Aktifkan</span>
                </>
              )}
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

      {/* Highlight Card: Saldo Deposit Customer */}
      <div className="bg-neu-surface dark:bg-slate-900 border border-neu-border dark:border-blue-900/40 rounded-3xl p-6 text-slate-900 dark:text-white shadow-neu-convex-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-brand-300 text-xs font-bold uppercase tracking-wider">
              <Wallet className="w-4 h-4 text-blue-600 dark:text-amber-400" />
              <span>Saldo Deposit Pelanggan (Customer Deposit Balance)</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight mt-2 text-blue-600 dark:text-amber-400">
              {formatRupiah(customer.depositBalance)}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 max-w-xl leading-relaxed font-medium">
              Saldo deposit bersumber dari kelebihan pembayaran (overpayment) atau alokasi deposit. Saldo ini dilindungi secara mutlak dan hanya dapat bermutasi melalui transaksi ledger pembayaran resmi (AGENTS.md §10.4).
            </p>
          </div>
          <div className="bg-neu-canvas/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-neu-border dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 shrink-0 sm:w-60 shadow-neu-inset-xs">
            <div className="font-bold text-slate-900 dark:text-white mb-1">Status Keuangan</div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`w-2 h-2 rounded-full ${customer.depositBalance > 0 ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span className="font-semibold">{customer.depositBalance > 0 ? 'Tersedia Saldo Deposit' : 'Tidak Ada Saldo Deposit'}</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Dapat digunakan otomatis saat pelunasan faktur berikutnya.
            </div>
          </div>
        </div>
      </div>

      {/* Customer Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Identitas & Kontak */}
        <BentoCard className="p-5 space-y-3.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-brand-500" />
            <span>Kontak & PIC</span>
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-slate-400 block">Person In Charge (PIC)</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{customer.picName || '-'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Nomor Telepon / WhatsApp</span>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {customer.phone || '-'}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Alamat Email</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {customer.email || '-'}
              </span>
            </div>
          </div>
        </BentoCard>

        {/* Card 2: Alamat & Catatan */}
        <BentoCard className="p-5 space-y-3.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-500" />
            <span>Lokasi & Catatan</span>
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-slate-400 block">Alamat Korespondensi</span>
              <p className="font-medium text-slate-800 dark:text-slate-200 leading-snug mt-0.5">{customer.address || '-'}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Catatan Tambahan</span>
              <p className="text-xs text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 mt-1">
                {customer.notes || 'Tidak ada catatan khusus.'}
              </p>
            </div>
          </div>
        </BentoCard>

        {/* Card 3: Jejak Audit */}
        <BentoCard className="p-5 space-y-3.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-500" />
            <span>Jejak Audit</span>
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-slate-400 block">Dibuat Pada</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(customer.createdAt).toLocaleString('id-ID')}
              </span>
              {customer.createdBy && (
                <span className="text-xs text-slate-400">oleh: {customer.createdBy}</span>
              )}
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Terakhir Diperbarui</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {new Date(customer.updatedAt).toLocaleString('id-ID')}
              </span>
              {customer.updatedBy && (
                <span className="text-xs text-slate-400">oleh: {customer.updatedBy}</span>
              )}
            </div>
          </div>
        </BentoCard>
      </div>

      {/* Section Tabs */}
      <BentoCard className="overflow-hidden p-0">
        <div className="flex border-b border-slate-200/80 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 px-6 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('sph')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs border-b-2 transition shrink-0 ${
              activeTab === 'sph'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-white dark:bg-slate-800 rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Surat Penawaran Harga (SPH) ({customerPenawaran.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs border-b-2 transition shrink-0 ${
              activeTab === 'activities'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-white dark:bg-slate-800 rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Kegiatan & Riwayat ({customerKegiatan.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('attachments')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs border-b-2 transition shrink-0 ${
              activeTab === 'attachments'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-white dark:bg-slate-800 rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Paperclip className="w-4 h-4" />
            <span>Lampiran & Berkas ({attachments.length})</span>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'sph' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Daftar Surat Penawaran Harga (SPH)</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Seluruh dokumen SPH yang dibuat untuk pelanggan ini</p>
                </div>
                <button
                  onClick={() => navigate(`/penawaran/create?customerId=${customerId}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl text-xs font-bold shadow-xs transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>+ Buat SPH Baru</span>
                </button>
              </div>

              {isPenawaranLoading ? (
                <div className="py-12 text-center text-slate-400">
                  <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs font-semibold">Memuat daftar SPH...</p>
                </div>
              ) : customerPenawaran.length === 0 ? (
                <div className="py-12 text-center bg-white/40 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6">
                  <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum ada SPH untuk pelanggan ini</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Buat Surat Penawaran Harga pertama dengan rincian kegiatan dan item pekerjaan untuk diajukan ke pelanggan.
                  </p>
                  <button
                    onClick={() => navigate(`/penawaran/create?customerId=${customerId}`)}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl text-xs font-bold shadow-sm transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Buat SPH Sekarang</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden">
                  {customerPenawaran.map((sph: Penawaran) => (
                    <div
                      key={sph.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                            {sph.number}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(sph.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                          </span>
                          <StatusBadge status={sph.status} />
                        </div>
                        {sph.notes && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">{sph.notes}</p>
                        )}
                        <p className="text-[11px] text-slate-400">
                          {sph.itemCount || (sph.details ? sph.details.length : 0)} rincian item
                        </p>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total SPH</span>
                          <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                            {formatRupiah(sph.totalAmount)}
                          </span>
                        </div>
                        <Link
                          to={`/penawaran/${sph.id}`}
                          className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-brand-600 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl shadow-xs transition"
                        >
                          Lihat Detail
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="space-y-6">
              {/* Upload Box */}
              <div className="bg-white/40 dark:bg-slate-900/40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center hover:border-brand-500 transition group">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
                  disabled={uploadMutation.isPending}
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-xs text-brand-500 group-hover:scale-110 transition border border-slate-200/80 dark:border-slate-700">
                    {uploadMutation.isPending ? (
                      <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadMutation.isPending}
                      className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      Pilih berkas untuk diunggah
                    </button>
                    <span className="text-xs text-slate-500 dark:text-slate-400"> atau tarik berkas ke area ini</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Mendukung format PDF, PNG, JPG, DOCX, XLSX (Maksimal 10 MB per file)
                  </p>
                </div>
              </div>

              {/* Attachments List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Daftar Dokumen Tersimpan</h3>
                {isAttachmentsLoading ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Memuat daftar lampiran...
                  </div>
                ) : attachments.length === 0 ? (
                  <div className="py-8 text-center bg-white/40 dark:bg-slate-900/40 rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-400">
                    <Paperclip className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-xs">Belum ada berkas lampiran yang diunggah untuk pelanggan ini.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {attachments.map((att: Attachment) => (
                      <div
                        key={att.id}
                        className="bg-white/60 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-3.5 flex items-center justify-between hover:shadow-xs transition"
                      >
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <div className="p-2.5 bg-brand-500/10 text-brand-500 rounded-xl shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="overflow-hidden">
                            <p
                              className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate"
                              title={att.originalFilename}
                            >
                              {att.originalFilename}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
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
                            className="p-1.5 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition"
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
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition"
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

          {activeTab === 'activities' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Daftar Kegiatan Customer</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Proyek dan pekerjaan aktif yang terkait langsung dengan pelanggan ini.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateKegiatanOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-brand-600 to-brand-500 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Tambah Kegiatan</span>
                </button>
              </div>

              {isKegiatanLoading ? (
                <div className="py-8 text-center text-xs text-slate-400">Memuat data kegiatan...</div>
              ) : customerKegiatan.length === 0 ? (
                <div className="py-8 text-center bg-white/40 dark:bg-slate-900/40 rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-400">
                  <Layers className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs">Belum ada kegiatan yang didaftarkan untuk customer ini.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden">
                  {customerKegiatan.map((k: Kegiatan) => (
                    <div
                      key={k.id}
                      className="p-4 bg-white/40 dark:bg-slate-800/40 hover:bg-white/60 dark:hover:bg-slate-800/60 flex items-center justify-between transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded border border-brand-500/20">
                            {k.code}
                          </span>
                          <Link
                            to={`/kegiatan/${k.id}`}
                            className="font-bold text-sm text-slate-800 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 hover:underline"
                          >
                            {k.name}
                          </Link>
                          <StatusBadge status={k.status} />
                        </div>
                        {k.location && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{k.location}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0 ml-4">
                        <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
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
      </BentoCard>

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

export default CustomerDetailPage;

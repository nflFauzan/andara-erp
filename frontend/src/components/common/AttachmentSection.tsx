import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Image as ImageIcon,
  FileSpreadsheet,
  File,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  Paperclip,
} from 'lucide-react';
import { attachmentApi } from '../../api/attachmentApi';
import { Attachment } from '../../types/attachment';

interface AttachmentSectionProps {
  referenceType: string;
  referenceId: number;
  title?: string;
  description?: string;
  readOnly?: boolean;
}

export const AttachmentSection: React.FC<AttachmentSectionProps> = ({
  referenceType,
  referenceId,
  title = 'Berkas Lampiran & Bukti Dokumen',
  description = 'Unggah berkas pendukung, bukti transfer, atau dokumen legalitas resmi (Maksimal 10 MB: PDF, Gambar, Office).',
  readOnly = false,
}) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Attachment | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const queryKey = ['attachments', referenceType, referenceId];

  const { data: attachments = [], isLoading } = useQuery<Attachment[]>({
    queryKey,
    queryFn: () => attachmentApi.getAttachments(referenceType, referenceId),
    enabled: !!referenceId,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => attachmentApi.uploadAttachment(file, referenceType, referenceId),
    onSuccess: (newAtt) => {
      queryClient.invalidateQueries({ queryKey });
      setFeedback({
        type: 'success',
        message: `Berkas "${newAtt.originalFilename}" berhasil diunggah dan disimpan di storage.`,
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setFeedback(null), 4000);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Gagal mengunggah berkas. Periksa format dan ukuran file.';
      setFeedback({ type: 'error', message: msg });
      setTimeout(() => setFeedback(null), 5000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => attachmentApi.deleteAttachment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setFeedback({ type: 'success', message: 'Berkas lampiran berhasil dihapus.' });
      setDeleteTarget(null);
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: (err: any) => {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Gagal menghapus berkas lampiran.',
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (readOnly) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.includes('pdf')) {
      return <FileText className="w-5 h-5 text-rose-500" />;
    }
    if (contentType.includes('image')) {
      return <ImageIcon className="w-5 h-5 text-brand-500" />;
    }
    if (contentType.includes('sheet') || contentType.includes('excel') || contentType.includes('csv')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    }
    return <File className="w-5 h-5 text-slate-500" />;
  };

  return (
    <div className="neu-card p-0 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-neu-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-neu-canvas shadow-neu-inset-xs flex items-center justify-center text-brand-600 dark:text-brand-400 border border-neu-border/40">
            <Paperclip className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">{title}</h3>
              <span className="neu-badge">
                {attachments.length} Berkas
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
          </div>
        </div>

        {!readOnly && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.docx,.xlsx,.doc,.xls"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
              className="neu-btn-primary"
            >
              <Upload className={`w-4 h-4 ${uploadMutation.isPending ? 'animate-bounce' : ''}`} />
              <span>{uploadMutation.isPending ? 'Mengunggah...' : 'Unggah Berkas'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`mx-5 mt-4 p-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/30'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Content Area */}
      <div className="p-5">
        {isLoading ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-slate-300 border-t-brand-600 mb-2" />
            <p>Memuat daftar lampiran...</p>
          </div>
        ) : attachments.length === 0 ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (!readOnly) setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`rounded-2xl p-8 text-center transition bg-neu-canvas shadow-neu-inset-sm border-2 border-dashed ${
              isDragging
                ? 'border-brand-500 bg-brand-50/20'
                : 'border-slate-300/60 dark:border-slate-700/60'
            }`}
          >
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Belum ada berkas lampiran</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {!readOnly
                ? 'Tarik dan letakkan berkas di sini, atau klik tombol "Unggah Berkas" di atas.'
                : 'Tidak ada dokumen bukti yang dilampirkan pada transaksi ini.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-start justify-between p-3.5 bg-neu-surface rounded-xl border border-neu-border shadow-neu-convex-xs hover:shadow-neu-convex-sm transition-all"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 bg-neu-canvas rounded-lg shadow-neu-inset-xs border border-neu-border/50 shrink-0">
                    {getFileIcon(att.contentType)}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate tracking-tight"
                      title={att.originalFilename}
                    >
                      {att.originalFilename}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{formatFileSize(att.sizeBytes)}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(att.createdAt).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    {att.createdBy && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                        <User className="w-3 h-3" />
                        <span>Oleh: {att.createdBy}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <a
                    href={`/api/files/${att.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 bg-neu-surface shadow-neu-convex-xs hover:shadow-neu-convex-sm active:shadow-neu-inset-xs rounded-lg transition border border-neu-border"
                    title="Buka / Unduh Berkas"
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(att)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 bg-neu-surface shadow-neu-convex-xs hover:shadow-neu-convex-sm active:shadow-neu-inset-xs rounded-lg transition border border-neu-border"
                      title="Hapus Berkas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neu-surface rounded-2xl max-w-sm w-full p-6 shadow-neu-convex-lg border border-neu-border">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <span className="p-2.5 bg-rose-500/10 shadow-neu-inset-xs border border-rose-500/20 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm">Hapus Berkas Lampiran</h4>
                <p className="text-[11px] text-slate-400">Konfirmasi penghapusan dokumen</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              Apakah Anda yakin ingin menghapus berkas <strong>{deleteTarget.originalFilename}</strong>? Berkas akan
              dihapus dari penyimpanan Cloudflare R2 / storage server.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteMutation.isPending}
                className="neu-btn"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AttachmentSection;

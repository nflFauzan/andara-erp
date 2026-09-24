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
      setTimeout(() => setFeedback(null), 4000);
    },
  });

  const validateAndUpload = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'Ukuran file melebihi batas maksimal 10 MB.' });
      setTimeout(() => setFeedback(null), 4000);
      return;
    }
    uploadMutation.mutate(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (readOnly) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndUpload(e.dataTransfer.files[0]);
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
      return <FileText className="w-6 h-6 text-rose-500" />;
    }
    if (contentType.includes('image')) {
      return <ImageIcon className="w-6 h-6 text-indigo-500" />;
    }
    if (contentType.includes('sheet') || contentType.includes('excel') || contentType.includes('csv')) {
      return <FileSpreadsheet className="w-6 h-6 text-emerald-600" />;
    }
    return <File className="w-6 h-6 text-slate-500" />;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Paperclip className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">{title}</h3>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                {attachments.length} Berkas
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50"
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
          className={`mx-5 mt-4 p-3 rounded-xl flex items-center gap-2.5 text-xs font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Content Area */}
      <div className="p-5">
        {isLoading ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-slate-200 border-t-indigo-600 mb-2" />
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
            className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50'
                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Belum ada berkas lampiran</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {!readOnly
                ? 'Tarik dan letakkan berkas di sini, atau klik tombol "Unggah Berkas" di atas.'
                : 'Tidak ada dokumen bukti yang dilampirkan pada transaksi ini.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-start justify-between p-3.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 rounded-xl transition group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs shrink-0">
                    {getFileIcon(att.contentType)}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-xs font-bold text-slate-900 truncate tracking-tight"
                      title={att.originalFilename}
                    >
                      {att.originalFilename}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
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

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <a
                    href={`/api/files/${att.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg transition border border-transparent hover:border-slate-200"
                    title="Buka / Unduh Berkas"
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(att)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition border border-transparent hover:border-slate-200"
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <span className="p-2 bg-rose-100 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Hapus Berkas Lampiran</h4>
                <p className="text-[11px] text-slate-400">Konfirmasi penghapusan dokumen</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Apakah Anda yakin ingin menghapus berkas <strong>{deleteTarget.originalFilename}</strong>? Berkas akan
              dihapus dari penyimpanan Cloudflare R2 / storage server.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteMutation.isPending}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg disabled:opacity-50"
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

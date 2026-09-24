import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { X, Layers, Building, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { customerApi } from '../../api/customerApi';
import { Kegiatan, CreateKegiatanInput, UpdateKegiatanInput } from '../../types/kegiatan';

const kegiatanSchema = z.object({
  customerId: z.coerce.number().min(1, 'Pilih customer pemilik kegiatan'),
  code: z.string().min(2, 'Kode kegiatan minimal 2 karakter').max(50, 'Maksimal 50 karakter'),
  name: z.string().min(2, 'Nama kegiatan minimal 2 karakter').max(255, 'Maksimal 255 karakter'),
  location: z.string().max(255, 'Maksimal 255 karakter').optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'CLOSED', 'CANCELLED']),
});

type KegiatanFormData = z.infer<typeof kegiatanSchema>;

interface KegiatanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateKegiatanInput | UpdateKegiatanInput) => Promise<void>;
  kegiatan?: Kegiatan | null;
  defaultCustomerId?: number;
  isLoading?: boolean;
}

export const KegiatanModal: React.FC<KegiatanModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  kegiatan,
  defaultCustomerId,
  isLoading = false,
}) => {
  const isEdit = Boolean(kegiatan);

  // Fetch active customers for dropdown
  const { data: activeCustomers = [] } = useQuery({
    queryKey: ['active-customers'],
    queryFn: () => customerApi.getActiveCustomers(),
    enabled: isOpen,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<KegiatanFormData>({
    resolver: zodResolver(kegiatanSchema),
    defaultValues: {
      customerId: defaultCustomerId || 0,
      code: '',
      name: '',
      location: '',
      description: '',
      notes: '',
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (kegiatan) {
      reset({
        customerId: kegiatan.customerId,
        code: kegiatan.code,
        name: kegiatan.name,
        location: kegiatan.location || '',
        description: kegiatan.description || '',
        notes: kegiatan.notes || '',
        status: kegiatan.status,
      });
    } else {
      reset({
        customerId: defaultCustomerId || (activeCustomers[0]?.id ?? 0),
        code: `ACT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
        name: '',
        location: '',
        description: '',
        notes: '',
        status: 'ACTIVE',
      });
    }
  }, [kegiatan, defaultCustomerId, activeCustomers, reset, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: KegiatanFormData) => {
    if (isEdit) {
      const payload: UpdateKegiatanInput = {
        customerId: Number(data.customerId),
        name: data.name.trim(),
        location: data.location?.trim() || undefined,
        description: data.description?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
        status: data.status,
      };
      await onSubmit(payload);
    } else {
      const payload: CreateKegiatanInput = {
        customerId: Number(data.customerId),
        code: data.code.trim().toUpperCase(),
        name: data.name.trim(),
        location: data.location?.trim() || undefined,
        description: data.description?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
        status: data.status,
      };
      await onSubmit(payload);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {isEdit ? 'Ubah Data Kegiatan' : 'Buat Kegiatan / Proyek Baru'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEdit
                  ? `Mengubah informasi data kegiatan ${kegiatan?.code}`
                  : 'Daftarkan proyek pekerjaan untuk pelanggan CV. Andara'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Customer Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Pilih Customer <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Building className="w-4 h-4" />
                </div>
                <select
                  {...register('customerId')}
                  disabled={isLoading}
                  className={`w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border ${
                    errors.customerId ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition`}
                >
                  <option value={0}>-- Pilih Customer Mitra --</option>
                  {activeCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name} {c.companyName ? `(${c.companyName})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              {errors.customerId && (
                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.customerId.message}
                </p>
              )}
            </div>

            {/* Grid: Kode & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Kode Kegiatan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="misal: ACT-2026-001"
                  {...register('code')}
                  disabled={isLoading || isEdit}
                  className={`w-full px-3.5 py-2 text-sm rounded-lg border uppercase ${
                    errors.code ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition disabled:bg-slate-100 disabled:text-slate-500 font-mono`}
                />
                {errors.code && (
                  <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.code.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Status Kegiatan <span className="text-rose-500">*</span>
                </label>
                <select
                  {...register('status')}
                  disabled={isLoading}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-medium"
                >
                  <option value="PLANNED">Direncanakan (PLANNED)</option>
                  <option value="ACTIVE">Sedang Berjalan (ACTIVE)</option>
                  <option value="COMPLETED">Selesai (COMPLETED)</option>
                  <option value="CLOSED">Ditutup (CLOSED)</option>
                  <option value="CANCELLED">Dibatalkan (CANCELLED)</option>
                </select>
              </div>
            </div>

            {/* Nama Kegiatan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nama Kegiatan / Proyek <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="misal: Renovasi Interior Ruang Rapat Lantai 3"
                {...register('name')}
                disabled={isLoading}
                className={`w-full px-3.5 py-2 text-sm rounded-lg border ${
                  errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Lokasi Pekerjaan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Lokasi Pekerjaan
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="misal: Gedung Menara Thamrin Lt. 5, Jakarta Pusat"
                  {...register('location')}
                  disabled={isLoading}
                  className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Deskripsi / Lingkup Pekerjaan
              </label>
              <textarea
                rows={2}
                placeholder="Penjelasan ringkas mengenai lingkup kegiatan"
                {...register('description')}
                disabled={isLoading}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
              />
            </div>

            {/* Catatan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Catatan Khusus
              </label>
              <textarea
                rows={2}
                placeholder="Ketentuan waktu, akses gedung, atau catatan penting lainnya"
                {...register('notes')}
                disabled={isLoading}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow transition flex items-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>{isEdit ? 'Simpan Perubahan' : 'Buat Kegiatan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

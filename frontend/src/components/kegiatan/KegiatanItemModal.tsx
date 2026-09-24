import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Edit2, AlertCircle, Calculator } from 'lucide-react';
import { KegiatanItem, KegiatanItemInput } from '../../types/kegiatan';
import { formatRupiah } from '../../lib/utils';

const itemSchema = z.object({
  description: z.string().min(2, 'Deskripsi item minimal 2 karakter').max(500, 'Maksimal 500 karakter'),
  volume: z.coerce.number().min(0.01, 'Volume harus lebih besar dari 0'),
  unit: z.string().min(1, 'Satuan wajib diisi').max(50, 'Maksimal 50 karakter'),
  unitPrice: z.coerce.number().min(0, 'Harga satuan tidak boleh negatif'),
  sortOrder: z.coerce.number().optional(),
  notes: z.string().optional().or(z.literal('')),
});

type ItemFormData = z.infer<typeof itemSchema>;

interface KegiatanItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: KegiatanItemInput) => Promise<void>;
  item?: KegiatanItem | null;
  isLoading?: boolean;
}

const COMMON_UNITS = ['m2', 'm3', 'unit', 'paket', 'titik', 'lot', 'hari', 'bulan', 'set', 'btg'];

export const KegiatanItemModal: React.FC<KegiatanItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  item,
  isLoading = false,
}) => {
  const isEdit = Boolean(item);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      description: '',
      volume: 1,
      unit: 'unit',
      unitPrice: 0,
      sortOrder: 1,
      notes: '',
    },
  });

  const watchVolume = watch('volume') || 0;
  const watchUnitPrice = watch('unitPrice') || 0;
  const calculatedSubtotal = Math.max(0, watchVolume * watchUnitPrice);

  useEffect(() => {
    if (item) {
      reset({
        description: item.description,
        volume: item.volume,
        unit: item.unit,
        unitPrice: item.unitPrice,
        sortOrder: item.sortOrder,
        notes: item.notes || '',
      });
    } else {
      reset({
        description: '',
        volume: 1,
        unit: 'unit',
        unitPrice: 0,
        sortOrder: 1,
        notes: '',
      });
    }
  }, [item, reset, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: ItemFormData) => {
    await onSubmit({
      description: data.description.trim(),
      volume: Number(data.volume),
      unit: data.unit.trim(),
      unitPrice: Number(data.unitPrice),
      sortOrder: data.sortOrder ? Number(data.sortOrder) : undefined,
      notes: data.notes?.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              {isEdit ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {isEdit ? 'Ubah Rincian Item Pekerjaan' : 'Tambah Item Pekerjaan Baru'}
              </h2>
              <p className="text-xs text-slate-500">
                Rincian pekerjaan & perhitungan subtotal otomatis
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
          <div className="p-6 space-y-4">
            {/* Deskripsi */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Deskripsi / Uraian Item <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="misal: Pemasangan Partisi Gypsum Rangka Baja Ringan"
                {...register('description')}
                disabled={isLoading}
                className={`w-full px-3.5 py-2 text-sm rounded-lg border ${
                  errors.description ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none`}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Volume & Satuan */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Volume / Kuantitas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="1.00"
                  {...register('volume')}
                  disabled={isLoading}
                  className={`w-full px-3.5 py-2 text-sm rounded-lg border ${
                    errors.volume ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition`}
                />
                {errors.volume && (
                  <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.volume.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Satuan / Unit <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="m2, unit, paket..."
                  {...register('unit')}
                  disabled={isLoading}
                  className={`w-full px-3.5 py-2 text-sm rounded-lg border ${
                    errors.unit ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition`}
                />
                {/* Quick Unit Pills */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {COMMON_UNITS.slice(0, 5).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setValue('unit', u)}
                      className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded border border-slate-200 transition"
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Harga Satuan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Harga Satuan (Rp) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-semibold text-slate-400">
                  Rp
                </span>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  placeholder="250000"
                  {...register('unitPrice')}
                  disabled={isLoading}
                  className={`w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border ${
                    errors.unitPrice ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-mono`}
                />
              </div>
              {errors.unitPrice && (
                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.unitPrice.message}
                </p>
              )}
            </div>

            {/* Subtotal Preview Card */}
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2 text-indigo-700 text-xs font-semibold">
                <Calculator className="w-4 h-4" />
                <span>Kalkulasi Subtotal:</span>
              </div>
              <div className="text-right">
                <div className="font-mono text-base font-bold text-indigo-900">
                  {formatRupiah(calculatedSubtotal)}
                </div>
                <div className="text-[10px] text-indigo-600">
                  {watchVolume} × {formatRupiah(watchUnitPrice)}
                </div>
              </div>
            </div>

            {/* Catatan Item */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Catatan Item (Opsional)
              </label>
              <input
                type="text"
                placeholder="Spesifikasi bahan, merk, atau ketentuan teknis"
                {...register('notes')}
                disabled={isLoading}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
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
              ) : isEdit ? (
                <Edit2 className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>{isEdit ? 'Simpan Perubahan' : 'Tambahkan Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

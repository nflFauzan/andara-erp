import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Package, Tag, Layers, DollarSign, FileText, CheckCircle2 } from 'lucide-react';
import { ItemCatalog, CreateItemCatalogInput, UpdateItemCatalogInput } from '../../types/itemCatalog';

const itemSchema = z.object({
  code: z.string().max(50, 'Maksimal 50 karakter').optional().or(z.literal('')),
  name: z.string().min(2, 'Nama item minimal 2 karakter').max(500, 'Maksimal 500 karakter'),
  category: z.string().max(100, 'Maksimal 100 karakter').optional().or(z.literal('')),
  defaultUnit: z.string().min(1, 'Satuan wajib diisi').max(50, 'Maksimal 50 karakter'),
  defaultPrice: z.coerce.number().min(0, 'Harga tidak boleh negatif'),
  description: z.string().optional().or(z.literal('')),
  active: z.boolean().optional(),
});

type ItemFormData = z.infer<typeof itemSchema>;

interface ItemCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateItemCatalogInput | UpdateItemCatalogInput) => Promise<void>;
  item?: ItemCatalog | null;
  isLoading?: boolean;
  categories?: string[];
  initialName?: string;
}

const COMMON_UNITS = ['m2', 'm1', 'unit', 'bh', 'titik', 'paket', 'ls', 'kg', 'batang', 'lembar', 'hari'];
const COMMON_CATEGORIES = [
  'Baja Ringan',
  'Genteng & Atap',
  'Plafon & Listplang',
  'Sipil & Partisi',
  'Pengecatan',
  'Kelistrikan',
  'Bahan Bangunan',
  'Jasa & Tenaga',
];

export const ItemCatalogModal: React.FC<ItemCatalogModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  item,
  isLoading = false,
  categories = [],
  initialName = '',
}) => {
  const isEdit = Boolean(item);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      code: '',
      name: initialName || '',
      category: '',
      defaultUnit: 'm2',
      defaultPrice: 0,
      description: '',
      active: true,
    },
  });

  useEffect(() => {
    if (item) {
      reset({
        code: item.code || '',
        name: item.name,
        category: item.category || '',
        defaultUnit: item.defaultUnit,
        defaultPrice: item.defaultPrice,
        description: item.description || '',
        active: item.active,
      });
    } else {
      reset({
        code: '',
        name: initialName || '',
        category: '',
        defaultUnit: 'm2',
        defaultPrice: 0,
        description: '',
        active: true,
      });
    }
  }, [item, reset, isOpen, initialName]);

  if (!isOpen) return null;

  const currentUnit = watch('defaultUnit');

  // Combine categories
  const allCategories = Array.from(new Set([...COMMON_CATEGORIES, ...categories])).filter(Boolean);

  const onFormSubmit = async (data: ItemFormData) => {
    await onSubmit({
      code: data.code?.trim() || undefined,
      name: data.name.trim(),
      category: data.category?.trim() || undefined,
      defaultUnit: data.defaultUnit.trim(),
      defaultPrice: data.defaultPrice,
      description: data.description?.trim() || undefined,
      active: data.active,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] sm:max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 px-4 sm:px-6 py-3.5 sm:py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {isEdit ? 'Ubah Data Item Master' : 'Tambah Item Master Baru'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                {isEdit 
                  ? 'Perbarui informasi uraian pekerjaan atau material di master catalog' 
                  : 'Item ini akan tersedia di dropdown pemilihan saat pembuatan SPH'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={(e) => {
            e.stopPropagation();
            handleSubmit(onFormSubmit)(e);
          }}
          className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 flex-1 overflow-y-auto flex flex-col"
        >
          {/* Row 1: Code & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Kode Item <span className="text-slate-400 font-normal lowercase">(opsional)</span>
              </label>
              <input
                type="text"
                {...register('code')}
                placeholder="Otomatis jika kosong (misal: ITM-001)"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none uppercase font-mono"
              />
              {errors.code && (
                <p className="text-xs text-rose-500 mt-1">{errors.code.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Kategori
              </label>
              <input
                type="text"
                list="category-suggestions"
                {...register('category')}
                placeholder="Pilih atau ketik kategori..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
              <datalist id="category-suggestions">
                {allCategories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
              {errors.category && (
                <p className="text-xs text-rose-500 mt-1">{errors.category.message}</p>
              )}
            </div>
          </div>

          {/* Row 2: Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-slate-400" />
              Nama Item / Uraian Pekerjaan <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              {...register('name')}
              placeholder="Contoh: Pek. Rangka Atap Baja Ringan (type Pelana) C.75x35 BMT tb. 0,70mm AZ100"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none"
            />
            {errors.name && (
              <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Row 3: Unit & Default Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Satuan Default <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                list="unit-suggestions"
                {...register('defaultUnit')}
                placeholder="m2, m1, unit, bh, dll."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
              <datalist id="unit-suggestions">
                {COMMON_UNITS.map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {COMMON_UNITS.slice(0, 6).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setValue('defaultUnit', u, { shouldValidate: true })}
                    className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                      currentUnit === u
                        ? 'bg-brand-50 border-brand-300 text-brand-700 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
              {errors.defaultUnit && (
                <p className="text-xs text-rose-500 mt-1">{errors.defaultUnit.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                Harga Satuan Default (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                {...register('defaultPrice')}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Harga ini sebagai acuan awal di SPH, tetap dapat diubah saat pembuatan penawaran.
              </p>
              {errors.defaultPrice && (
                <p className="text-xs text-rose-500 mt-1">{errors.defaultPrice.message}</p>
              )}
            </div>
          </div>

          {/* Row 4: Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Spesifikasi / Keterangan Tambahan <span className="text-slate-400 font-normal lowercase">(opsional)</span>
            </label>
            <textarea
              rows={2}
              {...register('description')}
              placeholder="Catatan teknis, merk, atau spesifikasi detail..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none"
            />
          </div>

          {/* Row 5: Status (Edit mode) */}
          {isEdit && (
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <input
                type="checkbox"
                id="active-checkbox"
                {...register('active')}
                className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
              />
              <label htmlFor="active-checkbox" className="text-xs font-medium text-slate-700 cursor-pointer">
                Item Aktif (Ditampilkan di dropdown pencarian SPH)
              </label>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 rounded-lg shadow-sm shadow-brand-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-center"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isLoading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

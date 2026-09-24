import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Building2, User, Phone, Mail, MapPin, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Customer, CreateCustomerInput, UpdateCustomerInput } from '../../types/customer';

const customerSchema = z.object({
  code: z.string().min(2, 'Kode pelanggan minimal 2 karakter').max(50, 'Maksimal 50 karakter'),
  name: z.string().min(2, 'Nama pelanggan minimal 2 karakter').max(255, 'Maksimal 255 karakter'),
  companyName: z.string().max(255, 'Maksimal 255 karakter').optional().or(z.literal('')),
  picName: z.string().max(100, 'Maksimal 100 karakter').optional().or(z.literal('')),
  phone: z.string().max(50, 'Maksimal 50 karakter').optional().or(z.literal('')),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  active: z.boolean().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCustomerInput | UpdateCustomerInput) => Promise<void>;
  customer?: Customer | null;
  isLoading?: boolean;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  customer,
  isLoading = false,
}) => {
  const isEdit = Boolean(customer);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      code: '',
      name: '',
      companyName: '',
      picName: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
      active: true,
    },
  });

  useEffect(() => {
    if (customer) {
      reset({
        code: customer.code,
        name: customer.name,
        companyName: customer.companyName || '',
        picName: customer.picName || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        notes: customer.notes || '',
        active: customer.active,
      });
    } else {
      reset({
        code: '',
        name: '',
        companyName: '',
        picName: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
        active: true,
      });
    }
  }, [customer, reset, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: CustomerFormData) => {
    const payload: CreateCustomerInput | UpdateCustomerInput = {
      code: data.code.trim().toUpperCase(),
      name: data.name.trim(),
      companyName: data.companyName?.trim() || undefined,
      picName: data.picName?.trim() || undefined,
      phone: data.phone?.trim() || undefined,
      email: data.email?.trim() || undefined,
      address: data.address?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
      ...(isEdit ? { active: data.active } : {}),
    };
    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {isEdit ? 'Ubah Data Pelanggan' : 'Tambah Pelanggan Baru'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEdit
                  ? `Mengubah informasi profil pelanggan ${customer?.code}`
                  : 'Lengkapi form di bawah untuk mendaftarkan mitra / pelanggan baru'}
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Grid 1: Kode & Nama */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Kode Pelanggan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="misal: CUST-004"
                  {...register('code')}
                  disabled={isLoading || isEdit}
                  className={`w-full px-3.5 py-2 text-sm rounded-lg border uppercase ${
                    errors.code ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition disabled:bg-slate-100 disabled:text-slate-500`}
                />
                {errors.code && (
                  <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.code.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Pelanggan / Institusi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nama instansi, perorangan, atau entitas"
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
            </div>

            {/* Grid 2: Nama Perusahaan & PIC */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Badan Usaha / Perusahaan
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="misal: PT Andara Sejahtera"
                    {...register('companyName')}
                    disabled={isLoading}
                    className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nama PIC (Person In Charge)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="misal: Bpk. Bambang Sutrisno"
                    {...register('picName')}
                    disabled={isLoading}
                    className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Grid 3: Telepon & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nomor Telepon / WhatsApp
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="misal: 081234567890"
                    {...register('phone')}
                    disabled={isLoading}
                    className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Alamat Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="misal: info@perusahaan.com"
                    {...register('email')}
                    disabled={isLoading}
                    className={`w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border ${
                      errors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Alamat */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Alamat Lengkap
              </label>
              <div className="relative">
                <div className="absolute top-2.5 left-3 text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <textarea
                  rows={2}
                  placeholder="Alamat kantor / korespondensi"
                  {...register('address')}
                  disabled={isLoading}
                  className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
                />
              </div>
            </div>

            {/* Catatan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Catatan Tambahan
              </label>
              <div className="relative">
                <div className="absolute top-2.5 left-3 text-slate-400">
                  <FileText className="w-4 h-4" />
                </div>
                <textarea
                  rows={2}
                  placeholder="Informasi penting mengenai ketentuan khusus pelanggan"
                  {...register('notes')}
                  disabled={isLoading}
                  className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
                />
              </div>
            </div>

            {/* Status Aktif jika mode edit */}
            {isEdit && (
              <div className="pt-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  {...register('active')}
                  disabled={isLoading}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <label htmlFor="active" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Status Pelanggan Aktif
                </label>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
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
              <span>{isEdit ? 'Simpan Perubahan' : 'Daftarkan Pelanggan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

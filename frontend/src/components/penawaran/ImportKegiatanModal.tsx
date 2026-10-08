import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Search, FolderKanban, Check, MapPin, Layers, AlertCircle } from 'lucide-react';
import { kegiatanApi } from '../../api/kegiatanApi';
import { Kegiatan } from '../../types/kegiatan';
import { StatusBadge } from '../common/StatusBadge';
import { formatRupiah } from '../../lib/utils';

interface ImportKegiatanModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: number;
  customerName?: string;
  onSelectKegiatan: (kegiatan: Kegiatan) => void;
}

export const ImportKegiatanModal: React.FC<ImportKegiatanModalProps> = ({
  isOpen,
  onClose,
  customerId,
  customerName,
  onSelectKegiatan,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: kegiatans = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['kegiatan-by-customer', customerId],
    queryFn: () => kegiatanApi.getKegiatanByCustomer(customerId),
    enabled: isOpen && Boolean(customerId),
  });

  if (!isOpen) return null;

  const filteredKegiatans = kegiatans.filter((k) => {
    const term = searchTerm.toLowerCase();
    return (
      k.name.toLowerCase().includes(term) ||
      k.code.toLowerCase().includes(term) ||
      (k.location && k.location.toLowerCase().includes(term))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-navy-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-navy-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between bg-slate-50/50 dark:bg-navy-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Tarik dari Kegiatan Proyek
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Pilih kegiatan proyek pelanggan {customerName ? `(${customerName})` : ''} untuk diimpor ke SPH
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-navy-800 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-navy-800 bg-white dark:bg-navy-900 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan kode kegiatan, nama proyek, atau lokasi..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 dark:border-navy-700 rounded-xl bg-slate-50/50 dark:bg-navy-950/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              autoFocus
            />
          </div>
        </div>

        {/* Kegiatan List */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-3 flex-1 divide-y divide-slate-100 dark:divide-navy-800">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Memuat daftar kegiatan pelanggan...</p>
            </div>
          ) : isError ? (
            <div className="py-8 text-center text-rose-500 space-y-1">
              <AlertCircle className="w-8 h-8 mx-auto" />
              <p className="text-xs font-semibold">Gagal memuat data kegiatan.</p>
            </div>
          ) : filteredKegiatans.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-2">
              <FolderKanban className="w-10 h-10 text-slate-300 dark:text-navy-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {searchTerm ? 'Kegiatan tidak ditemukan' : 'Belum Ada Kegiatan Proyek'}
              </p>
              <p className="text-xs max-w-sm mx-auto">
                {searchTerm
                  ? 'Tidak ada kegiatan yang sesuai dengan kata kunci pencarian Anda.'
                  : 'Customer ini belum memiliki catatan kegiatan proyek di modul Kegiatan.'}
              </p>
            </div>
          ) : (
            filteredKegiatans.map((kegiatan) => (
              <div
                key={kegiatan.id}
                className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 hover:bg-slate-50/70 dark:hover:bg-navy-800/60 rounded-xl transition border border-transparent hover:border-slate-200/80 dark:hover:border-navy-700"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded border border-blue-200/60 dark:border-blue-900/40">
                      {kegiatan.code}
                    </span>
                    <StatusBadge status={kegiatan.status} size="sm" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {kegiatan.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                    {kegiatan.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {kegiatan.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-medium">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      {kegiatan.items?.length || 0} item rincian
                    </span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      RAB: {formatRupiah(kegiatan.totalAmount || 0)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectKegiatan(kegiatan)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl transition shadow-xs active:scale-95 shrink-0 text-center"
                >
                  <Check className="w-4 h-4" />
                  <span>Pilih & Impor</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/40 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-navy-800 rounded-xl transition text-center"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

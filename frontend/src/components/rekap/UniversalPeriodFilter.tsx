import React from 'react';
import {
  Calendar,
  Filter,
  RotateCcw,
  Search,
  User,
  Info,
  ChevronDown,
  X
} from 'lucide-react';
import { Customer } from '@/types/customer';

export type PeriodPreset =
  | 'ALL_TIME'
  | 'TODAY'
  | 'THIS_WEEK'
  | 'THIS_MONTH'
  | 'LAST_MONTH'
  | 'THIS_YEAR'
  | 'LAST_YEAR'
  | 'CUSTOM';

export interface FilterState {
  preset: PeriodPreset;
  startDate: string;
  endDate: string;
  customerId: string;
  status: string;
  search: string;
}

export type RekapTab =
  | 'CUSTOMERS'
  | 'KEGIATAN'
  | 'INVOICES'
  | 'PAYMENTS'
  | 'SPH'
  | 'PIUTANG'
  | 'UNBILLED'
  | 'SETTLEMENTS'
  | 'TREND';

interface UniversalPeriodFilterProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  customers: Customer[];
  activeTab: RekapTab;
  onReset: () => void;
  onApply?: () => void;
}

function toISODateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDatesFromPreset(preset: PeriodPreset): { startDate: string; endDate: string } {
  const now = new Date();

  switch (preset) {
    case 'ALL_TIME':
      return { startDate: '', endDate: '' };

    case 'TODAY': {
      const todayStr = toISODateString(now);
      return { startDate: todayStr, endDate: todayStr };
    }

    case 'THIS_WEEK': {
      const day = now.getDay(); // 0 is Sunday, 1 is Monday
      const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now);
      monday.setDate(diffToMonday);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { startDate: toISODateString(monday), endDate: toISODateString(sunday) };
    }

    case 'THIS_MONTH': {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { startDate: toISODateString(firstDay), endDate: toISODateString(lastDay) };
    }

    case 'LAST_MONTH': {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      return { startDate: toISODateString(firstDay), endDate: toISODateString(lastDay) };
    }

    case 'THIS_YEAR': {
      const year = now.getFullYear();
      return { startDate: `${year}-01-01`, endDate: `${year}-12-31` };
    }

    case 'LAST_YEAR': {
      const prevYear = now.getFullYear() - 1;
      return { startDate: `${prevYear}-01-01`, endDate: `${prevYear}-12-31` };
    }

    case 'CUSTOM':
    default:
      return { startDate: '', endDate: '' };
  }
}

export const PRESET_LABELS: Record<PeriodPreset, string> = {
  ALL_TIME: 'Semua Waktu (All Time)',
  TODAY: 'Hari Ini',
  THIS_WEEK: 'Minggu Ini',
  THIS_MONTH: 'Bulan Ini',
  LAST_MONTH: 'Bulan Lalu',
  THIS_YEAR: 'Tahun Ini',
  LAST_YEAR: 'Tahun Lalu',
  CUSTOM: 'Rentang Kustom',
};

export const UniversalPeriodFilter: React.FC<UniversalPeriodFilterProps> = ({
  filters,
  onChange,
  customers,
  activeTab,
  onReset,
  onApply,
}) => {
  const handlePresetChange = (preset: PeriodPreset) => {
    if (preset === 'CUSTOM') {
      onChange({
        ...filters,
        preset: 'CUSTOM',
      });
    } else {
      const { startDate, endDate } = getDatesFromPreset(preset);
      onChange({
        ...filters,
        preset,
        startDate,
        endDate,
      });
    }
  };

  const handleStartDateChange = (val: string) => {
    onChange({
      ...filters,
      preset: 'CUSTOM',
      startDate: val,
    });
  };

  const handleEndDateChange = (val: string) => {
    onChange({
      ...filters,
      preset: 'CUSTOM',
      endDate: val,
    });
  };

  const handleCustomerChange = (val: string) => {
    onChange({
      ...filters,
      customerId: val,
    });
  };

  const handleStatusChange = (val: string) => {
    onChange({
      ...filters,
      status: val,
    });
  };

  const handleSearchChange = (val: string) => {
    onChange({
      ...filters,
      search: val,
    });
  };

  // Status options per tab
  const renderStatusOptions = () => {
    switch (activeTab) {
      case 'INVOICES':
        return (
          <>
            <option value="">Semua Status Faktur</option>
            <option value="UNPAID">Status: Belum Bayar</option>
            <option value="PARTIALLY_PAID">Status: Sebagian Dibayar</option>
            <option value="PAID">Status: Lunas</option>
            <option value="ISSUED">Status Dokumen: Terbit</option>
            <option value="DRAFT">Status Dokumen: Draft</option>
            <option value="CANCELLED">Status Dokumen: Dibatalkan</option>
          </>
        );
      case 'PAYMENTS':
        return (
          <>
            <option value="">Semua Status & Metode</option>
            <option value="CONFIRMED">Status: Dikonfirmasi</option>
            <option value="CANCELLED">Status: Dibatalkan</option>
            <option value="TRANSFER">Metode: Transfer Bank</option>
            <option value="CASH">Metode: Tunai / Cash</option>
            <option value="GIRO">Metode: Bilyet Giro</option>
            <option value="CHEQUE">Metode: Cek</option>
          </>
        );
      case 'KEGIATAN':
        return (
          <>
            <option value="">Semua Status Kegiatan</option>
            <option value="PLANNING">Perencanaan (Planning)</option>
            <option value="ACTIVE">Sedang Berjalan (Active)</option>
            <option value="COMPLETED">Selesai (Completed)</option>
            <option value="CANCELLED">Dibatalkan (Cancelled)</option>
          </>
        );
      case 'SPH':
        return (
          <>
            <option value="">Semua Status SPH</option>
            <option value="APPROVED">Disetujui / Diterima (Approved)</option>
            <option value="SENT">Terkirim / Diajukan (Sent)</option>
            <option value="DRAFT">Draft</option>
            <option value="REJECTED">Ditolak (Rejected)</option>
            <option value="CANCELLED">Dibatalkan (Cancelled)</option>
          </>
        );
      case 'PIUTANG':
        return (
          <>
            <option value="">Semua Umur Piutang</option>
            <option value="CURRENT">Lancar (Belum Jatuh Tempo)</option>
            <option value="DAYS_1_30">1 - 30 Hari</option>
            <option value="DAYS_31_60">31 - 60 Hari</option>
            <option value="DAYS_61_90">61 - 90 Hari</option>
            <option value="DAYS_OVER_90">&gt; 90 Hari</option>
          </>
        );
      case 'UNBILLED':
        return (
          <>
            <option value="">Semua Status Penagihan</option>
            <option value="UNBILLED">Belum Ditagih (0% Billed)</option>
            <option value="PARTIALLY_BILLED">Sebagian Ditagih (&gt;0% &lt;100%)</option>
            <option value="FULLY_BILLED">Lengkap Ditagih (100% Billed)</option>
          </>
        );
      case 'SETTLEMENTS':
        return (
          <>
            <option value="">Semua Status Pelunasan</option>
            <option value="UNPAID">Belum Dibayar (Unpaid)</option>
            <option value="PARTIALLY_PAID">Sebagian Dibayar (Cicilan)</option>
            <option value="PAID">Lunas (Paid)</option>
          </>
        );
      case 'TREND':
        return (
          <>
            <option value="">Semua Kuartal / Bulan</option>
          </>
        );
      case 'CUSTOMERS':
      default:
        return (
          <>
            <option value="">Semua Status Transaksi</option>
            <option value="WITH_OUTSTANDING">Hanya yang Ada Piutang</option>
            <option value="WITH_DEPOSIT">Hanya yang Punya Saldo Deposit</option>
          </>
        );
    }
  };

  // Domain Anchor description
  const getDomainAnchorText = () => {
    switch (activeTab) {
      case 'CUSTOMERS':
        return 'Filter periode membatasi akumulasi transaksi faktur dan pembayaran kas customer.';
      case 'KEGIATAN':
        return 'Periode disaring berdasarkan tanggal registrasi proyek (kegiatan.createdAt).';
      case 'INVOICES':
        return 'Periode disaring berdasarkan tanggal terbit resmi faktur (invoice.date).';
      case 'PAYMENTS':
        return 'Periode disaring berdasarkan tanggal pencatatan kas masuk (payment.date).';
      case 'SPH':
        return 'Periode disaring berdasarkan tanggal surat penawaran harga (penawaran.date).';
      case 'PIUTANG':
        return 'Periode disaring berdasarkan tanggal jatuh tempo faktur (invoice.dueDate).';
      case 'UNBILLED':
        return 'Komparasi SPH disetujui terhadap nilai invoice terbit untuk deteksi dini penagihan tertunda (leakage).';
      case 'SETTLEMENTS':
        return 'Matriks silang faktur penjualan beserta seluruh jejak riwayat alokasi kas/bank pelunas.';
      case 'TREND':
        return 'Distribusi 12-bulan akumulasi SPH, penerbitan invoice, penerimaan kas nyata, dan tren MoM.';
      default:
        return 'Data dihitung secara otomatis berdasarkan kebenaran transaksi database.';
    }
  };


  // Quick preset pills to display
  const primaryPresets: PeriodPreset[] = ['ALL_TIME', 'THIS_MONTH', 'LAST_MONTH', 'THIS_YEAR', 'CUSTOM'];

  return (
    <div className="space-y-4">
      {/* Upper Row: Quick Presets Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-navy-700/80">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1 inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            Preset Periode:
          </span>
          {primaryPresets.map((preset) => {
            const isActive = filters.preset === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetChange(preset)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {PRESET_LABELS[preset]}
              </button>
            );
          })}

          {/* More Presets Dropdown */}
          <div className="relative inline-block text-left">
            <select
              value={['TODAY', 'THIS_WEEK', 'LAST_YEAR'].includes(filters.preset) ? filters.preset : ''}
              onChange={(e) => {
                if (e.target.value) {
                  handlePresetChange(e.target.value as PeriodPreset);
                }
              }}
              className={`pl-2.5 pr-7 py-1.5 rounded-lg text-xs font-medium border appearance-none transition-all cursor-pointer ${
                ['TODAY', 'THIS_WEEK', 'LAST_YEAR'].includes(filters.preset)
                  ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                  : 'bg-slate-100 dark:bg-navy-800 border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
              }`}
            >
              <option value="" disabled>Lainnya...</option>
              <option value="TODAY">Hari Ini</option>
              <option value="THIS_WEEK">Minggu Ini</option>
              <option value="LAST_YEAR">Tahun Lalu</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onApply && (
            <button
              type="button"
              onClick={onApply}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-xs transition"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Terapkan</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReset}
            title="Reset ke pengaturan bawaan (Semua Waktu)"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300 text-xs font-medium transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Filter Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Search Box */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kode / nama / no dokumen..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2. Customer Selector */}
        <div className="relative">
          <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={filters.customerId}
            onChange={(e) => handleCustomerChange(e.target.value)}
            className="w-full pl-9 pr-7 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Semua Customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name} {c.companyName ? `(${c.companyName})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Date Range (Start & End) */}
        <div className="grid grid-cols-2 gap-1.5">
          <div className="relative">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="Tanggal Awal"
            />
          </div>
          <div className="relative">
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="Tanggal Akhir"
            />
          </div>
        </div>

        {/* 4. Contextual Status Selector */}
        <div>
          <select
            value={filters.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {renderStatusOptions()}
          </select>
        </div>
      </div>

      {/* Domain Date Anchor Info Strip */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-900/60 border border-slate-100 dark:border-navy-700/60 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>{getDomainAnchorText()}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-medium text-slate-600 dark:text-slate-300">
            Mode Aktif: <strong className="text-indigo-600 dark:text-indigo-400">{PRESET_LABELS[filters.preset]}</strong>
          </span>
          {filters.startDate && filters.endDate && (
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono">
              {filters.startDate} s/d {filters.endDate}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ExternalLink,
  Printer,
  FileSpreadsheet,
  Calendar,
  Search,
  CreditCard,
  Receipt,
  FileText,
  HardHat,
  Wallet,
  Building2,
  Phone,
  Mail,
  MapPin,
  TrendingDown,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FolderKanban,
  History,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { getCustomerStatement } from '@/api/rekapApi';
import { kegiatanApi } from '@/api/kegiatanApi';
import { CustomerStatement, CustomerStatementItem, StatementItemType } from '@/types/rekap';
import { Kegiatan } from '@/types/kegiatan';
import { formatCurrency, formatDate } from '@/lib/utils';
import { exportCustomerStatementToExcel } from '@/utils/excelExport';

interface CustomerStatementDrawerProps {
  customerId: number | null;
  customerName?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  onClose: () => void;
}

type MainTab = 'timeline' | 'kegiatan' | 'faktur' | 'buku_besar';

export const CustomerStatementDrawer: React.FC<CustomerStatementDrawerProps> = ({
  customerId,
  customerName,
  initialStartDate,
  initialEndDate,
  onClose,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MainTab>('timeline');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(initialStartDate || '');
  const [endDate, setEndDate] = useState<string>(initialEndDate || '');
  const [expandedKegiatanId, setExpandedKegiatanId] = useState<number | null>(null);

  // 1. Fetch Statement Data
  const {
    data: statement,
    isLoading: isStatementLoading,
    isError: isStatementError,
    refetch,
  } = useQuery<CustomerStatement>({
    queryKey: ['customerStatement', customerId, startDate, endDate],
    queryFn: () => getCustomerStatement(customerId!, { startDate, endDate }),
    enabled: !!customerId,
  });

  // 2. Fetch Customer Kegiatan & Items (for Tab 2)
  const {
    data: customerKegiatan = [],
    isLoading: isKegiatanLoading,
  } = useQuery<Kegiatan[]>({
    queryKey: ['customerKegiatanStatement', customerId],
    queryFn: () => kegiatanApi.getKegiatanByCustomer(customerId!),
    enabled: !!customerId && activeTab === 'kegiatan',
  });

  if (!customerId) return null;

  // Filter items by search
  const allItems = statement?.items || [];
  const filteredTimelineItems = allItems.filter((item: CustomerStatementItem) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.referenceNo.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.status.toLowerCase().includes(q) ||
      (item.notes && item.notes.toLowerCase().includes(q))
    );
  });

  const invoiceItems = allItems.filter(i => i.type === 'INVOICE');
  const paymentItems = allItems.filter(i => i.type === 'PAYMENT');

  const handleDrillDown = (type: StatementItemType, referenceId: number) => {
    switch (type) {
      case 'KEGIATAN':
        navigate(`/kegiatan/${referenceId}`);
        break;
      case 'SPH':
        navigate(`/penawaran/${referenceId}`);
        break;
      case 'INVOICE':
        navigate(`/faktur/${referenceId}`);
        break;
      case 'PAYMENT':
        navigate(`/pembayaran/${referenceId}`);
        break;
      case 'DEPOSIT':
        navigate(`/deposits`);
        break;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getItemBadge = (type: StatementItemType) => {
    switch (type) {
      case 'KEGIATAN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <HardHat className="w-3.5 h-3.5" /> Proyek Kegiatan
          </span>
        );
      case 'SPH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <FileText className="w-3.5 h-3.5" /> Penawaran SPH
          </span>
        );
      case 'INVOICE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Receipt className="w-3.5 h-3.5" /> Faktur Penjualan
          </span>
        );
      case 'PAYMENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CreditCard className="w-3.5 h-3.5" /> Kas Masuk
          </span>
        );
      case 'DEPOSIT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Wallet className="w-3.5 h-3.5" /> Saldo Deposit
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {type}
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'PAID' || s === 'CONFIRMED' || s === 'COMPLETED' || s === 'APPROVED' || s === 'ACTIVE') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {status}
        </span>
      );
    }
    if (s === 'PARTIAL' || s === 'PARTIALLY_PAID' || s === 'SENT') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          {status}
        </span>
      );
    }
    if (s === 'UNPAID' || s === 'OVERDUE' || s === 'REJECTED' || s === 'CANCELLED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        {status}
      </span>
    );
  };

  const totalInvoice = statement?.totalInvoiceAmount || 0;
  const totalPaid = statement?.totalPaidAmount || 0;
  const totalOutstanding = statement?.totalOutstandingAmount || 0;
  const depositBalance = statement?.depositBalance || 0;
  const realizationPct = totalInvoice > 0 ? Math.min(100, Math.round((totalPaid / totalInvoice) * 100)) : 100;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm animate-fade-in flex justify-end">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl animate-slide-in">
        
        {/* ========================================================================= */}
        {/* 1. TOP HEADER - Clean, Sharp, Friendly */}
        {/* ========================================================================= */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-md flex items-start justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-start gap-4">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-xl font-black text-white shadow-md shadow-blue-500/20 shrink-0">
              {statement?.customerName ? statement.customerName.charAt(0).toUpperCase() : (customerName ? customerName.charAt(0).toUpperCase() : 'C')}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {statement?.customerName || customerName || 'Buku Besar & Riwayat Customer'}
                </h2>
                {statement?.customerCode && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {statement.customerCode}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Customer Financial Statement
                </span>
              </div>

              {/* Meta details with high readability */}
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-600 dark:text-slate-400 flex-wrap font-medium">
                {statement?.company && (
                  <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold">
                    <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{statement.company}</span>
                  </div>
                )}
                {statement?.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{statement.phone}</span>
                  </div>
                )}
                {statement?.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{statement.email}</span>
                  </div>
                )}
                {statement?.address && (
                  <div className="flex items-center gap-1.5 max-w-sm truncate" title={statement.address}>
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{statement.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate(`/customers/${customerId}`)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs"
              title="Buka halaman profil master customer"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Master Customer
            </button>
            <button
              onClick={() => exportCustomerStatementToExcel(statement)}
              className="px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 hover:border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs"
              title="Unduh Buku Besar dalam format Excel Multi-Sheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Ekspor Excel
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs"
              title="Cetak Statement"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" /> Cetak
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ml-1"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. BODY CONTENT */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isStatementLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-r-transparent"></div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Memuat profil keuangan & riwayat customer...</p>
            </div>
          ) : isStatementError ? (
            <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-2xl space-y-3">
              <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
              <h3 className="text-base font-bold text-rose-700 dark:text-rose-400">Gagal Mengambil Data Statement</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Terjadi kesalahan saat memuat data customer. Silakan coba lagi.
              </p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <>
              {/* ========================================================================= */}
              {/* 3 PILAR RINGKASAN EKSEKUTIF - Luas, Angka Utuh, Tidak Terpotong */}
              {/* ========================================================================= */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Pilar 1: Total Nilai Penagihan */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white dark:from-slate-800 dark:to-slate-800/60 border border-blue-100 dark:border-slate-700 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs font-semibold mb-2">
                    <span className="uppercase tracking-wider">Total Nilai Penagihan</span>
                    <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Receipt className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                    {formatCurrency(totalInvoice)}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{statement?.totalInvoiceCount || 0} Faktur</span>
                    <span>•</span>
                    <span>{statement?.totalKegiatanCount || 0} Proyek Pekerjaan</span>
                  </div>
                </div>

                {/* Pilar 2: Kas Masuk / Realisasi Pembayaran */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white dark:from-slate-800 dark:to-slate-800/60 border border-emerald-100 dark:border-slate-700 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs font-semibold mb-2">
                    <span className="uppercase tracking-wider">Kas Masuk (Terbayar)</span>
                    <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                    {formatCurrency(totalPaid)}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-xs">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="w-3 h-3" />
                      Realisasi {realizationPct}%
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">dari total nilai tagihan</span>
                  </div>
                </div>

                {/* Pilar 3: Status Saldo & Piutang (Kesehatan Finansial) */}
                <div className={`p-5 rounded-2xl border shadow-xs relative overflow-hidden ${
                  totalOutstanding > 0
                    ? 'bg-gradient-to-br from-rose-50/70 via-amber-50/30 to-white dark:from-slate-800 dark:to-slate-800/60 border-rose-200 dark:border-rose-900/30'
                    : 'bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/60 border-slate-200 dark:border-slate-700'
                }`}>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs font-semibold mb-2">
                    <span className="uppercase tracking-wider">Status Piutang</span>
                    <span className={`p-2 rounded-xl ${
                      totalOutstanding > 0
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {totalOutstanding > 0 ? <TrendingDown className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    </span>
                  </div>
                  
                  {totalOutstanding > 0 ? (
                    <div>
                      <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">
                        {formatCurrency(totalOutstanding)}
                      </div>
                      <div className="text-xs text-rose-600/80 dark:text-rose-400/80 font-medium mt-1">
                        Sisa tagihan belum dilunasi
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight flex items-center gap-1.5">
                        <span>LUNAS</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold">
                          Nihil Piutang
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Tidak ada tagihan tertunggak
                      </div>
                    </div>
                  )}

                  {/* Saldo Deposit Badge if exists */}
                  {depositBalance > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                        <Wallet className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Saldo Deposit:
                      </span>
                      <span className="font-bold font-mono text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800">
                        {formatCurrency(depositBalance)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ========================================================================= */}
              {/* TAB MENU NAVIGASI HUMAN-FRIENDLY */}
              {/* ========================================================================= */}
              <div className="border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap pt-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveTab('timeline')}
                    className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'timeline'
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <History className="w-4 h-4" />
                    <span>Alur Cerita Transaksi</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      activeTab === 'timeline' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {allItems.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('kegiatan')}
                    className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'kegiatan'
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FolderKanban className="w-4 h-4" />
                    <span>Proyek & Rincian Item</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      activeTab === 'kegiatan' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {statement?.totalKegiatanCount || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('faktur')}
                    className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'faktur'
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Faktur & Pembayaran</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      activeTab === 'faktur' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {invoiceItems.length + paymentItems.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('buku_besar')}
                    className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'buku_besar'
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Buku Kas Akuntansi</span>
                  </button>
                </div>

                {/* Filter / Search Bar */}
                <div className="flex items-center gap-2.5 py-1 flex-wrap">
                  {/* Date range filters */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="bg-transparent text-slate-700 dark:text-slate-300 text-xs focus:outline-none"
                      title="Tanggal Mulai Audit"
                    />
                    <span className="text-slate-400">s/d</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="bg-transparent text-slate-700 dark:text-slate-300 text-xs focus:outline-none"
                      title="Tanggal Akhir Audit"
                    />
                    {(startDate || endDate) && (
                      <button
                        onClick={() => { setStartDate(''); setEndDate(''); }}
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-bold ml-1"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  <div className="relative min-w-[180px]">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari transaksi..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* TAB 1: 🕒 ALUR CERITA TRANSAKSI (TIMELINE FEED) */}
              {/* ========================================================================= */}
              {activeTab === 'timeline' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-1">
                    <p className="flex items-center gap-1.5 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Alur perjalanan transaksi yang terjadi antara CV. ANDARA dengan pelanggan ini secara berurutan.
                    </p>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {filteredTimelineItems.length} Peristiwa
                    </span>
                  </div>

                  {filteredTimelineItems.length === 0 ? (
                    <div className="py-16 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum ada riwayat transaksi</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Dokumen SPH, penagihan faktur, atau pembayaran kas belum tercatat untuk periode ini.
                      </p>
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                      {filteredTimelineItems.map((item, idx) => {
                        const isInvoice = item.type === 'INVOICE';
                        const isPayment = item.type === 'PAYMENT';
                        const isSph = item.type === 'SPH';
                        const isKegiatan = item.type === 'KEGIATAN';
                        const isDeposit = item.type === 'DEPOSIT';

                        return (
                          <div key={`${item.type}-${item.referenceId}-${idx}`} className="relative group">
                            {/* Marker dot */}
                            <div className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-xs transition-transform group-hover:scale-125 ${
                              isInvoice ? 'bg-indigo-600' :
                              isPayment ? 'bg-emerald-600' :
                              isSph ? 'bg-purple-600' :
                              isKegiatan ? 'bg-blue-600' :
                              isDeposit ? 'bg-amber-500' : 'bg-slate-400'
                            }`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            </div>

                            {/* Card Content */}
                            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                                      {formatDate(item.date)}
                                    </span>
                                    <span>•</span>
                                    {getItemBadge(item.type)}
                                    {getStatusBadge(item.status)}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleDrillDown(item.type, item.referenceId)}
                                      className="font-mono text-sm font-black text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 group-hover:text-blue-700 transition"
                                      title="Buka detail dokumen"
                                    >
                                      <span>{item.referenceNo}</span>
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                                    {item.description}
                                  </p>

                                  {item.notes && (
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                                      {item.notes}
                                    </p>
                                  )}
                                </div>

                                {/* Right Side: Financial Impact */}
                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-700/60 shrink-0">
                                  {item.debit > 0 ? (
                                    <div className="text-right">
                                      <span className="text-[10px] text-rose-500 uppercase font-bold block">Tagihan Faktur</span>
                                      <span className="font-mono font-black text-base text-rose-600 dark:text-rose-400">
                                        + {formatCurrency(item.debit)}
                                      </span>
                                    </div>
                                  ) : item.credit > 0 ? (
                                    <div className="text-right">
                                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold block">Uang Diterima</span>
                                      <span className="font-mono font-black text-base text-emerald-600 dark:text-emerald-400">
                                        - {formatCurrency(item.credit)}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="text-right">
                                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Nilai Dokumen</span>
                                      <span className="font-mono font-bold text-sm text-slate-800 dark:text-slate-200">
                                        {formatCurrency(item.amount)}
                                      </span>
                                    </div>
                                  )}

                                  <button
                                    onClick={() => handleDrillDown(item.type, item.referenceId)}
                                    className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 text-slate-700 dark:text-slate-300 text-[11px] font-bold rounded-lg transition"
                                  >
                                    <span>Lihat Dokumen</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 2: 📁 PROYEK & RINCIAN ITEM KEGIATAN */}
              {/* ========================================================================= */}
              {activeTab === 'kegiatan' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-1">
                    <p className="flex items-center gap-1.5 font-medium">
                      <FolderKanban className="w-3.5 h-3.5 text-blue-600" />
                      Daftar pekerjaan lapangan customer ini lengkap dengan rincian volume, satuan, dan biaya item pekerjaan.
                    </p>
                    <button
                      onClick={() => navigate('/kegiatan')}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Buka Modul Kegiatan <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  {isKegiatanLoading ? (
                    <div className="py-16 text-center space-y-2">
                      <div className="inline-block animate-spin rounded-full h-7 w-7 border-4 border-blue-600 border-r-transparent"></div>
                      <p className="text-xs font-semibold text-slate-500">Mengambil daftar kegiatan dan rincian item...</p>
                    </div>
                  ) : customerKegiatan.length === 0 ? (
                    <div className="py-16 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <HardHat className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum ada kegiatan yang terdaftar</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Kegiatan proyek belum dibuat untuk customer ini.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {customerKegiatan.map((keg: Kegiatan) => {
                        const isExpanded = expandedKegiatanId === keg.id;
                        const items = keg.items || [];

                        return (
                          <div
                            key={keg.id}
                            className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 overflow-hidden shadow-xs"
                          >
                            {/* Kegiatan Card Header */}
                            <div className="p-4 bg-slate-50/70 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                    {keg.code}
                                  </span>
                                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                                    {keg.name}
                                  </h3>
                                  {getStatusBadge(keg.status)}
                                </div>

                                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                                  {keg.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-slate-400" /> {keg.location}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-slate-400" /> Dibuat: {formatDate(keg.createdAt)}
                                  </span>
                                  <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                    <Layers className="w-3 h-3 text-blue-500" /> {items.length} Rincian Item Pekerjaan
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 self-end sm:self-center">
                                <div className="text-right">
                                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Nilai Proyek</span>
                                  <span className="font-mono font-black text-base text-slate-900 dark:text-white">
                                    {formatCurrency(keg.totalAmount)}
                                  </span>
                                </div>

                                <button
                                  onClick={() => setExpandedKegiatanId(isExpanded ? null : keg.id)}
                                  className={`p-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                                    isExpanded
                                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 border-blue-200 dark:border-blue-800'
                                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-blue-400'
                                  }`}
                                  title={isExpanded ? 'Tutup rincian item' : 'Lihat rincian item pekerjaan'}
                                >
                                  <span>{isExpanded ? 'Tutup Item' : 'Buka Item'}</span>
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>

                                <button
                                  onClick={() => navigate(`/kegiatan/${keg.id}`)}
                                  className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                  title="Buka halaman penuh kegiatan ini"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Expandable Items Table */}
                            {isExpanded && (
                              <div className="p-4 bg-white dark:bg-slate-900 animate-fade-in border-t border-slate-100 dark:border-slate-800">
                                {items.length === 0 ? (
                                  <p className="text-xs text-slate-400 text-center py-4">Belum ada rincian item dalam kegiatan ini.</p>
                                ) : (
                                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                                    <table className="w-full text-left text-xs border-collapse">
                                      <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                          <th className="py-2.5 px-3 w-10 text-center">No</th>
                                          <th className="py-2.5 px-3">Uraian / Deskripsi Item Pekerjaan</th>
                                          <th className="py-2.5 px-3 text-right">Volume</th>
                                          <th className="py-2.5 px-3 text-center">Satuan</th>
                                          <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                                          <th className="py-2.5 px-3 text-right">Subtotal</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {items.map((it, itemIdx) => (
                                          <tr key={it.id || itemIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                            <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{itemIdx + 1}</td>
                                            <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                                              {it.description}
                                              {it.notes && (
                                                <span className="block text-[11px] text-slate-400 mt-0.5">{it.notes}</span>
                                              )}
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                                              {it.volume}
                                            </td>
                                            <td className="py-2.5 px-3 text-center text-slate-500 font-medium">
                                              {it.unit}
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                                              {formatCurrency(it.unitPrice)}
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                                              {formatCurrency(it.subtotal)}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                      <tfoot>
                                        <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 font-bold">
                                          <td colSpan={5} className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300 uppercase text-[11px]">
                                            Total Biaya Kegiatan
                                          </td>
                                          <td className="py-2.5 px-3 text-right font-mono text-blue-700 dark:text-blue-300 font-black text-sm">
                                            {formatCurrency(keg.totalAmount)}
                                          </td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 3: 🧾 FAKTUR & PEMBAYARAN KAS */}
              {/* ========================================================================= */}
              {activeTab === 'faktur' && (
                <div className="space-y-6">
                  {/* Bagian Faktur */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-indigo-600" />
                        <span>Daftar Faktur Penjualan Diterbitkan ({invoiceItems.length})</span>
                      </h3>
                      <button
                        onClick={() => navigate('/faktur')}
                        className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Buka Modul Faktur <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    {invoiceItems.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                        Belum ada faktur penjualan yang diterbitkan untuk customer ini.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                              <th className="py-3 px-4">No. Faktur</th>
                              <th className="py-3 px-4">Tanggal</th>
                              <th className="py-3 px-4">Deskripsi / Uraian</th>
                              <th className="py-3 px-4 text-center">Status</th>
                              <th className="py-3 px-4 text-right">Nilai Faktur</th>
                              <th className="py-3 px-4 text-center">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {invoiceItems.map((inv, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                                  {inv.referenceNo}
                                </td>
                                <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                                  {formatDate(inv.date)}
                                </td>
                                <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                                  {inv.description}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {getStatusBadge(inv.status)}
                                </td>
                                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                                  {formatCurrency(inv.debit || inv.amount)}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <button
                                    onClick={() => handleDrillDown('INVOICE', inv.referenceId)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                    title="Lihat detail faktur"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Bagian Pembayaran Kas */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        <span>Riwayat Pembayaran Kas Masuk Diterima ({paymentItems.length})</span>
                      </h3>
                      <button
                        onClick={() => navigate('/pembayaran')}
                        className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Buka Modul Pembayaran <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    {paymentItems.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                        Belum ada riwayat pembayaran yang masuk dari customer ini.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                              <th className="py-3 px-4">No. Pembayaran</th>
                              <th className="py-3 px-4">Tanggal Diterima</th>
                              <th className="py-3 px-4">Keterangan / Alokasi</th>
                              <th className="py-3 px-4 text-center">Status</th>
                              <th className="py-3 px-4 text-right">Nominal Uang Masuk</th>
                              <th className="py-3 px-4 text-center">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {paymentItems.map((pay, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                  {pay.referenceNo}
                                </td>
                                <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                                  {formatDate(pay.date)}
                                </td>
                                <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                                  {pay.description}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {getStatusBadge(pay.status)}
                                </td>
                                <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                  {formatCurrency(pay.credit || pay.amount)}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <button
                                    onClick={() => handleDrillDown('PAYMENT', pay.referenceId)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                    title="Lihat kuitansi / bukti pembayaran"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 4: 📑 BUKU KAS AKUNTANSI (FORMAL GENERAL LEDGER) */}
              {/* ========================================================================= */}
              {activeTab === 'buku_besar' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-1">
                    <p className="flex items-center gap-1.5 font-medium">
                      <Info className="w-3.5 h-3.5 text-blue-600" />
                      Laporan buku besar akuntansi formal untuk pencocokan mutasi tagihan (debit), penerimaan uang (kredit), dan saldo piutang berjalan.
                    </p>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {filteredTimelineItems.length} Baris Jurnal
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-800 shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                            <th className="py-3 px-4 whitespace-nowrap">Tanggal</th>
                            <th className="py-3 px-4 whitespace-nowrap">Jenis Dokumen</th>
                            <th className="py-3 px-4">Uraian / Nomor Dokumen</th>
                            <th className="py-3 px-4 text-center">Status</th>
                            <th className="py-3 px-4 text-right whitespace-nowrap">Tagihan Keluar (Debit)</th>
                            <th className="py-3 px-4 text-right whitespace-nowrap">Uang Diterima (Kredit)</th>
                            <th className="py-3 px-4 text-right whitespace-nowrap">Sisa Piutang Berjalan</th>
                            <th className="py-3 px-4 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {filteredTimelineItems.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-12 text-center text-slate-400">
                                Tidak ada mutasi transaksi pada pencarian ini.
                              </td>
                            </tr>
                          ) : (
                            filteredTimelineItems.map((item, idx) => (
                              <tr
                                key={`ledger-${item.type}-${item.referenceId}-${idx}`}
                                className="hover:bg-slate-50/60 dark:hover:bg-slate-750/50 transition-colors"
                              >
                                <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                  {formatDate(item.date)}
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap">
                                  {getItemBadge(item.type)}
                                </td>
                                <td className="py-3 px-4 text-slate-800 dark:text-slate-200 max-w-xs">
                                  <div className="font-bold flex items-center gap-1.5">
                                    <span>{item.referenceNo}</span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                    {item.description}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-center whitespace-nowrap">
                                  {getStatusBadge(item.status)}
                                </td>
                                <td className="py-3 px-4 text-right font-mono font-semibold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                                  {item.debit > 0 ? formatCurrency(item.debit) : '-'}
                                </td>
                                <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                  {item.credit > 0 ? formatCurrency(item.credit) : '-'}
                                </td>
                                <td className="py-3 px-4 text-right font-mono font-black text-slate-900 dark:text-white whitespace-nowrap">
                                  {formatCurrency(item.runningBalance)}
                                </td>
                                <td className="py-3 px-4 text-center whitespace-nowrap">
                                  <button
                                    onClick={() => handleDrillDown(item.type, item.referenceId)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                    title="Lihat transaksi sumber"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-50/90 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-700 font-bold text-xs">
                            <td colSpan={4} className="py-3 px-4 text-right uppercase tracking-wider text-slate-600 dark:text-slate-400">
                              Total Akumulasi
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-rose-600 dark:text-rose-400 font-black">
                              {formatCurrency(statement?.totalInvoiceAmount || 0)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400 font-black">
                              {formatCurrency(statement?.totalPaidAmount || 0)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-slate-900 dark:text-white font-black">
                              {formatCurrency(statement?.totalOutstandingAmount || 0)}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerStatementDrawer;

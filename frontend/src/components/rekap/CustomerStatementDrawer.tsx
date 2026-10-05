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
  ArrowDownRight,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { getCustomerStatement } from '@/api/rekapApi';
import { CustomerStatement, CustomerStatementItem, StatementItemType } from '@/types/rekap';
import { formatCurrency, formatDate } from '@/lib/utils';
import { exportCustomerStatementToExcel } from '@/utils/excelExport';


interface CustomerStatementDrawerProps {
  customerId: number | null;
  customerName?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  onClose: () => void;
}

export const CustomerStatementDrawer: React.FC<CustomerStatementDrawerProps> = ({
  customerId,
  customerName,
  initialStartDate,
  initialEndDate,
  onClose,
}) => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(initialStartDate || '');
  const [endDate, setEndDate] = useState<string>(initialEndDate || '');

  const {
    data: statement,
    isLoading,
    isError,
    refetch,
  } = useQuery<CustomerStatement>({
    queryKey: ['customerStatement', customerId, startDate, endDate],
    queryFn: () => getCustomerStatement(customerId!, { startDate, endDate }),
    enabled: !!customerId,
  });

  if (!customerId) return null;

  // Filter items by type and search term
  const filteredItems = (statement?.items || []).filter((item: CustomerStatementItem) => {
    if (filterType !== 'ALL' && item.type !== filterType) {
      return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchNo = item.referenceNo.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchStatus = item.status.toLowerCase().includes(q);
      const matchNotes = item.notes?.toLowerCase().includes(q);
      if (!matchNo && !matchDesc && !matchStatus && !matchNotes) {
        return false;
      }
    }
    return true;
  });

  const getItemTypeBadge = (type: StatementItemType) => {
    switch (type) {
      case 'KEGIATAN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <HardHat className="w-3.5 h-3.5" /> Proyek
          </span>
        );
      case 'SPH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <FileText className="w-3.5 h-3.5" /> SPH
          </span>
        );
      case 'INVOICE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Receipt className="w-3.5 h-3.5" /> Faktur
          </span>
        );
      case 'PAYMENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CreditCard className="w-3.5 h-3.5" /> Pembayaran
          </span>
        );
      case 'DEPOSIT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Wallet className="w-3.5 h-3.5" /> Deposit
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-dark-bg-subtle text-dark-text-muted">
            {type}
          </span>
        );
    }
  };

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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-fade-in flex justify-end">
      <div className="w-full max-w-5xl bg-dark-bg border-l border-dark-border h-full flex flex-col shadow-2xl animate-slide-in">
        {/* Top Sticky Header */}
        <div className="p-6 border-b border-dark-border bg-dark-card/90 backdrop-blur-md flex items-start justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-navy to-brand-gold/30 border border-brand-gold/40 flex items-center justify-center text-xl font-bold text-brand-gold shadow-lg shadow-black/40">
              {statement?.customerName ? statement.customerName.charAt(0).toUpperCase() : (customerName ? customerName.charAt(0).toUpperCase() : 'C')}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-dark-text tracking-tight">
                  {statement?.customerName || customerName || 'Buku Besar Customer'}
                </h2>
                {statement?.customerCode && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-dark-bg-subtle text-brand-gold border border-dark-border">
                    {statement.customerCode}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Customer Statement
                </span>
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-4 mt-2 text-xs text-dark-text-muted flex-wrap">
                {statement?.company && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-brand-gold/80" />
                    <span>{statement.company}</span>
                  </div>
                )}
                {statement?.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-dark-text-muted" />
                    <span>{statement.phone}</span>
                  </div>
                )}
                {statement?.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-dark-text-muted" />
                    <span>{statement.email}</span>
                  </div>
                )}
                {statement?.address && (
                  <div className="flex items-center gap-1.5 truncate max-w-xs">
                    <MapPin className="w-3.5 h-3.5 text-dark-text-muted" />
                    <span className="truncate">{statement.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/customers/${customerId}`)}
              className="px-3 py-1.5 rounded-xl border border-dark-border hover:border-brand-gold/50 bg-dark-bg-subtle text-dark-text hover:text-brand-gold text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm"
              title="Buka profil master customer"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Master Customer
            </button>
            <button
              onClick={() => exportCustomerStatementToExcel(statement)}
              className="px-3 py-1.5 rounded-xl border border-dark-border hover:border-emerald-500/50 bg-dark-bg-subtle text-dark-text hover:text-emerald-400 text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm"
              title="Unduh Buku Besar dalam format Excel Multi-Sheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Ekspor Excel
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl border border-dark-border hover:border-dark-border-hover bg-dark-bg-subtle text-dark-text text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm"
              title="Cetak Statement"
            >
              <Printer className="w-3.5 h-3.5" /> Cetak
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-dark-text-muted hover:text-dark-text hover:bg-dark-bg-subtle transition-all"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="space-y-4 py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-gold border-r-transparent"></div>
              <p className="text-sm text-dark-text-muted">Memuat buku besar & riwayat transaksi customer...</p>
            </div>
          ) : isError ? (
            <div className="p-8 text-center bg-rose-500/10 border border-rose-500/30 rounded-2xl">
              <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-rose-400">Gagal Mengambil Data Statement</h3>
              <p className="text-sm text-dark-text-muted mt-1">
                Terjadi kesalahan saat memuat data riwayat customer.
              </p>
              <button
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 bg-dark-card border border-dark-border rounded-xl text-sm font-medium hover:bg-dark-bg-subtle text-dark-text"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <>
              {/* Financial Health Bento Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3.5 rounded-2xl bg-dark-card border border-dark-border shadow-sm">
                  <div className="flex items-center justify-between text-dark-text-muted text-xs font-medium mb-1">
                    <span>Proyek</span>
                    <HardHat className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="text-lg font-bold text-dark-text">
                    {statement?.totalKegiatanCount || 0}
                  </div>
                  <div className="text-[11px] text-dark-text-muted mt-0.5 truncate">
                    {formatCurrency(statement?.totalKegiatanAmount || 0)}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-dark-card border border-dark-border shadow-sm">
                  <div className="flex items-center justify-between text-dark-text-muted text-xs font-medium mb-1">
                    <span>Penawaran</span>
                    <FileText className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <div className="text-lg font-bold text-dark-text">
                    {statement?.totalPenawaranCount || 0}
                  </div>
                  <div className="text-[11px] text-dark-text-muted mt-0.5 truncate">
                    {formatCurrency(statement?.totalPenawaranAmount || 0)}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-dark-card border border-dark-border shadow-sm">
                  <div className="flex items-center justify-between text-dark-text-muted text-xs font-medium mb-1">
                    <span>Faktur</span>
                    <Receipt className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div className="text-lg font-bold text-dark-text">
                    {statement?.totalInvoiceCount || 0}
                  </div>
                  <div className="text-[11px] text-dark-text-muted mt-0.5 truncate">
                    {formatCurrency(statement?.totalInvoiceAmount || 0)}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-dark-card border border-dark-border shadow-sm">
                  <div className="flex items-center justify-between text-dark-text-muted text-xs font-medium mb-1">
                    <span>Kas Masuk</span>
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-lg font-bold text-emerald-400 truncate">
                    {formatCurrency(statement?.totalPaidAmount || 0)}
                  </div>
                  <div className="text-[11px] text-dark-text-muted mt-0.5">
                    Total Pembayaran
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-500/10 to-amber-500/10 border border-rose-500/20 shadow-sm">
                  <div className="flex items-center justify-between text-rose-300 text-xs font-medium mb-1">
                    <span>Sisa Piutang</span>
                    <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                  <div className="text-lg font-bold text-rose-400 truncate">
                    {formatCurrency(statement?.totalOutstandingAmount || 0)}
                  </div>
                  <div className="text-[11px] text-rose-300/70 mt-0.5">
                    {(statement?.totalOutstandingAmount || 0) > 0 ? 'Belum Lunas' : 'Nihil / Lunas'}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 shadow-sm">
                  <div className="flex items-center justify-between text-emerald-300 text-xs font-medium mb-1">
                    <span>Saldo Deposit</span>
                    <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-lg font-bold text-emerald-400 truncate">
                    {formatCurrency(statement?.depositBalance || 0)}
                  </div>
                  <div className="text-[11px] text-emerald-300/70 mt-0.5">
                    Saldo Aktif
                  </div>
                </div>
              </div>

              {/* Filter & Toolbar */}
              <div className="p-4 rounded-2xl bg-dark-card border border-dark-border space-y-3">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  {/* Category Pill Filters */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { id: 'ALL', label: `Semua Transaksi (${statement?.items?.length || 0})` },
                      { id: 'KEGIATAN', label: `Proyek (${statement?.items?.filter(i => i.type === 'KEGIATAN').length || 0})` },
                      { id: 'SPH', label: `SPH (${statement?.items?.filter(i => i.type === 'SPH').length || 0})` },
                      { id: 'INVOICE', label: `Faktur (${statement?.items?.filter(i => i.type === 'INVOICE').length || 0})` },
                      { id: 'PAYMENT', label: `Pembayaran (${statement?.items?.filter(i => i.type === 'PAYMENT').length || 0})` },
                      { id: 'DEPOSIT', label: `Deposit (${statement?.items?.filter(i => i.type === 'DEPOSIT').length || 0})` },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setFilterType(tab.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          filterType === tab.id
                            ? 'bg-brand-navy text-brand-gold border border-brand-gold/40 shadow-sm'
                            : 'bg-dark-bg-subtle text-dark-text-muted hover:text-dark-text border border-transparent'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Search within Drawer */}
                  <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-text-muted" />
                    <input
                      type="text"
                      placeholder="Cari transaksi..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-dark-bg-subtle border border-dark-border text-dark-text placeholder-dark-text-muted focus:outline-none focus:border-brand-gold/50"
                    />
                  </div>
                </div>

                {/* Sub-toolbar: Date Range */}
                <div className="flex items-center gap-3 pt-2 border-t border-dark-border/50 text-xs text-dark-text-muted flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-gold/70" />
                    <span>Rentang Audit:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="px-2.5 py-1 rounded-lg text-xs bg-dark-bg-subtle border border-dark-border text-dark-text focus:outline-none focus:border-brand-gold/50"
                    />
                    <span className="text-dark-text-muted">s/d</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="px-2.5 py-1 rounded-lg text-xs bg-dark-bg-subtle border border-dark-border text-dark-text focus:outline-none focus:border-brand-gold/50"
                    />
                    {(startDate || endDate) && (
                      <button
                        onClick={() => {
                          setStartDate('');
                          setEndDate('');
                        }}
                        className="text-xs text-brand-gold hover:underline ml-1"
                      >
                        Reset Rentang
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Ledger Timeline Table */}
              <div className="rounded-2xl border border-dark-border overflow-hidden bg-dark-card shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-dark-bg-subtle border-b border-dark-border text-dark-text-muted font-semibold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4">Tanggal</th>
                        <th className="py-3 px-4">Tipe & Dokumen</th>
                        <th className="py-3 px-4">Uraian / Transaksi</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Tagihan (Debit)</th>
                        <th className="py-3 px-4 text-right">Pembayaran (Kredit)</th>
                        <th className="py-3 px-4 text-right">Saldo Piutang</th>
                        <th className="py-3 px-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/60">
                      {filteredItems.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-dark-text-muted">
                            <Clock className="w-8 h-8 text-dark-text-muted/40 mx-auto mb-2" />
                            <p className="text-sm font-medium">Tidak ada riwayat transaksi pada filter ini.</p>
                            <p className="text-xs mt-1">Coba sesuaikan tipe atau rentang tanggal.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredItems.map((item, idx) => (
                          <tr
                            key={`${item.type}-${item.referenceId}-${idx}`}
                            className="hover:bg-dark-bg-subtle/50 transition-colors group"
                          >
                            <td className="py-3 px-4 font-mono text-dark-text whitespace-nowrap">
                              {formatDate(item.date)}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {getItemTypeBadge(item.type)}
                                <button
                                  onClick={() => handleDrillDown(item.type, item.referenceId)}
                                  className="font-mono text-xs text-brand-gold hover:underline flex items-center gap-1 group-hover:text-amber-300 transition-colors"
                                  title={`Buka detail ${item.referenceNo}`}
                                >
                                  {item.referenceNo}
                                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-dark-text max-w-xs">
                              <div className="truncate font-medium">{item.description}</div>
                              {item.notes && (
                                <div className="text-[11px] text-dark-text-muted truncate mt-0.5">
                                  {item.notes}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-dark-bg-subtle text-dark-text-muted border border-dark-border">
                                {item.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-medium text-rose-400 whitespace-nowrap">
                              {item.debit > 0 ? (
                                <span className="inline-flex items-center gap-1">
                                  <ArrowUpRight className="w-3 h-3 text-rose-400" />
                                  {formatCurrency(item.debit)}
                                </span>
                              ) : (
                                <span className="text-dark-text-muted/40">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-medium text-emerald-400 whitespace-nowrap">
                              {item.credit > 0 ? (
                                <span className="inline-flex items-center gap-1">
                                  <ArrowDownRight className="w-3 h-3 text-emerald-400" />
                                  {formatCurrency(item.credit)}
                                </span>
                              ) : (
                                <span className="text-dark-text-muted/40">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap text-dark-text">
                              {formatCurrency(item.runningBalance)}
                            </td>
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              <button
                                onClick={() => handleDrillDown(item.type, item.referenceId)}
                                className="p-1 rounded-lg text-dark-text-muted hover:text-brand-gold hover:bg-dark-bg-subtle transition-all"
                                title="Lihat Transaksi Sumber"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Ledger Footer Summary */}
                <div className="p-4 bg-dark-bg-subtle border-t border-dark-border flex items-center justify-between text-xs text-dark-text-muted flex-wrap gap-3">
                  <div>
                    Menampilkan <span className="font-semibold text-dark-text">{filteredItems.length}</span> baris peristiwa buku besar.
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      Total Debit: <span className="font-mono font-semibold text-rose-400">{formatCurrency(filteredItems.reduce((acc, i) => acc + (i.debit || 0), 0))}</span>
                    </div>
                    <div>
                      Total Kredit: <span className="font-mono font-semibold text-emerald-400">{formatCurrency(filteredItems.reduce((acc, i) => acc + (i.credit || 0), 0))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  History,
  AlertCircle,
  Receipt,
  RefreshCw,
  X
} from 'lucide-react';
import { depositApi } from '../api/depositApi';
import { invoiceApi } from '../api/invoiceApi';
import { CustomerDepositSummary, DepositTransaction, DepositTransactionType } from '../types/deposit';
import { Invoice } from '../types/invoice';
import { useAuth } from '../context/AuthContext';
import { BentoCard } from '@/components/common/BentoCard';
import { PageHeader } from '@/components/common/PageHeader';

const TYPE_CONFIG: Record<DepositTransactionType, { label: string; bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  DEPOSIT_IN: {
    label: 'Deposit Masuk',
    bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    text: 'text-emerald-600',
    icon: ArrowDownLeft,
  },
  DEPOSIT_USED: {
    label: 'Penggunaan Deposit',
    bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    text: 'text-blue-600',
    icon: ArrowUpRight,
  },
  DEPOSIT_REFUND: {
    label: 'Pengembalian / Refund',
    bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    text: 'text-rose-600',
    icon: ArrowUpRight,
  },
  DEPOSIT_ADJUSTMENT: {
    label: 'Penyesuaian Saldo',
    bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    text: 'text-amber-600',
    icon: RefreshCw,
  },
};

export const DepositListPage: React.FC = () => {
  const { user } = useAuth();
  const isOperator = user?.role === 'OPERATOR';

  const [depositSummaries, setDepositSummaries] = useState<CustomerDepositSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // History Drawer/Modal State
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDepositSummary | null>(null);
  const [historyList, setHistoryList] = useState<DepositTransaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(0);

  // Use Deposit Modal State
  const [useDepositCustomer, setUseDepositCustomer] = useState<CustomerDepositSummary | null>(null);
  const [customerInvoices, setCustomerInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | ''>('');
  const [depositAmountToUse, setDepositAmountToUse] = useState<string>('');
  const [useDepositNotes, setUseDepositNotes] = useState('');
  const [isSubmittingUse, setIsSubmittingUse] = useState(false);
  const [useError, setUseError] = useState<string | null>(null);

  useEffect(() => {
    loadSummaries();
  }, []);

  const loadSummaries = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await depositApi.getCustomerDeposits();
      setDepositSummaries(data);
    } catch (err: any) {
      console.error('Gagal memuat deposit:', err);
      setErrorMsg(err.response?.data?.message || 'Gagal memuat data deposit');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenHistory = async (summary: CustomerDepositSummary, page = 0) => {
    setSelectedCustomer(summary);
    setHistoryPage(page);
    setLoadingHistory(true);
    try {
      const res = await depositApi.getCustomerDepositHistory(summary.customerId, page, 10);
      setHistoryList(res.content);
      setHistoryTotalPages(res.totalPages);
    } catch (err) {
      console.error('Gagal memuat mutasi deposit:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleOpenUseDeposit = async (summary: CustomerDepositSummary) => {
    setUseDepositCustomer(summary);
    setSelectedInvoiceId('');
    setDepositAmountToUse('');
    setUseDepositNotes('');
    setUseError(null);
    setLoadingInvoices(true);
    try {
      const res = await invoiceApi.getInvoiceList({
        customerId: summary.customerId,
        status: 'ISSUED',
        page: 0,
        size: 50,
      });
      const unSettled = res.content.filter((inv) => inv.paymentStatus !== 'PAID' && inv.outstanding > 0);
      setCustomerInvoices(unSettled);
    } catch (err) {
      console.error('Gagal memuat faktur customer:', err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleSubmitUseDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!useDepositCustomer || !selectedInvoiceId) return;

    const useAmt = parseFloat(depositAmountToUse) || 0;
    if (useAmt <= 0) {
      setUseError('Nominal penggunaan harus lebih besar dari 0');
      return;
    }

    if (useAmt > useDepositCustomer.depositBalance) {
      setUseError(`Nominal melebihi saldo deposit tersedia (Rp ${useDepositCustomer.depositBalance.toLocaleString()})`);
      return;
    }

    const targetInv = customerInvoices.find((i) => i.id === selectedInvoiceId);
    if (targetInv && useAmt > targetInv.outstanding) {
      setUseError(`Nominal melebihi sisa tagihan faktur ${targetInv.number} (Rp ${targetInv.outstanding.toLocaleString()})`);
      return;
    }

    setIsSubmittingUse(true);
    setUseError(null);

    try {
      await depositApi.useDeposit({
        customerId: useDepositCustomer.customerId,
        invoiceId: Number(selectedInvoiceId),
        amount: useAmt,
        notes: useDepositNotes.trim() || undefined,
      });

      setUseDepositCustomer(null);
      await loadSummaries();
    } catch (err: any) {
      console.error('Gagal menggunakan deposit:', err);
      setUseError(err.response?.data?.message || 'Gagal menggunakan deposit');
    } finally {
      setIsSubmittingUse(false);
    }
  };

  const formatCurrency = (val: number | undefined) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const filteredSummaries = depositSummaries.filter(
    (s) =>
      s.customerName.toLowerCase().includes(search.toLowerCase()) ||
      s.customerCode.toLowerCase().includes(search.toLowerCase()) ||
      (s.companyName && s.companyName.toLowerCase().includes(search.toLowerCase()))
  );

  const totalActiveDeposit = depositSummaries.reduce((acc, curr) => acc + Number(curr.depositBalance), 0);
  const totalInDeposit = depositSummaries.reduce((acc, curr) => acc + Number(curr.totalDepositIn), 0);
  const totalUsedDeposit = depositSummaries.reduce((acc, curr) => acc + Number(curr.totalDepositUsed), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <PageHeader
        icon={Wallet}
        backUrl="/pembayaran"
        title="Buku Kas Deposit Customer"
        subtitle="Manajemen ledger mutasi saldo deposit pelanggan dari kelebihan pembayaran faktur (AGENTS.md §10.4)."
        badge={
          <span className="text-[11px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/20">
            Ledger Deposit
          </span>
        }
        actions={
          <button
            onClick={loadSummaries}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition shadow-xs"
          >
            <RefreshCw className="w-4 h-4 text-brand-500" />
            Segarkan Data
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BentoCard className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Saldo Deposit Aktif
            </span>
            <div className="mt-2 text-2xl font-black font-mono text-amber-500">
              {formatCurrency(totalActiveDeposit)}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">Total dana mengendap milik seluruh pelanggan</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Wallet className="w-6 h-6" />
          </div>
        </BentoCard>

        <BentoCard className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Deposit Masuk
            </span>
            <div className="mt-2 text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalInDeposit)}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">Akumulasi kelebihan pembayaran yang pernah dicatat</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </BentoCard>

        <BentoCard className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Deposit Digunakan
            </span>
            <div className="mt-2 text-2xl font-black font-mono text-brand-600 dark:text-brand-400">
              {formatCurrency(totalUsedDeposit)}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">Dipakai untuk settlement faktur penjualan berikutnya</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/20">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </BentoCard>
      </div>

      {/* Filter Bar */}
      <BentoCard className="p-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari customer, kode, atau nama perusahaan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Ditemukan <strong className="text-slate-800 dark:text-slate-200">{filteredSummaries.length}</strong> customer
        </span>
      </BentoCard>

      {/* Table Card */}
      <BentoCard className="overflow-hidden p-0">
        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border-b border-rose-500/20 text-rose-800 dark:text-rose-300 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100/70 dark:bg-slate-900/70 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4">Kode & Customer</th>
                <th className="px-4 py-4 text-right">Saldo Deposit Aktif</th>
                <th className="px-4 py-4 text-right">Total Masuk</th>
                <th className="px-4 py-4 text-right">Total Digunakan</th>
                <th className="px-4 py-4 text-center">Mutasi</th>
                <th className="px-5 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                      <span className="text-xs font-semibold">Memuat daftar deposit customer...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSummaries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <Wallet className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    Belum ada customer yang memiliki riwayat deposit.
                  </td>
                </tr>
              ) : (
                filteredSummaries.map((s) => (
                  <tr key={s.customerId} className="hover:bg-white/40 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{s.customerName}</div>
                      <div className="text-xs text-slate-400 font-mono">
                        {s.customerCode} {s.companyName ? `• ${s.companyName}` : ''}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-right font-black font-mono text-amber-500 text-base">
                      {formatCurrency(s.depositBalance)}
                    </td>

                    <td className="px-4 py-4 text-right text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      {formatCurrency(s.totalDepositIn)}
                    </td>

                    <td className="px-4 py-4 text-right text-brand-600 dark:text-brand-400 font-mono font-bold">
                      {formatCurrency(s.totalDepositUsed)}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                        {s.transactionCount} transaksi
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleOpenHistory(s)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition shadow-xs"
                        >
                          <History className="w-3.5 h-3.5 text-slate-500" />
                          Buku Kas
                        </button>

                        {isOperator && Number(s.depositBalance) > 0 && (
                          <button
                            onClick={() => handleOpenUseDeposit(s)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition shadow-xs"
                          >
                            <Receipt className="w-3.5 h-3.5 text-amber-500" />
                            Gunakan Deposit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </BentoCard>

      {/* Ledger History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bento-card max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-500" />
                  Buku Kas Deposit: {selectedCustomer.customerName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  Kode: {selectedCustomer.customerCode} • Saldo Saat Ini: {formatCurrency(selectedCustomer.depositBalance)}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {loadingHistory ? (
                <div className="py-12 text-center text-slate-400">
                  <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-2" />
                  Memuat riwayat mutasi...
                </div>
              ) : historyList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-medium">
                  Belum ada mutasi deposit untuk customer ini.
                </div>
              ) : (
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-100/70 dark:bg-slate-900/70 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider sticky top-0">
                    <tr>
                      <th className="px-3 py-2.5">Waktu</th>
                      <th className="px-3 py-2.5">Jenis Mutasi</th>
                      <th className="px-3 py-2.5 text-right">Nominal (Rp)</th>
                      <th className="px-3 py-2.5 text-right">Saldo Sesudah</th>
                      <th className="px-3 py-2.5">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {historyList.map((tx) => {
                      const cfg = TYPE_CONFIG[tx.type] || TYPE_CONFIG.DEPOSIT_IN;
                      const Icon = cfg.icon;
                      const isCredit = tx.type === 'DEPOSIT_IN' || tx.type === 'DEPOSIT_ADJUSTMENT';

                      return (
                        <tr key={tx.id} className="hover:bg-white/40 dark:hover:bg-slate-800/40">
                          <td className="px-3 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap font-medium">
                            {new Date(tx.createdAt).toLocaleString('id-ID')}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg.bg}`}>
                              <Icon className="w-3 h-3" />
                              {cfg.label}
                            </span>
                          </td>
                          <td className={`px-3 py-3 text-right font-mono font-bold whitespace-nowrap ${isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                          </td>
                          <td className="px-3 py-3 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                            {formatCurrency(tx.balanceAfter)}
                          </td>
                          <td className="px-3 py-3 text-xs text-slate-600 dark:text-slate-300">
                            <div>{tx.notes}</div>
                            {tx.referenceNumber && (
                              <div className="text-[11px] text-brand-600 dark:text-brand-400 font-mono mt-0.5">
                                Ref: {tx.referenceNumber}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Halaman {historyPage + 1} dari {historyTotalPages || 1}
              </span>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-bold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Use Deposit Modal */}
      {useDepositCustomer && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmitUseDeposit} className="bento-card max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-amber-500" />
                  Gunakan Deposit ke Faktur
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Customer: <strong className="text-slate-800 dark:text-slate-200">{useDepositCustomer.customerName}</strong> • Saldo:{' '}
                  <strong className="text-amber-500">{formatCurrency(useDepositCustomer.depositBalance)}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUseDepositCustomer(null)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {useError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                {useError}
              </div>
            )}

            {/* Target Invoice */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Faktur Tujuan <span className="text-rose-500">*</span>
              </label>
              {loadingInvoices ? (
                <div className="text-xs text-slate-400 py-2 font-medium">Memuat faktur yang belum lunas...</div>
              ) : customerInvoices.length === 0 ? (
                <div className="text-xs text-slate-500 dark:text-slate-400 py-2 bg-white/50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 font-medium">
                  Tidak ada faktur dengan status belum lunas untuk customer ini.
                </div>
              ) : (
                <select
                  required
                  value={selectedInvoiceId}
                  onChange={(e) => {
                    const id = e.target.value ? Number(e.target.value) : '';
                    setSelectedInvoiceId(id);
                    if (id) {
                      const inv = customerInvoices.find((i) => i.id === id);
                      if (inv) {
                        const maxUsable = Math.min(useDepositCustomer.depositBalance, inv.outstanding);
                        setDepositAmountToUse(maxUsable.toString());
                      }
                    }
                  }}
                  className="w-full px-3 py-2 text-xs font-semibold bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                >
                  <option value="">-- Pilih Faktur Tagihan --</option>
                  {customerInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.number} - Sisa: Rp {inv.outstanding.toLocaleString()} (Total: Rp {inv.totalAmount.toLocaleString()})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Nominal Deposit yang Digunakan (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="any"
                max={useDepositCustomer.depositBalance}
                value={depositAmountToUse}
                onChange={(e) => setDepositAmountToUse(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2.5 text-base font-bold font-mono text-slate-900 dark:text-white bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Catatan Penggunaan
              </label>
              <textarea
                rows={2}
                placeholder="Catatan tambahan pemotongan faktur..."
                value={useDepositNotes}
                onChange={(e) => setUseDepositNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200/80 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setUseDepositCustomer(null)}
                className="px-4 py-2 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmittingUse || customerInvoices.length === 0 || !selectedInvoiceId}
                className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-amber-500/25 disabled:opacity-50"
              >
                {isSubmittingUse ? 'Memproses...' : 'Terapkan Pemotongan Faktur'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DepositListPage;

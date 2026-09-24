import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  ArrowLeft,
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

const TYPE_CONFIG: Record<DepositTransactionType, { label: string; bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  DEPOSIT_IN: {
    label: 'Deposit Masuk',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    text: 'text-emerald-600',
    icon: ArrowDownLeft,
  },
  DEPOSIT_USED: {
    label: 'Penggunaan Deposit',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    text: 'text-blue-600',
    icon: ArrowUpRight,
  },
  DEPOSIT_REFUND: {
    label: 'Pengembalian / Refund',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    text: 'text-rose-600',
    icon: ArrowUpRight,
  },
  DEPOSIT_ADJUSTMENT: {
    label: 'Penyesuaian Saldo',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    text: 'text-amber-600',
    icon: RefreshCw,
  },
};

export const DepositListPage: React.FC = () => {
  const navigate = useNavigate();
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
      console.error('Gagal memuat riwayat deposit:', err);
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => navigate('/pembayaran')}
              className="p-1 hover:bg-slate-200 text-slate-500 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Wallet className="w-7 h-7 text-amber-600" />
              Buku Deposit Customer
            </h1>
          </div>
          <p className="text-slate-500 text-sm">
            Manajemen ledger mutasi saldo deposit customer yang berasal dari kelebihan pembayaran faktur (AGENTS.md §10.4)
          </p>
        </div>

        <button
          onClick={loadSummaries}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition"
        >
          <RefreshCw className="w-4 h-4" />
          Segarkan Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Saldo Deposit Aktif</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-amber-600">
            {formatCurrency(totalActiveDeposit)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Total dana mengendap milik seluruh customer</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Deposit Masuk</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-emerald-600">
            {formatCurrency(totalInDeposit)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Akumulasi kelebihan pembayaran yang pernah dicatat</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Deposit Digunakan</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-blue-600">
            {formatCurrency(totalUsedDeposit)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Dipakai untuk settlement faktur penjualan berikutnya</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari customer, kode, atau nama perusahaan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <span className="text-xs text-slate-500">
          Ditemukan <strong>{filteredSummaries.length}</strong> customer
        </span>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {errorMsg && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-700 text-sm">
            {errorMsg}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4">Kode & Customer</th>
                <th className="px-4 py-4 text-right">Saldo Deposit Aktif</th>
                <th className="px-4 py-4 text-right">Total Masuk</th>
                <th className="px-4 py-4 text-right">Total Digunakan</th>
                <th className="px-4 py-4 text-center">Mutasi</th>
                <th className="px-5 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                      Memuat daftar deposit customer...
                    </div>
                  </td>
                </tr>
              ) : filteredSummaries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <Wallet className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    Belum ada customer yang memiliki riwayat deposit.
                  </td>
                </tr>
              ) : (
                filteredSummaries.map((s) => (
                  <tr key={s.customerId} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{s.customerName}</div>
                      <div className="text-xs text-slate-400 font-mono">
                        {s.customerCode} {s.companyName ? `• ${s.companyName}` : ''}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-right font-bold text-amber-600 text-base">
                      {formatCurrency(s.depositBalance)}
                    </td>

                    <td className="px-4 py-4 text-right text-emerald-600 font-medium">
                      {formatCurrency(s.totalDepositIn)}
                    </td>

                    <td className="px-4 py-4 text-right text-blue-600 font-medium">
                      {formatCurrency(s.totalDepositUsed)}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {s.transactionCount} transaksi
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleOpenHistory(s)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
                        >
                          <History className="w-3.5 h-3.5 text-slate-500" />
                          Buku Kas
                        </button>

                        {isOperator && Number(s.depositBalance) > 0 && (
                          <button
                            onClick={() => handleOpenUseDeposit(s)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-medium transition"
                          >
                            <Receipt className="w-3.5 h-3.5 text-amber-600" />
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
      </div>

      {/* Ledger History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-3xl w-full rounded-3xl p-6 shadow-xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-600" />
                  Buku Kas Deposit: {selectedCustomer.customerName}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Kode: {selectedCustomer.customerCode} • Saldo Saat Ini: {formatCurrency(selectedCustomer.depositBalance)}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {loadingHistory ? (
                <div className="py-12 text-center text-slate-400">
                  <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Memuat riwayat mutasi...
                </div>
              ) : historyList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  Belum ada mutasi deposit untuk customer ini.
                </div>
              ) : (
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider sticky top-0">
                    <tr>
                      <th className="px-3 py-2.5">Waktu</th>
                      <th className="px-3 py-2.5">Jenis Mutasi</th>
                      <th className="px-3 py-2.5 text-right">Nominal (Rp)</th>
                      <th className="px-3 py-2.5 text-right">Saldo Sesudah</th>
                      <th className="px-3 py-2.5">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {historyList.map((tx) => {
                      const cfg = TYPE_CONFIG[tx.type] || TYPE_CONFIG.DEPOSIT_IN;
                      const Icon = cfg.icon;
                      const isCredit = tx.type === 'DEPOSIT_IN' || tx.type === 'DEPOSIT_ADJUSTMENT';

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/50">
                          <td className="px-3 py-3 text-xs text-slate-500 whitespace-nowrap">
                            {new Date(tx.createdAt).toLocaleString('id-ID')}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.bg}`}>
                              <Icon className="w-3 h-3" />
                              {cfg.label}
                            </span>
                          </td>
                          <td className={`px-3 py-3 text-right font-bold whitespace-nowrap ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                          </td>
                          <td className="px-3 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                            {formatCurrency(tx.balanceAfter)}
                          </td>
                          <td className="px-3 py-3 text-xs text-slate-600">
                            <div>{tx.notes}</div>
                            {tx.referenceNumber && (
                              <div className="text-[11px] text-indigo-600 font-mono mt-0.5">
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

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Halaman {historyPage + 1} dari {historyTotalPages || 1}
              </span>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Use Deposit Modal */}
      {useDepositCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSubmitUseDeposit} className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-amber-600" />
                  Gunakan Deposit ke Faktur
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customer: <strong>{useDepositCustomer.customerName}</strong> • Saldo Tersedia:{' '}
                  <strong className="text-amber-600">{formatCurrency(useDepositCustomer.depositBalance)}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUseDepositCustomer(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {useError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {useError}
              </div>
            )}

            {/* Target Invoice */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Faktur Tujuan *
              </label>
              {loadingInvoices ? (
                <div className="text-xs text-slate-400 py-2">Memuat faktur yang belum lunas...</div>
              ) : customerInvoices.length === 0 ? (
                <div className="text-xs text-slate-500 py-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
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
                        // Pre-fill amount with minimum of deposit balance or invoice outstanding
                        const maxUsable = Math.min(useDepositCustomer.depositBalance, inv.outstanding);
                        setDepositAmountToUse(maxUsable.toString());
                      }
                    }
                  }}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nominal Deposit yang Digunakan (Rp) *
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
                className="w-full px-3 py-2.5 text-base font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Catatan Penggunaan
              </label>
              <textarea
                rows={2}
                placeholder="Catatan..."
                value={useDepositNotes}
                onChange={(e) => setUseDepositNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUseDepositCustomer(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmittingUse || customerInvoices.length === 0 || !selectedInvoiceId}
                className="inline-flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-medium transition shadow-sm disabled:opacity-50"
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

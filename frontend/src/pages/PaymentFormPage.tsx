import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Save,
  AlertCircle,
  Building2,
  Calendar,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Sparkles,
  RefreshCw,
  X,
  ShieldCheck,
  Check,
  Info
} from 'lucide-react';
import { paymentApi } from '../api/paymentApi';
import { customerApi } from '../api/customerApi';
import { invoiceApi } from '../api/invoiceApi';
import { Customer } from '../types/customer';
import { Invoice } from '../types/invoice';
import { PaymentMethod } from '../types/payment';
import { useAuth } from '../context/AuthContext';
import { BentoCard } from '@/components/common/BentoCard';
import { PageHeader } from '@/components/common/PageHeader';

export const PaymentFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOperator = user?.role === 'OPERATOR';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [destinationAccount, setDestinationAccount] = useState('Bank Mandiri 142-00-1234567-8 a.n. CV. ANDARA');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  // Billable Invoices for Selected Customer
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [allocations, setAllocations] = useState<Record<number, { amount: string; notes: string }>>({});

  // Auto-allocation mode (True by default, auto-distributes FIFO when amount changes)
  const [autoAllocMode, setAutoAllocMode] = useState<boolean>(true);

  // Confirmation Modal state
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      loadCustomerInvoices(Number(selectedCustomerId));
    } else {
      setInvoices([]);
      setAllocations({});
    }
  }, [selectedCustomerId]);

  const loadCustomers = async () => {
    try {
      const data = await customerApi.getActiveCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Gagal memuat customer:', err);
    }
  };

  const loadCustomerInvoices = async (customerId: number) => {
    setLoadingInvoices(true);
    try {
      const res = await invoiceApi.getInvoiceList({
        customerId,
        status: 'ISSUED',
        page: 0,
        size: 50,
      });

      // Filter only unpaid or partial invoices and sort by date ascending (oldest first - FIFO)
      const unSettled = res.content
        .filter((inv) => inv.paymentStatus !== 'PAID' && inv.outstanding > 0)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.id - b.id);

      setInvoices(unSettled);

      // Reset allocations map and enable auto allocation mode
      setAutoAllocMode(true);
      const initialMap: Record<number, { amount: string; notes: string }> = {};
      unSettled.forEach((inv) => {
        initialMap[inv.id] = { amount: '', notes: '' };
      });
      setAllocations(initialMap);
    } catch (err) {
      console.error('Gagal memuat invoice customer:', err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  // Auto-allocate whenever amount or invoice list changes and autoAllocMode is active
  useEffect(() => {
    if (!autoAllocMode || invoices.length === 0) return;

    const totalPay = parseFloat(amount) || 0;
    let remaining = totalPay;
    const newAlloc: Record<number, { amount: string; notes: string }> = {};

    for (const inv of invoices) {
      const fill = Math.min(inv.outstanding, remaining);
      newAlloc[inv.id] = {
        amount: fill > 0 ? fill.toString() : '',
        notes: allocations[inv.id]?.notes || '',
      };
      remaining = Math.max(0, remaining - fill);
    }

    setAllocations(newAlloc);
  }, [amount, invoices, autoAllocMode]);

  // When user edits allocation manually, disable auto-fill mode
  const handleAllocationChange = (invoiceId: number, val: string) => {
    setAutoAllocMode(false);
    setAllocations((prev) => ({
      ...prev,
      [invoiceId]: {
        ...prev[invoiceId],
        amount: val,
      },
    }));
  };

  const handleNotesChange = (invoiceId: number, val: string) => {
    setAllocations((prev) => ({
      ...prev,
      [invoiceId]: {
        ...prev[invoiceId],
        notes: val,
      },
    }));
  };

  // Reset & trigger automatic FIFO allocation
  const handleResetToAuto = () => {
    setAutoAllocMode(true);
    const totalPay = parseFloat(amount) || 0;
    let remaining = totalPay;
    const newAlloc: Record<number, { amount: string; notes: string }> = {};

    for (const inv of invoices) {
      const fill = Math.min(inv.outstanding, remaining);
      newAlloc[inv.id] = {
        amount: fill > 0 ? fill.toString() : '',
        notes: allocations[inv.id]?.notes || '',
      };
      remaining = Math.max(0, remaining - fill);
    }

    setAllocations(newAlloc);
  };

  // Clear all allocations (e.g. if user wants full amount to go to Deposit Customer)
  const handleClearAllocations = () => {
    setAutoAllocMode(false);
    const cleared: Record<number, { amount: string; notes: string }> = {};
    invoices.forEach((inv) => {
      cleared[inv.id] = { amount: '', notes: allocations[inv.id]?.notes || '' };
    });
    setAllocations(cleared);
  };

  // Shortcut: Fill nominal and allocate 100% to this specific invoice
  const handlePayInvoiceFull = (invoice: Invoice) => {
    setAutoAllocMode(false);
    setAmount(invoice.outstanding.toString());

    const newMap: Record<number, { amount: string; notes: string }> = {};
    invoices.forEach((inv) => {
      newMap[inv.id] = {
        amount: inv.id === invoice.id ? invoice.outstanding.toString() : '',
        notes: allocations[inv.id]?.notes || '',
      };
    });
    setAllocations(newMap);
  };

  // Allocate remaining available payment to this specific invoice
  const allocateMaxForInvoice = (invoice: Invoice) => {
    setAutoAllocMode(false);
    const parsedTotalPayment = parseFloat(amount) || 0;
    const currentAllocatedElsewhere = Object.entries(allocations).reduce((acc, [id, data]) => {
      if (Number(id) !== invoice.id) {
        return acc + (parseFloat(data.amount) || 0);
      }
      return acc;
    }, 0);

    const remainingAvailableFromPayment = Math.max(0, parsedTotalPayment - currentAllocatedElsewhere);
    const fillAmount = Math.min(
      invoice.outstanding,
      remainingAvailableFromPayment > 0 ? remainingAvailableFromPayment : invoice.outstanding
    );

    setAllocations((prev) => ({
      ...prev,
      [invoice.id]: {
        ...prev[invoice.id],
        amount: fillAmount > 0 ? fillAmount.toString() : invoice.outstanding.toString(),
      },
    }));
  };

  // Calculations
  const totalPaymentNum = parseFloat(amount) || 0;
  const totalAllocatedNum = Object.values(allocations).reduce((acc, curr) => {
    return acc + (parseFloat(curr.amount) || 0);
  }, 0);
  const excessNum = Math.max(0, totalPaymentNum - totalAllocatedNum);
  const isOverAllocated = totalAllocatedNum > totalPaymentNum;

  const currentCustomer = customers.find((c) => c.id === Number(selectedCustomerId));

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Validation before opening confirmation modal
  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setErrorMessage('Pilih customer terlebih dahulu');
      return;
    }
    if (totalPaymentNum <= 0) {
      setErrorMessage('Nominal pembayaran harus lebih dari 0');
      return;
    }
    if (isOverAllocated) {
      setErrorMessage('Total alokasi melebihi nominal pembayaran yang dimasukkan!');
      return;
    }

    // Validate that no item exceeds outstanding
    for (const [invId, data] of Object.entries(allocations)) {
      const val = parseFloat(data.amount) || 0;
      const inv = invoices.find((i) => i.id === Number(invId));
      if (inv && val > inv.outstanding) {
        setErrorMessage(
          `Alokasi untuk Faktur ${inv.number} (Rp ${val.toLocaleString()}) melebihi sisa tagihan (Rp ${inv.outstanding.toLocaleString()})`
        );
        return;
      }
    }

    setErrorMessage(null);
    setShowConfirmModal(true);
  };

  // Final Submit
  const handleFinalSubmit = async () => {
    const allocationItems = Object.entries(allocations)
      .map(([invoiceId, data]) => ({
        invoiceId: Number(invoiceId),
        amount: parseFloat(data.amount) || 0,
        notes: data.notes?.trim() || undefined,
      }))
      .filter((item) => item.amount > 0);

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const created = await paymentApi.createPayment({
        customerId: Number(selectedCustomerId),
        paymentDate,
        amount: totalPaymentNum,
        paymentMethod,
        destinationAccount: destinationAccount.trim() || undefined,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
        allocations: allocationItems,
      });

      setShowConfirmModal(false);
      navigate(`/pembayaran/${created.id}`);
    } catch (err: any) {
      console.error('Gagal mencatat pembayaran:', err);
      setErrorMessage(err.response?.data?.message || 'Gagal menyimpan transaksi pembayaran');
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  if (!isOperator) {
    return (
      <BentoCard className="max-w-2xl mx-auto p-8 text-center space-y-4">
        <div className="w-14 h-14 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl mx-auto flex items-center justify-center border border-rose-500/20">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Akses Ditolak (403 Forbidden)</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Sesuai tata kelola sistem CV. ANDARA (PRD §5.3 & AGENTS.md §11), hak akses pencatatan transaksi pembayaran dan alokasi finansial secara ketat dibatasi hanya untuk role{' '}
          <strong className="text-slate-900 dark:text-white">OPERATOR</strong>.
        </p>
        <button
          onClick={() => navigate('/pembayaran')}
          className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold rounded-xl transition"
        >
          Kembali ke Daftar Pembayaran
        </button>
      </BentoCard>
    );
  }

  return (
    <form onSubmit={handleOpenConfirmModal} className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Navigation */}
      <PageHeader
        icon={CreditCard}
        backUrl="/pembayaran"
        title="Catat Pembayaran Baru"
        subtitle="Penerimaan pembayaran dari customer dengan alokasi otomatis atau kustom ke faktur penjualan."
        badge={
          <span className="text-[11px] bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold px-2.5 py-0.5 rounded-full border border-brand-500/20">
            Finansial & Kas
          </span>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/pembayaran')}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl transition shadow-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isOverAllocated || !selectedCustomerId || totalPaymentNum <= 0}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              Simpan & Konfirmasi Pembayaran
            </button>
          </div>
        }
      />

      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 text-rose-800 dark:text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Main Form Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Payment Details */}
        <div className="lg:col-span-1 space-y-6">
          <BentoCard className="p-5 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-200/80 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-500" />
              Informasi Transaksi
            </h3>

            {/* Customer Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Customer <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 text-sm bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 font-semibold"
              >
                <option value="">-- Pilih Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name} {c.depositBalance > 0 ? `(Deposit: Rp ${c.depositBalance.toLocaleString()})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Tanggal Pembayaran <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 font-medium"
                />
              </div>
            </div>

            {/* Total Amount */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Nominal Pembayaran (Rp) <span className="text-rose-500">*</span>
                </label>
                {autoAllocMode && invoices.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <Sparkles className="w-3 h-3" /> Auto-Alokasi Aktif
                  </span>
                )}
              </div>
              <input
                type="number"
                required
                min="0.01"
                step="any"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2.5 text-lg font-bold text-slate-900 dark:text-white bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
              {totalPaymentNum > 0 && (
                <div className="text-xs text-brand-600 dark:text-brand-400 font-bold mt-1">
                  Terbilang: {formatCurrency(totalPaymentNum)}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Metode Pembayaran <span className="text-rose-500">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-sm bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 font-medium"
              >
                <option value="BANK_TRANSFER">Transfer Bank</option>
                <option value="CASH">Tunai (Cash)</option>
                <option value="GIRO">Giro / Cek</option>
                <option value="OTHER">Lainnya</option>
              </select>
            </div>

            {/* Destination Account */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Rekening Tujuan / Kas
              </label>
              <input
                type="text"
                placeholder="Contoh: Bank Mandiri 142-00-1234567-8"
                value={destinationAccount}
                onChange={(e) => setDestinationAccount(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>

            {/* Reference */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Nomor Referensi / No. Bukti Transfer
              </label>
              <input
                type="text"
                placeholder="Contoh: TRF-MDR-99210"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Catatan Pembayaran
              </label>
              <textarea
                rows={2}
                placeholder="Catatan tambahan untuk transaksi ini..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 resize-none"
              />
            </div>
          </BentoCard>
        </div>

        {/* Right Column: Invoice Allocation Engine */}
        <div className="lg:col-span-2 space-y-6">
          {/* Existing Deposit Notice (Temuan #5) */}
          {currentCustomer && currentCustomer.depositBalance > 0 && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-start justify-between gap-3 text-amber-900 dark:text-amber-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500/20 text-amber-600 dark:text-amber-300 rounded-xl shrink-0 mt-0.5">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    Informasi Saldo Deposit Customer
                  </div>
                  <div className="text-sm font-semibold">
                    Customer ini memiliki Saldo Deposit aktif sebesar{' '}
                    <span className="font-mono font-black text-amber-700 dark:text-amber-300 text-base">
                      {formatCurrency(currentCustomer.depositBalance)}
                    </span>
                  </div>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                    Jika pembayaran baru ini memiliki kelebihan nominal setelah alokasi faktur, sisa akan otomatis diakumulasikan ke saldo deposit ini.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Allocation Table Card */}
          <BentoCard className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-brand-500" />
                  Alokasi ke Faktur Penjualan (Settlement)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {autoAllocMode
                    ? 'Mode Otomatis FIFO aktif: Alokasi otomatis terisi saat nominal pembayaran dimasukkan.'
                    : 'Mode Manual aktif: Anda telah mengkustomisasi alokasi faktur.'}
                </p>
              </div>

              {selectedCustomerId && invoices.length > 0 && (
                <div className="flex items-center gap-2">
                  {autoAllocMode ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full font-bold border border-emerald-500/20">
                      <Sparkles className="w-3.5 h-3.5" />
                      Auto-Alokasi FIFO
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResetToAuto}
                      className="inline-flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 px-2.5 py-1 rounded-full font-bold border border-brand-500/20 transition"
                      title="Kembalikan ke mode distribusi otomatis dari faktur terlama"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Kembalikan ke Auto-Alokasi
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleClearAllocations}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2.5 py-1 rounded-full font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 transition"
                  >
                    Kosongkan
                  </button>

                  <span className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-bold">
                    {invoices.length} faktur
                  </span>
                </div>
              )}
            </div>

            {!selectedCustomerId ? (
              <div className="py-12 text-center text-slate-400">
                <Building2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                Pilih Customer di panel kiri untuk memuat daftar faktur yang belum lunas.
              </div>
            ) : loadingInvoices ? (
              <div className="py-12 text-center text-slate-400">
                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Memuat daftar faktur customer...
              </div>
            ) : invoices.length === 0 ? (
              <div className="py-8 text-center text-slate-500 bg-emerald-500/5 rounded-2xl p-6 border border-emerald-500/20">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <div className="font-bold text-slate-900 dark:text-white">Seluruh Faktur Customer Sudah Lunas!</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Customer ini tidak memiliki tagihan outstanding. Pembayaran yang dimasukkan sebesar{' '}
                  <span className="font-bold text-brand-600 dark:text-brand-400">{formatCurrency(totalPaymentNum)}</span>{' '}
                  akan dicatat utuh sebagai <span className="font-bold text-amber-600 dark:text-amber-400">Deposit Customer</span>.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                    <thead className="bg-slate-100/70 dark:bg-slate-900/70 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      <tr>
                        <th className="px-3 py-3">No. Faktur</th>
                        <th className="px-3 py-3">Tanggal</th>
                        <th className="px-3 py-3 text-right">Sisa Tagihan</th>
                        <th className="px-3 py-3 text-center">Status Alokasi</th>
                        <th className="px-4 py-3 text-right w-48">Alokasi Bayar (Rp)</th>
                        <th className="px-3 py-3 w-40">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {invoices.map((inv) => {
                        const allocData = allocations[inv.id] || { amount: '', notes: '' };
                        const allocNum = parseFloat(allocData.amount) || 0;
                        const exceeds = allocNum > inv.outstanding;
                        const isFullyCovered = allocNum === inv.outstanding && allocNum > 0;
                        const isPartiallyCovered = allocNum > 0 && allocNum < inv.outstanding;

                        return (
                          <tr key={inv.id} className="hover:bg-white/40 dark:hover:bg-slate-800/40 transition">
                            <td className="px-3 py-3.5 font-bold text-slate-900 dark:text-white">
                              <div className="flex items-center gap-1.5">
                                <span>{inv.number}</span>
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                Total: {formatCurrency(inv.totalAmount)}
                              </div>
                            </td>
                            <td className="px-3 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                              {inv.date}
                            </td>
                            <td className="px-3 py-3.5 text-right">
                              <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                                {formatCurrency(inv.outstanding)}
                              </span>
                            </td>
                            {/* Visual Status Indicator (Temuan #3) */}
                            <td className="px-3 py-3.5 text-center">
                              {exceeds ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                                  <AlertTriangle className="w-3 h-3" /> Lebih
                                </span>
                              ) : isFullyCovered ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                  <Check className="w-3 h-3" /> Lunas
                                </span>
                              ) : isPartiallyCovered ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                                  Sebagian
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">-</span>
                              )}
                            </td>
                            {/* Allocation Input + Quick Action Buttons (Temuan #1 & #6) */}
                            <td className="px-4 py-3.5 text-right">
                              <div className="space-y-1.5">
                                <input
                                  type="number"
                                  min="0"
                                  max={inv.outstanding}
                                  step="any"
                                  placeholder="0"
                                  value={allocData.amount}
                                  onChange={(e) => handleAllocationChange(inv.id, e.target.value)}
                                  className={`w-full px-2.5 py-1.5 text-right font-mono font-bold text-sm rounded-lg focus:outline-none focus:ring-2 ${
                                    exceeds
                                      ? 'border border-rose-500 text-rose-700 bg-rose-500/10 focus:ring-rose-500/20'
                                      : isFullyCovered
                                      ? 'border border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 focus:ring-emerald-500/30'
                                      : 'border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white focus:ring-brand-500/30'
                                  }`}
                                />
                                <div className="flex items-center justify-end gap-2 text-[11px]">
                                  {/* Shortcut: Bayar Lunas Faktur Ini (Temuan #6) */}
                                  <button
                                    type="button"
                                    onClick={() => handlePayInvoiceFull(inv)}
                                    className="text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 font-semibold transition"
                                    title="Isi nominal di panel kiri sama dengan faktur ini dan langsung lunasi"
                                  >
                                    Bayar Penuh
                                  </button>
                                  <span className="text-slate-300 dark:text-slate-700">|</span>
                                  {/* Alokasikan sisa pembayaran */}
                                  <button
                                    type="button"
                                    onClick={() => allocateMaxForInvoice(inv)}
                                    className="text-brand-600 dark:text-brand-400 hover:underline font-bold"
                                  >
                                    Alokasikan Sisa
                                  </button>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3.5">
                              <input
                                type="text"
                                placeholder="Ket. alokasi..."
                                value={allocData.notes}
                                onChange={(e) => handleNotesChange(inv.id, e.target.value)}
                                className="w-full px-2 py-1.5 text-xs bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Live Financial Allocation Summary */}
            <div className="p-4 bg-white/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Nominal Pembayaran Diterima:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(totalPaymentNum)}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Total Alokasi ke Faktur:</span>
                <span
                  className={`font-mono font-bold ${
                    isOverAllocated ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {formatCurrency(totalAllocatedNum)}
                </span>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex items-center justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-300 font-semibold">Sisa Lebih / Masuk Deposit Customer:</span>
                <span className="font-mono font-black text-amber-500 text-base">{formatCurrency(excessNum)}</span>
              </div>

              {/* Status Alert Messages */}
              {isOverAllocated && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2 font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  Total alokasi melebihi nominal pembayaran! Harap sesuaikan alokasi faktur.
                </div>
              )}

              {excessNum > 0 && !isOverAllocated && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2 leading-relaxed font-medium">
                  <Wallet className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                  <div>
                    Terdapat sisa pembayaran sebesar <span className="font-bold">{formatCurrency(excessNum)}</span>.{' '}
                    Sistem akan secara otomatis mencatat kelebihan ini ke{' '}
                    <span className="font-bold underline">Deposit Customer</span> (AGENTS.md §10.3) yang dapat digunakan untuk pemotongan faktur selanjutnya.
                  </div>
                </div>
              )}
            </div>
          </BentoCard>
        </div>
      </div>

      {/* Confirmation Modal (Temuan #4) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl border border-brand-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Konfirmasi Pencatatan Pembayaran
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pastikan rincian finansial di bawah ini telah sesuai sebelum disimpan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block font-medium">Customer:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {currentCustomer?.code} - {currentCustomer?.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Tanggal Bayar:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{paymentDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Metode / Kas:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {paymentMethod === 'BANK_TRANSFER' ? 'Transfer Bank' : paymentMethod}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">No. Referensi:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                    {reference || '-'}
                  </span>
                </div>
              </div>

              {/* Allocation Breakdown */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Rincian Alokasi Faktur</span>
                  <span className="text-slate-400 font-normal normal-case">
                    {Object.values(allocations).filter((a) => (parseFloat(a.amount) || 0) > 0).length} faktur teralokasi
                  </span>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {Object.entries(allocations).filter(([, d]) => (parseFloat(d.amount) || 0) > 0).length === 0 ? (
                    <div className="p-4 text-center text-xs text-amber-700 dark:text-amber-300 bg-amber-500/5">
                      <Info className="w-4 h-4 mx-auto mb-1 text-amber-500" />
                      Tidak ada alokasi ke faktur. Seluruh pembayaran akan dicatat penuh sebagai <strong>Deposit Customer</strong>.
                    </div>
                  ) : (
                    invoices
                      .filter((inv) => (parseFloat(allocations[inv.id]?.amount) || 0) > 0)
                      .map((inv) => {
                        const allocAmount = parseFloat(allocations[inv.id]?.amount) || 0;
                        const isLunas = allocAmount >= inv.outstanding;

                        return (
                          <div key={inv.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">{inv.number}</div>
                              <div className="text-slate-400 text-[11px]">Sisa tagihan: {formatCurrency(inv.outstanding)}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono font-bold text-slate-900 dark:text-white">
                                {formatCurrency(allocAmount)}
                              </div>
                              <div className="text-[10px]">
                                {isLunas ? (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Menjadi LUNAS</span>
                                ) : (
                                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                                    Sebagian (Sisa: {formatCurrency(inv.outstanding - allocAmount)})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>

              {/* Financial Summary Card */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Nominal Diterima:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(totalPaymentNum)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Total Settlement Faktur:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(totalAllocatedNum)}
                  </span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-1.5 flex items-center justify-between font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">Masuk Saldo Deposit:</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {formatCurrency(excessNum)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition"
              >
                Periksa Kembali
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/25 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menyimpan Transaksi...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Ya, Simpan Transaksi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

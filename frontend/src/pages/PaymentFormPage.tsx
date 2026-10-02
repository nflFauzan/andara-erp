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
  Receipt
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

      // Filter only unpaid or partial invoices
      const unSettled = res.content.filter((inv) => inv.paymentStatus !== 'PAID' && inv.outstanding > 0);
      setInvoices(unSettled);

      // Reset allocations map
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

  const handleAllocationChange = (invoiceId: number, val: string) => {
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

  const allocateMaxForInvoice = (invoice: Invoice) => {
    const parsedTotalPayment = parseFloat(amount) || 0;
    const currentAllocatedElsewhere = Object.entries(allocations).reduce((acc, [id, data]) => {
      if (Number(id) !== invoice.id) {
        return acc + (parseFloat(data.amount) || 0);
      }
      return acc;
    }, 0);

    const remainingAvailableFromPayment = Math.max(0, parsedTotalPayment - currentAllocatedElsewhere);
    // Can allocate at most the invoice outstanding or the remaining payment amount
    const fillAmount = Math.min(invoice.outstanding, remainingAvailableFromPayment > 0 ? remainingAvailableFromPayment : invoice.outstanding);

    handleAllocationChange(invoice.id, fillAmount > 0 ? fillAmount.toString() : invoice.outstanding.toString());
  };

  // Calculations
  const totalPaymentNum = parseFloat(amount) || 0;
  const totalAllocatedNum = Object.values(allocations).reduce((acc, curr) => {
    return acc + (parseFloat(curr.amount) || 0);
  }, 0);
  const excessNum = Math.max(0, totalPaymentNum - totalAllocatedNum);
  const isOverAllocated = totalAllocatedNum > totalPaymentNum;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    // Build allocation list for non-zero items
    const allocationItems = Object.entries(allocations)
      .map(([invoiceId, data]) => ({
        invoiceId: Number(invoiceId),
        amount: parseFloat(data.amount) || 0,
        notes: data.notes?.trim() || undefined,
      }))
      .filter((item) => item.amount > 0);

    // Validate that no item exceeds outstanding
    for (const item of allocationItems) {
      const inv = invoices.find((i) => i.id === item.invoiceId);
      if (inv && item.amount > inv.outstanding) {
        setErrorMessage(`Alokasi untuk Faktur ${inv.number} (Rp ${item.amount.toLocaleString()}) melebihi sisa tagihan (Rp ${inv.outstanding.toLocaleString()})`);
        return;
      }
    }

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

      navigate(`/pembayaran/${created.id}`);
    } catch (err: any) {
      console.error('Gagal mencatat pembayaran:', err);
      setErrorMessage(err.response?.data?.message || 'Gagal menyimpan transaksi pembayaran');
      setIsSubmitting(false);
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
          Sesuai tata kelola sistem CV. ANDARA (PRD §5.3 & AGENTS.md §11), hak akses pencatatan transaksi pembayaran dan alokasi finansial secara ketat dibatasi hanya untuk role <strong className="text-slate-900 dark:text-white">OPERATOR</strong>.
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
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Navigation */}
      <PageHeader
        icon={CreditCard}
        backUrl="/pembayaran"
        title="Catat Pembayaran Baru"
        subtitle="Penerimaan pembayaran dari customer dengan alokasi langsung ke faktur penjualan."
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
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Simpan & Konfirmasi Pembayaran
                </>
              )}
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
                    {c.code} - {c.name} {c.depositBalance > 0 ? `(Saldo Deposit: Rp ${c.depositBalance.toLocaleString()})` : ''}
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
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Nominal Pembayaran (Rp) <span className="text-rose-500">*</span>
              </label>
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
          {/* Allocation Table Card */}
          <BentoCard className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-brand-500" />
                  Alokasi ke Faktur Penjualan (Settlement)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tentukan jumlah alokasi pelunasan untuk masing-masing faktur aktif
                </p>
              </div>

              {selectedCustomerId && (
                <span className="text-xs text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-full font-bold border border-brand-500/20">
                  {invoices.length} faktur belum lunas
                </span>
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
                        <th className="px-3 py-3 text-right">Total Tagihan</th>
                        <th className="px-3 py-3 text-right">Sisa Tagihan</th>
                        <th className="px-4 py-3 text-right w-44">Alokasi Bayar (Rp)</th>
                        <th className="px-3 py-3 w-40">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {invoices.map((inv) => {
                        const allocData = allocations[inv.id] || { amount: '', notes: '' };
                        const allocNum = parseFloat(allocData.amount) || 0;
                        const exceeds = allocNum > inv.outstanding;

                        return (
                          <tr key={inv.id} className="hover:bg-white/40 dark:hover:bg-slate-800/40 transition">
                            <td className="px-3 py-3.5 font-bold text-slate-900 dark:text-white">
                              {inv.number}
                            </td>
                            <td className="px-3 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                              {inv.date}
                            </td>
                            <td className="px-3 py-3.5 text-right font-medium text-slate-700 dark:text-slate-300 font-mono">
                              {formatCurrency(inv.totalAmount)}
                            </td>
                            <td className="px-3 py-3.5 text-right">
                              <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                                {formatCurrency(inv.outstanding)}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <div className="space-y-1">
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
                                      : 'border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white focus:ring-brand-500/30'
                                  }`}
                                />
                                <button
                                  type="button"
                                  onClick={() => allocateMaxForInvoice(inv)}
                                  className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline font-bold block text-right w-full"
                                >
                                  Alokasikan Sisa
                                </button>
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
                <span className={`font-mono font-bold ${isOverAllocated ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {formatCurrency(totalAllocatedNum)}
                </span>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex items-center justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-300 font-semibold">Sisa Lebih / Masuk Deposit Customer:</span>
                <span className="font-mono font-black text-amber-500 text-base">
                  {formatCurrency(excessNum)}
                </span>
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
                    Terdapat sisa pembayaran sebesar <span className="font-bold">{formatCurrency(excessNum)}</span>. 
                    Sistem akan secara otomatis mencatat kelebihan ini ke <span className="font-bold underline">Deposit Customer</span> (AGENTS.md §10.3) yang dapat digunakan untuk pemotongan faktur selanjutnya.
                  </div>
                </div>
              )}
            </div>
          </BentoCard>
        </div>
      </div>
    </form>
  );
};

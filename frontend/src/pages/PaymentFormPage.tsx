import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  ArrowLeft,
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
      <div className="max-w-2xl mx-auto p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Akses Ditolak (403 Forbidden)</h2>
        <p className="text-sm text-slate-600">
          Sesuai tata kelola sistem CV. ANDARA (PRD §5.3 & AGENTS.md §11), hak akses pencatatan transaksi pembayaran dan alokasi finansial secara ketat dibatasi hanya untuk role <strong>OPERATOR</strong>.
        </p>
        <button
          onClick={() => navigate('/pembayaran')}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium rounded-xl transition"
        >
          Kembali ke Daftar Pembayaran
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/pembayaran')}
            className="p-2 hover:bg-slate-200 text-slate-600 rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CreditCard className="w-7 h-7 text-indigo-600" />
              Catat Pembayaran Baru
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Penerimaan pembayaran dari customer dengan alokasi langsung ke faktur
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/pembayaran')}
            className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isOverAllocated || !selectedCustomerId || totalPaymentNum <= 0}
            className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Main Form Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Payment Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-semibold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Informasi Transaksi
            </h3>

            {/* Customer Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Customer *
              </label>
              <select
                required
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Tanggal Pembayaran *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Total Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nominal Pembayaran (Rp) *
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="any"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2.5 text-lg font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {totalPaymentNum > 0 && (
                <div className="text-xs text-indigo-600 font-medium mt-1">
                  Terbilang: {formatCurrency(totalPaymentNum)}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Metode Pembayaran *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="BANK_TRANSFER">Transfer Bank</option>
                <option value="CASH">Tunai (Cash)</option>
                <option value="GIRO">Giro / Cek</option>
                <option value="OTHER">Lainnya</option>
              </select>
            </div>

            {/* Destination Account */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Rekening Tujuan / Kas
              </label>
              <input
                type="text"
                placeholder="Contoh: Bank Mandiri 142-00-1234567-8"
                value={destinationAccount}
                onChange={(e) => setDestinationAccount(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Reference */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nomor Referensi / No. Bukti Transfer
              </label>
              <input
                type="text"
                placeholder="Contoh: TRF-MDR-99210"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Catatan Pembayaran
              </label>
              <textarea
                rows={2}
                placeholder="Catatan tambahan untuk transaksi ini..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Invoice Allocation Engine */}
        <div className="lg:col-span-2 space-y-6">
          {/* Allocation Table Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-indigo-600" />
                  Alokasi ke Faktur Penjualan (Settlement)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tentukan jumlah alokasi pelunasan untuk masing-masing faktur aktif
                </p>
              </div>

              {selectedCustomerId && (
                <span className="text-xs text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full font-medium">
                  {invoices.length} faktur belum lunas
                </span>
              )}
            </div>

            {!selectedCustomerId ? (
              <div className="py-12 text-center text-slate-400">
                <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                Pilih Customer di panel kiri untuk memuat daftar faktur yang belum lunas.
              </div>
            ) : loadingInvoices ? (
              <div className="py-12 text-center text-slate-400">
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Memuat daftar faktur customer...
              </div>
            ) : invoices.length === 0 ? (
              <div className="py-8 text-center text-slate-500 bg-slate-50 rounded-2xl p-6 border border-slate-200/60">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <div className="font-medium text-slate-900">Seluruh Faktur Customer Sudah Lunas!</div>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Customer ini tidak memiliki tagihan outstanding. Pembayaran yang dimasukkan sebesar{' '}
                  <span className="font-semibold text-indigo-600">{formatCurrency(totalPaymentNum)}</span>{' '}
                  akan dicatat utuh sebagai <span className="font-semibold text-amber-600">Deposit Customer</span>.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-3 py-3">No. Faktur</th>
                        <th className="px-3 py-3">Tanggal</th>
                        <th className="px-3 py-3 text-right">Total Tagihan</th>
                        <th className="px-3 py-3 text-right">Sisa Tagihan</th>
                        <th className="px-4 py-3 text-right w-44">Alokasi Bayar (Rp)</th>
                        <th className="px-3 py-3 w-40">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoices.map((inv) => {
                        const allocData = allocations[inv.id] || { amount: '', notes: '' };
                        const allocNum = parseFloat(allocData.amount) || 0;
                        const exceeds = allocNum > inv.outstanding;

                        return (
                          <tr key={inv.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-3 py-3.5 font-medium text-slate-900">
                              {inv.number}
                            </td>
                            <td className="px-3 py-3.5 text-xs text-slate-500">
                              {inv.date}
                            </td>
                            <td className="px-3 py-3.5 text-right font-medium text-slate-700">
                              {formatCurrency(inv.totalAmount)}
                            </td>
                            <td className="px-3 py-3.5 text-right">
                              <span className="font-semibold text-rose-600">
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
                                  className={`w-full px-2.5 py-1.5 text-right font-semibold text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 ${
                                    exceeds
                                      ? 'border-rose-400 text-rose-700 focus:ring-rose-500/20'
                                      : 'border-slate-200 text-slate-900 focus:ring-indigo-500/20 focus:border-indigo-500'
                                  }`}
                                />
                                <button
                                  type="button"
                                  onClick={() => allocateMaxForInvoice(inv)}
                                  className="text-xs text-indigo-600 hover:text-indigo-800 underline font-medium block text-right w-full"
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
                                className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
            <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Nominal Pembayaran Diterima:</span>
                <span className="font-bold text-slate-900">{formatCurrency(totalPaymentNum)}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Total Alokasi ke Faktur:</span>
                <span className={`font-bold ${isOverAllocated ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {formatCurrency(totalAllocatedNum)}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-sm">
                <span className="text-slate-700 font-medium">Sisa Lebih / Masuk Deposit Customer:</span>
                <span className="font-bold text-amber-600 text-base">
                  {formatCurrency(excessNum)}
                </span>
              </div>

              {/* Status Alert Messages */}
              {isOverAllocated && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  Total alokasi melebihi nominal pembayaran! Harap sesuaikan alokasi faktur.
                </div>
              )}

              {excessNum > 0 && !isOverAllocated && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2 leading-relaxed">
                  <Wallet className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    Terdapat sisa pembayaran sebesar <span className="font-bold">{formatCurrency(excessNum)}</span>. 
                    Sistem akan secara otomatis mencatat kelebihan ini ke <span className="font-semibold underline">Deposit Customer</span> (AGENTS.md §10.3) yang dapat digunakan untuk pemotongan faktur selanjutnya.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  ArrowLeft,
  Calendar,
  Building2,
  CheckCircle2,
  Ban,
  Wallet,
  ArrowUpRight,
  Receipt,
  AlertTriangle
} from 'lucide-react';
import { paymentApi } from '../api/paymentApi';
import { receiptApi } from '../api/receiptApi';
import { Payment } from '../types/payment';
import { Receipt as ReceiptType } from '../types/receipt';
import { useAuth } from '../context/AuthContext';
import { AttachmentSection } from '../components/common/AttachmentSection';

export const PaymentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOperator = user?.role === 'OPERATOR';

  const [payment, setPayment] = useState<Payment | null>(null);
  const [receipt, setReceipt] = useState<ReceiptType | null>(null);
  const [generatingReceipt, setGeneratingReceipt] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cancellation Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (id) {
      loadPayment(Number(id));
    }
  }, [id]);

  const loadPayment = async (paymentId: number) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await paymentApi.getPaymentById(paymentId);
      setPayment(data);

      // Check if receipt exists
      try {
        const r = await receiptApi.getReceiptByPaymentId(paymentId);
        setReceipt(r);
      } catch {
        setReceipt(null);
      }
    } catch (err: any) {
      console.error('Gagal memuat detail pembayaran:', err);
      setErrorMsg(err.response?.data?.message || 'Gagal memuat rincian pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReceipt = async () => {
    if (!payment) return;
    setGeneratingReceipt(true);
    try {
      const newReceipt = await receiptApi.generateReceipt({
        paymentId: payment.id,
        receiptDate: payment.date,
        receivedFrom: payment.customerName,
        description: payment.notes || `Pembayaran transaksi ${payment.number}`,
      });
      setReceipt(newReceipt);
      navigate(`/kwitansi/${newReceipt.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menerbitkan kwitansi');
    } finally {
      setGeneratingReceipt(false);
    }
  };

  const handleCancelPayment = async () => {
    if (!payment) return;
    setIsCancelling(true);
    try {
      const updated = await paymentApi.cancelPayment(payment.id);
      setPayment(updated);
      setShowCancelModal(false);
    } catch (err: any) {
      console.error('Gagal membatalkan pembayaran:', err);
      alert(err.response?.data?.message || 'Gagal membatalkan pembayaran');
    } finally {
      setIsCancelling(false);
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

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Memuat detail pembayaran...
      </div>
    );
  }

  if (errorMsg || !payment) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 text-sm">
          {errorMsg || 'Data pembayaran tidak ditemukan.'}
        </div>
        <button
          onClick={() => navigate('/pembayaran')}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition"
        >
          Kembali ke Daftar Pembayaran
        </button>
      </div>
    );
  }

  const isCancelled = payment.status === 'CANCELLED';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/pembayaran')}
            className="p-2 hover:bg-slate-200 text-slate-600 rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {payment.number}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  isCancelled
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {isCancelled ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {isCancelled ? 'Dibatalkan' : 'Dikonfirmasi'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Dicatat oleh {payment.createdBy || 'System'} pada {new Date(payment.createdAt).toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {receipt ? (
            <button
              onClick={() => navigate(`/kwitansi/${receipt.id}`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-semibold transition shadow-xs"
              title="Lihat & Cetak Kwitansi Resmi"
            >
              <Receipt className="w-4 h-4" />
              <span>Lihat Kwitansi ({receipt.number})</span>
            </button>
          ) : isOperator && !isCancelled ? (
            <button
              onClick={handleGenerateReceipt}
              disabled={generatingReceipt}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-xs disabled:opacity-50"
              title="Terbitkan Kwitansi Resmi untuk transaksi ini"
            >
              <Receipt className="w-4 h-4" />
              <span>{generatingReceipt ? 'Menerbitkan...' : 'Terbitkan Kwitansi'}</span>
            </button>
          ) : null}

          {isOperator && !isCancelled && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-semibold transition shadow-xs"
            >
              <Ban className="w-4 h-4" />
              <span>Batalkan</span>
            </button>
          )}

          <button
            onClick={() => navigate('/pembayaran')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition"
          >
            Kembali
          </button>
        </div>
      </div>

      {isCancelled && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm">
          <Ban className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <div>
            <span className="font-semibold">Perhatian:</span> Transaksi pembayaran ini telah dibatalkan. Seluruh alokasi pelunasan pada faktur telah dipulihkan (reverted) dan kelebihan deposit telah disesuaikan kembali.
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Pembayaran</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">
            {formatCurrency(payment.amount)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Metode: {payment.paymentMethod}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Teralokasi</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-emerald-600">
            {formatCurrency(payment.allocatedAmount)}
          </div>
          <div className="text-xs text-slate-400 mt-1">{payment.allocations?.length || 0} faktur diselesaikan</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Masuk Deposit Customer</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-amber-600">
            {formatCurrency(payment.excessAmount)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Saldo lebih yang dapat digunakan</div>
        </div>
      </div>

      {/* Payment Details Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-600" />
          Rincian Transaksi
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">Customer</span>
            <div className="font-semibold text-slate-900">{payment.customerName}</div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">{payment.customerCode}</div>
          </div>

          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">Tanggal Bayar</span>
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              {payment.date}
            </div>
          </div>

          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">Rekening / Kas Tujuan</span>
            <div className="font-medium text-slate-900">
              {payment.destinationAccount || '-'}
            </div>
          </div>

          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">Nomor Referensi Transfer</span>
            <div className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md inline-block">
              {payment.reference || '-'}
            </div>
          </div>
        </div>

        {payment.notes && (
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-medium text-slate-400 block mb-1">Catatan Tambahan</span>
            <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/60 leading-relaxed">
              {payment.notes}
            </p>
          </div>
        )}
      </div>

      {/* Allocations Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-600" />
              Rincian Alokasi Faktur
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Faktur-faktur yang dipotong/dilunasi oleh transaksi pembayaran ini
            </p>
          </div>
          <span className="text-xs font-medium bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
            {payment.allocations?.length || 0} faktur
          </span>
        </div>

        {payment.allocations?.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            Tidak ada faktur yang dialokasikan pada transaksi ini. Seluruh pembayaran dicatat sebagai deposit customer.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">No. Faktur</th>
                  <th className="px-4 py-3">Tanggal Faktur</th>
                  <th className="px-4 py-3 text-right">Total Tagihan</th>
                  <th className="px-4 py-3 text-right">Terbayar Saat Ini</th>
                  <th className="px-4 py-3 text-right">Sisa Tagihan</th>
                  <th className="px-4 py-3 text-right">Nominal Alokasi</th>
                  <th className="px-4 py-3">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payment.allocations.map((alloc) => (
                  <tr key={alloc.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3.5">
                      <Link
                        to={`/faktur/${alloc.invoiceId}`}
                        className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
                      >
                        {alloc.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {alloc.invoiceDate}
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-slate-800">
                      {formatCurrency(alloc.invoiceTotalAmount)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-emerald-600 font-medium">
                      {formatCurrency(alloc.invoicePaidAmount)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-rose-600 font-medium">
                      {formatCurrency(alloc.invoiceOutstanding)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900 bg-emerald-50/30">
                      {formatCurrency(alloc.allocatedAmount)}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {alloc.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bukti Pembayaran & Lampiran (Cloudflare R2 / Object Storage) */}
      <AttachmentSection
        referenceType="PAYMENT"
        referenceId={payment.id}
        title="Bukti Transfer & Lampiran Pembayaran"
        description="Bukti pembayaran sah, resi transfer bank, atau warkat giro yang tersimpan di Cloudflare R2 / object storage."
        readOnly={!isOperator || isCancelled}
      />

      {/* Confirmation Modal for Cancellation */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Konfirmasi Pembatalan Pembayaran
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin membatalkan pembayaran <strong>{payment.number}</strong> sebesar <strong>{formatCurrency(payment.amount)}</strong>?
            </p>

            <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-800 space-y-1">
              <div className="font-semibold">Dampak Pembatalan:</div>
              <div>• Status pelunasan pada {payment.allocations?.length || 0} faktur terkait akan dikurangi kembali.</div>
              {Number(payment.excessAmount) > 0 && (
                <div>• Kelebihan deposit sebesar {formatCurrency(payment.excessAmount)} akan ditarik/direfund dari saldo customer.</div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCancelPayment}
                disabled={isCancelling}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-medium transition shadow-sm"
              >
                {isCancelling ? 'Membatalkan...' : 'Ya, Batalkan Pembayaran'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

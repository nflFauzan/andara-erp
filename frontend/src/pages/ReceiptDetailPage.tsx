import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Ban,
  CheckCircle2,
  CreditCard,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { receiptApi } from '../api/receiptApi';
import { Receipt } from '../types/receipt';
import { formatRupiah } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export const ReceiptDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOperator = user?.role === 'OPERATOR';

  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadReceipt(Number(id));
    }
  }, [id]);

  const loadReceipt = async (receiptId: number) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await receiptApi.getReceiptById(receiptId);
      setReceipt(data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal memuat detail kwitansi.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCancelReceipt = async () => {
    if (!receipt) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const updated = await receiptApi.cancelReceipt(receipt.id);
      setReceipt(updated);
      setShowCancelModal(false);
    } catch (err: any) {
      setCancelError(err.response?.data?.message || 'Gagal membatalkan kwitansi.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-emerald-600 mb-4" />
        <p className="text-slate-500 text-sm font-medium">Memuat data kwitansi...</p>
      </div>
    );
  }

  if (errorMsg || !receipt) {
    return (
      <div className="bg-white rounded-xl border border-rose-200 p-8 text-center max-w-lg mx-auto mt-8">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Kwitansi Tidak Ditemukan</h3>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          {errorMsg || 'Data kwitansi dengan ID tersebut tidak dapat diakses.'}
        </p>
        <button
          onClick={() => navigate('/kwitansi')}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
        >
          Kembali ke Daftar Kwitansi
        </button>
      </div>
    );
  }

  const isCancelled = receipt.status === 'CANCELLED';

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Hidden during Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/kwitansi')}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 shadow-xs"
            title="Kembali ke Daftar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {receipt.number}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  isCancelled
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {isCancelled ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {isCancelled ? 'DIBATALKAN (VOID)' : 'VALID / RESMI'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Diterbitkan pada {receipt.date} &bull; Transaksi Asal:{' '}
              <button
                onClick={() => navigate(`/pembayaran/${receipt.paymentId}`)}
                className="text-emerald-700 hover:underline font-medium inline-flex items-center gap-0.5"
              >
                {receipt.paymentNumber}
                <ExternalLink className="w-3 h-3" />
              </button>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate(`/pembayaran/${receipt.paymentId}`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <CreditCard className="w-4 h-4 text-slate-500" />
            <span>Lihat Pembayaran</span>
          </button>

          {isOperator && !isCancelled && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors shadow-xs"
            >
              <Ban className="w-4 h-4" />
              <span>Batalkan Kwitansi</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Kwitansi / PDF</span>
          </button>
        </div>
      </div>

      {/* Cancellation Banner if CANCELLED */}
      {isCancelled && (
        <div className="no-print p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <span className="font-semibold">Kwitansi ini telah dibatalkan (VOID).</span>
            <p className="text-xs text-rose-600 mt-0.5">
              Dokumen ini tidak lagi berlaku sebagai tanda bukti penerimaan pembayaran sah.
            </p>
          </div>
        </div>
      )}

      {/* OFFICIAL PRINTABLE VOUCHER LAYOUT */}
      <div className="print-area max-w-4xl mx-auto bg-white border border-slate-300 rounded-xl p-8 sm:p-10 shadow-md relative overflow-hidden text-slate-900">
        {/* Void Watermark if Cancelled */}
        {isCancelled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-15 rotate-[-25deg]">
            <span className="text-8xl font-black text-rose-700 border-8 border-rose-700 px-8 py-4 uppercase tracking-widest rounded-3xl">
              VOID / BATAL
            </span>
          </div>
        )}

        {/* Header: Company & Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-5 mb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight text-slate-950 uppercase">
              CV. ANDARA
            </h2>
            <p className="text-xs font-medium text-slate-600 tracking-wide">
              General Contractor, Supplier & Heavy Equipment Rental
            </p>
            <p className="text-xs text-slate-500">
              Jl. Perintis Kemerdekaan KM. 10 No. 45, Tamalanrea, Makassar &bull; Telp: (0411) 892-1234
            </p>
          </div>

          <div className="mt-4 sm:mt-0 text-left sm:text-right space-y-1">
            <div className="inline-block bg-slate-950 text-white text-base font-extrabold px-3 py-1 uppercase tracking-wider rounded-sm">
              KWITANSI
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">OFFICIAL RECEIPT</div>
            <div className="text-sm font-bold text-slate-900 tracking-wide mt-1">
              No: <span className="font-mono text-emerald-800">{receipt.number}</span>
            </div>
          </div>
        </div>

        {/* Voucher Body: Standard Formal Indonesian Kwitansi */}
        <div className="space-y-5 text-sm">
          {/* Row 1: Telah Terima Dari */}
          <div className="grid grid-cols-12 gap-2 items-baseline">
            <div className="col-span-3 font-semibold text-slate-700">Telah Terima Dari</div>
            <div className="col-span-1 text-center font-bold text-slate-400">:</div>
            <div className="col-span-8 border-b border-dotted border-slate-400 pb-1 font-bold text-slate-900 text-base">
              {receipt.receivedFrom}
              {receipt.customerCompanyName && receipt.receivedFrom !== receipt.customerCompanyName && (
                <span className="text-xs font-normal text-slate-500 ml-2">
                  ({receipt.customerCompanyName})
                </span>
              )}
            </div>
          </div>

          {/* Row 2: Uang Sejumlah (Spelled Out Terbilang) */}
          <div className="grid grid-cols-12 gap-2 items-baseline">
            <div className="col-span-3 font-semibold text-slate-700">Uang Sejumlah</div>
            <div className="col-span-1 text-center font-bold text-slate-400">:</div>
            <div className="col-span-8 border border-slate-300 bg-slate-50/70 p-3 rounded font-serif italic text-slate-900 font-semibold text-sm leading-relaxed">
              ## {receipt.spelledOut} ##
            </div>
          </div>

          {/* Row 3: Untuk Pembayaran */}
          <div className="grid grid-cols-12 gap-2 items-baseline">
            <div className="col-span-3 font-semibold text-slate-700">Untuk Pembayaran</div>
            <div className="col-span-1 text-center font-bold text-slate-400">:</div>
            <div className="col-span-8 border-b border-dotted border-slate-400 pb-1 text-slate-800 leading-relaxed font-medium">
              {receipt.description || '-'}
            </div>
          </div>

          {/* Row 4: Cara Pembayaran & Akun */}
          <div className="grid grid-cols-12 gap-2 items-baseline">
            <div className="col-span-3 font-semibold text-slate-700">Metode & Akun</div>
            <div className="col-span-1 text-center font-bold text-slate-400">:</div>
            <div className="col-span-8 text-xs text-slate-600 flex flex-wrap items-center gap-3">
              <span className="font-semibold px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-800">
                {receipt.paymentMethod}
              </span>
              {receipt.paymentDestinationAccount && (
                <span>Rekening Tujuan: <strong>{receipt.paymentDestinationAccount}</strong></span>
              )}
              {receipt.paymentReference && (
                <span>Ref/Bukti: <strong>{receipt.paymentReference}</strong></span>
              )}
            </div>
          </div>

          {/* Optional Allocation Breakdown Table (if multiple invoices settled) */}
          {receipt.allocations && receipt.allocations.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-200">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Rincian Pelunasan Faktur Terkait:
              </div>
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 text-left">No. Faktur</th>
                      <th className="py-2 px-3 text-left">Tgl Faktur</th>
                      <th className="py-2 px-3 text-right">Jumlah Alokasi (Rp)</th>
                      <th className="py-2 px-3 text-left">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {receipt.allocations.map((alloc, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-1.5 px-3 font-medium text-slate-900">{alloc.invoiceNumber}</td>
                        <td className="py-1.5 px-3 text-slate-600">{alloc.invoiceDate}</td>
                        <td className="py-1.5 px-3 text-right font-bold text-slate-900">
                          {formatRupiah(alloc.allocatedAmount)}
                        </td>
                        <td className="py-1.5 px-3 text-slate-500">{alloc.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Voucher Footer: Nominal Box & Signatures */}
        <div className="mt-8 pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row justify-between items-end gap-6">
          {/* Big Amount Box */}
          <div className="w-full sm:w-auto">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
              Jumlah Nominal Diterima
            </div>
            <div className="border-2 border-slate-900 bg-slate-950 text-white px-5 py-2.5 rounded text-xl font-mono font-extrabold tracking-tight flex items-center gap-2">
              <span>{formatRupiah(receipt.amount)}</span>
            </div>
            <div className="text-[10px] text-slate-500 italic mt-1.5 max-w-xs leading-normal">
              * Pembayaran dianggap sah bila cek/giro/transfer telah efektif masuk ke rekening CV. ANDARA.
            </div>
          </div>

          {/* Signature Block */}
          <div className="w-full sm:w-64 text-center space-y-1">
            <div className="text-xs text-slate-700">
              Makassar, {receipt.date}
            </div>
            <div className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
              CV. ANDARA
            </div>
            <div className="h-16 flex items-center justify-center text-slate-300 text-xs italic">
              [ Tanda Tangan & Cap Resmi ]
            </div>
            <div className="border-b border-slate-900 w-48 mx-auto" />
            <div className="text-xs font-bold text-slate-900 mt-1">
              Bagian Keuangan / Kasir
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <span className="p-2 bg-rose-100 rounded-lg">
                <Ban className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Batalkan Kwitansi</h3>
                <p className="text-xs text-slate-500">Konfirmasi pembatalan dokumen resmi</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              Apakah Anda yakin ingin membatalkan kwitansi <strong>{receipt.number}</strong> sejumlah{' '}
              <strong>{formatRupiah(receipt.amount)}</strong>? Status kwitansi akan berubah menjadi{' '}
              <strong className="text-rose-600">CANCELLED (VOID)</strong>.
            </p>

            {cancelError && (
              <div className="p-3 mb-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                {cancelError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCancelReceipt}
                disabled={cancelling}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg disabled:opacity-50"
              >
                {cancelling ? 'Memproses...' : 'Ya, Batalkan Kwitansi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ReceiptDetailPage;

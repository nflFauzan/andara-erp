import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  Calendar,
  Building2,
  Wallet,
  ArrowUpRight,
  Receipt,
  AlertTriangle,
  History,
  Ban
} from 'lucide-react';
import { paymentApi } from '../api/paymentApi';
import { receiptApi } from '../api/receiptApi';
import { Payment } from '../types/payment';
import { Receipt as ReceiptType } from '../types/receipt';
import { useAuth } from '../context/AuthContext';
import { AttachmentSection } from '../components/common/AttachmentSection';
import { AuditHistoryModal } from '../components/audit/AuditHistoryModal';
import { BentoCard } from '@/components/common/BentoCard';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';

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
  const [showAuditModal, setShowAuditModal] = useState(false);

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
      <div className="flex items-center justify-center p-20">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
        <span className="ml-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Memuat rincian pembayaran...</span>
      </div>
    );
  }

  if (errorMsg || !payment) {
    return (
      <BentoCard className="max-w-xl mx-auto p-8 text-center space-y-4">
        <div className="p-4 bg-rose-500/10 text-rose-800 dark:text-rose-300 rounded-2xl border border-rose-500/20 text-xs font-semibold">
          {errorMsg || 'Data pembayaran tidak ditemukan.'}
        </div>
        <button
          onClick={() => navigate('/pembayaran')}
          className="px-4 py-2 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-bold transition shadow-xs"
        >
          Kembali ke Daftar Pembayaran
        </button>
      </BentoCard>
    );
  }

  const isCancelled = payment.status === 'CANCELLED';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Bar */}
      <PageHeader
        icon={CreditCard}
        backUrl="/pembayaran"
        title={payment.number}
        subtitle={`Dicatat oleh ${payment.createdBy || 'Sistem'} pada ${new Date(payment.createdAt).toLocaleString('id-ID')}`}
        badge={<StatusBadge status={payment.status} />}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowAuditModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition shadow-xs"
              title="Lihat riwayat audit pembayaran ini"
            >
              <History className="w-4 h-4 text-slate-500" />
              <span>Audit Trail</span>
            </button>

            {receipt ? (
              <button
                onClick={() => navigate(`/kwitansi/${receipt.id}`)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-xs font-bold transition shadow-xs"
                title="Lihat & Cetak Kwitansi Resmi"
              >
                <Receipt className="w-4 h-4 text-emerald-500" />
                <span>Lihat Kwitansi ({receipt.number})</span>
              </button>
            ) : isOperator && !isCancelled ? (
              <button
                onClick={handleGenerateReceipt}
                disabled={generatingReceipt}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-500/25 disabled:opacity-50"
                title="Terbitkan Kwitansi Resmi untuk transaksi ini"
              >
                <Receipt className="w-4 h-4" />
                <span>{generatingReceipt ? 'Menerbitkan...' : 'Terbitkan Kwitansi'}</span>
              </button>
            ) : null}

            {isOperator && !isCancelled && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-rose-500/30 text-rose-700 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-xs font-bold transition shadow-xs"
              >
                <Ban className="w-4 h-4 text-rose-500" />
                <span>Batalkan</span>
              </button>
            )}
          </div>
        }
      />

      {isCancelled && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-800 dark:text-rose-300 text-xs font-semibold">
          <Ban className="w-5 h-5 text-rose-500 shrink-0" />
          <div>
            <span className="font-bold">Perhatian:</span> Transaksi pembayaran ini telah dibatalkan. Seluruh alokasi pelunasan pada faktur telah dipulihkan (reverted) dan kelebihan deposit telah disesuaikan kembali (AGENTS.md §10).
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BentoCard className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Total Pembayaran
            </span>
            <div className="mt-2 text-2xl font-black font-mono text-slate-900 dark:text-white">
              {formatCurrency(payment.amount)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              Metode:{' '}
              {payment.paymentMethod === 'DEPOSIT'
                ? 'Saldo Deposit'
                : payment.paymentMethod === 'BANK_TRANSFER'
                ? 'Transfer Bank'
                : payment.paymentMethod === 'CASH'
                ? 'Tunai'
                : payment.paymentMethod === 'GIRO'
                ? 'Giro'
                : payment.paymentMethod}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/20">
            <CreditCard className="w-6 h-6" />
          </div>
        </BentoCard>

        <BentoCard className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Total Teralokasi
            </span>
            <div className="mt-2 text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {formatCurrency(payment.allocatedAmount)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">{payment.allocations?.length || 0} faktur diselesaikan</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </BentoCard>

        <BentoCard className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              {payment.cashAmount && payment.depositAmount && payment.cashAmount > 0 && payment.depositAmount > 0
                ? 'Potongan Saldo Deposit'
                : payment.paymentMethod === 'DEPOSIT'
                ? 'Sumber Pembayaran'
                : 'Masuk Deposit Customer'}
            </span>
            <div className="mt-2 text-2xl font-black font-mono text-amber-500">
              {payment.cashAmount && payment.depositAmount && payment.cashAmount > 0 && payment.depositAmount > 0
                ? formatCurrency(payment.depositAmount)
                : payment.paymentMethod === 'DEPOSIT'
                ? 'Saldo Deposit'
                : formatCurrency(payment.excessAmount)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              {payment.cashAmount && payment.depositAmount && payment.cashAmount > 0 && payment.depositAmount > 0
                ? `Kas/Bank: ${formatCurrency(payment.cashAmount)}`
                : payment.paymentMethod === 'DEPOSIT'
                ? 'Dipungut dari buku besar deposit customer'
                : 'Saldo lebih di buku kas'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Wallet className="w-6 h-6" />
          </div>
        </BentoCard>
      </div>

      {/* Payment Details Panel */}
      <BentoCard className="p-6 space-y-4">
        <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800 pb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-brand-500" />
          Rincian Transaksi
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 text-sm">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">Customer</span>
            <div className="font-bold text-slate-900 dark:text-slate-100">{payment.customerName}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{payment.customerCode}</div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">Tanggal Bayar</span>
            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              {payment.date}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">Metode & Sumber Dana</span>
            <div>
              {payment.cashAmount && payment.depositAmount && payment.cashAmount > 0 && payment.depositAmount > 0 ? (
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/25">
                    ⚡ Kas + Deposit
                  </span>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Kas: {formatCurrency(payment.cashAmount)} ({payment.paymentMethod}) <br />
                    Deposit: {formatCurrency(payment.depositAmount)}
                  </div>
                </div>
              ) : payment.paymentMethod === 'DEPOSIT' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/25">
                  🪙 Saldo Deposit
                </span>
              ) : (
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {payment.paymentMethod === 'BANK_TRANSFER'
                    ? 'Transfer Bank'
                    : payment.paymentMethod === 'CASH'
                    ? 'Tunai'
                    : payment.paymentMethod === 'GIRO'
                    ? 'Giro'
                    : payment.paymentMethod}
                </span>
              )}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">Rekening / Kas Tujuan</span>
            <div className="font-medium text-slate-800 dark:text-slate-200">
              {payment.destinationAccount || (payment.paymentMethod === 'DEPOSIT' ? 'Buku Kas Saldo Deposit' : '-')}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">Nomor Referensi</span>
            <div className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-lg border border-brand-500/20 inline-block">
              {payment.reference || '-'}
            </div>
          </div>
        </div>

        {payment.notes && (
          <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Catatan Tambahan</span>
            <p className="text-xs text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 leading-relaxed font-sans">
              {payment.notes}
            </p>
          </div>
        )}
      </BentoCard>

      {/* Allocations Table */}
      <BentoCard className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-brand-500" />
              Rincian Alokasi Faktur
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Faktur-faktur yang dipotong/dilunasi oleh transaksi pembayaran ini
            </p>
          </div>
          <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full border border-slate-200/80 dark:border-slate-700">
            {payment.allocations?.length || 0} faktur
          </span>
        </div>

        {payment.allocations?.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-medium">
            Tidak ada faktur yang dialokasikan pada transaksi ini. Seluruh pembayaran dicatat sebagai deposit customer.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100/70 dark:bg-slate-900/70 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
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
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {payment.allocations.map((alloc) => (
                  <tr key={alloc.id} className="hover:bg-white/40 dark:hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3.5">
                      <Link
                        to={`/faktur/${alloc.invoiceId}`}
                        className="font-bold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1 font-mono"
                      >
                        {alloc.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                      {alloc.invoiceDate}
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-slate-800 dark:text-slate-200 font-mono">
                      {formatCurrency(alloc.invoiceTotalAmount)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                      {formatCurrency(alloc.invoicePaidAmount)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-rose-600 dark:text-rose-400 font-mono font-medium">
                      {formatCurrency(alloc.invoiceOutstanding)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold font-mono text-slate-900 dark:text-white bg-emerald-500/5">
                      {formatCurrency(alloc.allocatedAmount)}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                      {alloc.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </BentoCard>

      {/* Bukti Pembayaran & Lampiran (Cloudflare R2 / Object Storage) */}
      <BentoCard className="p-6">
        <AttachmentSection
          referenceType="PAYMENT"
          referenceId={payment.id}
          title="Bukti Transfer & Lampiran Pembayaran"
          description="Bukti pembayaran sah, resi transfer bank, atau warkat giro yang tersimpan di Cloudflare R2."
          readOnly={!isOperator || isCancelled}
        />
      </BentoCard>

      {/* Confirmation Modal for Cancellation */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bento-card max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center border border-rose-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Konfirmasi Pembatalan Pembayaran
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Apakah Anda yakin ingin membatalkan pembayaran <strong>{payment.number}</strong> sebesar <strong>{formatCurrency(payment.amount)}</strong>?
            </p>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-1 font-medium">
              <div className="font-bold">Dampak Pembatalan:</div>
              <div>• Status pelunasan pada {payment.allocations?.length || 0} faktur terkait akan dikurangi kembali.</div>
              {Number(payment.excessAmount) > 0 && (
                <div>• Kelebihan deposit sebesar {formatCurrency(payment.excessAmount)} akan ditarik/direfund dari saldo customer.</div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="px-4 py-2 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCancelPayment}
                disabled={isCancelling}
                className="px-5 py-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white rounded-xl text-xs font-bold transition shadow-md shadow-rose-500/25"
              >
                {isCancelling ? 'Membatalkan...' : 'Ya, Batalkan Pembayaran'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit History Modal */}
      {payment && (
        <AuditHistoryModal
          isOpen={showAuditModal}
          onClose={() => setShowAuditModal(false)}
          entityType="PAYMENT"
          entityId={payment.id}
          title={`Audit Trail - Pembayaran ${payment.number}`}
        />
      )}
    </div>
  );
};

export default PaymentDetailPage;

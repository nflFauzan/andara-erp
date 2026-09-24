import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Printer,
  CheckCircle2,
  Clock,
  Ban,
  AlertCircle,
  Lock,
  FileCheck2,
  Send,
  AlertTriangle
} from 'lucide-react';
import { invoiceApi } from '../api/invoiceApi';
import { Invoice, InvoiceStatus, InvoicePaymentStatus } from '../types/invoice';

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  DRAFT: {
    label: 'Draft',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    text: 'text-slate-600',
    icon: Clock,
  },
  ISSUED: {
    label: 'Diterbitkan (Resmi)',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    text: 'text-blue-600',
    icon: FileCheck2,
  },
  CANCELLED: {
    label: 'Dibatalkan',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    text: 'text-amber-600',
    icon: Ban,
  },
};

const PAYMENT_STATUS_CONFIG: Record<InvoicePaymentStatus, { label: string; bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  UNPAID: {
    label: 'Belum Bayar',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    text: 'text-rose-600',
    icon: AlertCircle,
  },
  PARTIAL: {
    label: 'Sebagian Dibayar',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    text: 'text-amber-600',
    icon: AlertTriangle,
  },
  PAID: {
    label: 'Lunas',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    text: 'text-emerald-600',
    icon: CheckCircle2,
  },
};

export const InvoiceDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await invoiceApi.getInvoiceById(Number(id));
      setInvoice(data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal memuat rincian faktur.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleStatusChange = async (targetStatus: InvoiceStatus) => {
    if (!invoice) return;
    try {
      setActionLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const updated = await invoiceApi.updateStatus(invoice.id, {
        status: targetStatus,
      });

      setInvoice(updated);
      setSuccessMsg(`Status faktur berhasil diubah menjadi ${targetStatus}`);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal mengubah status faktur.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!invoice) return;
    if (!window.confirm(`Yakin ingin menghapus faktur draft ${invoice.number}?`)) return;

    try {
      setActionLoading(true);
      await invoiceApi.deleteInvoice(invoice.id);
      navigate('/faktur', { replace: true });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal menghapus faktur.');
      setActionLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-sm font-medium text-slate-600">Memuat rincian faktur...</span>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-8 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <p className="text-base font-semibold text-slate-800">Faktur tidak ditemukan</p>
        <button
          onClick={() => navigate('/faktur')}
          className="text-xs text-brand-600 font-semibold hover:underline"
        >
          ← Kembali ke daftar faktur
        </button>
      </div>
    );
  }

  const statusMeta = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.DRAFT;
  const StatusIcon = statusMeta.icon;
  const payMeta = PAYMENT_STATUS_CONFIG[invoice.paymentStatus] || PAYMENT_STATUS_CONFIG.UNPAID;
  const PayIcon = payMeta.icon;

  const hasPayments = invoice.paidAmount > 0;
  const isEditable = !hasPayments && invoice.status !== 'CANCELLED';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/faktur')}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
                {invoice.number}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusMeta.bg}`}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                {statusMeta.label}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${payMeta.bg}`}
              >
                <PayIcon className="w-3.5 h-3.5" />
                {payMeta.label}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Diterbitkan pada {new Date(invoice.date).toLocaleDateString('id-ID', { dateStyle: 'long' })}
              {invoice.dueDate && (
                <> • Jatuh Tempo: {new Date(invoice.dueDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}</>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Print Button */}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Cetak Faktur / PDF
          </button>

          {/* Edit Button */}
          {isEditable && (
            <button
              disabled={actionLoading}
              onClick={() => navigate(`/faktur/${invoice.id}/edit`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition"
            >
              <Edit className="w-4 h-4 text-slate-500" />
              Edit
            </button>
          )}

          {/* DRAFT Actions */}
          {invoice.status === 'DRAFT' && (
            <>
              <button
                disabled={actionLoading}
                onClick={() => handleStatusChange('ISSUED')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition"
              >
                <Send className="w-4 h-4" />
                Terbitkan Faktur (ISSUED)
              </button>
              {!hasPayments && (
                <button
                  disabled={actionLoading}
                  onClick={handleDelete}
                  className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                  title="Hapus Faktur Draft"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}

          {/* ISSUED Actions */}
          {invoice.status === 'ISSUED' && !hasPayments && (
            <button
              disabled={actionLoading}
              onClick={() => {
                if (window.confirm('Yakin ingin membatalkan faktur ini? Nomor faktur tidak akan digunakan kembali.')) {
                  handleStatusChange('CANCELLED');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition"
            >
              <Ban className="w-4 h-4" />
              Batalkan Faktur
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Financial Locking Banner */}
      {hasPayments && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 text-sm text-indigo-950 flex items-start gap-3 shadow-sm print:hidden">
          <Lock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Terkunci Secara Finansial (Financial Record Locked)</p>
            <p className="text-xs text-indigo-800 mt-0.5 leading-relaxed">
              Faktur ini telah memiliki riwayat pembayaran sebesar <strong>{formatCurrency(invoice.paidAmount)}</strong>. Rincian nilai dan jumlah item tidak dapat diubah demi menjaga integritas pembukuan transaksi.
            </p>
          </div>
        </div>
      )}

      {/* Printable Invoice Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8 print:shadow-none print:border-none print:p-0">
        {/* Letterhead */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white shadow-sm">
                A
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">CV. ANDARA</h2>
            </div>
            <p className="text-xs text-slate-500 font-medium max-w-sm leading-relaxed">
              Jasa Pengadaan, Kontraktor Sipil, Pameran & Event Organizer Terpadu
              <br />
              Email: finance@andara.co.id | Telepon: (021) 789-ANDARA
            </p>
          </div>

          <div className="text-right space-y-1">
            <span className="inline-block px-3 py-1 rounded bg-slate-900 text-white font-mono text-xs font-bold uppercase tracking-wider">
              FAKTUR PENJUALAN / INVOICE
            </span>
            <p className="font-mono text-sm font-bold text-brand-700">{invoice.number}</p>
            <p className="text-xs text-slate-500">
              Tanggal: {new Date(invoice.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
            </p>
            {invoice.dueDate && (
              <p className="text-xs text-rose-600 font-medium">
                Jatuh Tempo: {new Date(invoice.dueDate).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
              </p>
            )}
          </div>
        </div>

        {/* Customer & Info Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-200 print:bg-transparent">
          <div className="space-y-1 text-xs text-slate-600">
            <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Ditagihkan Kepada (Billed To):</p>
            <p className="text-sm font-bold text-slate-900">{invoice.customerName}</p>
            {invoice.customerAddress && <p className="text-slate-500 max-w-xs">{invoice.customerAddress}</p>}
            {invoice.customerPhone && <p className="text-slate-500">Kontak: {invoice.customerPhone}</p>}
          </div>

          <div className="space-y-1 text-xs text-slate-600 sm:text-right">
            <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Informasi Penagihan:</p>
            <p className="text-sm font-bold text-slate-900 font-mono">Kode Customer: {invoice.customerCode}</p>
            {invoice.sourcePenawaranNumber && (
              <p className="text-slate-600">
                Referensi Penawaran:{' '}
                <span className="font-mono font-semibold text-brand-700">{invoice.sourcePenawaranNumber}</span>
              </p>
            )}
            <p className="text-slate-500">
              Status Faktur: <span className="font-bold uppercase text-slate-800">{invoice.status}</span>
            </p>
            <p className="text-slate-500">
              Status Bayar: <span className="font-bold uppercase text-brand-700">{invoice.paymentStatus}</span>
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Rincian Item Penagihan
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-12 text-center">No</th>
                  <th className="py-2.5 px-3">Deskripsi Pekerjaan / Jasa</th>
                  <th className="py-2.5 px-3 w-28 text-right">Kuantitas</th>
                  <th className="py-2.5 px-3 w-24 text-center">Satuan</th>
                  <th className="py-2.5 px-3 w-36 text-right">Harga Satuan</th>
                  <th className="py-2.5 px-3 w-40 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.details && invoice.details.length > 0 ? (
                  invoice.details.map((detail, idx) => (
                    <tr key={detail.id || idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 text-center text-xs font-mono text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{detail.description}</div>
                        {detail.sourceKegiatanName && (
                          <span className="text-[11px] text-brand-600 font-medium">
                            • Kegiatan: {detail.sourceKegiatanName}
                          </span>
                        )}
                        {detail.notes && (
                          <div className="text-[11px] text-slate-500 italic mt-0.5">{detail.notes}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-700">
                        {detail.quantity}
                      </td>
                      <td className="py-3 px-3 text-center text-xs text-slate-600">
                        {detail.unit}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {formatCurrency(detail.unitPrice)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(detail.amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-xs text-slate-400">
                      Tidak ada rincian item penagihan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculation & Financial Summary */}
        <div className="flex flex-col sm:flex-row justify-end border-t-2 border-slate-900 pt-4">
          <div className="w-full sm:w-80 space-y-2 text-sm">
            <div className="flex justify-between py-1 text-slate-600">
              <span>Total Nilai Tagihan:</span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(invoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between py-1 text-slate-600 border-b border-slate-200 pb-2">
              <span>Total Telah Dibayar:</span>
              <span className="font-mono font-bold text-emerald-700">
                - {formatCurrency(invoice.paidAmount)}
              </span>
            </div>
            <div className="flex justify-between py-2 text-base font-bold bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-800">Sisa Tagihan (Outstanding):</span>
              <span className={`font-mono ${invoice.outstanding > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {formatCurrency(invoice.outstanding)}
              </span>
            </div>
          </div>
        </div>

        {/* Terms & Bank Payment Instructions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Instruksi & Syarat Pembayaran:
            </h4>
            <div className="text-xs text-slate-600 font-mono whitespace-pre-line bg-slate-50 p-3.5 rounded-lg border border-slate-200 leading-relaxed print:bg-transparent">
              {invoice.terms ||
                '1. Pembayaran ditransfer ke rekening resmi CV. ANDARA\n2. Jatuh tempo pembayaran 14 hari kalender\n3. Cantumkan nomor faktur pada berita transfer'}
            </div>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Catatan Faktur:
            </h4>
            <div className="text-xs text-slate-600 whitespace-pre-line bg-slate-50 p-3.5 rounded-lg border border-slate-200 leading-relaxed print:bg-transparent">
              {invoice.notes || 'Terima kasih atas kerjasama dan kepercayaan Anda kepada CV. ANDARA.'}
            </div>
          </div>
        </div>

        {/* Signatures for Print */}
        <div className="pt-10 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="space-y-16">
            <p className="font-semibold text-slate-700">Hormat Kami,<br /><strong>CV. ANDARA</strong></p>
            <div className="border-t border-slate-400 w-44 mx-auto pt-1 font-bold text-slate-900">
              Bagian Keuangan & Penagihan
            </div>
          </div>

          <div className="space-y-16">
            <p className="font-semibold text-slate-700">Diterima oleh Pelanggan,<br /><strong>{invoice.customerName}</strong></p>
            <div className="border-t border-slate-400 w-44 mx-auto pt-1 font-bold text-slate-900">
              Tanda Tangan & Cap Instansi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailPage;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  FileText,
  Edit,
  Trash2,
  Printer,
  CheckCircle2,
  AlertCircle,
  Lock,
  Send,
  Ban,
  History,
  MapPin
} from 'lucide-react';
import { invoiceApi } from '../api/invoiceApi';
import { Invoice, InvoiceStatus } from '../types/invoice';
import { AttachmentSection } from '../components/common/AttachmentSection';
import { AuditHistoryModal } from '../components/audit/AuditHistoryModal';
import { AndaraLetterhead } from '../components/common/AndaraLetterhead';
import { BentoCard } from '@/components/common/BentoCard';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';

export const InvoiceDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showAuditModal, setShowAuditModal] = useState(false);

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
      <div className="flex items-center justify-center p-20">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
        <span className="ml-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Memuat rincian faktur...</span>
      </div>
    );
  }

  if (!invoice) {
    return (
      <BentoCard className="max-w-xl mx-auto p-8 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <p className="text-base font-bold text-slate-800 dark:text-slate-200">Faktur tidak ditemukan</p>
        <button
          onClick={() => navigate('/faktur')}
          className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline"
        >
          ← Kembali ke daftar faktur
        </button>
      </BentoCard>
    );
  }

  const hasPayments = invoice.paidAmount > 0;
  const isEditable = !hasPayments && invoice.status !== 'CANCELLED';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Navigation */}
      <PageHeader
        icon={FileText}
        backUrl="/faktur"
        title={invoice.number}
        subtitle={`Diterbitkan: ${new Date(invoice.date).toLocaleDateString('id-ID', { dateStyle: 'long' })}${
          invoice.dueDate ? ` • Jatuh Tempo: ${new Date(invoice.dueDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}` : ''
        }`}
        badge={
          <div className="flex items-center gap-2">
            <StatusBadge status={invoice.status} />
            <StatusBadge status={invoice.paymentStatus} />
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            {/* Print Button */}
            <button
              onClick={() => window.open(`/faktur/${invoice.id}/print`, '_blank')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs transition"
              title="Buka format cetak resmi CV. ANDARA (siap cetak/simpan PDF)"
            >
              <Printer className="w-4 h-4 text-brand-500" />
              Cetak Format Resmi
            </button>

            {/* Audit Trail Button */}
            <button
              onClick={() => setShowAuditModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs transition"
              title="Lihat riwayat audit dokumen ini"
            >
              <History className="w-4 h-4 text-slate-500" />
              Audit Trail
            </button>

            {/* Edit Button */}
            {isEditable && (
              <button
                disabled={actionLoading}
                onClick={() => navigate(`/faktur/${invoice.id}/edit`)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs transition"
              >
                <Edit className="w-4 h-4 text-amber-500" />
                Edit
              </button>
            )}

            {/* DRAFT Actions */}
            {invoice.status === 'DRAFT' && (
              <>
                <button
                  disabled={actionLoading}
                  onClick={() => handleStatusChange('ISSUED')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 shadow-md shadow-brand-500/25 transition"
                >
                  <Send className="w-4 h-4" />
                  Terbitkan Faktur
                </button>
                {!hasPayments && (
                  <button
                    disabled={actionLoading}
                    onClick={handleDelete}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition border border-rose-500/20"
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
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition"
              >
                <Ban className="w-4 h-4" />
                Batalkan Faktur
              </button>
            )}
          </div>
        }
      />

      {/* Messages */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center gap-3 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 flex items-center gap-3 text-xs font-semibold animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Financial Locking Banner */}
      {hasPayments && (
        <BentoCard className="p-4 bg-brand-500/10 border-brand-500/30 text-brand-950 dark:text-brand-100 flex items-start gap-3 print:hidden">
          <Lock className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-xs uppercase tracking-wider text-brand-700 dark:text-brand-300">
              Terkunci Secara Finansial (Financial Record Locked)
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed font-medium">
              Faktur ini telah memiliki riwayat pembayaran sebesar <strong className="text-brand-600 dark:text-brand-400">{formatCurrency(invoice.paidAmount)}</strong>. Rincian nilai dan jumlah item tidak dapat diubah demi menjaga integritas pembukuan transaksi (AGENTS.md §9.8).
            </p>
          </div>
        </BentoCard>
      )}

      {/* Printable Invoice Sheet (Paper view with official letterhead) */}
      <div className="bg-white text-slate-900 rounded-3xl border border-slate-200/90 shadow-bento p-6 sm:p-10 space-y-8 print:shadow-none print:border-none print:p-0">
        {/* Letterhead Resmi CV. ANDARA dengan Pita Divisi Baja Ringan */}
        <AndaraLetterhead showDivisiStrip={true} className="mb-4" />

        {/* Customer & Info Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 print:bg-transparent">
          <div className="space-y-1 text-xs text-slate-600">
            <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Ditagihkan Kepada (Billed To):</p>
            <p className="text-sm font-bold text-slate-900">{invoice.customerName}</p>
            {invoice.customerAddress && <p className="text-slate-500 max-w-xs">{invoice.customerAddress}</p>}
            {invoice.customerPhone && <p className="text-slate-500 font-mono">Kontak: {invoice.customerPhone}</p>}
          </div>

          <div className="space-y-1 text-xs text-slate-600 sm:text-right">
            <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Informasi Penagihan:</p>
            <p className="text-sm font-bold text-slate-900 font-mono">Kode Customer: {invoice.customerCode}</p>
            {invoice.sourcePenawaranNumber && (
              <p className="text-slate-600">
                Referensi SPH:{' '}
                <Link
                  to={`/penawaran/${invoice.sourcePenawaranId}`}
                  className="font-mono font-bold text-brand-600 hover:underline"
                >
                  {invoice.sourcePenawaranNumber}
                </Link>
              </p>
            )}
            {invoice.workLocation && (
              <p className="text-slate-600 flex items-center gap-1 sm:justify-end">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Lokasi: <strong className="text-slate-800">{invoice.workLocation}</strong></span>
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
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-12 text-center">No</th>
                  <th className="py-2.5 px-3">Deskripsi Pekerjaan / Jasa</th>
                  <th className="py-2.5 px-3 w-28 text-right">Kuantitas</th>
                  <th className="py-2.5 px-3 w-24 text-center">Satuan</th>
                  <th className="py-2.5 px-3 w-36 text-right">Harga Satuan</th>
                  <th className="py-2.5 px-3 w-40 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.details && invoice.details.length > 0 ? (
                  invoice.details.map((detail, idx) => (
                    <tr key={detail.id || idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 text-center text-xs font-mono text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{detail.description}</div>
                        {(detail.sphKegiatanName || detail.sourceKegiatanName) && (
                          <span className="text-[11px] text-brand-600 font-semibold">
                            • Kegiatan: {detail.sphKegiatanName || detail.sourceKegiatanName}
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
              <span className="font-medium">Total Nilai Tagihan:</span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(invoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between py-1 text-slate-600 border-b border-slate-200 pb-2">
              <span className="font-medium">Total Telah Dibayar:</span>
              <span className="font-mono font-bold text-emerald-700">
                - {formatCurrency(invoice.paidAmount)}
              </span>
            </div>
            <div className="flex justify-between py-2 text-base font-bold bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-800">Sisa Tagihan:</span>
              <span className={`font-mono font-black ${invoice.outstanding > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
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
            <div className="text-xs text-slate-600 font-mono whitespace-pre-line bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed print:bg-transparent">
              {invoice.terms ||
                '1. Pembayaran ditransfer ke rekening resmi CV. ANDARA\n2. Jatuh tempo pembayaran 14 hari kalender\n3. Cantumkan nomor faktur pada berita transfer'}
            </div>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Catatan Faktur:
            </h4>
            <div className="text-xs text-slate-600 whitespace-pre-line bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed print:bg-transparent">
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

      {/* Lampiran Berita Acara & Dokumen Pendukung (no-print) */}
      <div className="no-print mt-6 max-w-4xl mx-auto">
        <BentoCard className="p-6">
          <AttachmentSection
            referenceType="INVOICE"
            referenceId={invoice.id}
            title="Lampiran Berita Acara & Dokumen Pendukung Faktur"
            description="Unggah berkas BAST, surat jalan, atau rincian lampiran pekerjaan proyek (tersimpan di Cloudflare R2)."
          />
        </BentoCard>
      </div>

      {/* Audit History Modal */}
      {invoice && (
        <AuditHistoryModal
          isOpen={showAuditModal}
          onClose={() => setShowAuditModal(false)}
          entityType="INVOICE"
          entityId={invoice.id}
          title={`Audit Trail - Faktur ${invoice.number}`}
        />
      )}
    </div>
  );
};

export default InvoiceDetailPage;

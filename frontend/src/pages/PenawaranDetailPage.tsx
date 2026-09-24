import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Printer,
  CheckCircle2,
  Clock,
  XCircle,
  Ban,
  Send,
  RotateCcw,
  AlertCircle,
  Lock,
  History
} from 'lucide-react';
import { penawaranApi } from '../api/penawaranApi';
import { customerApi } from '../api/customerApi';
import { Penawaran, PenawaranStatus } from '../types/penawaran';
import { Customer } from '../types/customer';
import { AuditHistoryModal } from '../components/audit/AuditHistoryModal';

const STATUS_CONFIG: Record<PenawaranStatus, { label: string; bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  DRAFT: {
    label: 'Draft',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    text: 'text-slate-600',
    icon: Clock,
  },
  SENT: {
    label: 'Diajukan / Terkirim',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    text: 'text-blue-600',
    icon: Clock,
  },
  APPROVED: {
    label: 'Disetujui / Diterima',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    text: 'text-emerald-600',
    icon: CheckCircle2,
  },
  REJECTED: {
    label: 'Ditolak',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    text: 'text-rose-600',
    icon: XCircle,
  },
  CANCELLED: {
    label: 'Dibatalkan',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    text: 'text-amber-600',
    icon: Ban,
  },
};

export const PenawaranDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [penawaran, setPenawaran] = useState<Penawaran | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
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
      const data = await penawaranApi.getPenawaranById(Number(id));
      setPenawaran(data);

      if (data.customerId) {
        const cust = await customerApi.getCustomerById(data.customerId);
        setCustomer(cust);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal memuat rincian penawaran.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleStatusChange = async (targetStatus: PenawaranStatus, promptNote?: string) => {
    if (!penawaran) return;
    try {
      setActionLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const note = promptNote !== undefined ? promptNote : '';
      const updated = await penawaranApi.updateStatus(penawaran.id, {
        status: targetStatus,
        notes: note,
      });

      setPenawaran(updated);
      setSuccessMsg(`Status penawaran berhasil diubah menjadi ${targetStatus}`);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal mengubah status penawaran.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!penawaran) return;
    if (!window.confirm(`Yakin ingin menghapus penawaran ${penawaran.number}?`)) return;

    try {
      setActionLoading(true);
      await penawaranApi.deletePenawaran(penawaran.id);
      navigate('/penawaran', { replace: true });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal menghapus penawaran.');
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
        <span className="ml-3 text-sm font-medium text-slate-600">Memuat rincian penawaran...</span>
      </div>
    );
  }

  if (!penawaran) {
    return (
      <div className="p-8 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <p className="text-base font-semibold text-slate-800">Penawaran tidak ditemukan</p>
        <button
          onClick={() => navigate('/penawaran')}
          className="text-xs text-brand-600 font-semibold hover:underline"
        >
          ← Kembali ke daftar penawaran
        </button>
      </div>
    );
  }

  const statusMeta = STATUS_CONFIG[penawaran.status] || STATUS_CONFIG.DRAFT;
  const StatusIcon = statusMeta.icon;
  const isApproved = penawaran.status === 'APPROVED';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/penawaran')}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
                {penawaran.number}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusMeta.bg}`}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                {statusMeta.label}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Dibuat pada {new Date(penawaran.date).toLocaleDateString('id-ID', { dateStyle: 'long' })}
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
            Cetak / PDF
          </button>

          {/* Audit Trail Button */}
          <button
            onClick={() => setShowAuditModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition"
            title="Lihat riwayat audit penawaran ini"
          >
            <History className="w-4 h-4 text-slate-500" />
            Audit Trail
          </button>

          {/* DRAFT Actions */}
          {penawaran.status === 'DRAFT' && (
            <>
              <button
                disabled={actionLoading}
                onClick={() => navigate(`/penawaran/${penawaran.id}/edit`)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition"
              >
                <Edit className="w-4 h-4 text-slate-500" />
                Edit
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleStatusChange('SENT', 'Diajukan ke customer')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition"
              >
                <Send className="w-4 h-4" />
                Ajukan ke Customer
              </button>
              <button
                disabled={actionLoading}
                onClick={handleDelete}
                className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                title="Hapus Penawaran Draft"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}

          {/* SENT Actions */}
          {penawaran.status === 'SENT' && (
            <>
              <button
                disabled={actionLoading}
                onClick={() => handleStatusChange('APPROVED', 'Disetujui oleh customer')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                Setujui (APPROVED)
              </button>
              <button
                disabled={actionLoading}
                onClick={() => {
                  const reason = window.prompt('Alasan penolakan penawaran:') || 'Ditolak customer';
                  handleStatusChange('REJECTED', reason);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition"
              >
                <XCircle className="w-4 h-4" />
                Tolak
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleStatusChange('DRAFT', 'Dikembalikan ke draft')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <RotateCcw className="w-4 h-4" />
                Kembali ke Draft
              </button>
            </>
          )}

          {/* REJECTED Actions */}
          {penawaran.status === 'REJECTED' && (
            <button
              disabled={actionLoading}
              onClick={() => handleStatusChange('DRAFT', 'Revisi dari penolakan')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 hover:bg-brand-100 transition"
            >
              <RotateCcw className="w-4 h-4" />
              Revisi ke Draft
            </button>
          )}

          {/* CANCELLED / Non-cancelled Cancel button */}
          {penawaran.status !== 'CANCELLED' && penawaran.status !== 'DRAFT' && (
            <button
              disabled={actionLoading}
              onClick={() => {
                if (window.confirm('Yakin ingin membatalkan surat penawaran ini?')) {
                  handleStatusChange('CANCELLED', 'Dibatalkan oleh operator');
                }
              }}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-amber-700 hover:bg-amber-50 transition"
            >
              <Ban className="w-3.5 h-3.5" />
              Batalkan
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
      {isApproved && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-950 flex items-start gap-3 shadow-sm print:hidden">
          <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Dokumen Terkunci Secara Finansial (Financial Locked)</p>
            <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
              Surat penawaran ini telah berstatus <strong>DISESETUJUI (APPROVED)</strong>. Nilai total, volume, dan harga satuan telah dikunci untuk melindungi keabsahan penerbitan faktur penjualan berikutnya (anti-manipulation).
            </p>
          </div>
        </div>
      )}

      {/* Printable Document Sheet */}
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
              SURAT PENAWARAN HARGA
            </span>
            <p className="font-mono text-sm font-bold text-brand-700">{penawaran.number}</p>
            <p className="text-xs text-slate-500">
              Tanggal: {new Date(penawaran.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
            </p>
          </div>
        </div>

        {/* Customer & Info Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-200 print:bg-transparent">
          <div className="space-y-1 text-xs text-slate-600">
            <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Ditujukan Kepada:</p>
            <p className="text-sm font-bold text-slate-900">{customer?.name || penawaran.customerName}</p>
            {customer?.companyName && <p className="font-semibold text-slate-700">{customer.companyName}</p>}
            {customer?.address && <p className="text-slate-500 max-w-xs">{customer.address}</p>}
            {customer?.picName && <p className="text-slate-500">U.p.: Bpk/Ibu {customer.picName}</p>}
            {customer?.phone && <p className="text-slate-500">Kontak: {customer.phone}</p>}
          </div>

          <div className="space-y-1 text-xs text-slate-600 sm:text-right">
            <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Status & Referensi:</p>
            <p className="text-sm font-bold text-slate-900 font-mono">Kode Customer: {penawaran.customerCode}</p>
            <p className="text-slate-500">
              Total Rincian: <span className="font-semibold text-slate-700">{penawaran.details?.length || 0} Item</span>
            </p>
            <p className="text-slate-500">
              Status Resmi: <span className="font-bold uppercase text-brand-700">{penawaran.status}</span>
            </p>
            <p className="text-slate-400 text-[11px] pt-1">
              Dibuat oleh: {penawaran.createdBy || 'operator'}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Daftar Uraian Pekerjaan & Penawaran Harga
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-12 text-center">No</th>
                  <th className="py-2.5 px-3">Deskripsi Pekerjaan / Pengadaan</th>
                  <th className="py-2.5 px-3 w-28 text-right">Volume</th>
                  <th className="py-2.5 px-3 w-24 text-center">Satuan</th>
                  <th className="py-2.5 px-3 w-36 text-right">Harga Satuan</th>
                  <th className="py-2.5 px-3 w-40 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {penawaran.details && penawaran.details.length > 0 ? (
                  penawaran.details.map((detail, idx) => (
                    <tr key={detail.id || idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 text-center text-xs font-mono text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{detail.description}</div>
                        {detail.kegiatanName && (
                          <span className="text-[11px] text-brand-600 font-medium">
                            • Kegiatan: {detail.kegiatanName}
                          </span>
                        )}
                        {detail.notes && (
                          <div className="text-[11px] text-slate-500 italic mt-0.5">{detail.notes}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-700">
                        {detail.volume}
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
                      Tidak ada rincian item.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-900 bg-slate-50 font-bold">
                  <td colSpan={5} className="py-3.5 px-3 text-right text-xs uppercase tracking-wider text-slate-700">
                    Total Nilai Penawaran (IDR):
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-base text-brand-700">
                    {formatCurrency(penawaran.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Terms & Notes Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Syarat & Ketentuan Pembayaran:
            </h4>
            <div className="text-xs text-slate-600 font-mono whitespace-pre-line bg-slate-50 p-3.5 rounded-lg border border-slate-200 leading-relaxed print:bg-transparent">
              {penawaran.terms || 'Mengikuti ketentuan kontrak dan invoice resmi CV. ANDARA.'}
            </div>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Catatan Khusus:
            </h4>
            <div className="text-xs text-slate-600 whitespace-pre-line bg-slate-50 p-3.5 rounded-lg border border-slate-200 leading-relaxed print:bg-transparent">
              {penawaran.notes || 'Penawaran berlaku selama 14 hari kalender sejak tanggal penerbitan.'}
            </div>
          </div>
        </div>

        {/* Signatures for Print */}
        <div className="pt-10 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="space-y-16">
            <p className="font-semibold text-slate-700">Diajukan oleh,<br /><strong>CV. ANDARA</strong></p>
            <div className="border-t border-slate-400 w-44 mx-auto pt-1 font-bold text-slate-900">
              Bagian Operasional / Penjualan
            </div>
          </div>

          <div className="space-y-16">
            <p className="font-semibold text-slate-700">Disetujui oleh Pelanggan,<br /><strong>{customer?.name || penawaran.customerName}</strong></p>
            <div className="border-t border-slate-400 w-44 mx-auto pt-1 font-bold text-slate-900">
              Tanda Tangan & Cap Instansi
            </div>
          </div>
        </div>
      </div>

      {/* Audit History Modal */}
      {penawaran && (
        <AuditHistoryModal
          isOpen={showAuditModal}
          onClose={() => setShowAuditModal(false)}
          entityType="PENAWARAN"
          entityId={penawaran.id}
          title={`Audit Trail - Penawaran ${penawaran.number}`}
        />
      )}
    </div>
  );
};

export default PenawaranDetailPage;

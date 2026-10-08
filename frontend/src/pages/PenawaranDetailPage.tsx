import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Calculator,
  Edit,
  Trash2,
  Printer,
  CheckCircle2,
  XCircle,
  Ban,
  Send,
  RotateCcw,
  AlertCircle,
  Lock,
  History,
  Receipt,
  GitBranch
} from 'lucide-react';
import { penawaranApi } from '../api/penawaranApi';
import { customerApi } from '../api/customerApi';
import { Penawaran, PenawaranStatus } from '../types/penawaran';
import { Customer } from '../types/customer';
import { AuditHistoryModal } from '../components/audit/AuditHistoryModal';
import { AndaraLetterhead } from '../components/common/AndaraLetterhead';
import { BentoCard } from '@/components/common/BentoCard';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';

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

      const updated = await penawaranApi.updateStatus(penawaran.id, {
        status: targetStatus,
        notes: promptNote,
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
    if (!window.confirm(`Yakin ingin menghapus penawaran draft ${penawaran.number}?`)) return;

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
      <div className="flex items-center justify-center p-20">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
        <span className="ml-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Memuat rincian penawaran...</span>
      </div>
    );
  }

  if (!penawaran) {
    return (
      <BentoCard className="max-w-xl mx-auto p-8 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <p className="text-base font-bold text-slate-800 dark:text-slate-200">Penawaran tidak ditemukan</p>
        <button
          onClick={() => navigate('/penawaran')}
          className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline"
        >
          ← Kembali ke daftar penawaran
        </button>
      </BentoCard>
    );
  }

  const isApproved = penawaran.status === 'APPROVED';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Navigation */}
      <PageHeader
        icon={Calculator}
        backUrl="/penawaran"
        title={penawaran.number}
        subtitle={`Dibuat pada ${new Date(penawaran.date).toLocaleDateString('id-ID', { dateStyle: 'long' })}`}
        badge={
          <div className="flex items-center gap-2">
            <StatusBadge status={penawaran.status} />
            {penawaran.isAddendum && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
                <GitBranch className="w-3 h-3" />
                Addendum #{penawaran.addendumNumberIndex || 1}
              </span>
            )}
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            {/* Print Button */}
            <button
              onClick={() => window.open(`/penawaran/${penawaran.id}/print`, '_blank')}
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
              title="Lihat riwayat audit penawaran ini"
            >
              <History className="w-4 h-4 text-slate-500" />
              Audit Trail
            </button>

            {/* Buat SPH Addendum Button when Approved & not Addendum */}
            {isApproved && !penawaran.isAddendum && (
              <button
                onClick={() => navigate(`/penawaran/create?parentId=${penawaran.id}`)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 shadow-xs transition"
                title="Buat SPH Addendum / Pekerjaan Tambah atas kontrak ini"
              >
                <GitBranch className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Buat SPH Addendum
              </button>
            )}

            {/* Buat Faktur Penjualan Button when Approved */}
            {isApproved && (
              <button
                onClick={() => navigate(`/faktur/create?penawaranId=${penawaran.id}`)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-md shadow-emerald-500/25 transition"
              >
                <Receipt className="w-4 h-4" />
                Buat Faktur Penjualan
              </button>
            )}

            {/* DRAFT Actions */}
            {penawaran.status === 'DRAFT' && (
              <>
                <button
                  disabled={actionLoading}
                  onClick={() => navigate(`/penawaran/${penawaran.id}/edit`)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs transition"
                >
                  <Edit className="w-4 h-4 text-amber-500" />
                  Edit
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleStatusChange('SENT', 'Diajukan ke customer')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 shadow-md shadow-brand-500/25 transition"
                >
                  <Send className="w-4 h-4" />
                  Ajukan ke Customer
                </button>
                <button
                  disabled={actionLoading}
                  onClick={handleDelete}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition border border-rose-500/20"
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
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-md shadow-emerald-500/25 transition"
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition"
                >
                  <XCircle className="w-4 h-4 text-rose-500" />
                  Tolak
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleStatusChange('DRAFT', 'Dikembalikan ke draft')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition"
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
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-brand-700 dark:text-brand-300 bg-brand-500/10 border border-brand-500/20 hover:bg-brand-500/20 transition"
              >
                <RotateCcw className="w-4 h-4 text-brand-500" />
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
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 transition border border-amber-500/20"
              >
                <Ban className="w-4 h-4 text-amber-500" />
                Batalkan
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
      {isApproved && (
        <BentoCard className="p-4 bg-emerald-500/10 border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Dokumen Terkunci Secara Finansial (Financial Locked)
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed font-medium">
                Surat penawaran ini telah berstatus <strong className="text-emerald-600 dark:text-emerald-400">DISETUJUI (APPROVED)</strong>. Nilai total, volume, dan harga satuan telah dikunci untuk melindungi keabsahan penerbitan faktur penjualan berikutnya (AGENTS.md §9.8).
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/faktur/create?penawaranId=${penawaran.id}`)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-md shadow-emerald-500/25 transition shrink-0 whitespace-nowrap self-start sm:self-center"
          >
            <Receipt className="w-4 h-4" />
            Terbitkan Faktur Penjualan
          </button>
        </BentoCard>
      )}

      {/* SPH Addendum Context Banner (If current doc is Addendum) */}
      {penawaran.isAddendum && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs print:hidden">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                SPH Addendum ke-{penawaran.addendumNumberIndex || 1} (Variation Order)
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Surat penawaran ini merupakan pekerjaan tambah resmi yang terhubung dengan SPH Induk{' '}
                <strong className="text-amber-700 dark:text-amber-300 font-mono">
                  {penawaran.parentPenawaranNumber}
                </strong>
                .
              </p>
            </div>
          </div>
          {penawaran.parentPenawaranId && (
            <button
              onClick={() => navigate(`/penawaran/${penawaran.parentPenawaranId}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shrink-0 transition"
            >
              Lihat SPH Induk ({penawaran.parentPenawaranNumber}) &rarr;
            </button>
          )}
        </div>
      )}

      {/* Addendum History & Contract Ceiling Card for Parent SPH */}
      {!penawaran.isAddendum && (
        <BentoCard className="p-6 space-y-4 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-amber-500" />
                Riwayat SPH Addendum & Akumulasi Plafon Kontrak (V-12)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pekerjaan tambah / variation order resmi yang diterbitkan untuk menyempurnakan kontrak ini.
              </p>
            </div>
            {isApproved && (
              <button
                onClick={() => navigate(`/penawaran/create?parentId=${penawaran.id}`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition self-start sm:self-auto shrink-0"
              >
                <GitBranch className="w-3.5 h-3.5" />
                + Tambah SPH Addendum
              </button>
            )}
          </div>

          {/* Metric Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Nilai Kontrak Utama (SPH Induk)
              </span>
              <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white mt-1 block">
                {formatCurrency(penawaran.totalAmount)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20">
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                Total Addendum Disetujui
              </span>
              <span className="text-base font-extrabold font-mono text-amber-700 dark:text-amber-300 mt-1 block">
                {formatCurrency(
                  Math.max(
                    0,
                    (penawaran.cumulativeTotalAmount || penawaran.totalAmount) - penawaran.totalAmount
                  )
                )}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                Plafon Total Akumulasi Kontrak
              </span>
              <span className="text-base font-extrabold font-mono text-emerald-700 dark:text-emerald-400 mt-1 block">
                {formatCurrency(penawaran.cumulativeTotalAmount || penawaran.totalAmount)}
              </span>
            </div>
          </div>

          {/* Addendum List Table */}
          {penawaran.addendums && penawaran.addendums.length > 0 ? (
            <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-b border-slate-200/80 dark:border-slate-800 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">No. SPH Addendum</th>
                    <th className="py-2.5 px-3">Index</th>
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3 text-right">Nilai Pekerjaan Tambah</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {penawaran.addendums.map((add) => (
                    <tr key={add.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {add.number}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        ADD-{String(add.addendumNumberIndex || 1).padStart(2, '0')}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {new Date(add.date).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(add.totalAmount)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <StatusBadge status={add.status} />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => navigate(`/penawaran/${add.id}`)}
                          className="px-2.5 py-1 text-[11px] font-bold text-brand-600 hover:text-brand-700 bg-brand-500/10 hover:bg-brand-500/20 rounded-lg transition"
                        >
                          Lihat Detail &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              Belum ada SPH Addendum yang dibuat untuk penawaran ini.
            </div>
          )}
        </BentoCard>
      )}

      {/* Printable Document Sheet (Paper view with official letterhead) */}
      <div className="bg-white text-slate-900 rounded-3xl border border-slate-200/90 shadow-bento p-6 sm:p-10 space-y-8 print:shadow-none print:border-none print:p-0">
        {/* Letterhead Resmi CV. ANDARA */}
        <AndaraLetterhead showDivisiStrip={false} className="mb-4" />

        {/* Customer & Info Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 print:bg-transparent">
          <div className="space-y-1 text-xs text-slate-600">
            <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Ditujukan Kepada:</p>
            <p className="text-sm font-bold text-slate-900">{customer?.name || penawaran.customerName}</p>
            {customer?.companyName && <p className="font-semibold text-slate-700">{customer.companyName}</p>}
            {customer?.address && <p className="text-slate-500 max-w-xs">{customer.address}</p>}
            {customer?.picName && <p className="text-slate-500">U.p.: Bpk/Ibu {customer.picName}</p>}
            {customer?.phone && <p className="text-slate-500 font-mono">Kontak: {customer.phone}</p>}
          </div>

          <div className="space-y-1 text-xs text-slate-600 sm:text-right">
            <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Status & Referensi:</p>
            <p className="text-sm font-bold text-slate-900 font-mono">Kode Customer: {penawaran.customerCode}</p>
            <p className="text-slate-500">
              Total Rincian: <span className="font-bold text-slate-700">{penawaran.details?.length || 0} Item</span>
            </p>
            <p className="text-slate-500">
              Status Resmi: <span className="font-bold uppercase text-brand-700">{penawaran.status}</span>
            </p>
            {penawaran.isAddendum && (
              <p className="text-amber-800 font-bold text-[11px]">
                SPH Addendum #{penawaran.addendumNumberIndex || 1} (Ref SPH Induk: {penawaran.parentPenawaranNumber})
              </p>
            )}
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
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-12 text-center">No</th>
                  <th className="py-2.5 px-3">Deskripsi Pekerjaan / Pengadaan</th>
                  <th className="py-2.5 px-3 w-28 text-right">Volume</th>
                  <th className="py-2.5 px-3 w-24 text-center">Satuan</th>
                  <th className="py-2.5 px-3 w-36 text-right">Harga Satuan</th>
                  <th className="py-2.5 px-3 w-40 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {penawaran.kegiatanList && penawaran.kegiatanList.length > 0 ? (
                  penawaran.kegiatanList.map((kegiatan, kIdx) => {
                    const letter = String.fromCharCode(65 + kIdx);
                    return (
                      <React.Fragment key={kegiatan.id || kIdx}>
                        {/* Kegiatan Group Header */}
                        <tr className="bg-slate-100/90 font-bold border-t border-b border-slate-300">
                          <td className="py-2.5 px-3 text-center text-xs font-mono text-slate-900 font-bold">
                            {letter}
                          </td>
                          <td colSpan={5} className="py-2.5 px-3 text-xs uppercase tracking-wider text-slate-900 font-bold">
                            {kegiatan.name}
                          </td>
                        </tr>
                        {/* Items in this Kegiatan */}
                        {kegiatan.items && kegiatan.items.length > 0 ? (
                          kegiatan.items.map((item, itemIdx) => (
                            <tr key={item.id || itemIdx} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3 text-center text-xs font-mono text-slate-500">
                                {itemIdx + 1}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-bold text-slate-800 text-xs sm:text-sm">
                                  {item.description}
                                </div>
                                {item.notes && (
                                  <div className="text-[11px] text-slate-500 italic mt-0.5">
                                    {item.notes}
                                  </div>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-700 text-xs">
                                {item.volume}
                              </td>
                              <td className="py-2.5 px-3 text-center text-xs text-slate-600">
                                {item.unit}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-slate-700 text-xs">
                                {formatCurrency(item.unitPrice)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 text-xs">
                                {formatCurrency(item.amount)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-2 px-3 text-center text-xs text-slate-400 italic">
                              Belum ada item dalam kegiatan ini.
                            </td>
                          </tr>
                        )}
                        {/* Kegiatan Subtotal Row */}
                        <tr className="bg-slate-50/80 font-semibold border-b border-slate-200">
                          <td colSpan={5} className="py-2 px-3 text-right text-xs font-bold text-slate-700">
                            JUMLAH {letter} :
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-800 text-xs">
                            {formatCurrency(kegiatan.subtotal)}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })
                ) : penawaran.details && penawaran.details.length > 0 ? (
                  penawaran.details.map((detail, idx) => (
                    <tr key={detail.id || idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 text-center text-xs font-mono text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{detail.description}</div>
                        {detail.kegiatanName && (
                          <span className="text-[11px] text-brand-600 font-semibold">
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
                <tr className="border-t-2 border-slate-900 bg-slate-50/80 font-bold">
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
            <div className="text-xs text-slate-600 font-mono whitespace-pre-line bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed print:bg-transparent">
              {penawaran.terms || 'Mengikuti ketentuan kontrak dan invoice resmi CV. ANDARA.'}
            </div>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Catatan Khusus:
            </h4>
            <div className="text-xs text-slate-600 whitespace-pre-line bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed print:bg-transparent">
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

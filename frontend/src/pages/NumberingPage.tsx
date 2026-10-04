import React, { useState, useEffect } from 'react';
import {
  Hash,
  Save,
  FileText,
  Receipt,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Settings2,
  HelpCircle,
  Play,
  RotateCcw
} from 'lucide-react';
import { numberingApi } from '../api/numberingApi';
import {
  DocumentType,
  NumberingConfiguration,
  ResetPeriod,
  UpdateNumberingRequest
} from '../types/numbering';
import { BentoCard } from '@/components/common/BentoCard';
import { PageHeader } from '@/components/common/PageHeader';

const DOC_TYPE_META: Record<DocumentType, { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  PENAWARAN: {
    title: 'Surat Penawaran Harga',
    subtitle: 'Dokumen estimasi biaya & penawaran proyek',
    icon: FileText,
    color: 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40',
  },
  FAKTUR: {
    title: 'Faktur Penjualan (Invoice)',
    subtitle: 'Tagihan resmi transaksi dan termin proyek',
    icon: Receipt,
    color: 'border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40',
  },
  PEMBAYARAN: {
    title: 'Bukti Pembayaran',
    subtitle: 'Penerimaan dana kas/bank dari customer',
    icon: CreditCard,
    color: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
  },
  KWITANSI: {
    title: 'Kwitansi Resmi',
    subtitle: 'Tanda terima pembayaran sah bertanda tangan',
    icon: Receipt,
    color: 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
  },
};

const AVAILABLE_TOKENS = [
  { token: '{PREFIX}', label: 'Prefix', desc: 'Kode awalan dokumen (contoh: PBR)' },
  { token: '{YEAR}', label: 'Tahun (YYYY)', desc: 'Tahun 4 digit (contoh: 2026)' },
  { token: '{YY}', label: 'Tahun (YY)', desc: 'Tahun 2 digit (contoh: 26)' },
  { token: '{MONTH}', label: 'Bulan (MM)', desc: 'Bulan 2 digit (contoh: 09)' },
  { token: '{DAY}', label: 'Hari (DD)', desc: 'Tanggal 2 digit (contoh: 24)' },
  { token: '{COUNTER}', label: 'Counter', desc: 'Nomor urut otomatis berpadded 0' },
  { token: '{SUFFIX}', label: 'Suffix', desc: 'Kode akhiran opsional' },
];

export const NumberingPage: React.FC = () => {
  const [configs, setConfigs] = useState<NumberingConfiguration[]>([]);
  const [selectedType, setSelectedType] = useState<DocumentType>('PENAWARAN');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingGenerate, setTestingGenerate] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);

  // Form State for currently selected document
  const [formData, setFormData] = useState<UpdateNumberingRequest>({
    prefix: '',
    suffix: '',
    counterDigits: 4,
    resetPeriod: 'MONTHLY',
    formatPattern: '',
  });

  const [livePreview, setLivePreview] = useState<string>('');

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await numberingApi.getAllConfigurations();
      setConfigs(data);

      const current = data.find((c) => c.documentType === selectedType) || data[0];
      if (current) {
        setSelectedType(current.documentType);
        syncFormWithConfig(current);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal memuat konfigurasi penomoran.');
    } finally {
      setLoading(false);
    }
  };

  const syncFormWithConfig = (config: NumberingConfiguration) => {
    setFormData({
      prefix: config.prefix,
      suffix: config.suffix || '',
      counterDigits: config.counterDigits,
      resetPeriod: config.resetPeriod,
      formatPattern: config.formatPattern,
    });
    setLivePreview(config.previewNumber);
  };

  const handleSelectType = (docType: DocumentType) => {
    setSelectedType(docType);
    const found = configs.find((c) => c.documentType === docType);
    if (found) {
      syncFormWithConfig(found);
    }
  };

  // Compute live preview dynamically whenever form inputs change
  useEffect(() => {
    const today = new Date();
    const year4 = today.getFullYear().toString();
    const year2 = (today.getFullYear() % 100).toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const paddedCounter = '1'.padStart(formData.counterDigits, '0');

    let rendered = formData.formatPattern || '{PREFIX}/{YEAR}/{MONTH}/{COUNTER}';
    rendered = rendered
      .replace(/{PREFIX}/g, formData.prefix || '')
      .replace(/{SUFFIX}/g, formData.suffix || '')
      .replace(/{YEAR}/g, year4)
      .replace(/{YYYY}/g, year4)
      .replace(/{YY}/g, year2)
      .replace(/{MONTH}/g, month)
      .replace(/{MM}/g, month)
      .replace(/{DAY}/g, day)
      .replace(/{DD}/g, day)
      .replace(/{COUNTER}/g, paddedCounter);

    setLivePreview(rendered);
  }, [formData]);

  const insertToken = (token: string) => {
    setFormData((prev) => ({
      ...prev,
      formatPattern: prev.formatPattern ? `${prev.formatPattern}/${token}` : token,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg(null);
      setErrorMsg(null);

      const updated = await numberingApi.updateConfiguration(selectedType, formData);
      setSuccessMsg(`Format penomoran untuk ${selectedType} berhasil disimpan.`);

      setConfigs((prev) =>
        prev.map((c) => (c.documentType === selectedType ? updated : c))
      );
      setLivePreview(updated.previewNumber);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan perubahan konfigurasi.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestGenerate = async () => {
    try {
      setTestingGenerate(true);
      setErrorMsg(null);
      const generated = await numberingApi.generateNextNumber(selectedType);
      setGeneratedResult(generated);
      const data = await numberingApi.getAllConfigurations();
      setConfigs(data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal melakukan simulasi generate counter.');
    } finally {
      setTestingGenerate(false);
    }
  };

  const currentConfig = configs.find((c) => c.documentType === selectedType);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <PageHeader
        title="Pengaturan Penomoran Dokumen"
        subtitle="Konfigurasi format penomoran otomatis dengan proteksi concurrency locking dan kepatuhan finansial."
        icon={Hash}
        badge={
          <span className="neu-badge">
            <Hash className="w-3.5 h-3.5" />
            Sistem Dokumen
          </span>
        }
      />

      {/* Integrity Notice Banner */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-300 flex items-start gap-3 shadow-neu-convex-xs">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-black text-amber-950 dark:text-amber-200">Aturan Integritas Finansial Penomoran Dokumen</p>
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
            Sesuai aturan arsitektur CV. ANDARA, nomor dokumen yang telah diterbitkan pada transaksi tidak boleh digunakan ulang (no reuse), bahkan jika dokumen dibatalkan. Counter nomor dijamin berurutan secara atomik di tingkat database PostgreSQL melalui row-level lock.
          </p>
        </div>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center gap-3 text-sm font-semibold shadow-neu-convex-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 flex items-center gap-3 text-sm font-semibold shadow-neu-convex-xs">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-16">
          <div className="w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
          <span className="ml-3 text-sm font-bold text-slate-600 dark:text-slate-400">Memuat konfigurasi penomoran...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Document Type Selector Cards (Left Column) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
              Pilih Jenis Dokumen
            </h3>
            {configs.map((config) => {
              const meta = DOC_TYPE_META[config.documentType];
              const isSelected = selectedType === config.documentType;
              const Icon = meta.icon;

              return (
                <button
                  key={config.documentType}
                  type="button"
                  onClick={() => handleSelectType(config.documentType)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-150 flex items-start gap-3.5 ${
                    isSelected
                      ? 'border-brand-500/40 bg-neu-surface shadow-neu-inset-sm text-brand-600 font-bold'
                      : 'border-neu-border bg-neu-surface shadow-neu-convex-xs hover:shadow-neu-convex-sm active:shadow-neu-inset-xs'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl border shrink-0 ${
                      isSelected ? 'bg-brand-500 text-white shadow-neu-accent border-white/20' : 'bg-neu-canvas text-slate-500 dark:text-slate-400 border-neu-border/60 shadow-neu-inset-xs'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-slate-900 dark:text-slate-100 truncate">
                        {config.documentType}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-neu-canvas text-slate-600 dark:text-slate-300 border border-neu-border/60 shadow-neu-inset-xs">
                        #{config.currentCounter}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate font-medium">{meta.title}</p>
                    <div className="mt-2 text-xs font-mono font-bold text-brand-600 dark:text-brand-400 bg-neu-canvas px-2.5 py-1 rounded-lg border border-neu-border/60 shadow-neu-inset-xs truncate">
                      {config.previewNumber}
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Quick Summary Info */}
            {currentConfig && (
              <BentoCard padding="default" className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Periode Aktif:</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    {currentConfig.currentPeriod || 'Selamanya (Never)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Counter Terakhir:</span>
                  <span className="font-mono font-black text-slate-900 dark:text-slate-100">
                    {currentConfig.currentCounter}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Pembaruan:</span>
                  <span className="text-slate-600 dark:text-slate-400 font-semibold">
                    {currentConfig.updatedAt
                      ? new Date(currentConfig.updatedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Default Seed'}
                  </span>
                </div>
              </BentoCard>
            )}
          </div>

          {/* Configuration Form & Live Preview (Right Column) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Live Interactive Preview Box */}
            <BentoCard padding="default">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-500" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Live Real-Time Preview
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  Simulasi Dokumen Berikutnya
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-neu-canvas text-slate-900 dark:text-white shadow-neu-inset-sm border border-neu-border/60">
                <span className="font-mono text-lg font-black tracking-wide text-brand-600 dark:text-brand-400 break-all">
                  {livePreview || 'FORMAT-INVALID'}
                </span>
                <span className="shrink-0 text-[10px] font-mono uppercase bg-neu-surface text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md border border-neu-border shadow-neu-convex-xs font-bold">
                  {selectedType}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
                Format nomor di atas akan otomatis digunakan ketika dokumen {selectedType} baru dibuat oleh sistem.
              </p>
            </BentoCard>

            {/* Pattern Configuration Form */}
            <BentoCard padding="default">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="flex items-center justify-between border-b border-neu-border/60 pb-4">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    <h2 className="font-black text-slate-900 dark:text-slate-100 text-base">
                      Konfigurasi Format: {selectedType}
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                    {DOC_TYPE_META[selectedType].title}
                  </span>
                </div>

                {/* Format Pattern Input & Token Helper */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Pola Format (Format Pattern) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.formatPattern}
                      onChange={(e) => setFormData({ ...formData, formatPattern: e.target.value })}
                      placeholder="{PREFIX}/{YEAR}/{MONTH}/{COUNTER}"
                      className="neu-input w-full font-mono text-sm px-3.5 py-2.5 font-bold"
                    />
                  </div>
                  <div className="pt-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1 font-semibold">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      Klik token di bawah untuk menyisipkan ke pola format:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {AVAILABLE_TOKENS.map((t) => (
                        <button
                          key={t.token}
                          type="button"
                          onClick={() => insertToken(t.token)}
                          title={t.desc}
                          className="neu-btn text-xs font-mono font-bold"
                        >
                          <span>{t.token}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Grid 2 Columns for Prefix & Suffix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Prefix Dokumen <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={20}
                      value={formData.prefix}
                      onChange={(e) => setFormData({ ...formData, prefix: e.target.value.toUpperCase() })}
                      placeholder="Contoh: PBR, INV, KWT"
                      className="neu-input w-full font-mono text-xs px-3.5 py-2 uppercase font-bold"
                    />
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Gunakan huruf kapital singkat.</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Suffix Dokumen (Opsional)
                    </label>
                    <input
                      type="text"
                      maxLength={20}
                      value={formData.suffix}
                      onChange={(e) => setFormData({ ...formData, suffix: e.target.value.toUpperCase() })}
                      placeholder="Contoh: ANDARA"
                      className="neu-input w-full font-mono text-xs px-3.5 py-2 uppercase font-bold"
                    />
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Dapat dikosongkan jika tidak diperlukan.</p>
                  </div>
                </div>

                {/* Grid 2 Columns for Counter Digits & Reset Period */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Jumlah Digit Counter <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        required
                        min={3}
                        max={8}
                        value={formData.counterDigits}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            counterDigits: parseInt(e.target.value, 10) || 4,
                          })
                        }
                        className="neu-input w-24 font-mono text-xs px-3 py-2 font-bold"
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        (Contoh {formData.counterDigits} digit: {'1'.padStart(formData.counterDigits, '0')})
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Periode Reset Counter <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.resetPeriod}
                      onChange={(e) =>
                        setFormData({ ...formData, resetPeriod: e.target.value as ResetPeriod })
                      }
                      className="neu-input w-full text-xs px-3 py-2 font-bold"
                    >
                      <option value="MONTHLY">MONTHLY (Reset counter ke 1 setiap bulan baru)</option>
                      <option value="YEARLY">YEARLY (Reset counter ke 1 setiap awal tahun baru)</option>
                      <option value="NEVER">NEVER (Counter terus bertambah tanpa reset)</option>
                    </select>
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-neu-border/60">
                  <button
                    type="button"
                    onClick={() => currentConfig && syncFormWithConfig(currentConfig)}
                    className="neu-btn"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset ke Nilai Simpanan
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="neu-btn-primary"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Menyimpan...' : 'Simpan Format Penomoran'}
                  </button>
                </div>
              </form>
            </BentoCard>

            {/* Test Simulation Box */}
            <BentoCard padding="default" className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Uji Coba Generate Nomor Berikutnya (Pessimistic Locking)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    Menguji eksekusi atomic counter increment langsung ke database PostgreSQL dengan locking transaksi.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTestGenerate}
                  disabled={testingGenerate}
                  className="neu-btn text-xs font-bold text-emerald-700 dark:text-emerald-400"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  {testingGenerate ? 'Memproses...' : `Generate Nomor ${selectedType}`}
                </button>
              </div>

              {generatedResult && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs flex items-center justify-between shadow-neu-convex-xs">
                  <span className="text-emerald-800 dark:text-emerald-300 font-bold">Nomor Berhasil Digenerate:</span>
                  <span className="font-mono font-black text-sm text-emerald-900 dark:text-emerald-200 bg-neu-surface px-3 py-1 rounded-lg border border-emerald-500/40 shadow-neu-convex-xs">
                    {generatedResult}
                  </span>
                </div>
              )}
            </BentoCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default NumberingPage;

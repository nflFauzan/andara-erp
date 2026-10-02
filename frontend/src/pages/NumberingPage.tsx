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

  const loadConfigurations = async () => {
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
      setErrorMsg(err.response?.data?.message || 'Gagal memuat konfigurasi penomoran dokumen.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigurations();
  }, []);

  const syncFormWithConfig = (config: NumberingConfiguration) => {
    setFormData({
      prefix: config.prefix || '',
      suffix: config.suffix || '',
      counterDigits: config.counterDigits || 4,
      resetPeriod: config.resetPeriod || 'MONTHLY',
      formatPattern: config.formatPattern || '{PREFIX}/{YEAR}/{MONTH}/{COUNTER}',
    });
    setLivePreview(config.previewNumber || '');
    setGeneratedResult(null);
    setSuccessMsg(null);
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
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Pengaturan Penomoran Dokumen"
        subtitle="Konfigurasi format penomoran otomatis dengan proteksi concurrency locking dan kepatuhan finansial."
        badge={
          <span className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
            <Hash className="w-3.5 h-3.5" />
            Sistem Dokumen
          </span>
        }
      />

      {/* Integrity Notice Banner */}
      <div className="rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/30 p-4 text-sm text-amber-900 dark:text-amber-300 flex items-start gap-3 shadow-xs">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-950 dark:text-amber-200">Aturan Integritas Finansial Penomoran Dokumen</p>
          <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
            Sesuai aturan arsitektur CV. ANDARA, nomor dokumen yang telah diterbitkan pada transaksi tidak boleh digunakan ulang (no reuse), bahkan jika dokumen dibatalkan. Counter nomor dijamin berurutan secara atomik di tingkat database PostgreSQL melalui row-level lock.
          </p>
        </div>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-16">
          <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
          <span className="ml-3 text-sm font-medium text-slate-600 dark:text-slate-400">Memuat konfigurasi penomoran...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Document Type Selector Cards (Left Column) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
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
                      ? 'border-indigo-600 dark:border-indigo-500 bg-white dark:bg-navy-900 ring-2 ring-indigo-500/20 shadow-bento'
                      : 'border-slate-200/80 dark:border-navy-700/80 bg-white dark:bg-navy-900/60 hover:border-slate-300 dark:hover:border-navy-600 hover:bg-slate-50/50 dark:hover:bg-navy-800/40'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl border shrink-0 ${
                      isSelected ? meta.color : 'bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-navy-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
                        {config.documentType}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-700">
                        #{config.currentCounter}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{meta.title}</p>
                    <div className="mt-2 text-xs font-mono font-medium text-indigo-700 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40 px-2 py-1 rounded-lg border border-indigo-200/50 dark:border-indigo-800/40 truncate">
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
                  <span className="text-slate-400 dark:text-slate-500">Periode Aktif:</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {currentConfig.currentPeriod || 'Selamanya (Never)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 dark:text-slate-500">Counter Terakhir:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {currentConfig.currentCounter}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 dark:text-slate-500">Pembaruan:</span>
                  <span className="text-slate-600 dark:text-slate-400">
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
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                    Live Real-Time Preview
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Simulasi Dokumen Berikutnya
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 dark:bg-navy-950 text-white shadow-inner border border-slate-800 dark:border-navy-800">
                <span className="font-mono text-lg font-bold tracking-wide text-indigo-300 break-all">
                  {livePreview || 'FORMAT-INVALID'}
                </span>
                <span className="shrink-0 text-[10px] font-mono uppercase bg-slate-800 dark:bg-navy-900 text-slate-400 px-2.5 py-1 rounded-md border border-slate-700 dark:border-navy-700">
                  {selectedType}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                Format nomor di atas akan otomatis digunakan ketika dokumen {selectedType} baru dibuat oleh sistem.
              </p>
            </BentoCard>

            {/* Pattern Configuration Form */}
            <BentoCard padding="default">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-4">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    <h2 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                      Konfigurasi Format: {selectedType}
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {DOC_TYPE_META[selectedType].title}
                  </span>
                </div>

                {/* Format Pattern Input & Token Helper */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Pola Format (Format Pattern) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.formatPattern}
                      onChange={(e) => setFormData({ ...formData, formatPattern: e.target.value })}
                      placeholder="{PREFIX}/{YEAR}/{MONTH}/{COUNTER}"
                      className="w-full font-mono text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="pt-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1 font-medium">
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
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-700 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors"
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Prefix Dokumen <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={20}
                      value={formData.prefix}
                      onChange={(e) => setFormData({ ...formData, prefix: e.target.value.toUpperCase() })}
                      placeholder="Contoh: PBR, INV, KWT"
                      className="w-full font-mono text-sm px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Gunakan huruf kapital singkat.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Suffix Dokumen (Opsional)
                    </label>
                    <input
                      type="text"
                      maxLength={20}
                      value={formData.suffix}
                      onChange={(e) => setFormData({ ...formData, suffix: e.target.value.toUpperCase() })}
                      placeholder="Contoh: ANDARA"
                      className="w-full font-mono text-sm px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Dapat dikosongkan jika tidak diperlukan.</p>
                  </div>
                </div>

                {/* Grid 2 Columns for Counter Digits & Reset Period */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
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
                        className="w-24 font-mono text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        (Contoh {formData.counterDigits} digit: {'1'.padStart(formData.counterDigits, '0')})
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Periode Reset Counter <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.resetPeriod}
                      onChange={(e) =>
                        setFormData({ ...formData, resetPeriod: e.target.value as ResetPeriod })
                      }
                      className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="MONTHLY">MONTHLY (Reset counter ke 1 setiap bulan baru)</option>
                      <option value="YEARLY">YEARLY (Reset counter ke 1 setiap awal tahun baru)</option>
                      <option value="NEVER">NEVER (Counter terus bertambah tanpa reset)</option>
                    </select>
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-navy-800">
                  <button
                    type="button"
                    onClick={() => currentConfig && syncFormWithConfig(currentConfig)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset ke Nilai Simpanan
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-xs transition disabled:opacity-50"
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
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Uji Coba Generate Nomor Berikutnya (Pessimistic Locking)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Menguji eksekusi atomic counter increment langsung ke database PostgreSQL dengan locking transaksi.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTestGenerate}
                  disabled={testingGenerate}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 transition disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  {testingGenerate ? 'Memproses...' : `Generate Nomor ${selectedType}`}
                </button>
              </div>

              {generatedResult && (
                <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs flex items-center justify-between">
                  <span className="text-emerald-800 dark:text-emerald-300 font-medium">Nomor Berhasil Digenerate:</span>
                  <span className="font-mono font-bold text-sm text-emerald-900 dark:text-emerald-200 bg-white dark:bg-navy-900 px-3 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700">
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

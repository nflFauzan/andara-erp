import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  DownloadCloud,
  Building2,
  Calculator
} from 'lucide-react';
import { penawaranApi } from '../api/penawaranApi';
import { customerApi } from '../api/customerApi';
import { kegiatanApi } from '../api/kegiatanApi';
import { Customer } from '../types/customer';
import { Kegiatan } from '../types/kegiatan';
import { CreatePenawaranDetailInput } from '../types/penawaran';

interface ItemRow extends CreatePenawaranDetailInput {
  tempId: string;
}

export const PenawaranFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState(
    '1. Pembayaran DP 30% setelah penawaran disetujui\n2. Termin 2 sebesar 50% setelah progress fisik mencapai 70%\n3. Pelunasan 20% saat serah terima pekerjaan\n4. Masa retensi garansi 30 hari kalender'
  );

  const [items, setItems] = useState<ItemRow[]>([
    {
      tempId: 'row-1',
      description: '',
      volume: 1,
      unit: 'unit',
      unitPrice: 0,
      sortOrder: 1,
    },
  ]);

  // Customer's Kegiatan for importing
  const [customerKegiatan, setCustomerKegiatan] = useState<Kegiatan[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedKegiatanId, setSelectedKegiatanId] = useState<number | ''>('');

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load Customers
  useEffect(() => {
    customerApi.getActiveCustomers().then(setCustomers).catch(console.error);
  }, []);

  // If edit mode, load existing penawaran
  useEffect(() => {
    if (isEdit && id) {
      setInitialLoading(true);
      penawaranApi
        .getPenawaranById(Number(id))
        .then((data) => {
          setSelectedCustomerId(data.customerId);
          setDate(data.date);
          setNotes(data.notes || '');
          setTerms(data.terms || '');
          if (data.details && data.details.length > 0) {
            setItems(
              data.details.map((d, idx) => ({
                tempId: `row-${idx + 1}`,
                kegiatanId: d.kegiatanId,
                kegiatanItemId: d.kegiatanItemId,
                description: d.description,
                volume: d.volume,
                unit: d.unit,
                unitPrice: d.unitPrice,
                sortOrder: d.sortOrder || idx + 1,
                notes: d.notes,
              }))
            );
          }
        })
        .catch((err) => {
          setErrorMsg(err.response?.data?.message || 'Gagal memuat rincian penawaran.');
        })
        .finally(() => {
          setInitialLoading(false);
        });
    }
  }, [isEdit, id]);

  // When customer changes, fetch their kegiatan
  useEffect(() => {
    if (selectedCustomerId) {
      kegiatanApi
        .getKegiatanByCustomer(Number(selectedCustomerId))
        .then((kegiatanList) => {
          setCustomerKegiatan(kegiatanList);
          if (kegiatanList.length > 0) {
            setSelectedKegiatanId(kegiatanList[0].id);
          } else {
            setSelectedKegiatanId('');
          }
        })
        .catch(console.error);
    } else {
      setCustomerKegiatan([]);
      setSelectedKegiatanId('');
    }
  }, [selectedCustomerId]);

  const handleAddItemRow = () => {
    const nextOrder = items.length + 1;
    setItems((prev) => [
      ...prev,
      {
        tempId: `row-${Date.now()}-${nextOrder}`,
        description: '',
        volume: 1,
        unit: 'unit',
        unitPrice: 0,
        sortOrder: nextOrder,
      },
    ]);
  };

  const handleRemoveItemRow = (tempId: string) => {
    if (items.length <= 1) {
      setErrorMsg('Penawaran harus memiliki minimal 1 item.');
      return;
    }
    setItems((prev) => prev.filter((item) => item.tempId !== tempId));
  };

  const handleItemChange = (tempId: string, field: keyof CreatePenawaranDetailInput, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.tempId === tempId) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleImportFromKegiatan = () => {
    if (!selectedKegiatanId) return;
    const kegiatan = customerKegiatan.find((k) => k.id === Number(selectedKegiatanId));
    if (!kegiatan || !kegiatan.items || kegiatan.items.length === 0) {
      alert('Kegiatan ini belum memiliki item terdaftar.');
      return;
    }

    const importedRows: ItemRow[] = kegiatan.items.map((item, idx) => ({
      tempId: `imported-${item.id}-${Date.now()}-${idx}`,
      kegiatanId: kegiatan.id,
      kegiatanItemId: item.id,
      description: item.description,
      volume: item.volume,
      unit: item.unit,
      unitPrice: item.unitPrice,
      sortOrder: items.length + idx + 1,
      notes: `Diimpor dari Kegiatan: ${kegiatan.name}`,
    }));

    // If first row is empty, replace it
    if (items.length === 1 && !items[0].description.trim() && items[0].unitPrice === 0) {
      setItems(importedRows);
    } else {
      setItems((prev) => [...prev, ...importedRows]);
    }

    setShowImportModal(false);
  };

  // Subtotal Calculation
  const totalAmount = items.reduce((sum, item) => {
    const vol = Number(item.volume) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + vol * price;
  }, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setErrorMsg('Customer wajib dipilih.');
      return;
    }

    // Validate items
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.description.trim()) {
        setErrorMsg(`Deskripsi item baris ke-${i + 1} tidak boleh kosong.`);
        return;
      }
      if (Number(it.volume) <= 0) {
        setErrorMsg(`Volume item baris ke-${i + 1} harus lebih dari 0.`);
        return;
      }
      if (Number(it.unitPrice) < 0) {
        setErrorMsg(`Harga satuan item baris ke-${i + 1} tidak boleh negatif.`);
        return;
      }
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const payloadItems = items.map((it, idx) => ({
        kegiatanId: it.kegiatanId,
        kegiatanItemId: it.kegiatanItemId,
        description: it.description.trim(),
        volume: Number(it.volume),
        unit: it.unit.trim(),
        unitPrice: Number(it.unitPrice),
        sortOrder: idx + 1,
        notes: it.notes,
      }));

      if (isEdit && id) {
        await penawaranApi.updatePenawaran(Number(id), {
          customerId: Number(selectedCustomerId),
          date,
          notes,
          terms,
          items: payloadItems,
        });
        navigate(`/penawaran/${id}`);
      } else {
        const created = await penawaranApi.createPenawaran({
          customerId: Number(selectedCustomerId),
          date,
          notes,
          terms,
          items: payloadItems,
        });
        navigate(`/penawaran/${created.id}`);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan penawaran.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-sm font-medium text-slate-600">Memuat data penawaran...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/penawaran')}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-brand-600" />
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                {isEdit ? 'Edit Penawaran Harga' : 'Buat Surat Penawaran Harga Baru'}
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Formulir pembuatan penawaran terintegrasi nomor otomatis dan perhitungan subtotal otoritatif.
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Header Info Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-600" />
            Informasi Dokumen & Customer
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Customer Dropdown */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Pilih Customer <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value ? Number(e.target.value) : '')}
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="">-- Pilih Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name} {c.companyName ? `(${c.companyName})` : ''}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                Hanya customer berstatus aktif yang dapat dipilih.
              </p>
            </div>

            {/* Date Picker */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Tanggal Penawaran <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Numbering Preview Note */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Nomor Penawaran
              </label>
              <div className="px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-medium text-slate-600">
                {isEdit ? 'Nomor Tetap (Terkunci)' : '[Otomatis dari Numbering Engine]'}
              </div>
              <p className="text-[11px] text-slate-400">
                Format nomor dijamin berurutan secara atomik di PostgreSQL.
              </p>
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-brand-600" />
                Rincian Item Pekerjaan & Biaya
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Subtotal setiap baris dihitung otomatis dan divalidasi otoritatif di server.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {customerKegiatan.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowImportModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 transition"
                >
                  <DownloadCloud className="w-3.5 h-3.5" />
                  Impor dari Kegiatan Customer
                </button>
              )}

              <button
                type="button"
                onClick={handleAddItemRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Baris
              </button>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-12 text-center">#</th>
                  <th className="py-2.5 px-3 min-w-[280px]">Deskripsi Pekerjaan / Barang</th>
                  <th className="py-2.5 px-3 w-28 text-right">Volume</th>
                  <th className="py-2.5 px-3 w-24">Satuan</th>
                  <th className="py-2.5 px-3 w-40 text-right">Harga Satuan (Rp)</th>
                  <th className="py-2.5 px-3 w-44 text-right">Subtotal</th>
                  <th className="py-2.5 px-3 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((row, index) => {
                  const subtotal = (Number(row.volume) || 0) * (Number(row.unitPrice) || 0);

                  return (
                    <tr key={row.tempId} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-center text-xs font-mono text-slate-400">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          required
                          placeholder="Nama pekerjaan atau spesifikasi barang..."
                          value={row.description}
                          onChange={(e) => handleItemChange(row.tempId, 'description', e.target.value)}
                          className="w-full text-sm px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                        {row.notes && (
                          <span className="text-[11px] text-slate-400 italic block mt-0.5">
                            {row.notes}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          required
                          value={row.volume}
                          onChange={(e) =>
                            handleItemChange(row.tempId, 'volume', parseFloat(e.target.value) || 0)
                          }
                          className="w-full text-right font-mono text-sm px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          required
                          placeholder="m2, unit"
                          value={row.unit}
                          onChange={(e) => handleItemChange(row.tempId, 'unit', e.target.value)}
                          className="w-full text-sm px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          required
                          value={row.unitPrice}
                          onChange={(e) =>
                            handleItemChange(row.tempId, 'unitPrice', parseFloat(e.target.value) || 0)
                          }
                          className="w-full text-right font-mono text-sm px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800">
                        {formatCurrency(subtotal)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          disabled={items.length <= 1}
                          onClick={() => handleRemoveItemRow(row.tempId)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Subtotal Summary Bar */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
            <span className="text-xs text-slate-500 font-medium">
              Total {items.length} item pekerjaan dicantumkan
            </span>
            <div className="flex items-center gap-4 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-sm">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-300">
                Total Penawaran:
              </span>
              <span className="font-mono text-xl font-bold text-brand-300">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Terms and Notes Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Syarat & Ketentuan Pembayaran (Terms)
            </label>
            <textarea
              rows={4}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Contoh: DP 30%, Termin 50%, Pelunasan 20%..."
              className="w-full text-xs font-mono p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
            />
            <p className="text-[11px] text-slate-400">
              Syarat ini akan tercetak pada surat penawaran resmi yang dikirim ke pelanggan.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Catatan Internal / Lingkup Pekerjaan
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan mengenai spesifikasi bahan, lokasi pengiriman, dsb..."
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate('/penawaran')}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 shadow-md transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Penawaran'}
          </button>
        </div>
      </form>

      {/* Modal Import dari Kegiatan Customer */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <DownloadCloud className="w-5 h-5 text-brand-600" />
                Impor Item dari Kegiatan Customer
              </h3>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Pilih kegiatan terdaftar milik customer ini untuk menyalin seluruh rincian item pekerjaan ke dalam dokumen penawaran:
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Pilih Kegiatan
              </label>
              <select
                value={selectedKegiatanId}
                onChange={(e) => setSelectedKegiatanId(e.target.value ? Number(e.target.value) : '')}
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {customerKegiatan.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.code} - {k.name} ({k.items?.length || 0} item, {formatCurrency(k.totalAmount)})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleImportFromKegiatan}
                className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition shadow-sm"
              >
                Impor Rincian Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PenawaranFormPage;

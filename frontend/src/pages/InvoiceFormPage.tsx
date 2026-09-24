import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Receipt,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  DownloadCloud,
  Building2,
  Calculator,
  FileCheck2,
  AlertTriangle
} from 'lucide-react';
import { invoiceApi } from '../api/invoiceApi';
import { customerApi } from '../api/customerApi';
import { penawaranApi } from '../api/penawaranApi';
import { Customer } from '../types/customer';
import { Penawaran } from '../types/penawaran';
import { CreateInvoiceDetailInput, PenawaranBillableItem } from '../types/invoice';

interface ItemRow extends CreateInvoiceDetailInput {
  tempId: string;
  maxBillableQuantity?: number;
}

export const InvoiceFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);

  const initialPenawaranId = searchParams.get('penawaranId');

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('');
  const [sourcePenawaranId, setSourcePenawaranId] = useState<number | null>(null);
  const [sourcePenawaranNumber, setSourcePenawaranNumber] = useState<string | null>(null);

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 14);
  const [dueDate, setDueDate] = useState<string>(defaultDueDate.toISOString().split('T')[0]);

  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState(
    '1. Pembayaran ditransfer ke rekening resmi CV. ANDARA:\n   Bank Mandiri: 142-00-1234567-8 a.n. CV. ANDARA\n2. Jatuh tempo pembayaran 14 hari kalender sejak faktur diterbitkan\n3. Bukti transfer mohon dikirimkan kepada bagian keuangan atau diunggah ke sistem'
  );

  const [items, setItems] = useState<ItemRow[]>([
    {
      tempId: 'row-1',
      description: '',
      quantity: 1,
      unit: 'unit',
      unitPrice: 0,
      sortOrder: 1,
    },
  ]);

  // Approved Penawaran for customer
  const [approvedPenawaranList, setApprovedPenawaranList] = useState<Penawaran[]>([]);
  const [showPenawaranModal, setShowPenawaranModal] = useState(false);
  const [selectedModalPenawaranId, setSelectedModalPenawaranId] = useState<number | ''>('');
  const [billableItems, setBillableItems] = useState<PenawaranBillableItem[]>([]);
  const [selectedBillableRows, setSelectedBillableRows] = useState<Record<number, { selected: boolean; quantity: number }>>({});
  const [loadingBillable, setLoadingBillable] = useState(false);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load Customers
  useEffect(() => {
    customerApi.getActiveCustomers().then(setCustomers).catch(console.error);
  }, []);

  // If edit mode, load existing invoice
  useEffect(() => {
    if (isEdit && id) {
      setInitialLoading(true);
      invoiceApi
        .getInvoiceById(Number(id))
        .then((data) => {
          setSelectedCustomerId(data.customerId);
          setSourcePenawaranId(data.sourcePenawaranId || null);
          setSourcePenawaranNumber(data.sourcePenawaranNumber || null);
          setDate(data.date);
          setDueDate(data.dueDate || '');
          setNotes(data.notes || '');
          setTerms(data.terms || '');
          if (data.details && data.details.length > 0) {
            setItems(
              data.details.map((d, idx) => ({
                tempId: `row-${idx + 1}`,
                sourcePenawaranDetailId: d.sourcePenawaranDetailId,
                sourceKegiatanId: d.sourceKegiatanId,
                sourceKegiatanItemId: d.sourceKegiatanItemId,
                description: d.description,
                quantity: d.quantity,
                unit: d.unit,
                unitPrice: d.unitPrice,
                sortOrder: d.sortOrder || idx + 1,
                notes: d.notes,
              }))
            );
          }
        })
        .catch((err) => {
          setErrorMsg(err.response?.data?.message || 'Gagal memuat data faktur.');
        })
        .finally(() => {
          setInitialLoading(false);
        });
    }
  }, [isEdit, id]);

  // If initialPenawaranId query param exists, load that penawaran and its billable items
  useEffect(() => {
    if (!isEdit && initialPenawaranId) {
      const pId = Number(initialPenawaranId);
      penawaranApi.getPenawaranById(pId).then((p) => {
        setSelectedCustomerId(p.customerId);
        setSourcePenawaranId(p.id);
        setSourcePenawaranNumber(p.number);
        // Load billable items
        invoiceApi.getBillableItemsFromPenawaran(pId).then((bItems) => {
          const validItems = bItems.filter((bi) => bi.remainingBillableVolume > 0);
          if (validItems.length > 0) {
            setItems(
              validItems.map((bi, idx) => ({
                tempId: `penawaran-item-${bi.penawaranDetailId}-${idx}`,
                sourcePenawaranDetailId: bi.penawaranDetailId,
                sourceKegiatanId: bi.kegiatanId,
                sourceKegiatanItemId: bi.kegiatanItemId,
                description: bi.description,
                quantity: bi.remainingBillableVolume,
                unit: bi.unit,
                unitPrice: bi.unitPrice,
                sortOrder: idx + 1,
                notes: bi.notes,
                maxBillableQuantity: bi.remainingBillableVolume,
              }))
            );
          }
        });
      }).catch(console.error);
    }
  }, [isEdit, initialPenawaranId]);

  // When customer changes, fetch their approved penawaran list
  useEffect(() => {
    if (selectedCustomerId) {
      penawaranApi
        .getPenawaranList({ customerId: Number(selectedCustomerId), status: 'APPROVED', size: 100 })
        .then((res) => {
          setApprovedPenawaranList(res.content || []);
          if (res.content && res.content.length > 0 && !selectedModalPenawaranId) {
            setSelectedModalPenawaranId(res.content[0].id);
          }
        })
        .catch(console.error);
    } else {
      setApprovedPenawaranList([]);
      setSelectedModalPenawaranId('');
    }
  }, [selectedCustomerId]);

  // When selectedModalPenawaranId changes, fetch billable items
  useEffect(() => {
    if (selectedModalPenawaranId) {
      setLoadingBillable(true);
      invoiceApi
        .getBillableItemsFromPenawaran(Number(selectedModalPenawaranId))
        .then((bItems) => {
          setBillableItems(bItems);
          const initialSelection: Record<number, { selected: boolean; quantity: number }> = {};
          bItems.forEach((it) => {
            const hasRemaining = it.remainingBillableVolume > 0;
            initialSelection[it.penawaranDetailId] = {
              selected: hasRemaining,
              quantity: it.remainingBillableVolume,
            };
          });
          setSelectedBillableRows(initialSelection);
        })
        .catch(console.error)
        .finally(() => {
          setLoadingBillable(false);
        });
    } else {
      setBillableItems([]);
      setSelectedBillableRows({});
    }
  }, [selectedModalPenawaranId]);

  const handleAddItemRow = () => {
    const nextOrder = items.length + 1;
    setItems((prev) => [
      ...prev,
      {
        tempId: `row-${Date.now()}-${nextOrder}`,
        description: '',
        quantity: 1,
        unit: 'unit',
        unitPrice: 0,
        sortOrder: nextOrder,
      },
    ]);
  };

  const handleRemoveItemRow = (tempId: string) => {
    if (items.length <= 1) {
      setErrorMsg('Faktur harus memiliki minimal 1 item.');
      return;
    }
    setItems((prev) => prev.filter((item) => item.tempId !== tempId));
  };

  const handleItemChange = (tempId: string, field: keyof CreateInvoiceDetailInput, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.tempId === tempId) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleImportSelectedFromPenawaran = () => {
    const chosenPenawaran = approvedPenawaranList.find((p) => p.id === Number(selectedModalPenawaranId));
    if (!chosenPenawaran) return;

    const imported: ItemRow[] = [];
    billableItems.forEach((bi) => {
      const sel = selectedBillableRows[bi.penawaranDetailId];
      if (sel && sel.selected && sel.quantity > 0) {
        imported.push({
          tempId: `imported-penawaran-${bi.penawaranDetailId}-${Date.now()}`,
          sourcePenawaranDetailId: bi.penawaranDetailId,
          sourceKegiatanId: bi.kegiatanId,
          sourceKegiatanItemId: bi.kegiatanItemId,
          description: bi.description,
          quantity: sel.quantity,
          unit: bi.unit,
          unitPrice: bi.unitPrice,
          sortOrder: items.length + imported.length + 1,
          notes: bi.notes,
          maxBillableQuantity: bi.remainingBillableVolume,
        });
      }
    });

    if (imported.length === 0) {
      alert('Pilih minimal satu item yang masih memiliki sisa volume untuk ditagihkan.');
      return;
    }

    setSourcePenawaranId(chosenPenawaran.id);
    setSourcePenawaranNumber(chosenPenawaran.number);

    // Replace if first row is untouched
    if (items.length === 1 && !items[0].description.trim() && items[0].unitPrice === 0) {
      setItems(imported);
    } else {
      setItems((prev) => [...prev, ...imported]);
    }

    setShowPenawaranModal(false);
  };

  // Subtotal Calculation
  const totalAmount = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + qty * price;
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
      if (Number(it.quantity) <= 0) {
        setErrorMsg(`Jumlah item baris ke-${i + 1} harus lebih dari 0.`);
        return;
      }
      if (Number(it.unitPrice) < 0) {
        setErrorMsg(`Harga satuan item baris ke-${i + 1} tidak boleh negatif.`);
        return;
      }
      // Anti-double-billing client check
      if (it.maxBillableQuantity !== undefined && Number(it.quantity) > it.maxBillableQuantity) {
        setErrorMsg(
          `Item baris ke-${i + 1} ("${it.description}") melebihi sisa volume yang tersedia (${it.maxBillableQuantity} ${it.unit}).`
        );
        return;
      }
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const payloadItems = items.map((it, idx) => ({
        sourcePenawaranDetailId: it.sourcePenawaranDetailId,
        sourceKegiatanId: it.sourceKegiatanId,
        sourceKegiatanItemId: it.sourceKegiatanItemId,
        description: it.description.trim(),
        quantity: Number(it.quantity),
        unit: it.unit.trim(),
        unitPrice: Number(it.unitPrice),
        sortOrder: idx + 1,
        notes: it.notes,
      }));

      if (isEdit && id) {
        await invoiceApi.updateInvoice(Number(id), {
          customerId: Number(selectedCustomerId),
          date,
          dueDate: dueDate || undefined,
          notes,
          terms,
          details: payloadItems,
        });
        navigate(`/faktur/${id}`);
      } else {
        const created = await invoiceApi.createInvoice({
          customerId: Number(selectedCustomerId),
          sourcePenawaranId: sourcePenawaranId || undefined,
          date,
          dueDate: dueDate || undefined,
          notes,
          terms,
          details: payloadItems,
        });
        navigate(`/faktur/${created.id}`);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan faktur penjualan.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-sm font-medium text-slate-600">Memuat formulir faktur...</span>
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
            onClick={() => navigate('/faktur')}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-6 h-6 text-brand-600" />
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                {isEdit ? 'Edit Faktur Penjualan' : 'Buat Faktur Penjualan Baru'}
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Penomoran otomatis atomik, integrasi penawaran disetujui, dan proteksi anti-double-billing.
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Customer Dropdown */}
            <div className="space-y-1 md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Pilih Customer <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={selectedCustomerId}
                onChange={(e) => {
                  setSelectedCustomerId(e.target.value ? Number(e.target.value) : '');
                  setSourcePenawaranId(null);
                  setSourcePenawaranNumber(null);
                }}
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
                Tanggal Faktur <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Due Date Picker */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Jatuh Tempo (Due Date)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Source Penawaran Indicator */}
          {sourcePenawaranNumber && (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-blue-800">
                <FileCheck2 className="w-4 h-4 text-blue-600" />
                <span>Terhubung ke Penawaran Harga:</span>
                <span className="font-mono font-bold">{sourcePenawaranNumber}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSourcePenawaranId(null);
                  setSourcePenawaranNumber(null);
                }}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Lepaskan Tautan Penawaran
              </button>
            </div>
          )}
        </div>

        {/* Items Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-brand-600" />
                Rincian Item Penagihan
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Nilai subtotal per baris dan total faktur dihitung secara otoritatif di server.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {selectedCustomerId && approvedPenawaranList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPenawaranModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 transition"
                >
                  <DownloadCloud className="w-3.5 h-3.5" />
                  Tarik dari Penawaran Disetujui
                </button>
              )}

              <button
                type="button"
                onClick={handleAddItemRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Baris Manual
              </button>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-12 text-center">#</th>
                  <th className="py-2.5 px-3 min-w-[280px]">Deskripsi Item Penagihan</th>
                  <th className="py-2.5 px-3 w-28 text-right">Kuantitas</th>
                  <th className="py-2.5 px-3 w-24">Satuan</th>
                  <th className="py-2.5 px-3 w-40 text-right">Harga Satuan (Rp)</th>
                  <th className="py-2.5 px-3 w-44 text-right">Subtotal</th>
                  <th className="py-2.5 px-3 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((row, index) => {
                  const subtotal = (Number(row.quantity) || 0) * (Number(row.unitPrice) || 0);
                  const isExceeding =
                    row.maxBillableQuantity !== undefined &&
                    Number(row.quantity) > row.maxBillableQuantity;

                  return (
                    <tr key={row.tempId} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-center text-xs font-mono text-slate-400">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          required
                          placeholder="Deskripsi penagihan jasa / barang..."
                          value={row.description}
                          onChange={(e) => handleItemChange(row.tempId, 'description', e.target.value)}
                          className="w-full text-sm px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                        {row.maxBillableQuantity !== undefined && (
                          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
                            <span className="text-brand-600 font-semibold">Tersisa di Penawaran:</span>
                            <span>{row.maxBillableQuantity} {row.unit}</span>
                            {isExceeding && (
                              <span className="text-rose-600 font-bold flex items-center gap-0.5 ml-2">
                                <AlertTriangle className="w-3 h-3" /> Melebihi kuota penawaran!
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          required
                          value={row.quantity}
                          onChange={(e) =>
                            handleItemChange(row.tempId, 'quantity', parseFloat(e.target.value) || 0)
                          }
                          className={`w-full text-right font-mono text-sm px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-1 ${
                            isExceeding
                              ? 'border-rose-500 bg-rose-50 focus:ring-rose-500 text-rose-800'
                              : 'border-slate-300 focus:ring-brand-500'
                          }`}
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
              Total {items.length} item penagihan
            </span>
            <div className="flex items-center gap-4 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-sm">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-300">
                Total Nilai Faktur:
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
              Syarat & Rekening Pembayaran (Terms)
            </label>
            <textarea
              rows={4}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Instruksi rekening bank dan masa jatuh tempo..."
              className="w-full text-xs font-mono p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
            />
            <p className="text-[11px] text-slate-400">
              Syarat ini tercetak pada lembar faktur penjualan resmi untuk pembayaran oleh customer.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Catatan Faktur (Notes)
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Keterangan termin, nomor SPK/Kontrak acuan, atau rincian tambahan..."
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate('/faktur')}
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
            {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan Faktur' : 'Terbitkan / Simpan Faktur'}
          </button>
        </div>
      </form>

      {/* Modal Tarik dari Penawaran Disetujui */}
      {showPenawaranModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <DownloadCloud className="w-5 h-5 text-brand-600" />
                Tarik Item dari Penawaran Disetujui (Approved)
              </h3>
              <button
                type="button"
                onClick={() => setShowPenawaranModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 shrink-0">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Pilih Dokumen Penawaran
              </label>
              <select
                value={selectedModalPenawaranId}
                onChange={(e) => setSelectedModalPenawaranId(e.target.value ? Number(e.target.value) : '')}
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {approvedPenawaranList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.number} - {p.date} ({p.itemCount} item, {formatCurrency(p.totalAmount)})
                  </option>
                ))}
              </select>
            </div>

            {/* Billable Items List */}
            <div className="overflow-y-auto flex-1 border border-slate-200 rounded-xl">
              {loadingBillable ? (
                <div className="p-8 text-center text-xs text-slate-500">Memeriksa sisa kuota penagihan...</div>
              ) : billableItems.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Tidak ada rincian item dalam penawaran ini.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
                    <tr>
                      <th className="p-2.5 w-10 text-center">Pilih</th>
                      <th className="p-2.5">Deskripsi Item</th>
                      <th className="p-2.5 text-right w-20">Total</th>
                      <th className="p-2.5 text-right w-20">Tertagih</th>
                      <th className="p-2.5 text-right w-20">Sisa Kuota</th>
                      <th className="p-2.5 text-right w-28">Tagihkan Sekarang</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {billableItems.map((bi) => {
                      const sel = selectedBillableRows[bi.penawaranDetailId] || { selected: false, quantity: 0 };
                      const isExhausted = bi.remainingBillableVolume <= 0;

                      return (
                        <tr key={bi.penawaranDetailId} className={isExhausted ? 'bg-slate-50 opacity-60' : 'hover:bg-slate-50/70'}>
                          <td className="p-2.5 text-center">
                            <input
                              type="checkbox"
                              disabled={isExhausted}
                              checked={sel.selected}
                              onChange={(e) =>
                                setSelectedBillableRows((prev) => ({
                                  ...prev,
                                  [bi.penawaranDetailId]: {
                                    ...sel,
                                    selected: e.target.checked,
                                  },
                                }))
                              }
                              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                            />
                          </td>
                          <td className="p-2.5">
                            <div className="font-medium text-slate-800">{bi.description}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Harga: {formatCurrency(bi.unitPrice)} / {bi.unit}
                            </div>
                          </td>
                          <td className="p-2.5 text-right font-mono text-slate-600">
                            {bi.originalVolume} {bi.unit}
                          </td>
                          <td className="p-2.5 text-right font-mono text-slate-600">
                            {bi.alreadyBilledVolume} {bi.unit}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold">
                            <span className={isExhausted ? 'text-slate-400' : 'text-emerald-700'}>
                              {bi.remainingBillableVolume} {bi.unit}
                            </span>
                          </td>
                          <td className="p-2.5 text-right">
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              max={bi.remainingBillableVolume}
                              disabled={isExhausted || !sel.selected}
                              value={sel.quantity}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setSelectedBillableRows((prev) => ({
                                  ...prev,
                                  [bi.penawaranDetailId]: {
                                    ...sel,
                                    quantity: val,
                                  },
                                }));
                              }}
                              className="w-24 text-right font-mono text-xs px-2 py-1 rounded border border-slate-300 disabled:bg-slate-100"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setShowPenawaranModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleImportSelectedFromPenawaran}
                className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition shadow-sm"
              >
                Tambahkan Item Terpilih
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceFormPage;

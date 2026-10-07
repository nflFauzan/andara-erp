import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Receipt,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  DownloadCloud,
  Building2,
  Calculator,
  FileCheck2,
  AlertTriangle,
  Layers,
  MapPin,
  FileSpreadsheet,
  FileSignature,
  Percent,
  CheckCircle2
} from 'lucide-react';
import { invoiceApi } from '../api/invoiceApi';
import { customerApi } from '../api/customerApi';
import { penawaranApi } from '../api/penawaranApi';
import { useAuth } from '../context/AuthContext';
import { Customer } from '../types/customer';
import { Penawaran } from '../types/penawaran';
import { CreateInvoiceDetailInput, PenawaranBillableItem, TaxPpnType, TaxPphType } from '../types/invoice';
import { BentoCard } from '@/components/common/BentoCard';
import { PageHeader } from '@/components/common/PageHeader';

interface ItemRow extends CreateInvoiceDetailInput {
  tempId: string;
  sphKegiatanName?: string;
  maxBillableQuantity?: number;
}

export const InvoiceFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);

  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const initialPenawaranId = searchParams.get('penawaranId');

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('');
  const [sourcePenawaranId, setSourcePenawaranId] = useState<number | null>(null);
  const [sourcePenawaranNumber, setSourcePenawaranNumber] = useState<string | null>(null);
  const [workLocation, setWorkLocation] = useState('');

  // Fase 1: Client Reference Numbers
  const [clientPoNumber, setClientPoNumber] = useState('');
  const [clientSpkNumber, setClientSpkNumber] = useState('');
  const [bastNumber, setBastNumber] = useState('');

  // Fase 1: Tax Types
  const [taxPpnType, setTaxPpnType] = useState<TaxPpnType>('NONE');
  const [taxPphType, setTaxPphType] = useState<TaxPphType>('NONE');

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
          setWorkLocation(data.workLocation || '');
          setClientPoNumber(data.clientPoNumber || '');
          setClientSpkNumber(data.clientSpkNumber || '');
          setBastNumber(data.bastNumber || '');
          setTaxPpnType(data.taxPpnType || 'NONE');
          setTaxPphType(data.taxPphType || 'NONE');
          setDate(data.date);
          setDueDate(data.dueDate || '');
          setNotes(data.notes || '');
          setTerms(data.terms || '');
          if (data.details && data.details.length > 0) {
            setItems(
              data.details.map((d, idx) => ({
                tempId: `row-${idx + 1}`,
                sourcePenawaranDetailId: d.sourcePenawaranDetailId,
                sphKegiatanId: d.sphKegiatanId,
                sphKegiatanName: d.sphKegiatanName,
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

  // If initialPenawaranId query param exists, load penawaran meta and open the selection modal
  // (do NOT auto-import all items — user must explicitly choose which kegiatan/items to bill)
  useEffect(() => {
    if (!isEdit && initialPenawaranId) {
      const pId = Number(initialPenawaranId);
      penawaranApi.getPenawaranById(pId).then((p) => {
        setSelectedCustomerId(p.customerId);
        setSourcePenawaranId(p.id);
        setSourcePenawaranNumber(p.number);
        setSelectedModalPenawaranId(p.id);
        // Buka modal agar user bisa pilih kegiatan/item mana yang mau ditagih
        setShowPenawaranModal(true);
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
          tempId: `imported-penawaran-${bi.penawaranDetailId}-${Date.now()}-${imported.length}`,
          sourcePenawaranDetailId: bi.penawaranDetailId,
          sphKegiatanId: bi.sphKegiatanId,
          sphKegiatanName: bi.sphKegiatanName,
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

  // Group billableItems by SPH Kegiatan ID (NOT name string, to prevent merging groups with same name)
  const groupedBillable = useMemo(() => {
    // Use a Map keyed by a stable unique group key: sphKegiatanId or kegiatanId or 'manual'
    const map = new Map<string, { groupKey: string; groupName: string; items: PenawaranBillableItem[] }>();
    billableItems.forEach((bi) => {
      // Determine a stable group key using the ID, not the name
      const groupKey = bi.sphKegiatanId != null
        ? `sph:${bi.sphKegiatanId}`
        : bi.kegiatanId != null
        ? `kegiatan:${bi.kegiatanId}`
        : 'manual';
      const groupName = bi.sphKegiatanName || bi.kegiatanName || 'Pekerjaan Utama';
      if (!map.has(groupKey)) {
        map.set(groupKey, { groupKey, groupName, items: [] });
      }
      map.get(groupKey)!.items.push(bi);
    });
    return Array.from(map.values());
  }, [billableItems]);

  const handleToggleKegiatanGroup = (groupItems: PenawaranBillableItem[], select: boolean) => {
    setSelectedBillableRows((prev) => {
      const next = { ...prev };
      groupItems.forEach((it) => {
        if (it.remainingBillableVolume > 0) {
          next[it.penawaranDetailId] = {
            selected: select,
            quantity: next[it.penawaranDetailId]?.quantity || it.remainingBillableVolume,
          };
        }
      });
      return next;
    });
  };

  const handleSelectAllBillable = (select: boolean) => {
    setSelectedBillableRows((prev) => {
      const next = { ...prev };
      billableItems.forEach((it) => {
        if (it.remainingBillableVolume > 0) {
          next[it.penawaranDetailId] = {
            selected: select,
            quantity: next[it.penawaranDetailId]?.quantity || it.remainingBillableVolume,
          };
        }
      });
      return next;
    });
  };

  // Subtotal & Tax Calculations
  const rawItemsTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      return sum + qty * price;
    }, 0);
  }, [items]);

  const taxCalculation = useMemo(() => {
    let subtotalDpp = rawItemsTotal;
    let ppnRate = 0;
    let ppnAmount = 0;
    let totalAmount = rawItemsTotal;

    if (taxPpnType === 'EXCLUDE_11') {
      ppnRate = 11;
      subtotalDpp = rawItemsTotal;
      ppnAmount = Math.round(subtotalDpp * 0.11);
      totalAmount = subtotalDpp + ppnAmount;
    } else if (taxPpnType === 'EXCLUDE_12') {
      ppnRate = 12;
      subtotalDpp = rawItemsTotal;
      ppnAmount = Math.round(subtotalDpp * 0.12);
      totalAmount = subtotalDpp + ppnAmount;
    } else if (taxPpnType === 'INCLUDE') {
      ppnRate = 11;
      subtotalDpp = Math.round(rawItemsTotal / 1.11);
      ppnAmount = rawItemsTotal - subtotalDpp;
      totalAmount = rawItemsTotal;
    }

    let pphRate = 0;
    let pphAmount = 0;
    if (taxPphType === 'PPH23_2') {
      pphRate = 2;
      pphAmount = Math.round(subtotalDpp * 0.02);
    } else if (taxPphType === 'PPH_FINAL_KONSTRUKSI_1_75') {
      pphRate = 1.75;
      pphAmount = Math.round(subtotalDpp * 0.0175);
    } else if (taxPphType === 'PPH_FINAL_KONSTRUKSI_2_65') {
      pphRate = 2.65;
      pphAmount = Math.round(subtotalDpp * 0.0265);
    }

    const netTotalAmount = Math.max(0, totalAmount - pphAmount);

    return {
      subtotalDpp,
      ppnRate,
      ppnAmount,
      totalAmount,
      pphRate,
      pphAmount,
      netTotalAmount,
    };
  }, [rawItemsTotal, taxPpnType, taxPphType]);

  const totalAmount = taxCalculation.totalAmount;

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

    if (isAdmin && !sourcePenawaranId) {
      setErrorMsg('Role Admin diwajibkan menerbitkan Faktur Penjualan berdasarkan Surat Penawaran Harga (SPH) resmi.');
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
        sphKegiatanId: it.sphKegiatanId,
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
          workLocation: workLocation.trim() || undefined,
          clientPoNumber: clientPoNumber.trim() || undefined,
          clientSpkNumber: clientSpkNumber.trim() || undefined,
          bastNumber: bastNumber.trim() || undefined,
          taxPpnType,
          taxPphType,
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
          workLocation: workLocation.trim() || undefined,
          clientPoNumber: clientPoNumber.trim() || undefined,
          clientSpkNumber: clientSpkNumber.trim() || undefined,
          bastNumber: bastNumber.trim() || undefined,
          taxPpnType,
          taxPphType,
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
  }  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <PageHeader
        icon={Receipt}
        backUrl={isEdit && id ? `/faktur/${id}` : '/faktur'}
        title={isEdit ? 'Edit Faktur Penjualan' : 'Buat Faktur Penjualan Baru'}
        subtitle="Form penerbitan faktur tagihan terintegrasi penawaran harga resmi CV. ANDARA."
      />

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 flex items-center gap-3 text-sm shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Header Info Card */}
        <BentoCard className="p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-500" />
              Informasi Dokumen & Customer
            </h2>
            {sourcePenawaranNumber && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-xs text-blue-700 dark:text-blue-300">
                <FileCheck2 className="w-3.5 h-3.5 text-blue-500" />
                <span>SPH: <strong className="font-mono">{sourcePenawaranNumber}</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    setSourcePenawaranId(null);
                    setSourcePenawaranNumber(null);
                  }}
                  className="ml-1 text-[11px] text-blue-500 hover:text-rose-500 underline"
                >
                  Lepas
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Customer Dropdown */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
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
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:bg-white dark:focus:bg-slate-950 transition"
              >
                <option value="">-- Pilih Customer Terdaftar --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name} {c.companyName ? `(${c.companyName})` : ''}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Hanya customer berstatus aktif yang dapat dipilih.
              </p>
            </div>

            {/* Date Picker */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Tanggal Faktur <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:bg-white dark:focus:bg-slate-950 transition"
              />
            </div>

            {/* Due Date Picker */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Jatuh Tempo (Due Date)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:bg-white dark:focus:bg-slate-950 transition"
              />
            </div>

            {/* Work Location */}
            <div className="space-y-1.5 md:col-span-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Lokasi Pekerjaan / Kegiatan (Opsional)</span>
              </label>
              <input
                type="text"
                value={workLocation}
                onChange={(e) => setWorkLocation(e.target.value)}
                placeholder="Contoh: Gedung SMPN 1 Bojonegoro, Aula Utama, Ruang Kelas Baru, dll."
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:bg-white dark:focus:bg-slate-950 transition"
              />
            </div>

            {/* Referensi Dokumen Klien (PO / SPK / BAST) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 md:col-span-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500" />
                  <span>No. PO Klien (Opsional)</span>
                </label>
                <input
                  type="text"
                  value={clientPoNumber}
                  onChange={(e) => setClientPoNumber(e.target.value)}
                  placeholder="Contoh: PO/2026/04/001"
                  className="w-full text-sm font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Nomor Purchase Order resmi dari klien.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileSignature className="w-3.5 h-3.5 text-purple-500" />
                  <span>No. SPK / Kontrak (Opsional)</span>
                </label>
                <input
                  type="text"
                  value={clientSpkNumber}
                  onChange={(e) => setClientSpkNumber(e.target.value)}
                  placeholder="Contoh: 027/SPK/DISPORA/2026"
                  className="w-full text-sm font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Surat Perintah Kerja / Surat Perjanjian.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>No. BAST (Opsional)</span>
                </label>
                <input
                  type="text"
                  value={bastNumber}
                  onChange={(e) => setBastNumber(e.target.value)}
                  placeholder="Contoh: BAST-005/ANDARA/2026"
                  className="w-full text-sm font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Berita Acara Serah Terima pekerjaan.</p>
              </div>
            </div>
          </div>

          {/* Admin Role Constraint Banner */}
          {isAdmin && !sourcePenawaranId && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <span className="font-bold">Otorisasi Admin:</span> Faktur wajib diterbitkan berdasarkan SPH yang disetujui. Gunakan tombol <em>"Tarik dari Penawaran Disetujui"</em> di bawah.
              </div>
            </div>
          )}
        </BentoCard>

        {/* Items Section */}
        <BentoCard className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-brand-500" />
                Rincian Item Penagihan
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Nilai subtotal dan total dihitung secara otoritatif oleh sistem.
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
              {selectedCustomerId && approvedPenawaranList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPenawaranModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 rounded-xl hover:bg-amber-500/25 transition shadow-xs active:scale-95"
                >
                  <DownloadCloud className="w-4 h-4 text-amber-500" />
                  Tarik dari Penawaran Disetujui
                </button>
              )}

              {!isAdmin && (
                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 rounded-xl shadow-xs transition active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Baris Manual
                </button>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  <th className="py-3 px-3 w-12 text-center">#</th>
                  <th className="py-3 px-3 min-w-[280px]">Deskripsi Item Penagihan</th>
                  <th className="py-3 px-3 w-28 text-right">Kuantitas</th>
                  <th className="py-3 px-3 w-24">Satuan</th>
                  <th className="py-3 px-3 w-40 text-right">Harga Satuan (Rp)</th>
                  <th className="py-3 px-3 w-44 text-right">Subtotal</th>
                  <th className="py-3 px-3 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {items.map((row, index) => {
                  const subtotal = (Number(row.quantity) || 0) * (Number(row.unitPrice) || 0);
                  const isExceeding =
                    row.maxBillableQuantity !== undefined &&
                    Number(row.quantity) > row.maxBillableQuantity;

                  return (
                    <tr key={row.tempId} className="hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 text-center text-xs font-mono text-slate-400">
                        {index + 1}
                      </td>
                      <td className="py-3 px-3">
                        {row.sphKegiatanName && (
                          <div className="mb-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                              <Layers className="w-3 h-3 text-indigo-500" />
                              {row.sphKegiatanName}
                            </span>
                          </div>
                        )}
                        <input
                          type="text"
                          required
                          placeholder="Deskripsi penagihan jasa / barang..."
                          value={row.description}
                          onChange={(e) => handleItemChange(row.tempId, 'description', e.target.value)}
                          className="w-full text-sm px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition"
                        />
                        {row.maxBillableQuantity !== undefined && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-mono">
                            <span className="text-brand-600 dark:text-brand-400 font-semibold">Tersisa di SPH:</span>
                            <span>{row.maxBillableQuantity} {row.unit}</span>
                            {isExceeding && (
                              <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-0.5 ml-2">
                                <AlertTriangle className="w-3 h-3" /> Melebihi kuota!
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          required
                          value={row.quantity}
                          onChange={(e) =>
                            handleItemChange(row.tempId, 'quantity', parseFloat(e.target.value) || 0)
                          }
                          className={`w-full text-right font-mono text-sm px-3 py-1.5 rounded-xl border focus:outline-none focus:ring-2 transition ${
                            isExceeding
                              ? 'border-rose-500 bg-rose-500/10 focus:ring-rose-500/30 text-rose-600 dark:text-rose-400'
                              : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 focus:ring-brand-500/30'
                          }`}
                        />
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          required
                          placeholder="m2, unit"
                          value={row.unit}
                          onChange={(e) => handleItemChange(row.tempId, 'unit', e.target.value)}
                          className="w-full text-sm px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition"
                        />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          required
                          value={row.unitPrice}
                          onChange={(e) =>
                            handleItemChange(row.tempId, 'unitPrice', parseFloat(e.target.value) || 0)
                          }
                          className="w-full text-right font-mono text-sm px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition"
                        />
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(subtotal)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          disabled={items.length <= 1}
                          onClick={() => handleRemoveItemRow(row.tempId)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition disabled:opacity-20"
                          title="Hapus baris item"
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
          <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Total <strong>{items.length}</strong> item penagihan
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-500 dark:text-slate-400">DPP / Subtotal:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatCurrency(taxCalculation.subtotalDpp)}</span>
              </div>
              <div className="flex items-center gap-4 bg-neu-surface dark:bg-slate-900 text-slate-900 dark:text-white px-6 py-3 rounded-2xl shadow-neu-convex-sm border border-neu-border dark:border-blue-900/30">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-600 dark:text-slate-300">
                  Total Faktur:
                </span>
                <span className="font-mono text-2xl font-black text-blue-600 dark:text-amber-400">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </BentoCard>

        {/* Pajak & Ringkasan Finansial Faktur (Fase 1: PPN & PPh) */}
        <BentoCard className="p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Percent className="w-4 h-4 text-brand-500" />
              Ketentuan Pajak & Perhitungan Tagihan (PPN / PPh)
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Dihitung otomatis sesuai tarif perpajakan resmi
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Tax Options */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Perlakuan PPN (Pajak Pertambahan Nilai)
                </label>
                <select
                  value={taxPpnType}
                  onChange={(e) => setTaxPpnType(e.target.value as TaxPpnType)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition"
                >
                  <option value="NONE">Non-PPN (0%)</option>
                  <option value="EXCLUDE_11">PPN 11% (Exclude - Ditambahkan ke Subtotal)</option>
                  <option value="EXCLUDE_12">PPN 12% (Exclude - Ditambahkan ke Subtotal)</option>
                  <option value="INCLUDE">PPN 11% (Include - Termasuk dalam Harga)</option>
                </select>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {taxPpnType === 'NONE' && 'Faktur tidak membebankan PPN (nilai murni pekerjaan).'}
                  {taxPpnType === 'EXCLUDE_11' && 'PPN 11% ditambahkan di atas subtotal DPP barang/jasa.'}
                  {taxPpnType === 'EXCLUDE_12' && 'PPN 12% ditambahkan di atas subtotal DPP barang/jasa.'}
                  {taxPpnType === 'INCLUDE' && 'Nilai item sudah mencakup PPN 11% (DPP dihitung mundur).'}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Potongan PPh (Pajak Penghasilan Dipotong Klien)
                </label>
                <select
                  value={taxPphType}
                  onChange={(e) => setTaxPphType(e.target.value as TaxPphType)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition"
                >
                  <option value="NONE">Non-PPh (0%)</option>
                  <option value="PPH23_2">PPh 23 Jasa (2%) - Dipotong oleh Klien</option>
                  <option value="PPH_FINAL_KONSTRUKSI_1_75">PPh Final Jasa Konstruksi (1.75%) - Dipotong oleh Klien</option>
                  <option value="PPH_FINAL_KONSTRUKSI_2_65">PPh Final Pelaksanaan Konstruksi (2.65%) - Dipotong oleh Klien</option>
                </select>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {taxPphType === 'NONE' && 'Tidak ada pemotongan PPh oleh customer/instansi.'}
                  {taxPphType !== 'NONE' && 'Dipotong dari DPP oleh instansi/klien saat pembayaran (bukti potong dilampirkan).'}
                </p>
              </div>
            </div>

            {/* Right: Detailed Summary Calculation Card */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 pb-1.5 border-b border-slate-200 dark:border-slate-800">
                <span>Subtotal Item (DPP):</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {formatCurrency(taxCalculation.subtotalDpp)}
                </span>
              </div>

              {taxCalculation.ppnRate > 0 && (
                <div className="flex justify-between items-center text-blue-600 dark:text-blue-400">
                  <span>
                    PPN {taxCalculation.ppnRate}%
                    {taxPpnType === 'INCLUDE' ? ' (Sudah Termasuk)' : ' (Ditambahkan)'}:
                  </span>
                  <span className="font-mono font-bold text-sm">
                    {taxPpnType === 'INCLUDE' ? '' : '+ '}
                    {formatCurrency(taxCalculation.ppnAmount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-slate-900 dark:text-white font-bold py-1 border-t border-slate-200 dark:border-slate-800">
                <span className="uppercase tracking-wider">Total Nilai Faktur (Gross):</span>
                <span className="font-mono text-base font-black text-brand-600 dark:text-brand-400">
                  {formatCurrency(taxCalculation.totalAmount)}
                </span>
              </div>

              {taxCalculation.pphRate > 0 && (
                <div className="flex justify-between items-center text-rose-600 dark:text-rose-400 pt-1 border-t border-dashed border-slate-200 dark:border-slate-800">
                  <span>Potongan PPh ({taxCalculation.pphRate}%) dari DPP:</span>
                  <span className="font-mono font-bold text-sm">
                    - {formatCurrency(taxCalculation.pphAmount)}
                  </span>
                </div>
              )}

              {taxCalculation.pphRate > 0 && (
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold mt-2">
                  <span className="uppercase tracking-wider">Net Tagihan (Ditransfer Klien):</span>
                  <span className="font-mono text-base font-black">
                    {formatCurrency(taxCalculation.netTotalAmount)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </BentoCard>

        {/* Terms and Notes Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BentoCard className="p-5 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Syarat & Rekening Pembayaran (Terms)
            </label>
            <textarea
              rows={4}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Instruksi rekening bank dan masa jatuh tempo..."
              className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 leading-relaxed"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Tercetak pada lembar faktur penjualan resmi untuk pembayaran oleh customer.
            </p>
          </BentoCard>

          <BentoCard className="p-5 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Catatan Faktur (Notes)
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Keterangan termin, nomor SPK/Kontrak acuan, atau rincian tambahan..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 leading-relaxed"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Catatan internal atau keterangan pekerjaan tambahan.
            </p>
          </BentoCard>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-slate-800">
          <button
            type="button"
            onClick={() => navigate('/faktur')}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl transition shadow-xs"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 active:scale-95 shadow-md shadow-brand-500/25 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan Faktur' : 'Terbitkan / Simpan Faktur'}
          </button>
        </div>
      </form>

      {/* Modal Tarik dari Penawaran Disetujui */}
      {showPenawaranModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bento-card max-w-4xl w-full p-6 shadow-2xl border border-slate-200 dark:border-blue-900/40 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3 shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <DownloadCloud className="w-5 h-5 text-brand-500" />
                  Tarik Kegiatan & Item dari SPH Disetujui
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pilih kegiatan tertentu atau sebagian volume item untuk penagihan parsial / bertahap.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPenawaranModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {/* SPH Select Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 bg-white/50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <div className="flex-1 space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Pilih Dokumen SPH Acuan:
                </label>
                <select
                  value={selectedModalPenawaranId}
                  onChange={(e) => setSelectedModalPenawaranId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                >
                  {approvedPenawaranList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.number} - {p.date} ({p.itemCount} item, {formatCurrency(p.totalAmount)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleSelectAllBillable(true)}
                  className="px-3 py-1.5 text-xs font-bold text-brand-700 dark:text-brand-300 bg-brand-500/10 border border-brand-500/25 rounded-xl hover:bg-brand-500/20 transition shadow-xs"
                >
                  Pilih Semua Item
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectAllBillable(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition shadow-xs"
                >
                  Kosongkan
                </button>
              </div>
            </div>

            {/* Billable Items List Grouped by Kegiatan */}
            <div className="overflow-y-auto flex-1 border border-slate-200/80 dark:border-slate-800 rounded-xl">
              {loadingBillable ? (
                <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                  <span>Memeriksa rincian kegiatan dan kuota penagihan...</span>
                </div>
              ) : billableItems.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500">
                  Tidak ada rincian item atau seluruh item pada penawaran ini telah selesai ditagihkan.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold uppercase tracking-wider sticky top-0 z-10">
                    <tr>
                      <th className="p-2.5 w-12 text-center">Pilih</th>
                      <th className="p-2.5">Uraian Kegiatan / Item Pekerjaan</th>
                      <th className="p-2.5 text-right w-24">Vol. SPH</th>
                      <th className="p-2.5 text-right w-24">Tertagih</th>
                      <th className="p-2.5 text-right w-24">Sisa Kuota</th>
                      <th className="p-2.5 text-right w-36">Tagihkan Sekarang</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {groupedBillable.map((group, gIdx) => {
                      const activeGroupItems = group.items.filter((it) => it.remainingBillableVolume > 0);
                      const isGroupAllSelected =
                        activeGroupItems.length > 0 &&
                        activeGroupItems.every((it) => selectedBillableRows[it.penawaranDetailId]?.selected);
                      const letter = String.fromCharCode(65 + gIdx);

                      return (
                        <React.Fragment key={group.groupKey}>
                          {/* Group Header */}
                          <tr className="bg-slate-100/80 dark:bg-slate-900/80 font-bold border-t border-b border-slate-200 dark:border-slate-800">
                            <td className="p-2 text-center">
                              <input
                                type="checkbox"
                                disabled={activeGroupItems.length === 0}
                                checked={isGroupAllSelected}
                                onChange={(e) => handleToggleKegiatanGroup(group.items, e.target.checked)}
                                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                                title={`Pilih seluruh item kegiatan ${group.groupName}`}
                              />
                            </td>
                            <td colSpan={5} className="p-2 text-slate-900 dark:text-slate-100">
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 uppercase tracking-wide">
                                  <Layers className="w-3.5 h-3.5 text-brand-500" />
                                  Kegiatan {letter}: {group.groupName}
                                </span>
                                <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                                  {group.items.length} item ({activeGroupItems.length} dapat ditagihkan)
                                </span>
                              </div>
                            </td>
                          </tr>

                          {/* Items in Kegiatan Group */}
                          {group.items.map((bi) => {
                            const sel = selectedBillableRows[bi.penawaranDetailId] || { selected: false, quantity: 0 };
                            const isExhausted = bi.remainingBillableVolume <= 0;

                            return (
                              <tr
                                key={bi.penawaranDetailId}
                                className={`transition-colors ${
                                  isExhausted
                                    ? 'opacity-40 bg-slate-50 dark:bg-slate-950/40'
                                    : sel.selected
                                    ? 'bg-brand-500/10'
                                    : 'hover:bg-white/40 dark:hover:bg-slate-800/40'
                                }`}
                              >
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
                                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                                  />
                                </td>
                                <td className="p-2.5">
                                  <div className="font-bold text-slate-800 dark:text-slate-100 text-xs">{bi.description}</div>
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                    Harga Satuan: {formatCurrency(bi.unitPrice)} / {bi.unit}
                                    {bi.notes && <span className="ml-2 italic text-slate-500">• {bi.notes}</span>}
                                  </div>
                                </td>
                                <td className="p-2.5 text-right font-mono text-slate-600 dark:text-slate-400">
                                  {bi.originalVolume} {bi.unit}
                                </td>
                                <td className="p-2.5 text-right font-mono text-slate-600 dark:text-slate-400">
                                  {bi.alreadyBilledVolume} {bi.unit}
                                </td>
                                <td className="p-2.5 text-right font-mono font-bold">
                                  <span className={isExhausted ? 'text-slate-400' : 'text-emerald-600 dark:text-emerald-400'}>
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
                                    className="w-28 text-right font-mono text-xs px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-slate-800 shrink-0">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Centang kegiatan atau item untuk ditagihkan pada termin ini.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPenawaranModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleImportSelectedFromPenawaran}
                  className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 rounded-xl transition shadow-md shadow-brand-500/25 flex items-center gap-1.5"
                >
                  <DownloadCloud className="w-3.5 h-3.5" />
                  Tambahkan Item Terpilih
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceFormPage;

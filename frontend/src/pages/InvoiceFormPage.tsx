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
  CheckCircle2,
  PieChart,
  ShieldCheck,
  GitBranch
} from 'lucide-react';
import { invoiceApi } from '../api/invoiceApi';
import { customerApi } from '../api/customerApi';
import { penawaranApi } from '../api/penawaranApi';
import { useAuth } from '../context/AuthContext';
import { Customer } from '../types/customer';
import { Penawaran } from '../types/penawaran';
import {
  CreateInvoiceDetailInput,
  PenawaranBillableItem,
  TaxPpnType,
  TaxPphType,
  BillingMode,
  PenawaranTerminSummary
} from '../types/invoice';
import { BentoCard } from '@/components/common/BentoCard';
import { PageHeader } from '@/components/common/PageHeader';

interface ItemRow extends CreateInvoiceDetailInput {
  tempId: string;
  sourcePenawaranNumber?: string;
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

  // Fase 2: Billing Mode, Termin % & DP Deduction
  const [billingMode, setBillingMode] = useState<BillingMode>('ITEM_VOLUME');
  const [terminPercentage, setTerminPercentage] = useState<number>(30);
  const [terminName, setTerminName] = useState<string>('Uang Muka (DP 30%)');
  const [deductPreviousDp, setDeductPreviousDp] = useState<boolean>(false);
  const [selectedPreviousDpId, setSelectedPreviousDpId] = useState<number | null>(null);
  const [terminSummary, setTerminSummary] = useState<PenawaranTerminSummary | null>(null);
  const [loadingTerminSummary, setLoadingTerminSummary] = useState<boolean>(false);

  // Fase 3: Retensi Konstruksi (V-11)
  const [applyRetention, setApplyRetention] = useState<boolean>(false);
  const [retentionPercentage, setRetentionPercentage] = useState<number>(5);
  const [retentionMonths, setRetentionMonths] = useState<number>(6);
  const [retentionDueDate, setRetentionDueDate] = useState<string>('');

  // Fase 4: Konsolidasi Multi-SPH (V-09)
  const [isMultiSphMode, setIsMultiSphMode] = useState<boolean>(false);
  const [selectedMultiSphIds, setSelectedMultiSphIds] = useState<number[]>([]);

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
          if (data.billingMode) setBillingMode(data.billingMode);
          if (data.terminPercentage) setTerminPercentage(Number(data.terminPercentage));
          if (data.terminName) setTerminName(data.terminName);
          if (data.previousDpInvoiceId) {
            setDeductPreviousDp(true);
            setSelectedPreviousDpId(data.previousDpInvoiceId);
          }
          if (data.retentionPercentage || data.retentionAmount) {
            setApplyRetention(true);
            setRetentionPercentage(Number(data.retentionPercentage) || 5);
            if (data.retentionDueDate) setRetentionDueDate(data.retentionDueDate);
          }
          if (data.details && data.details.length > 0) {
            setItems(
              data.details.map((d, idx) => ({
                tempId: `row-${idx + 1}`,
                sourcePenawaranId: d.sourcePenawaranId,
                sourcePenawaranNumber: d.sourcePenawaranNumber,
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
                isDeduction: d.isDeduction,
                itemType: d.itemType,
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

  // Auto-calculate retentionDueDate if date or retentionMonths changes (when creating or not manually set)
  useEffect(() => {
    if (!isEdit && date && retentionMonths) {
      const d = new Date(date);
      d.setMonth(d.getMonth() + Number(retentionMonths));
      setRetentionDueDate(d.toISOString().split('T')[0]);
    }
  }, [date, retentionMonths, isEdit]);

  // Load Termin Summary when sourcePenawaranId is present
  useEffect(() => {
    if (sourcePenawaranId) {
      setLoadingTerminSummary(true);
      invoiceApi
        .getPenawaranTerminSummary(sourcePenawaranId)
        .then((summary) => {
          setTerminSummary(summary);
          // If in percentage termin mode and creating fresh, suggest sensible termin defaults
          if (!isEdit && summary) {
            if (summary.alreadyBilledPercentage === 0) {
              setTerminPercentage(30);
              setTerminName('Uang Muka (DP 30%)');
            } else {
              const rem = summary.remainingPercentage || 0;
              setTerminPercentage(rem);
              setTerminName(rem === 100 ? 'Pelunasan 100%' : `Termin Progres (${rem}%)`);
            }
          }
        })
        .catch(console.error)
        .finally(() => {
          setLoadingTerminSummary(false);
        });
    } else {
      setTerminSummary(null);
    }
  }, [sourcePenawaranId, isEdit]);

  // Synchronize item rows automatically when PERCENTAGE_TERMIN mode is active
  useEffect(() => {
    if (billingMode !== 'PERCENTAGE_TERMIN') return;
    if (!terminSummary) return;

    const totalKontrak = Number(terminSummary.totalPenawaranAmount) || 0;
    const pct = Number(terminPercentage) || 0;
    const baseTerminAmount = Math.round((totalKontrak * pct) / 100);

    const terminItem: ItemRow = {
      tempId: 'termin-main-row',
      description: `${terminName.trim() || 'Penagihan Termin'} (${pct}%) - SPH ${terminSummary.penawaranNumber}`,
      quantity: 1,
      unit: 'Termin',
      unitPrice: baseTerminAmount,
      sortOrder: 1,
      isDeduction: false,
      itemType: 'STANDARD',
    };

    const newItems: ItemRow[] = [terminItem];

    if (deductPreviousDp && selectedPreviousDpId) {
      const dpInv = terminSummary.availableDpInvoices?.find(
        (dp) => dp.invoiceId === Number(selectedPreviousDpId)
      );
      if (dpInv) {
        newItems.push({
          tempId: 'termin-dp-deduction-row',
          description: `Potongan Uang Muka (DP) - Faktur ${dpInv.invoiceNumber}`,
          quantity: 1,
          unit: 'Termin',
          unitPrice: Number(dpInv.subtotalDpp) || Number(dpInv.totalAmount) || 0,
          sortOrder: 2,
          isDeduction: true,
          itemType: 'DP_DEDUCTION',
        });
      }
    }

    setItems(newItems);
  }, [
    billingMode,
    terminSummary,
    terminPercentage,
    terminName,
    deductPreviousDp,
    selectedPreviousDpId,
  ]);


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

  // Fetch Billable Items (Single SPH or Multi-SPH)
  const fetchBillableItems = async () => {
    try {
      setLoadingBillable(true);
      let bItems: PenawaranBillableItem[] = [];
      if (isMultiSphMode) {
        if (selectedMultiSphIds.length > 0) {
          bItems = await invoiceApi.getMultiSphBillableItems(selectedMultiSphIds);
        }
      } else if (selectedModalPenawaranId) {
        bItems = await invoiceApi.getBillableItemsFromPenawaran(Number(selectedModalPenawaranId));
      }
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBillable(false);
    }
  };

  useEffect(() => {
    if (!isMultiSphMode && selectedModalPenawaranId) {
      fetchBillableItems();
    }
  }, [selectedModalPenawaranId, isMultiSphMode]);

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

    if (!isMultiSphMode && !chosenPenawaran) return;
    if (isMultiSphMode && selectedMultiSphIds.length === 0) return;

    const imported: ItemRow[] = [];
    billableItems.forEach((bi) => {
      const sel = selectedBillableRows[bi.penawaranDetailId];
      if (sel && sel.selected && sel.quantity > 0) {
        imported.push({
          tempId: `imported-penawaran-${bi.penawaranDetailId}-${Date.now()}-${imported.length}`,
          sourcePenawaranId: bi.penawaranId || (chosenPenawaran ? chosenPenawaran.id : undefined),
          sourcePenawaranNumber: bi.penawaranNumber || (chosenPenawaran ? chosenPenawaran.number : undefined),
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

    if (isMultiSphMode) {
      setSourcePenawaranId(selectedMultiSphIds[0] || null);
      setSourcePenawaranNumber(`Konsolidasi Multi-SPH (${selectedMultiSphIds.length} SPH)`);
    } else if (chosenPenawaran) {
      setSourcePenawaranId(chosenPenawaran.id);
      setSourcePenawaranNumber(chosenPenawaran.number);
    }

    // Replace if first row is untouched
    if (items.length === 1 && !items[0].description.trim() && items[0].unitPrice === 0) {
      setItems(imported);
    } else {
      setItems((prev) => [...prev, ...imported]);
    }

    setShowPenawaranModal(false);
  };

  // Group billableItems by SPH Kegiatan ID (and SPH Number in Multi-SPH mode)
  const groupedBillable = useMemo(() => {
    const map = new Map<string, { groupKey: string; groupName: string; sphNumber?: string; items: PenawaranBillableItem[] }>();
    billableItems.forEach((bi) => {
      const sphPrefix = bi.penawaranNumber ? `[${bi.penawaranNumber}] ` : '';
      const groupKey = isMultiSphMode
        ? `sph:${bi.penawaranId}:keg:${bi.sphKegiatanId || bi.kegiatanId || 'main'}`
        : (bi.sphKegiatanId != null ? `sph:${bi.sphKegiatanId}` : (bi.kegiatanId != null ? `kegiatan:${bi.kegiatanId}` : 'manual'));
      const groupName = `${sphPrefix}${bi.sphKegiatanName || bi.kegiatanName || 'Pekerjaan Utama'}`;
      if (!map.has(groupKey)) {
        map.set(groupKey, { groupKey, groupName, sphNumber: bi.penawaranNumber, items: [] });
      }
      map.get(groupKey)!.items.push(bi);
    });
    return Array.from(map.values());
  }, [billableItems, isMultiSphMode]);

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
      const lineTotal = qty * price;
      return item.isDeduction ? sum - lineTotal : sum + lineTotal;
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

    if (isAdmin && !sourcePenawaranId && (!selectedMultiSphIds || selectedMultiSphIds.length === 0)) {
      setErrorMsg('Role Admin diwajibkan menerbitkan Faktur Penjualan berdasarkan Surat Penawaran Harga (SPH) resmi.');
      return;
    }

    if (billingMode === 'PERCENTAGE_TERMIN') {
      if (!sourcePenawaranId) {
        setErrorMsg('Penagihan mode Termin Persentase wajib memilih Surat Penawaran Harga (SPH) acuan.');
        return;
      }
      if (!terminPercentage || terminPercentage <= 0) {
        setErrorMsg('Persentase termin harus lebih besar dari 0%.');
        return;
      }
      if (terminPercentage > 100) {
        setErrorMsg('Persentase termin tidak boleh melebihi 100%.');
        return;
      }
      if (taxCalculation.subtotalDpp < 0) {
        setErrorMsg('Subtotal DPP faktur tidak boleh bernilai negatif setelah pemotongan Uang Muka (DP).');
        return;
      }
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

      const effectiveMultiSphIds = isMultiSphMode && selectedMultiSphIds.length > 0
        ? selectedMultiSphIds
        : (sourcePenawaranId ? [sourcePenawaranId] : undefined);

      const payloadItems = items.map((it, idx) => ({
        sourcePenawaranId: it.sourcePenawaranId || (sourcePenawaranId || undefined),
        sourcePenawaranDetailId: it.sourcePenawaranDetailId,
        sphKegiatanId: it.sphKegiatanId,
        sourceKegiatanId: it.sourceKegiatanId,
        sourceKegiatanItemId: it.sourceKegiatanItemId,
        description: it.description.trim(),
        quantity: Number(it.quantity),
        unit: it.unit.trim(),
        unitPrice: Number(it.unitPrice),
        sortOrder: idx + 1,
        isDeduction: Boolean(it.isDeduction),
        itemType: it.itemType || (it.isDeduction ? 'DP_DEDUCTION' : 'STANDARD'),
        notes: it.notes,
      }));

      if (isEdit && id) {
        await invoiceApi.updateInvoice(Number(id), {
          customerId: Number(selectedCustomerId),
          sourcePenawaranIds: effectiveMultiSphIds,
          billingMode,
          terminPercentage: billingMode === 'PERCENTAGE_TERMIN' ? Number(terminPercentage) : undefined,
          terminName: billingMode === 'PERCENTAGE_TERMIN' ? terminName.trim() : undefined,
          previousDpInvoiceId: (billingMode === 'PERCENTAGE_TERMIN' && deductPreviousDp && selectedPreviousDpId) ? Number(selectedPreviousDpId) : undefined,
          applyRetention,
          retentionPercentage: applyRetention ? Number(retentionPercentage) : undefined,
          retentionMonths: applyRetention ? Number(retentionMonths) : undefined,
          retentionDueDate: applyRetention ? (retentionDueDate || undefined) : undefined,
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
          sourcePenawaranId: sourcePenawaranId || (effectiveMultiSphIds && effectiveMultiSphIds[0]) || undefined,
          sourcePenawaranIds: effectiveMultiSphIds,
          billingMode,
          terminPercentage: billingMode === 'PERCENTAGE_TERMIN' ? Number(terminPercentage) : undefined,
          terminName: billingMode === 'PERCENTAGE_TERMIN' ? terminName.trim() : undefined,
          previousDpInvoiceId: (billingMode === 'PERCENTAGE_TERMIN' && deductPreviousDp && selectedPreviousDpId) ? Number(selectedPreviousDpId) : undefined,
          applyRetention,
          retentionPercentage: applyRetention ? Number(retentionPercentage) : undefined,
          retentionMonths: applyRetention ? Number(retentionMonths) : undefined,
          retentionDueDate: applyRetention ? (retentionDueDate || undefined) : undefined,
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
        <BentoCard className="p-6 space-y-5">
          {/* Mode Penagihan Switcher (Khusus jika bersumber dari SPH) */}
          {sourcePenawaranId && (
            <div className="bg-slate-100/80 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-1.5">
              <button
                type="button"
                onClick={() => setBillingMode('ITEM_VOLUME')}
                className={`flex-1 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  billingMode === 'ITEM_VOLUME'
                    ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Mode Kuantitas Fisik (Item & Volume SPH)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setBillingMode('PERCENTAGE_TERMIN');
                  if (terminSummary) {
                    if (terminSummary.alreadyBilledPercentage === 0) {
                      setTerminPercentage(30);
                      setTerminName('Uang Muka (DP 30%)');
                    } else {
                      const rem = terminSummary.remainingPercentage || 0;
                      setTerminPercentage(rem);
                      setTerminName(rem === 100 ? 'Pelunasan 100%' : `Termin Progres (${rem}%)`);
                    }
                  }
                }}
                className={`flex-1 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  billingMode === 'PERCENTAGE_TERMIN'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <PieChart className="w-4 h-4" />
                <span>Mode Termin Proyek (%) & Potongan DP</span>
              </button>
            </div>
          )}

          {/* Panel Kontrol Khusus Mode Termin Proyek (%) */}
          {billingMode === 'PERCENTAGE_TERMIN' && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-slate-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-slate-900/50 border border-indigo-500/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-500/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                    <PieChart className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      Pengaturan Termin Proyek Bertahap
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Total Kontrak SPH: <strong className="font-mono text-slate-700 dark:text-slate-200">{formatCurrency(terminSummary?.totalPenawaranAmount || 0)}</strong>
                    </p>
                  </div>
                </div>

                {loadingTerminSummary && (
                  <span className="text-xs text-indigo-500 font-semibold animate-pulse">
                    Memuat status termin...
                  </span>
                )}
              </div>

              {/* Visual Progress Bar Termin */}
              {terminSummary && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                      Akumulasi Penagihan SPH:
                    </span>
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-blue-600 dark:text-blue-400">
                        Tertagih: {terminSummary.alreadyBilledPercentage}%
                      </span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                        Faktur Ini: {terminPercentage}%
                      </span>
                      <span className="text-slate-500">
                        Sisa: {Math.max(0, 100 - (terminSummary.alreadyBilledPercentage || 0) - (Number(terminPercentage) || 0))}%
                      </span>
                    </div>
                  </div>

                  {/* Multi-segment Progress Bar */}
                  <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${Math.min(100, terminSummary.alreadyBilledPercentage)}%` }}
                      className="h-full bg-blue-500 transition-all duration-300"
                      title={`Tertagih sebelumnya: ${terminSummary.alreadyBilledPercentage}%`}
                    />
                    <div
                      style={{
                        width: `${Math.min(
                          Math.max(0, 100 - terminSummary.alreadyBilledPercentage),
                          Number(terminPercentage) || 0
                        )}%`,
                      }}
                      className="h-full bg-indigo-500 transition-all duration-300"
                      title={`Ditagihkan sekarang: ${terminPercentage}%`}
                    />
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] text-slate-400 mr-1">Preset Cepat:</span>
                    {terminSummary.alreadyBilledPercentage === 0 && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setTerminPercentage(20);
                            setTerminName('Uang Muka (DP 20%)');
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 transition"
                        >
                          DP 20%
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTerminPercentage(30);
                            setTerminName('Uang Muka (DP 30%)');
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 transition"
                        >
                          DP 30%
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTerminPercentage(50);
                            setTerminName('Uang Muka (DP 50%)');
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 transition"
                        >
                          DP 50%
                        </button>
                      </>
                    )}

                    {terminSummary.alreadyBilledPercentage > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const rem = terminSummary.remainingPercentage || 0;
                          setTerminPercentage(rem);
                          setTerminName(`Pelunasan Akhir (${rem}%)`);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 transition"
                      >
                        Pelunasan Sisa ({terminSummary.remainingPercentage}%)
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Inputs: Nama Termin & Persentase */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-indigo-500/10">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Nama / Judul Termin <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={terminName}
                    onChange={(e) => setTerminName(e.target.value)}
                    placeholder="Contoh: Uang Muka (DP 30%), Termin I (Progres 50%), Pelunasan 30%"
                    className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Persentase (%) <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Max: {terminSummary?.remainingPercentage || 100}%
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={terminSummary?.remainingPercentage || 100}
                      required
                      value={terminPercentage}
                      onChange={(e) => setTerminPercentage(parseFloat(e.target.value) || 0)}
                      className="w-full text-sm font-mono px-3.5 py-2 pr-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition text-right"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 pointer-events-none">
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Opsi Pemotongan Uang Muka (DP) */}
              <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={deductPreviousDp}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setDeductPreviousDp(checked);
                        if (checked && terminSummary?.availableDpInvoices && terminSummary.availableDpInvoices.length > 0) {
                          setSelectedPreviousDpId(terminSummary.availableDpInvoices[0].invoiceId);
                        } else {
                          setSelectedPreviousDpId(null);
                        }
                      }}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Potong Uang Muka (DP) yang telah dibayar sebelumnya
                    </span>
                  </label>

                  {deductPreviousDp && selectedPreviousDpId && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                      Memotong Subtotal DPP
                    </span>
                  )}
                </div>

                {deductPreviousDp && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-2">
                    {terminSummary?.availableDpInvoices && terminSummary.availableDpInvoices.length > 0 ? (
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          Pilih Faktur DP Referensi yang akan dipotongkan:
                        </label>
                        <select
                          value={selectedPreviousDpId || ''}
                          onChange={(e) => setSelectedPreviousDpId(e.target.value ? Number(e.target.value) : null)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                        >
                          {terminSummary.availableDpInvoices.map((dp) => (
                            <option key={dp.invoiceId} value={dp.invoiceId}>
                              {dp.invoiceNumber} - {dp.terminName || 'Uang Muka'} (Potongan DPP: {formatCurrency(dp.subtotalDpp)})
                            </option>
                          ))}
                        </select>
                        <p className="text-[11px] text-slate-400">
                          Nominal DPP DP ini akan menjadi baris pengurang pada faktur termin saat ini. PPN/PPh akan dihitung atas sisa DPP bersih.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>
                          Belum ada faktur Uang Muka (DP) yang tercatat untuk SPH ini.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FASE 3: Ketentuan Retensi Pemeliharaan Konstruksi (V-11) */}
          <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={applyRetention}
                  onChange={(e) => setApplyRetention(e.target.checked)}
                  className="rounded border-amber-400 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Terapkan Retensi Pemeliharaan Proyek (Masa Garansi Konstruksi)
                </span>
              </label>

              {applyRetention && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                  Potongan Tagihan Fisik: {retentionPercentage}%
                </span>
              )}
            </div>

            {applyRetention && (
              <div className="pt-3 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs animate-in fade-in">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                    Persentase Retensi (%) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="100"
                      value={retentionPercentage}
                      onChange={(e) => setRetentionPercentage(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs font-mono px-3 py-2 pr-8 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-right"
                    />
                    <span className="absolute right-3 top-2 text-xs font-bold text-amber-600 pointer-events-none">
                      %
                    </span>
                  </div>
                  <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80">
                    Standar konstruksi: 5% dari nilai kontrak/tagihan.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                    Durasi Masa Pemeliharaan
                  </label>
                  <select
                    value={retentionMonths}
                    onChange={(e) => {
                      const m = Number(e.target.value);
                      setRetentionMonths(m);
                      if (date) {
                        const d = new Date(date);
                        d.setMonth(d.getMonth() + m);
                        setRetentionDueDate(d.toISOString().split('T')[0]);
                      }
                    }}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  >
                    <option value={3}>3 Bulan (Masa Pemeliharaan Singkat)</option>
                    <option value={6}>6 Bulan (Standar Garansi Konstruksi)</option>
                    <option value={12}>12 Bulan (1 Tahun Pemeliharaan Penuh)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                    Target Jatuh Tempo Tagih Retensi
                  </label>
                  <input
                    type="date"
                    value={retentionDueDate}
                    onChange={(e) => setRetentionDueDate(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                  <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80">
                    Jatuh tempo penagihan draft companion faktur retensi.
                  </p>
                </div>

                <div className="sm:col-span-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-300 leading-relaxed">
                  💡 <strong>Otomatisasi Sistem:</strong> Sistem akan memotong tagihan fisik faktur ini via baris <code>RETENTION_DEDUCTION</code> dan sekaligus membuatkan <strong>Companion Draft Faktur Retensi ({retentionPercentage}%)</strong> berstatus <code>DRAFT</code> berjatuh tempo sesuai tanggal di atas.
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-brand-500" />
                Rincian Item Penagihan
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {billingMode === 'PERCENTAGE_TERMIN'
                  ? 'Item dan potongan DP ter-generate secara otomatis sesuai konfigurasi termin.'
                  : 'Nilai subtotal dan total dihitung secara otoritatif oleh sistem.'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
              {billingMode === 'ITEM_VOLUME' && selectedCustomerId && approvedPenawaranList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPenawaranModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 rounded-xl hover:bg-amber-500/25 transition shadow-xs active:scale-95"
                >
                  <DownloadCloud className="w-4 h-4 text-amber-500" />
                  Tarik dari Penawaran Disetujui
                </button>
              )}

              {billingMode === 'ITEM_VOLUME' && !isAdmin && (
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
                  const lineTotal = (Number(row.quantity) || 0) * (Number(row.unitPrice) || 0);
                  const isDeduction = Boolean(row.isDeduction);
                  const isExceeding =
                    row.maxBillableQuantity !== undefined &&
                    Number(row.quantity) > row.maxBillableQuantity;

                  return (
                    <tr
                      key={row.tempId}
                      className={`transition-colors ${
                        isDeduction
                          ? 'bg-rose-500/5 dark:bg-rose-500/10 hover:bg-rose-500/10'
                          : 'hover:bg-white/40 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3 px-3 text-center text-xs font-mono text-slate-400">
                        {index + 1}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          {isDeduction && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                              {row.itemType === 'RETENTION_DEDUCTION' ? 'POTONGAN RETENSI' : 'POTONGAN DP'}
                            </span>
                          )}
                          {row.sourcePenawaranNumber && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                              <FileSpreadsheet className="w-3 h-3 text-emerald-500" />
                              SPH: {row.sourcePenawaranNumber}
                            </span>
                          )}
                          {row.sphKegiatanName && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                              <Layers className="w-3 h-3 text-indigo-500" />
                              {row.sphKegiatanName}
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="Deskripsi penagihan jasa / barang..."
                          value={row.description}
                          onChange={(e) => handleItemChange(row.tempId, 'description', e.target.value)}
                          className={`w-full text-sm px-3 py-1.5 rounded-xl border bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition ${
                            isDeduction
                              ? 'border-rose-300 dark:border-rose-900/60 font-semibold text-rose-900 dark:text-rose-200'
                              : 'border-slate-200 dark:border-slate-800'
                          }`}
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
                          disabled={billingMode === 'PERCENTAGE_TERMIN'}
                          value={row.quantity}
                          onChange={(e) =>
                            handleItemChange(row.tempId, 'quantity', parseFloat(e.target.value) || 0)
                          }
                          className={`w-full text-right font-mono text-sm px-3 py-1.5 rounded-xl border focus:outline-none focus:ring-2 transition disabled:opacity-70 ${
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
                          disabled={billingMode === 'PERCENTAGE_TERMIN'}
                          placeholder="m2, unit"
                          value={row.unit}
                          onChange={(e) => handleItemChange(row.tempId, 'unit', e.target.value)}
                          className="w-full text-sm px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:opacity-70 transition"
                        />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          required
                          disabled={billingMode === 'PERCENTAGE_TERMIN'}
                          value={row.unitPrice}
                          onChange={(e) =>
                            handleItemChange(row.tempId, 'unitPrice', parseFloat(e.target.value) || 0)
                          }
                          className="w-full text-right font-mono text-sm px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:opacity-70 transition"
                        />
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        <span className={isDeduction ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}>
                          {isDeduction ? `- ${formatCurrency(lineTotal)}` : formatCurrency(lineTotal)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          disabled={billingMode === 'PERCENTAGE_TERMIN' || items.length <= 1}
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

            {/* Tab Mode: Tunggal vs Konsolidasi Multi-SPH */}
            <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => {
                  setIsMultiSphMode(false);
                  if (approvedPenawaranList.length > 0 && !selectedModalPenawaranId) {
                    setSelectedModalPenawaranId(approvedPenawaranList[0].id);
                  }
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  !isMultiSphMode
                    ? 'bg-brand-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>Satu SPH Acuan</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMultiSphMode(true);
                  if (selectedMultiSphIds.length === 0 && approvedPenawaranList.length > 0) {
                    setSelectedMultiSphIds(approvedPenawaranList.slice(0, 2).map((p) => p.id));
                  }
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isMultiSphMode
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Konsolidasi Multi-SPH (Rekap Bulanan)</span>
              </button>
            </div>

            {/* SPH Select Bar */}
            <div className="flex flex-col gap-3 shrink-0 bg-white/50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
              {!isMultiSphMode ? (
                <>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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

                  {/* Prompt jika SPH Induk memiliki Addendum yang disetujui */}
                  {(() => {
                    const relatedAddendums = approvedPenawaranList.filter(
                      (p) => p.parentPenawaranId === Number(selectedModalPenawaranId)
                    );
                    if (relatedAddendums.length === 0) return null;
                    return (
                      <div className="mt-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2">
                          <GitBranch className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span className="text-amber-900 dark:text-amber-200">
                            SPH ini memiliki <strong>{relatedAddendums.length} SPH Addendum</strong> (pekerjaan tambah) yang telah disetujui.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsMultiSphMode(true);
                            setSelectedMultiSphIds([
                              Number(selectedModalPenawaranId),
                              ...relatedAddendums.map((a) => a.id),
                            ]);
                          }}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shadow-xs shrink-0"
                        >
                          Sertakan Item Addendum ke Tagihan &rarr;
                        </button>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300">
                      Pilih 2 atau Lebih SPH yang akan Dikonsolidasikan ({selectedMultiSphIds.length} SPH dipilih):
                    </label>
                    <button
                      type="button"
                      onClick={fetchBillableItems}
                      className="px-3 py-1 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 rounded-lg transition"
                    >
                      Muat Ulang Item Lintas SPH
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                    {approvedPenawaranList.map((p) => {
                      const isChecked = selectedMultiSphIds.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className={`flex items-center gap-2 p-2 rounded-lg border transition cursor-pointer select-none ${
                            isChecked
                              ? 'bg-purple-500/10 border-purple-500/30 text-purple-950 dark:text-purple-200'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const updated = checked
                                ? [...selectedMultiSphIds, p.id]
                                : selectedMultiSphIds.filter((sid) => sid !== p.id);
                              setSelectedMultiSphIds(updated);
                            }}
                            className="rounded border-purple-400 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                          />
                          <div className="min-w-0">
                            <p className="font-bold truncate">{p.number}</p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {p.date} • {formatCurrency(p.totalAmount)}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[11px] text-slate-500 italic">
                      Item yang ditarik akan tetap melacak SPH asalnya secara independen untuk mencegah tagihan ganda.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectAllBillable(true)}
                        className="px-2.5 py-1 text-xs font-bold text-brand-700 dark:text-brand-300 bg-brand-500/10 rounded-lg hover:bg-brand-500/20"
                      >
                        Pilih Semua
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectAllBillable(false)}
                        className="px-2.5 py-1 text-xs font-bold text-slate-500 hover:text-slate-700"
                      >
                        Kosongkan
                      </button>
                    </div>
                  </div>
                </div>
              )}
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

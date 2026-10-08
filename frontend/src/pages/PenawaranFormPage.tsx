import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Trash2,
  Save,
  AlertCircle,
  Building2,
  Calculator,
  Layers,
  CheckCircle2,
  FolderPlus,
  FolderDown,
  GitBranch,
} from 'lucide-react';
import { penawaranApi } from '../api/penawaranApi';
import { customerApi } from '../api/customerApi';
import { itemCatalogApi } from '../api/itemCatalogApi';
import { kegiatanApi } from '../api/kegiatanApi';
import { Customer, CreateCustomerInput, UpdateCustomerInput } from '../types/customer';
import { Kegiatan } from '../types/kegiatan';
import { ItemCatalog, CreateItemCatalogInput, UpdateItemCatalogInput } from '../types/itemCatalog';
import { Penawaran } from '../types/penawaran';
import { ItemCatalogModal } from '../components/items/ItemCatalogModal';
import { CustomerModal } from '../components/customer/CustomerModal';
import { ImportKegiatanModal } from '../components/penawaran/ImportKegiatanModal';
import { ItemSmartInput } from '../components/items/ItemSmartInput';
import { CustomerSmartInput } from '../components/customer/CustomerSmartInput';
import { formatRupiah } from '../lib/utils';
import { BentoCard } from '@/components/common/BentoCard';
import { PageHeader } from '@/components/common/PageHeader';

interface FormItemRow {
  tempId: string;
  itemCatalogId?: number;
  kegiatanId?: number;
  kegiatanItemId?: number;
  description: string;
  volume: number;
  unit: string;
  unitPrice: number;
  sortOrder: number;
  notes?: string;
}

interface FormKegiatanGroup {
  tempId: string;
  kegiatanId?: number;
  kegiatanCode?: string;
  name: string;
  sortOrder: number;
  items: FormItemRow[];
}

export const PenawaranFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const customerIdFromQuery = searchParams.get('customerId');
  const kegiatanIdFromQuery = searchParams.get('kegiatanId');
  const parentIdFromQuery = searchParams.get('parentId');
  const isEdit = Boolean(id);
  const queryClient = useQueryClient();

  const [parentPenawaran, setParentPenawaran] = useState<Penawaran | null>(null);

  // Fetch active customers via TanStack Query for seamless real-time synchronization
  const { data: customers = [], refetch: refetchCustomers } = useQuery<Customer[]>({
    queryKey: ['active-customers'],
    queryFn: () => customerApi.getActiveCustomers(),
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>(
    customerIdFromQuery ? Number(customerIdFromQuery) : ''
  );
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState(
    '1. Pembayaran DP 30% setelah penawaran disetujui\n2. Termin 2 sebesar 50% setelah progress fisik mencapai 70%\n3. Pelunasan 20% saat serah terima pekerjaan\n4. Masa retensi garansi 30 hari kalender'
  );

  // Grouped Kegiatan State
  const [kegiatanGroups, setKegiatanGroups] = useState<FormKegiatanGroup[]>([
    {
      tempId: 'kg-1',
      name: 'Pembangunan Ruang Kelas Baru',
      sortOrder: 1,
      items: [
        {
          tempId: 'item-1',
          description: '',
          volume: 1,
          unit: 'm2',
          unitPrice: 0,
          sortOrder: 1,
        },
      ],
    },
  ]);

  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isImportKegiatanModalOpen, setIsImportKegiatanModalOpen] = useState(false);
  const [targetKegiatanTempId, setTargetKegiatanTempId] = useState<string | null>(null);
  const [targetItemTempId, setTargetItemTempId] = useState<string | null>(null);
  const [prefillItemName, setPrefillItemName] = useState<string>('');
  const [prefillCustomerName, setPrefillCustomerName] = useState<string>('');

  const [isSubmittingCustomer, setIsSubmittingCustomer] = useState(false);
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Set customer from query if customers loaded
  useEffect(() => {
    if (customerIdFromQuery && !selectedCustomerId) {
      setSelectedCustomerId(Number(customerIdFromQuery));
    }
  }, [customerIdFromQuery, selectedCustomerId]);

  // Pre-fill Kegiatan if kegiatanId is in query params
  useEffect(() => {
    if (kegiatanIdFromQuery && !isEdit) {
      kegiatanApi
        .getKegiatanById(Number(kegiatanIdFromQuery))
        .then((k) => {
          setSelectedCustomerId(k.customerId);
          if (k.items && k.items.length > 0) {
            setKegiatanGroups([
              {
                tempId: `kg-kegiatan-${k.id}`,
                kegiatanId: k.id,
                kegiatanCode: k.code,
                name: k.name,
                sortOrder: 1,
                items: k.items.map((it, idx) => ({
                  tempId: `item-kegiatan-${it.id || idx + 1}`,
                  kegiatanId: k.id,
                  kegiatanItemId: it.id,
                  description: it.description,
                  volume: it.volume,
                  unit: it.unit,
                  unitPrice: it.unitPrice,
                  sortOrder: it.sortOrder || idx + 1,
                  notes: it.notes || '',
                })),
              },
            ]);
          } else {
            setKegiatanGroups([
              {
                tempId: `kg-kegiatan-${k.id}`,
                kegiatanId: k.id,
                kegiatanCode: k.code,
                name: k.name,
                sortOrder: 1,
                items: [
                  {
                    tempId: `item-${Date.now()}-1`,
                    kegiatanId: k.id,
                    description: '',
                    volume: 1,
                    unit: 'm2',
                    unitPrice: 0,
                    sortOrder: 1,
                  },
                ],
              },
            ]);
          }
          setFeedbackMsg(`Rincian kegiatan '${k.name}' (${k.code}) berhasil dimuat ke dalam penawaran.`);
          setTimeout(() => setFeedbackMsg(null), 5000);
        })
        .catch((err) => {
          console.error('Failed to load kegiatan from query', err);
        });
    }
  }, [kegiatanIdFromQuery, isEdit]);

  // Pre-fill parent SPH if parentId is in query params (Addendum Mode)
  useEffect(() => {
    if (parentIdFromQuery && !isEdit) {
      penawaranApi
        .getPenawaranById(Number(parentIdFromQuery))
        .then((parent) => {
          setParentPenawaran(parent);
          setSelectedCustomerId(parent.customerId);
          setNotes(`Addendum / Pekerjaan Tambah atas Surat Penawaran Harga No. ${parent.number}`);
          if (parent.terms) {
            setTerms(parent.terms);
          }
          setKegiatanGroups([
            {
              tempId: `kg-addendum-1`,
              name: `Pekerjaan Tambah (Addendum atas SPH ${parent.number})`,
              sortOrder: 1,
              items: [
                {
                  tempId: `item-${Date.now()}-1`,
                  description: '',
                  volume: 1,
                  unit: 'ls',
                  unitPrice: 0,
                  sortOrder: 1,
                },
              ],
            },
          ]);
          setFeedbackMsg(`Mode SPH Addendum aktif: Terhubung ke SPH Induk '${parent.number}'.`);
          setTimeout(() => setFeedbackMsg(null), 5000);
        })
        .catch((err) => {
          console.error('Failed to load parent penawaran for addendum', err);
          setErrorMsg(err.response?.data?.message || 'Gagal memuat data SPH Induk untuk addendum.');
        });
    }
  }, [parentIdFromQuery, isEdit]);

  // Fetch Master Catalog Items
  const { data: masterItems = [], refetch: refetchMasterItems } = useQuery({
    queryKey: ['active-master-items'],
    queryFn: () => itemCatalogApi.getActiveItems(),
  });

  // Fetch Categories for quick modal
  const { data: categories = [] } = useQuery({
    queryKey: ['item-catalog-categories'],
    queryFn: () => itemCatalogApi.getCategories(),
  });

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

          if (data.kegiatanList && data.kegiatanList.length > 0) {
            setKegiatanGroups(
              data.kegiatanList.map((k, kIdx) => ({
                tempId: `kg-${k.id || kIdx + 1}`,
                kegiatanId: k.kegiatanId,
                kegiatanCode: k.kegiatanCode,
                name: k.name,
                sortOrder: k.sortOrder || kIdx + 1,
                items: (k.items || []).map((it, itIdx) => ({
                  tempId: `item-${it.id || itIdx + 1}`,
                  itemCatalogId: it.itemCatalogId,
                  description: it.description,
                  volume: it.volume,
                  unit: it.unit,
                  unitPrice: it.unitPrice,
                  sortOrder: it.sortOrder || itIdx + 1,
                  notes: it.notes,
                })),
              }))
            );
          } else if (data.details && data.details.length > 0) {
            // Legacy flat items fallback into 1 kegiatan
            setKegiatanGroups([
              {
                tempId: 'kg-legacy-1',
                name: 'Pekerjaan Utama',
                sortOrder: 1,
                items: data.details.map((d, idx) => ({
                  tempId: `item-legacy-${idx + 1}`,
                  itemCatalogId: d.itemCatalogId,
                  description: d.description,
                  volume: d.volume,
                  unit: d.unit,
                  unitPrice: d.unitPrice,
                  sortOrder: d.sortOrder || idx + 1,
                  notes: d.notes,
                })),
              },
            ]);
          }
        })
        .catch((err) => {
          setErrorMsg(err.response?.data?.message || 'Gagal memuat rincian SPH.');
        })
        .finally(() => {
          setInitialLoading(false);
        });
    }
  }, [isEdit, id]);

  // Operations on Kegiatan Groups
  const handleAddKegiatan = (initialName = '') => {
    const nextIdx = kegiatanGroups.length + 1;
    setKegiatanGroups((prev) => [
      ...prev,
      {
        tempId: `kg-${Date.now()}-${nextIdx}`,
        name: initialName,
        sortOrder: nextIdx,
        items: [
          {
            tempId: `item-${Date.now()}-1`,
            description: '',
            volume: 1,
            unit: 'm2',
            unitPrice: 0,
            sortOrder: 1,
          },
        ],
      },
    ]);
  };

  const handleRemoveKegiatan = (kegiatanTempId: string) => {
    if (kegiatanGroups.length <= 1) {
      setErrorMsg('SPH harus memiliki minimal 1 kegiatan.');
      return;
    }
    setKegiatanGroups((prev) => prev.filter((k) => k.tempId !== kegiatanTempId));
  };

  const handleSelectImportKegiatan = (k: Kegiatan) => {
    const newGroup: FormKegiatanGroup = {
      tempId: `kg-kegiatan-${k.id}-${Date.now()}`,
      kegiatanId: k.id,
      kegiatanCode: k.code,
      name: k.name,
      sortOrder: kegiatanGroups.length + 1,
      items:
        k.items && k.items.length > 0
          ? k.items.map((it, idx) => ({
              tempId: `item-kegiatan-${it.id || idx + 1}-${Date.now()}`,
              kegiatanId: k.id,
              kegiatanItemId: it.id,
              description: it.description,
              volume: it.volume,
              unit: it.unit,
              unitPrice: it.unitPrice,
              sortOrder: it.sortOrder || idx + 1,
              notes: it.notes || '',
            }))
          : [
              {
                tempId: `item-${Date.now()}-1`,
                kegiatanId: k.id,
                description: '',
                volume: 1,
                unit: 'm2',
                unitPrice: 0,
                sortOrder: 1,
              },
            ],
    };

    const isSingleDefaultBlank =
      kegiatanGroups.length === 1 &&
      kegiatanGroups[0].items.length === 1 &&
      !kegiatanGroups[0].items[0].description.trim() &&
      !kegiatanGroups[0].kegiatanId;

    if (isSingleDefaultBlank) {
      setKegiatanGroups([newGroup]);
    } else {
      setKegiatanGroups((prev) => [...prev, newGroup]);
    }

    setIsImportKegiatanModalOpen(false);
    setFeedbackMsg(`Berhasil menarik kegiatan '${k.name}' (${k.items?.length || 0} item).`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleKegiatanNameChange = (kegiatanTempId: string, name: string) => {
    setKegiatanGroups((prev) =>
      prev.map((k) => (k.tempId === kegiatanTempId ? { ...k, name } : k))
    );
  };

  // Operations on Items inside a Kegiatan
  const handleAddItemToKegiatan = (kegiatanTempId: string, prefillItem?: ItemCatalog) => {
    setKegiatanGroups((prev) =>
      prev.map((k) => {
        if (k.tempId !== kegiatanTempId) return k;
        const nextOrder = k.items.length + 1;
        const newItem: FormItemRow = prefillItem
          ? {
              tempId: `item-${Date.now()}-${nextOrder}`,
              itemCatalogId: prefillItem.id,
              description: prefillItem.name,
              volume: 1,
              unit: prefillItem.defaultUnit || 'unit',
              unitPrice: prefillItem.defaultPrice || 0,
              sortOrder: nextOrder,
            }
          : {
              tempId: `item-${Date.now()}-${nextOrder}`,
              description: '',
              volume: 1,
              unit: 'unit',
              unitPrice: 0,
              sortOrder: nextOrder,
            };
        return {
          ...k,
          items: [...k.items, newItem],
        };
      })
    );
  };

  const handleRemoveItemFromKegiatan = (kegiatanTempId: string, itemTempId: string) => {
    setKegiatanGroups((prev) =>
      prev.map((k) => {
        if (k.tempId !== kegiatanTempId) return k;
        if (k.items.length <= 1) {
          setErrorMsg('Setiap kegiatan harus memiliki minimal 1 item.');
          return k;
        }
        return {
          ...k,
          items: k.items.filter((it) => it.tempId !== itemTempId),
        };
      })
    );
  };

  const handleItemFieldChange = (
    kegiatanTempId: string,
    itemTempId: string,
    field: keyof FormItemRow,
    value: any
  ) => {
    setKegiatanGroups((prev) =>
      prev.map((k) => {
        if (k.tempId !== kegiatanTempId) return k;
        return {
          ...k,
          items: k.items.map((it) => (it.tempId === itemTempId ? { ...it, [field]: value } : it)),
        };
      })
    );
  };

  // Select item from master catalog
  const handleSelectMasterItem = (kegiatanTempId: string, itemTempId: string, item: ItemCatalog) => {
    setKegiatanGroups((prev) =>
      prev.map((k) => {
        if (k.tempId !== kegiatanTempId) return k;
        return {
          ...k,
          items: k.items.map((it) => {
            if (it.tempId !== itemTempId) return it;
            return {
              ...it,
              itemCatalogId: item.id,
              description: item.name,
              unit: item.defaultUnit || it.unit,
              unitPrice: item.defaultPrice !== undefined ? item.defaultPrice : it.unitPrice,
            };
          }),
        };
      })
    );
  };

  // Quick create master item modal submit
  const handleCreateMasterItemSubmit = async (formData: CreateItemCatalogInput | UpdateItemCatalogInput) => {
    try {
      setIsSubmittingItem(true);
      const createdItem = await itemCatalogApi.createItem(formData as CreateItemCatalogInput);
      await refetchMasterItems();
      queryClient.invalidateQueries({ queryKey: ['active-master-items'] });

      // If targetItemTempId is set, update that specific row
      if (targetKegiatanTempId && targetItemTempId) {
        setKegiatanGroups((prev) =>
          prev.map((k) => {
            if (k.tempId !== targetKegiatanTempId) return k;
            return {
              ...k,
              items: k.items.map((it) => {
                if (it.tempId !== targetItemTempId) return it;
                return {
                  ...it,
                  itemCatalogId: createdItem.id,
                  description: createdItem.name,
                  unit: createdItem.defaultUnit || it.unit,
                  unitPrice: createdItem.defaultPrice !== undefined ? createdItem.defaultPrice : it.unitPrice,
                };
              }),
            };
          })
        );
      } else if (targetKegiatanTempId) {
        // Automatically append to the target kegiatan
        handleAddItemToKegiatan(targetKegiatanTempId, createdItem);
      }

      setIsAddItemModalOpen(false);
      setTargetKegiatanTempId(null);
      setTargetItemTempId(null);
      setPrefillItemName('');
      setFeedbackMsg(`Item '${createdItem.name}' berhasil disimpan ke Master Data dan dipilih.`);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan item ke Master Data.');
    } finally {
      setIsSubmittingItem(false);
    }
  };

  // Quick create customer modal submit
  const handleCreateCustomerSubmit = async (formData: CreateCustomerInput | UpdateCustomerInput) => {
    try {
      setIsSubmittingCustomer(true);
      const createdCustomer = await customerApi.createCustomer(formData as CreateCustomerInput);
      await refetchCustomers();
      queryClient.invalidateQueries({ queryKey: ['active-customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });

      // Automatically select the newly created customer
      setSelectedCustomerId(createdCustomer.id);
      setIsCustomerModalOpen(false);
      setPrefillCustomerName('');
      setFeedbackMsg(`Customer '${createdCustomer.name}' (${createdCustomer.code}) berhasil ditambahkan dan dipilih.`);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menambahkan customer baru.');
    } finally {
      setIsSubmittingCustomer(false);
    }
  };

  // Calculation helpers
  const calculateKegiatanSubtotal = (k: FormKegiatanGroup) => {
    return k.items.reduce((sum, it) => sum + (Number(it.volume) || 0) * (Number(it.unitPrice) || 0), 0);
  };

  const grandTotalAmount = kegiatanGroups.reduce(
    (sum, k) => sum + calculateKegiatanSubtotal(k),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setErrorMsg('Customer wajib dipilih.');
      return;
    }

    // Validate groups
    for (let i = 0; i < kegiatanGroups.length; i++) {
      const kg = kegiatanGroups[i];
      if (!kg.name.trim()) {
        setErrorMsg(`Nama kegiatan ke-${i + 1} wajib diisi (misal: "Pembangunan Ruang Kelas Baru").`);
        return;
      }
      if (kg.items.length === 0) {
        setErrorMsg(`Kegiatan '${kg.name}' harus memiliki minimal 1 item.`);
        return;
      }
      for (let j = 0; j < kg.items.length; j++) {
        const it = kg.items[j];
        if (!it.description.trim()) {
          setErrorMsg(`Deskripsi item baris ke-${j + 1} di kegiatan '${kg.name}' tidak boleh kosong.`);
          return;
        }
        if (Number(it.volume) <= 0) {
          setErrorMsg(`Volume item '${it.description}' harus lebih dari 0.`);
          return;
        }
        if (Number(it.unitPrice) < 0) {
          setErrorMsg(`Harga satuan item '${it.description}' tidak boleh negatif.`);
          return;
        }
      }
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      // Build payload with grouped kegiatan
      const payloadKegiatan = kegiatanGroups.map((kg, kgIdx) => ({
        kegiatanId: kg.kegiatanId,
        name: kg.name.trim(),
        sortOrder: kgIdx + 1,
        items: kg.items.map((it, itIdx) => ({
          itemCatalogId: it.itemCatalogId,
          kegiatanId: it.kegiatanId || kg.kegiatanId,
          kegiatanItemId: it.kegiatanItemId,
          description: it.description.trim(),
          volume: Number(it.volume),
          unit: it.unit.trim(),
          unitPrice: Number(it.unitPrice),
          sortOrder: itIdx + 1,
          notes: it.notes,
        })),
      }));

      // Flatten items for full backward compatibility
      const flatItems = payloadKegiatan.flatMap((kg) => kg.items);

      if (isEdit && id) {
        await penawaranApi.updatePenawaran(Number(id), {
          customerId: Number(selectedCustomerId),
          date,
          notes,
          terms,
          kegiatan: payloadKegiatan,
          items: flatItems,
        });
        navigate(`/penawaran/${id}`);
      } else if (parentIdFromQuery) {
        const created = await penawaranApi.createAddendum(Number(parentIdFromQuery), {
          customerId: Number(selectedCustomerId),
          date,
          notes,
          terms,
          kegiatan: payloadKegiatan,
          items: flatItems,
        });
        navigate(`/penawaran/${created.id}`);
      } else {
        const created = await penawaranApi.createPenawaran({
          customerId: Number(selectedCustomerId),
          date,
          notes,
          terms,
          kegiatan: payloadKegiatan,
          items: flatItems,
        });
        navigate(`/penawaran/${created.id}`);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan Surat Penawaran Harga (SPH).');
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomerObj = customers.find((c) => c.id === Number(selectedCustomerId));

  if (initialLoading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-brand-600/30 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500 font-medium">Memuat data SPH...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Header */}
      <PageHeader
        icon={Calculator}
        backUrl="/penawaran"
        title={
          isEdit
            ? 'Ubah Surat Penawaran Harga (SPH)'
            : parentPenawaran
            ? `Buat SPH Addendum untuk ${parentPenawaran.number}`
            : 'Buat Surat Penawaran Harga (SPH) Baru'
        }
        subtitle={
          parentPenawaran
            ? `Variation Order / Penambahan Pekerjaan untuk SPH Induk ${parentPenawaran.number}`
            : 'Kelompokkan item penawaran berdasarkan nama kegiatan/pekerjaan untuk diterbitkan ke pelanggan.'
        }
        badge={
          parentPenawaran ? (
            <span className="text-[11px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/20 inline-flex items-center gap-1">
              <GitBranch className="w-3 h-3" />
              SPH Addendum
            </span>
          ) : (
            <span className="text-[11px] bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold px-2.5 py-0.5 rounded-full border border-brand-500/20">
              Multi-Kegiatan
            </span>
          )
        }
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl transition shadow-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/25 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading
                ? 'Menyimpan...'
                : isEdit
                ? 'Simpan Perubahan SPH'
                : parentPenawaran
                ? 'Terbitkan SPH Addendum'
                : 'Terbitkan SPH'}
            </button>
          </div>
        }
      />

      {/* Addendum Context Banner */}
      {parentPenawaran && (
        <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-900 dark:text-amber-200 border border-amber-500/30 text-xs font-medium flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                Pembuatan SPH Addendum (Variation Order)
              </p>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                Dokumen ini merupakan addendum resmi atas SPH Induk{' '}
                <strong className="text-amber-700 dark:text-amber-300 font-mono">
                  {parentPenawaran.number}
                </strong>
                . Nilai dasar kontrak induk:{' '}
                <strong className="text-slate-900 dark:text-white font-mono">
                  {formatRupiah(parentPenawaran.totalAmount)}
                </strong>
                .
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[11px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full border border-amber-500/30">
              Customer Terkunci
            </span>
          </div>
        </div>
      )}

      {/* Feedback Messages */}
      {feedbackMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 text-xs font-semibold flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/20 text-xs font-semibold flex items-center gap-2 animate-in fade-in shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Customer & Document Information */}
      <BentoCard className="p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-brand-500" />
          Informasi Pelanggan & Penawaran
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Customer / Pelanggan <span className="text-rose-500">*</span>
            </label>
            {parentPenawaran ? (
              <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {selectedCustomerObj?.name || parentPenawaran.customerName}
                  </span>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-semibold">
                    Terkunci ke SPH Induk
                  </span>
                </div>
                {selectedCustomerObj?.address && (
                  <p className="text-slate-500 text-[11px] mt-0.5">{selectedCustomerObj.address}</p>
                )}
                {selectedCustomerObj?.phone && (
                  <p className="text-slate-500 text-[11px]">Telp: {selectedCustomerObj.phone}</p>
                )}
              </div>
            ) : (
              <CustomerSmartInput
                selectedCustomerId={selectedCustomerId}
                onSelectCustomer={(cust) => setSelectedCustomerId(cust ? cust.id : '')}
                onCreateNewCustomer={(typedQuery) => {
                  setPrefillCustomerName(typedQuery);
                  setIsCustomerModalOpen(true);
                }}
                customers={customers}
                placeholder="Ketik nama, kode, atau instansi customer..."
              />
            )}
            {!parentPenawaran && selectedCustomerObj && (
              <div className="mt-2.5 p-3 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                <p className="font-bold text-slate-800 dark:text-slate-100">{selectedCustomerObj.name}</p>
                {selectedCustomerObj.address && <p>{selectedCustomerObj.address}</p>}
                {selectedCustomerObj.phone && <p>Telp/Kontak: {selectedCustomerObj.phone}</p>}
              </div>
            )}
          </div>

          {/* Date & Notes */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Tanggal SPH <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500/30 outline-none bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Perihal / Catatan Ringkas SPH
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Perkiraan Harga Pengadaan dan Pemasangan Atap..."
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500/30 outline-none bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
        </div>
      </BentoCard>

      {/* Grouped Kegiatan Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-500" />
              Kelompok Kegiatan & Rincian Item Pekerjaan
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Setiap kegiatan memiliki kelompok item dan subtotal masing-masing (TOTAL A, TOTAL B, dst).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                if (!selectedCustomerId) {
                  setErrorMsg('Pilih customer terlebih dahulu untuk menarik kegiatan proyek.');
                  return;
                }
                setIsImportKegiatanModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <FolderDown className="w-4 h-4" />
              <span>Tarik Kegiatan Proyek</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddKegiatan('')}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition shadow-xs active:scale-95"
            >
              <FolderPlus className="w-4 h-4 text-amber-500" />
              <span>Tambah Kelompok Kegiatan</span>
            </button>
          </div>
        </div>

        {kegiatanGroups.map((kg, kgIdx) => {
          const letterLabel = String.fromCharCode(65 + kgIdx); // A, B, C...
          const subtotalKg = calculateKegiatanSubtotal(kg);

          return (
            <BentoCard
              key={kg.tempId}
              className="overflow-hidden p-0 border border-slate-200/90 dark:border-blue-900/30"
            >
              {/* Kegiatan Header Bar */}
              <div className="bg-neu-surface dark:bg-slate-900 text-slate-900 dark:text-white p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neu-border dark:border-blue-900/40 shadow-neu-convex-xs">
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-neu-accent border border-white/30 mt-0.5 sm:mt-0">
                    {letterLabel}
                  </span>
                  <div className="flex-1 min-w-0 max-w-xl">
                    <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                      <label className="text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider block">
                        Nama Kegiatan {letterLabel} <span className="text-rose-500">*</span>
                      </label>
                      {kg.kegiatanCode && (
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900 truncate">
                          Terkait Proyek: {kg.kegiatanCode}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={kg.name}
                      onChange={(e) => handleKegiatanNameChange(kg.tempId, e.target.value)}
                      placeholder='Contoh: "Pembangunan Ruang Kelas Baru", "Perpustakaan", "Toilet"...'
                      className="w-full px-3 py-1.5 text-sm bg-neu-canvas dark:bg-slate-950/80 border border-neu-border dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold shadow-neu-inset-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">
                      Subtotal {letterLabel}
                    </span>
                    <span className="font-mono font-black text-sm text-blue-600 dark:text-amber-400">
                      {formatRupiah(subtotalKg)}
                    </span>
                  </div>

                  {kegiatanGroups.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveKegiatan(kg.tempId)}
                      title="Hapus kegiatan ini"
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Items Section for this Kegiatan: Dual-Mode (Mobile Card + Desktop Table) */}
              <div className="p-3.5 sm:p-5 space-y-4">
                {/* 1. MOBILE VIEW (< 640px): Card-based Item Editor */}
                <div className="block sm:hidden space-y-3">
                  {kg.items.map((it, itIdx) => {
                    const rowTotal = (Number(it.volume) || 0) * (Number(it.unitPrice) || 0);

                    return (
                      <div
                        key={it.tempId}
                        className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-xs relative"
                      >
                        {/* Card Header: Nomor Urut & Tombol Hapus */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-mono text-[11px] font-bold flex items-center justify-center">
                              {itIdx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                              Item Pekerjaan #{itIdx + 1}
                            </span>
                          </div>

                          {kg.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItemFromKegiatan(kg.tempId, it.tempId)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition"
                              title="Hapus baris item"
                            >
                              <Trash2 className="w-4 h-4 text-rose-500" />
                            </button>
                          )}
                        </div>

                        {/* Deskripsi / Uraian Material (Full Width Smart Input) */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                            Nama Pekerjaan / Material <span className="text-rose-500">*</span>
                          </label>
                          <ItemSmartInput
                            value={it.description}
                            onChange={(val) =>
                              handleItemFieldChange(kg.tempId, it.tempId, 'description', val)
                            }
                            onSelectMasterItem={(mItem) =>
                              handleSelectMasterItem(kg.tempId, it.tempId, mItem)
                            }
                            onCreateNewMasterItem={(typedQuery) => {
                              setTargetKegiatanTempId(kg.tempId);
                              setTargetItemTempId(it.tempId);
                              setPrefillItemName(typedQuery);
                              setIsAddItemModalOpen(true);
                            }}
                            masterItems={masterItems}
                            placeholder="Ketikan nama pekerjaan / material..."
                          />
                        </div>

                        {/* Volume, Satuan, Harga Satuan dalam Grid 12 Kolom */}
                        <div className="grid grid-cols-12 gap-2">
                          {/* Volume (4 cols) */}
                          <div className="col-span-4">
                            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 text-right">
                              Volume
                            </label>
                            <input
                              type="number"
                              step="any"
                              min="0.01"
                              value={it.volume}
                              onChange={(e) =>
                                handleItemFieldChange(kg.tempId, it.tempId, 'volume', Number(e.target.value))
                              }
                              className="w-full px-2 py-1.5 text-xs text-right border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500/30 outline-none font-mono bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100"
                            />
                          </div>

                          {/* Satuan (3 cols) */}
                          <div className="col-span-3">
                            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 text-center">
                              Satuan
                            </label>
                            <input
                              type="text"
                              value={it.unit}
                              onChange={(e) =>
                                handleItemFieldChange(kg.tempId, it.tempId, 'unit', e.target.value)
                              }
                              placeholder="m2"
                              className="w-full px-1.5 py-1.5 text-xs text-center border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500/30 outline-none uppercase font-bold bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100"
                            />
                          </div>

                          {/* Harga Satuan (5 cols) */}
                          <div className="col-span-5">
                            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 text-right">
                              Harga (Rp)
                            </label>
                            <input
                              type="number"
                              step="any"
                              min="0"
                              value={it.unitPrice}
                              onChange={(e) =>
                                handleItemFieldChange(kg.tempId, it.tempId, 'unitPrice', Number(e.target.value))
                              }
                              className="w-full px-2 py-1.5 text-xs text-right border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500/30 outline-none font-mono bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100"
                            />
                          </div>
                        </div>

                        {/* Subtotal Item Baris */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Subtotal Item:</span>
                          <span className="font-mono font-bold text-blue-600 dark:text-amber-400">
                            {formatRupiah(rowTotal)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 2. DESKTOP & TABLET VIEW (>= 640px): Tabular View */}
                <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        <th className="py-2.5 px-3 w-10 text-center">No</th>
                        <th className="py-2.5 px-3 min-w-[300px]">Nama Pekerjaan / Uraian Material</th>
                        <th className="py-2.5 px-3 w-28 text-right">Perkiraan Vol</th>
                        <th className="py-2.5 px-3 w-20 text-center">Satuan</th>
                        <th className="py-2.5 px-3 w-36 text-right">Harga Satuan (Rp)</th>
                        <th className="py-2.5 px-3 w-36 text-right">Subtotal</th>
                        <th className="py-2.5 px-3 w-12 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {kg.items.map((it, itIdx) => {
                        const rowTotal = (Number(it.volume) || 0) * (Number(it.unitPrice) || 0);

                        return (
                          <tr key={it.tempId} className="hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-2.5 px-3 text-center text-xs font-mono text-slate-400">
                              {itIdx + 1}
                            </td>

                            {/* Smart Input for Description & Master Search */}
                            <td className="py-2.5 px-3">
                              <ItemSmartInput
                                value={it.description}
                                onChange={(val) =>
                                  handleItemFieldChange(kg.tempId, it.tempId, 'description', val)
                                }
                                onSelectMasterItem={(mItem) =>
                                  handleSelectMasterItem(kg.tempId, it.tempId, mItem)
                                }
                                onCreateNewMasterItem={(typedQuery) => {
                                  setTargetKegiatanTempId(kg.tempId);
                                  setTargetItemTempId(it.tempId);
                                  setPrefillItemName(typedQuery);
                                  setIsAddItemModalOpen(true);
                                }}
                                masterItems={masterItems}
                                placeholder="Ketikan nama pekerjaan / material..."
                              />
                            </td>

                            {/* Volume */}
                            <td className="py-2.5 px-3">
                              <input
                                type="number"
                                step="any"
                                min="0.01"
                                value={it.volume}
                                onChange={(e) =>
                                  handleItemFieldChange(kg.tempId, it.tempId, 'volume', Number(e.target.value))
                                }
                                className="w-full px-2 py-1.5 text-sm text-right border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500/30 outline-none font-mono bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100"
                              />
                            </td>

                            {/* Unit */}
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={it.unit}
                                onChange={(e) =>
                                  handleItemFieldChange(kg.tempId, it.tempId, 'unit', e.target.value)
                                }
                                placeholder="m2"
                                className="w-full px-2 py-1.5 text-sm text-center border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500/30 outline-none uppercase font-bold text-xs bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100"
                              />
                            </td>

                            {/* Unit Price */}
                            <td className="py-2.5 px-3">
                              <input
                                type="number"
                                step="any"
                                min="0"
                                value={it.unitPrice}
                                onChange={(e) =>
                                  handleItemFieldChange(kg.tempId, it.tempId, 'unitPrice', Number(e.target.value))
                                }
                                className="w-full px-2 py-1.5 text-sm text-right border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500/30 outline-none font-mono bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100"
                              />
                            </td>

                            {/* Subtotal */}
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-100 text-xs">
                              {formatRupiah(rowTotal)}
                            </td>

                            {/* Delete Button */}
                            <td className="py-2.5 px-3 text-center">
                              {kg.items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItemFromKegiatan(kg.tempId, it.tempId)}
                                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition"
                                  title="Hapus baris item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Sub-Actions & Total for this Kegiatan */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddItemToKegiatan(kg.tempId)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-50/70 hover:bg-blue-100/70 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 text-xs font-bold rounded-xl transition shadow-xs active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah item untuk kegiatan ini</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 bg-white/60 dark:bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 w-full sm:w-auto">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">TOTAL {letterLabel} :</span>
                    <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                      {formatRupiah(subtotalKg)}
                    </span>
                  </div>
                </div>
              </div>
            </BentoCard>
          );
        })}
      </div>

      {/* Grand Total Summary Card */}
      <BentoCard className="bg-neu-surface dark:bg-slate-900 text-slate-900 dark:text-white p-4 sm:p-6 border border-neu-border dark:border-blue-900/40 shadow-neu-convex-md space-y-4">
        <div className="flex items-center gap-2 border-b border-neu-border dark:border-slate-800 pb-3">
          <Calculator className="w-5 h-5 text-blue-600 dark:text-brand-400 shrink-0" />
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Rekapitulasi Total Penawaran SPH
          </h3>
        </div>

        <div className="space-y-2 text-xs">
          {kegiatanGroups.map((kg, kgIdx) => {
            const letterLabel = String.fromCharCode(65 + kgIdx);
            const subtotalKg = calculateKegiatanSubtotal(kg);

            return (
              <div key={kg.tempId} className="flex justify-between items-center text-slate-600 dark:text-slate-300 gap-2">
                <span className="truncate">
                  TOTAL {letterLabel} ({kg.name || `Kegiatan ${letterLabel}`}) :
                </span>
                <span className="font-mono font-semibold shrink-0">{formatRupiah(subtotalKg)}</span>
              </div>
            );
          })}

          <div className="pt-3 border-t border-neu-border dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4">
            <span className="text-xs sm:text-base font-bold text-blue-600 dark:text-brand-300">
              TOTAL KESELURUHAN (A s/d {String.fromCharCode(65 + kegiatanGroups.length - 1)}) :
            </span>
            <span className="font-mono text-xl sm:text-2xl font-black text-blue-600 dark:text-amber-400 text-left sm:text-right">
              {formatRupiah(grandTotalAmount)}
            </span>
          </div>
        </div>
      </BentoCard>

      {/* Terms & Conditions */}
      <BentoCard className="p-4 sm:p-6 space-y-3">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Syarat & Ketentuan Penawaran
        </label>
        <textarea
          rows={4}
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          placeholder="Tuliskan termin pembayaran, masa garansi, dsb..."
          className="w-full p-3.5 text-sm border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500/30 outline-none bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 font-sans"
        />
      </BentoCard>

      {/* Floating Bottom Action Bar */}
      <div className="bento-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 sticky bottom-3 sm:bottom-4 shadow-bento dark:shadow-bento-dark z-20">
        <div className="flex items-center justify-between sm:block">
          <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 block font-medium">Total Nilai Penawaran</span>
          <span className="font-mono font-black text-base sm:text-lg text-slate-900 dark:text-white">{formatRupiah(grandTotalAmount)}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
            className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl transition shadow-xs text-center"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/25 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan SPH' : 'Terbitkan SPH'}</span>
          </button>
        </div>
      </div>
    </form>

      {/* Quick Add Master Item Modal */}
      <ItemCatalogModal
        isOpen={isAddItemModalOpen}
        isLoading={isSubmittingItem}
        onClose={() => {
          setIsAddItemModalOpen(false);
          setTargetKegiatanTempId(null);
          setTargetItemTempId(null);
          setPrefillItemName('');
        }}
        onSubmit={handleCreateMasterItemSubmit}
        categories={categories}
        initialName={prefillItemName}
      />

      {/* Import Kegiatan Modal */}
      {selectedCustomerId && (
        <ImportKegiatanModal
          isOpen={isImportKegiatanModalOpen}
          onClose={() => setIsImportKegiatanModalOpen(false)}
          customerId={Number(selectedCustomerId)}
          customerName={selectedCustomerObj?.name}
          onSelectKegiatan={handleSelectImportKegiatan}
        />
      )}

      {/* Quick Add Customer Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        isLoading={isSubmittingCustomer}
        onClose={() => {
          setIsCustomerModalOpen(false);
          setPrefillCustomerName('');
        }}
        onSubmit={handleCreateCustomerSubmit}
        initialName={prefillCustomerName}
      />
    </div>
  );
};

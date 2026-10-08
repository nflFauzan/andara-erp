export type PenawaranStatus = 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface PenawaranDetail {
  id: number;
  penawaranId: number;
  sphKegiatanId?: number;
  sphKegiatanName?: string;
  itemCatalogId?: number;
  itemCatalogCode?: string;
  kegiatanId?: number;
  kegiatanName?: string;
  kegiatanItemId?: number;
  description: string;
  volume: number;
  unit: string;
  unitPrice: number;
  amount: number;
  sortOrder: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SphKegiatan {
  id: number;
  penawaranId: number;
  kegiatanId?: number;
  kegiatanCode?: string;
  name: string;
  sortOrder: number;
  subtotal: number;
  items: PenawaranDetail[];
}

export interface Penawaran {
  id: number;
  number: string;
  customerId: number;
  customerCode: string;
  customerName: string;
  date: string;
  status: PenawaranStatus;
  statusLabel: string;
  parentPenawaranId?: number;
  parentPenawaranNumber?: string;
  isAddendum?: boolean;
  addendumNumberIndex?: number;
  notes?: string;
  terms?: string;
  totalAmount: number;
  cumulativeTotalAmount?: number;
  itemCount: number;
  kegiatanCount?: number;
  details: PenawaranDetail[];
  kegiatanList?: SphKegiatan[];
  addendums?: Penawaran[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreatePenawaranDetailInput {
  itemCatalogId?: number;
  sphKegiatanId?: number;
  kegiatanId?: number;
  kegiatanItemId?: number;
  description: string;
  volume: number;
  unit: string;
  unitPrice: number;
  sortOrder?: number;
  notes?: string;
}

export interface CreateSphKegiatanInput {
  id?: number;
  kegiatanId?: number;
  name: string;
  sortOrder?: number;
  items: CreatePenawaranDetailInput[];
}

export interface CreatePenawaranInput {
  customerId: number;
  parentPenawaranId?: number;
  isAddendum?: boolean;
  addendumNumberIndex?: number;
  number?: string;
  date?: string;
  notes?: string;
  terms?: string;
  items?: CreatePenawaranDetailInput[];
  kegiatan?: CreateSphKegiatanInput[];
}

export interface UpdatePenawaranInput {
  customerId: number;
  date?: string;
  notes?: string;
  terms?: string;
  items?: CreatePenawaranDetailInput[];
  kegiatan?: CreateSphKegiatanInput[];
}

export interface UpdatePenawaranStatusInput {
  status: PenawaranStatus;
  notes?: string;
}

export interface PenawaranQueryParams {
  search?: string;
  customerId?: number;
  status?: PenawaranStatus;
  isAddendum?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'ASC' | 'DESC';
}

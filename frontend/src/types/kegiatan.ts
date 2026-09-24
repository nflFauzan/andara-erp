export type KegiatanStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CLOSED' | 'CANCELLED';

export interface KegiatanItem {
  id: number;
  kegiatanId: number;
  description: string;
  volume: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
  sortOrder: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface KegiatanItemInput {
  description: string;
  volume: number;
  unit: string;
  unitPrice: number;
  sortOrder?: number;
  notes?: string;
}

export interface Kegiatan {
  id: number;
  code: string;
  name: string;
  customerId: number;
  customerCode: string;
  customerName: string;
  customerCompanyName?: string | null;
  location?: string | null;
  description?: string | null;
  notes?: string | null;
  status: KegiatanStatus;
  totalAmount: number;
  itemsCount: number;
  items?: KegiatanItem[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface CreateKegiatanInput {
  customerId: number;
  code: string;
  name: string;
  location?: string;
  description?: string;
  notes?: string;
  status?: KegiatanStatus;
  items?: KegiatanItemInput[];
}

export interface UpdateKegiatanInput {
  customerId: number;
  name: string;
  location?: string;
  description?: string;
  notes?: string;
  status: KegiatanStatus;
}

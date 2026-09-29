export interface ItemCatalog {
  id: number;
  code: string;
  name: string;
  defaultUnit: string;
  defaultPrice: number;
  category?: string | null;
  description?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface CreateItemCatalogInput {
  code?: string;
  name: string;
  defaultUnit: string;
  defaultPrice: number;
  category?: string;
  description?: string;
}

export interface UpdateItemCatalogInput extends CreateItemCatalogInput {
  active?: boolean;
}

export interface ItemCatalogQueryParams {
  search?: string;
  category?: string;
  active?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'ASC' | 'DESC';
}

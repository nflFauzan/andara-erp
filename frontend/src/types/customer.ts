export interface Customer {
  id: number;
  code: string;
  name: string;
  companyName?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  picName?: string | null;
  notes?: string | null;
  depositBalance: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface CreateCustomerInput {
  code: string;
  name: string;
  companyName?: string;
  address?: string;
  phone?: string;
  email?: string;
  picName?: string;
  notes?: string;
}

export interface UpdateCustomerInput extends CreateCustomerInput {
  active?: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

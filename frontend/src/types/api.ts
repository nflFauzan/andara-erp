export type Role = 'OPERATOR' | 'ADMIN';

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: Role;
  isActive: boolean;
}

export interface ErrorDetail {
  field: string;
  message: string;
  rejectedValue?: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  errors?: ErrorDetail[];
  timestamp?: string;
}

export interface SystemHealth {
  status: string;
  application: string;
  profile: string;
  timestamp: string;
  system: string;
}

export type Role = 'OPERATOR' | 'ADMIN';

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: Role;
  active: boolean;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

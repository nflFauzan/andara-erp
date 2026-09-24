import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';
import { User, AuthContextType } from '@/types/auth';
import { ApiResponse } from '@/types/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.get<ApiResponse<User>>('/auth/me');
        if (response.data.success && response.data.data) {
          setUser(response.data.data);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (username: string, password: string) => {
    const response = await api.post<ApiResponse<User>>('/auth/login', { username, password });
    if (response.data.success && response.data.data) {
      setUser(response.data.data);
    } else {
      throw new Error(response.data.message || 'Login gagal');
    }
  };

  const logout = async () => {
    try {
      await api.post<ApiResponse<void>>('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types/auth';
import { Building2, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white shadow-xl shadow-brand-500/30 animate-pulse">
            <Building2 className="w-7 h-7" />
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
            <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
            <span>Memeriksa sesi pengguna...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-white rounded-2xl border border-rose-100 shadow-sm text-center space-y-3">
        <h2 className="text-lg font-bold text-rose-600">Akses Ditolak (403 Forbidden)</h2>
        <p className="text-sm text-slate-600">
          Peran Anda ({user.role}) tidak memiliki izin untuk mengakses halaman atau fungsi transaksi ini.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

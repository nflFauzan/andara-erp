import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { StatusPage } from '@/pages/StatusPage';
import { CustomerListPage } from '@/pages/CustomerListPage';
import { CustomerDetailPage } from '@/pages/CustomerDetailPage';
import { KegiatanListPage } from '@/pages/KegiatanListPage';
import { KegiatanDetailPage } from '@/pages/KegiatanDetailPage';
import { NumberingPage } from '@/pages/NumberingPage';
import { PenawaranListPage } from '@/pages/PenawaranListPage';
import { PenawaranFormPage } from '@/pages/PenawaranFormPage';
import { PenawaranDetailPage } from '@/pages/PenawaranDetailPage';
import { InvoiceListPage } from '@/pages/InvoiceListPage';
import { InvoiceFormPage } from '@/pages/InvoiceFormPage';
import { InvoiceDetailPage } from '@/pages/InvoiceDetailPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="status" element={<StatusPage />} />
              {/* Module routes */}
              <Route path="customers" element={<CustomerListPage />} />
              <Route path="customers/:id" element={<CustomerDetailPage />} />
              <Route path="kegiatan" element={<KegiatanListPage />} />
              <Route path="kegiatan/:id" element={<KegiatanDetailPage />} />
              <Route path="numbering" element={<NumberingPage />} />
              <Route path="penawaran" element={<PenawaranListPage />} />
              <Route path="penawaran/create" element={<PenawaranFormPage />} />
              <Route path="penawaran/:id" element={<PenawaranDetailPage />} />
              <Route path="penawaran/:id/edit" element={<PenawaranFormPage />} />
              <Route path="faktur" element={<InvoiceListPage />} />
              <Route path="faktur/create" element={<InvoiceFormPage />} />
              <Route path="faktur/:id" element={<InvoiceDetailPage />} />
              <Route path="faktur/:id/edit" element={<InvoiceFormPage />} />
              <Route path="pembayaran" element={<div className="p-8 text-slate-500 font-medium bg-white rounded-xl border border-slate-200">Modul Pembayaran & Alokasi / Deposit (Tahap Fase 7-8)</div>} />
              <Route path="kwitansi" element={<div className="p-8 text-slate-500 font-medium bg-white rounded-xl border border-slate-200">Modul Kwitansi / Receipt (Tahap Fase 9)</div>} />
              <Route path="rekap" element={<div className="p-8 text-slate-500 font-medium bg-white rounded-xl border border-slate-200">Modul Rekap & Laporan Keuangan (Tahap Fase 11)</div>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { StatusPage } from '@/pages/StatusPage';

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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="status" element={<StatusPage />} />
            {/* Module routes ready for Phase 2 - 11 */}
            <Route path="customers" element={<div className="p-8 text-slate-500 font-medium bg-white rounded-xl border border-slate-200">Modul Master Customer (Tahap Fase 2)</div>} />
            <Route path="kegiatan" element={<div className="p-8 text-slate-500 font-medium bg-white rounded-xl border border-slate-200">Modul Kegiatan & Item Kegiatan (Tahap Fase 3)</div>} />
            <Route path="penawaran" element={<div className="p-8 text-slate-500 font-medium bg-white rounded-xl border border-slate-200">Modul Penawaran / Quotation (Tahap Fase 5)</div>} />
            <Route path="faktur" element={<div className="p-8 text-slate-500 font-medium bg-white rounded-xl border border-slate-200">Modul Faktur Penjualan / Invoicing (Tahap Fase 6)</div>} />
            <Route path="pembayaran" element={<div className="p-8 text-slate-500 font-medium bg-white rounded-xl border border-slate-200">Modul Pembayaran & Alokasi / Deposit (Tahap Fase 7-8)</div>} />
            <Route path="kwitansi" element={<div className="p-8 text-slate-500 font-medium bg-white rounded-xl border border-slate-200">Modul Kwitansi / Receipt (Tahap Fase 9)</div>} />
            <Route path="rekap" element={<div className="p-8 text-slate-500 font-medium bg-white rounded-xl border border-slate-200">Modul Rekap & Laporan Keuangan (Tahap Fase 11)</div>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { ApiResponse, SystemHealth } from '@/types/api';
import { CheckCircle2, AlertCircle, RefreshCw, Server } from 'lucide-react';
import { BentoCard } from '@/components/common/BentoCard';
import { PageHeader } from '@/components/common/PageHeader';

export const StatusPage: React.FC = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<ApiResponse<SystemHealth>>({
    queryKey: ['system-health'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<SystemHealth>>('/health');
      return res.data;
    },
    retry: 1,
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <PageHeader
        title="Status Koneksi & Backend Health"
        subtitle="Verifikasi komunikasi REST API frontend ke Spring Boot backend dan PostgreSQL"
        icon={Server}
        badge={
          <span className="neu-badge">
            <Server className="w-3.5 h-3.5" />
            Infrastruktur
          </span>
        }
        actions={
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="neu-btn"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-brand-500' : ''}`} />
            <span>Periksa Ulang</span>
          </button>
        }
      />

      <BentoCard padding="default" className="space-y-6">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-neu-canvas border border-neu-border/60 shadow-neu-inset-xs">
          <div className="w-12 h-12 rounded-xl bg-neu-surface border border-neu-border flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-neu-convex-xs">
            <Server className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-slate-900 dark:text-slate-100">Spring Boot REST API</h2>
              {isLoading ? (
                <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">Memeriksa...</span>
              ) : isError ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/30 shadow-neu-convex-xs">
                  <AlertCircle className="w-3.5 h-3.5" /> Terputus / Offline
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 shadow-neu-convex-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Terhubung (UP)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Endpoint: <code className="bg-neu-surface shadow-neu-convex-xs border border-neu-border/60 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300 font-bold">GET /api/health</code></p>
          </div>
        </div>

        {/* Detailed Response */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Payload Respons Server:</label>
          <pre className="p-4 rounded-xl bg-neu-canvas text-slate-800 dark:text-slate-100 text-xs font-mono overflow-x-auto border border-neu-border/60 shadow-neu-inset-sm">
            {isLoading 
              ? '// Menghubungi backend...' 
              : isError 
                ? JSON.stringify({ error: (error as Error)?.message || 'Koneksi gagal ke http://localhost:8080' }, null, 2)
                : JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </BentoCard>
    </div>
  );
};
export default StatusPage;

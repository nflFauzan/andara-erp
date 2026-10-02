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
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Status Koneksi & Backend Health"
        subtitle="Verifikasi komunikasi REST API frontend ke Spring Boot backend dan PostgreSQL"
        badge={
          <span className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
            <Server className="w-3.5 h-3.5" />
            Infrastruktur
          </span>
        }
        actions={
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold transition disabled:opacity-50 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Periksa Ulang
          </button>
        }
      />

      <BentoCard padding="default" className="space-y-6">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-navy-950/50 border border-slate-100 dark:border-navy-800">
          <div className="w-12 h-12 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-xs">
            <Server className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Spring Boot REST API</h2>
              {isLoading ? (
                <span className="text-xs text-slate-400 dark:text-slate-500">Memeriksa...</span>
              ) : isError ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800/60">
                  <AlertCircle className="w-3.5 h-3.5" /> Terputus / Offline
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Terhubung (UP)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Endpoint: <code className="bg-slate-200/60 dark:bg-navy-800 px-1 py-0.5 rounded text-slate-700 dark:text-slate-300">GET /api/health</code></p>
          </div>
        </div>

        {/* Detailed Response */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Payload Respons Server:</label>
          <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto border border-slate-800 dark:border-navy-800">
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

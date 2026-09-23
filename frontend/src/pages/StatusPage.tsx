import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { ApiResponse, SystemHealth } from '@/types/api';
import { CheckCircle2, AlertCircle, RefreshCw, Server } from 'lucide-react';

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Status Koneksi & Backend Health</h1>
          <p className="text-xs text-slate-500 mt-1">Verifikasi komunikasi REST API frontend ke Spring Boot backend</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Periksa Ulang
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm">
            <Server className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900">Spring Boot REST API</h2>
              {isLoading ? (
                <span className="text-xs text-slate-400">Memeriksa...</span>
              ) : isError ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5" /> Terputus / Offline
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Terhubung (UP)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Endpoint: <code className="bg-slate-200/60 px-1 py-0.5 rounded text-slate-700">GET /api/health</code></p>
          </div>
        </div>

        {/* Detailed Response */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Payload Respons Server:</label>
          <pre className="p-4 rounded-lg bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto border border-slate-800">
            {isLoading 
              ? '// Menghubungi backend...' 
              : isError 
                ? JSON.stringify({ error: (error as Error)?.message || 'Koneksi gagal ke http://localhost:8080' }, null, 2)
                : JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

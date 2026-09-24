import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, History, User, Clock } from 'lucide-react';
import { auditLogApi } from '@/api/auditLogApi';
import { formatDateTime } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';

interface AuditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: string;
  entityId: number;
  title?: string;
}

export const AuditHistoryModal: React.FC<AuditHistoryModalProps> = ({
  isOpen,
  onClose,
  entityType,
  entityId,
  title = 'Riwayat Perubahan & Audit Trail',
}) => {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['auditLogs', entityType, entityId],
    queryFn: () => auditLogApi.getAuditLogsForEntity(entityType, entityId),
    enabled: isOpen && !!entityId,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">{title}</h3>
              <p className="text-[11px] text-slate-400">
                Entitas: <span className="font-semibold text-slate-600">{entityType} #{entityId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {isLoading ? (
            <LoadingSkeleton rows={4} />
          ) : logs.length === 0 ? (
            <EmptyState
              icon={History}
              title="Belum Ada Catatan Audit"
              description="Aktivitas dan mutasi transaksi ini belum tercatat dalam audit log sistem."
            />
          ) : (
            <div className="relative border-l-2 border-slate-100 ml-4 space-y-6 py-2">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-6">
                  {/* Timeline bullet */}
                  <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-brand-500 shadow-sm" />

                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-700 uppercase tracking-wider">
                        {log.action}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDateTime(log.createdAt)}</span>
                      </div>
                    </div>

                    {log.afterData && (
                      <p className="text-xs font-medium text-slate-700">
                        {log.afterData}
                      </p>
                    )}

                    {log.beforeData && (
                      <p className="text-[11px] text-slate-400 italic">
                        Sebelumnya: {log.beforeData}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200/50 text-[11px] text-slate-500">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{log.actorFullName || log.actorUsername || 'Sistem'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

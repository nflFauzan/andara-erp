import api from '../lib/axios';
import { ApiResponse } from '../types/api';
import { PageResponse } from '../types/customer';
import { AuditLogItem, AuditLogQueryParams } from '../types/audit';

export const auditLogApi = {
  async getAuditLogs(params: AuditLogQueryParams = {}): Promise<PageResponse<AuditLogItem>> {
    const queryParams: Record<string, any> = {};
    if (params.entityType) queryParams.entityType = params.entityType;
    if (params.action) queryParams.action = params.action;
    if (params.actorUserId) queryParams.actorUserId = params.actorUserId;
    if (params.startDate) queryParams.startDate = params.startDate;
    if (params.endDate) queryParams.endDate = params.endDate;
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.size !== undefined) queryParams.size = params.size;

    const response = await api.get<ApiResponse<PageResponse<AuditLogItem>>>('/audit-logs', {
      params: queryParams,
    });
    return response.data.data!;
  },

  async getAuditLogsForEntity(entityType: string, entityId: number): Promise<AuditLogItem[]> {
    const response = await api.get<ApiResponse<AuditLogItem[]>>(`/audit-logs/entity/${entityType}/${entityId}`);
    return response.data.data!;
  },
};

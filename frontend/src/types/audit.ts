export interface AuditLogItem {
  id: number;
  actorUserId?: number;
  actorUsername?: string;
  actorFullName?: string;
  action: string;
  entityType: string;
  entityId: number;
  beforeData?: string;
  afterData?: string;
  createdAt: string;
  requestId?: string;
}

export interface AuditLogQueryParams {
  entityType?: string;
  action?: string;
  actorUserId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

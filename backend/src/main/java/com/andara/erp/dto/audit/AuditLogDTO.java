package com.andara.erp.dto.audit;

import com.andara.erp.entity.AuditLog;
import java.time.OffsetDateTime;

public class AuditLogDTO {

    private Long id;
    private Long actorUserId;
    private String actorUsername;
    private String actorFullName;
    private String action;
    private String entityType;
    private String entityId;
    private String beforeData;
    private String afterData;
    private OffsetDateTime createdAt;
    private String requestId;

    public AuditLogDTO() {
    }

    public static AuditLogDTO fromEntity(AuditLog auditLog) {
        if (auditLog == null) return null;
        AuditLogDTO dto = new AuditLogDTO();
        dto.setId(auditLog.getId());
        if (auditLog.getActorUser() != null) {
            dto.setActorUserId(auditLog.getActorUser().getId());
            dto.setActorUsername(auditLog.getActorUser().getUsername());
            dto.setActorFullName(auditLog.getActorUser().getFullName());
        } else if (auditLog.getUsername() != null) {
            dto.setActorUsername(auditLog.getUsername());
        }
        dto.setAction(auditLog.getAction());
        dto.setEntityType(auditLog.getEntityType());
        dto.setEntityId(auditLog.getEntityId());
        dto.setBeforeData(auditLog.getBeforeData());
        dto.setAfterData(auditLog.getAfterData());
        dto.setCreatedAt(auditLog.getCreatedAt());
        dto.setRequestId(auditLog.getRequestId());
        return dto;
    }

    // Getters & Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getActorUserId() {
        return actorUserId;
    }

    public void setActorUserId(Long actorUserId) {
        this.actorUserId = actorUserId;
    }

    public String getActorUsername() {
        return actorUsername;
    }

    public void setActorUsername(String actorUsername) {
        this.actorUsername = actorUsername;
    }

    public String getActorFullName() {
        return actorFullName;
    }

    public void setActorFullName(String actorFullName) {
        this.actorFullName = actorFullName;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public String getBeforeData() {
        return beforeData;
    }

    public void setBeforeData(String beforeData) {
        this.beforeData = beforeData;
    }

    public String getAfterData() {
        return afterData;
    }

    public void setAfterData(String afterData) {
        this.afterData = afterData;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }
}

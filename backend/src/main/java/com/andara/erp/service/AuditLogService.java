package com.andara.erp.service;

import com.andara.erp.dto.audit.AuditLogDTO;
import com.andara.erp.entity.AuditLog;
import com.andara.erp.entity.User;
import com.andara.erp.repository.AuditLogRepository;
import com.andara.erp.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogService.class);

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditLogService(AuditLogRepository auditLogRepository, UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public AuditLog log(String action, String entityType, Long entityId, String beforeData, String afterData) {
        return log(action, entityType, entityId != null ? String.valueOf(entityId) : null, beforeData, afterData, null);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public AuditLog log(String action, String entityType, String entityId, String beforeData, String afterData, String requestId) {
        try {
            User actorUser = getCurrentUser().orElse(null);

            AuditLog auditLog = new AuditLog(
                    actorUser,
                    action,
                    entityType,
                    entityId,
                    beforeData,
                    afterData,
                    requestId
            );

            AuditLog saved = auditLogRepository.save(auditLog);
            log.info("Audit log recorded: id={}, action={}, entityType={}, entityId={}, actor={}",
                    saved.getId(), action, entityType, entityId, actorUser != null ? actorUser.getUsername() : "SYSTEM");
            return saved;
        } catch (Exception e) {
            log.error("Failed to write audit log: action={}, entityType={}, entityId={}", action, entityType, entityId, e);
            return null;
        }
    }

    @Transactional(readOnly = true)
    public List<AuditLogDTO> getAuditLogsForEntity(String entityType, String entityId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId)
                .stream()
                .map(AuditLogDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuditLogDTO> getAuditLogsForEntity(String entityType, Long entityId) {
        return getAuditLogsForEntity(entityType, String.valueOf(entityId));
    }

    @Transactional(readOnly = true)
    public Page<AuditLogDTO> getAuditLogs(
            String entityType,
            String action,
            Long actorUserId,
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable
    ) {
        OffsetDateTime start = (startDate != null)
                ? startDate.atStartOfDay().atOffset(ZoneOffset.UTC)
                : LocalDate.of(2000, 1, 1).atStartOfDay().atOffset(ZoneOffset.UTC);

        OffsetDateTime end = (endDate != null)
                ? endDate.atTime(LocalTime.MAX).atOffset(ZoneOffset.UTC)
                : LocalDate.of(2099, 12, 31).atTime(LocalTime.MAX).atOffset(ZoneOffset.UTC);

        return auditLogRepository.findAuditLogsWithFilter(entityType, action, actorUserId, start, end, pageable)
                .map(AuditLogDTO::fromEntity);
    }

    private Optional<User> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return Optional.empty();
        }
        String username = auth.getName();
        return userRepository.findByUsername(username);
    }
}

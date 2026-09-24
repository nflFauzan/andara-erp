package com.andara.erp.controller;

import com.andara.erp.common.dto.ApiResponse;
import com.andara.erp.dto.audit.AuditLogDTO;
import com.andara.erp.service.AuditLogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
public class AuditLogController {

    private static final Logger log = LoggerFactory.getLogger(AuditLogController.class);

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AuditLogDTO>>> getAuditLogs(
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) Long actorUserId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        log.info("REST request to get audit logs: entityType={}, action={}, actorUserId={}, startDate={}, endDate={}",
                entityType, action, actorUserId, startDate, endDate);

        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLogDTO> result = auditLogService.getAuditLogs(
                entityType, action, actorUserId, startDate, endDate, pageable
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<ApiResponse<List<AuditLogDTO>>> getAuditLogsForEntity(
            @PathVariable String entityType,
            @PathVariable String entityId
    ) {
        log.info("REST request to get audit logs for entity: type={}, id={}", entityType, entityId);
        List<AuditLogDTO> result = auditLogService.getAuditLogsForEntity(entityType, entityId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}

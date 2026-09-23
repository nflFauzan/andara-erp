package com.andara.erp.controller;

import com.andara.erp.common.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @Value("${spring.application.name:andara-erp-backend}")
    private String applicationName;

    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    @GetMapping
    public ApiResponse<Map<String, Object>> getHealth() {
        Map<String, Object> healthInfo = Map.of(
                "status", "UP",
                "application", applicationName,
                "profile", activeProfile,
                "timestamp", LocalDateTime.now().toString(),
                "system", "Sistem Manajemen Keuangan & Operasional CV. ANDARA"
        );
        return ApiResponse.success(healthInfo, "Sistem beroperasi normal");
    }
}

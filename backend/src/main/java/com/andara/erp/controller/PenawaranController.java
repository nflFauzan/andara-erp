package com.andara.erp.controller;

import com.andara.erp.common.dto.ApiResponse;
import com.andara.erp.dto.penawaran.*;
import com.andara.erp.entity.PenawaranStatus;
import com.andara.erp.service.PenawaranService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/penawaran")
public class PenawaranController {

    private final PenawaranService penawaranService;

    public PenawaranController(PenawaranService penawaranService) {
        this.penawaranService = penawaranService;
    }

    @GetMapping
    public ApiResponse<Page<PenawaranDTO>> getPenawaranList(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) PenawaranStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<PenawaranDTO> result = penawaranService.getPenawaranList(search, customerId, status, startDate, endDate, pageable);
        return ApiResponse.success(result);
    }

    @GetMapping("/{id}")
    public ApiResponse<PenawaranDTO> getPenawaranById(@PathVariable Long id) {
        PenawaranDTO dto = penawaranService.getPenawaranById(id);
        return ApiResponse.success(dto);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PenawaranDTO>> createPenawaran(
            @Valid @RequestBody CreatePenawaranRequest request
    ) {
        PenawaranDTO created = penawaranService.createPenawaran(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Penawaran berhasil dibuat"));
    }

    @PutMapping("/{id}")
    public ApiResponse<PenawaranDTO> updatePenawaran(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePenawaranRequest request
    ) {
        PenawaranDTO updated = penawaranService.updatePenawaran(id, request);
        return ApiResponse.success(updated, "Penawaran berhasil diperbarui");
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<PenawaranDTO> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePenawaranStatusRequest request
    ) {
        PenawaranDTO updated = penawaranService.updateStatus(id, request);
        return ApiResponse.success(updated, "Status penawaran berhasil diubah menjadi " + updated.getStatus());
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deletePenawaran(@PathVariable Long id) {
        penawaranService.deletePenawaran(id);
        return ApiResponse.success(null, "Penawaran berhasil dihapus");
    }
}

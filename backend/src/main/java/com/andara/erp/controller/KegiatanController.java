package com.andara.erp.controller;

import com.andara.erp.common.dto.ApiResponse;
import com.andara.erp.dto.kegiatan.*;
import com.andara.erp.entity.KegiatanStatus;
import com.andara.erp.service.KegiatanService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kegiatan")
public class KegiatanController {

    private final KegiatanService kegiatanService;

    public KegiatanController(KegiatanService kegiatanService) {
        this.kegiatanService = kegiatanService;
    }

    @GetMapping
    public ApiResponse<Page<KegiatanDTO>> getKegiatan(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) KegiatanStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<KegiatanDTO> result = kegiatanService.getKegiatan(search, customerId, status, pageable);
        return ApiResponse.success(result);
    }

    @GetMapping("/{id}")
    public ApiResponse<KegiatanDTO> getKegiatanById(@PathVariable Long id) {
        KegiatanDTO dto = kegiatanService.getKegiatanById(id);
        return ApiResponse.success(dto);
    }

    @GetMapping("/customer/{customerId}")
    public ApiResponse<List<KegiatanDTO>> getKegiatanByCustomer(@PathVariable Long customerId) {
        List<KegiatanDTO> list = kegiatanService.getKegiatanByCustomer(customerId);
        return ApiResponse.success(list);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<KegiatanDTO>> createKegiatan(
            @Valid @RequestBody CreateKegiatanRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "system";
        KegiatanDTO created = kegiatanService.createKegiatan(request, username);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Kegiatan berhasil dibuat"));
    }

    @PutMapping("/{id}")
    public ApiResponse<KegiatanDTO> updateKegiatan(
            @PathVariable Long id,
            @Valid @RequestBody UpdateKegiatanRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "system";
        KegiatanDTO updated = kegiatanService.updateKegiatan(id, request, username);
        return ApiResponse.success(updated, "Data kegiatan berhasil diperbarui");
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<KegiatanDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam KegiatanStatus status,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "system";
        KegiatanDTO updated = kegiatanService.updateStatus(id, status, username);
        return ApiResponse.success(updated, "Status kegiatan berhasil diubah menjadi " + status);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteKegiatan(@PathVariable Long id) {
        kegiatanService.deleteKegiatan(id);
        return ApiResponse.success(null, "Kegiatan berhasil dihapus");
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<ApiResponse<KegiatanItemDTO>> addItem(
            @PathVariable Long id,
            @Valid @RequestBody KegiatanItemRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "system";
        KegiatanItemDTO item = kegiatanService.addItem(id, request, username);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(item, "Item kegiatan berhasil ditambahkan"));
    }

    @PutMapping("/{id}/items/{itemId}")
    public ApiResponse<KegiatanItemDTO> updateItem(
            @PathVariable Long id,
            @PathVariable Long itemId,
            @Valid @RequestBody KegiatanItemRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "system";
        KegiatanItemDTO item = kegiatanService.updateItem(id, itemId, request, username);
        return ApiResponse.success(item, "Item kegiatan berhasil diperbarui");
    }

    @DeleteMapping("/{id}/items/{itemId}")
    public ApiResponse<Void> deleteItem(
            @PathVariable Long id,
            @PathVariable Long itemId,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "system";
        kegiatanService.deleteItem(id, itemId, username);
        return ApiResponse.success(null, "Item kegiatan berhasil dihapus");
    }
}

package com.andara.erp.controller;

import com.andara.erp.common.dto.ApiResponse;
import com.andara.erp.dto.receipt.CreateReceiptRequest;
import com.andara.erp.dto.receipt.ReceiptDTO;
import com.andara.erp.entity.ReceiptStatus;
import com.andara.erp.service.ReceiptService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/kwitansi")
public class ReceiptController {

    private final ReceiptService receiptService;

    public ReceiptController(ReceiptService receiptService) {
        this.receiptService = receiptService;
    }

    @GetMapping
    public ApiResponse<Page<ReceiptDTO>> getReceiptList(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) ReceiptStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "date") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ReceiptDTO> result = receiptService.getReceiptList(search, customerId, status, startDate, endDate, pageable);
        return ApiResponse.success(result);
    }

    @GetMapping("/{id}")
    public ApiResponse<ReceiptDTO> getReceiptById(@PathVariable Long id) {
        ReceiptDTO dto = receiptService.getReceiptById(id);
        return ApiResponse.success(dto);
    }

    @GetMapping("/payment/{paymentId}")
    public ApiResponse<ReceiptDTO> getReceiptByPaymentId(@PathVariable Long paymentId) {
        ReceiptDTO dto = receiptService.getReceiptByPaymentId(paymentId);
        return ApiResponse.success(dto);
    }

    @PostMapping
    @PreAuthorize("hasRole('OPERATOR')")
    public ResponseEntity<ApiResponse<ReceiptDTO>> generateReceipt(
            @Valid @RequestBody CreateReceiptRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "operator";
        ReceiptDTO created = receiptService.generateReceipt(request, username);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Kwitansi berhasil diterbitkan"));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('OPERATOR')")
    public ApiResponse<ReceiptDTO> cancelReceipt(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "operator";
        ReceiptDTO cancelled = receiptService.cancelReceipt(id, username);
        return ApiResponse.success(cancelled, "Kwitansi berhasil dibatalkan");
    }
}

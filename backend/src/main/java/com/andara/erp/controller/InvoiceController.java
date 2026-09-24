package com.andara.erp.controller;

import com.andara.erp.common.dto.ApiResponse;
import com.andara.erp.dto.invoice.*;
import com.andara.erp.entity.InvoicePaymentStatus;
import com.andara.erp.entity.InvoiceStatus;
import com.andara.erp.service.InvoiceService;
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
import java.util.List;

@RestController
@RequestMapping("/api/faktur")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping
    public ApiResponse<Page<InvoiceDTO>> getInvoiceList(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) InvoiceStatus status,
            @RequestParam(required = false) InvoicePaymentStatus paymentStatus,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<InvoiceDTO> result = invoiceService.getInvoiceList(search, customerId, status, paymentStatus, startDate, endDate, pageable);
        return ApiResponse.success(result);
    }

    @GetMapping("/{id}")
    public ApiResponse<InvoiceDTO> getInvoiceById(@PathVariable Long id) {
        InvoiceDTO dto = invoiceService.getInvoiceById(id);
        return ApiResponse.success(dto);
    }

    @GetMapping("/penawaran/{penawaranId}/billable")
    public ApiResponse<List<PenawaranBillableItemDTO>> getBillableItemsFromPenawaran(@PathVariable Long penawaranId) {
        List<PenawaranBillableItemDTO> items = invoiceService.getBillableItemsFromPenawaran(penawaranId);
        return ApiResponse.success(items);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InvoiceDTO>> createInvoice(
            @Valid @RequestBody CreateInvoiceRequest request
    ) {
        InvoiceDTO created = invoiceService.createInvoice(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Faktur penjualan berhasil dibuat"));
    }

    @PutMapping("/{id}")
    public ApiResponse<InvoiceDTO> updateInvoice(
            @PathVariable Long id,
            @Valid @RequestBody UpdateInvoiceRequest request
    ) {
        InvoiceDTO updated = invoiceService.updateInvoice(id, request);
        return ApiResponse.success(updated, "Faktur penjualan berhasil diperbarui");
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<InvoiceDTO> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateInvoiceStatusRequest request
    ) {
        InvoiceDTO updated = invoiceService.updateStatus(id, request);
        return ApiResponse.success(updated, "Status faktur berhasil diubah menjadi " + updated.getStatus());
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        return ApiResponse.success(null, "Faktur penjualan berhasil dihapus");
    }
}

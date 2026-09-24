package com.andara.erp.controller;

import com.andara.erp.common.dto.ApiResponse;
import com.andara.erp.dto.rekap.RekapCustomerSummaryDTO;
import com.andara.erp.dto.rekap.RekapInvoiceSummaryDTO;
import com.andara.erp.dto.rekap.RekapKegiatanSummaryDTO;
import com.andara.erp.dto.rekap.RekapPaymentSummaryDTO;
import com.andara.erp.entity.InvoicePaymentStatus;
import com.andara.erp.entity.InvoiceStatus;
import com.andara.erp.entity.KegiatanStatus;
import com.andara.erp.entity.PaymentMethod;
import com.andara.erp.entity.PaymentStatus;
import com.andara.erp.service.RekapService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/rekap")
@PreAuthorize("isAuthenticated()")
public class RekapController {

    private static final Logger log = LoggerFactory.getLogger(RekapController.class);

    private final RekapService rekapService;

    public RekapController(RekapService rekapService) {
        this.rekapService = rekapService;
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<RekapCustomerSummaryDTO>> getRekapCustomers(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        log.info("REST request to get Rekap Customers: search={}", search);
        RekapCustomerSummaryDTO summary = rekapService.getRekapCustomers(search, pageable);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/invoices")
    public ResponseEntity<ApiResponse<RekapInvoiceSummaryDTO>> getRekapInvoices(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) InvoiceStatus status,
            @RequestParam(required = false) InvoicePaymentStatus paymentStatus,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "date", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        log.info("REST request to get Rekap Invoices");
        RekapInvoiceSummaryDTO summary = rekapService.getRekapInvoices(startDate, endDate, customerId, status, paymentStatus, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<RekapPaymentSummaryDTO>> getRekapPayments(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) PaymentStatus status,
            @RequestParam(required = false) PaymentMethod method,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "date", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        log.info("REST request to get Rekap Payments");
        RekapPaymentSummaryDTO summary = rekapService.getRekapPayments(startDate, endDate, customerId, status, method, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/kegiatan")
    public ResponseEntity<ApiResponse<RekapKegiatanSummaryDTO>> getRekapKegiatan(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) KegiatanStatus status,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        log.info("REST request to get Rekap Kegiatan");
        RekapKegiatanSummaryDTO summary = rekapService.getRekapKegiatan(customerId, status, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}

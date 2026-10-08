package com.andara.erp.service;

import com.andara.erp.dto.invoice.InvoiceDTO;
import com.andara.erp.dto.invoice.RetentionMonitoringDTO;
import com.andara.erp.entity.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class InvoiceRetentionAndMultiSphTest {

    @Test
    @DisplayName("FASE 3 (Retensi): Kalkulasi Faktur dengan Potongan Retensi Pemeliharaan 5%")
    void testInvoice_RetentionDeductionCalculation() {
        Invoice invoice = new Invoice();
        invoice.setBillingMode(BillingMode.PERCENTAGE_TERMIN);
        invoice.setTerminPercentage(new BigDecimal("100.00"));
        invoice.setTerminName("Pelunasan 100%");
        invoice.setTaxPpnType(TaxPpnType.EXCLUDE_11);
        invoice.setTaxPphType(TaxPphType.PPH_FINAL_KONSTRUKSI_1_75);
        invoice.setRetentionPercentage(new BigDecimal("5.00"));
        invoice.setRetentionAmount(new BigDecimal("5000000.00"));
        invoice.setRetentionDueDate(LocalDate.now().plusMonths(6));

        // Bruto tagihan 100,000,000
        InvoiceDetail mainItem = new InvoiceDetail("Pelunasan Proyek Gedung", BigDecimal.ONE, "Paket", new BigDecimal("100000000"), 1);
        mainItem.setIsDeduction(false);
        mainItem.setItemType(InvoiceItemType.STANDARD);
        invoice.addDetail(mainItem);

        // Potongan Retensi 5% = 5,000,000
        InvoiceDetail retentionDeduction = new InvoiceDetail("Potongan Retensi Pemeliharaan (5%)", BigDecimal.ONE, "Paket", new BigDecimal("5000000"), 2);
        retentionDeduction.setIsDeduction(true);
        retentionDeduction.setItemType(InvoiceItemType.RETENTION_DEDUCTION);
        invoice.addDetail(retentionDeduction);

        // DPP bersih setelah dipotong retensi: 100jt - 5jt = 95,000,000
        assertEquals(new BigDecimal("95000000.00"), invoice.getSubtotalDpp());

        // PPN 11% dari 95jt = 10,450,000
        assertEquals(new BigDecimal("10450000.00"), invoice.getTaxPpnAmount());

        // Total Tagihan = 95jt + 10.45jt = 105,450,000
        assertEquals(new BigDecimal("105450000.00"), invoice.getTotalAmount());

        // PPh Final Konstruksi (1.75% dari 95jt DPP) = 1,662,500
        assertEquals(new BigDecimal("1662500.00"), invoice.getTaxPphAmount());

        // Net Due = 105,450,000 - 1,662,500 = 103,787,500
        assertEquals(new BigDecimal("103787500.00"), invoice.getNetTotalAmount());
    }

    @Test
    @DisplayName("FASE 3 (Retensi): Companion Draft Faktur Retensi & DTO Mapping")
    void testInvoice_RetentionCompanionDraftAndDtoMapping() {
        Customer customer = new Customer();
        customer.setId(10L);
        customer.setCode("CUST-001");
        customer.setName("PT Mitra Sejati");

        Invoice settlementInvoice = new Invoice();
        settlementInvoice.setId(201L);
        settlementInvoice.setNumber("INV/2026/10-001");
        settlementInvoice.setCustomer(customer);
        settlementInvoice.setDate(LocalDate.now());

        Invoice retentionInvoice = new Invoice();
        retentionInvoice.setId(202L);
        retentionInvoice.setNumber("INV/2026/10-002");
        retentionInvoice.setCustomer(customer);
        retentionInvoice.setIsRetentionInvoice(true);
        retentionInvoice.setParentSettlementInvoice(settlementInvoice);
        retentionInvoice.setRetentionPercentage(new BigDecimal("5.00"));
        retentionInvoice.setRetentionAmount(new BigDecimal("5000000.00"));
        retentionInvoice.setRetentionDueDate(LocalDate.now().plusMonths(6));
        retentionInvoice.setDate(LocalDate.now());
        retentionInvoice.setTaxPpnType(TaxPpnType.NONE);
        retentionInvoice.setStatus(InvoiceStatus.DRAFT);
        retentionInvoice.setPaymentStatus(InvoicePaymentStatus.UNPAID);

        InvoiceDetail retItem = new InvoiceDetail("Penagihan Retensi Pemeliharaan (5%) - Faktur INV/2026/10-001", BigDecimal.ONE, "Retensi", new BigDecimal("5000000.00"), 1);
        retItem.setIsDeduction(false);
        retItem.setItemType(InvoiceItemType.STANDARD);
        retentionInvoice.addDetail(retItem);

        InvoiceDTO dto = InvoiceDTO.fromEntity(retentionInvoice, true);

        assertTrue(dto.getIsRetentionInvoice());
        assertEquals(201L, dto.getParentSettlementInvoiceId());
        assertEquals("INV/2026/10-001", dto.getParentSettlementInvoiceNumber());
        assertEquals(new BigDecimal("5.00"), dto.getRetentionPercentage());
        assertEquals(new BigDecimal("5000000.00"), dto.getRetentionAmount());
        assertEquals(new BigDecimal("5000000.00"), dto.getTotalAmount());
    }

    @Test
    @DisplayName("FASE 3 (Retensi): RetentionMonitoringDTO status days remaining and ready to bill")
    void testRetentionMonitoringDTO() {
        Customer customer = new Customer();
        customer.setId(1L);
        customer.setName("PT Bangun Mandiri");

        Invoice inv = new Invoice();
        inv.setId(301L);
        inv.setNumber("INV/2026/RET-001");
        inv.setCustomer(customer);
        inv.setIsRetentionInvoice(true);
        inv.setRetentionPercentage(new BigDecimal("5.00"));
        inv.setRetentionAmount(new BigDecimal("7500000.00"));
        inv.setRetentionDueDate(LocalDate.now().plusDays(10)); // 10 hari lagi -> ready to bill (< 14 hari)
        inv.setStatus(InvoiceStatus.DRAFT);
        inv.setPaymentStatus(InvoicePaymentStatus.UNPAID);

        RetentionMonitoringDTO dto = RetentionMonitoringDTO.fromEntity(inv);

        assertEquals("PT Bangun Mandiri", dto.getCustomerName());
        assertEquals(new BigDecimal("7500000.00"), dto.getRetentionAmount());
        assertEquals(10L, dto.getDaysRemaining());
        assertFalse(dto.isOverdue());
        assertTrue(dto.isReadyToBill());
    }

    @Test
    @DisplayName("FASE 4 (Multi-SPH): Detail item membawa keterkaitan sourcePenawaran")
    void testInvoiceDetail_MultiSphSourcePenawaranLink() {
        Penawaran sph1 = new Penawaran();
        sph1.setId(101L);
        sph1.setNumber("SPH/2026/001");

        Penawaran sph2 = new Penawaran();
        sph2.setId(102L);
        sph2.setNumber("SPH/2026/002");

        Invoice invoice = new Invoice();
        invoice.setId(401L);
        invoice.setNumber("INV/2026/MULTI-001");
        invoice.setSourcePenawaran(sph1); // Primer SPH

        InvoiceDetail item1 = new InvoiceDetail("Item dari SPH 1", new BigDecimal("2"), "Unit", new BigDecimal("1000000"), 1);
        item1.setSourcePenawaran(sph1);
        invoice.addDetail(item1);

        InvoiceDetail item2 = new InvoiceDetail("Item dari SPH 2", new BigDecimal("3"), "Unit", new BigDecimal("2000000"), 2);
        item2.setSourcePenawaran(sph2);
        invoice.addDetail(item2);

        InvoiceDTO dto = InvoiceDTO.fromEntity(invoice, true);

        assertEquals(2, dto.getDetails().size());
        assertEquals(101L, dto.getDetails().get(0).getSourcePenawaranId());
        assertEquals("SPH/2026/001", dto.getDetails().get(0).getSourcePenawaranNumber());

        assertEquals(102L, dto.getDetails().get(1).getSourcePenawaranId());
        assertEquals("SPH/2026/002", dto.getDetails().get(1).getSourcePenawaranNumber());
    }
}

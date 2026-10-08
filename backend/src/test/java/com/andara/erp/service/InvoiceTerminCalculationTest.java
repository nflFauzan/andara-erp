package com.andara.erp.service;

import com.andara.erp.dto.invoice.InvoiceDTO;
import com.andara.erp.entity.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class InvoiceTerminCalculationTest {

    @Test
    @DisplayName("InvoiceDetail: calculateAmount menghasilkan negatif jika isDeduction = true")
    void testInvoiceDetail_DeductionAmountIsNegative() {
        InvoiceDetail normalItem = new InvoiceDetail("Pekerjaan Struktur", BigDecimal.ONE, "Paket", new BigDecimal("50000000"), 1);
        normalItem.setIsDeduction(false);
        normalItem.setItemType(InvoiceItemType.STANDARD);
        normalItem.calculateAmount();

        assertEquals(new BigDecimal("50000000.00"), normalItem.getAmount());

        InvoiceDetail dpDeduction = new InvoiceDetail("Potongan Uang Muka (DP)", BigDecimal.ONE, "Paket", new BigDecimal("20000000"), 2);
        dpDeduction.setIsDeduction(true);
        dpDeduction.setItemType(InvoiceItemType.DP_DEDUCTION);
        dpDeduction.calculateAmount();

        assertEquals(new BigDecimal("-20000000.00"), dpDeduction.getAmount());
    }

    @Test
    @DisplayName("Termin & DP Deduction: Kalkulasi Faktur Termin dengan Pemotongan Uang Muka")
    void testInvoice_TerminWithDpDeduction() {
        Invoice invoice = new Invoice();
        invoice.setBillingMode(BillingMode.PERCENTAGE_TERMIN);
        invoice.setTerminPercentage(new BigDecimal("50.00"));
        invoice.setTerminName("Termin I (Progres 50%)");
        invoice.setTaxPpnType(TaxPpnType.EXCLUDE_11);
        invoice.setTaxPphType(TaxPphType.PPH_FINAL_KONSTRUKSI_1_75);

        // Nilai termin 50% dari proyek 100jt = 50jt
        InvoiceDetail terminItem = new InvoiceDetail("Termin I Progres 50% - Proyek Renovasi", BigDecimal.ONE, "Termin", new BigDecimal("50000000"), 1);
        terminItem.setIsDeduction(false);
        terminItem.setItemType(InvoiceItemType.STANDARD);
        invoice.addDetail(terminItem);

        // Potongan DP 30jt
        InvoiceDetail dpItem = new InvoiceDetail("Potongan Uang Muka (DP 30%)", BigDecimal.ONE, "Termin", new BigDecimal("30000000"), 2);
        dpItem.setIsDeduction(true);
        dpItem.setItemType(InvoiceItemType.DP_DEDUCTION);
        invoice.addDetail(dpItem);

        // DPP harus berkurang menjadi 50,000,000 - 30,000,000 = 20,000,000
        assertEquals(new BigDecimal("20000000.00"), invoice.getSubtotalDpp());

        // PPN 11% dari 20,000,000 = 2,200,000
        assertEquals(new BigDecimal("2200000.00"), invoice.getTaxPpnAmount());

        // Total Tagihan = 20jt DPP + 2.2jt PPN = 22,200,000
        assertEquals(new BigDecimal("22200000.00"), invoice.getTotalAmount());

        // PPh Final Konstruksi (1.75% dari 20jt DPP) = 350,000
        assertEquals(new BigDecimal("350000.00"), invoice.getTaxPphAmount());

        // Net Due yang ditransfer klien = 22,200,000 - 350,000 = 21,850,000
        assertEquals(new BigDecimal("21850000.00"), invoice.getNetTotalAmount());
    }

    @Test
    @DisplayName("InvoiceDTO Mapping: Memastikan field termin dan potongan DP dipetakan dengan benar")
    void testInvoiceDTO_TerminAndDeductionMapping() {
        Invoice dpInvoice = new Invoice();
        dpInvoice.setId(101L);
        dpInvoice.setNumber("INV/2026/001");

        Invoice invoice = new Invoice();
        invoice.setId(102L);
        invoice.setNumber("INV/2026/002");
        invoice.setBillingMode(BillingMode.PERCENTAGE_TERMIN);
        invoice.setTerminPercentage(new BigDecimal("70.00"));
        invoice.setTerminName("Pelunasan 70%");
        invoice.setPreviousDpInvoice(dpInvoice);

        InvoiceDetail item1 = new InvoiceDetail("Pelunasan Pekerjaan", BigDecimal.ONE, "Paket", new BigDecimal("70000000"), 1);
        item1.setIsDeduction(false);
        item1.setItemType(InvoiceItemType.STANDARD);
        invoice.addDetail(item1);

        InvoiceDetail deduction = new InvoiceDetail("Potongan DP", BigDecimal.ONE, "Paket", new BigDecimal("30000000"), 2);
        deduction.setIsDeduction(true);
        deduction.setItemType(InvoiceItemType.DP_DEDUCTION);
        invoice.addDetail(deduction);

        InvoiceDTO dto = InvoiceDTO.fromEntity(invoice, true);

        assertEquals(BillingMode.PERCENTAGE_TERMIN, dto.getBillingMode());
        assertEquals("Penagihan Termin Proyek (%)", dto.getBillingModeLabel());
        assertEquals(new BigDecimal("70.00"), dto.getTerminPercentage());
        assertEquals("Pelunasan 70%", dto.getTerminName());
        assertEquals(101L, dto.getPreviousDpInvoiceId());
        assertEquals("INV/2026/001", dto.getPreviousDpInvoiceNumber());

        assertEquals(2, dto.getDetails().size());
        assertFalse(dto.getDetails().get(0).getIsDeduction());
        assertEquals(InvoiceItemType.STANDARD, dto.getDetails().get(0).getItemType());

        assertTrue(dto.getDetails().get(1).getIsDeduction());
        assertEquals(InvoiceItemType.DP_DEDUCTION, dto.getDetails().get(1).getItemType());
        assertEquals(new BigDecimal("-30000000.00"), dto.getDetails().get(1).getAmount());
    }
}

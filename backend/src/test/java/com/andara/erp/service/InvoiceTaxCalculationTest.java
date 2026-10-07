package com.andara.erp.service;

import com.andara.erp.dto.invoice.InvoiceDTO;
import com.andara.erp.entity.Invoice;
import com.andara.erp.entity.InvoiceDetail;
import com.andara.erp.entity.TaxPphType;
import com.andara.erp.entity.TaxPpnType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class InvoiceTaxCalculationTest {

    @Test
    @DisplayName("Tax Calculation: Tanpa PPN dan Tanpa PPh (Default)")
    void testTaxCalculation_NoTax_Default() {
        Invoice invoice = new Invoice();
        invoice.setTaxPpnType(TaxPpnType.NONE);
        invoice.setTaxPphType(TaxPphType.NONE);

        InvoiceDetail item1 = new InvoiceDetail("Material Semen", new BigDecimal("100"), "sak", new BigDecimal("70000"), 1);
        invoice.addDetail(item1);

        // Subtotal = 100 * 70,000 = 7,000,000
        assertEquals(new BigDecimal("7000000.00"), invoice.getSubtotalDpp());
        assertEquals(BigDecimal.ZERO, invoice.getTaxPpnAmount());
        assertEquals(BigDecimal.ZERO, invoice.getTaxPphAmount());
        assertEquals(new BigDecimal("7000000.00"), invoice.getTotalAmount());
        assertEquals(new BigDecimal("7000000.00"), invoice.getNetTotalAmount());
    }

    @Test
    @DisplayName("Tax Calculation: Exclude PPN 11% & PPh 23 (2%)")
    void testTaxCalculation_Exclude11_And_Pph23() {
        Invoice invoice = new Invoice();
        invoice.setTaxPpnType(TaxPpnType.EXCLUDE_11);
        invoice.setTaxPphType(TaxPphType.PPH23_2);

        InvoiceDetail item = new InvoiceDetail("Jasa Instalasi IT", BigDecimal.ONE, "paket", new BigDecimal("10000000"), 1);
        invoice.addDetail(item);

        // DPP = 10,000,000
        // PPN 11% = 1,100,000
        // Total Tagihan = 11,100,000
        // PPh 23 (2% dari DPP) = 200,000
        // Net yang ditransfer klien = 11,100,000 - 200,000 = 10,900,000
        assertEquals(new BigDecimal("10000000.00"), invoice.getSubtotalDpp());
        assertEquals(new BigDecimal("1100000.00"), invoice.getTaxPpnAmount());
        assertEquals(new BigDecimal("200000.00"), invoice.getTaxPphAmount());
        assertEquals(new BigDecimal("11100000.00"), invoice.getTotalAmount());
        assertEquals(new BigDecimal("10900000.00"), invoice.getNetTotalAmount());
    }

    @Test
    @DisplayName("Tax Calculation: Include PPN 11% & PPh Final Konstruksi (1.75%)")
    void testTaxCalculation_Include11_And_PphFinalKonstruksi() {
        Invoice invoice = new Invoice();
        invoice.setTaxPpnType(TaxPpnType.INCLUDE);
        invoice.setTaxPphType(TaxPphType.PPH_FINAL_KONSTRUKSI_1_75);

        // Nilai gross termasuk PPN = 11,100,000
        InvoiceDetail item = new InvoiceDetail("Pekerjaan Konstruksi Gudang", BigDecimal.ONE, "paket", new BigDecimal("11100000"), 1);
        invoice.addDetail(item);

        // DPP = 11,100,000 / 1.11 = 10,000,000
        // PPN = 11,100,000 - 10,000,000 = 1,100,000
        // Total Tagihan Gross = 11,100,000
        // PPh Final (1.75% dari DPP 10,000,000) = 175,000
        // Net = 11,100,000 - 175,000 = 10,925,000
        assertEquals(new BigDecimal("10000000.00"), invoice.getSubtotalDpp());
        assertEquals(new BigDecimal("1100000.00"), invoice.getTaxPpnAmount());
        assertEquals(new BigDecimal("175000.00"), invoice.getTaxPphAmount());
        assertEquals(new BigDecimal("11100000.00"), invoice.getTotalAmount());
        assertEquals(new BigDecimal("10925000.00"), invoice.getNetTotalAmount());
    }

    @Test
    @DisplayName("Tax Calculation: Exclude PPN 12% & PPh Final Konstruksi (2.65%)")
    void testTaxCalculation_Exclude12_And_PphFinal265() {
        Invoice invoice = new Invoice();
        invoice.setTaxPpnType(TaxPpnType.EXCLUDE_12);
        invoice.setTaxPphType(TaxPphType.PPH_FINAL_KONSTRUKSI_2_65);

        InvoiceDetail item = new InvoiceDetail("Pekerjaan Sipil Jalan", BigDecimal.ONE, "paket", new BigDecimal("50000000"), 1);
        invoice.addDetail(item);

        // DPP = 50,000,000
        // PPN 12% = 6,000,000
        // Total = 56,000,000
        // PPh Final (2.65% dari 50jt) = 1,325,000
        // Net = 56,000,000 - 1,325,000 = 54,675,000
        assertEquals(new BigDecimal("50000000.00"), invoice.getSubtotalDpp());
        assertEquals(new BigDecimal("6000000.00"), invoice.getTaxPpnAmount());
        assertEquals(new BigDecimal("1325000.00"), invoice.getTaxPphAmount());
        assertEquals(new BigDecimal("56000000.00"), invoice.getTotalAmount());
        assertEquals(new BigDecimal("54675000.00"), invoice.getNetTotalAmount());
    }

    @Test
    @DisplayName("Client References (PO, SPK, BAST) Mapping to InvoiceDTO")
    void testClientReferences_MappingToDTO() {
        Invoice invoice = new Invoice();
        invoice.setNumber("INV/2026/10/001");
        invoice.setClientPoNumber("PO-CLIENT-9988");
        invoice.setClientSpkNumber("SPK-AND-042");
        invoice.setBastNumber("BAST-X-2026");
        invoice.setTaxPpnType(TaxPpnType.EXCLUDE_11);
        invoice.setTaxPphType(TaxPphType.PPH23_2);

        InvoiceDetail item = new InvoiceDetail("Jasa Konsultasi", BigDecimal.ONE, "paket", new BigDecimal("5000000"), 1);
        invoice.addDetail(item);

        InvoiceDTO dto = InvoiceDTO.fromEntity(invoice, true);

        assertEquals("PO-CLIENT-9988", dto.getClientPoNumber());
        assertEquals("SPK-AND-042", dto.getClientSpkNumber());
        assertEquals("BAST-X-2026", dto.getBastNumber());
        assertEquals(TaxPpnType.EXCLUDE_11, dto.getTaxPpnType());
        assertEquals("PPN 11% (Tambahan/Exclude)", dto.getTaxPpnTypeLabel());
        assertEquals(new BigDecimal("5000000.00"), dto.getSubtotalDpp());
        assertEquals(new BigDecimal("550000.00"), dto.getTaxPpnAmount());
        assertEquals(new BigDecimal("100000.00"), dto.getTaxPphAmount());
        assertEquals(new BigDecimal("5550000.00"), dto.getTotalAmount());
        assertEquals(new BigDecimal("5450000.00"), dto.getNetTotalAmount());
    }
}

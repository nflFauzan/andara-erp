package com.andara.erp.service;

import com.andara.erp.dto.penawaran.PenawaranDTO;
import com.andara.erp.entity.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PenawaranAddendumTest {

    @Test
    @DisplayName("FASE 5 (Addendum): Entity & DTO Mapping dengan Plafon Akumulasi Kontrak")
    void testPenawaran_AddendumEntityAndDtoMapping() {
        Customer customer = new Customer();
        customer.setId(10L);
        customer.setCode("CUST-001");
        customer.setName("PT. Maju Bersama Konstruksi");

        // 1. SPH Induk
        Penawaran induk = new Penawaran();
        induk.setId(100L);
        induk.setNumber("001/SPH/ANDARA/X/2026");
        induk.setCustomer(customer);
        induk.setDate(LocalDate.of(2026, 10, 1));
        induk.setStatus(PenawaranStatus.APPROVED);
        induk.setIsAddendum(false);
        induk.setTotalAmount(new BigDecimal("100000000.00")); // Rp 100 jt

        // 2. Addendum 01 (Approved: Rp 20 jt)
        Penawaran add1 = new Penawaran();
        add1.setId(101L);
        add1.setNumber("001/SPH/ANDARA/X/2026/ADD-01");
        add1.setCustomer(customer);
        add1.setDate(LocalDate.of(2026, 10, 15));
        add1.setStatus(PenawaranStatus.APPROVED);
        add1.setIsAddendum(true);
        add1.setAddendumNumberIndex(1);
        add1.setParentPenawaran(induk);
        add1.setTotalAmount(new BigDecimal("20000000.00"));

        // 3. Addendum 02 (Draft: Rp 15 jt - belum approved sehingga belum masuk nilai kontrak mengikat)
        Penawaran add2 = new Penawaran();
        add2.setId(102L);
        add2.setNumber("001/SPH/ANDARA/X/2026/ADD-02");
        add2.setCustomer(customer);
        add2.setDate(LocalDate.of(2026, 10, 20));
        add2.setStatus(PenawaranStatus.DRAFT);
        add2.setIsAddendum(true);
        add2.setAddendumNumberIndex(2);
        add2.setParentPenawaran(induk);
        add2.setTotalAmount(new BigDecimal("15000000.00"));

        List<Penawaran> addendums = new ArrayList<>();
        addendums.add(add1);
        addendums.add(add2);
        induk.setAddendums(addendums);

        // Verifikasi DTO SPH Induk
        PenawaranDTO indukDto = PenawaranDTO.fromEntity(induk, true);
        assertNotNull(indukDto);
        assertFalse(indukDto.getIsAddendum());
        assertEquals("001/SPH/ANDARA/X/2026", indukDto.getNumber());
        assertEquals(new BigDecimal("100000000.00"), indukDto.getTotalAmount());

        // Plafon Kumulatif = 100 jt (Induk) + 20 jt (Add-01 APPROVED) = 120 jt (Add-02 DRAFT tidak dihitung)
        assertEquals(new BigDecimal("120000000.00"), indukDto.getCumulativeTotalAmount());
        assertEquals(2, indukDto.getAddendums().size());

        // Verifikasi DTO Addendum 1
        PenawaranDTO add1Dto = PenawaranDTO.fromEntity(add1, true);
        assertTrue(add1Dto.getIsAddendum());
        assertEquals(1, add1Dto.getAddendumNumberIndex());
        assertEquals(100L, add1Dto.getParentPenawaranId());
        assertEquals("001/SPH/ANDARA/X/2026", add1Dto.getParentPenawaranNumber());
        assertEquals("001/SPH/ANDARA/X/2026/ADD-01", add1Dto.getNumber());
        assertEquals(new BigDecimal("20000000.00"), add1Dto.getTotalAmount());
    }

    @Test
    @DisplayName("FASE 5 (Addendum): Format Penomoran Otomatis /ADD-XX")
    void testPenawaran_AddendumNumberFormatting() {
        String parentNumber = "SPH/2026/088";
        int index1 = 1;
        int index2 = 12;

        String addendumNum1 = parentNumber + "/ADD-" + String.format("%02d", index1);
        String addendumNum2 = parentNumber + "/ADD-" + String.format("%02d", index2);

        assertEquals("SPH/2026/088/ADD-01", addendumNum1);
        assertEquals("SPH/2026/088/ADD-12", addendumNum2);
    }

    @Test
    @DisplayName("FASE 5 (Addendum): Integrasi Multi-SPH Faktur Menggabungkan Induk dan Addendum")
    void testPenawaran_AddendumMultiSphInvoiceIntegration() {
        Customer customer = new Customer();
        customer.setId(5L);
        customer.setName("CV. Mitra Sejahtera");

        Penawaran induk = new Penawaran();
        induk.setId(50L);
        induk.setNumber("SPH-IND-01");
        induk.setCustomer(customer);

        Penawaran addendum = new Penawaran();
        addendum.setId(51L);
        addendum.setNumber("SPH-IND-01/ADD-01");
        addendum.setCustomer(customer);
        addendum.setParentPenawaran(induk);
        addendum.setIsAddendum(true);

        // Faktur gabungan
        Invoice invoice = new Invoice();
        invoice.setCustomer(customer);
        invoice.setSourcePenawaran(induk); // primary reference

        InvoiceDetail itemInduk = new InvoiceDetail("Pekerjaan Konstruksi Baja Utama", new BigDecimal("100"), "m2", new BigDecimal("500000"), 1);
        itemInduk.setSourcePenawaran(induk);
        invoice.addDetail(itemInduk);

        InvoiceDetail itemAddendum = new InvoiceDetail("Pekerjaan Tambah: Pasang Talang Ekstra", new BigDecimal("20"), "m1", new BigDecimal("150000"), 2);
        itemAddendum.setSourcePenawaran(addendum);
        invoice.addDetail(itemAddendum);

        assertEquals(2, invoice.getDetails().size());
        assertEquals("SPH-IND-01", invoice.getDetails().get(0).getSourcePenawaran().getNumber());
        assertEquals("SPH-IND-01/ADD-01", invoice.getDetails().get(1).getSourcePenawaran().getNumber());

        // Total Tagihan = (100 * 500rb = 50jt) + (20 * 150rb = 3jt) = 53jt
        assertEquals(new BigDecimal("53000000.00"), invoice.getTotalAmount());
    }
}

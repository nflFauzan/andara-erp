package com.andara.erp.service;

import com.andara.erp.dto.rekap.CustomerStatementDTO;
import com.andara.erp.dto.rekap.CustomerStatementItemDTO;
import com.andara.erp.dto.rekap.MonthlyTrendItemDTO;
import com.andara.erp.dto.rekap.RekapPiutangDTO;
import com.andara.erp.dto.rekap.RekapPiutangSummaryDTO;
import com.andara.erp.dto.rekap.RekapUnbilledSphDTO;
import com.andara.erp.dto.rekap.RekapUnbilledSummaryDTO;
import com.andara.erp.dto.rekap.YearlyTrendSummaryDTO;
import com.andara.erp.entity.Customer;
import com.andara.erp.entity.Invoice;
import com.andara.erp.entity.InvoicePaymentStatus;
import com.andara.erp.entity.InvoiceStatus;
import com.andara.erp.entity.Payment;
import com.andara.erp.entity.PaymentStatus;
import com.andara.erp.entity.Penawaran;
import com.andara.erp.entity.PenawaranStatus;
import com.andara.erp.repository.CustomerRepository;
import com.andara.erp.repository.DepositTransactionRepository;
import com.andara.erp.repository.InvoiceDetailRepository;
import com.andara.erp.repository.InvoiceRepository;
import com.andara.erp.repository.KegiatanRepository;
import com.andara.erp.repository.PaymentAllocationRepository;
import com.andara.erp.repository.PaymentRepository;
import com.andara.erp.repository.PenawaranDetailRepository;
import com.andara.erp.repository.PenawaranRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RekapServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private KegiatanRepository kegiatanRepository;

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private DepositTransactionRepository depositTransactionRepository;

    @Mock
    private PenawaranRepository penawaranRepository;

    @Mock
    private PenawaranDetailRepository penawaranDetailRepository;

    @Mock
    private InvoiceDetailRepository invoiceDetailRepository;

    @Mock
    private PaymentAllocationRepository paymentAllocationRepository;

    @InjectMocks
    private RekapService rekapService;

    private Customer sampleCustomer;

    @BeforeEach
    void setUp() {
        sampleCustomer = new Customer();
        sampleCustomer.setId(10L);
        sampleCustomer.setName("PT. Mitra Mandiri Sejahtera");
        sampleCustomer.setCode("CUST-010");
        sampleCustomer.setDepositBalance(new BigDecimal("5000000"));
    }

    @Test
    @DisplayName("Rekap Piutang - Correct Aging Bucket & Non-negative Invariants")
    void testRekapPiutang_AgingBucketsAndInvariants() {
        LocalDate today = LocalDate.now();

        // Invoice 1: Overdue 10 days -> DAYS_1_30
        Invoice inv1 = new Invoice();
        inv1.setId(101L);
        inv1.setNumber("INV-001");
        inv1.setCustomer(sampleCustomer);
        inv1.setDate(today.minusDays(40));
        inv1.setDueDate(today.minusDays(10));
        inv1.setStatus(InvoiceStatus.ISSUED);
        inv1.setPaymentStatus(InvoicePaymentStatus.PARTIAL);
        inv1.setTotalAmount(new BigDecimal("10000000"));
        inv1.setPaidAmount(new BigDecimal("4000000"));

        // Invoice 2: Overdue 45 days -> DAYS_31_60
        Invoice inv2 = new Invoice();
        inv2.setId(102L);
        inv2.setNumber("INV-002");
        inv2.setCustomer(sampleCustomer);
        inv2.setDate(today.minusDays(75));
        inv2.setDueDate(today.minusDays(45));
        inv2.setStatus(InvoiceStatus.ISSUED);
        inv2.setPaymentStatus(InvoicePaymentStatus.UNPAID);
        inv2.setTotalAmount(new BigDecimal("15000000"));
        inv2.setPaidAmount(BigDecimal.ZERO);

        // Invoice 3: Overdue 100 days -> DAYS_OVER_90
        Invoice inv3 = new Invoice();
        inv3.setId(103L);
        inv3.setNumber("INV-003");
        inv3.setCustomer(sampleCustomer);
        inv3.setDate(today.minusDays(130));
        inv3.setDueDate(today.minusDays(100));
        inv3.setStatus(InvoiceStatus.ISSUED);
        inv3.setPaymentStatus(InvoicePaymentStatus.UNPAID);
        inv3.setTotalAmount(new BigDecimal("20000000"));
        inv3.setPaidAmount(BigDecimal.ZERO);

        when(invoiceRepository.findAllOutstanding()).thenReturn(List.of(inv1, inv2, inv3));

        Pageable pageable = PageRequest.of(0, 10);
        RekapPiutangSummaryDTO summary = rekapService.getRekapPiutang(
                today, null, null, null, pageable
        );

        assertNotNull(summary);
        assertEquals(3, summary.getTotalInvoicesWithOutstanding());
        // Outstanding: (10M - 4M) + 15M + 20M = 41M
        assertEquals(new BigDecimal("41000000"), summary.getGrandTotalOutstanding());
        // Bucket 1-30: 6M
        assertEquals(new BigDecimal("6000000"), summary.getBucket1To30Amount());
        // Bucket 31-60: 15M
        assertEquals(new BigDecimal("15000000"), summary.getBucket31To60Amount());
        // Bucket > 90: 20M
        assertEquals(new BigDecimal("20000000"), summary.getBucketOver90Amount());

        // Verify page content
        List<RekapPiutangDTO> items = summary.getPage().getContent();
        assertEquals(3, items.size());
        assertEquals("DAYS_1_30", items.get(0).getAgingBucket());
        assertEquals("DAYS_31_60", items.get(1).getAgingBucket());
        assertEquals("DAYS_OVER_90", items.get(2).getAgingBucket());
    }

    @Test
    @DisplayName("Customer Statement - Chronological timeline & Running Balance Invariant")
    void testCustomerStatement_TimelineAndRunningBalance() {
        when(customerRepository.findById(10L)).thenReturn(Optional.of(sampleCustomer));
        when(depositTransactionRepository.calculateCurrentBalanceByCustomerId(10L)).thenReturn(new BigDecimal("5000000"));
        when(kegiatanRepository.findByCustomerIdOrderByCreatedAtDesc(10L)).thenReturn(Collections.emptyList());
        when(depositTransactionRepository.findByCustomerIdOrderByCreatedAtDesc(10L)).thenReturn(Collections.emptyList());

        // Invoice on Day 5: 10,000,000
        Invoice inv1 = new Invoice();
        inv1.setId(201L);
        inv1.setNumber("INV-201");
        inv1.setCustomer(sampleCustomer);
        inv1.setDate(LocalDate.of(2026, 1, 5));
        inv1.setTotalAmount(new BigDecimal("10000000"));
        inv1.setPaidAmount(new BigDecimal("5000000"));
        inv1.setStatus(InvoiceStatus.ISSUED);
        inv1.setPaymentStatus(InvoicePaymentStatus.PARTIAL);

        // Payment on Day 10: 5,000,000
        Payment pay1 = new Payment();
        pay1.setId(301L);
        pay1.setNumber("PAY-301");
        pay1.setCustomer(sampleCustomer);
        pay1.setDate(LocalDate.of(2026, 1, 10));
        pay1.setAmount(new BigDecimal("5000000"));
        pay1.setStatus(PaymentStatus.CONFIRMED);

        when(invoiceRepository.findByCustomerIdOrderByDateDesc(10L)).thenReturn(List.of(inv1));
        when(paymentRepository.findByCustomerIdOrderByDateDesc(10L)).thenReturn(List.of(pay1));
        when(penawaranRepository.findByCustomerIdOrderByDateDesc(10L)).thenReturn(Collections.emptyList());

        CustomerStatementDTO statement = rekapService.getCustomerStatement(
                10L, LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31)
        );

        assertNotNull(statement);
        assertEquals(10L, statement.getCustomerId());
        assertEquals("PT. Mitra Mandiri Sejahtera", statement.getCustomerName());
        assertEquals(new BigDecimal("5000000"), statement.getDepositBalance());
        assertEquals(2, statement.getItems().size());

        // First item: Invoice (Debit 10,000,000, Balance 10,000,000)
        CustomerStatementItemDTO item1 = statement.getItems().get(0);
        assertEquals("INVOICE", item1.getType());
        assertEquals(new BigDecimal("10000000"), item1.getDebit());
        assertEquals(BigDecimal.ZERO, item1.getCredit());
        assertEquals(new BigDecimal("10000000"), item1.getRunningBalance());

        // Second item: Payment (Credit 5,000,000, Balance 5,000,000)
        CustomerStatementItemDTO item2 = statement.getItems().get(1);
        assertEquals("PAYMENT", item2.getType());
        assertEquals(BigDecimal.ZERO, item2.getDebit());
        assertEquals(new BigDecimal("5000000"), item2.getCredit());
        assertEquals(new BigDecimal("5000000"), item2.getRunningBalance());

        assertEquals(new BigDecimal("10000000"), statement.getTotalInvoiceAmount());
        assertEquals(new BigDecimal("5000000"), statement.getTotalPaidAmount());
        assertEquals(new BigDecimal("5000000"), statement.getTotalOutstandingAmount());
    }

    @Test
    @DisplayName("Rekap Unbilled SPH - Leakage Prevention & Billing Percentage")
    void testRekapUnbilledSph_BilledRatioAndLeakageDetection() {
        // Penawaran 1: Approved 50,000,000
        Penawaran sph1 = new Penawaran();
        sph1.setId(401L);
        sph1.setNumber("SPH-401");
        sph1.setCustomer(sampleCustomer);
        sph1.setDate(LocalDate.of(2026, 2, 1));
        sph1.setStatus(PenawaranStatus.APPROVED);
        sph1.setTotalAmount(new BigDecimal("50000000"));

        when(penawaranRepository.findAll()).thenReturn(List.of(sph1));

        // Invoice billed against SPH-401: 20,000,000
        Invoice invLinked = new Invoice();
        invLinked.setId(501L);
        invLinked.setNumber("INV-501");
        invLinked.setStatus(InvoiceStatus.ISSUED);
        invLinked.setTotalAmount(new BigDecimal("20000000"));

        when(invoiceRepository.findBySourcePenawaranId(401L)).thenReturn(List.of(invLinked));

        Pageable pageable = PageRequest.of(0, 10);
        RekapUnbilledSummaryDTO summary = rekapService.getRekapUnbilledSph(
                null, null, null, null, null, pageable
        );

        assertNotNull(summary);
        assertEquals(1, summary.getTotalApprovedSph());
        assertEquals(new BigDecimal("50000000"), summary.getGrandTotalSphAmount());
        assertEquals(new BigDecimal("20000000"), summary.getGrandTotalInvoicedAmount());
        assertEquals(new BigDecimal("30000000"), summary.getGrandTotalUnbilledAmount());

        List<RekapUnbilledSphDTO> items = summary.getPage().getContent();
        assertEquals(1, items.size());
        RekapUnbilledSphDTO item = items.get(0);
        assertEquals(new BigDecimal("30000000"), item.getUnbilledAmount());
        assertEquals(40.0, item.getBilledPercentage());
        assertEquals("PARTIALLY_BILLED", item.getBillingStatus());
    }

    @Test
    @DisplayName("Monthly Trend - Zero Division Safety for Growth Calculation")
    void testMonthlyTrend_ZeroDivisionSafety() {
        when(kegiatanRepository.findAll()).thenReturn(Collections.emptyList());
        when(penawaranRepository.findAll()).thenReturn(Collections.emptyList());
        when(invoiceRepository.findAll()).thenReturn(Collections.emptyList());
        when(paymentRepository.findAll()).thenReturn(Collections.emptyList());

        YearlyTrendSummaryDTO trend = rekapService.getMonthlyTrend(2026, null);

        assertNotNull(trend);
        assertEquals(2026, trend.getYear());
        assertEquals(12, trend.getMonthlyData().size());
        assertEquals(BigDecimal.ZERO, trend.getTotalInvoiceAmount());
        assertEquals(BigDecimal.ZERO, trend.getTotalPaymentAmount());

        // In month with zero previous and zero current, growth should be null/safe without throwing ArithmeticException
        for (MonthlyTrendItemDTO month : trend.getMonthlyData()) {
            assertNull(month.getMomInvoiceGrowth());
            assertEquals(BigDecimal.ZERO, month.getInvoiceAmount());
            assertEquals(BigDecimal.ZERO, month.getPaymentAmount());
        }
    }
}

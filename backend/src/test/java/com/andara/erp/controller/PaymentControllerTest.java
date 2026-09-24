package com.andara.erp.controller;

import com.andara.erp.dto.deposit.UseDepositRequest;
import com.andara.erp.dto.payment.AllocationItemRequest;
import com.andara.erp.dto.payment.CreatePaymentRequest;
import com.andara.erp.entity.*;
import com.andara.erp.repository.CustomerRepository;
import com.andara.erp.repository.DepositTransactionRepository;
import com.andara.erp.repository.InvoiceRepository;
import com.andara.erp.repository.PaymentRepository;
import com.andara.erp.repository.PaymentAllocationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:postgresql://localhost:5432/andara_erp",
        "spring.datasource.username=andara_user",
        "spring.datasource.password=andara_dev_password_123"
})
@AutoConfigureMockMvc
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentAllocationRepository paymentAllocationRepository;

    @Autowired
    private DepositTransactionRepository depositTransactionRepository;

    @Autowired
    private com.andara.erp.repository.ReceiptRepository receiptRepository;

    private Customer testCustomer;
    private Invoice testInvoice;

    @org.junit.jupiter.api.AfterEach
    void tearDown() {
        if (testInvoice != null && testInvoice.getId() != null) {
            List<PaymentAllocation> allocs = paymentAllocationRepository.findByInvoiceId(testInvoice.getId());
            paymentAllocationRepository.deleteAll(allocs);
            invoiceRepository.deleteById(testInvoice.getId());
        }
        List<com.andara.erp.entity.Receipt> testReceipts = receiptRepository.findAll().stream()
                .filter(r -> r.getId() > 1)
                .toList();
        receiptRepository.deleteAll(testReceipts);

        List<Payment> testPayments = paymentRepository.findAll().stream()
                .filter(p -> p.getId() > 1)
                .toList();
        paymentRepository.deleteAll(testPayments);

        List<DepositTransaction> testTxs = depositTransactionRepository.findAll().stream()
                .filter(d -> d.getId() > 0)
                .toList();
        depositTransactionRepository.deleteAll(testTxs);
    }

    @BeforeEach
    void setUp() {
        // Find existing customer or ensure available
        testCustomer = customerRepository.findById(1L).orElseThrow();

        // Create a dedicated invoice for tests
        Invoice invoice = new Invoice();
        invoice.setCustomer(testCustomer);
        invoice.setDate(LocalDate.now());
        invoice.setDueDate(LocalDate.now().plusDays(30));
        invoice.setStatus(InvoiceStatus.ISSUED);
        invoice.setPaymentStatus(InvoicePaymentStatus.UNPAID);
        invoice.setNumber("INV-TEST-" + System.currentTimeMillis());
        invoice.setNotes("Invoice for payment testing");

        InvoiceDetail detail = new InvoiceDetail();
        detail.setDescription("Pekerjaan Test Pembayaran");
        detail.setQuantity(new BigDecimal("10"));
        detail.setUnit("unit");
        detail.setUnitPrice(new BigDecimal("1000000.00")); // total 10.000.000
        detail.setSortOrder(1);
        invoice.addDetail(detail);

        testInvoice = invoiceRepository.save(invoice);
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void getPaymentList_ShouldReturnPaginatedList() throws Exception {
        mockMvc.perform(get("/api/pembayaran")
                        .param("page", "0")
                        .param("size", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void createPayment_PartialAllocation_ShouldUpdateInvoiceToPartial() throws Exception {
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setCustomerId(testCustomer.getId());
        request.setPaymentDate(LocalDate.now());
        request.setAmount(new BigDecimal("4000000.00")); // 4 jt dari 10 jt
        request.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        request.setDestinationAccount("BCA 123456789");
        request.setReference("TRF-PARTIAL-001");
        request.setNotes("Pembayaran termin pertama");

        AllocationItemRequest alloc = new AllocationItemRequest(testInvoice.getId(), new BigDecimal("4000000.00"), "Alokasi termin 1");
        request.setAllocations(List.of(alloc));

        mockMvc.perform(post("/api/pembayaran")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.amount").value(4000000.0))
                .andExpect(jsonPath("$.data.allocatedAmount").value(4000000.0))
                .andExpect(jsonPath("$.data.excessAmount").value(0.0))
                .andExpect(jsonPath("$.data.allocations[0].invoicePaidAmount").value(4000000.0))
                .andExpect(jsonPath("$.data.allocations[0].invoiceOutstanding").value(6000000.0));

        // Verify updated invoice state
        Invoice updated = invoiceRepository.findById(testInvoice.getId()).orElseThrow();
        assertEquals(InvoicePaymentStatus.PARTIAL, updated.getPaymentStatus());
        assertEquals(new BigDecimal("4000000.00"), updated.getPaidAmount());
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void createPayment_Overpayment_ShouldAutomaticallyCreateCustomerDeposit() throws Exception {
        // Invoice is 10jt. Customer pays 15jt. Excess 5jt should be deposited automatically.
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setCustomerId(testCustomer.getId());
        request.setPaymentDate(LocalDate.now());
        request.setAmount(new BigDecimal("15000000.00"));
        request.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        request.setReference("TRF-OVER-001");
        request.setNotes("Pembayaran lebih, sisa masuk deposit");

        AllocationItemRequest alloc = new AllocationItemRequest(testInvoice.getId(), new BigDecimal("10000000.00"), "Pelunasan faktur");
        request.setAllocations(List.of(alloc));

        BigDecimal initialDeposit = depositTransactionRepository.calculateCurrentBalanceByCustomerId(testCustomer.getId());
        if (initialDeposit == null) initialDeposit = BigDecimal.ZERO;

        mockMvc.perform(post("/api/pembayaran")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.amount").value(15000000.0))
                .andExpect(jsonPath("$.data.allocatedAmount").value(10000000.0))
                .andExpect(jsonPath("$.data.excessAmount").value(5000000.0));

        // Verify invoice is PAID
        Invoice updated = invoiceRepository.findById(testInvoice.getId()).orElseThrow();
        assertEquals(InvoicePaymentStatus.PAID, updated.getPaymentStatus());
        assertEquals(new BigDecimal("10000000.00"), updated.getPaidAmount());

        // Verify customer deposit balance increased by 5.000.000
        BigDecimal newDeposit = depositTransactionRepository.calculateCurrentBalanceByCustomerId(testCustomer.getId());
        assertEquals(initialDeposit.add(new BigDecimal("5000000.00")), newDeposit);
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void createPayment_OverAllocation_ShouldRejectWith409() throws Exception {
        // Payment amount is 5jt, but allocation request is 8jt
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setCustomerId(testCustomer.getId());
        request.setPaymentDate(LocalDate.now());
        request.setAmount(new BigDecimal("5000000.00"));
        request.setPaymentMethod(PaymentMethod.CASH);

        AllocationItemRequest alloc = new AllocationItemRequest(testInvoice.getId(), new BigDecimal("8000000.00"), "Alokasi berlebih");
        request.setAllocations(List.of(alloc));

        mockMvc.perform(post("/api/pembayaran")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("PAYMENT_OVER_ALLOCATED"));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void useDeposit_ShouldDeductBalanceAndApplyToInvoice() throws Exception {
        // First seed a deposit for customer by overpaying
        CreatePaymentRequest seedPayment = new CreatePaymentRequest();
        seedPayment.setCustomerId(testCustomer.getId());
        seedPayment.setPaymentDate(LocalDate.now());
        seedPayment.setAmount(new BigDecimal("3000000.00")); // Unallocated 3jt -> becomes deposit
        seedPayment.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        seedPayment.setNotes("Deposit awal untuk tes penggunaan");

        mockMvc.perform(post("/api/pembayaran")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(seedPayment)))
                .andExpect(status().isCreated());

        BigDecimal depositBefore = depositTransactionRepository.calculateCurrentBalanceByCustomerId(testCustomer.getId());
        assertTrue(depositBefore.compareTo(new BigDecimal("3000000.00")) >= 0);

        // Now use 2jt deposit to pay testInvoice
        UseDepositRequest useRequest = new UseDepositRequest();
        useRequest.setCustomerId(testCustomer.getId());
        useRequest.setInvoiceId(testInvoice.getId());
        useRequest.setAmount(new BigDecimal("2000000.00"));
        useRequest.setNotes("Pakai deposit 2jt untuk faktur test");

        mockMvc.perform(post("/api/deposits/use")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(useRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.type").value("DEPOSIT_USED"))
                .andExpect(jsonPath("$.data.amount").value(2000000.0));

        // Verify deposit deducted
        BigDecimal depositAfter = depositTransactionRepository.calculateCurrentBalanceByCustomerId(testCustomer.getId());
        assertEquals(depositBefore.subtract(new BigDecimal("2000000.00")), depositAfter);

        // Verify invoice paidAmount increased by 2jt
        Invoice updated = invoiceRepository.findById(testInvoice.getId()).orElseThrow();
        assertEquals(new BigDecimal("2000000.00"), updated.getPaidAmount());
        assertEquals(InvoicePaymentStatus.PARTIAL, updated.getPaymentStatus());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void adminAccessToPaymentMutation_ShouldReturn403Forbidden() throws Exception {
        // PRD §5.3 & AGENTS.md §11.3: Admin cannot create payment or mutate deposit
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setCustomerId(testCustomer.getId());
        request.setPaymentDate(LocalDate.now());
        request.setAmount(new BigDecimal("1000000.00"));
        request.setPaymentMethod(PaymentMethod.CASH);

        mockMvc.perform(post("/api/pembayaran")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        UseDepositRequest useDepositRequest = new UseDepositRequest(testCustomer.getId(), testInvoice.getId(), new BigDecimal("500000.00"), "Admin try");
        mockMvc.perform(post("/api/deposits/use")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(useDepositRequest)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }
}

package com.andara.erp.controller;

import com.andara.erp.dto.receipt.CreateReceiptRequest;
import com.andara.erp.entity.*;
import com.andara.erp.repository.CustomerRepository;
import com.andara.erp.repository.PaymentRepository;
import com.andara.erp.repository.ReceiptRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
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
class ReceiptControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ReceiptRepository receiptRepository;

    private Customer testCustomer;
    private Payment testPayment;

    @BeforeEach
    void setUp() {
        testCustomer = customerRepository.findById(1L).orElseThrow();

        // Create a standalone payment for testing receipt generation
        Payment payment = new Payment();
        payment.setNumber("PAY-TEST-" + System.currentTimeMillis());
        payment.setCustomer(testCustomer);
        payment.setDate(LocalDate.now());
        payment.setAmount(new BigDecimal("25000000.00"));
        payment.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        payment.setDestinationAccount("BCA 123456789");
        payment.setReference("TRF-REC-TEST");
        payment.setNotes("Pembayaran untuk tes kwitansi");
        payment.setStatus(PaymentStatus.CONFIRMED);
        payment.setCreatedBy("operator");
        testPayment = paymentRepository.save(payment);
    }

    @AfterEach
    void tearDown() {
        // Delete receipts associated with test payments
        List<Receipt> testReceipts = receiptRepository.findAll().stream()
                .filter(r -> r.getId() > 1) // preserve seed receipt id 1
                .toList();
        receiptRepository.deleteAll(testReceipts);

        if (testPayment != null && testPayment.getId() != null) {
            paymentRepository.deleteById(testPayment.getId());
        }
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void getReceiptList_ShouldReturnPaginatedList() throws Exception {
        mockMvc.perform(get("/api/kwitansi")
                        .param("page", "0")
                        .param("size", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void generateReceipt_Success_ShouldComputeTerbilangAndReturnCreated() throws Exception {
        CreateReceiptRequest request = new CreateReceiptRequest();
        request.setPaymentId(testPayment.getId());
        request.setReceiptDate(LocalDate.now());
        request.setReceivedFrom("PT Maju Bersama Sejahtera");
        request.setDescription("Pelunasan invoice operasional CV Andara");
        request.setNotes("Kwitansi resmi");

        mockMvc.perform(post("/api/kwitansi")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.number").value(startsWith("REC-AND/")))
                .andExpect(jsonPath("$.data.amount").value(25000000.0))
                .andExpect(jsonPath("$.data.spelledOut").value(containsString("Dua Puluh Lima Juta Rupiah")))
                .andExpect(jsonPath("$.data.receivedFrom").value("PT Maju Bersama Sejahtera"))
                .andExpect(jsonPath("$.data.paymentId").value(testPayment.getId()))
                .andExpect(jsonPath("$.data.status").value("VALID"));

        // Verify in DB
        Receipt saved = receiptRepository.findByPaymentId(testPayment.getId()).orElseThrow();
        assertEquals("Dua Puluh Lima Juta Rupiah", saved.getSpelledOut());
        assertEquals(ReceiptStatus.VALID, saved.getStatus());
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void generateReceipt_DuplicateForSamePayment_ShouldRejectWith409() throws Exception {
        // Generate first receipt
        CreateReceiptRequest request = new CreateReceiptRequest();
        request.setPaymentId(testPayment.getId());

        mockMvc.perform(post("/api/kwitansi")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Attempt second receipt for same payment -> 409 Conflict
        mockMvc.perform(post("/api/kwitansi")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(containsString("sudah pernah diterbitkan")));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void adminAccessToGenerateReceipt_ShouldReturn403Forbidden() throws Exception {
        CreateReceiptRequest request = new CreateReceiptRequest();
        request.setPaymentId(testPayment.getId());

        mockMvc.perform(post("/api/kwitansi")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void adminAccessToViewReceipt_ShouldReturn200OK() throws Exception {
        // Admin should be able to view receipt for printing and inspection
        mockMvc.perform(get("/api/kwitansi")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(get("/api/kwitansi/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void cancelReceipt_ShouldUpdateStatusToCancelled() throws Exception {
        CreateReceiptRequest request = new CreateReceiptRequest();
        request.setPaymentId(testPayment.getId());

        String responseStr = mockMvc.perform(post("/api/kwitansi")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long receiptId = objectMapper.readTree(responseStr).get("data").get("id").asLong();

        // Cancel
        mockMvc.perform(post("/api/kwitansi/" + receiptId + "/cancel")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CANCELLED"));

        Receipt updated = receiptRepository.findById(receiptId).orElseThrow();
        assertEquals(ReceiptStatus.CANCELLED, updated.getStatus());
    }
}

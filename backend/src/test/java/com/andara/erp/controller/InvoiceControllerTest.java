package com.andara.erp.controller;

import com.andara.erp.dto.invoice.CreateInvoiceDetailRequest;
import com.andara.erp.dto.invoice.CreateInvoiceRequest;
import com.andara.erp.dto.invoice.UpdateInvoiceRequest;
import com.andara.erp.dto.invoice.UpdateInvoiceStatusRequest;
import com.andara.erp.entity.Invoice;
import com.andara.erp.entity.InvoiceStatus;
import com.andara.erp.repository.InvoiceRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:postgresql://localhost:5432/andara_erp",
        "spring.datasource.username=andara_user",
        "spring.datasource.password=andara_dev_password_123"
})
@AutoConfigureMockMvc
class InvoiceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @org.junit.jupiter.api.AfterEach
    void tearDown() {
        List<Invoice> testInvoices = invoiceRepository.findAll().stream()
                .filter(inv -> inv.getId() > 2)
                .toList();
        invoiceRepository.deleteAll(testInvoices);
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void getInvoiceList_ShouldReturnPaginatedList() throws Exception {
        mockMvc.perform(get("/api/faktur")
                        .param("page", "0")
                        .param("size", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content.length()", greaterThanOrEqualTo(1)));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void getInvoiceById_ShouldReturnDetailsAndOutstanding() throws Exception {
        mockMvc.perform(get("/api/faktur/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.number").value("INV-AND/2026/09/0001"))
                .andExpect(jsonPath("$.data.customerId").value(1))
                .andExpect(jsonPath("$.data.totalAmount").value(26000000.0))
                .andExpect(jsonPath("$.data.paidAmount", notNullValue()))
                .andExpect(jsonPath("$.data.outstanding", notNullValue()))
                .andExpect(jsonPath("$.data.paymentStatus", notNullValue()))
                .andExpect(jsonPath("$.data.details.length()").value(2));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void getBillableItemsFromPenawaran_ShouldReturnRemainingQuantities() throws Exception {
        // Penawaran 1 has 4 items. Detail 1: 80m2 with 80m2 billed in Invoice 1 -> remaining 0m2 (fullyBilled=true)
        // Detail 3: 15 titik with 0 billed -> remaining 15 titik
        mockMvc.perform(get("/api/faktur/penawaran/1/billable")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(4))
                .andExpect(jsonPath("$.data[0].originalVolume").value(80.0))
                .andExpect(jsonPath("$.data[0].alreadyBilledVolume").value(80.0))
                .andExpect(jsonPath("$.data[0].remainingBillableVolume").value(0.0))
                .andExpect(jsonPath("$.data[0].fullyBilled").value(true))
                .andExpect(jsonPath("$.data[3].originalVolume").value(1.0))
                .andExpect(jsonPath("$.data[3].alreadyBilledVolume").value(0))
                .andExpect(jsonPath("$.data[3].remainingBillableVolume").value(1.0))
                .andExpect(jsonPath("$.data[3].fullyBilled").value(false));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void createInvoice_Manual_WithAutoNumbering_ShouldCalculateAuthoritatively() throws Exception {
        CreateInvoiceRequest request = new CreateInvoiceRequest();
        request.setCustomerId(1L);
        request.setDate(LocalDate.now());
        request.setDueDate(LocalDate.now().plusDays(14));
        request.setNotes("Faktur Penagihan Pekerjaan Tambahan");

        CreateInvoiceDetailRequest item1 = new CreateInvoiceDetailRequest(
                "Pekerjaan Partisi Kaca Tempered 10mm",
                new BigDecimal("5.00"),
                "m2",
                new BigDecimal("750000.00")
        );
        CreateInvoiceDetailRequest item2 = new CreateInvoiceDetailRequest(
                "Pemasangan Handle Pintu Stainless",
                new BigDecimal("2.00"),
                "unit",
                new BigDecimal("350000.00")
        );
        request.setDetails(List.of(item1, item2));

        // 5 * 750000 = 3750000; 2 * 350000 = 700000; Total = 4450000
        mockMvc.perform(post("/api/faktur")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.number").isNotEmpty())
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.data.paymentStatus").value("UNPAID"))
                .andExpect(jsonPath("$.data.totalAmount").value(4450000.0))
                .andExpect(jsonPath("$.data.outstanding").value(4450000.0))
                .andExpect(jsonPath("$.data.details.length()").value(2));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void createInvoice_FromPenawaran_Partial_ShouldSucceed() throws Exception {
        // Bill remaining 5.00 titik from Penawaran 1, Detail 3 (original 15, unbilled)
        CreateInvoiceRequest request = new CreateInvoiceRequest();
        request.setCustomerId(1L);
        request.setSourcePenawaranId(1L);
        request.setDate(LocalDate.now());

        CreateInvoiceDetailRequest item = new CreateInvoiceDetailRequest(
                "Instalasi Titik Lampu Downlight Termin I",
                new BigDecimal("5.00"),
                "titik",
                new BigDecimal("300000.00")
        );
        item.setSourcePenawaranDetailId(3L);
        request.setDetails(List.of(item));

        // 5 * 300000 = 1500000
        mockMvc.perform(post("/api/faktur")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.sourcePenawaranId").value(1))
                .andExpect(jsonPath("$.data.totalAmount").value(1500000.0));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void createInvoice_FromPenawaran_ExceedingQuantity_ShouldFailWithDoubleBillingPrevented() throws Exception {
        // Penawaran 1, Detail 3 only has 15 titik remaining.
        // Requesting 500 titik will definitely exceed and trigger anti-double-billing.
        CreateInvoiceRequest request = new CreateInvoiceRequest();
        request.setCustomerId(1L);
        request.setSourcePenawaranId(1L);
        request.setDate(LocalDate.now());

        CreateInvoiceDetailRequest item = new CreateInvoiceDetailRequest(
                "Instalasi Titik Lampu Berlebihan",
                new BigDecimal("500.00"),
                "titik",
                new BigDecimal("300000.00")
        );
        item.setSourcePenawaranDetailId(3L);
        request.setDetails(List.of(item));

        mockMvc.perform(post("/api/faktur")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("DOUBLE_BILLING_PREVENTED"))
                .andExpect(jsonPath("$.message", containsString("melebihi sisa volume")));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void updateInvoice_WithPayments_ShouldFailWithFinancialRecordLocked() throws Exception {
        // Create an invoice and simulate a paid amount
        CreateInvoiceRequest createReq = new CreateInvoiceRequest();
        createReq.setCustomerId(1L);
        createReq.setDate(LocalDate.now());
        createReq.setDetails(List.of(new CreateInvoiceDetailRequest("Test Paid Invoice", new BigDecimal("1.00"), "paket", new BigDecimal("1000000.00"))));

        String response = mockMvc.perform(post("/api/faktur")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long invoiceId = objectMapper.readTree(response).path("data").path("id").asLong();

        // Simulate payment recorded directly on entity
        Invoice inv = invoiceRepository.findById(invoiceId).orElseThrow();
        inv.setPaidAmount(new BigDecimal("500000.00"));
        invoiceRepository.save(inv);

        // Attempt to update invoice details
        UpdateInvoiceRequest updateReq = new UpdateInvoiceRequest();
        updateReq.setCustomerId(1L);
        updateReq.setDate(LocalDate.now());
        updateReq.setDetails(List.of(new CreateInvoiceDetailRequest("Mutated item", new BigDecimal("2.00"), "paket", new BigDecimal("2000000.00"))));

        mockMvc.perform(put("/api/faktur/" + invoiceId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("FINANCIAL_RECORD_LOCKED"));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void deleteInvoice_NonDraftOrWithPayments_ShouldReturnConflict() throws Exception {
        // Invoice 1 is ISSUED, should reject deletion
        mockMvc.perform(delete("/api/faktur/1")
                        .with(csrf()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("CONFLICT"));
    }
}

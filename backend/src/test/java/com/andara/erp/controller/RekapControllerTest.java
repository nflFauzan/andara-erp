package com.andara.erp.controller;

import com.andara.erp.entity.Customer;
import com.andara.erp.repository.CustomerRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
public class RekapControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CustomerRepository customerRepository;

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void getRekapCustomers_Success() throws Exception {
        mockMvc.perform(get("/api/rekap/customers")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.page.content", notNullValue()))
                .andExpect(jsonPath("$.data.totalCustomers", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.data.grandTotalInvoiceAmount", notNullValue()))
                .andExpect(jsonPath("$.data.grandTotalPaidAmount", notNullValue()));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void getRekapInvoices_AsAdmin_Success() throws Exception {
        mockMvc.perform(get("/api/rekap/invoices")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.page.content", notNullValue()))
                .andExpect(jsonPath("$.data.totalInvoices", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.data.grandTotalAmount", notNullValue()));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void getRekapPayments_Success() throws Exception {
        mockMvc.perform(get("/api/rekap/payments")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.page.content", notNullValue()))
                .andExpect(jsonPath("$.data.grandTotalAmount", notNullValue()));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void getRekapKegiatan_Success() throws Exception {
        mockMvc.perform(get("/api/rekap/kegiatan")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.page.content", notNullValue()))
                .andExpect(jsonPath("$.data.totalKegiatan", greaterThanOrEqualTo(1)));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void getRekapCustomers_WithDateRange_Success() throws Exception {
        mockMvc.perform(get("/api/rekap/customers")
                        .param("startDate", "2026-01-01")
                        .param("endDate", "2026-12-31")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.page.content", notNullValue()));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void getRekapKegiatan_WithDateRange_Success() throws Exception {
        mockMvc.perform(get("/api/rekap/kegiatan")
                        .param("startDate", "2026-01-01")
                        .param("endDate", "2026-12-31")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.page.content", notNullValue()));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void getRekapPenawaran_Success() throws Exception {
        mockMvc.perform(get("/api/rekap/penawaran")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.page.content", notNullValue()))
                .andExpect(jsonPath("$.data.totalPenawaran", notNullValue()))
                .andExpect(jsonPath("$.data.grandTotalAmount", notNullValue()))
                .andExpect(jsonPath("$.data.approvedCount", notNullValue()));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void getRekapPenawaran_WithDateRange_Success() throws Exception {
        mockMvc.perform(get("/api/rekap/penawaran")
                        .param("startDate", "2026-01-01")
                        .param("endDate", "2026-12-31")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.page.content", notNullValue()));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void getRekapPiutang_Success() throws Exception {
        mockMvc.perform(get("/api/rekap/piutang")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.page.content", notNullValue()))
                .andExpect(jsonPath("$.data.totalInvoicesWithOutstanding", notNullValue()))
                .andExpect(jsonPath("$.data.grandTotalOutstanding", notNullValue()))
                .andExpect(jsonPath("$.data.bucket1To30Amount", notNullValue()))
                .andExpect(jsonPath("$.data.bucketOver90Amount", notNullValue()));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void getRekapPiutang_WithAgingBucket_Success() throws Exception {
        mockMvc.perform(get("/api/rekap/piutang")
                        .param("agingBucket", "DAYS_1_30")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.page.content", notNullValue()));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void getCustomerStatement_Success() throws Exception {
        Long customerId = customerRepository.findAll().stream().findFirst().map(Customer::getId).orElse(1L);
        mockMvc.perform(get("/api/rekap/customers/" + customerId + "/statement")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.customerId").value(customerId))
                .andExpect(jsonPath("$.data.customerName", notNullValue()))
                .andExpect(jsonPath("$.data.items", notNullValue()));
    }

    @Test
    void getRekap_Unauthenticated_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/rekap/customers")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}

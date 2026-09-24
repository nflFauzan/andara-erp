package com.andara.erp.controller;

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
public class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void getDashboardSummary_AsOperator_Success() throws Exception {
        mockMvc.perform(get("/api/dashboard")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", notNullValue()))
                .andExpect(jsonPath("$.data.totalActiveCustomers", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.data.totalActiveKegiatan", greaterThanOrEqualTo(0)))
                .andExpect(jsonPath("$.data.totalInvoices", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.data.totalInvoiceAmount", notNullValue()))
                .andExpect(jsonPath("$.data.totalPayments", notNullValue()))
                .andExpect(jsonPath("$.data.totalOutstanding", notNullValue()))
                .andExpect(jsonPath("$.data.totalCustomerDeposit", notNullValue()))
                .andExpect(jsonPath("$.data.monthlyTrends", notNullValue()));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void getDashboardSummary_AsAdmin_Success() throws Exception {
        mockMvc.perform(get("/api/dashboard")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", notNullValue()))
                .andExpect(jsonPath("$.data.totalActiveCustomers", greaterThanOrEqualTo(1)));
    }

    @Test
    void getDashboardSummary_Unauthenticated_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/dashboard")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void getDashboardSummary_WithFilters_Success() throws Exception {
        mockMvc.perform(get("/api/dashboard")
                        .param("startDate", "2026-01-01")
                        .param("endDate", "2026-12-31")
                        .param("customerId", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", notNullValue()));
    }
}

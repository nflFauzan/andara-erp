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
public class RekapControllerTest {

    @Autowired
    private MockMvc mockMvc;

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
    void getRekap_Unauthenticated_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/rekap/customers")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}

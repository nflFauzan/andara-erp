package com.andara.erp.controller;

import com.andara.erp.dto.customer.CreateCustomerRequest;
import com.andara.erp.dto.customer.UpdateCustomerRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
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
class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void getCustomers_ShouldReturnPaginatedList() throws Exception {
        mockMvc.perform(get("/api/customers")
                        .param("page", "0")
                        .param("size", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content.length()", greaterThanOrEqualTo(1)));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void createCustomer_Success_ShouldReturn201() throws Exception {
        String uniqueCode = "TEST-" + System.currentTimeMillis();
        CreateCustomerRequest request = new CreateCustomerRequest();
        request.setCode(uniqueCode);
        request.setName("Customer Uji Coba " + System.currentTimeMillis());
        request.setCompanyName("PT Uji Coba");
        request.setPhone("08123456789");
        request.setEmail("test@ujicoba.com");
        request.setPicName("Budi");
        request.setAddress("Jl. Percobaan No. 1");

        mockMvc.perform(post("/api/customers")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.code").value(uniqueCode))
                .andExpect(jsonPath("$.data.depositBalance").value(0.0));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void createCustomer_DuplicateCode_ShouldReturn409() throws Exception {
        CreateCustomerRequest request = new CreateCustomerRequest();
        request.setCode("CUST-001"); // Already seeded in V3
        request.setName("Duplicate Customer Test");

        mockMvc.perform(post("/api/customers")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("CONFLICT"));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void getActiveCustomers_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/customers/active")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()", greaterThanOrEqualTo(1)));
    }
}

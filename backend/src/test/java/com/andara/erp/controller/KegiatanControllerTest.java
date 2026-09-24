package com.andara.erp.controller;

import com.andara.erp.dto.kegiatan.CreateKegiatanRequest;
import com.andara.erp.dto.kegiatan.KegiatanItemRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

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
class KegiatanControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void getKegiatan_ShouldReturnPaginatedList() throws Exception {
        mockMvc.perform(get("/api/kegiatan")
                        .param("page", "0")
                        .param("size", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content.length()", greaterThanOrEqualTo(1)));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void createKegiatan_WithItems_ShouldCalculateSubtotalAndTotalAuthoritatively() throws Exception {
        String uniqueCode = "ACT-TEST-" + System.currentTimeMillis();
        CreateKegiatanRequest request = new CreateKegiatanRequest();
        request.setCustomerId(1L); // PT. Mahakarya Citra Sejahtera
        request.setCode(uniqueCode);
        request.setName("Uji Coba Otomatisasi Perhitungan Keuangan");
        request.setLocation("Jakarta");

        KegiatanItemRequest item1 = new KegiatanItemRequest("Item Pengujian 1", new BigDecimal("10.00"), "m2", new BigDecimal("150000.00"));
        KegiatanItemRequest item2 = new KegiatanItemRequest("Item Pengujian 2", new BigDecimal("2.50"), "lot", new BigDecimal("400000.00"));
        request.setItems(List.of(item1, item2));

        // Calculation: (10.00 * 150000.00 = 1500000.00) + (2.50 * 400000.00 = 1000000.00) = 2500000.00
        mockMvc.perform(post("/api/kegiatan")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.code").value(uniqueCode))
                .andExpect(jsonPath("$.data.items.length()").value(2))
                .andExpect(jsonPath("$.data.items[0].subtotal").value(1500000.0))
                .andExpect(jsonPath("$.data.items[1].subtotal").value(1000000.0))
                .andExpect(jsonPath("$.data.totalAmount").value(2500000.0));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void createKegiatan_DuplicateCode_ShouldReturn409() throws Exception {
        CreateKegiatanRequest request = new CreateKegiatanRequest();
        request.setCustomerId(1L);
        request.setCode("ACT-2026-001"); // Seeded in V4
        request.setName("Duplicate Kegiatan Test");

        mockMvc.perform(post("/api/kegiatan")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("CONFLICT"));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void getKegiatanByCustomer_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/kegiatan/customer/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()", greaterThanOrEqualTo(1)));
    }
}

package com.andara.erp.controller;

import com.andara.erp.dto.numbering.PreviewNumberingRequest;
import com.andara.erp.dto.numbering.UpdateNumberingRequest;
import com.andara.erp.entity.DocumentType;
import com.andara.erp.entity.ResetPeriod;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

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
class NumberingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void getAllConfigurations_ShouldReturnAllFourTypes() throws Exception {
        mockMvc.perform(get("/api/numbering")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(4))
                .andExpect(jsonPath("$.data[*].documentType", hasItems("PENAWARAN", "FAKTUR", "PEMBAYARAN", "KWITANSI")));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void getConfiguration_Penawaran_ShouldReturnConfigWithPreview() throws Exception {
        mockMvc.perform(get("/api/numbering/PENAWARAN")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.documentType").value("PENAWARAN"))
                .andExpect(jsonPath("$.data.prefix").isNotEmpty())
                .andExpect(jsonPath("$.data.formatPattern").isNotEmpty())
                .andExpect(jsonPath("$.data.previewNumber").isNotEmpty());
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void previewNumbering_ShouldReturnRenderedSample() throws Exception {
        PreviewNumberingRequest request = new PreviewNumberingRequest();
        request.setFormatPattern("{PREFIX}/{YEAR}/{MONTH}/{COUNTER}");
        request.setPrefix("TEST-QUO");
        request.setCounterDigits(4);

        mockMvc.perform(post("/api/numbering/preview")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.formatPattern").value("{PREFIX}/{YEAR}/{MONTH}/{COUNTER}"))
                .andExpect(jsonPath("$.data.previewNumber", startsWith("TEST-QUO/")))
                .andExpect(jsonPath("$.data.previewNumber", endsWith("/0001")));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void updateConfiguration_ShouldUpdatePatternAndPrefix() throws Exception {
        UpdateNumberingRequest request = new UpdateNumberingRequest();
        request.setPrefix("INV-MOD");
        request.setSuffix("REV");
        request.setCounterDigits(4);
        request.setResetPeriod(ResetPeriod.MONTHLY);
        request.setFormatPattern("{PREFIX}/{YEAR}/{MONTH}/{COUNTER}/{SUFFIX}");

        mockMvc.perform(put("/api/numbering/FAKTUR")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.documentType").value("FAKTUR"))
                .andExpect(jsonPath("$.data.prefix").value("INV-MOD"))
                .andExpect(jsonPath("$.data.suffix").value("REV"))
                .andExpect(jsonPath("$.data.counterDigits").value(4))
                .andExpect(jsonPath("$.data.resetPeriod").value("MONTHLY"))
                .andExpect(jsonPath("$.data.formatPattern").value("{PREFIX}/{YEAR}/{MONTH}/{COUNTER}/{SUFFIX}"))
                .andExpect(jsonPath("$.data.previewNumber", containsString("INV-MOD")))
                .andExpect(jsonPath("$.data.previewNumber", endsWith("/REV")));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void generateNextNumber_ShouldIncrementCounterSequentially() throws Exception {
        // First generation
        String response1 = mockMvc.perform(post("/api/numbering/generate/KWITANSI")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isNotEmpty())
                .andReturn().getResponse().getContentAsString();

        // Second generation
        String response2 = mockMvc.perform(post("/api/numbering/generate/KWITANSI")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isNotEmpty())
                .andReturn().getResponse().getContentAsString();

        // The two generated numbers must be strictly different / sequential
        org.assertj.core.api.Assertions.assertThat(response1).isNotEqualTo(response2);
    }
}

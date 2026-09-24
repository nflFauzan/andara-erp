package com.andara.erp.controller;

import com.andara.erp.entity.Attachment;
import com.andara.erp.repository.AttachmentRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:postgresql://localhost:5432/andara_erp",
        "spring.datasource.username=andara_user",
        "spring.datasource.password=andara_dev_password_123",
        "app.storage.type=local",
        "app.storage.local-dir=target/test-uploads"
})
@AutoConfigureMockMvc
class AttachmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AttachmentRepository attachmentRepository;

    @BeforeEach
    void setUp() {
    }

    @AfterEach
    void tearDown() {
        List<Attachment> testAttachments = attachmentRepository.findByReferenceTypeAndReferenceIdOrderByCreatedAtDesc("TEST_ENTITY", 999L);
        attachmentRepository.deleteAll(testAttachments);
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void uploadAttachment_ValidPdf_ShouldSucceed() throws Exception {
        byte[] pdfContent = "%PDF-1.4 Mock PDF file content for test".getBytes(StandardCharsets.UTF_8);
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "bukti_transfer_999.pdf",
                "application/pdf",
                pdfContent
        );

        mockMvc.perform(multipart("/api/attachments/upload")
                        .file(file)
                        .param("referenceType", "TEST_ENTITY")
                        .param("referenceId", "999")
                        .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.originalFilename").value("bukti_transfer_999.pdf"))
                .andExpect(jsonPath("$.data.contentType").value("application/pdf"))
                .andExpect(jsonPath("$.data.sizeBytes").value(pdfContent.length))
                .andExpect(jsonPath("$.data.checksum").isNotEmpty())
                .andExpect(jsonPath("$.data.downloadUrl").isNotEmpty());
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void uploadAttachment_InvalidFileType_ShouldRejectWith400() throws Exception {
        MockMultipartFile scriptFile = new MockMultipartFile(
                "file",
                "malicious.sh",
                "application/x-sh",
                "#!/bin/bash\necho hello".getBytes(StandardCharsets.UTF_8)
        );

        mockMvc.perform(multipart("/api/attachments/upload")
                        .file(scriptFile)
                        .param("referenceType", "TEST_ENTITY")
                        .param("referenceId", "999")
                        .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(containsString("Tipe file tidak diizinkan")));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void getAttachmentsByReference_BothEndpoints_ShouldReturnList() throws Exception {
        // Upload a file first
        byte[] imageContent = "mock image bytes".getBytes(StandardCharsets.UTF_8);
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "foto_lapangan.png",
                "image/png",
                imageContent
        );

        mockMvc.perform(multipart("/api/attachments/upload")
                        .file(file)
                        .param("referenceType", "TEST_ENTITY")
                        .param("referenceId", "999")
                        .with(csrf()))
                .andExpect(status().isCreated());

        // Test /api/attachments/reference/...
        mockMvc.perform(get("/api/attachments/reference/TEST_ENTITY/999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].originalFilename").value("foto_lapangan.png"));

        // Test /api/files/reference/... alias
        mockMvc.perform(get("/api/files/reference/TEST_ENTITY/999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void downloadAndDeleteAttachment_ShouldSucceed() throws Exception {
        byte[] testBytes = "Hello CV Andara Attachment Test".getBytes(StandardCharsets.UTF_8);
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "dokumen_kontrak.pdf",
                "application/pdf",
                testBytes
        );

        String uploadResponse = mockMvc.perform(multipart("/api/files/upload")
                        .file(file)
                        .param("referenceType", "TEST_ENTITY")
                        .param("referenceId", "999")
                        .with(csrf()))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        // Extract attachment ID
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        Long attachmentId = mapper.readTree(uploadResponse).get("data").get("id").asLong();

        // Download
        mockMvc.perform(get("/api/files/" + attachmentId + "/download"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", containsString("dokumen_kontrak.pdf")))
                .andExpect(content().bytes(testBytes));

        // Delete
        mockMvc.perform(delete("/api/files/" + attachmentId).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // After deletion, download should return 404
        mockMvc.perform(get("/api/files/" + attachmentId + "/download"))
                .andExpect(status().isNotFound());
    }
}

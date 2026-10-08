package com.andara.erp.controller;

import com.andara.erp.dto.penawaran.CreatePenawaranDetailRequest;
import com.andara.erp.dto.penawaran.CreatePenawaranRequest;
import com.andara.erp.dto.penawaran.UpdatePenawaranRequest;
import com.andara.erp.dto.penawaran.UpdatePenawaranStatusRequest;
import com.andara.erp.entity.PenawaranStatus;
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
class PenawaranControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private com.andara.erp.repository.PenawaranRepository penawaranRepository;

    @Autowired
    private com.andara.erp.repository.KegiatanRepository kegiatanRepository;

    @Autowired
    private com.andara.erp.repository.KegiatanItemRepository kegiatanItemRepository;

    private java.util.Set<Long> initialPenawaranIds;
    private java.util.Set<Long> initialKegiatanIds;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        initialPenawaranIds = penawaranRepository.findAll().stream()
                .map(com.andara.erp.entity.Penawaran::getId)
                .collect(java.util.stream.Collectors.toSet());
        initialKegiatanIds = kegiatanRepository.findAll().stream()
                .map(com.andara.erp.entity.Kegiatan::getId)
                .collect(java.util.stream.Collectors.toSet());
    }

    @org.junit.jupiter.api.AfterEach
    void tearDown() {
        if (initialPenawaranIds != null) {
            List<com.andara.erp.entity.Penawaran> testPenawaran = penawaranRepository.findAll().stream()
                    .filter(p -> !initialPenawaranIds.contains(p.getId()))
                    .toList();
            penawaranRepository.deleteAll(testPenawaran);
        }
        if (initialKegiatanIds != null) {
            List<com.andara.erp.entity.Kegiatan> testKegiatan = kegiatanRepository.findAll().stream()
                    .filter(k -> !initialKegiatanIds.contains(k.getId()))
                    .toList();
            kegiatanRepository.deleteAll(testKegiatan);
        }
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void getPenawaranList_ShouldReturnPaginatedList() throws Exception {
        mockMvc.perform(get("/api/penawaran")
                        .param("page", "0")
                        .param("size", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content.length()", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.data.content[0].kegiatanCount", notNullValue()))
                .andExpect(jsonPath("$.data.content[0].itemCount", notNullValue()));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void getPenawaranById_ShouldReturnDetailsAndCustomer() throws Exception {
        mockMvc.perform(get("/api/penawaran/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.customerId").value(1))
                .andExpect(jsonPath("$.data.details.length()", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.data.totalAmount").value(35000000.0));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void createPenawaran_WithAutoNumbering_ShouldCalculateAuthoritatively() throws Exception {
        CreatePenawaranRequest request = new CreatePenawaranRequest();
        request.setCustomerId(1L);
        request.setDate(LocalDate.now());
        request.setNotes("Uji Coba Penawaran Otomatis");
        request.setTerms("DP 50%, Pelunasan setelah pekerjaan selesai.");

        CreatePenawaranDetailRequest item1 = new CreatePenawaranDetailRequest("Pekerjaan Partisi Aluminium", new BigDecimal("10.00"), "m2", new BigDecimal("50000.00"));
        CreatePenawaranDetailRequest item2 = new CreatePenawaranDetailRequest("Instalasi Pintu Panel", new BigDecimal("2.00"), "unit", new BigDecimal("250000.00"));
        request.setItems(List.of(item1, item2));

        // Calculation: (10.00 * 50000.00 = 500000.00) + (2.00 * 250000.00 = 500000.00) = 1000000.00
        mockMvc.perform(post("/api/penawaran")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.number").isNotEmpty())
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.data.details.length()").value(2))
                .andExpect(jsonPath("$.data.details[0].amount").value(500000.0))
                .andExpect(jsonPath("$.data.details[1].amount").value(500000.0))
                .andExpect(jsonPath("$.data.totalAmount").value(1000000.0));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void updatePenawaranStatus_Lifecycle_ShouldSucceed() throws Exception {
        // Create draft first
        CreatePenawaranRequest createReq = new CreatePenawaranRequest();
        createReq.setCustomerId(1L);
        createReq.setItems(List.of(new CreatePenawaranDetailRequest("Item Test Lifecycle", new BigDecimal("1.00"), "paket", new BigDecimal("100000.00"))));

        String response = mockMvc.perform(post("/api/penawaran")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long createdId = objectMapper.readTree(response).path("data").path("id").asLong();

        // 1. Transition DRAFT -> SENT
        UpdatePenawaranStatusRequest sentReq = new UpdatePenawaranStatusRequest(PenawaranStatus.SENT);
        sentReq.setNotes("Terkirim via email ke PIC");
        mockMvc.perform(patch("/api/penawaran/" + createdId + "/status")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sentReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SENT"));

        // 2. Transition SENT -> APPROVED
        UpdatePenawaranStatusRequest approvedReq = new UpdatePenawaranStatusRequest(PenawaranStatus.APPROVED);
        approvedReq.setNotes("Disetujui via SPK resmi");
        mockMvc.perform(patch("/api/penawaran/" + createdId + "/status")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(approvedReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("APPROVED"));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void financialLocking_UpdateApprovedPenawaran_ShouldReturnConflict() throws Exception {
        // Penawaran 1 is seeded as APPROVED
        UpdatePenawaranRequest updateReq = new UpdatePenawaranRequest();
        updateReq.setCustomerId(1L);
        updateReq.setItems(List.of(new CreatePenawaranDetailRequest("Illegal Update Item", new BigDecimal("1.00"), "unit", new BigDecimal("999999.00"))));

        mockMvc.perform(put("/api/penawaran/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("FINANCIAL_RECORD_LOCKED"))
                .andExpect(jsonPath("$.message", containsString("APPROVED")));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void deletePenawaran_Approved_ShouldReturnBadRequest() throws Exception {
        // Penawaran 1 is seeded as APPROVED
        mockMvc.perform(delete("/api/penawaran/1")
                        .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("DRAFT")));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void createPenawaran_WithGroupedKegiatan_ShouldPersistGroupsAndCalculateSubtotals() throws Exception {
        CreatePenawaranRequest request = new CreatePenawaranRequest();
        request.setCustomerId(1L);
        request.setDate(LocalDate.now());
        request.setNotes("Penawaran Berkelompok SPH");

        com.andara.erp.dto.penawaran.CreateSphKegiatanRequest groupA = new com.andara.erp.dto.penawaran.CreateSphKegiatanRequest();
        groupA.setName("Pembangunan Ruang Kelas Baru");
        groupA.setSortOrder(1);
        groupA.setItems(List.of(
                new CreatePenawaranDetailRequest("Pekerjaan Pondasi", new BigDecimal("10.00"), "m3", new BigDecimal("100000.00")),
                new CreatePenawaranDetailRequest("Pekerjaan Dinding", new BigDecimal("20.00"), "m2", new BigDecimal("50000.00"))
        ));

        com.andara.erp.dto.penawaran.CreateSphKegiatanRequest groupB = new com.andara.erp.dto.penawaran.CreateSphKegiatanRequest();
        groupB.setName("Pembangunan Perpustakaan");
        groupB.setSortOrder(2);
        groupB.setItems(List.of(
                new CreatePenawaranDetailRequest("Pekerjaan Atap", new BigDecimal("5.00"), "unit", new BigDecimal("200000.00"))
        ));

        request.setKegiatan(List.of(groupA, groupB));

        // Subtotal A = (10 * 100.000) + (20 * 50.000) = 1.000.000 + 1.000.000 = 2.000.000
        // Subtotal B = (5 * 200.000) = 1.000.000
        // Total SPH = 3.000.000
        mockMvc.perform(post("/api/penawaran")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.kegiatanList.length()").value(2))
                .andExpect(jsonPath("$.data.kegiatanList[0].name").value("Pembangunan Ruang Kelas Baru"))
                .andExpect(jsonPath("$.data.kegiatanList[0].subtotal").value(2000000.0))
                .andExpect(jsonPath("$.data.kegiatanList[0].kegiatanId", notNullValue()))
                .andExpect(jsonPath("$.data.kegiatanList[0].kegiatanCode", startsWith("ACT-")))
                .andExpect(jsonPath("$.data.kegiatanList[0].items.length()").value(2))
                .andExpect(jsonPath("$.data.kegiatanList[1].name").value("Pembangunan Perpustakaan"))
                .andExpect(jsonPath("$.data.kegiatanList[1].subtotal").value(1000000.0))
                .andExpect(jsonPath("$.data.kegiatanList[1].kegiatanId", notNullValue()))
                .andExpect(jsonPath("$.data.kegiatanList[1].kegiatanCode", startsWith("ACT-")))
                .andExpect(jsonPath("$.data.totalAmount").value(3000000.0));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void createPenawaran_WithoutExistingKegiatan_ShouldAutoCreateMasterKegiatanAndItems() throws Exception {
        CreatePenawaranRequest request = new CreatePenawaranRequest();
        request.setCustomerId(1L);
        request.setDate(LocalDate.now());
        request.setNotes("Uji Coba Auto Create Kegiatan Master (Opsi A)");

        com.andara.erp.dto.penawaran.CreateSphKegiatanRequest group = new com.andara.erp.dto.penawaran.CreateSphKegiatanRequest();
        group.setName("Renovasi Gedung Laboratorium Komputer");
        group.setSortOrder(1);
        group.setItems(List.of(
                new CreatePenawaranDetailRequest("Pemasangan Jaringan LAN", new BigDecimal("5.00"), "titik", new BigDecimal("150000.00")),
                new CreatePenawaranDetailRequest("Pengadaan Meja Komputer", new BigDecimal("10.00"), "unit", new BigDecimal("750000.00"))
        ));
        request.setKegiatan(List.of(group));

        String res = mockMvc.perform(post("/api/penawaran")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.kegiatanList[0].kegiatanId", notNullValue()))
                .andExpect(jsonPath("$.data.kegiatanList[0].kegiatanCode", startsWith("ACT-")))
                .andReturn().getResponse().getContentAsString();

        Long autoCreatedKegiatanId = objectMapper.readTree(res)
                .path("data").path("kegiatanList").get(0).path("kegiatanId").asLong();

        // Verifikasi entitas master Kegiatan terbentuk di DB
        com.andara.erp.entity.Kegiatan masterKegiatan = kegiatanRepository.findById(autoCreatedKegiatanId).orElse(null);
        org.junit.jupiter.api.Assertions.assertNotNull(masterKegiatan);
        org.junit.jupiter.api.Assertions.assertEquals("Renovasi Gedung Laboratorium Komputer", masterKegiatan.getName());
        org.junit.jupiter.api.Assertions.assertEquals(com.andara.erp.entity.KegiatanStatus.ACTIVE, masterKegiatan.getStatus());
        org.junit.jupiter.api.Assertions.assertEquals(1L, masterKegiatan.getCustomer().getId());
        List<com.andara.erp.entity.KegiatanItem> items = kegiatanItemRepository.findByKegiatanIdOrderBySortOrderAscIdAsc(autoCreatedKegiatanId);
        org.junit.jupiter.api.Assertions.assertEquals(2, items.size());
        org.junit.jupiter.api.Assertions.assertEquals("Pemasangan Jaringan LAN", items.get(0).getDescription());
        org.junit.jupiter.api.Assertions.assertEquals("Pengadaan Meja Komputer", items.get(1).getDescription());
        // Subtotal = (5 * 150.000 = 750.000) + (10 * 750.000 = 7.500.000) = 8.250.000
        org.junit.jupiter.api.Assertions.assertEquals(new BigDecimal("8250000.00"), masterKegiatan.getTotalAmount());
    }

    @Test
    @WithMockUser(username = "operator", roles = {"OPERATOR"})
    void getPenawaranByCustomerId_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/penawaran/customer/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }
}

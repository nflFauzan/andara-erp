package com.andara.erp.service;

import com.andara.erp.common.exception.AppException;
import com.andara.erp.common.exception.ErrorCode;
import com.andara.erp.dto.penawaran.PenawaranDTO;
import com.andara.erp.entity.*;
import com.andara.erp.repository.CustomerRepository;
import com.andara.erp.repository.PenawaranRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PenawaranDuplicateTest {

    @Mock
    private PenawaranRepository penawaranRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private NumberingService numberingService;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private PenawaranService penawaranService;

    private Customer testCustomer;
    private Penawaran sourcePenawaran;

    @BeforeEach
    void setUp() {
        testCustomer = new Customer();
        testCustomer.setId(1L);
        testCustomer.setCode("CUST-001");
        testCustomer.setName("PT. Bangun Jaya");
        testCustomer.setActive(true);

        sourcePenawaran = new Penawaran();
        sourcePenawaran.setId(10L);
        sourcePenawaran.setNumber("005/SPH/ANDARA/X/2026");
        sourcePenawaran.setCustomer(testCustomer);
        sourcePenawaran.setDate(LocalDate.of(2026, 10, 1));
        sourcePenawaran.setStatus(PenawaranStatus.APPROVED);
        sourcePenawaran.setNotes("Catatan khusus penawaran acuan");
        sourcePenawaran.setTerms("Syarat pembayaran termin 30-50-20");

        SphKegiatan k1 = new SphKegiatan("Pekerjaan Atap Rangka Baja", 1);
        PenawaranDetail d1 = new PenawaranDetail();
        d1.setDescription("Kuda-kuda Baja Ringan C75");
        d1.setVolume(new BigDecimal("150.00"));
        d1.setUnit("m2");
        d1.setUnitPrice(new BigDecimal("175000.00"));
        d1.setAmount(new BigDecimal("26250000.00"));
        d1.setSortOrder(1);
        k1.addItem(d1);
        sourcePenawaran.addDetail(d1);

        sourcePenawaran.addKegiatan(k1);
    }

    @Test
    @DisplayName("Duplikasi SPH: Berhasil membuat SPH Draft baru dengan rincian kegiatan lengkap dan nomor baru")
    void testDuplicatePenawaran_Success() {
        when(penawaranRepository.findById(10L)).thenReturn(Optional.of(sourcePenawaran));
        when(numberingService.generateNextNumber(eq(DocumentType.PENAWARAN), any(LocalDate.class)))
                .thenReturn("010/SPH/ANDARA/X/2026");
        when(penawaranRepository.save(any(Penawaran.class))).thenAnswer(invocation -> {
            Penawaran p = invocation.getArgument(0);
            p.setId(99L);
            return p;
        });

        PenawaranDTO result = penawaranService.duplicatePenawaran(10L);

        assertNotNull(result);
        assertEquals(99L, result.getId());
        assertEquals("010/SPH/ANDARA/X/2026", result.getNumber());
        assertEquals(PenawaranStatus.DRAFT, result.getStatus(), "SPH hasil duplikasi wajib berstatus DRAFT");
        assertEquals(LocalDate.now(), result.getDate(), "Tanggal SPH hasil duplikasi diset ke tanggal hari ini");
        assertEquals(1L, result.getCustomerId());
        assertEquals("PT. Bangun Jaya", result.getCustomerName());
        assertEquals("Catatan khusus penawaran acuan", result.getNotes());
        assertEquals("Syarat pembayaran termin 30-50-20", result.getTerms());
        assertFalse(result.getIsAddendum(), "SPH duplikasi bukan addendum");

        // Verifikasi item & kegiatan
        assertEquals(1, result.getKegiatanList().size());
        assertEquals("Pekerjaan Atap Rangka Baja", result.getKegiatanList().get(0).getName());
        assertEquals(1, result.getDetails().size());
        assertEquals("Kuda-kuda Baja Ringan C75", result.getDetails().get(0).getDescription());
        assertEquals(new BigDecimal("150.00"), result.getDetails().get(0).getVolume());
        assertEquals(new BigDecimal("175000.00"), result.getDetails().get(0).getUnitPrice());
        assertEquals(new BigDecimal("26250000.00"), result.getTotalAmount());

        verify(auditLogService, times(1)).log(
                eq("DUPLICATE_PENAWARAN"),
                eq("PENAWARAN"),
                eq(99L),
                isNull(),
                contains("berhasil diduplikasi")
        );
    }

    @Test
    @DisplayName("Duplikasi SPH: Gagal jika customer sumber nonaktif")
    void testDuplicatePenawaran_InactiveCustomer_ThrowsException() {
        testCustomer.setActive(false);
        when(penawaranRepository.findById(10L)).thenReturn(Optional.of(sourcePenawaran));

        AppException ex = assertThrows(AppException.class, () -> penawaranService.duplicatePenawaran(10L));
        assertEquals(ErrorCode.INVALID_REQUEST, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("Customer dari SPH sumber saat ini nonaktif"));
    }

    @Test
    @DisplayName("Duplikasi SPH: Gagal jika SPH sumber tidak ditemukan")
    void testDuplicatePenawaran_SourceNotFound_ThrowsException() {
        when(penawaranRepository.findById(999L)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> penawaranService.duplicatePenawaran(999L));
        assertEquals(ErrorCode.PENAWARAN_NOT_FOUND, ex.getErrorCode());
    }
}

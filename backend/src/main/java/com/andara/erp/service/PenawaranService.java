package com.andara.erp.service;

import com.andara.erp.common.exception.AppException;
import com.andara.erp.common.exception.ErrorCode;
import com.andara.erp.dto.penawaran.*;
import com.andara.erp.entity.*;
import com.andara.erp.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PenawaranService {

    private final PenawaranRepository penawaranRepository;
    private final CustomerRepository customerRepository;
    private final KegiatanRepository kegiatanRepository;
    private final KegiatanItemRepository kegiatanItemRepository;
    private final ItemCatalogRepository itemCatalogRepository;
    private final NumberingService numberingService;
    private final AuditLogService auditLogService;

    public PenawaranService(
            PenawaranRepository penawaranRepository,
            CustomerRepository customerRepository,
            KegiatanRepository kegiatanRepository,
            KegiatanItemRepository kegiatanItemRepository,
            ItemCatalogRepository itemCatalogRepository,
            NumberingService numberingService,
            AuditLogService auditLogService
    ) {
        this.penawaranRepository = penawaranRepository;
        this.customerRepository = customerRepository;
        this.kegiatanRepository = kegiatanRepository;
        this.kegiatanItemRepository = kegiatanItemRepository;
        this.itemCatalogRepository = itemCatalogRepository;
        this.numberingService = numberingService;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public Page<PenawaranDTO> getPenawaranList(
            String search,
            Long customerId,
            PenawaranStatus status,
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable
    ) {
        String searchPattern = (search != null && !search.trim().isEmpty())
                ? "%" + search.trim().toLowerCase() + "%"
                : null;

        LocalDate effectiveStart = (startDate != null) ? startDate : LocalDate.of(2000, 1, 1);
        LocalDate effectiveEnd = (endDate != null) ? endDate : LocalDate.of(2099, 12, 31);

        Page<Penawaran> page = penawaranRepository.findWithFilters(
                searchPattern,
                customerId,
                status,
                effectiveStart,
                effectiveEnd,
                pageable
        );

        return page.map(p -> PenawaranDTO.fromEntity(p, false));
    }

    @Transactional(readOnly = true)
    public PenawaranDTO getPenawaranById(Long id) {
        Penawaran penawaran = penawaranRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PENAWARAN_NOT_FOUND, "Penawaran dengan ID " + id + " tidak ditemukan"));
        return PenawaranDTO.fromEntity(penawaran, true);
    }

    @Transactional(readOnly = true)
    public List<PenawaranDTO> getPenawaranByCustomerId(Long customerId) {
        return penawaranRepository.findByCustomerIdOrderByDateDesc(customerId).stream()
                .map(p -> PenawaranDTO.fromEntity(p, false))
                .collect(Collectors.toList());
    }

    @Transactional
    public PenawaranDTO createPenawaran(CreatePenawaranRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND, "Customer tidak ditemukan"));

        if (!customer.isActive()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Customer nonaktif tidak dapat dipilih untuk penawaran baru");
        }

        LocalDate date = request.getDate() != null ? request.getDate() : LocalDate.now();

        // Concurrency-safe auto-number generation or manual validation
        String number;
        if (request.getNumber() != null && !request.getNumber().trim().isEmpty()) {
            number = request.getNumber().trim();
            if (penawaranRepository.existsByNumber(number)) {
                throw new AppException(ErrorCode.CONFLICT, "Nomor penawaran '" + number + "' sudah terdaftar");
            }
        } else {
            number = numberingService.generateNextNumber(DocumentType.PENAWARAN, date);
        }

        Penawaran penawaran = new Penawaran();
        penawaran.setCustomer(customer);
        penawaran.setNumber(number);
        penawaran.setDate(date);
        penawaran.setStatus(PenawaranStatus.DRAFT);
        penawaran.setNotes(request.getNotes());
        penawaran.setTerms(request.getTerms());
        penawaran.setCreatedBy(getCurrentUsername());

        // Process details and kegiatan
        buildKegiatanAndDetails(penawaran, request.getKegiatan(), request.getItems());

        Penawaran saved = penawaranRepository.save(penawaran);
        return PenawaranDTO.fromEntity(saved, true);
    }

    @Transactional
    public PenawaranDTO updatePenawaran(Long id, UpdatePenawaranRequest request) {
        Penawaran penawaran = penawaranRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PENAWARAN_NOT_FOUND, "Penawaran tidak ditemukan"));

        // Financial locking safeguard: Approved penawaran cannot be modified
        if (penawaran.getStatus() == PenawaranStatus.APPROVED) {
            throw new AppException(
                    ErrorCode.FINANCIAL_RECORD_LOCKED,
                    "Penawaran berstatus APPROVED (Disetujui) tidak dapat diubah secara langsung demi menjaga integritas finansial."
            );
        }

        if (penawaran.getStatus() == PenawaranStatus.CANCELLED) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Penawaran yang telah dibatalkan tidak dapat diedit");
        }

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND, "Customer tidak ditemukan"));

        if (!customer.isActive() && !customer.getId().equals(penawaran.getCustomer().getId())) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Customer nonaktif tidak dapat dipilih untuk penawaran");
        }

        penawaran.setCustomer(customer);
        if (request.getDate() != null) {
            penawaran.setDate(request.getDate());
        }
        penawaran.setNotes(request.getNotes());
        penawaran.setTerms(request.getTerms());
        penawaran.setUpdatedBy(getCurrentUsername());
        penawaran.setUpdatedAt(OffsetDateTime.now());

        // Replace kegiatan and details
        penawaran.getKegiatanList().clear();
        penawaran.getDetails().clear();
        buildKegiatanAndDetails(penawaran, request.getKegiatan(), request.getItems());

        Penawaran updated = penawaranRepository.save(penawaran);
        return PenawaranDTO.fromEntity(updated, true);
    }

    @Transactional
    public PenawaranDTO updateStatus(Long id, UpdatePenawaranStatusRequest request) {
        Penawaran penawaran = penawaranRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Penawaran tidak ditemukan"));

        PenawaranStatus currentStatus = penawaran.getStatus();
        PenawaranStatus targetStatus = request.getStatus();

        if (currentStatus == targetStatus) {
            return PenawaranDTO.fromEntity(penawaran, true);
        }

        // Validate state transitions
        validateStatusTransition(currentStatus, targetStatus);

        penawaran.setStatus(targetStatus);
        if (request.getNotes() != null && !request.getNotes().trim().isEmpty()) {
            String updatedNotes = (penawaran.getNotes() != null ? penawaran.getNotes() + "\n" : "") +
                    "[" + targetStatus + "] " + request.getNotes().trim();
            penawaran.setNotes(updatedNotes);
        }

        penawaran.setUpdatedBy(getCurrentUsername());
        penawaran.setUpdatedAt(OffsetDateTime.now());

        Penawaran saved = penawaranRepository.save(penawaran);
        auditLogService.log(
                "UPDATE_STATUS_PENAWARAN",
                "PENAWARAN",
                saved.getId(),
                "Status: " + currentStatus,
                "Status: " + targetStatus + (request.getNotes() != null ? " (" + request.getNotes().trim() + ")" : "")
        );
        return PenawaranDTO.fromEntity(saved, true);
    }

    @Transactional
    public void deletePenawaran(Long id) {
        Penawaran penawaran = penawaranRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PENAWARAN_NOT_FOUND, "Penawaran tidak ditemukan"));

        if (penawaran.getStatus() != PenawaranStatus.DRAFT) {
            throw new AppException(
                    ErrorCode.INVALID_REQUEST,
                    "Hanya penawaran berstatus DRAFT yang dapat dihapus. Untuk membatalkan penawaran aktif, ubah status menjadi CANCELLED."
            );
        }

        auditLogService.log(
                "DELETE_PENAWARAN",
                "PENAWARAN",
                id,
                "Penawaran draft " + penawaran.getNumber() + " dihapus",
                null
        );
        penawaranRepository.delete(penawaran);
    }

    private void buildKegiatanAndDetails(Penawaran penawaran, List<CreateSphKegiatanRequest> kegiatanRequests, List<CreatePenawaranDetailRequest> itemRequests) {
        boolean hasKegiatan = kegiatanRequests != null && !kegiatanRequests.isEmpty();
        boolean hasItems = itemRequests != null && !itemRequests.isEmpty();

        if (!hasKegiatan && !hasItems) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Penawaran harus memiliki minimal 1 kegiatan atau item pekerjaan");
        }

        if (hasKegiatan) {
            int kOrder = 1;
            for (CreateSphKegiatanRequest kReq : kegiatanRequests) {
                SphKegiatan k = new SphKegiatan(kReq.getName().trim(), kReq.getSortOrder() != null && kReq.getSortOrder() > 0 ? kReq.getSortOrder() : kOrder++);
                int itemOrder = 1;
                if (kReq.getItems() != null && !kReq.getItems().isEmpty()) {
                    for (CreatePenawaranDetailRequest itemReq : kReq.getItems()) {
                        if (itemReq.getKegiatanId() == null && kReq.getKegiatanId() != null) {
                            itemReq.setKegiatanId(kReq.getKegiatanId());
                        }
                        PenawaranDetail detail = createDetailEntity(itemReq, itemOrder++);
                        k.addItem(detail);
                        penawaran.addDetail(detail);
                    }
                }
                penawaran.addKegiatan(k);
            }
        } else {
            // Backward-compatible fallback for flat items: wrap in single default group
            SphKegiatan defaultK = new SphKegiatan("Pekerjaan Utama", 1);
            int itemOrder = 1;
            for (CreatePenawaranDetailRequest itemReq : itemRequests) {
                PenawaranDetail detail = createDetailEntity(itemReq, itemOrder++);
                defaultK.addItem(detail);
                penawaran.addDetail(detail);
            }
            penawaran.addKegiatan(defaultK);
        }
    }

    private PenawaranDetail createDetailEntity(CreatePenawaranDetailRequest itemReq, int defaultSortOrder) {
        PenawaranDetail detail = new PenawaranDetail();
        detail.setDescription(itemReq.getDescription().trim());
        detail.setVolume(itemReq.getVolume());
        detail.setUnit(itemReq.getUnit().trim());
        detail.setUnitPrice(itemReq.getUnitPrice());
        detail.setSortOrder(itemReq.getSortOrder() != null && itemReq.getSortOrder() > 0 ? itemReq.getSortOrder() : defaultSortOrder);
        detail.setNotes(itemReq.getNotes());

        if (itemReq.getItemCatalogId() != null) {
            ItemCatalog itemCat = itemCatalogRepository.findById(itemReq.getItemCatalogId()).orElse(null);
            detail.setItemCatalog(itemCat);
        }

        if (itemReq.getKegiatanId() != null) {
            Kegiatan kegiatan = kegiatanRepository.findById(itemReq.getKegiatanId()).orElse(null);
            detail.setKegiatan(kegiatan);
        }

        if (itemReq.getKegiatanItemId() != null) {
            KegiatanItem kegiatanItem = kegiatanItemRepository.findById(itemReq.getKegiatanItemId()).orElse(null);
            detail.setKegiatanItem(kegiatanItem);
        }

        BigDecimal amount = detail.getVolume().multiply(detail.getUnitPrice()).setScale(2, RoundingMode.HALF_UP);
        detail.setAmount(amount);
        return detail;
    }

    private void validateStatusTransition(PenawaranStatus from, PenawaranStatus to) {
        boolean valid = switch (from) {
            case DRAFT -> (to == PenawaranStatus.SENT || to == PenawaranStatus.CANCELLED);
            case SENT -> (to == PenawaranStatus.APPROVED || to == PenawaranStatus.REJECTED || to == PenawaranStatus.CANCELLED || to == PenawaranStatus.DRAFT);
            case APPROVED -> (to == PenawaranStatus.CANCELLED);
            case REJECTED -> (to == PenawaranStatus.DRAFT || to == PenawaranStatus.CANCELLED);
            case CANCELLED -> false;
        };

        if (!valid) {
            throw new AppException(
                    ErrorCode.INVALID_REQUEST,
                    "Transisi status tidak valid dari " + from + " ke " + to
            );
        }
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.isAuthenticated()) ? auth.getName() : "system";
    }
}

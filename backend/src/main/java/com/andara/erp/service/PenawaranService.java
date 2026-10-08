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
            Boolean isAddendum,
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
                isAddendum,
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
        PenawaranDTO dto = PenawaranDTO.fromEntity(penawaran, true);

        // Fetch addendums if this is a parent quotation
        List<Penawaran> addendums = penawaranRepository.findByParentPenawaranIdOrderByAddendumNumberIndexAsc(id);
        if (!addendums.isEmpty()) {
            dto.setAddendums(addendums.stream()
                    .map(a -> PenawaranDTO.fromEntity(a, false))
                    .collect(Collectors.toList()));

            BigDecimal cumulative = penawaran.getTotalAmount() != null ? penawaran.getTotalAmount() : BigDecimal.ZERO;
            for (Penawaran a : addendums) {
                if (a.getStatus() == PenawaranStatus.APPROVED && a.getTotalAmount() != null) {
                    cumulative = cumulative.add(a.getTotalAmount());
                }
            }
            dto.setCumulativeTotalAmount(cumulative);
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public List<PenawaranDTO> getAddendumsByParentId(Long parentId) {
        penawaranRepository.findById(parentId)
                .orElseThrow(() -> new AppException(ErrorCode.PENAWARAN_NOT_FOUND, "SPH Induk tidak ditemukan"));
        return penawaranRepository.findByParentPenawaranIdOrderByAddendumNumberIndexAsc(parentId).stream()
                .map(a -> PenawaranDTO.fromEntity(a, false))
                .collect(Collectors.toList());
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

        Penawaran parentPenawaran = null;
        boolean isAddendum = Boolean.TRUE.equals(request.getIsAddendum()) || request.getParentPenawaranId() != null;
        int addendumIndex = 0;

        if (isAddendum && request.getParentPenawaranId() != null) {
            parentPenawaran = penawaranRepository.findById(request.getParentPenawaranId())
                    .orElseThrow(() -> new AppException(ErrorCode.PENAWARAN_NOT_FOUND, "SPH Induk tidak ditemukan"));

            if (parentPenawaran.getStatus() != PenawaranStatus.APPROVED) {
                throw new AppException(ErrorCode.INVALID_REQUEST,
                        "SPH Addendum hanya dapat dibuat dari SPH Induk yang telah berstatus DISETUJUI (APPROVED)");
            }

            if (!parentPenawaran.getCustomer().getId().equals(customer.getId())) {
                throw new AppException(ErrorCode.INVALID_REQUEST, "Customer SPH Addendum harus sama dengan customer SPH Induk");
            }

            long currentCount = penawaranRepository.countByParentPenawaranId(parentPenawaran.getId());
            addendumIndex = request.getAddendumNumberIndex() != null && request.getAddendumNumberIndex() > 0
                    ? request.getAddendumNumberIndex()
                    : (int) currentCount + 1;
        }

        // Concurrency-safe auto-number generation or manual validation
        String number;
        if (request.getNumber() != null && !request.getNumber().trim().isEmpty()) {
            number = request.getNumber().trim();
            if (penawaranRepository.existsByNumber(number)) {
                throw new AppException(ErrorCode.CONFLICT, "Nomor penawaran '" + number + "' sudah terdaftar");
            }
        } else if (parentPenawaran != null) {
            // Auto-format addendum number: [parentNumber]/ADD-01
            number = parentPenawaran.getNumber() + "/ADD-" + String.format("%02d", addendumIndex);
            if (penawaranRepository.existsByNumber(number)) {
                number = parentPenawaran.getNumber() + "/ADD-" + String.format("%02d", addendumIndex) + "-" + System.currentTimeMillis() % 1000;
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

        if (parentPenawaran != null) {
            penawaran.setParentPenawaran(parentPenawaran);
            penawaran.setIsAddendum(true);
            penawaran.setAddendumNumberIndex(addendumIndex);
        }

        // Process details and kegiatan
        buildKegiatanAndDetails(penawaran, request.getKegiatan(), request.getItems());

        Penawaran saved = penawaranRepository.save(penawaran);

        if (parentPenawaran != null) {
            auditLogService.log(
                    "CREATE_ADDENDUM",
                    "PENAWARAN",
                    saved.getId(),
                    null,
                    "SPH Addendum " + saved.getNumber() + " dibuat atas SPH Induk " + parentPenawaran.getNumber()
            );
        }

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

        if (penawaranRepository.countByParentPenawaranId(id) > 0) {
            throw new AppException(
                    ErrorCode.INVALID_REQUEST,
                    "SPH Induk tidak dapat dihapus karena memiliki riwayat SPH Addendum"
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

    @Transactional
    public PenawaranDTO duplicatePenawaran(Long id) {
        Penawaran source = penawaranRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PENAWARAN_NOT_FOUND, "SPH sumber tidak ditemukan"));

        Customer customer = source.getCustomer();
        if (!customer.isActive()) {
            throw new AppException(ErrorCode.INVALID_REQUEST,
                    "Customer dari SPH sumber saat ini nonaktif. Aktifkan customer terlebih dahulu untuk menduplikasi SPH.");
        }

        LocalDate today = LocalDate.now();
        String newNumber = numberingService.generateNextNumber(DocumentType.PENAWARAN, today);

        Penawaran duplicate = new Penawaran();
        duplicate.setCustomer(customer);
        duplicate.setNumber(newNumber);
        duplicate.setDate(today);
        duplicate.setStatus(PenawaranStatus.DRAFT);
        duplicate.setNotes(source.getNotes());
        duplicate.setTerms(source.getTerms());
        duplicate.setCreatedBy(getCurrentUsername());
        duplicate.setIsAddendum(false);
        duplicate.setAddendumNumberIndex(0);

        // Duplikasi rincian kegiatan dan detail item
        if (source.getKegiatanList() != null && !source.getKegiatanList().isEmpty()) {
            int kOrder = 1;
            for (SphKegiatan srcK : source.getKegiatanList()) {
                SphKegiatan newK = new SphKegiatan(srcK.getName(), srcK.getSortOrder() != null ? srcK.getSortOrder() : kOrder++);
                newK.setKegiatan(srcK.getKegiatan());
                int itemOrder = 1;
                if (srcK.getItems() != null && !srcK.getItems().isEmpty()) {
                    for (PenawaranDetail srcItem : srcK.getItems()) {
                        PenawaranDetail newItem = cloneDetailEntity(srcItem, itemOrder++);
                        newK.addItem(newItem);
                        duplicate.addDetail(newItem);
                    }
                }
                duplicate.addKegiatan(newK);
            }
        } else if (source.getDetails() != null && !source.getDetails().isEmpty()) {
            SphKegiatan defaultK = new SphKegiatan("Pekerjaan Utama", 1);
            int itemOrder = 1;
            for (PenawaranDetail srcItem : source.getDetails()) {
                PenawaranDetail newItem = cloneDetailEntity(srcItem, itemOrder++);
                defaultK.addItem(newItem);
                duplicate.addDetail(newItem);
            }
            duplicate.addKegiatan(defaultK);
        } else {
            throw new AppException(ErrorCode.INVALID_REQUEST, "SPH sumber tidak memiliki item pekerjaan untuk diduplikasi");
        }

        Penawaran saved = penawaranRepository.save(duplicate);

        auditLogService.log(
                "DUPLICATE_PENAWARAN",
                "PENAWARAN",
                saved.getId(),
                null,
                "SPH " + saved.getNumber() + " berhasil diduplikasi dari SPH " + source.getNumber()
        );

        return PenawaranDTO.fromEntity(saved, true);
    }

    private PenawaranDetail cloneDetailEntity(PenawaranDetail src, int defaultSortOrder) {
        PenawaranDetail detail = new PenawaranDetail();
        detail.setDescription(src.getDescription() != null ? src.getDescription().trim() : "");
        detail.setVolume(src.getVolume() != null ? src.getVolume() : BigDecimal.ONE);
        detail.setUnit(src.getUnit() != null ? src.getUnit().trim() : "unit");
        detail.setUnitPrice(src.getUnitPrice() != null ? src.getUnitPrice() : BigDecimal.ZERO);
        detail.setSortOrder(src.getSortOrder() != null && src.getSortOrder() > 0 ? src.getSortOrder() : defaultSortOrder);
        detail.setNotes(src.getNotes());
        detail.setItemCatalog(src.getItemCatalog());
        detail.setKegiatan(src.getKegiatan());
        detail.setKegiatanItem(src.getKegiatanItem());
        BigDecimal amount = detail.getVolume().multiply(detail.getUnitPrice()).setScale(2, RoundingMode.HALF_UP);
        detail.setAmount(amount);
        return detail;
    }

    private synchronized String generateNextKegiatanCode(int year) {
        String prefix = "ACT-" + year + "-";
        List<String> codes = kegiatanRepository.findCodesMatching(prefix + "%");
        int maxSeq = 0;
        if (codes != null) {
            for (String c : codes) {
                if (c != null && c.startsWith(prefix)) {
                    String suffix = c.substring(prefix.length());
                    try {
                        int seq = Integer.parseInt(suffix);
                        if (seq > maxSeq) {
                            maxSeq = seq;
                        }
                    } catch (NumberFormatException ignored) {
                    }
                }
            }
        }
        int nextSeq = maxSeq + 1;
        String candidate = String.format("%s%03d", prefix, nextSeq);
        while (kegiatanRepository.existsByCode(candidate)) {
            nextSeq++;
            candidate = String.format("%s%03d", prefix, nextSeq);
        }
        return candidate;
    }

    private Kegiatan autoCreateKegiatanForSph(Penawaran penawaran, CreateSphKegiatanRequest kReq) {
        Customer customer = penawaran.getCustomer();
        int year = penawaran.getDate() != null ? penawaran.getDate().getYear() : LocalDate.now().getYear();
        String code = generateNextKegiatanCode(year);

        Kegiatan k = new Kegiatan();
        k.setCustomer(customer);
        k.setCode(code);
        String name = (kReq.getName() != null && !kReq.getName().trim().isEmpty())
                ? kReq.getName().trim()
                : "Pekerjaan SPH";
        k.setName(name);
        if (customer != null && customer.getAddress() != null) {
            k.setLocation(customer.getAddress());
        }
        k.setDescription("Didaftarkan otomatis melalui SPH " + (penawaran.getNumber() != null ? penawaran.getNumber() : ""));
        k.setStatus(KegiatanStatus.ACTIVE);
        k.setCreatedBy(getCurrentUsername());
        k.setUpdatedBy(getCurrentUsername());

        BigDecimal total = BigDecimal.ZERO;
        if (kReq.getItems() != null && !kReq.getItems().isEmpty()) {
            int itemOrder = 1;
            for (CreatePenawaranDetailRequest it : kReq.getItems()) {
                KegiatanItem ki = new KegiatanItem();
                ki.setDescription(it.getDescription() != null ? it.getDescription().trim() : "-");
                BigDecimal vol = it.getVolume() != null ? it.getVolume() : BigDecimal.ONE;
                BigDecimal price = it.getUnitPrice() != null ? it.getUnitPrice() : BigDecimal.ZERO;
                ki.setVolume(vol);
                ki.setUnit(it.getUnit() != null ? it.getUnit().trim() : "unit");
                ki.setUnitPrice(price);
                BigDecimal subtotal = vol.multiply(price).setScale(2, RoundingMode.HALF_UP);
                ki.setSubtotal(subtotal);
                ki.setSortOrder(itemOrder++);
                ki.setNotes(it.getNotes());
                ki.setCreatedBy(getCurrentUsername());
                if (it.getItemCatalogId() != null) {
                    itemCatalogRepository.findById(it.getItemCatalogId()).ifPresent(ki::setItemCatalog);
                }
                k.addItem(ki);
                total = total.add(subtotal);
            }
        }
        k.setTotalAmount(total);
        Kegiatan saved = kegiatanRepository.save(k);

        // Map back IDs to request items so subsequent detail creation links correctly
        if (saved.getItems() != null && kReq.getItems() != null) {
            for (int i = 0; i < Math.min(saved.getItems().size(), kReq.getItems().size()); i++) {
                KegiatanItem savedItem = saved.getItems().get(i);
                CreatePenawaranDetailRequest itemReq = kReq.getItems().get(i);
                itemReq.setKegiatanId(saved.getId());
                itemReq.setKegiatanItemId(savedItem.getId());
            }
        }

        return saved;
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
                Kegiatan linkedKegiatan = null;
                if (kReq.getKegiatanId() != null) {
                    linkedKegiatan = kegiatanRepository.findById(kReq.getKegiatanId()).orElse(null);
                }
                // Opsi A: Auto-create Kegiatan in Master Data if not linked yet
                if (linkedKegiatan == null && penawaran.getCustomer() != null) {
                    linkedKegiatan = autoCreateKegiatanForSph(penawaran, kReq);
                }

                if (linkedKegiatan != null) {
                    k.setKegiatan(linkedKegiatan);
                    kReq.setKegiatanId(linkedKegiatan.getId());
                }

                int itemOrder = 1;
                if (kReq.getItems() != null && !kReq.getItems().isEmpty()) {
                    for (CreatePenawaranDetailRequest itemReq : kReq.getItems()) {
                        if (itemReq.getKegiatanId() == null && k.getKegiatan() != null) {
                            itemReq.setKegiatanId(k.getKegiatan().getId());
                        }

                        // If linked to existing Kegiatan but item is newly added in SPH, add to master items
                        if (linkedKegiatan != null && itemReq.getKegiatanItemId() == null && itemReq.getDescription() != null && !itemReq.getDescription().trim().isEmpty()) {
                            KegiatanItem newKi = new KegiatanItem();
                            newKi.setDescription(itemReq.getDescription().trim());
                            BigDecimal vol = itemReq.getVolume() != null ? itemReq.getVolume() : BigDecimal.ONE;
                            BigDecimal price = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : BigDecimal.ZERO;
                            newKi.setVolume(vol);
                            newKi.setUnit(itemReq.getUnit() != null ? itemReq.getUnit().trim() : "unit");
                            newKi.setUnitPrice(price);
                            BigDecimal subtotal = vol.multiply(price).setScale(2, RoundingMode.HALF_UP);
                            newKi.setSubtotal(subtotal);
                            newKi.setSortOrder(linkedKegiatan.getItems() != null ? linkedKegiatan.getItems().size() + 1 : 1);
                            newKi.setNotes(itemReq.getNotes());
                            newKi.setCreatedBy(getCurrentUsername());
                            if (itemReq.getItemCatalogId() != null) {
                                itemCatalogRepository.findById(itemReq.getItemCatalogId()).ifPresent(newKi::setItemCatalog);
                            }
                            linkedKegiatan.addItem(newKi);
                            BigDecimal sum = linkedKegiatan.getItems().stream()
                                    .map(KegiatanItem::getSubtotal)
                                    .filter(java.util.Objects::nonNull)
                                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                            linkedKegiatan.setTotalAmount(sum);
                            linkedKegiatan = kegiatanRepository.save(linkedKegiatan);
                            itemReq.setKegiatanItemId(newKi.getId());
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
            Kegiatan linkedKegiatan = null;
            if (itemRequests != null && !itemRequests.isEmpty() && itemRequests.get(0).getKegiatanId() != null) {
                linkedKegiatan = kegiatanRepository.findById(itemRequests.get(0).getKegiatanId()).orElse(null);
            }
            if (linkedKegiatan == null && penawaran.getCustomer() != null && itemRequests != null) {
                CreateSphKegiatanRequest fallbackReq = new CreateSphKegiatanRequest("Pekerjaan Utama", 1, itemRequests);
                linkedKegiatan = autoCreateKegiatanForSph(penawaran, fallbackReq);
            }
            if (linkedKegiatan != null) {
                defaultK.setKegiatan(linkedKegiatan);
            }
            int itemOrder = 1;
            if (itemRequests != null) {
                for (CreatePenawaranDetailRequest itemReq : itemRequests) {
                    if (itemReq.getKegiatanId() == null && defaultK.getKegiatan() != null) {
                        itemReq.setKegiatanId(defaultK.getKegiatan().getId());
                    }
                    PenawaranDetail detail = createDetailEntity(itemReq, itemOrder++);
                    defaultK.addItem(detail);
                    penawaran.addDetail(detail);
                }
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

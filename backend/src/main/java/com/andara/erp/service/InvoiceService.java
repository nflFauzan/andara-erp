package com.andara.erp.service;

import com.andara.erp.common.exception.AppException;
import com.andara.erp.common.exception.ErrorCode;
import com.andara.erp.dto.invoice.*;
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

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceDetailRepository invoiceDetailRepository;
    private final CustomerRepository customerRepository;
    private final PenawaranRepository penawaranRepository;
    private final PenawaranDetailRepository penawaranDetailRepository;
    private final KegiatanRepository kegiatanRepository;
    private final KegiatanItemRepository kegiatanItemRepository;
    private final NumberingService numberingService;
    private final AuditLogService auditLogService;

    public InvoiceService(
            InvoiceRepository invoiceRepository,
            InvoiceDetailRepository invoiceDetailRepository,
            CustomerRepository customerRepository,
            PenawaranRepository penawaranRepository,
            PenawaranDetailRepository penawaranDetailRepository,
            KegiatanRepository kegiatanRepository,
            KegiatanItemRepository kegiatanItemRepository,
            NumberingService numberingService,
            AuditLogService auditLogService
    ) {
        this.invoiceRepository = invoiceRepository;
        this.invoiceDetailRepository = invoiceDetailRepository;
        this.customerRepository = customerRepository;
        this.penawaranRepository = penawaranRepository;
        this.penawaranDetailRepository = penawaranDetailRepository;
        this.kegiatanRepository = kegiatanRepository;
        this.kegiatanItemRepository = kegiatanItemRepository;
        this.numberingService = numberingService;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public Page<InvoiceDTO> getInvoiceList(
            String search,
            Long customerId,
            InvoiceStatus status,
            InvoicePaymentStatus paymentStatus,
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable
    ) {
        String searchPattern = (search != null && !search.trim().isEmpty())
                ? "%" + search.trim().toLowerCase() + "%"
                : null;

        Page<Invoice> page = invoiceRepository.findWithFilters(
                searchPattern,
                customerId,
                status,
                paymentStatus,
                startDate,
                endDate,
                pageable
        );

        return page.map(inv -> InvoiceDTO.fromEntity(inv, false));
    }

    @Transactional(readOnly = true)
    public InvoiceDTO getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVOICE_NOT_FOUND, "Faktur dengan ID " + id + " tidak ditemukan"));
        return InvoiceDTO.fromEntity(invoice, true);
    }

    @Transactional(readOnly = true)
    public List<PenawaranBillableItemDTO> getBillableItemsFromPenawaran(Long penawaranId) {
        Penawaran penawaran = penawaranRepository.findById(penawaranId)
                .orElseThrow(() -> new AppException(ErrorCode.PENAWARAN_NOT_FOUND, "Penawaran dengan ID " + penawaranId + " tidak ditemukan"));

        List<PenawaranBillableItemDTO> billableList = new ArrayList<>();

        for (PenawaranDetail detail : penawaran.getDetails()) {
            BigDecimal billed = invoiceDetailRepository.sumBilledQuantityBySourcePenawaranDetailId(detail.getId(), null);
            BigDecimal remaining = detail.getVolume().subtract(billed).max(BigDecimal.ZERO);

            PenawaranBillableItemDTO dto = new PenawaranBillableItemDTO();
            dto.setPenawaranDetailId(detail.getId());
            if (detail.getKegiatan() != null) {
                dto.setKegiatanId(detail.getKegiatan().getId());
                dto.setKegiatanName(detail.getKegiatan().getName());
            }
            if (detail.getKegiatanItem() != null) {
                dto.setKegiatanItemId(detail.getKegiatanItem().getId());
            }
            dto.setDescription(detail.getDescription());
            dto.setUnit(detail.getUnit());
            dto.setUnitPrice(detail.getUnitPrice());
            dto.setOriginalVolume(detail.getVolume());
            dto.setAlreadyBilledVolume(billed);
            dto.setRemainingBillableVolume(remaining);
            dto.setFullyBilled(remaining.compareTo(BigDecimal.ZERO) <= 0);
            dto.setSortOrder(detail.getSortOrder());
            dto.setNotes(detail.getNotes());

            billableList.add(dto);
        }

        return billableList;
    }

    @Transactional
    public InvoiceDTO createInvoice(CreateInvoiceRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND, "Customer tidak ditemukan"));

        if (!customer.isActive()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Customer nonaktif tidak dapat dipilih untuk faktur");
        }

        Penawaran sourcePenawaran = null;
        if (request.getSourcePenawaranId() != null) {
            sourcePenawaran = penawaranRepository.findById(request.getSourcePenawaranId())
                    .orElseThrow(() -> new AppException(ErrorCode.PENAWARAN_NOT_FOUND, "Penawaran sumber tidak ditemukan"));

            if (!sourcePenawaran.getCustomer().getId().equals(customer.getId())) {
                throw new AppException(ErrorCode.INVALID_REQUEST, "Customer faktur harus sama dengan customer pada penawaran sumber");
            }
        }

        LocalDate date = request.getDate() != null ? request.getDate() : LocalDate.now();
        String number = numberingService.generateNextNumber(DocumentType.FAKTUR, date);

        Invoice invoice = new Invoice();
        invoice.setNumber(number);
        invoice.setCustomer(customer);
        invoice.setSourcePenawaran(sourcePenawaran);
        invoice.setDate(date);
        invoice.setDueDate(request.getDueDate());
        invoice.setStatus(InvoiceStatus.DRAFT);
        invoice.setPaymentStatus(InvoicePaymentStatus.UNPAID);
        invoice.setPaidAmount(BigDecimal.ZERO);
        invoice.setNotes(request.getNotes());
        invoice.setTerms(request.getTerms());
        invoice.setCreatedBy(getCurrentUsername());
        invoice.setUpdatedBy(getCurrentUsername());

        buildDetails(invoice, request.getDetails(), null);

        Invoice saved = invoiceRepository.save(invoice);
        auditLogService.log(
                "CREATE_INVOICE",
                "INVOICE",
                saved.getId(),
                null,
                "Faktur dibuat: " + saved.getNumber() + " nominal Rp" + saved.getTotalAmount()
        );
        return InvoiceDTO.fromEntity(saved, true);
    }

    @Transactional
    public InvoiceDTO updateInvoice(Long id, UpdateInvoiceRequest request) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVOICE_NOT_FOUND, "Faktur tidak ditemukan"));

        // Financial locking safeguard: Invoices with payments cannot be updated
        if (invoice.getPaidAmount().compareTo(BigDecimal.ZERO) > 0) {
            throw new AppException(
                    ErrorCode.FINANCIAL_RECORD_LOCKED,
                    "Faktur tidak dapat diubah karena telah memiliki catatan pembayaran (sudah dibayar Rp" + invoice.getPaidAmount() + ")"
            );
        }

        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new AppException(ErrorCode.CONFLICT, "Faktur yang telah dibatalkan tidak dapat diubah");
        }

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND, "Customer tidak ditemukan"));

        if (!customer.isActive() && !customer.getId().equals(invoice.getCustomer().getId())) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Customer nonaktif tidak dapat dipilih untuk faktur");
        }

        invoice.setCustomer(customer);
        if (request.getDate() != null) {
            invoice.setDate(request.getDate());
        }
        invoice.setDueDate(request.getDueDate());
        invoice.setNotes(request.getNotes());
        invoice.setTerms(request.getTerms());
        invoice.setUpdatedBy(getCurrentUsername());
        invoice.setUpdatedAt(OffsetDateTime.now());

        // Replace details safely
        invoice.getDetails().clear();
        buildDetails(invoice, request.getDetails(), invoice.getId());

        Invoice updated = invoiceRepository.save(invoice);
        return InvoiceDTO.fromEntity(updated, true);
    }

    @Transactional
    public InvoiceDTO updateStatus(Long id, UpdateInvoiceStatusRequest request) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVOICE_NOT_FOUND, "Faktur tidak ditemukan"));

        InvoiceStatus currentStatus = invoice.getStatus();
        InvoiceStatus targetStatus = request.getStatus();

        if (currentStatus == targetStatus) {
            return InvoiceDTO.fromEntity(invoice, true);
        }

        // Financial locking: Cannot cancel invoice that has payments
        if (targetStatus == InvoiceStatus.CANCELLED && invoice.getPaidAmount().compareTo(BigDecimal.ZERO) > 0) {
            throw new AppException(
                    ErrorCode.CONFLICT,
                    "Faktur tidak dapat dibatalkan karena memiliki riwayat pembayaran. Batalkan pembayaran terlebih dahulu."
            );
        }

        validateStatusTransition(currentStatus, targetStatus);

        invoice.setStatus(targetStatus);
        invoice.setUpdatedBy(getCurrentUsername());
        invoice.setUpdatedAt(OffsetDateTime.now());

        Invoice saved = invoiceRepository.save(invoice);
        auditLogService.log(
                "UPDATE_STATUS_INVOICE",
                "INVOICE",
                saved.getId(),
                "Status: " + currentStatus,
                "Status: " + targetStatus
        );
        return InvoiceDTO.fromEntity(saved, true);
    }

    @Transactional
    public void deleteInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVOICE_NOT_FOUND, "Faktur tidak ditemukan"));

        if (invoice.getStatus() != InvoiceStatus.DRAFT || invoice.getPaidAmount().compareTo(BigDecimal.ZERO) > 0) {
            throw new AppException(
                    ErrorCode.CONFLICT,
                    "Hanya faktur DRAFT tanpa riwayat pembayaran yang dapat dihapus. Untuk faktur resmi yang batal, ubah status menjadi CANCELLED."
            );
        }

        auditLogService.log(
                "DELETE_INVOICE",
                "INVOICE",
                id,
                "Faktur draft " + invoice.getNumber() + " dihapus",
                null
        );
        invoiceRepository.delete(invoice);
    }

    private void buildDetails(Invoice invoice, List<CreateInvoiceDetailRequest> itemRequests, Long currentInvoiceId) {
        if (itemRequests == null || itemRequests.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Faktur harus memiliki minimal 1 item");
        }

        int order = 1;
        for (CreateInvoiceDetailRequest itemReq : itemRequests) {
            InvoiceDetail detail = new InvoiceDetail();
            detail.setDescription(itemReq.getDescription().trim());
            detail.setQuantity(itemReq.getQuantity());
            detail.setUnit(itemReq.getUnit().trim());
            detail.setUnitPrice(itemReq.getUnitPrice());
            detail.setSortOrder(itemReq.getSortOrder() != null && itemReq.getSortOrder() > 0 ? itemReq.getSortOrder() : order++);
            detail.setNotes(itemReq.getNotes());

            // Source Penawaran Detail & Anti-Double-Billing enforcement
            if (itemReq.getSourcePenawaranDetailId() != null) {
                PenawaranDetail pDetail = penawaranDetailRepository.findById(itemReq.getSourcePenawaranDetailId())
                        .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Item penawaran sumber tidak ditemukan"));

                // Sum already billed quantity from all non-cancelled invoices (excluding current invoice if editing)
                BigDecimal alreadyBilled = invoiceDetailRepository.sumBilledQuantityBySourcePenawaranDetailId(pDetail.getId(), currentInvoiceId);
                BigDecimal requested = itemReq.getQuantity();
                BigDecimal maxAllowed = pDetail.getVolume().subtract(alreadyBilled).max(BigDecimal.ZERO);

                if (alreadyBilled.add(requested).compareTo(pDetail.getVolume()) > 0) {
                    throw new AppException(
                            ErrorCode.DOUBLE_BILLING_PREVENTED,
                            "Item '" + pDetail.getDescription() + "' melebihi sisa volume yang dapat ditagihkan. Tersisa: " +
                                    maxAllowed + " " + pDetail.getUnit() + ", diminta: " + requested + " " + pDetail.getUnit()
                    );
                }

                detail.setSourcePenawaranDetail(pDetail);
                if (pDetail.getKegiatan() != null) {
                    detail.setSourceKegiatan(pDetail.getKegiatan());
                }
                if (pDetail.getKegiatanItem() != null) {
                    detail.setSourceKegiatanItem(pDetail.getKegiatanItem());
                }
            } else {
                // Direct kegiatan / kegiatan item link (if manual billing with activity link)
                if (itemReq.getSourceKegiatanId() != null) {
                    Kegiatan kegiatan = kegiatanRepository.findById(itemReq.getSourceKegiatanId())
                            .orElseThrow(() -> new AppException(ErrorCode.KEGIATAN_NOT_FOUND, "Kegiatan tidak ditemukan"));
                    detail.setSourceKegiatan(kegiatan);
                }
                if (itemReq.getSourceKegiatanItemId() != null) {
                    KegiatanItem kegiatanItem = kegiatanItemRepository.findById(itemReq.getSourceKegiatanItemId())
                            .orElseThrow(() -> new AppException(ErrorCode.KEGIATAN_ITEM_NOT_FOUND, "Item kegiatan tidak ditemukan"));
                    detail.setSourceKegiatanItem(kegiatanItem);
                }
            }

            // Authoritative server calculation
            detail.calculateAmount();
            invoice.addDetail(detail);
        }
    }

    private void validateStatusTransition(InvoiceStatus from, InvoiceStatus to) {
        boolean valid = switch (from) {
            case DRAFT -> (to == InvoiceStatus.ISSUED || to == InvoiceStatus.CANCELLED);
            case ISSUED -> (to == InvoiceStatus.CANCELLED);
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

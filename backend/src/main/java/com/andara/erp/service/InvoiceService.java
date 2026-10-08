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
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
    private final PaymentAllocationRepository paymentAllocationRepository;

    public InvoiceService(
            InvoiceRepository invoiceRepository,
            InvoiceDetailRepository invoiceDetailRepository,
            CustomerRepository customerRepository,
            PenawaranRepository penawaranRepository,
            PenawaranDetailRepository penawaranDetailRepository,
            KegiatanRepository kegiatanRepository,
            KegiatanItemRepository kegiatanItemRepository,
            NumberingService numberingService,
            AuditLogService auditLogService,
            PaymentAllocationRepository paymentAllocationRepository
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
        this.paymentAllocationRepository = paymentAllocationRepository;
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
        InvoiceDTO dto = InvoiceDTO.fromEntity(invoice, true);

        List<PaymentAllocation> allocs = paymentAllocationRepository.findByInvoiceId(invoice.getId());
        if (allocs != null && !allocs.isEmpty()) {
            List<InvoicePaymentItemDTO> paymentDTOs = new ArrayList<>();
            for (PaymentAllocation alloc : allocs) {
                if (alloc.getPayment() != null && alloc.getPayment().getStatus() != com.andara.erp.entity.PaymentStatus.CANCELLED) {
                    InvoicePaymentItemDTO pDto = new InvoicePaymentItemDTO();
                    pDto.setId(alloc.getId());
                    pDto.setPaymentId(alloc.getPayment().getId());
                    pDto.setPaymentNumber(alloc.getPayment().getNumber());
                    pDto.setPaymentDate(alloc.getPayment().getDate());
                    pDto.setPaymentMethod(alloc.getPayment().getPaymentMethod());
                    pDto.setPaymentMethodLabel(alloc.getPayment().getPaymentMethod() != null ? alloc.getPayment().getPaymentMethod().getLabel() : "Transfer");
                    pDto.setAmount(alloc.getAmount());
                    pDto.setNotes(alloc.getNotes());
                    paymentDTOs.add(pDto);
                }
            }
            dto.setPayments(paymentDTOs);
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public List<PenawaranBillableItemDTO> getBillableItemsFromPenawaran(Long penawaranId) {
        // JOIN FETCH p.details loads all PenawaranDetail in one SQL query (avoids N+1).
        // IMPORTANT: buildKegiatanAndDetails() calls penawaran.addDetail(detail) for EVERY item,
        // even items that belong to a SphKegiatan. So penawaran.details ALREADY contains ALL items.
        // sphKegiatan on each detail is lazy-loaded within this @Transactional context.
        Penawaran penawaran = penawaranRepository.findByIdWithAllDetails(penawaranId)
                .orElseThrow(() -> new AppException(ErrorCode.PENAWARAN_NOT_FOUND, "Penawaran dengan ID " + penawaranId + " tidak ditemukan"));

        // Sort: group by kegiatan sortOrder first, then by item sortOrder within each kegiatan.
        // Items without sphKegiatan (null) go at the end.
        List<PenawaranDetail> sortedDetails = penawaran.getDetails().stream()
                .sorted(java.util.Comparator
                        .comparingInt((PenawaranDetail d) ->
                                d.getSphKegiatan() != null && d.getSphKegiatan().getSortOrder() != null
                                        ? d.getSphKegiatan().getSortOrder() : Integer.MAX_VALUE)
                        .thenComparingInt(d -> d.getSortOrder() != null ? d.getSortOrder() : 0))
                .collect(java.util.stream.Collectors.toList());

        List<PenawaranBillableItemDTO> billableList = new ArrayList<>();

        for (PenawaranDetail detail : sortedDetails) {
            BigDecimal billed = invoiceDetailRepository.sumBilledQuantityBySourcePenawaranDetailId(detail.getId(), null);
            BigDecimal remaining = detail.getVolume().subtract(billed).max(BigDecimal.ZERO);

            PenawaranBillableItemDTO dto = new PenawaranBillableItemDTO();
            dto.setPenawaranId(penawaran.getId());
            dto.setPenawaranNumber(penawaran.getNumber());
            dto.setPenawaranDetailId(detail.getId());
            // sphKegiatan is lazy-loaded here — safe within @Transactional, critical for frontend grouping
            if (detail.getSphKegiatan() != null) {
                dto.setSphKegiatanId(detail.getSphKegiatan().getId());
                dto.setSphKegiatanName(detail.getSphKegiatan().getName());
            }
            if (detail.getKegiatan() != null) {
                dto.setKegiatanId(detail.getKegiatan().getId());
                dto.setKegiatanCode(detail.getKegiatan().getCode());
                dto.setKegiatanName(detail.getKegiatan().getName());
            } else if (detail.getSphKegiatan() != null && detail.getSphKegiatan().getKegiatan() != null) {
                dto.setKegiatanId(detail.getSphKegiatan().getKegiatan().getId());
                dto.setKegiatanCode(detail.getSphKegiatan().getKegiatan().getCode());
                dto.setKegiatanName(detail.getSphKegiatan().getKegiatan().getName());
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

    @Transactional(readOnly = true)
    public List<PenawaranBillableItemDTO> getMultiSphBillableItems(List<Long> penawaranIds) {
        if (penawaranIds == null || penawaranIds.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Daftar ID penawaran tidak boleh kosong");
        }

        List<PenawaranBillableItemDTO> allBillable = new ArrayList<>();
        Long expectedCustomerId = null;

        for (Long penawaranId : penawaranIds) {
            Penawaran penawaran = penawaranRepository.findById(penawaranId)
                    .orElseThrow(() -> new AppException(ErrorCode.PENAWARAN_NOT_FOUND, "Penawaran dengan ID " + penawaranId + " tidak ditemukan"));

            if (penawaran.getStatus() != PenawaranStatus.APPROVED) {
                throw new AppException(
                        ErrorCode.INVALID_REQUEST,
                        "Penawaran " + penawaran.getNumber() + " belum berstatus APPROVED (Status saat ini: " + penawaran.getStatus() + ")"
                );
            }

            if (expectedCustomerId == null) {
                expectedCustomerId = penawaran.getCustomer().getId();
            } else if (!expectedCustomerId.equals(penawaran.getCustomer().getId())) {
                throw new AppException(
                        ErrorCode.INVALID_REQUEST,
                        "Semua Penawaran yang dikonsolidasi harus berasal dari Customer yang sama"
                );
            }

            allBillable.addAll(getBillableItemsFromPenawaran(penawaranId));
        }

        return allBillable;
    }

    @Transactional(readOnly = true)
    public List<RetentionMonitoringDTO> getRetentionMonitoring() {
        List<Invoice> retentionInvoices = invoiceRepository.findAllRetentionRelatedInvoices();
        return retentionInvoices.stream()
                .map(RetentionMonitoringDTO::fromEntity)
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public InvoiceDTO createInvoice(CreateInvoiceRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND, "Customer tidak ditemukan"));

        if (!customer.isActive()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Customer nonaktif tidak dapat dipilih untuk faktur");
        }

        List<Long> sourcePenawaranIds = request.getSourcePenawaranIds();
        Long primaryPenawaranId = request.getSourcePenawaranId();
        if (primaryPenawaranId == null && sourcePenawaranIds != null && !sourcePenawaranIds.isEmpty()) {
            primaryPenawaranId = sourcePenawaranIds.get(0);
        }

        // Role check: ADMIN must create invoice from SPH
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication() != null
                && SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin && primaryPenawaranId == null) {
            throw new AppException(ErrorCode.FORBIDDEN, "Role Admin wajib membuat faktur penjualan yang bersumber dari Surat Penawaran Harga (SPH)");
        }

        Penawaran sourcePenawaran = null;
        if (primaryPenawaranId != null) {
            sourcePenawaran = penawaranRepository.findById(primaryPenawaranId)
                    .orElseThrow(() -> new AppException(ErrorCode.PENAWARAN_NOT_FOUND, "Penawaran sumber tidak ditemukan"));

            // Guard: penawaran sumber harus berstatus APPROVED
            if (sourcePenawaran.getStatus() != PenawaranStatus.APPROVED) {
                throw new AppException(
                        ErrorCode.INVALID_REQUEST,
                        "Faktur hanya dapat dibuat dari Surat Penawaran yang telah berstatus DISETUJUI (APPROVED). " +
                        "Status saat ini: " + sourcePenawaran.getStatus()
                );
            }

            if (!sourcePenawaran.getCustomer().getId().equals(customer.getId())) {
                throw new AppException(ErrorCode.INVALID_REQUEST, "Customer faktur harus sama dengan customer pada penawaran sumber");
            }
        }

        if (sourcePenawaranIds != null && sourcePenawaranIds.size() > 1) {
            for (Long sphId : sourcePenawaranIds) {
                Penawaran sph = penawaranRepository.findById(sphId)
                        .orElseThrow(() -> new AppException(ErrorCode.PENAWARAN_NOT_FOUND, "Penawaran sumber dengan ID " + sphId + " tidak ditemukan"));
                if (sph.getStatus() != PenawaranStatus.APPROVED) {
                    throw new AppException(ErrorCode.INVALID_REQUEST, "Penawaran " + sph.getNumber() + " belum berstatus APPROVED");
                }
                if (!sph.getCustomer().getId().equals(customer.getId())) {
                    throw new AppException(ErrorCode.INVALID_REQUEST, "Semua penawaran sumber harus milik customer yang sama");
                }
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
        invoice.setClientPoNumber(request.getClientPoNumber() != null ? request.getClientPoNumber().trim() : null);
        invoice.setClientSpkNumber(request.getClientSpkNumber() != null ? request.getClientSpkNumber().trim() : null);
        invoice.setBastNumber(request.getBastNumber() != null ? request.getBastNumber().trim() : null);
        if (request.getTaxPpnType() != null) {
            invoice.setTaxPpnType(request.getTaxPpnType());
        }
        if (request.getTaxPpnRate() != null) {
            invoice.setTaxPpnRate(request.getTaxPpnRate());
        }
        if (request.getTaxPphType() != null) {
            invoice.setTaxPphType(request.getTaxPphType());
        }
        if (request.getTaxPphRate() != null) {
            invoice.setTaxPphRate(request.getTaxPphRate());
        }
        invoice.setStatus(InvoiceStatus.DRAFT);
        invoice.setPaymentStatus(InvoicePaymentStatus.UNPAID);
        invoice.setPaidAmount(BigDecimal.ZERO);
        invoice.setNotes(request.getNotes());
        invoice.setTerms(request.getTerms());
        invoice.setWorkLocation(request.getWorkLocation());
        invoice.setCreatedBy(getCurrentUsername());
        invoice.setUpdatedBy(getCurrentUsername());

        // Retention setup
        boolean isRetentionInvoice = Boolean.TRUE.equals(request.getIsRetentionInvoice());
        invoice.setIsRetentionInvoice(isRetentionInvoice);
        if (request.getParentSettlementInvoiceId() != null) {
            Invoice parentInv = invoiceRepository.findById(request.getParentSettlementInvoiceId())
                    .orElseThrow(() -> new AppException(ErrorCode.INVOICE_NOT_FOUND, "Faktur pelunasan induk tidak ditemukan"));
            invoice.setParentSettlementInvoice(parentInv);
        }

        boolean applyRetention = Boolean.TRUE.equals(request.getApplyRetention());
        if (applyRetention) {
            BigDecimal retPct = request.getRetentionPercentage() != null ? request.getRetentionPercentage() : new BigDecimal("5.00");
            if (retPct.compareTo(BigDecimal.ZERO) <= 0 || retPct.compareTo(new BigDecimal("100.00")) > 0) {
                throw new AppException(ErrorCode.INVALID_REQUEST, "Persentase retensi harus antara 0% dan 100%");
            }
            invoice.setRetentionPercentage(retPct);

            LocalDate retDueDate = request.getRetentionDueDate();
            if (retDueDate == null) {
                int months = (request.getRetentionMonths() != null && request.getRetentionMonths() > 0) ? request.getRetentionMonths() : 6;
                retDueDate = date.plusMonths(months);
            }
            invoice.setRetentionDueDate(retDueDate);
        }

        // Billing Mode & Termin % Handling
        BillingMode billingMode = request.getBillingMode() != null ? request.getBillingMode() : BillingMode.ITEM_VOLUME;
        invoice.setBillingMode(billingMode);

        if (billingMode == BillingMode.PERCENTAGE_TERMIN) {
            if (sourcePenawaran == null) {
                throw new AppException(ErrorCode.INVALID_REQUEST, "Penagihan mode Termin Persentase wajib memilih Surat Penawaran Harga (SPH) acuan");
            }
            if (request.getTerminPercentage() == null || request.getTerminPercentage().compareTo(BigDecimal.ZERO) <= 0) {
                throw new AppException(ErrorCode.INVALID_REQUEST, "Persentase termin harus lebih besar dari 0%");
            }
            if (request.getTerminPercentage().compareTo(new BigDecimal("100.00")) > 0) {
                throw new AppException(ErrorCode.INVALID_REQUEST, "Persentase termin tidak boleh melebihi 100%");
            }

            BigDecimal alreadyBilled = invoiceRepository.sumBilledTerminPercentageBySourcePenawaranId(sourcePenawaran.getId(), null);
            if (alreadyBilled == null) {
                alreadyBilled = BigDecimal.ZERO;
            }
            BigDecimal cumulative = alreadyBilled.add(request.getTerminPercentage());
            if (cumulative.compareTo(new BigDecimal("100.00")) > 0) {
                BigDecimal remaining = new BigDecimal("100.00").subtract(alreadyBilled).max(BigDecimal.ZERO);
                throw new AppException(
                        ErrorCode.DOUBLE_BILLING_PREVENTED,
                        "Akumulasi termin (" + cumulative + "%) melebihi 100% total penawaran. Sisa termin yang tersedia: " + remaining + "%"
                );
            }

            invoice.setTerminPercentage(request.getTerminPercentage());
            String terminName = (request.getTerminName() != null && !request.getTerminName().trim().isEmpty())
                    ? request.getTerminName().trim()
                    : "Termin " + request.getTerminPercentage().stripTrailingZeros().toPlainString() + "%";
            invoice.setTerminName(terminName);

            if (request.getPreviousDpInvoiceId() != null) {
                Invoice prevDp = invoiceRepository.findById(request.getPreviousDpInvoiceId())
                        .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Faktur DP referensi tidak ditemukan"));
                if (prevDp.getStatus() == InvoiceStatus.CANCELLED) {
                    throw new AppException(ErrorCode.INVALID_REQUEST, "Faktur DP yang dibatalkan tidak dapat digunakan sebagai potongan");
                }
                if (!prevDp.getCustomer().getId().equals(customer.getId())) {
                    throw new AppException(ErrorCode.INVALID_REQUEST, "Faktur DP harus berasal dari customer yang sama");
                }
                invoice.setPreviousDpInvoice(prevDp);
            }
        }

        buildDetails(invoice, request.getDetails(), null);

        Invoice saved = invoiceRepository.save(invoice);

        if (applyRetention && saved.getRetentionAmount() != null && saved.getRetentionAmount().compareTo(BigDecimal.ZERO) > 0 && !Boolean.TRUE.equals(saved.getIsRetentionInvoice())) {
            createOrSyncRetentionCompanionInvoice(saved);
        }

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
        invoice.setClientPoNumber(request.getClientPoNumber() != null ? request.getClientPoNumber().trim() : null);
        invoice.setClientSpkNumber(request.getClientSpkNumber() != null ? request.getClientSpkNumber().trim() : null);
        invoice.setBastNumber(request.getBastNumber() != null ? request.getBastNumber().trim() : null);
        if (request.getTaxPpnType() != null) {
            invoice.setTaxPpnType(request.getTaxPpnType());
        }
        if (request.getTaxPpnRate() != null) {
            invoice.setTaxPpnRate(request.getTaxPpnRate());
        }
        if (request.getTaxPphType() != null) {
            invoice.setTaxPphType(request.getTaxPphType());
        }
        if (request.getTaxPphRate() != null) {
            invoice.setTaxPphRate(request.getTaxPphRate());
        }
        invoice.setNotes(request.getNotes());
        invoice.setTerms(request.getTerms());
        invoice.setWorkLocation(request.getWorkLocation());
        invoice.setUpdatedBy(getCurrentUsername());
        invoice.setUpdatedAt(OffsetDateTime.now());

        // Retention setup on Update
        boolean applyRetention = Boolean.TRUE.equals(request.getApplyRetention());
        if (applyRetention) {
            BigDecimal retPct = request.getRetentionPercentage() != null ? request.getRetentionPercentage() : new BigDecimal("5.00");
            if (retPct.compareTo(BigDecimal.ZERO) <= 0 || retPct.compareTo(new BigDecimal("100.00")) > 0) {
                throw new AppException(ErrorCode.INVALID_REQUEST, "Persentase retensi harus antara 0% dan 100%");
            }
            invoice.setRetentionPercentage(retPct);

            LocalDate retDueDate = request.getRetentionDueDate();
            if (retDueDate == null) {
                int months = (request.getRetentionMonths() != null && request.getRetentionMonths() > 0) ? request.getRetentionMonths() : 6;
                retDueDate = invoice.getDate().plusMonths(months);
            }
            invoice.setRetentionDueDate(retDueDate);
        } else if (!Boolean.TRUE.equals(invoice.getIsRetentionInvoice())) {
            invoice.setRetentionPercentage(null);
            invoice.setRetentionAmount(null);
            invoice.setRetentionDueDate(null);
        }

        // Billing Mode & Termin % Handling on Update
        BillingMode billingMode = request.getBillingMode() != null ? request.getBillingMode() : invoice.getBillingMode();
        if (billingMode == null) {
            billingMode = BillingMode.ITEM_VOLUME;
        }
        invoice.setBillingMode(billingMode);

        if (billingMode == BillingMode.PERCENTAGE_TERMIN) {
            Penawaran sourcePenawaran = invoice.getSourcePenawaran();
            if (sourcePenawaran == null) {
                throw new AppException(ErrorCode.INVALID_REQUEST, "Penagihan mode Termin Persentase wajib memiliki Surat Penawaran Harga (SPH) acuan");
            }
            if (request.getTerminPercentage() == null || request.getTerminPercentage().compareTo(BigDecimal.ZERO) <= 0) {
                throw new AppException(ErrorCode.INVALID_REQUEST, "Persentase termin harus lebih besar dari 0%");
            }
            if (request.getTerminPercentage().compareTo(new BigDecimal("100.00")) > 0) {
                throw new AppException(ErrorCode.INVALID_REQUEST, "Persentase termin tidak boleh melebihi 100%");
            }

            BigDecimal alreadyBilled = invoiceRepository.sumBilledTerminPercentageBySourcePenawaranId(sourcePenawaran.getId(), invoice.getId());
            if (alreadyBilled == null) {
                alreadyBilled = BigDecimal.ZERO;
            }
            BigDecimal cumulative = alreadyBilled.add(request.getTerminPercentage());
            if (cumulative.compareTo(new BigDecimal("100.00")) > 0) {
                BigDecimal remaining = new BigDecimal("100.00").subtract(alreadyBilled).max(BigDecimal.ZERO);
                throw new AppException(
                        ErrorCode.DOUBLE_BILLING_PREVENTED,
                        "Akumulasi termin (" + cumulative + "%) melebihi 100% total penawaran. Sisa termin yang tersedia: " + remaining + "%"
                );
            }

            invoice.setTerminPercentage(request.getTerminPercentage());
            String terminName = (request.getTerminName() != null && !request.getTerminName().trim().isEmpty())
                    ? request.getTerminName().trim()
                    : "Termin " + request.getTerminPercentage().stripTrailingZeros().toPlainString() + "%";
            invoice.setTerminName(terminName);

            if (request.getPreviousDpInvoiceId() != null) {
                Invoice prevDp = invoiceRepository.findById(request.getPreviousDpInvoiceId())
                        .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Faktur DP referensi tidak ditemukan"));
                if (prevDp.getStatus() == InvoiceStatus.CANCELLED) {
                    throw new AppException(ErrorCode.INVALID_REQUEST, "Faktur DP yang dibatalkan tidak dapat digunakan sebagai potongan");
                }
                if (!prevDp.getCustomer().getId().equals(customer.getId())) {
                    throw new AppException(ErrorCode.INVALID_REQUEST, "Faktur DP harus berasal dari customer yang sama");
                }
                invoice.setPreviousDpInvoice(prevDp);
            } else {
                invoice.setPreviousDpInvoice(null);
            }
        } else {
            invoice.setTerminPercentage(null);
            invoice.setTerminName(null);
            invoice.setPreviousDpInvoice(null);
        }

        // Replace details safely
        invoice.getDetails().clear();
        buildDetails(invoice, request.getDetails(), invoice.getId());

        Invoice updated = invoiceRepository.save(invoice);

        if (applyRetention && updated.getRetentionAmount() != null && updated.getRetentionAmount().compareTo(BigDecimal.ZERO) > 0 && !Boolean.TRUE.equals(updated.getIsRetentionInvoice())) {
            createOrSyncRetentionCompanionInvoice(updated);
        }

        return InvoiceDTO.fromEntity(updated, true);
    }

    @Transactional(readOnly = true)
    public PenawaranTerminSummaryDTO getTerminSummary(Long penawaranId) {
        Penawaran penawaran = penawaranRepository.findById(penawaranId)
                .orElseThrow(() -> new AppException(ErrorCode.PENAWARAN_NOT_FOUND, "Penawaran dengan ID " + penawaranId + " tidak ditemukan"));

        BigDecimal alreadyBilled = invoiceRepository.sumBilledTerminPercentageBySourcePenawaranId(penawaranId, null);
        if (alreadyBilled == null) {
            alreadyBilled = BigDecimal.ZERO;
        }
        BigDecimal remaining = new BigDecimal("100.00").subtract(alreadyBilled).max(BigDecimal.ZERO);

        PenawaranTerminSummaryDTO summary = new PenawaranTerminSummaryDTO();
        summary.setPenawaranId(penawaran.getId());
        summary.setPenawaranNumber(penawaran.getNumber());
        summary.setTotalPenawaranAmount(penawaran.getTotalAmount());
        summary.setAlreadyBilledPercentage(alreadyBilled);
        summary.setRemainingPercentage(remaining);

        List<Invoice> activeTermins = invoiceRepository.findActiveTerminInvoicesByPenawaranId(penawaranId);
        List<PenawaranTerminSummaryDTO.BilledTerminItemDTO> billedItems = new ArrayList<>();
        for (Invoice inv : activeTermins) {
            PenawaranTerminSummaryDTO.BilledTerminItemDTO item = new PenawaranTerminSummaryDTO.BilledTerminItemDTO();
            item.setInvoiceId(inv.getId());
            item.setInvoiceNumber(inv.getNumber());
            item.setTerminName(inv.getTerminName());
            item.setTerminPercentage(inv.getTerminPercentage());
            item.setSubtotalDpp(inv.getSubtotalDpp());
            item.setTotalAmount(inv.getTotalAmount());
            item.setDate(inv.getDate());
            item.setStatus(inv.getStatus() != null ? inv.getStatus().name() : null);
            item.setPaymentStatus(inv.getPaymentStatus() != null ? inv.getPaymentStatus().name() : null);
            billedItems.add(item);
        }
        summary.setBilledInvoices(billedItems);

        List<Invoice> availableDps = invoiceRepository.findAvailableDpInvoices(penawaran.getCustomer().getId(), penawaranId, null);
        List<PenawaranTerminSummaryDTO.AvailableDpInvoiceDTO> dpItems = new ArrayList<>();
        for (Invoice dp : availableDps) {
            PenawaranTerminSummaryDTO.AvailableDpInvoiceDTO dpDto = new PenawaranTerminSummaryDTO.AvailableDpInvoiceDTO();
            dpDto.setInvoiceId(dp.getId());
            dpDto.setInvoiceNumber(dp.getNumber());
            dpDto.setTerminName(dp.getTerminName());
            dpDto.setTerminPercentage(dp.getTerminPercentage());
            dpDto.setSubtotalDpp(dp.getSubtotalDpp());
            dpDto.setTotalAmount(dp.getTotalAmount());
            dpDto.setPaidAmount(dp.getPaidAmount());
            dpDto.setDate(dp.getDate());
            dpItems.add(dpDto);
        }
        summary.setAvailableDpInvoices(dpItems);

        return summary;
    }

    private void buildDetails(Invoice invoice, List<CreateInvoiceDetailRequest> itemRequests, Long currentInvoiceId) {
        if (itemRequests == null || itemRequests.isEmpty()) {
            if (invoice.getBillingMode() == BillingMode.PERCENTAGE_TERMIN && invoice.getSourcePenawaran() != null) {
                // Auto-generate termin item and DP deduction if details are omitted
                Penawaran penawaran = invoice.getSourcePenawaran();
                BigDecimal totalPenawaran = penawaran.getTotalAmount();
                BigDecimal terminAmount = totalPenawaran
                        .multiply(invoice.getTerminPercentage())
                        .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

                InvoiceDetail terminDetail = new InvoiceDetail();
                terminDetail.setDescription(invoice.getTerminName() + " (" + invoice.getTerminPercentage().stripTrailingZeros().toPlainString() + "%) - " + penawaran.getNumber());
                terminDetail.setQuantity(BigDecimal.ONE);
                terminDetail.setUnit("Termin");
                terminDetail.setUnitPrice(terminAmount);
                terminDetail.setSortOrder(1);
                terminDetail.setIsDeduction(false);
                terminDetail.setItemType(InvoiceItemType.STANDARD);
                terminDetail.calculateAmount();
                invoice.addDetail(terminDetail);

                if (invoice.getPreviousDpInvoice() != null) {
                    Invoice dpInvoice = invoice.getPreviousDpInvoice();
                    InvoiceDetail dpDetail = new InvoiceDetail();
                    dpDetail.setDescription("Potongan Uang Muka (DP) - Faktur " + dpInvoice.getNumber());
                    dpDetail.setQuantity(BigDecimal.ONE);
                    dpDetail.setUnit("Termin");
                    dpDetail.setUnitPrice(dpInvoice.getSubtotalDpp());
                    dpDetail.setSortOrder(2);
                    dpDetail.setIsDeduction(true);
                    dpDetail.setItemType(InvoiceItemType.DP_DEDUCTION);
                    dpDetail.calculateAmount();
                    invoice.addDetail(dpDetail);
                }
                return;
            } else {
                throw new AppException(ErrorCode.INVALID_REQUEST, "Faktur harus memiliki minimal 1 item");
            }
        }

        Set<Long> seenPenawaranDetailIds = new HashSet<>();
        Set<Long> seenKegiatanItemIds = new HashSet<>();
        int order = 1;
        for (CreateInvoiceDetailRequest itemReq : itemRequests) {
            InvoiceDetail detail = new InvoiceDetail();
            detail.setDescription(itemReq.getDescription().trim());
            detail.setQuantity(itemReq.getQuantity());
            detail.setUnit(itemReq.getUnit().trim());
            detail.setUnitPrice(itemReq.getUnitPrice());
            detail.setSortOrder(itemReq.getSortOrder() != null && itemReq.getSortOrder() > 0 ? itemReq.getSortOrder() : order++);
            detail.setNotes(itemReq.getNotes());

            boolean isDeduction = Boolean.TRUE.equals(itemReq.getIsDeduction())
                    || itemReq.getItemType() == InvoiceItemType.DP_DEDUCTION
                    || itemReq.getItemType() == InvoiceItemType.RETENTION_DEDUCTION;
            detail.setIsDeduction(isDeduction);
            detail.setItemType(itemReq.getItemType() != null ? itemReq.getItemType() : (isDeduction ? InvoiceItemType.DP_DEDUCTION : InvoiceItemType.STANDARD));

            if (itemReq.getItemType() == InvoiceItemType.RETENTION_DEDUCTION) {
                invoice.setRetentionAmount(itemReq.getUnitPrice().multiply(itemReq.getQuantity()).setScale(2, RoundingMode.HALF_UP));
            }

            // Source Penawaran Detail & Anti-Double-Billing enforcement (only for non-deduction physical items)
            if (!isDeduction && itemReq.getSourcePenawaranDetailId() != null) {
                if (!seenPenawaranDetailIds.add(itemReq.getSourcePenawaranDetailId())) {
                    throw new AppException(
                            ErrorCode.DOUBLE_BILLING_PREVENTED,
                            "Item penawaran sumber tidak boleh diduplikasi dalam faktur yang sama: " + itemReq.getDescription()
                    );
                }
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
                if (pDetail.getPenawaran() != null) {
                    detail.setSourcePenawaran(pDetail.getPenawaran());
                }
                if (pDetail.getSphKegiatan() != null) {
                    detail.setSphKegiatan(pDetail.getSphKegiatan());
                }
                if (pDetail.getKegiatan() != null) {
                    detail.setSourceKegiatan(pDetail.getKegiatan());
                } else if (pDetail.getSphKegiatan() != null && pDetail.getSphKegiatan().getKegiatan() != null) {
                    detail.setSourceKegiatan(pDetail.getSphKegiatan().getKegiatan());
                }
                if (pDetail.getKegiatanItem() != null) {
                    detail.setSourceKegiatanItem(pDetail.getKegiatanItem());
                }
            } else if (!isDeduction) {
                // Direct kegiatan / kegiatan item link (if manual billing with activity link)
                if (itemReq.getSourceKegiatanId() != null) {
                    Kegiatan kegiatan = kegiatanRepository.findById(itemReq.getSourceKegiatanId())
                            .orElseThrow(() -> new AppException(ErrorCode.KEGIATAN_NOT_FOUND, "Kegiatan tidak ditemukan"));
                    detail.setSourceKegiatan(kegiatan);
                }
                if (itemReq.getSourceKegiatanItemId() != null) {
                    if (!seenKegiatanItemIds.add(itemReq.getSourceKegiatanItemId())) {
                        throw new AppException(
                                ErrorCode.DOUBLE_BILLING_PREVENTED,
                                "Item kegiatan tidak boleh diduplikasi dalam faktur yang sama: " + itemReq.getDescription()
                        );
                    }
                    KegiatanItem kegiatanItem = kegiatanItemRepository.findById(itemReq.getSourceKegiatanItemId())
                            .orElseThrow(() -> new AppException(ErrorCode.KEGIATAN_ITEM_NOT_FOUND, "Item kegiatan tidak ditemukan"));
                    detail.setSourceKegiatanItem(kegiatanItem);
                }
                if (itemReq.getSourcePenawaranId() != null) {
                    penawaranRepository.findById(itemReq.getSourcePenawaranId()).ifPresent(detail::setSourcePenawaran);
                } else if (invoice.getSourcePenawaran() != null) {
                    detail.setSourcePenawaran(invoice.getSourcePenawaran());
                }
            }

            // Authoritative server calculation
            detail.calculateAmount();
            invoice.addDetail(detail);
        }

        // Auto-inject retention deduction if retention is configured and not manually provided in items
        if (invoice.getRetentionPercentage() != null && invoice.getRetentionPercentage().compareTo(BigDecimal.ZERO) > 0) {
            boolean hasRetentionDeduction = invoice.getDetails().stream()
                    .anyMatch(d -> d.getItemType() == InvoiceItemType.RETENTION_DEDUCTION);
            if (!hasRetentionDeduction) {
                BigDecimal grossSubtotal = invoice.getDetails().stream()
                        .filter(d -> !Boolean.TRUE.equals(d.getIsDeduction()))
                        .map(InvoiceDetail::getAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                BigDecimal retAmount = grossSubtotal.multiply(invoice.getRetentionPercentage())
                        .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                invoice.setRetentionAmount(retAmount);

                InvoiceDetail retDetail = new InvoiceDetail();
                retDetail.setDescription("Potongan Retensi Pemeliharaan (" +
                        invoice.getRetentionPercentage().stripTrailingZeros().toPlainString() + "%)");
                retDetail.setQuantity(BigDecimal.ONE);
                retDetail.setUnit("Paket");
                retDetail.setUnitPrice(retAmount);
                retDetail.setSortOrder(order++);
                retDetail.setIsDeduction(true);
                retDetail.setItemType(InvoiceItemType.RETENTION_DEDUCTION);
                retDetail.calculateAmount();
                invoice.addDetail(retDetail);
            }
        }

        if (invoice.getSubtotalDpp() != null && invoice.getSubtotalDpp().compareTo(BigDecimal.ZERO) < 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Subtotal DPP faktur tidak boleh bernilai negatif setelah pemotongan");
        }
    }

    private void createOrSyncRetentionCompanionInvoice(Invoice settlementInvoice) {
        if (settlementInvoice == null || settlementInvoice.getId() == null) {
            return;
        }

        List<Invoice> existingList = invoiceRepository.findByParentSettlementInvoiceId(settlementInvoice.getId());
        Invoice existing = (existingList != null && !existingList.isEmpty()) ? existingList.get(0) : null;

        if (existing != null) {
            // Hanya perbarui jika masih DRAFT dan belum ada pembayaran
            if (existing.getStatus() == InvoiceStatus.DRAFT && existing.getPaidAmount().compareTo(BigDecimal.ZERO) == 0) {
                existing.setDueDate(settlementInvoice.getRetentionDueDate());
                existing.setRetentionDueDate(settlementInvoice.getRetentionDueDate());
                existing.setRetentionPercentage(settlementInvoice.getRetentionPercentage());
                existing.setRetentionAmount(settlementInvoice.getRetentionAmount());
                existing.getDetails().clear();

                InvoiceDetail d = new InvoiceDetail();
                d.setDescription("Penagihan Retensi Pemeliharaan (" +
                        settlementInvoice.getRetentionPercentage().stripTrailingZeros().toPlainString() +
                        "%) - Faktur " + settlementInvoice.getNumber());
                d.setQuantity(BigDecimal.ONE);
                d.setUnit("Retensi");
                d.setUnitPrice(settlementInvoice.getRetentionAmount());
                d.setSortOrder(1);
                d.setIsDeduction(false);
                d.setItemType(InvoiceItemType.STANDARD);
                d.calculateAmount();
                existing.addDetail(d);

                invoiceRepository.save(existing);
            }
        } else {
            // Buat draft faktur retensi baru
            LocalDate retDate = settlementInvoice.getDate() != null ? settlementInvoice.getDate() : LocalDate.now();
            String retNumber = numberingService.generateNextNumber(DocumentType.FAKTUR, retDate);

            Invoice retInv = new Invoice();
            retInv.setNumber(retNumber);
            retInv.setCustomer(settlementInvoice.getCustomer());
            retInv.setSourcePenawaran(settlementInvoice.getSourcePenawaran());
            retInv.setDate(retDate);
            retInv.setDueDate(settlementInvoice.getRetentionDueDate());
            retInv.setRetentionDueDate(settlementInvoice.getRetentionDueDate());
            retInv.setClientPoNumber(settlementInvoice.getClientPoNumber());
            retInv.setClientSpkNumber(settlementInvoice.getClientSpkNumber());
            retInv.setBastNumber(settlementInvoice.getBastNumber());
            retInv.setTaxPpnType(settlementInvoice.getTaxPpnType() != null ? settlementInvoice.getTaxPpnType() : TaxPpnType.NONE);
            retInv.setTaxPpnRate(settlementInvoice.getTaxPpnRate());
            retInv.setStatus(InvoiceStatus.DRAFT);
            retInv.setPaymentStatus(InvoicePaymentStatus.UNPAID);
            retInv.setPaidAmount(BigDecimal.ZERO);
            retInv.setBillingMode(BillingMode.ITEM_VOLUME);
            retInv.setIsRetentionInvoice(true);
            retInv.setParentSettlementInvoice(settlementInvoice);
            retInv.setRetentionPercentage(settlementInvoice.getRetentionPercentage());
            retInv.setRetentionAmount(settlementInvoice.getRetentionAmount());
            retInv.setNotes("Faktur Penagihan Retensi Pemeliharaan " +
                    settlementInvoice.getRetentionPercentage().stripTrailingZeros().toPlainString() +
                    "% atas Faktur Pelunasan " + settlementInvoice.getNumber());
            retInv.setCreatedBy(getCurrentUsername());
            retInv.setUpdatedBy(getCurrentUsername());

            InvoiceDetail d = new InvoiceDetail();
            d.setDescription("Penagihan Retensi Pemeliharaan (" +
                    settlementInvoice.getRetentionPercentage().stripTrailingZeros().toPlainString() +
                    "%) - Faktur " + settlementInvoice.getNumber());
            d.setQuantity(BigDecimal.ONE);
            d.setUnit("Retensi");
            d.setUnitPrice(settlementInvoice.getRetentionAmount());
            d.setSortOrder(1);
            d.setIsDeduction(false);
            d.setItemType(InvoiceItemType.STANDARD);
            d.calculateAmount();
            retInv.addDetail(d);

            Invoice savedRet = invoiceRepository.save(retInv);
            auditLogService.log(
                    "CREATE_RETENTION_DRAFT",
                    "INVOICE",
                    savedRet.getId(),
                    null,
                    "Draft Faktur Retensi " + savedRet.getNumber() + " dibuat otomatis untuk Faktur Pelunasan " + settlementInvoice.getNumber()
            );
        }
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

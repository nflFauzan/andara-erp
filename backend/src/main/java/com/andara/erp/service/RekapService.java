package com.andara.erp.service;

import com.andara.erp.common.exception.AppException;
import com.andara.erp.common.exception.ErrorCode;
import com.andara.erp.dto.rekap.CustomerStatementDTO;
import com.andara.erp.dto.rekap.CustomerStatementItemDTO;
import com.andara.erp.dto.rekap.InvoiceSettlementAllocationDTO;
import com.andara.erp.dto.rekap.InvoiceSettlementDTO;
import com.andara.erp.dto.rekap.InvoiceSettlementSummaryDTO;
import com.andara.erp.dto.rekap.MonthlyTrendItemDTO;
import com.andara.erp.dto.rekap.RekapCustomerDTO;
import com.andara.erp.dto.rekap.RekapCustomerSummaryDTO;
import com.andara.erp.dto.rekap.RekapInvoiceDTO;
import com.andara.erp.dto.rekap.RekapInvoiceSummaryDTO;
import com.andara.erp.dto.rekap.RekapKegiatanDTO;
import com.andara.erp.dto.rekap.RekapKegiatanSummaryDTO;
import com.andara.erp.dto.rekap.RekapPaymentDTO;
import com.andara.erp.dto.rekap.RekapPaymentSummaryDTO;
import com.andara.erp.dto.rekap.RekapPenawaranDTO;
import com.andara.erp.dto.rekap.RekapPenawaranSummaryDTO;
import com.andara.erp.dto.rekap.RekapPiutangDTO;
import com.andara.erp.dto.rekap.RekapPiutangSummaryDTO;
import com.andara.erp.dto.rekap.RekapUnbilledSphDTO;
import com.andara.erp.dto.rekap.RekapUnbilledSummaryDTO;
import com.andara.erp.dto.rekap.YearlyTrendSummaryDTO;
import com.andara.erp.entity.Customer;
import com.andara.erp.entity.DepositTransaction;
import com.andara.erp.entity.Invoice;
import com.andara.erp.entity.InvoicePaymentStatus;
import com.andara.erp.entity.InvoiceStatus;
import com.andara.erp.entity.Kegiatan;
import com.andara.erp.entity.KegiatanStatus;
import com.andara.erp.entity.Payment;
import com.andara.erp.entity.PaymentAllocation;
import com.andara.erp.entity.PaymentMethod;
import com.andara.erp.entity.PaymentStatus;
import com.andara.erp.entity.Penawaran;
import com.andara.erp.entity.PenawaranStatus;
import com.andara.erp.entity.SphKegiatan;
import com.andara.erp.repository.CustomerRepository;
import com.andara.erp.repository.DepositTransactionRepository;
import com.andara.erp.repository.InvoiceDetailRepository;
import com.andara.erp.repository.InvoiceRepository;
import com.andara.erp.repository.KegiatanRepository;
import com.andara.erp.repository.PaymentAllocationRepository;
import com.andara.erp.repository.PaymentRepository;
import com.andara.erp.repository.PenawaranDetailRepository;
import com.andara.erp.repository.PenawaranRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class RekapService {

    private static final Logger log = LoggerFactory.getLogger(RekapService.class);

    private final CustomerRepository customerRepository;
    private final KegiatanRepository kegiatanRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final DepositTransactionRepository depositTransactionRepository;
    private final PenawaranRepository penawaranRepository;
    private final PenawaranDetailRepository penawaranDetailRepository;
    private final InvoiceDetailRepository invoiceDetailRepository;
    private final PaymentAllocationRepository paymentAllocationRepository;

    private static final LocalDate ALL_START = LocalDate.of(2000, 1, 1);
    private static final LocalDate ALL_END = LocalDate.of(2099, 12, 31);
    private static final OffsetDateTime ALL_START_TIME = ALL_START.atStartOfDay().atOffset(ZoneOffset.UTC);
    private static final OffsetDateTime ALL_END_TIME = ALL_END.atTime(LocalTime.MAX).atOffset(ZoneOffset.UTC);

    public RekapService(CustomerRepository customerRepository,
                        KegiatanRepository kegiatanRepository,
                        InvoiceRepository invoiceRepository,
                        PaymentRepository paymentRepository,
                        DepositTransactionRepository depositTransactionRepository,
                        PenawaranRepository penawaranRepository,
                        PenawaranDetailRepository penawaranDetailRepository,
                        InvoiceDetailRepository invoiceDetailRepository,
                        PaymentAllocationRepository paymentAllocationRepository) {
        this.customerRepository = customerRepository;
        this.kegiatanRepository = kegiatanRepository;
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
        this.depositTransactionRepository = depositTransactionRepository;
        this.penawaranRepository = penawaranRepository;
        this.penawaranDetailRepository = penawaranDetailRepository;
        this.invoiceDetailRepository = invoiceDetailRepository;
        this.paymentAllocationRepository = paymentAllocationRepository;
    }

    public RekapCustomerSummaryDTO getRekapCustomers(String search, Pageable pageable) {
        return getRekapCustomers(null, null, search, pageable);
    }

    public RekapCustomerSummaryDTO getRekapCustomers(LocalDate startDate, LocalDate endDate, String search, Pageable pageable) {
        log.debug("Generating Rekap Customers startDate={} endDate={} search={}", startDate, endDate, search);

        LocalDate effectiveStart = (startDate != null) ? startDate : ALL_START;
        LocalDate effectiveEnd = (endDate != null) ? endDate : ALL_END;

        Page<Customer> customerPage = customerRepository.searchCustomers(search, null, pageable);

        List<RekapCustomerDTO> dtoList = customerPage.getContent().stream().map(c -> {
            long kegiatanCount = kegiatanRepository.countByCustomerId(c.getId());
            long invoiceCount = (startDate != null || endDate != null)
                    ? invoiceRepository.countActiveByCustomerIdAndDateRange(c.getId(), effectiveStart, effectiveEnd)
                    : invoiceRepository.countByCustomerId(c.getId());
            BigDecimal totalInvoice = invoiceRepository.sumTotalAmountActiveByCustomerIdAndDateRange(c.getId(), effectiveStart, effectiveEnd);
            BigDecimal totalPaid = paymentRepository.sumAmountConfirmedByCustomerIdAndDateRange(c.getId(), effectiveStart, effectiveEnd);
            BigDecimal outstanding = invoiceRepository.sumOutstandingActiveByCustomerIdAndDateRange(c.getId(), effectiveStart, effectiveEnd);
            BigDecimal deposit = depositTransactionRepository.calculateCurrentBalanceByCustomerId(c.getId());

            return new RekapCustomerDTO(
                    c.getId(),
                    c.getCode(),
                    c.getName(),
                    c.getCompanyName(),
                    c.getPhone(),
                    kegiatanCount,
                    invoiceCount,
                    totalInvoice != null ? totalInvoice : BigDecimal.ZERO,
                    totalPaid != null ? totalPaid : BigDecimal.ZERO,
                    outstanding != null ? outstanding : BigDecimal.ZERO,
                    deposit != null ? deposit : BigDecimal.ZERO
            );
        }).toList();

        Page<RekapCustomerDTO> pagedResult = new PageImpl<>(dtoList, pageable, customerPage.getTotalElements());

        BigDecimal grandTotalInvoice = invoiceRepository.sumTotalAmountActiveByDateRange(effectiveStart, effectiveEnd);
        BigDecimal grandTotalPaid = paymentRepository.sumAmountConfirmedByDateRange(effectiveStart, effectiveEnd);
        BigDecimal grandTotalOutstanding = invoiceRepository.sumOutstandingActiveByDateRange(effectiveStart, effectiveEnd);
        BigDecimal grandTotalDeposit = depositTransactionRepository.calculateGrandTotalDepositBalance();

        return new RekapCustomerSummaryDTO(
                pagedResult,
                customerPage.getTotalElements(),
                grandTotalInvoice != null ? grandTotalInvoice : BigDecimal.ZERO,
                grandTotalPaid != null ? grandTotalPaid : BigDecimal.ZERO,
                grandTotalOutstanding != null ? grandTotalOutstanding : BigDecimal.ZERO,
                grandTotalDeposit != null ? grandTotalDeposit : BigDecimal.ZERO
        );
    }

    public RekapInvoiceSummaryDTO getRekapInvoices(
            LocalDate startDate,
            LocalDate endDate,
            Long customerId,
            InvoiceStatus status,
            InvoicePaymentStatus paymentStatus,
            String search,
            Pageable pageable
    ) {
        log.debug("Generating Rekap Invoices");

        LocalDate effectiveStart = (startDate != null) ? startDate : ALL_START;
        LocalDate effectiveEnd = (endDate != null) ? endDate : ALL_END;

        String searchPattern = (search != null && !search.trim().isEmpty())
                ? "%" + search.trim().toLowerCase() + "%"
                : null;

        Page<Invoice> invoicePage = invoiceRepository.findWithFilters(
                searchPattern,
                customerId,
                status,
                paymentStatus,
                startDate,
                endDate,
                pageable
        );

        List<RekapInvoiceDTO> dtoList = invoicePage.getContent().stream().map(inv -> new RekapInvoiceDTO(
                inv.getId(),
                inv.getNumber(),
                inv.getDate(),
                inv.getDueDate(),
                inv.getCustomer() != null ? inv.getCustomer().getId() : null,
                inv.getCustomer() != null ? inv.getCustomer().getCode() : null,
                inv.getCustomer() != null ? inv.getCustomer().getName() : "-",
                inv.getCustomer() != null ? inv.getCustomer().getCompanyName() : null,
                inv.getTotalAmount(),
                inv.getPaidAmount(),
                inv.getOutstanding(),
                inv.getStatus().name(),
                inv.getPaymentStatus().name()
        )).toList();

        Page<RekapInvoiceDTO> pagedResult = new PageImpl<>(dtoList, pageable, invoicePage.getTotalElements());

        BigDecimal grandTotalAmount = (customerId != null)
                ? invoiceRepository.sumTotalAmountActiveByCustomerIdAndDateRange(customerId, effectiveStart, effectiveEnd)
                : invoiceRepository.sumTotalAmountActiveByDateRange(effectiveStart, effectiveEnd);

        BigDecimal grandTotalOutstanding = (customerId != null)
                ? invoiceRepository.sumOutstandingActiveByCustomerIdAndDateRange(customerId, effectiveStart, effectiveEnd)
                : invoiceRepository.sumOutstandingActiveByDateRange(effectiveStart, effectiveEnd);

        BigDecimal grandTotalPaid = (grandTotalAmount != null && grandTotalOutstanding != null)
                ? grandTotalAmount.subtract(grandTotalOutstanding).max(BigDecimal.ZERO)
                : BigDecimal.ZERO;

        return new RekapInvoiceSummaryDTO(
                pagedResult,
                invoicePage.getTotalElements(),
                grandTotalAmount != null ? grandTotalAmount : BigDecimal.ZERO,
                grandTotalPaid,
                grandTotalOutstanding != null ? grandTotalOutstanding : BigDecimal.ZERO
        );
    }

    public RekapPaymentSummaryDTO getRekapPayments(
            LocalDate startDate,
            LocalDate endDate,
            Long customerId,
            PaymentStatus status,
            PaymentMethod method,
            String search,
            Pageable pageable
    ) {
        log.debug("Generating Rekap Payments");

        LocalDate effectiveStart = (startDate != null) ? startDate : ALL_START;
        LocalDate effectiveEnd = (endDate != null) ? endDate : ALL_END;

        String searchPattern = (search != null && !search.trim().isEmpty())
                ? "%" + search.trim().toLowerCase() + "%"
                : null;

        Page<Payment> paymentPage = paymentRepository.findWithFilters(
                searchPattern,
                customerId,
                status,
                method,
                startDate,
                endDate,
                pageable
        );

        List<RekapPaymentDTO> dtoList = paymentPage.getContent().stream().map(p -> {
            BigDecimal allocated = p.getAllocations() != null
                    ? p.getAllocations().stream()
                            .map(PaymentAllocation::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add)
                    : BigDecimal.ZERO;

            BigDecimal excess = p.getAmount().subtract(allocated).max(BigDecimal.ZERO);

            return new RekapPaymentDTO(
                    p.getId(),
                    p.getNumber(),
                    p.getDate(),
                    p.getCustomer() != null ? p.getCustomer().getId() : null,
                    p.getCustomer() != null ? p.getCustomer().getCode() : null,
                    p.getCustomer() != null ? p.getCustomer().getName() : "-",
                    p.getCustomer() != null ? p.getCustomer().getCompanyName() : null,
                    p.getAmount(),
                    allocated,
                    excess,
                    p.getPaymentMethod().name(),
                    p.getDestinationAccount(),
                    p.getStatus().name(),
                    p.getReference()
            );
        }).toList();

        Page<RekapPaymentDTO> pagedResult = new PageImpl<>(dtoList, pageable, paymentPage.getTotalElements());

        BigDecimal grandTotalAmount = (customerId != null)
                ? paymentRepository.sumAmountConfirmedByCustomerIdAndDateRange(customerId, effectiveStart, effectiveEnd)
                : paymentRepository.sumAmountConfirmedByDateRange(effectiveStart, effectiveEnd);

        BigDecimal grandTotalAllocated = (customerId != null)
                ? paymentAllocationRepository.sumAllocatedConfirmedByCustomerIdAndDateRange(customerId, effectiveStart, effectiveEnd)
                : paymentAllocationRepository.sumAllocatedConfirmedByDateRange(effectiveStart, effectiveEnd);

        BigDecimal grandTotalExcess = (grandTotalAmount != null && grandTotalAllocated != null)
                ? grandTotalAmount.subtract(grandTotalAllocated).max(BigDecimal.ZERO)
                : BigDecimal.ZERO;

        return new RekapPaymentSummaryDTO(
                pagedResult,
                paymentPage.getTotalElements(),
                grandTotalAmount != null ? grandTotalAmount : BigDecimal.ZERO,
                grandTotalAllocated != null ? grandTotalAllocated : BigDecimal.ZERO,
                grandTotalExcess
        );
    }

    public RekapKegiatanSummaryDTO getRekapKegiatan(
            Long customerId,
            KegiatanStatus status,
            String search,
            Pageable pageable
    ) {
        return getRekapKegiatan(null, null, customerId, status, search, pageable);
    }

    public RekapKegiatanSummaryDTO getRekapKegiatan(
            LocalDate startDate,
            LocalDate endDate,
            Long customerId,
            KegiatanStatus status,
            String search,
            Pageable pageable
    ) {
        log.debug("Generating Rekap Kegiatan startDate={} endDate={}", startDate, endDate);

        OffsetDateTime startDateTime = (startDate != null) ? startDate.atStartOfDay().atOffset(ZoneOffset.UTC) : ALL_START_TIME;
        OffsetDateTime endDateTime = (endDate != null) ? endDate.atTime(LocalTime.MAX).atOffset(ZoneOffset.UTC) : ALL_END_TIME;

        String searchPattern = (search != null && !search.trim().isEmpty())
                ? "%" + search.trim().toLowerCase() + "%"
                : null;

        Page<Kegiatan> kegiatanPage = kegiatanRepository.findWithFilters(
                searchPattern,
                customerId,
                status,
                startDateTime,
                endDateTime,
                pageable
        );

        List<RekapKegiatanDTO> dtoList = kegiatanPage.getContent().stream().map(k -> {
            int sphCount = penawaranDetailRepository.findPenawaranByKegiatanId(k.getId()).size();
            int invCount = invoiceDetailRepository.findInvoicesByKegiatanId(k.getId()).size();

            return new RekapKegiatanDTO(
                    k.getId(),
                    k.getCode(),
                    k.getName(),
                    k.getCustomer() != null ? k.getCustomer().getId() : null,
                    k.getCustomer() != null ? k.getCustomer().getCode() : null,
                    k.getCustomer() != null ? k.getCustomer().getName() : "-",
                    k.getCustomer() != null ? k.getCustomer().getCompanyName() : null,
                    k.getLocation(),
                    k.getStatus().name(),
                    k.getTotalAmount() != null ? k.getTotalAmount() : BigDecimal.ZERO,
                    k.getItems() != null ? k.getItems().size() : 0,
                    sphCount,
                    invCount,
                    k.getCreatedAt() != null ? k.getCreatedAt().toLocalDateTime() : null
            );
        }).toList();

        Page<RekapKegiatanDTO> pagedResult = new PageImpl<>(dtoList, pageable, kegiatanPage.getTotalElements());

        BigDecimal grandTotalValue = dtoList.stream()
                .map(RekapKegiatanDTO::getTotalValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new RekapKegiatanSummaryDTO(
                pagedResult,
                kegiatanPage.getTotalElements(),
                grandTotalValue
        );
    }

    public RekapPenawaranSummaryDTO getRekapPenawaran(
            Long customerId,
            PenawaranStatus status,
            String search,
            Pageable pageable
    ) {
        return getRekapPenawaran(null, null, customerId, status, search, pageable);
    }

    public RekapPenawaranSummaryDTO getRekapPenawaran(
            LocalDate startDate,
            LocalDate endDate,
            Long customerId,
            PenawaranStatus status,
            String search,
            Pageable pageable
    ) {
        log.debug("Generating Rekap Penawaran startDate={} endDate={}", startDate, endDate);

        LocalDate effectiveStart = (startDate != null) ? startDate : ALL_START;
        LocalDate effectiveEnd = (endDate != null) ? endDate : ALL_END;

        String searchPattern = (search != null && !search.trim().isEmpty())
                ? "%" + search.trim().toLowerCase() + "%"
                : null;

        Page<Penawaran> pageResult = penawaranRepository.findWithFilters(
                searchPattern,
                customerId,
                status,
                effectiveStart,
                effectiveEnd,
                pageable
        );

        List<RekapPenawaranDTO> dtoList = pageResult.getContent().stream().map(p -> {
            long invoiceCount = invoiceRepository.countActiveByPenawaranId(p.getId());
            BigDecimal invoicedAmount = invoiceRepository.sumTotalAmountActiveByPenawaranId(p.getId());
            BigDecimal unbilledAmount = p.getTotalAmount().subtract(invoicedAmount).max(BigDecimal.ZERO);

            String kegiatanSummary = p.getKegiatanList() != null && !p.getKegiatanList().isEmpty()
                    ? p.getKegiatanList().stream().map(SphKegiatan::getName).limit(2).reduce((a, b) -> a + ", " + b).orElse("-")
                    : "-";
            int kegiatanCount = p.getKegiatanList() != null ? p.getKegiatanList().size() : 0;

            return new RekapPenawaranDTO(
                    p.getId(),
                    p.getNumber(),
                    p.getDate(),
                    p.getCustomer() != null ? p.getCustomer().getId() : null,
                    p.getCustomer() != null ? p.getCustomer().getCode() : null,
                    p.getCustomer() != null ? p.getCustomer().getName() : "-",
                    p.getCustomer() != null ? p.getCustomer().getCompanyName() : null,
                    kegiatanSummary,
                    kegiatanCount,
                    p.getTotalAmount(),
                    p.getStatus().name(),
                    invoiceCount,
                    invoicedAmount,
                    unbilledAmount
            );
        }).toList();

        Page<RekapPenawaranDTO> pagedResult = new PageImpl<>(dtoList, pageable, pageResult.getTotalElements());

        BigDecimal grandTotalAmount = (customerId != null)
                ? penawaranRepository.sumTotalAmountActiveByCustomerIdAndDateRange(customerId, effectiveStart, effectiveEnd)
                : penawaranRepository.sumTotalAmountActiveByDateRange(effectiveStart, effectiveEnd);

        long approvedCount = (customerId != null)
                ? penawaranRepository.countByStatusAndCustomerIdAndDateRange(PenawaranStatus.APPROVED, customerId, effectiveStart, effectiveEnd)
                : penawaranRepository.countByStatusAndDateRange(PenawaranStatus.APPROVED, effectiveStart, effectiveEnd);
        BigDecimal approvedTotalAmount = (customerId != null)
                ? penawaranRepository.sumTotalAmountByStatusAndCustomerIdAndDateRange(PenawaranStatus.APPROVED, customerId, effectiveStart, effectiveEnd)
                : penawaranRepository.sumTotalAmountByStatusAndDateRange(PenawaranStatus.APPROVED, effectiveStart, effectiveEnd);

        long sentCount = (customerId != null)
                ? penawaranRepository.countByStatusAndCustomerIdAndDateRange(PenawaranStatus.SENT, customerId, effectiveStart, effectiveEnd)
                : penawaranRepository.countByStatusAndDateRange(PenawaranStatus.SENT, effectiveStart, effectiveEnd);
        BigDecimal sentTotalAmount = (customerId != null)
                ? penawaranRepository.sumTotalAmountByStatusAndCustomerIdAndDateRange(PenawaranStatus.SENT, customerId, effectiveStart, effectiveEnd)
                : penawaranRepository.sumTotalAmountByStatusAndDateRange(PenawaranStatus.SENT, effectiveStart, effectiveEnd);

        long draftCount = (customerId != null)
                ? penawaranRepository.countByStatusAndCustomerIdAndDateRange(PenawaranStatus.DRAFT, customerId, effectiveStart, effectiveEnd)
                : penawaranRepository.countByStatusAndDateRange(PenawaranStatus.DRAFT, effectiveStart, effectiveEnd);
        BigDecimal draftTotalAmount = (customerId != null)
                ? penawaranRepository.sumTotalAmountByStatusAndCustomerIdAndDateRange(PenawaranStatus.DRAFT, customerId, effectiveStart, effectiveEnd)
                : penawaranRepository.sumTotalAmountByStatusAndDateRange(PenawaranStatus.DRAFT, effectiveStart, effectiveEnd);

        long rejectedCount = (customerId != null)
                ? penawaranRepository.countByStatusAndCustomerIdAndDateRange(PenawaranStatus.REJECTED, customerId, effectiveStart, effectiveEnd)
                : penawaranRepository.countByStatusAndDateRange(PenawaranStatus.REJECTED, effectiveStart, effectiveEnd);
        BigDecimal rejectedTotalAmount = (customerId != null)
                ? penawaranRepository.sumTotalAmountByStatusAndCustomerIdAndDateRange(PenawaranStatus.REJECTED, customerId, effectiveStart, effectiveEnd)
                : penawaranRepository.sumTotalAmountByStatusAndDateRange(PenawaranStatus.REJECTED, effectiveStart, effectiveEnd);

        BigDecimal grandTotalInvoiced = dtoList.stream()
                .map(RekapPenawaranDTO::getInvoicedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal grandTotalUnbilled = (grandTotalAmount != null ? grandTotalAmount : BigDecimal.ZERO)
                .subtract(grandTotalInvoiced).max(BigDecimal.ZERO);

        return new RekapPenawaranSummaryDTO(
                pagedResult,
                pageResult.getTotalElements(),
                grandTotalAmount != null ? grandTotalAmount : BigDecimal.ZERO,
                approvedCount,
                approvedTotalAmount != null ? approvedTotalAmount : BigDecimal.ZERO,
                sentCount,
                sentTotalAmount != null ? sentTotalAmount : BigDecimal.ZERO,
                draftCount,
                draftTotalAmount != null ? draftTotalAmount : BigDecimal.ZERO,
                rejectedCount,
                rejectedTotalAmount != null ? rejectedTotalAmount : BigDecimal.ZERO,
                grandTotalInvoiced,
                grandTotalUnbilled
        );
    }

    public RekapPiutangSummaryDTO getRekapPiutang(
            Long customerId,
            String agingBucket,
            String search,
            Pageable pageable
    ) {
        return getRekapPiutang(null, customerId, agingBucket, search, pageable);
    }

    public RekapPiutangSummaryDTO getRekapPiutang(
            LocalDate asOfDate,
            Long customerId,
            String agingBucket,
            String search,
            Pageable pageable
    ) {
        log.debug("Generating Rekap Piutang asOfDate={} customerId={} bucket={}", asOfDate, customerId, agingBucket);

        LocalDate effectiveAsOf = (asOfDate != null) ? asOfDate : LocalDate.now();

        String searchPattern = (search != null && !search.trim().isEmpty())
                ? "%" + search.trim().toLowerCase() + "%"
                : null;

        List<Invoice> allOutstanding = (customerId != null)
                ? invoiceRepository.findAllOutstandingByCustomerId(customerId)
                : invoiceRepository.findAllOutstanding();

        long currentCount = 0;
        BigDecimal currentAmount = BigDecimal.ZERO;

        long bucket1To30Count = 0;
        BigDecimal bucket1To30Amount = BigDecimal.ZERO;

        long bucket31To60Count = 0;
        BigDecimal bucket31To60Amount = BigDecimal.ZERO;

        long bucket61To90Count = 0;
        BigDecimal bucket61To90Amount = BigDecimal.ZERO;

        long bucketOver90Count = 0;
        BigDecimal bucketOver90Amount = BigDecimal.ZERO;

        long overdueCount = 0;
        BigDecimal overdueAmount = BigDecimal.ZERO;

        BigDecimal grandTotalOutstanding = BigDecimal.ZERO;

        List<RekapPiutangDTO> allDtos = new ArrayList<>();

        for (Invoice inv : allOutstanding) {
            BigDecimal out = inv.getTotalAmount().subtract(inv.getPaidAmount()).max(BigDecimal.ZERO);
            grandTotalOutstanding = grandTotalOutstanding.add(out);

            long daysOverdue = 0;
            if (inv.getDueDate() != null && inv.getDueDate().isBefore(effectiveAsOf)) {
                daysOverdue = ChronoUnit.DAYS.between(inv.getDueDate(), effectiveAsOf);
            }

            String bucket;
            if (daysOverdue <= 0) {
                currentCount++;
                currentAmount = currentAmount.add(out);
                bucket = "CURRENT";
            } else {
                overdueCount++;
                overdueAmount = overdueAmount.add(out);

                if (daysOverdue <= 30) {
                    bucket1To30Count++;
                    bucket1To30Amount = bucket1To30Amount.add(out);
                    bucket = "DAYS_1_30";
                } else if (daysOverdue <= 60) {
                    bucket31To60Count++;
                    bucket31To60Amount = bucket31To60Amount.add(out);
                    bucket = "DAYS_31_60";
                } else if (daysOverdue <= 90) {
                    bucket61To90Count++;
                    bucket61To90Amount = bucket61To90Amount.add(out);
                    bucket = "DAYS_61_90";
                } else {
                    bucketOver90Count++;
                    bucketOver90Amount = bucketOver90Amount.add(out);
                    bucket = "DAYS_OVER_90";
                }
            }

            allDtos.add(new RekapPiutangDTO(
                    inv.getId(),
                    inv.getNumber(),
                    inv.getDate(),
                    inv.getDueDate(),
                    inv.getCustomer() != null ? inv.getCustomer().getId() : null,
                    inv.getCustomer() != null ? inv.getCustomer().getCode() : null,
                    inv.getCustomer() != null ? inv.getCustomer().getName() : "-",
                    inv.getCustomer() != null ? inv.getCustomer().getCompanyName() : null,
                    inv.getTotalAmount(),
                    inv.getPaidAmount(),
                    out,
                    daysOverdue,
                    bucket,
                    inv.getStatus().name(),
                    inv.getPaymentStatus().name()
            ));
        }

        List<RekapPiutangDTO> filteredList = allDtos.stream()
                .filter(dto -> {
                    if (searchPattern == null) return true;
                    String clean = search.trim().toLowerCase();
                    return (dto.getInvoiceNumber() != null && dto.getInvoiceNumber().toLowerCase().contains(clean))
                            || (dto.getCustomerName() != null && dto.getCustomerName().toLowerCase().contains(clean))
                            || (dto.getCustomerCode() != null && dto.getCustomerCode().toLowerCase().contains(clean));
                })
                .filter(dto -> {
                    if (agingBucket == null || agingBucket.trim().isEmpty() || "ALL".equalsIgnoreCase(agingBucket)) {
                        return true;
                    }
                    if ("OVERDUE".equalsIgnoreCase(agingBucket)) {
                        return dto.getDaysOverdue() > 0;
                    }
                    return dto.getAgingBucket().equalsIgnoreCase(agingBucket);
                })
                .toList();

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filteredList.size());
        List<RekapPiutangDTO> pageContent = (start <= end && start < filteredList.size())
                ? filteredList.subList(start, end)
                : Collections.emptyList();

        Page<RekapPiutangDTO> pagedResult = new PageImpl<>(pageContent, pageable, filteredList.size());

        return new RekapPiutangSummaryDTO(
                pagedResult,
                allOutstanding.size(),
                grandTotalOutstanding,
                currentAmount,
                currentCount,
                overdueAmount,
                overdueCount,
                bucket1To30Amount,
                bucket1To30Count,
                bucket31To60Amount,
                bucket31To60Count,
                bucket61To90Amount,
                bucket61To90Count,
                bucketOver90Amount,
                bucketOver90Count
        );
    }

    @Transactional(readOnly = true)
    public CustomerStatementDTO getCustomerStatement(Long customerId, LocalDate startDate, LocalDate endDate) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND, "Customer dengan ID " + customerId + " tidak ditemukan"));

        LocalDate effectiveStart = startDate != null ? startDate : LocalDate.of(2000, 1, 1);
        LocalDate effectiveEnd = endDate != null ? endDate : LocalDate.of(2099, 12, 31);

        CustomerStatementDTO statement = new CustomerStatementDTO();
        statement.setCustomerId(customer.getId());
        statement.setCustomerName(customer.getName());
        statement.setCustomerCode(customer.getCode());
        statement.setEmail(customer.getEmail());
        statement.setPhone(customer.getPhone());
        statement.setCompany(customer.getCompanyName());
        statement.setAddress(customer.getAddress());

        // 1. Calculate Deposit Balance
        BigDecimal depositBalance = depositTransactionRepository.calculateCurrentBalanceByCustomerId(customerId);
        statement.setDepositBalance(depositBalance != null ? depositBalance : BigDecimal.ZERO);

        List<CustomerStatementItemDTO> rawItems = new ArrayList<>();

        // 2. Query Kegiatan
        List<Kegiatan> kegiatanList = kegiatanRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
        int totalKegiatanCount = 0;
        BigDecimal totalKegiatanAmount = BigDecimal.ZERO;

        for (Kegiatan k : kegiatanList) {
            LocalDate kDate = k.getCreatedAt() != null ? k.getCreatedAt().toLocalDate() : null;
            totalKegiatanCount++;
            totalKegiatanAmount = totalKegiatanAmount.add(k.getTotalAmount() != null ? k.getTotalAmount() : BigDecimal.ZERO);

            if (kDate != null && !kDate.isBefore(effectiveStart) && !kDate.isAfter(effectiveEnd)) {
                rawItems.add(new CustomerStatementItemDTO(
                        kDate,
                        "KEGIATAN",
                        k.getId(),
                        k.getCode(),
                        "Kegiatan: " + k.getName(),
                        k.getStatus() != null ? k.getStatus().name() : "ACTIVE",
                        k.getTotalAmount(),
                        BigDecimal.ZERO,
                        BigDecimal.ZERO,
                        BigDecimal.ZERO,
                        k.getDescription()
                ));
            }
        }
        statement.setTotalKegiatanCount(totalKegiatanCount);
        statement.setTotalKegiatanAmount(totalKegiatanAmount);

        // 3. Query Penawaran / SPH
        List<Penawaran> penawaranList = penawaranRepository.findByCustomerIdOrderByDateDesc(customerId);
        int totalPenawaranCount = 0;
        BigDecimal totalPenawaranAmount = BigDecimal.ZERO;

        for (Penawaran p : penawaranList) {
            if (p.getStatus() != PenawaranStatus.CANCELLED) {
                totalPenawaranCount++;
                totalPenawaranAmount = totalPenawaranAmount.add(p.getTotalAmount() != null ? p.getTotalAmount() : BigDecimal.ZERO);
            }

            LocalDate pDate = p.getDate();
            if (pDate != null && !pDate.isBefore(effectiveStart) && !pDate.isAfter(effectiveEnd)) {
                rawItems.add(new CustomerStatementItemDTO(
                        pDate,
                        "SPH",
                        p.getId(),
                        p.getNumber(),
                        "Surat Penawaran Harga (SPH)",
                        p.getStatus() != null ? p.getStatus().name() : "DRAFT",
                        p.getTotalAmount(),
                        BigDecimal.ZERO,
                        BigDecimal.ZERO,
                        BigDecimal.ZERO,
                        p.getNotes()
                ));
            }
        }
        statement.setTotalPenawaranCount(totalPenawaranCount);
        statement.setTotalPenawaranAmount(totalPenawaranAmount);

        // 4. Query Invoices
        List<Invoice> invoiceList = invoiceRepository.findByCustomerIdOrderByDateDesc(customerId);
        int totalInvoiceCount = 0;
        BigDecimal totalInvoiceAmount = BigDecimal.ZERO;
        BigDecimal totalPaidOnInvoices = BigDecimal.ZERO;

        for (Invoice inv : invoiceList) {
            if (inv.getStatus() != InvoiceStatus.CANCELLED) {
                totalInvoiceCount++;
                totalInvoiceAmount = totalInvoiceAmount.add(inv.getTotalAmount() != null ? inv.getTotalAmount() : BigDecimal.ZERO);
                totalPaidOnInvoices = totalPaidOnInvoices.add(inv.getPaidAmount() != null ? inv.getPaidAmount() : BigDecimal.ZERO);
            }

            LocalDate invDate = inv.getDate();
            if (invDate != null && !invDate.isBefore(effectiveStart) && !invDate.isAfter(effectiveEnd)) {
                BigDecimal invTotal = inv.getTotalAmount() != null ? inv.getTotalAmount() : BigDecimal.ZERO;
                rawItems.add(new CustomerStatementItemDTO(
                        invDate,
                        "INVOICE",
                        inv.getId(),
                        inv.getNumber(),
                        "Faktur Penjualan (Jatuh Tempo: " + (inv.getDueDate() != null ? inv.getDueDate().toString() : "-") + ")",
                        inv.getPaymentStatus() != null ? inv.getPaymentStatus().name() : inv.getStatus().name(),
                        invTotal,
                        invTotal,
                        BigDecimal.ZERO,
                        BigDecimal.ZERO,
                        inv.getNotes()
                ));
            }
        }
        statement.setTotalInvoiceCount(totalInvoiceCount);
        statement.setTotalInvoiceAmount(totalInvoiceAmount);
        statement.setTotalPaidAmount(totalPaidOnInvoices);
        statement.setTotalOutstandingAmount(totalInvoiceAmount.subtract(totalPaidOnInvoices).max(BigDecimal.ZERO));

        // 5. Query Payments
        List<Payment> paymentList = paymentRepository.findByCustomerIdOrderByDateDesc(customerId);
        for (Payment pay : paymentList) {
            if (pay.getStatus() != PaymentStatus.CANCELLED) {
                LocalDate payDate = pay.getDate();
                if (payDate != null && !payDate.isBefore(effectiveStart) && !payDate.isAfter(effectiveEnd)) {
                    BigDecimal payAmount = pay.getAmount() != null ? pay.getAmount() : BigDecimal.ZERO;
                    rawItems.add(new CustomerStatementItemDTO(
                            payDate,
                            "PAYMENT",
                            pay.getId(),
                            pay.getNumber(),
                            "Pembayaran via " + pay.getPaymentMethod() + (pay.getDestinationAccount() != null ? " (" + pay.getDestinationAccount() + ")" : ""),
                            pay.getStatus() != null ? pay.getStatus().name() : "CONFIRMED",
                            payAmount,
                            BigDecimal.ZERO,
                            payAmount,
                            BigDecimal.ZERO,
                            pay.getReference() != null ? "Ref: " + pay.getReference() : pay.getNotes()
                    ));
                }
            }
        }

        // 6. Query Deposit Transactions
        List<DepositTransaction> depositList = depositTransactionRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
        for (DepositTransaction dt : depositList) {
            LocalDate dtDate = dt.getCreatedAt() != null ? dt.getCreatedAt().toLocalDate() : null;
            if (dtDate != null && !dtDate.isBefore(effectiveStart) && !dtDate.isAfter(effectiveEnd)) {
                rawItems.add(new CustomerStatementItemDTO(
                        dtDate,
                        "DEPOSIT",
                        dt.getId(),
                        dt.getType() != null ? dt.getType().name() : "DEPOSIT",
                        "Mutasi Deposit: " + (dt.getNotes() != null ? dt.getNotes() : (dt.getType() != null ? dt.getType().name() : "Deposit")),
                        dt.getType() != null ? dt.getType().name() : "COMPLETED",
                        dt.getAmount(),
                        BigDecimal.ZERO,
                        BigDecimal.ZERO,
                        dt.getBalanceAfter(),
                        dt.getNotes()
                ));
            }
        }

        // 7. Chronological Sort: date ASC, then type rank
        rawItems.sort((a, b) -> {
            int dateCmp = a.getDate().compareTo(b.getDate());
            if (dateCmp != 0) {
                return dateCmp;
            }
            int rankA = getTypeRank(a.getType());
            int rankB = getTypeRank(b.getType());
            return Integer.compare(rankA, rankB);
        });

        // 8. Compute cumulative runningBalance for receivable (Piutang)
        BigDecimal runningPiutang = BigDecimal.ZERO;
        for (CustomerStatementItemDTO item : rawItems) {
            if ("INVOICE".equals(item.getType())) {
                runningPiutang = runningPiutang.add(item.getDebit());
            } else if ("PAYMENT".equals(item.getType())) {
                runningPiutang = runningPiutang.subtract(item.getCredit());
                if (runningPiutang.compareTo(BigDecimal.ZERO) < 0) {
                    runningPiutang = BigDecimal.ZERO;
                }
            }
            item.setRunningBalance(runningPiutang);
        }

        statement.setItems(rawItems);
        return statement;
    }

    private int getTypeRank(String type) {
        if (type == null) return 99;
        switch (type) {
            case "KEGIATAN": return 1;
            case "SPH": return 2;
            case "INVOICE": return 3;
            case "PAYMENT": return 4;
            case "DEPOSIT": return 5;
            default: return 10;
        }
    }

    @Transactional(readOnly = true)
    public RekapUnbilledSummaryDTO getRekapUnbilledSph(
            LocalDate startDate,
            LocalDate endDate,
            Long customerId,
            String billingStatus,
            String search,
            Pageable pageable
    ) {
        LocalDate effectiveStart = startDate != null ? startDate : LocalDate.of(2000, 1, 1);
        LocalDate effectiveEnd = endDate != null ? endDate : LocalDate.of(2099, 12, 31);

        List<Penawaran> penawaranList = penawaranRepository.findAll();
        String searchPattern = (search != null && !search.trim().isEmpty())
                ? search.trim().toLowerCase()
                : null;

        List<RekapUnbilledSphDTO> allList = new ArrayList<>();
        int totalApprovedSph = 0;
        int unbilledCount = 0;
        int partiallyBilledCount = 0;
        int fullyBilledCount = 0;
        BigDecimal grandTotalSphAmount = BigDecimal.ZERO;
        BigDecimal grandTotalInvoicedAmount = BigDecimal.ZERO;
        BigDecimal grandTotalUnbilledAmount = BigDecimal.ZERO;

        for (Penawaran p : penawaranList) {
            if (p.getStatus() == PenawaranStatus.CANCELLED) {
                continue;
            }

            LocalDate pDate = p.getDate();
            if (pDate == null || pDate.isBefore(effectiveStart) || pDate.isAfter(effectiveEnd)) {
                continue;
            }

            if (customerId != null && (p.getCustomer() == null || !customerId.equals(p.getCustomer().getId()))) {
                continue;
            }

            List<Invoice> invoices = invoiceRepository.findBySourcePenawaranId(p.getId());
            BigDecimal totalInvoiced = BigDecimal.ZERO;
            List<RekapUnbilledSphDTO.InvoiceBriefDTO> invoiceBriefs = new ArrayList<>();

            for (Invoice inv : invoices) {
                if (inv.getStatus() != InvoiceStatus.CANCELLED) {
                    BigDecimal invAmount = inv.getTotalAmount() != null ? inv.getTotalAmount() : BigDecimal.ZERO;
                    totalInvoiced = totalInvoiced.add(invAmount);
                    invoiceBriefs.add(new RekapUnbilledSphDTO.InvoiceBriefDTO(
                            inv.getId(),
                            inv.getNumber(),
                            inv.getDate(),
                            invAmount,
                            inv.getPaymentStatus() != null ? inv.getPaymentStatus().name() : inv.getStatus().name()
                    ));
                }
            }

            BigDecimal sphTotal = p.getTotalAmount() != null ? p.getTotalAmount() : BigDecimal.ZERO;
            BigDecimal unbilled = sphTotal.subtract(totalInvoiced).max(BigDecimal.ZERO);
            double pct = sphTotal.compareTo(BigDecimal.ZERO) > 0
                    ? totalInvoiced.multiply(BigDecimal.valueOf(100)).divide(sphTotal, 2, java.math.RoundingMode.HALF_UP).doubleValue()
                    : (totalInvoiced.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0);

            String statusGroup;
            if (totalInvoiced.compareTo(BigDecimal.ZERO) == 0) {
                statusGroup = "UNBILLED";
                unbilledCount++;
            } else if (totalInvoiced.compareTo(sphTotal) >= 0) {
                statusGroup = "FULLY_BILLED";
                fullyBilledCount++;
            } else {
                statusGroup = "PARTIALLY_BILLED";
                partiallyBilledCount++;
            }

            totalApprovedSph++;
            grandTotalSphAmount = grandTotalSphAmount.add(sphTotal);
            grandTotalInvoicedAmount = grandTotalInvoicedAmount.add(totalInvoiced);
            grandTotalUnbilledAmount = grandTotalUnbilledAmount.add(unbilled);

            if (billingStatus != null && !billingStatus.trim().isEmpty() && !"ALL".equalsIgnoreCase(billingStatus)) {
                if (!statusGroup.equalsIgnoreCase(billingStatus.trim())) {
                    continue;
                }
            }

            if (searchPattern != null) {
                boolean matchNo = p.getNumber() != null && p.getNumber().toLowerCase().contains(searchPattern);
                boolean matchCust = p.getCustomer() != null && (
                        (p.getCustomer().getName() != null && p.getCustomer().getName().toLowerCase().contains(searchPattern)) ||
                        (p.getCustomer().getCode() != null && p.getCustomer().getCode().toLowerCase().contains(searchPattern))
                );
                if (!matchNo && !matchCust) {
                    continue;
                }
            }

            RekapUnbilledSphDTO dto = new RekapUnbilledSphDTO();
            dto.setSphId(p.getId());
            dto.setSphNumber(p.getNumber());
            dto.setSphDate(p.getDate());
            dto.setCustomerId(p.getCustomer() != null ? p.getCustomer().getId() : null);
            dto.setCustomerCode(p.getCustomer() != null ? p.getCustomer().getCode() : "-");
            dto.setCustomerName(p.getCustomer() != null ? p.getCustomer().getName() : "-");
            dto.setCompanyName(p.getCustomer() != null ? p.getCustomer().getCompanyName() : null);
            dto.setStatus(p.getStatus() != null ? p.getStatus().name() : "DRAFT");
            dto.setTotalSphAmount(sphTotal);
            dto.setTotalInvoicedAmount(totalInvoiced);
            dto.setUnbilledAmount(unbilled);
            dto.setBilledPercentage(pct);
            dto.setBillingStatus(statusGroup);
            dto.setInvoiceCount(invoiceBriefs.size());
            dto.setInvoices(invoiceBriefs);

            allList.add(dto);
        }

        allList.sort((a, b) -> b.getUnbilledAmount().compareTo(a.getUnbilledAmount()));

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), allList.size());
        List<RekapUnbilledSphDTO> pageContent = (start <= end && start < allList.size())
                ? allList.subList(start, end)
                : Collections.emptyList();

        Page<RekapUnbilledSphDTO> pagedResult = new PageImpl<>(pageContent, pageable, allList.size());

        return new RekapUnbilledSummaryDTO(
                pagedResult,
                totalApprovedSph,
                unbilledCount,
                partiallyBilledCount,
                fullyBilledCount,
                grandTotalSphAmount,
                grandTotalInvoicedAmount,
                grandTotalUnbilledAmount
        );
    }

    @Transactional(readOnly = true)
    public InvoiceSettlementSummaryDTO getRekapInvoiceSettlements(
            LocalDate startDate,
            LocalDate endDate,
            Long customerId,
            String paymentStatus,
            String search,
            Pageable pageable
    ) {
        LocalDate effectiveStart = startDate != null ? startDate : LocalDate.of(2000, 1, 1);
        LocalDate effectiveEnd = endDate != null ? endDate : LocalDate.of(2099, 12, 31);

        List<Invoice> invoiceList = invoiceRepository.findAll();
        String searchPattern = (search != null && !search.trim().isEmpty())
                ? search.trim().toLowerCase()
                : null;

        List<InvoiceSettlementDTO> allList = new ArrayList<>();
        BigDecimal grandTotalAmount = BigDecimal.ZERO;
        BigDecimal grandTotalPaidAmount = BigDecimal.ZERO;
        BigDecimal grandTotalOutstanding = BigDecimal.ZERO;

        for (Invoice inv : invoiceList) {
            if (inv.getStatus() == InvoiceStatus.CANCELLED) {
                continue;
            }

            LocalDate invDate = inv.getDate();
            if (invDate == null || invDate.isBefore(effectiveStart) || invDate.isAfter(effectiveEnd)) {
                continue;
            }

            if (customerId != null && (inv.getCustomer() == null || !customerId.equals(inv.getCustomer().getId()))) {
                continue;
            }

            if (paymentStatus != null && !paymentStatus.trim().isEmpty() && !"ALL".equalsIgnoreCase(paymentStatus)) {
                if (inv.getPaymentStatus() == null || !inv.getPaymentStatus().name().equalsIgnoreCase(paymentStatus.trim())) {
                    continue;
                }
            }

            if (searchPattern != null) {
                boolean matchNo = inv.getNumber() != null && inv.getNumber().toLowerCase().contains(searchPattern);
                boolean matchCust = inv.getCustomer() != null && (
                        (inv.getCustomer().getName() != null && inv.getCustomer().getName().toLowerCase().contains(searchPattern)) ||
                        (inv.getCustomer().getCode() != null && inv.getCustomer().getCode().toLowerCase().contains(searchPattern))
                );
                if (!matchNo && !matchCust) {
                    continue;
                }
            }

            BigDecimal totalAmount = inv.getTotalAmount() != null ? inv.getTotalAmount() : BigDecimal.ZERO;
            BigDecimal paidAmount = inv.getPaidAmount() != null ? inv.getPaidAmount() : BigDecimal.ZERO;
            BigDecimal outstanding = totalAmount.subtract(paidAmount).max(BigDecimal.ZERO);

            grandTotalAmount = grandTotalAmount.add(totalAmount);
            grandTotalPaidAmount = grandTotalPaidAmount.add(paidAmount);
            grandTotalOutstanding = grandTotalOutstanding.add(outstanding);

            List<PaymentAllocation> allocations = paymentAllocationRepository.findByInvoiceId(inv.getId());
            List<InvoiceSettlementAllocationDTO> allocationDTOs = new ArrayList<>();

            for (PaymentAllocation pa : allocations) {
                Payment pay = pa.getPayment();
                if (pay != null && pay.getStatus() != PaymentStatus.CANCELLED) {
                    allocationDTOs.add(new InvoiceSettlementAllocationDTO(
                            pay.getId(),
                            pay.getNumber(),
                            pay.getDate(),
                            pay.getAmount(),
                            pa.getAmount(),
                            pay.getPaymentMethod() != null ? pay.getPaymentMethod().name() : "OTHER",
                            pay.getDestinationAccount(),
                            pa.getNotes()
                    ));
                }
            }

            InvoiceSettlementDTO dto = new InvoiceSettlementDTO();
            dto.setInvoiceId(inv.getId());
            dto.setInvoiceNumber(inv.getNumber());
            dto.setInvoiceDate(inv.getDate());
            dto.setDueDate(inv.getDueDate());
            dto.setCustomerId(inv.getCustomer() != null ? inv.getCustomer().getId() : null);
            dto.setCustomerCode(inv.getCustomer() != null ? inv.getCustomer().getCode() : "-");
            dto.setCustomerName(inv.getCustomer() != null ? inv.getCustomer().getName() : "-");
            dto.setCompanyName(inv.getCustomer() != null ? inv.getCustomer().getCompanyName() : null);
            dto.setInvoiceStatus(inv.getStatus() != null ? inv.getStatus().name() : "DRAFT");
            dto.setPaymentStatus(inv.getPaymentStatus() != null ? inv.getPaymentStatus().name() : "UNPAID");
            dto.setTotalAmount(totalAmount);
            dto.setPaidAmount(paidAmount);
            dto.setOutstanding(outstanding);
            dto.setAllocations(allocationDTOs);

            allList.add(dto);
        }

        allList.sort((a, b) -> b.getInvoiceDate().compareTo(a.getInvoiceDate()));

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), allList.size());
        List<InvoiceSettlementDTO> pageContent = (start <= end && start < allList.size())
                ? allList.subList(start, end)
                : Collections.emptyList();

        Page<InvoiceSettlementDTO> pagedResult = new PageImpl<>(pageContent, pageable, allList.size());

        return new InvoiceSettlementSummaryDTO(
                pagedResult,
                allList.size(),
                grandTotalAmount,
                grandTotalPaidAmount,
                grandTotalOutstanding
        );
    }

    @Transactional(readOnly = true)
    public YearlyTrendSummaryDTO getMonthlyTrend(int year, Long customerId) {
        String[] monthNames = {
                "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        };

        YearlyTrendSummaryDTO summary = new YearlyTrendSummaryDTO();
        summary.setYear(year);
        summary.setCustomerId(customerId);
        if (customerId != null) {
            customerRepository.findById(customerId).ifPresent(c -> summary.setCustomerName(c.getName()));
        }

        List<MonthlyTrendItemDTO> monthlyList = new ArrayList<>();
        BigDecimal totalKegiatan = BigDecimal.ZERO;
        BigDecimal totalSph = BigDecimal.ZERO;
        BigDecimal totalInvoice = BigDecimal.ZERO;
        BigDecimal totalPayment = BigDecimal.ZERO;
        BigDecimal totalOutstanding = BigDecimal.ZERO;

        BigDecimal prevInvoiceAmount = null;
        BigDecimal prevPaymentAmount = null;

        int peakInvMonth = 1;
        BigDecimal peakInvAmount = BigDecimal.ZERO;
        int peakPayMonth = 1;
        BigDecimal peakPayAmount = BigDecimal.ZERO;

        double sumCollectionRate = 0.0;
        int validRateMonths = 0;

        for (int m = 1; m <= 12; m++) {
            LocalDate mStart = LocalDate.of(year, m, 1);
            LocalDate mEnd = mStart.withDayOfMonth(mStart.lengthOfMonth());

            OffsetDateTime mStartOdt = mStart.atStartOfDay().atOffset(ZoneOffset.UTC);
            OffsetDateTime mEndOdt = mEnd.atTime(LocalTime.MAX).atOffset(ZoneOffset.UTC);

            List<Kegiatan> kList = customerId != null
                    ? kegiatanRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                    : kegiatanRepository.findAll();
            int kCount = 0;
            BigDecimal kAmount = BigDecimal.ZERO;
            for (Kegiatan k : kList) {
                if (k.getCreatedAt() != null && !k.getCreatedAt().isBefore(mStartOdt) && !k.getCreatedAt().isAfter(mEndOdt)) {
                    kCount++;
                    kAmount = kAmount.add(k.getTotalAmount() != null ? k.getTotalAmount() : BigDecimal.ZERO);
                }
            }

            List<Penawaran> pList = customerId != null
                    ? penawaranRepository.findByCustomerIdOrderByDateDesc(customerId)
                    : penawaranRepository.findAll();
            int sphCount = 0;
            BigDecimal sphAmount = BigDecimal.ZERO;
            for (Penawaran p : pList) {
                if (p.getStatus() != PenawaranStatus.CANCELLED && p.getDate() != null && !p.getDate().isBefore(mStart) && !p.getDate().isAfter(mEnd)) {
                    sphCount++;
                    sphAmount = sphAmount.add(p.getTotalAmount() != null ? p.getTotalAmount() : BigDecimal.ZERO);
                }
            }

            List<Invoice> invList = customerId != null
                    ? invoiceRepository.findByCustomerIdOrderByDateDesc(customerId)
                    : invoiceRepository.findAll();
            int invCount = 0;
            BigDecimal invAmount = BigDecimal.ZERO;
            BigDecimal invOutstanding = BigDecimal.ZERO;
            for (Invoice inv : invList) {
                if (inv.getStatus() != InvoiceStatus.CANCELLED && inv.getDate() != null && !inv.getDate().isBefore(mStart) && !inv.getDate().isAfter(mEnd)) {
                    invCount++;
                    BigDecimal total = inv.getTotalAmount() != null ? inv.getTotalAmount() : BigDecimal.ZERO;
                    BigDecimal paid = inv.getPaidAmount() != null ? inv.getPaidAmount() : BigDecimal.ZERO;
                    invAmount = invAmount.add(total);
                    invOutstanding = invOutstanding.add(total.subtract(paid).max(BigDecimal.ZERO));
                }
            }

            List<Payment> payList = customerId != null
                    ? paymentRepository.findByCustomerIdOrderByDateDesc(customerId)
                    : paymentRepository.findAll();
            int payCount = 0;
            BigDecimal payAmount = BigDecimal.ZERO;
            for (Payment pay : payList) {
                if (pay.getStatus() == PaymentStatus.CONFIRMED && pay.getDate() != null && !pay.getDate().isBefore(mStart) && !pay.getDate().isAfter(mEnd)) {
                    payCount++;
                    payAmount = payAmount.add(pay.getAmount() != null ? pay.getAmount() : BigDecimal.ZERO);
                }
            }

            Double momInv = null;
            if (prevInvoiceAmount != null && prevInvoiceAmount.compareTo(BigDecimal.ZERO) > 0) {
                momInv = invAmount.subtract(prevInvoiceAmount)
                        .multiply(BigDecimal.valueOf(100))
                        .divide(prevInvoiceAmount, 2, java.math.RoundingMode.HALF_UP)
                        .doubleValue();
            }
            Double momPay = null;
            if (prevPaymentAmount != null && prevPaymentAmount.compareTo(BigDecimal.ZERO) > 0) {
                momPay = payAmount.subtract(prevPaymentAmount)
                        .multiply(BigDecimal.valueOf(100))
                        .divide(prevPaymentAmount, 2, java.math.RoundingMode.HALF_UP)
                        .doubleValue();
            }

            Double collectionRate = null;
            if (invAmount.compareTo(BigDecimal.ZERO) > 0) {
                collectionRate = payAmount.multiply(BigDecimal.valueOf(100))
                        .divide(invAmount, 2, java.math.RoundingMode.HALF_UP)
                        .doubleValue();
                sumCollectionRate += collectionRate;
                validRateMonths++;
            }

            if (invAmount.compareTo(peakInvAmount) > 0) {
                peakInvAmount = invAmount;
                peakInvMonth = m;
            }
            if (payAmount.compareTo(peakPayAmount) > 0) {
                peakPayAmount = payAmount;
                peakPayMonth = m;
            }

            prevInvoiceAmount = invAmount;
            prevPaymentAmount = payAmount;

            totalKegiatan = totalKegiatan.add(kAmount);
            totalSph = totalSph.add(sphAmount);
            totalInvoice = totalInvoice.add(invAmount);
            totalPayment = totalPayment.add(payAmount);
            totalOutstanding = totalOutstanding.add(invOutstanding);

            monthlyList.add(new MonthlyTrendItemDTO(
                    m,
                    monthNames[m - 1],
                    kCount,
                    kAmount,
                    sphCount,
                    sphAmount,
                    invCount,
                    invAmount,
                    payCount,
                    payAmount,
                    invOutstanding,
                    momInv,
                    momPay,
                    collectionRate
            ));
        }

        summary.setTotalKegiatanAmount(totalKegiatan);
        summary.setTotalSphAmount(totalSph);
        summary.setTotalInvoiceAmount(totalInvoice);
        summary.setTotalPaymentAmount(totalPayment);
        summary.setTotalOutstandingAmount(totalOutstanding);
        summary.setAverageCollectionRate(validRateMonths > 0 ? (sumCollectionRate / validRateMonths) : 0.0);
        summary.setPeakInvoiceMonth(peakInvMonth);
        summary.setPeakInvoiceMonthName(monthNames[peakInvMonth - 1]);
        summary.setPeakPaymentMonth(peakPayMonth);
        summary.setPeakPaymentMonthName(monthNames[peakPayMonth - 1]);
        summary.setMonthlyData(monthlyList);

        return summary;
    }
}

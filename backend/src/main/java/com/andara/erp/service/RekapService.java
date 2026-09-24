package com.andara.erp.service;

import com.andara.erp.dto.rekap.RekapCustomerDTO;
import com.andara.erp.dto.rekap.RekapCustomerSummaryDTO;
import com.andara.erp.dto.rekap.RekapInvoiceDTO;
import com.andara.erp.dto.rekap.RekapInvoiceSummaryDTO;
import com.andara.erp.dto.rekap.RekapKegiatanDTO;
import com.andara.erp.dto.rekap.RekapKegiatanSummaryDTO;
import com.andara.erp.dto.rekap.RekapPaymentDTO;
import com.andara.erp.dto.rekap.RekapPaymentSummaryDTO;
import com.andara.erp.entity.Customer;
import com.andara.erp.entity.Invoice;
import com.andara.erp.entity.InvoicePaymentStatus;
import com.andara.erp.entity.InvoiceStatus;
import com.andara.erp.entity.Kegiatan;
import com.andara.erp.entity.KegiatanStatus;
import com.andara.erp.entity.Payment;
import com.andara.erp.entity.PaymentAllocation;
import com.andara.erp.entity.PaymentMethod;
import com.andara.erp.entity.PaymentStatus;
import com.andara.erp.repository.CustomerRepository;
import com.andara.erp.repository.DepositTransactionRepository;
import com.andara.erp.repository.InvoiceRepository;
import com.andara.erp.repository.KegiatanRepository;
import com.andara.erp.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
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

    private static final LocalDate ALL_START = LocalDate.of(2000, 1, 1);
    private static final LocalDate ALL_END = LocalDate.of(2099, 12, 31);

    public RekapService(CustomerRepository customerRepository,
                        KegiatanRepository kegiatanRepository,
                        InvoiceRepository invoiceRepository,
                        PaymentRepository paymentRepository,
                        DepositTransactionRepository depositTransactionRepository) {
        this.customerRepository = customerRepository;
        this.kegiatanRepository = kegiatanRepository;
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
        this.depositTransactionRepository = depositTransactionRepository;
    }

    public RekapCustomerSummaryDTO getRekapCustomers(String search, Pageable pageable) {
        log.debug("Generating Rekap Customers search={}", search);

        Page<Customer> customerPage = customerRepository.searchCustomers(search, null, pageable);

        List<RekapCustomerDTO> dtoList = customerPage.getContent().stream().map(c -> {
            long kegiatanCount = kegiatanRepository.countByCustomerId(c.getId());
            long invoiceCount = invoiceRepository.countByCustomerId(c.getId());
            BigDecimal totalInvoice = invoiceRepository.sumTotalAmountActiveByCustomerIdAndDateRange(c.getId(), ALL_START, ALL_END);
            BigDecimal totalPaid = paymentRepository.sumAmountConfirmedByCustomerIdAndDateRange(c.getId(), ALL_START, ALL_END);
            BigDecimal outstanding = invoiceRepository.sumOutstandingActiveByCustomerIdAndDateRange(c.getId(), ALL_START, ALL_END);
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

        BigDecimal grandTotalInvoice = invoiceRepository.sumTotalAmountActiveByDateRange(ALL_START, ALL_END);
        BigDecimal grandTotalPaid = paymentRepository.sumAmountConfirmedByDateRange(ALL_START, ALL_END);
        BigDecimal grandTotalOutstanding = invoiceRepository.sumOutstandingActiveByDateRange(ALL_START, ALL_END);
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

        return new RekapPaymentSummaryDTO(
                pagedResult,
                paymentPage.getTotalElements(),
                grandTotalAmount != null ? grandTotalAmount : BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO
        );
    }

    public RekapKegiatanSummaryDTO getRekapKegiatan(
            Long customerId,
            KegiatanStatus status,
            String search,
            Pageable pageable
    ) {
        log.debug("Generating Rekap Kegiatan");

        String searchPattern = (search != null && !search.trim().isEmpty())
                ? "%" + search.trim().toLowerCase() + "%"
                : null;

        Page<Kegiatan> kegiatanPage = kegiatanRepository.findWithFilters(
                searchPattern,
                customerId,
                status,
                pageable
        );

        List<RekapKegiatanDTO> dtoList = kegiatanPage.getContent().stream().map(k -> new RekapKegiatanDTO(
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
                0,
                0,
                k.getCreatedAt() != null ? k.getCreatedAt().toLocalDateTime() : null
        )).toList();

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
}

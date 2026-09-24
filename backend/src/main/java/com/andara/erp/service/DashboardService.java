package com.andara.erp.service;

import com.andara.erp.dto.dashboard.DashboardInvoiceDTO;
import com.andara.erp.dto.dashboard.DashboardPaymentDTO;
import com.andara.erp.dto.dashboard.DashboardSummaryDTO;
import com.andara.erp.dto.dashboard.MonthlyTrendDTO;
import com.andara.erp.entity.Invoice;
import com.andara.erp.entity.KegiatanStatus;
import com.andara.erp.entity.Payment;
import com.andara.erp.repository.CustomerRepository;
import com.andara.erp.repository.DepositTransactionRepository;
import com.andara.erp.repository.InvoiceRepository;
import com.andara.erp.repository.KegiatanRepository;
import com.andara.erp.repository.PaymentRepository;
import com.andara.erp.repository.PenawaranRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private static final Logger log = LoggerFactory.getLogger(DashboardService.class);

    private final CustomerRepository customerRepository;
    private final KegiatanRepository kegiatanRepository;
    private final PenawaranRepository penawaranRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final DepositTransactionRepository depositTransactionRepository;

    public DashboardService(CustomerRepository customerRepository,
                            KegiatanRepository kegiatanRepository,
                            PenawaranRepository penawaranRepository,
                            InvoiceRepository invoiceRepository,
                            PaymentRepository paymentRepository,
                            DepositTransactionRepository depositTransactionRepository) {
        this.customerRepository = customerRepository;
        this.kegiatanRepository = kegiatanRepository;
        this.penawaranRepository = penawaranRepository;
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
        this.depositTransactionRepository = depositTransactionRepository;
    }

    public DashboardSummaryDTO getDashboardSummary(LocalDate startDate, LocalDate endDate, Long customerId) {
        log.debug("Fetching dashboard summary startDate={}, endDate={}, customerId={}", startDate, endDate, customerId);

        LocalDate effectiveStart = (startDate != null) ? startDate : LocalDate.of(2000, 1, 1);
        LocalDate effectiveEnd = (endDate != null) ? endDate : LocalDate.of(2099, 12, 31);

        long activeCustomers = customerRepository.countByIsActiveTrue();
        long activeKegiatan = kegiatanRepository.countByStatusIn(List.of(KegiatanStatus.PLANNED, KegiatanStatus.ACTIVE));

        long totalPenawaran = (customerId != null)
                ? penawaranRepository.countActiveByCustomerIdAndDateRange(customerId, effectiveStart, effectiveEnd)
                : penawaranRepository.countActiveByDateRange(effectiveStart, effectiveEnd);

        BigDecimal totalPenawaranAmount = (customerId != null)
                ? penawaranRepository.sumTotalAmountActiveByCustomerIdAndDateRange(customerId, effectiveStart, effectiveEnd)
                : penawaranRepository.sumTotalAmountActiveByDateRange(effectiveStart, effectiveEnd);

        long totalInvoices = (customerId != null)
                ? invoiceRepository.countActiveByCustomerIdAndDateRange(customerId, effectiveStart, effectiveEnd)
                : invoiceRepository.countActiveByDateRange(effectiveStart, effectiveEnd);

        BigDecimal totalInvoiceAmount = (customerId != null)
                ? invoiceRepository.sumTotalAmountActiveByCustomerIdAndDateRange(customerId, effectiveStart, effectiveEnd)
                : invoiceRepository.sumTotalAmountActiveByDateRange(effectiveStart, effectiveEnd);

        BigDecimal totalPayments = (customerId != null)
                ? paymentRepository.sumAmountConfirmedByCustomerIdAndDateRange(customerId, effectiveStart, effectiveEnd)
                : paymentRepository.sumAmountConfirmedByDateRange(effectiveStart, effectiveEnd);

        BigDecimal totalOutstanding = (customerId != null)
                ? invoiceRepository.sumOutstandingActiveByCustomerIdAndDateRange(customerId, effectiveStart, effectiveEnd)
                : invoiceRepository.sumOutstandingActiveByDateRange(effectiveStart, effectiveEnd);

        BigDecimal totalDeposit = (customerId != null)
                ? depositTransactionRepository.calculateCurrentBalanceByCustomerId(customerId)
                : depositTransactionRepository.calculateGrandTotalDepositBalance();
        if (totalDeposit == null) {
            totalDeposit = BigDecimal.ZERO;
        }

        long unpaidInvoiceCount = (customerId != null)
                ? invoiceRepository.countUnpaidActiveByCustomerIdAndDateRange(customerId, effectiveStart, effectiveEnd)
                : invoiceRepository.countUnpaidActiveByDateRange(effectiveStart, effectiveEnd);

        // Recent unpaid invoices (top 5 by due date)
        List<Invoice> recentUnpaidEntities = (customerId != null)
                ? invoiceRepository.findRecentUnpaidInvoicesByCustomerId(customerId, PageRequest.of(0, 5))
                : invoiceRepository.findRecentUnpaidInvoices(PageRequest.of(0, 5));

        List<DashboardInvoiceDTO> recentUnpaid = recentUnpaidEntities.stream()
                .map(inv -> new DashboardInvoiceDTO(
                        inv.getId(),
                        inv.getNumber(),
                        inv.getDate(),
                        inv.getDueDate(),
                        inv.getCustomer() != null ? inv.getCustomer().getName() : "-",
                        inv.getTotalAmount(),
                        inv.getPaidAmount(),
                        inv.getOutstanding(),
                        inv.getStatus().name(),
                        inv.getPaymentStatus().name()
                ))
                .toList();

        // Recent confirmed payments (top 5)
        List<Payment> recentPaymentEntities = (customerId != null)
                ? paymentRepository.findRecentConfirmedPaymentsByCustomerId(customerId, PageRequest.of(0, 5))
                : paymentRepository.findRecentConfirmedPayments(PageRequest.of(0, 5));

        List<DashboardPaymentDTO> recentPayments = recentPaymentEntities.stream()
                .map(pay -> new DashboardPaymentDTO(
                        pay.getId(),
                        pay.getNumber(),
                        pay.getDate(),
                        pay.getCustomer() != null ? pay.getCustomer().getName() : "-",
                        pay.getAmount(),
                        pay.getPaymentMethod().name(),
                        pay.getDestinationAccount(),
                        pay.getStatus().name()
                ))
                .toList();

        // Monthly trends for the past 6 months
        List<MonthlyTrendDTO> monthlyTrends = new ArrayList<>();
        YearMonth currentMonth = YearMonth.now();
        DateTimeFormatter labelFormatter = DateTimeFormatter.ofPattern("MMM yyyy", Locale.forLanguageTag("id-ID"));
        for (int i = 5; i >= 0; i--) {
            YearMonth targetMonth = currentMonth.minusMonths(i);
            LocalDate monthStart = targetMonth.atDay(1);
            LocalDate monthEnd = targetMonth.atEndOfMonth();

            BigDecimal monthInvoice = (customerId != null)
                    ? invoiceRepository.sumTotalAmountActiveByCustomerIdAndDateRange(customerId, monthStart, monthEnd)
                    : invoiceRepository.sumTotalAmountActiveByDateRange(monthStart, monthEnd);

            BigDecimal monthPayment = (customerId != null)
                    ? paymentRepository.sumAmountConfirmedByCustomerIdAndDateRange(customerId, monthStart, monthEnd)
                    : paymentRepository.sumAmountConfirmedByDateRange(monthStart, monthEnd);

            monthlyTrends.add(new MonthlyTrendDTO(
                    targetMonth.toString(),
                    targetMonth.format(labelFormatter),
                    monthInvoice != null ? monthInvoice : BigDecimal.ZERO,
                    monthPayment != null ? monthPayment : BigDecimal.ZERO
            ));
        }

        DashboardSummaryDTO summary = new DashboardSummaryDTO();
        summary.setTotalActiveCustomers(activeCustomers);
        summary.setTotalActiveKegiatan(activeKegiatan);
        summary.setTotalPenawaran(totalPenawaran);
        summary.setTotalPenawaranAmount(totalPenawaranAmount != null ? totalPenawaranAmount : BigDecimal.ZERO);
        summary.setTotalInvoices(totalInvoices);
        summary.setTotalInvoiceAmount(totalInvoiceAmount != null ? totalInvoiceAmount : BigDecimal.ZERO);
        summary.setTotalPayments(totalPayments != null ? totalPayments : BigDecimal.ZERO);
        summary.setTotalOutstanding(totalOutstanding != null ? totalOutstanding : BigDecimal.ZERO);
        summary.setTotalCustomerDeposit(totalDeposit);
        summary.setUnpaidInvoiceCount(unpaidInvoiceCount);
        summary.setRecentUnpaidInvoices(recentUnpaid);
        summary.setRecentPayments(recentPayments);
        summary.setMonthlyTrends(monthlyTrends);
        return summary;
    }
}

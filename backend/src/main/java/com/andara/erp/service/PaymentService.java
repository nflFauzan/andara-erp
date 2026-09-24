package com.andara.erp.service;

import com.andara.erp.common.exception.AppException;
import com.andara.erp.common.exception.ErrorCode;
import com.andara.erp.dto.payment.AllocationItemRequest;
import com.andara.erp.dto.payment.CreatePaymentRequest;
import com.andara.erp.dto.payment.PaymentAllocationDTO;
import com.andara.erp.dto.payment.PaymentDTO;
import com.andara.erp.entity.*;
import com.andara.erp.repository.CustomerRepository;
import com.andara.erp.repository.InvoiceRepository;
import com.andara.erp.repository.PaymentAllocationRepository;
import com.andara.erp.repository.PaymentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentAllocationRepository paymentAllocationRepository;
    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final NumberingService numberingService;
    private final DepositService depositService;
    private final AuditLogService auditLogService;

    public PaymentService(
            PaymentRepository paymentRepository,
            PaymentAllocationRepository paymentAllocationRepository,
            InvoiceRepository invoiceRepository,
            CustomerRepository customerRepository,
            NumberingService numberingService,
            DepositService depositService,
            AuditLogService auditLogService
    ) {
        this.paymentRepository = paymentRepository;
        this.paymentAllocationRepository = paymentAllocationRepository;
        this.invoiceRepository = invoiceRepository;
        this.customerRepository = customerRepository;
        this.numberingService = numberingService;
        this.depositService = depositService;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public Page<PaymentDTO> getPaymentList(
            String search,
            Long customerId,
            PaymentStatus status,
            PaymentMethod method,
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable
    ) {
        String searchPattern = (search != null && !search.trim().isEmpty())
                ? "%" + search.trim().toLowerCase() + "%"
                : null;

        Page<Payment> page = paymentRepository.findWithFilters(
                searchPattern,
                customerId,
                status,
                method,
                startDate,
                endDate,
                pageable
        );

        return page.map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public PaymentDTO getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND, "Pembayaran dengan ID " + id + " tidak ditemukan"));
        return mapToDTO(payment);
    }

    @Transactional
    public PaymentDTO createPayment(CreatePaymentRequest request, String username) {
        // Concurrency lock on Customer
        Customer customer = customerRepository.findByIdForUpdate(request.getCustomerId())
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND, "Customer tidak ditemukan"));

        if (!customer.isActive()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Customer tidak aktif");
        }

        BigDecimal paymentAmount = request.getAmount();

        // 1. Calculate and validate allocations
        BigDecimal totalAllocated = BigDecimal.ZERO;
        List<AllocationItemRequest> allocationRequests = request.getAllocations() != null ? request.getAllocations() : new ArrayList<>();

        for (AllocationItemRequest item : allocationRequests) {
            if (item.getAmount() == null || item.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new AppException(ErrorCode.INVALID_REQUEST, "Nominal alokasi harus lebih dari 0");
            }
            totalAllocated = totalAllocated.add(item.getAmount());
        }

        // Invariant: SUM(payment allocations) <= payment.amount
        if (totalAllocated.compareTo(paymentAmount) > 0) {
            throw new AppException(
                    ErrorCode.PAYMENT_OVER_ALLOCATED,
                    "Total alokasi (Rp " + totalAllocated + ") melebihi nominal pembayaran (Rp " + paymentAmount + ")"
            );
        }

        // 2. Generate Payment Number concurrency-safe
        LocalDate paymentDate = request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now();
        String paymentNumber = numberingService.generateNextNumber(DocumentType.PEMBAYARAN, paymentDate);

        // 3. Initialize Payment entity
        Payment payment = new Payment();
        payment.setNumber(paymentNumber);
        payment.setCustomer(customer);
        payment.setDate(paymentDate);
        payment.setAmount(paymentAmount);
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setDestinationAccount(request.getDestinationAccount());
        payment.setReference(request.getReference());
        payment.setNotes(request.getNotes());
        payment.setStatus(PaymentStatus.CONFIRMED);
        payment.setCreatedBy(username);
        payment.setUpdatedBy(username);

        Payment savedPayment = paymentRepository.save(payment);

        // 4. Process invoice allocations
        for (AllocationItemRequest item : allocationRequests) {
            Invoice invoice = invoiceRepository.findByIdForUpdate(item.getInvoiceId())
                    .orElseThrow(() -> new AppException(ErrorCode.INVOICE_NOT_FOUND, "Faktur dengan ID " + item.getInvoiceId() + " tidak ditemukan"));

            // Invariant: Invoice must belong to the customer
            if (!invoice.getCustomer().getId().equals(customer.getId())) {
                throw new AppException(ErrorCode.INVALID_REQUEST, "Faktur " + invoice.getNumber() + " bukan milik customer " + customer.getName());
            }

            if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
                throw new AppException(ErrorCode.INVALID_REQUEST, "Faktur " + invoice.getNumber() + " telah dibatalkan");
            }

            if (invoice.getPaymentStatus() == InvoicePaymentStatus.PAID) {
                throw new AppException(ErrorCode.INVOICE_ALREADY_PAID, "Faktur " + invoice.getNumber() + " sudah lunas");
            }

            BigDecimal outstanding = invoice.getOutstanding();
            if (item.getAmount().compareTo(outstanding) > 0) {
                throw new AppException(
                        ErrorCode.INVALID_REQUEST,
                        "Alokasi untuk Faktur " + invoice.getNumber() + " (Rp " + item.getAmount() + ") melebihi sisa tagihan (Rp " + outstanding + ")"
                );
            }

            // Create allocation record
            PaymentAllocation allocation = new PaymentAllocation(
                    savedPayment,
                    invoice,
                    item.getAmount(),
                    item.getNotes(),
                    username
            );
            savedPayment.addAllocation(allocation);

            // Update invoice paidAmount and derived status
            invoice.setPaidAmount(invoice.getPaidAmount().add(item.getAmount()));
            invoice.updatePaymentStatus();
            invoiceRepository.save(invoice);
        }

        // 5. Overpayment / Excess handling -> Customer Deposit
        BigDecimal excess = paymentAmount.subtract(totalAllocated);
        if (excess.compareTo(BigDecimal.ZERO) > 0) {
            depositService.recordDepositIn(
                    customer,
                    excess,
                    "PAYMENT",
                    savedPayment.getId(),
                    "Kelebihan pembayaran dari transaksi " + savedPayment.getNumber(),
                    username
            );
        }

        Payment finalPayment = paymentRepository.save(savedPayment);
        auditLogService.log(
                "CREATE_PAYMENT",
                "PAYMENT",
                finalPayment.getId(),
                null,
                "Pembayaran kas dibuat: " + finalPayment.getNumber() + " nominal Rp" + finalPayment.getAmount() + " (Alokasi: Rp" + totalAllocated + ", Surplus Deposit: Rp" + excess + ")"
        );
        return mapToDTO(finalPayment);
    }

    @Transactional
    public PaymentDTO cancelPayment(Long id, String username) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND, "Pembayaran tidak ditemukan"));

        if (payment.getStatus() == PaymentStatus.CANCELLED) {
            throw new AppException(ErrorCode.CONFLICT, "Pembayaran sudah dibatalkan sebelumnya");
        }

        Customer customer = customerRepository.findByIdForUpdate(payment.getCustomer().getId())
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND, "Customer tidak ditemukan"));

        // If this payment created excess deposit, check if deposit has already been spent
        BigDecimal excess = payment.getExcessAmount();
        if (excess.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal currentDeposit = depositService.getDepositBalance(customer.getId());
            if (currentDeposit.compareTo(excess) < 0) {
                throw new AppException(
                        ErrorCode.CONFLICT,
                        "Tidak dapat membatalkan pembayaran: Kelebihan deposit Rp " + excess + " telah digunakan sebagian/seluruhnya pada transaksi lain."
                );
            }

            depositService.recordDepositRefund(
                    customer,
                    excess,
                    "PAYMENT_CANCEL",
                    payment.getId(),
                    "Pembatalan kelebihan pembayaran " + payment.getNumber(),
                    username
            );
        }

        // Roll back invoice payments
        for (PaymentAllocation allocation : payment.getAllocations()) {
            Invoice invoice = invoiceRepository.findByIdForUpdate(allocation.getInvoice().getId())
                    .orElseThrow(() -> new AppException(ErrorCode.INVOICE_NOT_FOUND, "Faktur tidak ditemukan"));

            BigDecimal newPaid = invoice.getPaidAmount().subtract(allocation.getAmount()).max(BigDecimal.ZERO);
            invoice.setPaidAmount(newPaid);
            invoice.updatePaymentStatus();
            invoiceRepository.save(invoice);
        }

        payment.setStatus(PaymentStatus.CANCELLED);
        payment.setUpdatedBy(username);
        payment.setUpdatedAt(OffsetDateTime.now());

        Payment saved = paymentRepository.save(payment);
        auditLogService.log(
                "CANCEL_PAYMENT",
                "PAYMENT",
                saved.getId(),
                "Status: CONFIRMED, Amount: Rp" + saved.getAmount(),
                "Status: CANCELLED oleh " + username
        );
        return mapToDTO(saved);
    }

    public PaymentDTO mapToDTO(Payment entity) {
        PaymentDTO dto = new PaymentDTO();
        dto.setId(entity.getId());
        dto.setNumber(entity.getNumber());
        dto.setDate(entity.getDate());
        dto.setAmount(entity.getAmount());
        dto.setPaymentMethod(entity.getPaymentMethod());
        dto.setDestinationAccount(entity.getDestinationAccount());
        dto.setReference(entity.getReference());
        dto.setNotes(entity.getNotes());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setUpdatedBy(entity.getUpdatedBy());

        if (entity.getCustomer() != null) {
            dto.setCustomerId(entity.getCustomer().getId());
            dto.setCustomerName(entity.getCustomer().getName());
            dto.setCustomerCode(entity.getCustomer().getCode());
        }

        BigDecimal allocated = entity.getAllocatedAmount();
        dto.setAllocatedAmount(allocated);
        dto.setExcessAmount(entity.getExcessAmount());

        List<PaymentAllocationDTO> allocationDTOs = entity.getAllocations().stream().map(a -> {
            PaymentAllocationDTO aDto = new PaymentAllocationDTO();
            aDto.setId(a.getId());
            aDto.setPaymentId(entity.getId());
            aDto.setPaymentNumber(entity.getNumber());
            aDto.setAllocatedAmount(a.getAmount());
            aDto.setNotes(a.getNotes());
            aDto.setCreatedAt(a.getCreatedAt());
            aDto.setCreatedBy(a.getCreatedBy());

            if (a.getInvoice() != null) {
                aDto.setInvoiceId(a.getInvoice().getId());
                aDto.setInvoiceNumber(a.getInvoice().getNumber());
                aDto.setInvoiceDate(a.getInvoice().getDate());
                aDto.setInvoiceTotalAmount(a.getInvoice().getTotalAmount());
                aDto.setInvoicePaidAmount(a.getInvoice().getPaidAmount());
                aDto.setInvoiceOutstanding(a.getInvoice().getOutstanding());
            }
            return aDto;
        }).collect(Collectors.toList());

        dto.setAllocations(allocationDTOs);
        return dto;
    }
}

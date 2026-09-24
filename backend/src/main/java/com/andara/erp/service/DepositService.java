package com.andara.erp.service;

import com.andara.erp.common.exception.AppException;
import com.andara.erp.common.exception.ErrorCode;
import com.andara.erp.dto.deposit.CustomerDepositSummaryDTO;
import com.andara.erp.dto.deposit.DepositTransactionDTO;
import com.andara.erp.dto.deposit.UseDepositRequest;
import com.andara.erp.entity.*;
import com.andara.erp.repository.CustomerRepository;
import com.andara.erp.repository.DepositTransactionRepository;
import com.andara.erp.repository.InvoiceRepository;
import com.andara.erp.repository.PaymentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class DepositService {

    private final DepositTransactionRepository depositTransactionRepository;
    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final AuditLogService auditLogService;

    public DepositService(
            DepositTransactionRepository depositTransactionRepository,
            CustomerRepository customerRepository,
            InvoiceRepository invoiceRepository,
            PaymentRepository paymentRepository,
            AuditLogService auditLogService
    ) {
        this.depositTransactionRepository = depositTransactionRepository;
        this.customerRepository = customerRepository;
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public BigDecimal getDepositBalance(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND, "Customer dengan ID " + customerId + " tidak ditemukan"));
        BigDecimal ledgerBalance = depositTransactionRepository.calculateCurrentBalanceByCustomerId(customerId);
        return ledgerBalance != null ? ledgerBalance : BigDecimal.ZERO;
    }

    @Transactional(readOnly = true)
    public Page<DepositTransactionDTO> getCustomerDepositHistory(Long customerId, Pageable pageable) {
        if (!customerRepository.existsById(customerId)) {
            throw new AppException(ErrorCode.CUSTOMER_NOT_FOUND, "Customer dengan ID " + customerId + " tidak ditemukan");
        }
        Page<DepositTransaction> transactions = depositTransactionRepository.findByCustomerIdOrderByCreatedAtDesc(customerId, pageable);
        return transactions.map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public List<CustomerDepositSummaryDTO> getAllCustomerDeposits() {
        List<Customer> customers = customerRepository.findAll();
        List<CustomerDepositSummaryDTO> summaries = new ArrayList<>();

        for (Customer c : customers) {
            BigDecimal balance = depositTransactionRepository.calculateCurrentBalanceByCustomerId(c.getId());
            if (balance == null) balance = BigDecimal.ZERO;

            List<DepositTransaction> txs = depositTransactionRepository.findByCustomerIdOrderByCreatedAtDesc(c.getId());
            BigDecimal totalIn = BigDecimal.ZERO;
            BigDecimal totalUsed = BigDecimal.ZERO;

            for (DepositTransaction tx : txs) {
                if (tx.getType() == DepositTransactionType.DEPOSIT_IN || tx.getType() == DepositTransactionType.DEPOSIT_ADJUSTMENT) {
                    totalIn = totalIn.add(tx.getAmount());
                } else if (tx.getType() == DepositTransactionType.DEPOSIT_USED || tx.getType() == DepositTransactionType.DEPOSIT_REFUND) {
                    totalUsed = totalUsed.add(tx.getAmount());
                }
            }

            // Include if customer has balance or previous deposit activity
            if (balance.compareTo(BigDecimal.ZERO) > 0 || !txs.isEmpty()) {
                summaries.add(new CustomerDepositSummaryDTO(
                        c.getId(),
                        c.getCode(),
                        c.getName(),
                        c.getCompanyName(),
                        balance,
                        totalIn,
                        totalUsed,
                        txs.size()
                ));
            }
        }
        return summaries;
    }

    @Transactional
    public DepositTransaction recordDepositIn(Customer customer, BigDecimal amount, String referenceType, Long referenceId, String notes, String username) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        BigDecimal currentBalance = depositTransactionRepository.calculateCurrentBalanceByCustomerId(customer.getId());
        if (currentBalance == null) {
            currentBalance = BigDecimal.ZERO;
        }
        BigDecimal newBalance = currentBalance.add(amount);

        DepositTransaction transaction = new DepositTransaction(
                customer,
                DepositTransactionType.DEPOSIT_IN,
                amount,
                newBalance,
                referenceType,
                referenceId,
                notes,
                username
        );

        customer.setDepositBalance(newBalance);
        customerRepository.save(customer);

        DepositTransaction saved = depositTransactionRepository.save(transaction);
        auditLogService.log(
                "DEPOSIT_IN",
                "DEPOSIT_TRANSACTION",
                saved.getId(),
                null,
                "Penambahan deposit customer " + customer.getName() + " sebesar Rp" + amount + " (Saldo baru: Rp" + newBalance + ")"
        );
        return saved;
    }

    @Transactional
    public DepositTransaction recordDepositRefund(Customer customer, BigDecimal amount, String referenceType, Long referenceId, String notes, String username) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        BigDecimal currentBalance = depositTransactionRepository.calculateCurrentBalanceByCustomerId(customer.getId());
        if (currentBalance == null) {
            currentBalance = BigDecimal.ZERO;
        }
        if (currentBalance.compareTo(amount) < 0) {
            throw new AppException(ErrorCode.DEPOSIT_INSUFFICIENT, "Saldo deposit customer tidak mencukupi untuk penyesuaian");
        }
        BigDecimal newBalance = currentBalance.subtract(amount);

        DepositTransaction transaction = new DepositTransaction(
                customer,
                DepositTransactionType.DEPOSIT_REFUND,
                amount,
                newBalance,
                referenceType,
                referenceId,
                notes,
                username
        );

        customer.setDepositBalance(newBalance);
        customerRepository.save(customer);
        DepositTransaction saved = depositTransactionRepository.save(transaction);
        auditLogService.log(
                "DEPOSIT_REFUND",
                "DEPOSIT_TRANSACTION",
                saved.getId(),
                "Saldo: Rp" + currentBalance,
                "Penarikan/Refund deposit customer " + customer.getName() + " sebesar Rp" + amount + " (Saldo baru: Rp" + newBalance + ")"
        );
        return saved;
    }

    @Transactional
    public DepositTransactionDTO useDeposit(UseDepositRequest request, String username) {
        // Concurrency lock on Customer and Invoice
        Customer customer = customerRepository.findByIdForUpdate(request.getCustomerId())
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND, "Customer tidak ditemukan"));

        Invoice invoice = invoiceRepository.findByIdForUpdate(request.getInvoiceId())
                .orElseThrow(() -> new AppException(ErrorCode.INVOICE_NOT_FOUND, "Invoice tidak ditemukan"));

        // Invariant 1: Invoice must belong to the same customer
        if (!invoice.getCustomer().getId().equals(customer.getId())) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Faktur tidak dimiliki oleh customer yang bersangkutan");
        }

        // Invariant 2: Cannot apply deposit to cancelled or already paid invoice
        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Faktur telah dibatalkan");
        }
        if (invoice.getPaymentStatus() == InvoicePaymentStatus.PAID) {
            throw new AppException(ErrorCode.INVOICE_ALREADY_PAID, "Faktur sudah lunas");
        }

        // Invariant 3: Amount cannot exceed invoice outstanding
        BigDecimal outstanding = invoice.getOutstanding();
        if (request.getAmount().compareTo(outstanding) > 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Nominal deposit (Rp " + request.getAmount() + ") melebihi sisa tagihan faktur (Rp " + outstanding + ")");
        }

        // Invariant 4: Amount cannot exceed current ledger deposit balance
        BigDecimal currentBalance = depositTransactionRepository.calculateCurrentBalanceByCustomerId(customer.getId());
        if (currentBalance == null) {
            currentBalance = BigDecimal.ZERO;
        }
        if (currentBalance.compareTo(request.getAmount()) < 0) {
            throw new AppException(ErrorCode.DEPOSIT_INSUFFICIENT, "Saldo deposit customer tidak mencukupi (Tersedia: Rp " + currentBalance + ", Dibutuhkan: Rp " + request.getAmount() + ")");
        }

        BigDecimal newBalance = currentBalance.subtract(request.getAmount());

        DepositTransaction transaction = new DepositTransaction(
                customer,
                DepositTransactionType.DEPOSIT_USED,
                request.getAmount(),
                newBalance,
                "INVOICE",
                invoice.getId(),
                request.getNotes() != null && !request.getNotes().isBlank()
                        ? request.getNotes()
                        : "Penggunaan deposit untuk pembayaran Faktur " + invoice.getNumber(),
                username
        );

        customer.setDepositBalance(newBalance);
        customerRepository.save(customer);
        DepositTransaction savedTx = depositTransactionRepository.save(transaction);

        // Update invoice paidAmount and derived status
        invoice.setPaidAmount(invoice.getPaidAmount().add(request.getAmount()));
        invoice.updatePaymentStatus();
        invoiceRepository.save(invoice);

        auditLogService.log(
                "DEPOSIT_USED",
                "DEPOSIT_TRANSACTION",
                savedTx.getId(),
                "Saldo: Rp" + currentBalance,
                "Penggunaan deposit Rp" + request.getAmount() + " untuk pelunasan Faktur " + invoice.getNumber() + " (Saldo baru: Rp" + newBalance + ")"
        );

        return mapToDTO(savedTx);
    }

    private DepositTransactionDTO mapToDTO(DepositTransaction entity) {
        DepositTransactionDTO dto = new DepositTransactionDTO();
        dto.setId(entity.getId());
        dto.setCustomerId(entity.getCustomer().getId());
        dto.setCustomerName(entity.getCustomer().getName());
        dto.setCustomerCode(entity.getCustomer().getCode());
        dto.setType(entity.getType());
        dto.setAmount(entity.getAmount());
        dto.setBalanceAfter(entity.getBalanceAfter());
        dto.setReferenceType(entity.getReferenceType());
        dto.setReferenceId(entity.getReferenceId());
        dto.setNotes(entity.getNotes());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setCreatedBy(entity.getCreatedBy());

        // Resolve reference numbers for friendly display
        if ("PAYMENT".equalsIgnoreCase(entity.getReferenceType()) && entity.getReferenceId() != null) {
            paymentRepository.findById(entity.getReferenceId()).ifPresent(p -> dto.setReferenceNumber(p.getNumber()));
        } else if ("INVOICE".equalsIgnoreCase(entity.getReferenceType()) && entity.getReferenceId() != null) {
            invoiceRepository.findById(entity.getReferenceId()).ifPresent(inv -> dto.setReferenceNumber(inv.getNumber()));
        }

        return dto;
    }
}

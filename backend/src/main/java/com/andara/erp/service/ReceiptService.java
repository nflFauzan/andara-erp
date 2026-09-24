package com.andara.erp.service;

import com.andara.erp.common.exception.AppException;
import com.andara.erp.common.exception.ErrorCode;
import com.andara.erp.dto.receipt.CreateReceiptRequest;
import com.andara.erp.dto.receipt.ReceiptAllocationSummaryDTO;
import com.andara.erp.dto.receipt.ReceiptDTO;
import com.andara.erp.entity.*;
import com.andara.erp.repository.PaymentRepository;
import com.andara.erp.repository.ReceiptRepository;
import com.andara.erp.util.TerbilangUtil;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReceiptService {

    private final ReceiptRepository receiptRepository;
    private final PaymentRepository paymentRepository;
    private final NumberingService numberingService;

    public ReceiptService(
            ReceiptRepository receiptRepository,
            PaymentRepository paymentRepository,
            NumberingService numberingService
    ) {
        this.receiptRepository = receiptRepository;
        this.paymentRepository = paymentRepository;
        this.numberingService = numberingService;
    }

    @Transactional(readOnly = true)
    public Page<ReceiptDTO> getReceiptList(
            String search,
            Long customerId,
            ReceiptStatus status,
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable
    ) {
        String searchPattern = (search != null && !search.trim().isEmpty())
                ? "%" + search.trim().toLowerCase() + "%"
                : null;

        Page<Receipt> page = receiptRepository.findWithFilters(
                searchPattern,
                customerId,
                status,
                startDate,
                endDate,
                pageable
        );

        return page.map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public ReceiptDTO getReceiptById(Long id) {
        Receipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Kwitansi dengan ID " + id + " tidak ditemukan"));
        return mapToDTO(receipt);
    }

    @Transactional(readOnly = true)
    public ReceiptDTO getReceiptByPaymentId(Long paymentId) {
        Receipt receipt = receiptRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Kwitansi untuk pembayaran ID " + paymentId + " belum diterbitkan"));
        return mapToDTO(receipt);
    }

    @Transactional
    public ReceiptDTO generateReceipt(CreateReceiptRequest request, String username) {
        Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND, "Pembayaran dengan ID " + request.getPaymentId() + " tidak ditemukan"));

        // Invariant: Cannot generate receipt for cancelled payment
        if (payment.getStatus() == PaymentStatus.CANCELLED) {
            throw new AppException(ErrorCode.CONFLICT, "Tidak dapat menerbitkan kwitansi untuk transaksi pembayaran yang telah dibatalkan");
        }

        // Invariant: 1 payment -> max 1 receipt (1:1 constraint)
        if (receiptRepository.existsByPaymentId(payment.getId())) {
            throw new AppException(
                    ErrorCode.CONFLICT,
                    "Kwitansi untuk pembayaran " + payment.getNumber() + " sudah pernah diterbitkan sebelumnya"
            );
        }

        LocalDate receiptDate = request.getReceiptDate() != null ? request.getReceiptDate() : payment.getDate();

        // Auto-generate official receipt number
        String receiptNumber = numberingService.generateNextNumber(DocumentType.KWITANSI, receiptDate);

        // Derive receivedFrom default
        String receivedFrom = request.getReceivedFrom();
        if (receivedFrom == null || receivedFrom.trim().isEmpty()) {
            Customer c = payment.getCustomer();
            if (c.getCompanyName() != null && !c.getCompanyName().isBlank()) {
                receivedFrom = c.getName() + " (" + c.getCompanyName() + ")";
            } else {
                receivedFrom = c.getName();
            }
        } else {
            receivedFrom = receivedFrom.trim();
        }

        // Derive description default
        String description = request.getDescription();
        if (description == null || description.trim().isEmpty()) {
            if (payment.getNotes() != null && !payment.getNotes().isBlank()) {
                description = payment.getNotes();
            } else {
                StringBuilder sb = new StringBuilder("Pembayaran transaksi " + payment.getNumber());
                if (!payment.getAllocations().isEmpty()) {
                    sb.append(" (Pelunasan Faktur: ");
                    String invList = payment.getAllocations().stream()
                            .map(a -> a.getInvoice().getNumber())
                            .distinct()
                            .collect(Collectors.joining(", "));
                    sb.append(invList).append(")");
                }
                description = sb.toString();
            }
        } else {
            description = description.trim();
        }

        // Authoritative Indonesian spelled out (Terbilang)
        String spelledOut = TerbilangUtil.toTerbilang(payment.getAmount());

        Receipt receipt = new Receipt(
                receiptNumber,
                payment,
                receiptDate,
                receivedFrom,
                payment.getAmount(),
                spelledOut,
                description,
                payment.getPaymentMethod().name(),
                request.getNotes() != null ? request.getNotes().trim() : null,
                username
        );

        Receipt saved = receiptRepository.save(receipt);
        return mapToDTO(saved);
    }

    @Transactional
    public ReceiptDTO cancelReceipt(Long id, String username) {
        Receipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Kwitansi tidak ditemukan"));

        if (receipt.getStatus() == ReceiptStatus.CANCELLED) {
            throw new AppException(ErrorCode.CONFLICT, "Kwitansi sudah dibatalkan sebelumnya");
        }

        receipt.setStatus(ReceiptStatus.CANCELLED);
        Receipt saved = receiptRepository.save(receipt);
        return mapToDTO(saved);
    }

    public ReceiptDTO mapToDTO(Receipt entity) {
        ReceiptDTO dto = new ReceiptDTO();
        dto.setId(entity.getId());
        dto.setNumber(entity.getNumber());
        dto.setDate(entity.getDate());
        dto.setReceivedFrom(entity.getReceivedFrom());
        dto.setAmount(entity.getAmount());
        dto.setSpelledOut(entity.getSpelledOut());
        dto.setDescription(entity.getDescription());
        dto.setPaymentMethod(entity.getPaymentMethod());
        dto.setNotes(entity.getNotes());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setCreatedBy(entity.getCreatedBy());

        if (entity.getPayment() != null) {
            Payment p = entity.getPayment();
            dto.setPaymentId(p.getId());
            dto.setPaymentNumber(p.getNumber());
            dto.setPaymentReference(p.getReference());
            dto.setPaymentDestinationAccount(p.getDestinationAccount());

            if (p.getCustomer() != null) {
                Customer c = p.getCustomer();
                dto.setCustomerId(c.getId());
                dto.setCustomerName(c.getName());
                dto.setCustomerCode(c.getCode());
                dto.setCustomerCompanyName(c.getCompanyName());
                dto.setCustomerAddress(c.getAddress());
                dto.setCustomerPhone(c.getPhone());
            }

            if (p.getAllocations() != null) {
                List<ReceiptAllocationSummaryDTO> allocList = p.getAllocations().stream().map(a -> {
                    ReceiptAllocationSummaryDTO aDto = new ReceiptAllocationSummaryDTO();
                    if (a.getInvoice() != null) {
                        aDto.setInvoiceId(a.getInvoice().getId());
                        aDto.setInvoiceNumber(a.getInvoice().getNumber());
                        aDto.setInvoiceDate(a.getInvoice().getDate());
                    }
                    aDto.setAllocatedAmount(a.getAmount());
                    aDto.setNotes(a.getNotes());
                    return aDto;
                }).collect(Collectors.toList());
                dto.setAllocations(allocList);
            }
        }

        return dto;
    }
}

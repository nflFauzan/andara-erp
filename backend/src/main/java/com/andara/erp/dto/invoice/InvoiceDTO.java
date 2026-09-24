package com.andara.erp.dto.invoice;

import com.andara.erp.entity.Invoice;
import com.andara.erp.entity.InvoicePaymentStatus;
import com.andara.erp.entity.InvoiceStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class InvoiceDTO {

    private Long id;
    private String number;
    private Long customerId;
    private String customerCode;
    private String customerName;
    private String customerAddress;
    private String customerPhone;
    private Long sourcePenawaranId;
    private String sourcePenawaranNumber;
    private LocalDate date;
    private LocalDate dueDate;
    private InvoiceStatus status;
    private String statusLabel;
    private InvoicePaymentStatus paymentStatus;
    private String paymentStatusLabel;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal outstanding;
    private String notes;
    private String terms;
    private Integer itemCount;
    private List<InvoiceDetailDTO> details = new ArrayList<>();
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private String createdBy;
    private String updatedBy;

    public InvoiceDTO() {
    }

    public static InvoiceDTO fromEntity(Invoice entity) {
        return fromEntity(entity, true);
    }

    public static InvoiceDTO fromEntity(Invoice entity, boolean includeDetails) {
        InvoiceDTO dto = new InvoiceDTO();
        dto.setId(entity.getId());
        dto.setNumber(entity.getNumber());
        if (entity.getCustomer() != null) {
            dto.setCustomerId(entity.getCustomer().getId());
            dto.setCustomerCode(entity.getCustomer().getCode());
            dto.setCustomerName(entity.getCustomer().getName());
            dto.setCustomerAddress(entity.getCustomer().getAddress());
            dto.setCustomerPhone(entity.getCustomer().getPhone());
        }
        if (entity.getSourcePenawaran() != null) {
            dto.setSourcePenawaranId(entity.getSourcePenawaran().getId());
            dto.setSourcePenawaranNumber(entity.getSourcePenawaran().getNumber());
        }
        dto.setDate(entity.getDate());
        dto.setDueDate(entity.getDueDate());
        dto.setStatus(entity.getStatus());
        dto.setStatusLabel(entity.getStatus() != null ? entity.getStatus().getLabel() : "");
        dto.setPaymentStatus(entity.getPaymentStatus());
        dto.setPaymentStatusLabel(entity.getPaymentStatus() != null ? entity.getPaymentStatus().getLabel() : "");
        dto.setTotalAmount(entity.getTotalAmount());
        dto.setPaidAmount(entity.getPaidAmount());
        dto.setOutstanding(entity.getOutstanding());
        dto.setNotes(entity.getNotes());
        dto.setTerms(entity.getTerms());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setUpdatedBy(entity.getUpdatedBy());

        if (entity.getDetails() != null) {
            dto.setItemCount(entity.getDetails().size());
            if (includeDetails) {
                dto.setDetails(entity.getDetails().stream()
                        .map(InvoiceDetailDTO::fromEntity)
                        .collect(Collectors.toList()));
            }
        } else {
            dto.setItemCount(0);
        }

        return dto;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumber() {
        return number;
    }

    public void setNumber(String number) {
        this.number = number;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerCode() {
        return customerCode;
    }

    public void setCustomerCode(String customerCode) {
        this.customerCode = customerCode;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerAddress() {
        return customerAddress;
    }

    public void setCustomerAddress(String customerAddress) {
        this.customerAddress = customerAddress;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public Long getSourcePenawaranId() {
        return sourcePenawaranId;
    }

    public void setSourcePenawaranId(Long sourcePenawaranId) {
        this.sourcePenawaranId = sourcePenawaranId;
    }

    public String getSourcePenawaranNumber() {
        return sourcePenawaranNumber;
    }

    public void setSourcePenawaranNumber(String sourcePenawaranNumber) {
        this.sourcePenawaranNumber = sourcePenawaranNumber;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public InvoiceStatus getStatus() {
        return status;
    }

    public void setStatus(InvoiceStatus status) {
        this.status = status;
    }

    public String getStatusLabel() {
        return statusLabel;
    }

    public void setStatusLabel(String statusLabel) {
        this.statusLabel = statusLabel;
    }

    public InvoicePaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(InvoicePaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getPaymentStatusLabel() {
        return paymentStatusLabel;
    }

    public void setPaymentStatusLabel(String paymentStatusLabel) {
        this.paymentStatusLabel = paymentStatusLabel;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
    }

    public BigDecimal getOutstanding() {
        return outstanding;
    }

    public void setOutstanding(BigDecimal outstanding) {
        this.outstanding = outstanding;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getTerms() {
        return terms;
    }

    public void setTerms(String terms) {
        this.terms = terms;
    }

    public Integer getItemCount() {
        return itemCount;
    }

    public void setItemCount(Integer itemCount) {
        this.itemCount = itemCount;
    }

    public List<InvoiceDetailDTO> getDetails() {
        return details;
    }

    public void setDetails(List<InvoiceDetailDTO> details) {
        this.details = details;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }
}

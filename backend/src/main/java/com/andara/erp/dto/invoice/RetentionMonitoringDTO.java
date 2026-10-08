package com.andara.erp.dto.invoice;

import com.andara.erp.entity.InvoicePaymentStatus;
import com.andara.erp.entity.InvoiceStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class RetentionMonitoringDTO {

    private Long invoiceId;
    private String invoiceNumber;
    private Long customerId;
    private String customerCode;
    private String customerName;
    private Long sourcePenawaranId;
    private String sourcePenawaranNumber;
    private Long parentSettlementInvoiceId;
    private String parentSettlementInvoiceNumber;
    private BigDecimal retentionPercentage;
    private BigDecimal retentionAmount;
    private LocalDate retentionDueDate;
    private Long daysRemaining;
    private boolean overdue;
    private boolean readyToBill;
    private InvoiceStatus status;
    private String statusLabel;
    private InvoicePaymentStatus paymentStatus;
    private String paymentStatusLabel;

    public RetentionMonitoringDTO() {
    }

    public static RetentionMonitoringDTO fromEntity(com.andara.erp.entity.Invoice entity) {
        RetentionMonitoringDTO dto = new RetentionMonitoringDTO();
        dto.setInvoiceId(entity.getId());
        dto.setInvoiceNumber(entity.getNumber());

        if (entity.getCustomer() != null) {
            dto.setCustomerId(entity.getCustomer().getId());
            dto.setCustomerCode(entity.getCustomer().getCode());
            dto.setCustomerName(entity.getCustomer().getName());
        }

        if (entity.getSourcePenawaran() != null) {
            dto.setSourcePenawaranId(entity.getSourcePenawaran().getId());
            dto.setSourcePenawaranNumber(entity.getSourcePenawaran().getNumber());
        }

        if (entity.getParentSettlementInvoice() != null) {
            dto.setParentSettlementInvoiceId(entity.getParentSettlementInvoice().getId());
            dto.setParentSettlementInvoiceNumber(entity.getParentSettlementInvoice().getNumber());
        }

        dto.setRetentionPercentage(entity.getRetentionPercentage());
        dto.setRetentionAmount(entity.getRetentionAmount() != null && entity.getRetentionAmount().compareTo(BigDecimal.ZERO) > 0
                ? entity.getRetentionAmount() : entity.getTotalAmount());
        dto.setRetentionDueDate(entity.getRetentionDueDate());

        LocalDate today = LocalDate.now();
        if (entity.getRetentionDueDate() != null) {
            long days = ChronoUnit.DAYS.between(today, entity.getRetentionDueDate());
            dto.setDaysRemaining(days);
            dto.setOverdue(days < 0);
            dto.setReadyToBill(days <= 0 || days <= 14);
        } else {
            dto.setDaysRemaining(0L);
            dto.setOverdue(false);
            dto.setReadyToBill(true);
        }

        dto.setStatus(entity.getStatus());
        dto.setStatusLabel(entity.getStatus() != null ? entity.getStatus().getLabel() : "");
        dto.setPaymentStatus(entity.getPaymentStatus());
        dto.setPaymentStatusLabel(entity.getPaymentStatus() != null ? entity.getPaymentStatus().getLabel() : "");

        return dto;
    }

    public Long getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(Long invoiceId) {
        this.invoiceId = invoiceId;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
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

    public Long getParentSettlementInvoiceId() {
        return parentSettlementInvoiceId;
    }

    public void setParentSettlementInvoiceId(Long parentSettlementInvoiceId) {
        this.parentSettlementInvoiceId = parentSettlementInvoiceId;
    }

    public String getParentSettlementInvoiceNumber() {
        return parentSettlementInvoiceNumber;
    }

    public void setParentSettlementInvoiceNumber(String parentSettlementInvoiceNumber) {
        this.parentSettlementInvoiceNumber = parentSettlementInvoiceNumber;
    }

    public BigDecimal getRetentionPercentage() {
        return retentionPercentage;
    }

    public void setRetentionPercentage(BigDecimal retentionPercentage) {
        this.retentionPercentage = retentionPercentage;
    }

    public BigDecimal getRetentionAmount() {
        return retentionAmount;
    }

    public void setRetentionAmount(BigDecimal retentionAmount) {
        this.retentionAmount = retentionAmount;
    }

    public LocalDate getRetentionDueDate() {
        return retentionDueDate;
    }

    public void setRetentionDueDate(LocalDate retentionDueDate) {
        this.retentionDueDate = retentionDueDate;
    }

    public Long getDaysRemaining() {
        return daysRemaining;
    }

    public void setDaysRemaining(Long daysRemaining) {
        this.daysRemaining = daysRemaining;
    }

    public boolean isOverdue() {
        return overdue;
    }

    public void setOverdue(boolean overdue) {
        this.overdue = overdue;
    }

    public boolean isReadyToBill() {
        return readyToBill;
    }

    public void setReadyToBill(boolean readyToBill) {
        this.readyToBill = readyToBill;
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
}

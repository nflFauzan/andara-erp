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
    private String clientPoNumber;
    private String clientSpkNumber;
    private String bastNumber;
    private com.andara.erp.entity.BillingMode billingMode;
    private String billingModeLabel;
    private BigDecimal terminPercentage;
    private String terminName;
    private Long previousDpInvoiceId;
    private String previousDpInvoiceNumber;
    private InvoiceStatus status;
    private String statusLabel;
    private InvoicePaymentStatus paymentStatus;
    private String paymentStatusLabel;
    private BigDecimal subtotalDpp;
    private com.andara.erp.entity.TaxPpnType taxPpnType;
    private String taxPpnTypeLabel;
    private BigDecimal taxPpnRate;
    private BigDecimal taxPpnAmount;
    private com.andara.erp.entity.TaxPphType taxPphType;
    private String taxPphTypeLabel;
    private BigDecimal taxPphRate;
    private BigDecimal taxPphAmount;
    private BigDecimal totalAmount;
    private BigDecimal netTotalAmount;
    private BigDecimal paidAmount;
    private BigDecimal outstanding;
    private String notes;
    private String terms;
    private String workLocation;
    private Integer itemCount;
    private List<InvoiceDetailDTO> details = new ArrayList<>();
    private List<InvoicePaymentItemDTO> payments = new ArrayList<>();
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
        dto.setClientPoNumber(entity.getClientPoNumber());
        dto.setClientSpkNumber(entity.getClientSpkNumber());
        dto.setBastNumber(entity.getBastNumber());
        dto.setBillingMode(entity.getBillingMode());
        dto.setBillingModeLabel(entity.getBillingMode() != null ? entity.getBillingMode().getLabel() : null);
        dto.setTerminPercentage(entity.getTerminPercentage());
        dto.setTerminName(entity.getTerminName());
        if (entity.getPreviousDpInvoice() != null) {
            dto.setPreviousDpInvoiceId(entity.getPreviousDpInvoice().getId());
            dto.setPreviousDpInvoiceNumber(entity.getPreviousDpInvoice().getNumber());
        }
        dto.setDate(entity.getDate());
        dto.setDueDate(entity.getDueDate());
        dto.setStatus(entity.getStatus());
        dto.setStatusLabel(entity.getStatus() != null ? entity.getStatus().getLabel() : "");
        dto.setPaymentStatus(entity.getPaymentStatus());
        dto.setPaymentStatusLabel(entity.getPaymentStatus() != null ? entity.getPaymentStatus().getLabel() : "");

        dto.setSubtotalDpp(entity.getSubtotalDpp());
        dto.setTaxPpnType(entity.getTaxPpnType());
        dto.setTaxPpnTypeLabel(entity.getTaxPpnType() != null ? entity.getTaxPpnType().getLabel() : "");
        dto.setTaxPpnRate(entity.getTaxPpnRate());
        dto.setTaxPpnAmount(entity.getTaxPpnAmount());

        dto.setTaxPphType(entity.getTaxPphType());
        dto.setTaxPphTypeLabel(entity.getTaxPphType() != null ? entity.getTaxPphType().getLabel() : "");
        dto.setTaxPphRate(entity.getTaxPphRate());
        dto.setTaxPphAmount(entity.getTaxPphAmount());

        dto.setTotalAmount(entity.getTotalAmount());
        dto.setNetTotalAmount(entity.getNetTotalAmount());
        dto.setPaidAmount(entity.getPaidAmount());
        dto.setOutstanding(entity.getOutstanding());
        dto.setNotes(entity.getNotes());
        dto.setTerms(entity.getTerms());
        dto.setWorkLocation(entity.getWorkLocation());
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

    public String getWorkLocation() {
        return workLocation;
    }

    public void setWorkLocation(String workLocation) {
        this.workLocation = workLocation;
    }

    public List<InvoicePaymentItemDTO> getPayments() {
        return payments;
    }

    public void setPayments(List<InvoicePaymentItemDTO> payments) {
        this.payments = payments;
    }

    public String getClientPoNumber() {
        return clientPoNumber;
    }

    public void setClientPoNumber(String clientPoNumber) {
        this.clientPoNumber = clientPoNumber;
    }

    public String getClientSpkNumber() {
        return clientSpkNumber;
    }

    public void setClientSpkNumber(String clientSpkNumber) {
        this.clientSpkNumber = clientSpkNumber;
    }

    public String getBastNumber() {
        return bastNumber;
    }

    public void setBastNumber(String bastNumber) {
        this.bastNumber = bastNumber;
    }

    public BigDecimal getSubtotalDpp() {
        return subtotalDpp;
    }

    public void setSubtotalDpp(BigDecimal subtotalDpp) {
        this.subtotalDpp = subtotalDpp;
    }

    public com.andara.erp.entity.TaxPpnType getTaxPpnType() {
        return taxPpnType;
    }

    public void setTaxPpnType(com.andara.erp.entity.TaxPpnType taxPpnType) {
        this.taxPpnType = taxPpnType;
    }

    public String getTaxPpnTypeLabel() {
        return taxPpnTypeLabel;
    }

    public void setTaxPpnTypeLabel(String taxPpnTypeLabel) {
        this.taxPpnTypeLabel = taxPpnTypeLabel;
    }

    public BigDecimal getTaxPpnRate() {
        return taxPpnRate;
    }

    public void setTaxPpnRate(BigDecimal taxPpnRate) {
        this.taxPpnRate = taxPpnRate;
    }

    public BigDecimal getTaxPpnAmount() {
        return taxPpnAmount;
    }

    public void setTaxPpnAmount(BigDecimal taxPpnAmount) {
        this.taxPpnAmount = taxPpnAmount;
    }

    public com.andara.erp.entity.TaxPphType getTaxPphType() {
        return taxPphType;
    }

    public void setTaxPphType(com.andara.erp.entity.TaxPphType taxPphType) {
        this.taxPphType = taxPphType;
    }

    public String getTaxPphTypeLabel() {
        return taxPphTypeLabel;
    }

    public void setTaxPphTypeLabel(String taxPphTypeLabel) {
        this.taxPphTypeLabel = taxPphTypeLabel;
    }

    public BigDecimal getTaxPphRate() {
        return taxPphRate;
    }

    public void setTaxPphRate(BigDecimal taxPphRate) {
        this.taxPphRate = taxPphRate;
    }

    public BigDecimal getTaxPphAmount() {
        return taxPphAmount;
    }

    public void setTaxPphAmount(BigDecimal taxPphAmount) {
        this.taxPphAmount = taxPphAmount;
    }

    public BigDecimal getNetTotalAmount() {
        return netTotalAmount;
    }

    public void setNetTotalAmount(BigDecimal netTotalAmount) {
        this.netTotalAmount = netTotalAmount;
    }

    public com.andara.erp.entity.BillingMode getBillingMode() {
        return billingMode;
    }

    public void setBillingMode(com.andara.erp.entity.BillingMode billingMode) {
        this.billingMode = billingMode;
    }

    public String getBillingModeLabel() {
        return billingModeLabel;
    }

    public void setBillingModeLabel(String billingModeLabel) {
        this.billingModeLabel = billingModeLabel;
    }

    public BigDecimal getTerminPercentage() {
        return terminPercentage;
    }

    public void setTerminPercentage(BigDecimal terminPercentage) {
        this.terminPercentage = terminPercentage;
    }

    public String getTerminName() {
        return terminName;
    }

    public void setTerminName(String terminName) {
        this.terminName = terminName;
    }

    public Long getPreviousDpInvoiceId() {
        return previousDpInvoiceId;
    }

    public void setPreviousDpInvoiceId(Long previousDpInvoiceId) {
        this.previousDpInvoiceId = previousDpInvoiceId;
    }

    public String getPreviousDpInvoiceNumber() {
        return previousDpInvoiceNumber;
    }

    public void setPreviousDpInvoiceNumber(String previousDpInvoiceNumber) {
        this.previousDpInvoiceNumber = previousDpInvoiceNumber;
    }
}


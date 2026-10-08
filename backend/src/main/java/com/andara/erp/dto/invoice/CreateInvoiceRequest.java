package com.andara.erp.dto.invoice;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class CreateInvoiceRequest {

    @NotNull(message = "Customer wajib dipilih")
    private Long customerId;

    private Long sourcePenawaranId;

    @NotNull(message = "Tanggal faktur wajib diisi")
    private LocalDate date;

    private LocalDate dueDate;

    private String clientPoNumber;

    private String clientSpkNumber;

    private String bastNumber;

    private com.andara.erp.entity.TaxPpnType taxPpnType;

    private java.math.BigDecimal taxPpnRate;

    private com.andara.erp.entity.TaxPphType taxPphType;

    private java.math.BigDecimal taxPphRate;

    private String notes;

    private String terms;

    private String workLocation;

    private com.andara.erp.entity.BillingMode billingMode = com.andara.erp.entity.BillingMode.ITEM_VOLUME;

    private java.math.BigDecimal terminPercentage;

    private String terminName;

    private Long previousDpInvoiceId;

    private Boolean applyRetention = false;
    private java.math.BigDecimal retentionPercentage;
    private Integer retentionMonths = 3;
    private LocalDate retentionDueDate;
    private Boolean isRetentionInvoice = false;
    private Long parentSettlementInvoiceId;
    private List<Long> sourcePenawaranIds = new ArrayList<>();

    @Valid
    private List<CreateInvoiceDetailRequest> details = new ArrayList<>();

    public CreateInvoiceRequest() {
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Long getSourcePenawaranId() {
        return sourcePenawaranId;
    }

    public void setSourcePenawaranId(Long sourcePenawaranId) {
        this.sourcePenawaranId = sourcePenawaranId;
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

    public String getWorkLocation() {
        return workLocation;
    }

    public void setWorkLocation(String workLocation) {
        this.workLocation = workLocation;
    }

    public List<CreateInvoiceDetailRequest> getDetails() {
        return details;
    }

    public void setDetails(List<CreateInvoiceDetailRequest> details) {
        this.details = details;
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

    public com.andara.erp.entity.TaxPpnType getTaxPpnType() {
        return taxPpnType;
    }

    public void setTaxPpnType(com.andara.erp.entity.TaxPpnType taxPpnType) {
        this.taxPpnType = taxPpnType;
    }

    public java.math.BigDecimal getTaxPpnRate() {
        return taxPpnRate;
    }

    public void setTaxPpnRate(java.math.BigDecimal taxPpnRate) {
        this.taxPpnRate = taxPpnRate;
    }

    public com.andara.erp.entity.TaxPphType getTaxPphType() {
        return taxPphType;
    }

    public void setTaxPphType(com.andara.erp.entity.TaxPphType taxPphType) {
        this.taxPphType = taxPphType;
    }

    public java.math.BigDecimal getTaxPphRate() {
        return taxPphRate;
    }

    public void setTaxPphRate(java.math.BigDecimal taxPphRate) {
        this.taxPphRate = taxPphRate;
    }

    public com.andara.erp.entity.BillingMode getBillingMode() {
        return billingMode;
    }

    public void setBillingMode(com.andara.erp.entity.BillingMode billingMode) {
        this.billingMode = billingMode != null ? billingMode : com.andara.erp.entity.BillingMode.ITEM_VOLUME;
    }

    public java.math.BigDecimal getTerminPercentage() {
        return terminPercentage;
    }

    public void setTerminPercentage(java.math.BigDecimal terminPercentage) {
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

    public Boolean getApplyRetention() {
        return applyRetention != null && applyRetention;
    }

    public void setApplyRetention(Boolean applyRetention) {
        this.applyRetention = applyRetention != null ? applyRetention : false;
    }

    public java.math.BigDecimal getRetentionPercentage() {
        return retentionPercentage;
    }

    public void setRetentionPercentage(java.math.BigDecimal retentionPercentage) {
        this.retentionPercentage = retentionPercentage;
    }

    public Integer getRetentionMonths() {
        return retentionMonths != null ? retentionMonths : 3;
    }

    public void setRetentionMonths(Integer retentionMonths) {
        this.retentionMonths = retentionMonths;
    }

    public LocalDate getRetentionDueDate() {
        return retentionDueDate;
    }

    public void setRetentionDueDate(LocalDate retentionDueDate) {
        this.retentionDueDate = retentionDueDate;
    }

    public Boolean getIsRetentionInvoice() {
        return isRetentionInvoice != null && isRetentionInvoice;
    }

    public void setIsRetentionInvoice(Boolean isRetentionInvoice) {
        this.isRetentionInvoice = isRetentionInvoice != null ? isRetentionInvoice : false;
    }

    public Long getParentSettlementInvoiceId() {
        return parentSettlementInvoiceId;
    }

    public void setParentSettlementInvoiceId(Long parentSettlementInvoiceId) {
        this.parentSettlementInvoiceId = parentSettlementInvoiceId;
    }

    public List<Long> getSourcePenawaranIds() {
        return sourcePenawaranIds;
    }

    public void setSourcePenawaranIds(List<Long> sourcePenawaranIds) {
        this.sourcePenawaranIds = sourcePenawaranIds != null ? sourcePenawaranIds : new ArrayList<>();
    }
}

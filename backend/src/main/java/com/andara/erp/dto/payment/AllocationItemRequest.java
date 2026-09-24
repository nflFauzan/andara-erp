package com.andara.erp.dto.payment;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class AllocationItemRequest {

    @NotNull(message = "Invoice wajib dipilih untuk alokasi")
    private Long invoiceId;

    @NotNull(message = "Nominal alokasi wajib diisi")
    @DecimalMin(value = "0.01", message = "Nominal alokasi minimal 0.01")
    private BigDecimal amount;

    private String notes;

    public AllocationItemRequest() {
    }

    public AllocationItemRequest(Long invoiceId, BigDecimal amount) {
        this.invoiceId = invoiceId;
        this.amount = amount;
    }

    public AllocationItemRequest(Long invoiceId, BigDecimal amount, String notes) {
        this.invoiceId = invoiceId;
        this.amount = amount;
        this.notes = notes;
    }

    public Long getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(Long invoiceId) {
        this.invoiceId = invoiceId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

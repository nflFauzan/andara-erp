package com.andara.erp.dto.deposit;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class UseDepositRequest {

    @NotNull(message = "Customer wajib dipilih")
    private Long customerId;

    @NotNull(message = "Invoice wajib dipilih")
    private Long invoiceId;

    @NotNull(message = "Nominal deposit yang digunakan wajib diisi")
    @DecimalMin(value = "0.01", message = "Nominal minimal 0.01")
    private BigDecimal amount;

    private String notes;

    public UseDepositRequest() {
    }

    public UseDepositRequest(Long customerId, Long invoiceId, BigDecimal amount, String notes) {
        this.customerId = customerId;
        this.invoiceId = invoiceId;
        this.amount = amount;
        this.notes = notes;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
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

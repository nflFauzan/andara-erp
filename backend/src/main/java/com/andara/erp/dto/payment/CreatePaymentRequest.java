package com.andara.erp.dto.payment;

import com.andara.erp.entity.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class CreatePaymentRequest {

    @NotNull(message = "Customer wajib dipilih")
    private Long customerId;

    @NotNull(message = "Tanggal pembayaran wajib diisi")
    private LocalDate paymentDate;

    @NotNull(message = "Nominal pembayaran wajib diisi")
    @DecimalMin(value = "0.01", message = "Nominal pembayaran minimal 0.01")
    private BigDecimal amount;

    @NotNull(message = "Metode pembayaran wajib dipilih")
    private PaymentMethod paymentMethod;

    private String destinationAccount;

    private String reference;

    private String notes;

    @Valid
    private List<AllocationItemRequest> allocations = new ArrayList<>();

    public CreatePaymentRequest() {
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getDestinationAccount() {
        return destinationAccount;
    }

    public void setDestinationAccount(String destinationAccount) {
        this.destinationAccount = destinationAccount;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<AllocationItemRequest> getAllocations() {
        return allocations;
    }

    public void setAllocations(List<AllocationItemRequest> allocations) {
        this.allocations = allocations;
    }
}

package com.andara.erp.dto.receipt;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class CreateReceiptRequest {

    @NotNull(message = "ID Pembayaran wajib diisi")
    private Long paymentId;

    private LocalDate receiptDate;

    private String receivedFrom;

    private String description;

    private String notes;

    public CreateReceiptRequest() {
    }

    public CreateReceiptRequest(Long paymentId) {
        this.paymentId = paymentId;
    }

    public CreateReceiptRequest(Long paymentId, LocalDate receiptDate, String receivedFrom, String description, String notes) {
        this.paymentId = paymentId;
        this.receiptDate = receiptDate;
        this.receivedFrom = receivedFrom;
        this.description = description;
        this.notes = notes;
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public LocalDate getReceiptDate() {
        return receiptDate;
    }

    public void setReceiptDate(LocalDate receiptDate) {
        this.receiptDate = receiptDate;
    }

    public String getReceivedFrom() {
        return receivedFrom;
    }

    public void setReceivedFrom(String receivedFrom) {
        this.receivedFrom = receivedFrom;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

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

    private String notes;

    private String terms;

    @NotEmpty(message = "Item faktur minimal harus ada 1")
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

    public List<CreateInvoiceDetailRequest> getDetails() {
        return details;
    }

    public void setDetails(List<CreateInvoiceDetailRequest> details) {
        this.details = details;
    }
}

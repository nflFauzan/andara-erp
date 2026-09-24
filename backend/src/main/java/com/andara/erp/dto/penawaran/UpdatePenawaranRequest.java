package com.andara.erp.dto.penawaran;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class UpdatePenawaranRequest {

    @NotNull(message = "Customer wajib dipilih")
    private Long customerId;

    private LocalDate date;

    private String notes;

    private String terms;

    @NotEmpty(message = "Penawaran harus memiliki minimal 1 item detail")
    @Valid
    private List<CreatePenawaranDetailRequest> items = new ArrayList<>();

    public UpdatePenawaranRequest() {
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
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

    public List<CreatePenawaranDetailRequest> getItems() {
        return items;
    }

    public void setItems(List<CreatePenawaranDetailRequest> items) {
        this.items = items;
    }
}

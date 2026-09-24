package com.andara.erp.dto.penawaran;

import com.andara.erp.entity.PenawaranStatus;
import jakarta.validation.constraints.NotNull;

public class UpdatePenawaranStatusRequest {

    @NotNull(message = "Status penawaran wajib ditentukan")
    private PenawaranStatus status;

    private String notes;

    public UpdatePenawaranStatusRequest() {
    }

    public UpdatePenawaranStatusRequest(PenawaranStatus status) {
        this.status = status;
    }

    public PenawaranStatus getStatus() {
        return status;
    }

    public void setStatus(PenawaranStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

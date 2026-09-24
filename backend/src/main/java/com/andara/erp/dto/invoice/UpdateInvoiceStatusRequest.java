package com.andara.erp.dto.invoice;

import com.andara.erp.entity.InvoiceStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateInvoiceStatusRequest {

    @NotNull(message = "Status faktur wajib diisi")
    private InvoiceStatus status;

    public UpdateInvoiceStatusRequest() {
    }

    public UpdateInvoiceStatusRequest(InvoiceStatus status) {
        this.status = status;
    }

    public InvoiceStatus getStatus() {
        return status;
    }

    public void setStatus(InvoiceStatus status) {
        this.status = status;
    }
}

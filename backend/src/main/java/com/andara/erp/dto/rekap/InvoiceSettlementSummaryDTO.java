package com.andara.erp.dto.rekap;

import org.springframework.data.domain.Page;
import java.math.BigDecimal;

public class InvoiceSettlementSummaryDTO {

    private Page<InvoiceSettlementDTO> page;
    private int totalInvoices;
    private BigDecimal grandTotalAmount;
    private BigDecimal grandTotalPaidAmount;
    private BigDecimal grandTotalOutstanding;

    public InvoiceSettlementSummaryDTO() {
        this.grandTotalAmount = BigDecimal.ZERO;
        this.grandTotalPaidAmount = BigDecimal.ZERO;
        this.grandTotalOutstanding = BigDecimal.ZERO;
    }

    public InvoiceSettlementSummaryDTO(
            Page<InvoiceSettlementDTO> page,
            int totalInvoices,
            BigDecimal grandTotalAmount,
            BigDecimal grandTotalPaidAmount,
            BigDecimal grandTotalOutstanding
    ) {
        this.page = page;
        this.totalInvoices = totalInvoices;
        this.grandTotalAmount = grandTotalAmount != null ? grandTotalAmount : BigDecimal.ZERO;
        this.grandTotalPaidAmount = grandTotalPaidAmount != null ? grandTotalPaidAmount : BigDecimal.ZERO;
        this.grandTotalOutstanding = grandTotalOutstanding != null ? grandTotalOutstanding : BigDecimal.ZERO;
    }

    public Page<InvoiceSettlementDTO> getPage() { return page; }
    public void setPage(Page<InvoiceSettlementDTO> page) { this.page = page; }

    public int getTotalInvoices() { return totalInvoices; }
    public void setTotalInvoices(int totalInvoices) { this.totalInvoices = totalInvoices; }

    public BigDecimal getGrandTotalAmount() { return grandTotalAmount; }
    public void setGrandTotalAmount(BigDecimal grandTotalAmount) { this.grandTotalAmount = grandTotalAmount; }

    public BigDecimal getGrandTotalPaidAmount() { return grandTotalPaidAmount; }
    public void setGrandTotalPaidAmount(BigDecimal grandTotalPaidAmount) { this.grandTotalPaidAmount = grandTotalPaidAmount; }

    public BigDecimal getGrandTotalOutstanding() { return grandTotalOutstanding; }
    public void setGrandTotalOutstanding(BigDecimal grandTotalOutstanding) { this.grandTotalOutstanding = grandTotalOutstanding; }
}

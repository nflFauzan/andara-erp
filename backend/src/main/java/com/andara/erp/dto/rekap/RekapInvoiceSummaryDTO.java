package com.andara.erp.dto.rekap;

import org.springframework.data.domain.Page;
import java.math.BigDecimal;

public class RekapInvoiceSummaryDTO {
    private Page<RekapInvoiceDTO> page;
    private long totalInvoices;
    private BigDecimal grandTotalAmount;
    private BigDecimal grandTotalPaidAmount;
    private BigDecimal grandTotalOutstanding;

    public RekapInvoiceSummaryDTO() {
    }

    public RekapInvoiceSummaryDTO(Page<RekapInvoiceDTO> page, long totalInvoices, BigDecimal grandTotalAmount,
                                 BigDecimal grandTotalPaidAmount, BigDecimal grandTotalOutstanding) {
        this.page = page;
        this.totalInvoices = totalInvoices;
        this.grandTotalAmount = grandTotalAmount;
        this.grandTotalPaidAmount = grandTotalPaidAmount;
        this.grandTotalOutstanding = grandTotalOutstanding;
    }

    public Page<RekapInvoiceDTO> getPage() { return page; }
    public void setPage(Page<RekapInvoiceDTO> page) { this.page = page; }
    public long getTotalInvoices() { return totalInvoices; }
    public void setTotalInvoices(long totalInvoices) { this.totalInvoices = totalInvoices; }
    public BigDecimal getGrandTotalAmount() { return grandTotalAmount; }
    public void setGrandTotalAmount(BigDecimal grandTotalAmount) { this.grandTotalAmount = grandTotalAmount; }
    public BigDecimal getGrandTotalPaidAmount() { return grandTotalPaidAmount; }
    public void setGrandTotalPaidAmount(BigDecimal grandTotalPaidAmount) { this.grandTotalPaidAmount = grandTotalPaidAmount; }
    public BigDecimal getGrandTotalOutstanding() { return grandTotalOutstanding; }
    public void setGrandTotalOutstanding(BigDecimal grandTotalOutstanding) { this.grandTotalOutstanding = grandTotalOutstanding; }
}

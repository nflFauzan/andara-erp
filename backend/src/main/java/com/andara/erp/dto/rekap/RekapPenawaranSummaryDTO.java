package com.andara.erp.dto.rekap;

import org.springframework.data.domain.Page;
import java.math.BigDecimal;

public class RekapPenawaranSummaryDTO {
    private Page<RekapPenawaranDTO> page;
    private long totalPenawaran;
    private BigDecimal grandTotalAmount;
    private long approvedCount;
    private BigDecimal approvedTotalAmount;
    private long sentCount;
    private BigDecimal sentTotalAmount;
    private long draftCount;
    private BigDecimal draftTotalAmount;
    private long rejectedCount;
    private BigDecimal rejectedTotalAmount;
    private BigDecimal grandTotalInvoicedAmount;
    private BigDecimal grandTotalUnbilledAmount;

    public RekapPenawaranSummaryDTO() {
    }

    public RekapPenawaranSummaryDTO(Page<RekapPenawaranDTO> page, long totalPenawaran,
                                   BigDecimal grandTotalAmount, long approvedCount,
                                   BigDecimal approvedTotalAmount, long sentCount,
                                   BigDecimal sentTotalAmount, long draftCount,
                                   BigDecimal draftTotalAmount, long rejectedCount,
                                   BigDecimal rejectedTotalAmount,
                                   BigDecimal grandTotalInvoicedAmount,
                                   BigDecimal grandTotalUnbilledAmount) {
        this.page = page;
        this.totalPenawaran = totalPenawaran;
        this.grandTotalAmount = grandTotalAmount;
        this.approvedCount = approvedCount;
        this.approvedTotalAmount = approvedTotalAmount;
        this.sentCount = sentCount;
        this.sentTotalAmount = sentTotalAmount;
        this.draftCount = draftCount;
        this.draftTotalAmount = draftTotalAmount;
        this.rejectedCount = rejectedCount;
        this.rejectedTotalAmount = rejectedTotalAmount;
        this.grandTotalInvoicedAmount = grandTotalInvoicedAmount;
        this.grandTotalUnbilledAmount = grandTotalUnbilledAmount;
    }

    public Page<RekapPenawaranDTO> getPage() { return page; }
    public void setPage(Page<RekapPenawaranDTO> page) { this.page = page; }
    public long getTotalPenawaran() { return totalPenawaran; }
    public void setTotalPenawaran(long totalPenawaran) { this.totalPenawaran = totalPenawaran; }
    public BigDecimal getGrandTotalAmount() { return grandTotalAmount; }
    public void setGrandTotalAmount(BigDecimal grandTotalAmount) { this.grandTotalAmount = grandTotalAmount; }
    public long getApprovedCount() { return approvedCount; }
    public void setApprovedCount(long approvedCount) { this.approvedCount = approvedCount; }
    public BigDecimal getApprovedTotalAmount() { return approvedTotalAmount; }
    public void setApprovedTotalAmount(BigDecimal approvedTotalAmount) { this.approvedTotalAmount = approvedTotalAmount; }
    public long getAcceptedCount() { return approvedCount; }
    public BigDecimal getAcceptedTotalAmount() { return approvedTotalAmount; }
    public long getSentCount() { return sentCount; }
    public void setSentCount(long sentCount) { this.sentCount = sentCount; }
    public BigDecimal getSentTotalAmount() { return sentTotalAmount; }
    public void setSentTotalAmount(BigDecimal sentTotalAmount) { this.sentTotalAmount = sentTotalAmount; }
    public long getDraftCount() { return draftCount; }
    public void setDraftCount(long draftCount) { this.draftCount = draftCount; }
    public BigDecimal getDraftTotalAmount() { return draftTotalAmount; }
    public void setDraftTotalAmount(BigDecimal draftTotalAmount) { this.draftTotalAmount = draftTotalAmount; }
    public long getRejectedCount() { return rejectedCount; }
    public void setRejectedCount(long rejectedCount) { this.rejectedCount = rejectedCount; }
    public BigDecimal getRejectedTotalAmount() { return rejectedTotalAmount; }
    public void setRejectedTotalAmount(BigDecimal rejectedTotalAmount) { this.rejectedTotalAmount = rejectedTotalAmount; }
    public BigDecimal getGrandTotalInvoicedAmount() { return grandTotalInvoicedAmount; }
    public void setGrandTotalInvoicedAmount(BigDecimal grandTotalInvoicedAmount) { this.grandTotalInvoicedAmount = grandTotalInvoicedAmount; }
    public BigDecimal getGrandTotalUnbilledAmount() { return grandTotalUnbilledAmount; }
    public void setGrandTotalUnbilledAmount(BigDecimal grandTotalUnbilledAmount) { this.grandTotalUnbilledAmount = grandTotalUnbilledAmount; }
}

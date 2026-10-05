package com.andara.erp.dto.rekap;

import org.springframework.data.domain.Page;
import java.math.BigDecimal;

public class RekapUnbilledSummaryDTO {

    private Page<RekapUnbilledSphDTO> page;
    private int totalApprovedSph;
    private int unbilledCount;
    private int partiallyBilledCount;
    private int fullyBilledCount;
    private BigDecimal grandTotalSphAmount;
    private BigDecimal grandTotalInvoicedAmount;
    private BigDecimal grandTotalUnbilledAmount;

    public RekapUnbilledSummaryDTO() {
        this.grandTotalSphAmount = BigDecimal.ZERO;
        this.grandTotalInvoicedAmount = BigDecimal.ZERO;
        this.grandTotalUnbilledAmount = BigDecimal.ZERO;
    }

    public RekapUnbilledSummaryDTO(
            Page<RekapUnbilledSphDTO> page,
            int totalApprovedSph,
            int unbilledCount,
            int partiallyBilledCount,
            int fullyBilledCount,
            BigDecimal grandTotalSphAmount,
            BigDecimal grandTotalInvoicedAmount,
            BigDecimal grandTotalUnbilledAmount
    ) {
        this.page = page;
        this.totalApprovedSph = totalApprovedSph;
        this.unbilledCount = unbilledCount;
        this.partiallyBilledCount = partiallyBilledCount;
        this.fullyBilledCount = fullyBilledCount;
        this.grandTotalSphAmount = grandTotalSphAmount != null ? grandTotalSphAmount : BigDecimal.ZERO;
        this.grandTotalInvoicedAmount = grandTotalInvoicedAmount != null ? grandTotalInvoicedAmount : BigDecimal.ZERO;
        this.grandTotalUnbilledAmount = grandTotalUnbilledAmount != null ? grandTotalUnbilledAmount : BigDecimal.ZERO;
    }

    public Page<RekapUnbilledSphDTO> getPage() { return page; }
    public void setPage(Page<RekapUnbilledSphDTO> page) { this.page = page; }

    public int getTotalApprovedSph() { return totalApprovedSph; }
    public void setTotalApprovedSph(int totalApprovedSph) { this.totalApprovedSph = totalApprovedSph; }

    public int getUnbilledCount() { return unbilledCount; }
    public void setUnbilledCount(int unbilledCount) { this.unbilledCount = unbilledCount; }

    public int getPartiallyBilledCount() { return partiallyBilledCount; }
    public void setPartiallyBilledCount(int partiallyBilledCount) { this.partiallyBilledCount = partiallyBilledCount; }

    public int getFullyBilledCount() { return fullyBilledCount; }
    public void setFullyBilledCount(int fullyBilledCount) { this.fullyBilledCount = fullyBilledCount; }

    public BigDecimal getGrandTotalSphAmount() { return grandTotalSphAmount; }
    public void setGrandTotalSphAmount(BigDecimal grandTotalSphAmount) { this.grandTotalSphAmount = grandTotalSphAmount; }

    public BigDecimal getGrandTotalInvoicedAmount() { return grandTotalInvoicedAmount; }
    public void setGrandTotalInvoicedAmount(BigDecimal grandTotalInvoicedAmount) { this.grandTotalInvoicedAmount = grandTotalInvoicedAmount; }

    public BigDecimal getGrandTotalUnbilledAmount() { return grandTotalUnbilledAmount; }
    public void setGrandTotalUnbilledAmount(BigDecimal grandTotalUnbilledAmount) { this.grandTotalUnbilledAmount = grandTotalUnbilledAmount; }
}

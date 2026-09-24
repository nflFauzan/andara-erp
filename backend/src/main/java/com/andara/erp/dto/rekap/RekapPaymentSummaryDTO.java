package com.andara.erp.dto.rekap;

import org.springframework.data.domain.Page;
import java.math.BigDecimal;

public class RekapPaymentSummaryDTO {
    private Page<RekapPaymentDTO> page;
    private long totalPayments;
    private BigDecimal grandTotalAmount;
    private BigDecimal grandTotalAllocatedAmount;
    private BigDecimal grandTotalExcessDeposit;

    public RekapPaymentSummaryDTO() {
    }

    public RekapPaymentSummaryDTO(Page<RekapPaymentDTO> page, long totalPayments, BigDecimal grandTotalAmount,
                                  BigDecimal grandTotalAllocatedAmount, BigDecimal grandTotalExcessDeposit) {
        this.page = page;
        this.totalPayments = totalPayments;
        this.grandTotalAmount = grandTotalAmount;
        this.grandTotalAllocatedAmount = grandTotalAllocatedAmount;
        this.grandTotalExcessDeposit = grandTotalExcessDeposit;
    }

    public Page<RekapPaymentDTO> getPage() { return page; }
    public void setPage(Page<RekapPaymentDTO> page) { this.page = page; }
    public long getTotalPayments() { return totalPayments; }
    public void setTotalPayments(long totalPayments) { this.totalPayments = totalPayments; }
    public BigDecimal getGrandTotalAmount() { return grandTotalAmount; }
    public void setGrandTotalAmount(BigDecimal grandTotalAmount) { this.grandTotalAmount = grandTotalAmount; }
    public BigDecimal getGrandTotalAllocatedAmount() { return grandTotalAllocatedAmount; }
    public void setGrandTotalAllocatedAmount(BigDecimal grandTotalAllocatedAmount) { this.grandTotalAllocatedAmount = grandTotalAllocatedAmount; }
    public BigDecimal getGrandTotalExcessDeposit() { return grandTotalExcessDeposit; }
    public void setGrandTotalExcessDeposit(BigDecimal grandTotalExcessDeposit) { this.grandTotalExcessDeposit = grandTotalExcessDeposit; }
}

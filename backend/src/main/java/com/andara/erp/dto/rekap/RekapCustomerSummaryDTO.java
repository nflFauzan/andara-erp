package com.andara.erp.dto.rekap;

import org.springframework.data.domain.Page;
import java.math.BigDecimal;

public class RekapCustomerSummaryDTO {
    private Page<RekapCustomerDTO> page;
    private long totalCustomers;
    private BigDecimal grandTotalInvoiceAmount;
    private BigDecimal grandTotalPaidAmount;
    private BigDecimal grandTotalOutstanding;
    private BigDecimal grandTotalDepositBalance;

    public RekapCustomerSummaryDTO() {
    }

    public RekapCustomerSummaryDTO(Page<RekapCustomerDTO> page, long totalCustomers, BigDecimal grandTotalInvoiceAmount,
                                   BigDecimal grandTotalPaidAmount, BigDecimal grandTotalOutstanding, BigDecimal grandTotalDepositBalance) {
        this.page = page;
        this.totalCustomers = totalCustomers;
        this.grandTotalInvoiceAmount = grandTotalInvoiceAmount;
        this.grandTotalPaidAmount = grandTotalPaidAmount;
        this.grandTotalOutstanding = grandTotalOutstanding;
        this.grandTotalDepositBalance = grandTotalDepositBalance;
    }

    public Page<RekapCustomerDTO> getPage() { return page; }
    public void setPage(Page<RekapCustomerDTO> page) { this.page = page; }
    public long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }
    public BigDecimal getGrandTotalInvoiceAmount() { return grandTotalInvoiceAmount; }
    public void setGrandTotalInvoiceAmount(BigDecimal grandTotalInvoiceAmount) { this.grandTotalInvoiceAmount = grandTotalInvoiceAmount; }
    public BigDecimal getGrandTotalPaidAmount() { return grandTotalPaidAmount; }
    public void setGrandTotalPaidAmount(BigDecimal grandTotalPaidAmount) { this.grandTotalPaidAmount = grandTotalPaidAmount; }
    public BigDecimal getGrandTotalOutstanding() { return grandTotalOutstanding; }
    public void setGrandTotalOutstanding(BigDecimal grandTotalOutstanding) { this.grandTotalOutstanding = grandTotalOutstanding; }
    public BigDecimal getGrandTotalDepositBalance() { return grandTotalDepositBalance; }
    public void setGrandTotalDepositBalance(BigDecimal grandTotalDepositBalance) { this.grandTotalDepositBalance = grandTotalDepositBalance; }
}

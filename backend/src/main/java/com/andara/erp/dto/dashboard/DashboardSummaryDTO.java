package com.andara.erp.dto.dashboard;

import java.math.BigDecimal;
import java.util.List;

public class DashboardSummaryDTO {
    private long totalActiveCustomers;
    private long totalActiveKegiatan;
    private long totalPenawaran;
    private BigDecimal totalPenawaranAmount;
    private long totalInvoices;
    private BigDecimal totalInvoiceAmount;
    private BigDecimal totalPayments;
    private BigDecimal totalOutstanding;
    private BigDecimal totalCustomerDeposit;
    private long unpaidInvoiceCount;

    private List<DashboardInvoiceDTO> recentUnpaidInvoices;
    private List<DashboardPaymentDTO> recentPayments;
    private List<MonthlyTrendDTO> monthlyTrends;

    public DashboardSummaryDTO() {
    }

    public long getTotalActiveCustomers() { return totalActiveCustomers; }
    public void setTotalActiveCustomers(long totalActiveCustomers) { this.totalActiveCustomers = totalActiveCustomers; }
    public long getTotalActiveKegiatan() { return totalActiveKegiatan; }
    public void setTotalActiveKegiatan(long totalActiveKegiatan) { this.totalActiveKegiatan = totalActiveKegiatan; }
    public long getTotalPenawaran() { return totalPenawaran; }
    public void setTotalPenawaran(long totalPenawaran) { this.totalPenawaran = totalPenawaran; }
    public BigDecimal getTotalPenawaranAmount() { return totalPenawaranAmount; }
    public void setTotalPenawaranAmount(BigDecimal totalPenawaranAmount) { this.totalPenawaranAmount = totalPenawaranAmount; }
    public long getTotalInvoices() { return totalInvoices; }
    public void setTotalInvoices(long totalInvoices) { this.totalInvoices = totalInvoices; }
    public BigDecimal getTotalInvoiceAmount() { return totalInvoiceAmount; }
    public void setTotalInvoiceAmount(BigDecimal totalInvoiceAmount) { this.totalInvoiceAmount = totalInvoiceAmount; }
    public BigDecimal getTotalPayments() { return totalPayments; }
    public void setTotalPayments(BigDecimal totalPayments) { this.totalPayments = totalPayments; }
    public BigDecimal getTotalOutstanding() { return totalOutstanding; }
    public void setTotalOutstanding(BigDecimal totalOutstanding) { this.totalOutstanding = totalOutstanding; }
    public BigDecimal getTotalCustomerDeposit() { return totalCustomerDeposit; }
    public void setTotalCustomerDeposit(BigDecimal totalCustomerDeposit) { this.totalCustomerDeposit = totalCustomerDeposit; }
    public long getUnpaidInvoiceCount() { return unpaidInvoiceCount; }
    public void setUnpaidInvoiceCount(long unpaidInvoiceCount) { this.unpaidInvoiceCount = unpaidInvoiceCount; }
    public List<DashboardInvoiceDTO> getRecentUnpaidInvoices() { return recentUnpaidInvoices; }
    public void setRecentUnpaidInvoices(List<DashboardInvoiceDTO> recentUnpaidInvoices) { this.recentUnpaidInvoices = recentUnpaidInvoices; }
    public List<DashboardPaymentDTO> getRecentPayments() { return recentPayments; }
    public void setRecentPayments(List<DashboardPaymentDTO> recentPayments) { this.recentPayments = recentPayments; }
    public List<MonthlyTrendDTO> getMonthlyTrends() { return monthlyTrends; }
    public void setMonthlyTrends(List<MonthlyTrendDTO> monthlyTrends) { this.monthlyTrends = monthlyTrends; }
}

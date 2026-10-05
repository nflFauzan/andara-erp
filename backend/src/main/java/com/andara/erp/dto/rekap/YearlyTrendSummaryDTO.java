package com.andara.erp.dto.rekap;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class YearlyTrendSummaryDTO {

    private int year;
    private Long customerId;
    private String customerName;
    private BigDecimal totalKegiatanAmount;
    private BigDecimal totalSphAmount;
    private BigDecimal totalInvoiceAmount;
    private BigDecimal totalPaymentAmount;
    private BigDecimal totalOutstandingAmount;
    private Double averageCollectionRate;
    private int peakInvoiceMonth;
    private String peakInvoiceMonthName;
    private int peakPaymentMonth;
    private String peakPaymentMonthName;
    private List<MonthlyTrendItemDTO> monthlyData = new ArrayList<>();

    public YearlyTrendSummaryDTO() {
        this.totalKegiatanAmount = BigDecimal.ZERO;
        this.totalSphAmount = BigDecimal.ZERO;
        this.totalInvoiceAmount = BigDecimal.ZERO;
        this.totalPaymentAmount = BigDecimal.ZERO;
        this.totalOutstandingAmount = BigDecimal.ZERO;
    }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public BigDecimal getTotalKegiatanAmount() { return totalKegiatanAmount; }
    public void setTotalKegiatanAmount(BigDecimal totalKegiatanAmount) { this.totalKegiatanAmount = totalKegiatanAmount; }

    public BigDecimal getTotalSphAmount() { return totalSphAmount; }
    public void setTotalSphAmount(BigDecimal totalSphAmount) { this.totalSphAmount = totalSphAmount; }

    public BigDecimal getTotalInvoiceAmount() { return totalInvoiceAmount; }
    public void setTotalInvoiceAmount(BigDecimal totalInvoiceAmount) { this.totalInvoiceAmount = totalInvoiceAmount; }

    public BigDecimal getTotalPaymentAmount() { return totalPaymentAmount; }
    public void setTotalPaymentAmount(BigDecimal totalPaymentAmount) { this.totalPaymentAmount = totalPaymentAmount; }

    public BigDecimal getTotalOutstandingAmount() { return totalOutstandingAmount; }
    public void setTotalOutstandingAmount(BigDecimal totalOutstandingAmount) { this.totalOutstandingAmount = totalOutstandingAmount; }

    public Double getAverageCollectionRate() { return averageCollectionRate; }
    public void setAverageCollectionRate(Double averageCollectionRate) { this.averageCollectionRate = averageCollectionRate; }

    public int getPeakInvoiceMonth() { return peakInvoiceMonth; }
    public void setPeakInvoiceMonth(int peakInvoiceMonth) { this.peakInvoiceMonth = peakInvoiceMonth; }

    public String getPeakInvoiceMonthName() { return peakInvoiceMonthName; }
    public void setPeakInvoiceMonthName(String peakInvoiceMonthName) { this.peakInvoiceMonthName = peakInvoiceMonthName; }

    public int getPeakPaymentMonth() { return peakPaymentMonth; }
    public void setPeakPaymentMonth(int peakPaymentMonth) { this.peakPaymentMonth = peakPaymentMonth; }

    public String getPeakPaymentMonthName() { return peakPaymentMonthName; }
    public void setPeakPaymentMonthName(String peakPaymentMonthName) { this.peakPaymentMonthName = peakPaymentMonthName; }

    public List<MonthlyTrendItemDTO> getMonthlyData() { return monthlyData; }
    public void setMonthlyData(List<MonthlyTrendItemDTO> monthlyData) { this.monthlyData = monthlyData != null ? monthlyData : new ArrayList<>(); }
}

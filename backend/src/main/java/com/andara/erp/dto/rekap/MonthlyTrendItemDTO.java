package com.andara.erp.dto.rekap;

import java.math.BigDecimal;

public class MonthlyTrendItemDTO {

    private int month;
    private String monthName;
    private int kegiatanCount;
    private BigDecimal kegiatanAmount;
    private int sphCount;
    private BigDecimal sphAmount;
    private int invoiceCount;
    private BigDecimal invoiceAmount;
    private int paymentCount;
    private BigDecimal paymentAmount;
    private BigDecimal outstandingCreated;
    private Double momInvoiceGrowth; // % pertumbuhan omzet vs bulan sebelumnya
    private Double momPaymentGrowth; // % pertumbuhan kas masuk vs bulan sebelumnya
    private Double collectionRate;   // % realisasi kas terhadap invoice bulan tsb

    public MonthlyTrendItemDTO() {
        this.kegiatanAmount = BigDecimal.ZERO;
        this.sphAmount = BigDecimal.ZERO;
        this.invoiceAmount = BigDecimal.ZERO;
        this.paymentAmount = BigDecimal.ZERO;
        this.outstandingCreated = BigDecimal.ZERO;
    }

    public MonthlyTrendItemDTO(
            int month,
            String monthName,
            int kegiatanCount,
            BigDecimal kegiatanAmount,
            int sphCount,
            BigDecimal sphAmount,
            int invoiceCount,
            BigDecimal invoiceAmount,
            int paymentCount,
            BigDecimal paymentAmount,
            BigDecimal outstandingCreated,
            Double momInvoiceGrowth,
            Double momPaymentGrowth,
            Double collectionRate
    ) {
        this.month = month;
        this.monthName = monthName;
        this.kegiatanCount = kegiatanCount;
        this.kegiatanAmount = kegiatanAmount != null ? kegiatanAmount : BigDecimal.ZERO;
        this.sphCount = sphCount;
        this.sphAmount = sphAmount != null ? sphAmount : BigDecimal.ZERO;
        this.invoiceCount = invoiceCount;
        this.invoiceAmount = invoiceAmount != null ? invoiceAmount : BigDecimal.ZERO;
        this.paymentCount = paymentCount;
        this.paymentAmount = paymentAmount != null ? paymentAmount : BigDecimal.ZERO;
        this.outstandingCreated = outstandingCreated != null ? outstandingCreated : BigDecimal.ZERO;
        this.momInvoiceGrowth = momInvoiceGrowth;
        this.momPaymentGrowth = momPaymentGrowth;
        this.collectionRate = collectionRate;
    }

    public int getMonth() { return month; }
    public void setMonth(int month) { this.month = month; }

    public String getMonthName() { return monthName; }
    public void setMonthName(String monthName) { this.monthName = monthName; }

    public int getKegiatanCount() { return kegiatanCount; }
    public void setKegiatanCount(int kegiatanCount) { this.kegiatanCount = kegiatanCount; }

    public BigDecimal getKegiatanAmount() { return kegiatanAmount; }
    public void setKegiatanAmount(BigDecimal kegiatanAmount) { this.kegiatanAmount = kegiatanAmount; }

    public int getSphCount() { return sphCount; }
    public void setSphCount(int sphCount) { this.sphCount = sphCount; }

    public BigDecimal getSphAmount() { return sphAmount; }
    public void setSphAmount(BigDecimal sphAmount) { this.sphAmount = sphAmount; }

    public int getInvoiceCount() { return invoiceCount; }
    public void setInvoiceCount(int invoiceCount) { this.invoiceCount = invoiceCount; }

    public BigDecimal getInvoiceAmount() { return invoiceAmount; }
    public void setInvoiceAmount(BigDecimal invoiceAmount) { this.invoiceAmount = invoiceAmount; }

    public int getPaymentCount() { return paymentCount; }
    public void setPaymentCount(int paymentCount) { this.paymentCount = paymentCount; }

    public BigDecimal getPaymentAmount() { return paymentAmount; }
    public void setPaymentAmount(BigDecimal paymentAmount) { this.paymentAmount = paymentAmount; }

    public BigDecimal getOutstandingCreated() { return outstandingCreated; }
    public void setOutstandingCreated(BigDecimal outstandingCreated) { this.outstandingCreated = outstandingCreated; }

    public Double getMomInvoiceGrowth() { return momInvoiceGrowth; }
    public void setMomInvoiceGrowth(Double momInvoiceGrowth) { this.momInvoiceGrowth = momInvoiceGrowth; }

    public Double getMomPaymentGrowth() { return momPaymentGrowth; }
    public void setMomPaymentGrowth(Double momPaymentGrowth) { this.momPaymentGrowth = momPaymentGrowth; }

    public Double getCollectionRate() { return collectionRate; }
    public void setCollectionRate(Double collectionRate) { this.collectionRate = collectionRate; }
}

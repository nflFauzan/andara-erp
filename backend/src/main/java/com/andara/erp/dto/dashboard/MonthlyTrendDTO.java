package com.andara.erp.dto.dashboard;

import java.math.BigDecimal;

public class MonthlyTrendDTO {
    private String month;
    private String monthLabel;
    private BigDecimal invoiceAmount;
    private BigDecimal paymentAmount;

    public MonthlyTrendDTO() {
    }

    public MonthlyTrendDTO(String month, String monthLabel, BigDecimal invoiceAmount, BigDecimal paymentAmount) {
        this.month = month;
        this.monthLabel = monthLabel;
        this.invoiceAmount = invoiceAmount;
        this.paymentAmount = paymentAmount;
    }

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }
    public String getMonthLabel() { return monthLabel; }
    public void setMonthLabel(String monthLabel) { this.monthLabel = monthLabel; }
    public BigDecimal getInvoiceAmount() { return invoiceAmount; }
    public void setInvoiceAmount(BigDecimal invoiceAmount) { this.invoiceAmount = invoiceAmount; }
    public BigDecimal getPaymentAmount() { return paymentAmount; }
    public void setPaymentAmount(BigDecimal paymentAmount) { this.paymentAmount = paymentAmount; }
}

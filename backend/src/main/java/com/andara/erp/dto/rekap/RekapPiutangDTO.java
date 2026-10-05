package com.andara.erp.dto.rekap;

import java.math.BigDecimal;
import java.time.LocalDate;

public class RekapPiutangDTO {
    private Long invoiceId;
    private String invoiceNumber;
    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private Long customerId;
    private String customerCode;
    private String customerName;
    private String companyName;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal outstanding;
    private long daysOverdue;
    private String agingBucket; // CURRENT, DAYS_1_30, DAYS_31_60, DAYS_61_90, DAYS_OVER_90
    private String invoiceStatus;
    private String paymentStatus;

    public RekapPiutangDTO() {
    }

    public RekapPiutangDTO(Long invoiceId, String invoiceNumber, LocalDate invoiceDate,
                           LocalDate dueDate, Long customerId, String customerCode,
                           String customerName, String companyName, BigDecimal totalAmount,
                           BigDecimal paidAmount, BigDecimal outstanding, long daysOverdue,
                           String agingBucket, String invoiceStatus, String paymentStatus) {
        this.invoiceId = invoiceId;
        this.invoiceNumber = invoiceNumber;
        this.invoiceDate = invoiceDate;
        this.dueDate = dueDate;
        this.customerId = customerId;
        this.customerCode = customerCode;
        this.customerName = customerName;
        this.companyName = companyName;
        this.totalAmount = totalAmount;
        this.paidAmount = paidAmount;
        this.outstanding = outstanding;
        this.daysOverdue = daysOverdue;
        this.agingBucket = agingBucket;
        this.invoiceStatus = invoiceStatus;
        this.paymentStatus = paymentStatus;
    }

    public Long getInvoiceId() { return invoiceId; }
    public void setInvoiceId(Long invoiceId) { this.invoiceId = invoiceId; }
    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
    public LocalDate getInvoiceDate() { return invoiceDate; }
    public void setInvoiceDate(LocalDate invoiceDate) { this.invoiceDate = invoiceDate; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public String getCustomerCode() { return customerCode; }
    public void setCustomerCode(String customerCode) { this.customerCode = customerCode; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BigDecimal getPaidAmount() { return paidAmount; }
    public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }
    public BigDecimal getOutstanding() { return outstanding; }
    public void setOutstanding(BigDecimal outstanding) { this.outstanding = outstanding; }
    public long getDaysOverdue() { return daysOverdue; }
    public void setDaysOverdue(long daysOverdue) { this.daysOverdue = daysOverdue; }
    public String getAgingBucket() { return agingBucket; }
    public void setAgingBucket(String agingBucket) { this.agingBucket = agingBucket; }
    public String getInvoiceStatus() { return invoiceStatus; }
    public void setInvoiceStatus(String invoiceStatus) { this.invoiceStatus = invoiceStatus; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
}

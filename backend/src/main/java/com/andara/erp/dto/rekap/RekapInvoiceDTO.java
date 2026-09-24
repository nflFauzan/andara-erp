package com.andara.erp.dto.rekap;

import java.math.BigDecimal;
import java.time.LocalDate;

public class RekapInvoiceDTO {
    private Long id;
    private String number;
    private LocalDate date;
    private LocalDate dueDate;
    private Long customerId;
    private String customerCode;
    private String customerName;
    private String companyName;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal outstanding;
    private String status;
    private String paymentStatus;

    public RekapInvoiceDTO() {
    }

    public RekapInvoiceDTO(Long id, String number, LocalDate date, LocalDate dueDate, Long customerId,
                          String customerCode, String customerName, String companyName, BigDecimal totalAmount,
                          BigDecimal paidAmount, BigDecimal outstanding, String status, String paymentStatus) {
        this.id = id;
        this.number = number;
        this.date = date;
        this.dueDate = dueDate;
        this.customerId = customerId;
        this.customerCode = customerCode;
        this.customerName = customerName;
        this.companyName = companyName;
        this.totalAmount = totalAmount;
        this.paidAmount = paidAmount;
        this.outstanding = outstanding;
        this.status = status;
        this.paymentStatus = paymentStatus;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNumber() { return number; }
    public void setNumber(String number) { this.number = number; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
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
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
}

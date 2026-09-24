package com.andara.erp.dto.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DashboardInvoiceDTO {
    private Long id;
    private String number;
    private LocalDate date;
    private LocalDate dueDate;
    private String customerName;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal outstanding;
    private String status;
    private String paymentStatus;

    public DashboardInvoiceDTO() {
    }

    public DashboardInvoiceDTO(Long id, String number, LocalDate date, LocalDate dueDate, String customerName,
                               BigDecimal totalAmount, BigDecimal paidAmount, BigDecimal outstanding,
                               String status, String paymentStatus) {
        this.id = id;
        this.number = number;
        this.date = date;
        this.dueDate = dueDate;
        this.customerName = customerName;
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
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
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

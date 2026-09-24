package com.andara.erp.dto.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DashboardPaymentDTO {
    private Long id;
    private String number;
    private LocalDate date;
    private String customerName;
    private BigDecimal amount;
    private String paymentMethod;
    private String destinationAccount;
    private String status;

    public DashboardPaymentDTO() {
    }

    public DashboardPaymentDTO(Long id, String number, LocalDate date, String customerName, BigDecimal amount,
                               String paymentMethod, String destinationAccount, String status) {
        this.id = id;
        this.number = number;
        this.date = date;
        this.customerName = customerName;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.destinationAccount = destinationAccount;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNumber() { return number; }
    public void setNumber(String number) { this.number = number; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getDestinationAccount() { return destinationAccount; }
    public void setDestinationAccount(String destinationAccount) { this.destinationAccount = destinationAccount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}

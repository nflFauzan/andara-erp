package com.andara.erp.dto.rekap;

import java.math.BigDecimal;
import java.time.LocalDate;

public class RekapPaymentDTO {
    private Long id;
    private String number;
    private LocalDate date;
    private Long customerId;
    private String customerCode;
    private String customerName;
    private String companyName;
    private BigDecimal amount;
    private BigDecimal allocatedAmount;
    private BigDecimal excessDeposit;
    private String paymentMethod;
    private String destinationAccount;
    private String status;
    private String reference;

    public RekapPaymentDTO() {
    }

    public RekapPaymentDTO(Long id, String number, LocalDate date, Long customerId, String customerCode,
                          String customerName, String companyName, BigDecimal amount, BigDecimal allocatedAmount,
                          BigDecimal excessDeposit, String paymentMethod, String destinationAccount,
                          String status, String reference) {
        this.id = id;
        this.number = number;
        this.date = date;
        this.customerId = customerId;
        this.customerCode = customerCode;
        this.customerName = customerName;
        this.companyName = companyName;
        this.amount = amount;
        this.allocatedAmount = allocatedAmount;
        this.excessDeposit = excessDeposit;
        this.paymentMethod = paymentMethod;
        this.destinationAccount = destinationAccount;
        this.status = status;
        this.reference = reference;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNumber() { return number; }
    public void setNumber(String number) { this.number = number; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public String getCustomerCode() { return customerCode; }
    public void setCustomerCode(String customerCode) { this.customerCode = customerCode; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public BigDecimal getAllocatedAmount() { return allocatedAmount; }
    public void setAllocatedAmount(BigDecimal allocatedAmount) { this.allocatedAmount = allocatedAmount; }
    public BigDecimal getExcessDeposit() { return excessDeposit; }
    public void setExcessDeposit(BigDecimal excessDeposit) { this.excessDeposit = excessDeposit; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getDestinationAccount() { return destinationAccount; }
    public void setDestinationAccount(String destinationAccount) { this.destinationAccount = destinationAccount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
}

package com.andara.erp.dto.deposit;

import java.math.BigDecimal;

public class CustomerDepositSummaryDTO {

    private Long customerId;
    private String customerCode;
    private String customerName;
    private String companyName;
    private BigDecimal depositBalance;
    private BigDecimal totalDepositIn;
    private BigDecimal totalDepositUsed;
    private long transactionCount;

    public CustomerDepositSummaryDTO() {
    }

    public CustomerDepositSummaryDTO(Long customerId, String customerCode, String customerName, String companyName, BigDecimal depositBalance, BigDecimal totalDepositIn, BigDecimal totalDepositUsed, long transactionCount) {
        this.customerId = customerId;
        this.customerCode = customerCode;
        this.customerName = customerName;
        this.companyName = companyName;
        this.depositBalance = depositBalance;
        this.totalDepositIn = totalDepositIn;
        this.totalDepositUsed = totalDepositUsed;
        this.transactionCount = transactionCount;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerCode() {
        return customerCode;
    }

    public void setCustomerCode(String customerCode) {
        this.customerCode = customerCode;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public BigDecimal getDepositBalance() {
        return depositBalance;
    }

    public void setDepositBalance(BigDecimal depositBalance) {
        this.depositBalance = depositBalance;
    }

    public BigDecimal getTotalDepositIn() {
        return totalDepositIn;
    }

    public void setTotalDepositIn(BigDecimal totalDepositIn) {
        this.totalDepositIn = totalDepositIn;
    }

    public BigDecimal getTotalDepositUsed() {
        return totalDepositUsed;
    }

    public void setTotalDepositUsed(BigDecimal totalDepositUsed) {
        this.totalDepositUsed = totalDepositUsed;
    }

    public long getTransactionCount() {
        return transactionCount;
    }

    public void setTransactionCount(long transactionCount) {
        this.transactionCount = transactionCount;
    }
}

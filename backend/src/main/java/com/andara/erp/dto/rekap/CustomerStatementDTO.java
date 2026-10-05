package com.andara.erp.dto.rekap;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class CustomerStatementDTO {

    private Long customerId;
    private String customerName;
    private String customerCode;
    private String email;
    private String phone;
    private String company;
    private String address;

    private BigDecimal depositBalance;
    private int totalKegiatanCount;
    private BigDecimal totalKegiatanAmount;
    private int totalPenawaranCount;
    private BigDecimal totalPenawaranAmount;
    private int totalInvoiceCount;
    private BigDecimal totalInvoiceAmount;
    private BigDecimal totalPaidAmount;
    private BigDecimal totalOutstandingAmount;

    private List<CustomerStatementItemDTO> items = new ArrayList<>();

    public CustomerStatementDTO() {
        this.depositBalance = BigDecimal.ZERO;
        this.totalKegiatanAmount = BigDecimal.ZERO;
        this.totalPenawaranAmount = BigDecimal.ZERO;
        this.totalInvoiceAmount = BigDecimal.ZERO;
        this.totalPaidAmount = BigDecimal.ZERO;
        this.totalOutstandingAmount = BigDecimal.ZERO;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerCode() {
        return customerCode;
    }

    public void setCustomerCode(String customerCode) {
        this.customerCode = customerCode;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public BigDecimal getDepositBalance() {
        return depositBalance;
    }

    public void setDepositBalance(BigDecimal depositBalance) {
        this.depositBalance = depositBalance != null ? depositBalance : BigDecimal.ZERO;
    }

    public int getTotalKegiatanCount() {
        return totalKegiatanCount;
    }

    public void setTotalKegiatanCount(int totalKegiatanCount) {
        this.totalKegiatanCount = totalKegiatanCount;
    }

    public BigDecimal getTotalKegiatanAmount() {
        return totalKegiatanAmount;
    }

    public void setTotalKegiatanAmount(BigDecimal totalKegiatanAmount) {
        this.totalKegiatanAmount = totalKegiatanAmount != null ? totalKegiatanAmount : BigDecimal.ZERO;
    }

    public int getTotalPenawaranCount() {
        return totalPenawaranCount;
    }

    public void setTotalPenawaranCount(int totalPenawaranCount) {
        this.totalPenawaranCount = totalPenawaranCount;
    }

    public BigDecimal getTotalPenawaranAmount() {
        return totalPenawaranAmount;
    }

    public void setTotalPenawaranAmount(BigDecimal totalPenawaranAmount) {
        this.totalPenawaranAmount = totalPenawaranAmount != null ? totalPenawaranAmount : BigDecimal.ZERO;
    }

    public int getTotalInvoiceCount() {
        return totalInvoiceCount;
    }

    public void setTotalInvoiceCount(int totalInvoiceCount) {
        this.totalInvoiceCount = totalInvoiceCount;
    }

    public BigDecimal getTotalInvoiceAmount() {
        return totalInvoiceAmount;
    }

    public void setTotalInvoiceAmount(BigDecimal totalInvoiceAmount) {
        this.totalInvoiceAmount = totalInvoiceAmount != null ? totalInvoiceAmount : BigDecimal.ZERO;
    }

    public BigDecimal getTotalPaidAmount() {
        return totalPaidAmount;
    }

    public void setTotalPaidAmount(BigDecimal totalPaidAmount) {
        this.totalPaidAmount = totalPaidAmount != null ? totalPaidAmount : BigDecimal.ZERO;
    }

    public BigDecimal getTotalOutstandingAmount() {
        return totalOutstandingAmount;
    }

    public void setTotalOutstandingAmount(BigDecimal totalOutstandingAmount) {
        this.totalOutstandingAmount = totalOutstandingAmount != null ? totalOutstandingAmount : BigDecimal.ZERO;
    }

    public List<CustomerStatementItemDTO> getItems() {
        return items;
    }

    public void setItems(List<CustomerStatementItemDTO> items) {
        this.items = items != null ? items : new ArrayList<>();
    }
}

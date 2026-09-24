package com.andara.erp.dto.rekap;

import java.math.BigDecimal;

public class RekapCustomerDTO {
    private Long customerId;
    private String customerCode;
    private String customerName;
    private String companyName;
    private String phone;
    private long totalKegiatan;
    private long totalInvoices;
    private BigDecimal totalInvoiceAmount;
    private BigDecimal totalPaidAmount;
    private BigDecimal totalOutstanding;
    private BigDecimal depositBalance;

    public RekapCustomerDTO() {
    }

    public RekapCustomerDTO(Long customerId, String customerCode, String customerName, String companyName,
                            String phone, long totalKegiatan, long totalInvoices, BigDecimal totalInvoiceAmount,
                            BigDecimal totalPaidAmount, BigDecimal totalOutstanding, BigDecimal depositBalance) {
        this.customerId = customerId;
        this.customerCode = customerCode;
        this.customerName = customerName;
        this.companyName = companyName;
        this.phone = phone;
        this.totalKegiatan = totalKegiatan;
        this.totalInvoices = totalInvoices;
        this.totalInvoiceAmount = totalInvoiceAmount;
        this.totalPaidAmount = totalPaidAmount;
        this.totalOutstanding = totalOutstanding;
        this.depositBalance = depositBalance;
    }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public String getCustomerCode() { return customerCode; }
    public void setCustomerCode(String customerCode) { this.customerCode = customerCode; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public long getTotalKegiatan() { return totalKegiatan; }
    public void setTotalKegiatan(long totalKegiatan) { this.totalKegiatan = totalKegiatan; }
    public long getTotalInvoices() { return totalInvoices; }
    public void setTotalInvoices(long totalInvoices) { this.totalInvoices = totalInvoices; }
    public BigDecimal getTotalInvoiceAmount() { return totalInvoiceAmount; }
    public void setTotalInvoiceAmount(BigDecimal totalInvoiceAmount) { this.totalInvoiceAmount = totalInvoiceAmount; }
    public BigDecimal getTotalPaidAmount() { return totalPaidAmount; }
    public void setTotalPaidAmount(BigDecimal totalPaidAmount) { this.totalPaidAmount = totalPaidAmount; }
    public BigDecimal getTotalOutstanding() { return totalOutstanding; }
    public void setTotalOutstanding(BigDecimal totalOutstanding) { this.totalOutstanding = totalOutstanding; }
    public BigDecimal getDepositBalance() { return depositBalance; }
    public void setDepositBalance(BigDecimal depositBalance) { this.depositBalance = depositBalance; }
}

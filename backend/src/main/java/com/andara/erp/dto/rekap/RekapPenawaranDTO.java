package com.andara.erp.dto.rekap;

import java.math.BigDecimal;
import java.time.LocalDate;

public class RekapPenawaranDTO {
    private Long id;
    private String number;
    private LocalDate date;
    private Long customerId;
    private String customerCode;
    private String customerName;
    private String companyName;
    private String kegiatanSummary;
    private int kegiatanCount;
    private BigDecimal totalAmount;
    private String status;
    private long invoiceCount;
    private BigDecimal invoicedAmount;
    private BigDecimal unbilledAmount;

    public RekapPenawaranDTO() {
    }

    public RekapPenawaranDTO(Long id, String number, LocalDate date, Long customerId,
                            String customerCode, String customerName, String companyName,
                            String kegiatanSummary, int kegiatanCount, BigDecimal totalAmount,
                            String status, long invoiceCount, BigDecimal invoicedAmount,
                            BigDecimal unbilledAmount) {
        this.id = id;
        this.number = number;
        this.date = date;
        this.customerId = customerId;
        this.customerCode = customerCode;
        this.customerName = customerName;
        this.companyName = companyName;
        this.kegiatanSummary = kegiatanSummary;
        this.kegiatanCount = kegiatanCount;
        this.totalAmount = totalAmount;
        this.status = status;
        this.invoiceCount = invoiceCount;
        this.invoicedAmount = invoicedAmount;
        this.unbilledAmount = unbilledAmount;
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
    public String getKegiatanSummary() { return kegiatanSummary; }
    public void setKegiatanSummary(String kegiatanSummary) { this.kegiatanSummary = kegiatanSummary; }
    public int getKegiatanCount() { return kegiatanCount; }
    public void setKegiatanCount(int kegiatanCount) { this.kegiatanCount = kegiatanCount; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public long getInvoiceCount() { return invoiceCount; }
    public void setInvoiceCount(long invoiceCount) { this.invoiceCount = invoiceCount; }
    public BigDecimal getInvoicedAmount() { return invoicedAmount; }
    public void setInvoicedAmount(BigDecimal invoicedAmount) { this.invoicedAmount = invoicedAmount; }
    public BigDecimal getUnbilledAmount() { return unbilledAmount; }
    public void setUnbilledAmount(BigDecimal unbilledAmount) { this.unbilledAmount = unbilledAmount; }
}

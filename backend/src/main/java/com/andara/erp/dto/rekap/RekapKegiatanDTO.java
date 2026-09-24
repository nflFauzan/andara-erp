package com.andara.erp.dto.rekap;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class RekapKegiatanDTO {
    private Long id;
    private String code;
    private String name;
    private Long customerId;
    private String customerCode;
    private String customerName;
    private String companyName;
    private String location;
    private String status;
    private BigDecimal totalValue;
    private long itemCount;
    private long penawaranCount;
    private long invoiceCount;
    private LocalDateTime createdAt;

    public RekapKegiatanDTO() {
    }

    public RekapKegiatanDTO(Long id, String code, String name, Long customerId, String customerCode,
                            String customerName, String companyName, String location, String status,
                            BigDecimal totalValue, long itemCount, long penawaranCount, long invoiceCount,
                            LocalDateTime createdAt) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.customerId = customerId;
        this.customerCode = customerCode;
        this.customerName = customerName;
        this.companyName = companyName;
        this.location = location;
        this.status = status;
        this.totalValue = totalValue;
        this.itemCount = itemCount;
        this.penawaranCount = penawaranCount;
        this.invoiceCount = invoiceCount;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public String getCustomerCode() { return customerCode; }
    public void setCustomerCode(String customerCode) { this.customerCode = customerCode; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getTotalValue() { return totalValue; }
    public void setTotalValue(BigDecimal totalValue) { this.totalValue = totalValue; }
    public long getItemCount() { return itemCount; }
    public void setItemCount(long itemCount) { this.itemCount = itemCount; }
    public long getPenawaranCount() { return penawaranCount; }
    public void setPenawaranCount(long penawaranCount) { this.penawaranCount = penawaranCount; }
    public long getInvoiceCount() { return invoiceCount; }
    public void setInvoiceCount(long invoiceCount) { this.invoiceCount = invoiceCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

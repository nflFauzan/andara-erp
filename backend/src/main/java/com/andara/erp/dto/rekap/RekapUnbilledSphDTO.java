package com.andara.erp.dto.rekap;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class RekapUnbilledSphDTO {

    private Long sphId;
    private String sphNumber;
    private LocalDate sphDate;
    private Long customerId;
    private String customerCode;
    private String customerName;
    private String companyName;
    private String status;
    private BigDecimal totalSphAmount;
    private BigDecimal totalInvoicedAmount;
    private BigDecimal unbilledAmount;
    private double billedPercentage;
    private String billingStatus; // UNBILLED, PARTIALLY_BILLED, FULLY_BILLED
    private int invoiceCount;
    private List<InvoiceBriefDTO> invoices = new ArrayList<>();

    public static class InvoiceBriefDTO {
        private Long id;
        private String number;
        private LocalDate date;
        private BigDecimal totalAmount;
        private String paymentStatus;

        public InvoiceBriefDTO() {}

        public InvoiceBriefDTO(Long id, String number, LocalDate date, BigDecimal totalAmount, String paymentStatus) {
            this.id = id;
            this.number = number;
            this.date = date;
            this.totalAmount = totalAmount;
            this.paymentStatus = paymentStatus;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getNumber() { return number; }
        public void setNumber(String number) { this.number = number; }
        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }
        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
        public String getPaymentStatus() { return paymentStatus; }
        public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    }

    public RekapUnbilledSphDTO() {
        this.totalSphAmount = BigDecimal.ZERO;
        this.totalInvoicedAmount = BigDecimal.ZERO;
        this.unbilledAmount = BigDecimal.ZERO;
    }

    public Long getSphId() { return sphId; }
    public void setSphId(Long sphId) { this.sphId = sphId; }

    public String getSphNumber() { return sphNumber; }
    public void setSphNumber(String sphNumber) { this.sphNumber = sphNumber; }

    public LocalDate getSphDate() { return sphDate; }
    public void setSphDate(LocalDate sphDate) { this.sphDate = sphDate; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerCode() { return customerCode; }
    public void setCustomerCode(String customerCode) { this.customerCode = customerCode; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getTotalSphAmount() { return totalSphAmount; }
    public void setTotalSphAmount(BigDecimal totalSphAmount) { this.totalSphAmount = totalSphAmount != null ? totalSphAmount : BigDecimal.ZERO; }

    public BigDecimal getTotalInvoicedAmount() { return totalInvoicedAmount; }
    public void setTotalInvoicedAmount(BigDecimal totalInvoicedAmount) { this.totalInvoicedAmount = totalInvoicedAmount != null ? totalInvoicedAmount : BigDecimal.ZERO; }

    public BigDecimal getUnbilledAmount() { return unbilledAmount; }
    public void setUnbilledAmount(BigDecimal unbilledAmount) { this.unbilledAmount = unbilledAmount != null ? unbilledAmount : BigDecimal.ZERO; }

    public double getBilledPercentage() { return billedPercentage; }
    public void setBilledPercentage(double billedPercentage) { this.billedPercentage = billedPercentage; }

    public String getBillingStatus() { return billingStatus; }
    public void setBillingStatus(String billingStatus) { this.billingStatus = billingStatus; }

    public int getInvoiceCount() { return invoiceCount; }
    public void setInvoiceCount(int invoiceCount) { this.invoiceCount = invoiceCount; }

    public List<InvoiceBriefDTO> getInvoices() { return invoices; }
    public void setInvoices(List<InvoiceBriefDTO> invoices) { this.invoices = invoices != null ? invoices : new ArrayList<>(); }
}

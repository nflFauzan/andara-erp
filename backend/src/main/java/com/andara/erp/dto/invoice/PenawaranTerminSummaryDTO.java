package com.andara.erp.dto.invoice;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class PenawaranTerminSummaryDTO {

    private Long penawaranId;
    private String penawaranNumber;
    private BigDecimal totalPenawaranAmount;
    private BigDecimal alreadyBilledPercentage;
    private BigDecimal remainingPercentage;
    private List<BilledTerminItemDTO> billedInvoices = new ArrayList<>();
    private List<AvailableDpInvoiceDTO> availableDpInvoices = new ArrayList<>();

    public PenawaranTerminSummaryDTO() {
    }

    public static class BilledTerminItemDTO {
        private Long invoiceId;
        private String invoiceNumber;
        private String terminName;
        private BigDecimal terminPercentage;
        private BigDecimal subtotalDpp;
        private BigDecimal totalAmount;
        private LocalDate date;
        private String status;
        private String paymentStatus;

        public BilledTerminItemDTO() {
        }

        public Long getInvoiceId() {
            return invoiceId;
        }

        public void setInvoiceId(Long invoiceId) {
            this.invoiceId = invoiceId;
        }

        public String getInvoiceNumber() {
            return invoiceNumber;
        }

        public void setInvoiceNumber(String invoiceNumber) {
            this.invoiceNumber = invoiceNumber;
        }

        public String getTerminName() {
            return terminName;
        }

        public void setTerminName(String terminName) {
            this.terminName = terminName;
        }

        public BigDecimal getTerminPercentage() {
            return terminPercentage;
        }

        public void setTerminPercentage(BigDecimal terminPercentage) {
            this.terminPercentage = terminPercentage;
        }

        public BigDecimal getSubtotalDpp() {
            return subtotalDpp;
        }

        public void setSubtotalDpp(BigDecimal subtotalDpp) {
            this.subtotalDpp = subtotalDpp;
        }

        public BigDecimal getTotalAmount() {
            return totalAmount;
        }

        public void setTotalAmount(BigDecimal totalAmount) {
            this.totalAmount = totalAmount;
        }

        public LocalDate getDate() {
            return date;
        }

        public void setDate(LocalDate date) {
            this.date = date;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getPaymentStatus() {
            return paymentStatus;
        }

        public void setPaymentStatus(String paymentStatus) {
            this.paymentStatus = paymentStatus;
        }
    }

    public static class AvailableDpInvoiceDTO {
        private Long invoiceId;
        private String invoiceNumber;
        private String terminName;
        private BigDecimal terminPercentage;
        private BigDecimal subtotalDpp;
        private BigDecimal totalAmount;
        private BigDecimal paidAmount;
        private LocalDate date;

        public AvailableDpInvoiceDTO() {
        }

        public Long getInvoiceId() {
            return invoiceId;
        }

        public void setInvoiceId(Long invoiceId) {
            this.invoiceId = invoiceId;
        }

        public String getInvoiceNumber() {
            return invoiceNumber;
        }

        public void setInvoiceNumber(String invoiceNumber) {
            this.invoiceNumber = invoiceNumber;
        }

        public String getTerminName() {
            return terminName;
        }

        public void setTerminName(String terminName) {
            this.terminName = terminName;
        }

        public BigDecimal getTerminPercentage() {
            return terminPercentage;
        }

        public void setTerminPercentage(BigDecimal terminPercentage) {
            this.terminPercentage = terminPercentage;
        }

        public BigDecimal getSubtotalDpp() {
            return subtotalDpp;
        }

        public void setSubtotalDpp(BigDecimal subtotalDpp) {
            this.subtotalDpp = subtotalDpp;
        }

        public BigDecimal getTotalAmount() {
            return totalAmount;
        }

        public void setTotalAmount(BigDecimal totalAmount) {
            this.totalAmount = totalAmount;
        }

        public BigDecimal getPaidAmount() {
            return paidAmount;
        }

        public void setPaidAmount(BigDecimal paidAmount) {
            this.paidAmount = paidAmount;
        }

        public LocalDate getDate() {
            return date;
        }

        public void setDate(LocalDate date) {
            this.date = date;
        }
    }

    public Long getPenawaranId() {
        return penawaranId;
    }

    public void setPenawaranId(Long penawaranId) {
        this.penawaranId = penawaranId;
    }

    public String getPenawaranNumber() {
        return penawaranNumber;
    }

    public void setPenawaranNumber(String penawaranNumber) {
        this.penawaranNumber = penawaranNumber;
    }

    public BigDecimal getTotalPenawaranAmount() {
        return totalPenawaranAmount;
    }

    public void setTotalPenawaranAmount(BigDecimal totalPenawaranAmount) {
        this.totalPenawaranAmount = totalPenawaranAmount;
    }

    public BigDecimal getAlreadyBilledPercentage() {
        return alreadyBilledPercentage;
    }

    public void setAlreadyBilledPercentage(BigDecimal alreadyBilledPercentage) {
        this.alreadyBilledPercentage = alreadyBilledPercentage;
    }

    public BigDecimal getRemainingPercentage() {
        return remainingPercentage;
    }

    public void setRemainingPercentage(BigDecimal remainingPercentage) {
        this.remainingPercentage = remainingPercentage;
    }

    public List<BilledTerminItemDTO> getBilledInvoices() {
        return billedInvoices;
    }

    public void setBilledInvoices(List<BilledTerminItemDTO> billedInvoices) {
        this.billedInvoices = billedInvoices;
    }

    public List<AvailableDpInvoiceDTO> getAvailableDpInvoices() {
        return availableDpInvoices;
    }

    public void setAvailableDpInvoices(List<AvailableDpInvoiceDTO> availableDpInvoices) {
        this.availableDpInvoices = availableDpInvoices;
    }
}

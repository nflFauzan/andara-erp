package com.andara.erp.dto.rekap;

import java.math.BigDecimal;
import java.time.LocalDate;

public class InvoiceSettlementAllocationDTO {

    private Long paymentId;
    private String paymentNumber;
    private LocalDate paymentDate;
    private BigDecimal paymentAmount;
    private BigDecimal allocatedAmount;
    private String paymentMethod;
    private String destinationAccount;
    private String notes;

    public InvoiceSettlementAllocationDTO() {
        this.paymentAmount = BigDecimal.ZERO;
        this.allocatedAmount = BigDecimal.ZERO;
    }

    public InvoiceSettlementAllocationDTO(
            Long paymentId,
            String paymentNumber,
            LocalDate paymentDate,
            BigDecimal paymentAmount,
            BigDecimal allocatedAmount,
            String paymentMethod,
            String destinationAccount,
            String notes
    ) {
        this.paymentId = paymentId;
        this.paymentNumber = paymentNumber;
        this.paymentDate = paymentDate;
        this.paymentAmount = paymentAmount != null ? paymentAmount : BigDecimal.ZERO;
        this.allocatedAmount = allocatedAmount != null ? allocatedAmount : BigDecimal.ZERO;
        this.paymentMethod = paymentMethod;
        this.destinationAccount = destinationAccount;
        this.notes = notes;
    }

    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }

    public String getPaymentNumber() { return paymentNumber; }
    public void setPaymentNumber(String paymentNumber) { this.paymentNumber = paymentNumber; }

    public LocalDate getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDate paymentDate) { this.paymentDate = paymentDate; }

    public BigDecimal getPaymentAmount() { return paymentAmount; }
    public void setPaymentAmount(BigDecimal paymentAmount) { this.paymentAmount = paymentAmount; }

    public BigDecimal getAllocatedAmount() { return allocatedAmount; }
    public void setAllocatedAmount(BigDecimal allocatedAmount) { this.allocatedAmount = allocatedAmount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getDestinationAccount() { return destinationAccount; }
    public void setDestinationAccount(String destinationAccount) { this.destinationAccount = destinationAccount; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}

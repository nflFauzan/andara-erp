package com.andara.erp.dto.rekap;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CustomerStatementItemDTO {

    private LocalDate date;
    private String type; // KEGIATAN, SPH, INVOICE, PAYMENT, DEPOSIT
    private Long referenceId;
    private String referenceNo;
    private String description;
    private String status;
    private BigDecimal amount;
    private BigDecimal debit;  // Tagihan timbul (misal: Invoice)
    private BigDecimal credit; // Pembayaran diterima / kas masuk
    private BigDecimal runningBalance; // Saldo akumulatif piutang
    private String notes;

    public CustomerStatementItemDTO() {
        this.amount = BigDecimal.ZERO;
        this.debit = BigDecimal.ZERO;
        this.credit = BigDecimal.ZERO;
        this.runningBalance = BigDecimal.ZERO;
    }

    public CustomerStatementItemDTO(
            LocalDate date,
            String type,
            Long referenceId,
            String referenceNo,
            String description,
            String status,
            BigDecimal amount,
            BigDecimal debit,
            BigDecimal credit,
            BigDecimal runningBalance,
            String notes
    ) {
        this.date = date;
        this.type = type;
        this.referenceId = referenceId;
        this.referenceNo = referenceNo;
        this.description = description;
        this.status = status;
        this.amount = amount != null ? amount : BigDecimal.ZERO;
        this.debit = debit != null ? debit : BigDecimal.ZERO;
        this.credit = credit != null ? credit : BigDecimal.ZERO;
        this.runningBalance = runningBalance != null ? runningBalance : BigDecimal.ZERO;
        this.notes = notes;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(Long referenceId) {
        this.referenceId = referenceId;
    }

    public String getReferenceNo() {
        return referenceNo;
    }

    public void setReferenceNo(String referenceNo) {
        this.referenceNo = referenceNo;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount != null ? amount : BigDecimal.ZERO;
    }

    public BigDecimal getDebit() {
        return debit;
    }

    public void setDebit(BigDecimal debit) {
        this.debit = debit != null ? debit : BigDecimal.ZERO;
    }

    public BigDecimal getCredit() {
        return credit;
    }

    public void setCredit(BigDecimal credit) {
        this.credit = credit != null ? credit : BigDecimal.ZERO;
    }

    public BigDecimal getRunningBalance() {
        return runningBalance;
    }

    public void setRunningBalance(BigDecimal runningBalance) {
        this.runningBalance = runningBalance != null ? runningBalance : BigDecimal.ZERO;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

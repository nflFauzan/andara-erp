package com.andara.erp.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String number;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_penawaran_id")
    private Penawaran sourcePenawaran;

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_mode", nullable = false, length = 30)
    private BillingMode billingMode = BillingMode.ITEM_VOLUME;

    @Column(name = "termin_percentage", precision = 5, scale = 2)
    private BigDecimal terminPercentage;

    @Column(name = "termin_name", length = 100)
    private String terminName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "previous_dp_invoice_id")
    private Invoice previousDpInvoice;

    @Column(name = "client_po_number", length = 100)
    private String clientPoNumber;

    @Column(name = "client_spk_number", length = 100)
    private String clientSpkNumber;

    @Column(name = "bast_number", length = 100)
    private String bastNumber;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private InvoiceStatus status = InvoiceStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 50)
    private InvoicePaymentStatus paymentStatus = InvoicePaymentStatus.UNPAID;

    @Column(name = "subtotal_dpp", nullable = false, precision = 15, scale = 2)
    private BigDecimal subtotalDpp = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "tax_ppn_type", nullable = false, length = 20)
    private TaxPpnType taxPpnType = TaxPpnType.NONE;

    @Column(name = "tax_ppn_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal taxPpnRate = BigDecimal.ZERO;

    @Column(name = "tax_ppn_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal taxPpnAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "tax_pph_type", nullable = false, length = 30)
    private TaxPphType taxPphType = TaxPphType.NONE;

    @Column(name = "tax_pph_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal taxPphRate = BigDecimal.ZERO;

    @Column(name = "tax_pph_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal taxPphAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "net_total_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal netTotalAmount = BigDecimal.ZERO;

    @Column(name = "paid_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(columnDefinition = "TEXT")
    private String terms;

    @Column(name = "work_location")
    private String workLocation;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC, id ASC")
    private List<InvoiceDetail> details = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "created_by", length = 50)
    private String createdBy;

    @Column(name = "updated_by", length = 50)
    private String updatedBy;

    public Invoice() {
    }

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
        if (date == null) {
            date = LocalDate.now();
        }
        if (status == null) {
            status = InvoiceStatus.DRAFT;
        }
        if (paymentStatus == null) {
            paymentStatus = InvoicePaymentStatus.UNPAID;
        }
        if (paidAmount == null) {
            paidAmount = BigDecimal.ZERO;
        }
        recalculateTotalAmount();
        updatePaymentStatus();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
        recalculateTotalAmount();
        updatePaymentStatus();
    }

    public void recalculateTotalAmount() {
        if (details == null || details.isEmpty()) {
            this.subtotalDpp = BigDecimal.ZERO;
            this.taxPpnAmount = BigDecimal.ZERO;
            this.taxPphAmount = BigDecimal.ZERO;
            this.totalAmount = BigDecimal.ZERO;
            this.netTotalAmount = BigDecimal.ZERO;
            return;
        }

        BigDecimal itemsSum = details.stream()
                .map(detail -> {
                    detail.calculateAmount();
                    return detail.getAmount() != null ? detail.getAmount() : BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (this.taxPpnType == null) {
            this.taxPpnType = TaxPpnType.NONE;
        }
        if (this.taxPphType == null) {
            this.taxPphType = TaxPphType.NONE;
        }

        switch (this.taxPpnType) {
            case INCLUDE -> {
                BigDecimal rate = this.taxPpnRate != null && this.taxPpnRate.compareTo(BigDecimal.ZERO) > 0
                        ? this.taxPpnRate : this.taxPpnType.getDefaultRate();
                this.taxPpnRate = rate;
                BigDecimal divisor = BigDecimal.ONE.add(rate.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
                this.subtotalDpp = itemsSum.divide(divisor, 2, RoundingMode.HALF_UP);
                this.taxPpnAmount = itemsSum.subtract(this.subtotalDpp).max(BigDecimal.ZERO);
                this.totalAmount = itemsSum;
            }
            case EXCLUDE_11, EXCLUDE_12 -> {
                BigDecimal rate = this.taxPpnRate != null && this.taxPpnRate.compareTo(BigDecimal.ZERO) > 0
                        ? this.taxPpnRate : this.taxPpnType.getDefaultRate();
                this.taxPpnRate = rate;
                this.subtotalDpp = itemsSum;
                this.taxPpnAmount = this.subtotalDpp.multiply(rate)
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                this.totalAmount = this.subtotalDpp.add(this.taxPpnAmount);
            }
            default -> { // NONE
                this.taxPpnRate = BigDecimal.ZERO;
                this.taxPpnAmount = BigDecimal.ZERO;
                this.subtotalDpp = itemsSum;
                this.totalAmount = itemsSum;
            }
        }

        if (this.taxPphType != null && this.taxPphType != TaxPphType.NONE) {
            BigDecimal pphRate = this.taxPphRate != null && this.taxPphRate.compareTo(BigDecimal.ZERO) > 0
                    ? this.taxPphRate : this.taxPphType.getDefaultRate();
            this.taxPphRate = pphRate;
            this.taxPphAmount = this.subtotalDpp.multiply(pphRate)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            this.taxPphRate = BigDecimal.ZERO;
            this.taxPphAmount = BigDecimal.ZERO;
        }

        this.netTotalAmount = this.totalAmount.subtract(this.taxPphAmount).max(BigDecimal.ZERO);
    }

    public void updatePaymentStatus() {
        if (paidAmount == null || paidAmount.compareTo(BigDecimal.ZERO) <= 0) {
            this.paymentStatus = InvoicePaymentStatus.UNPAID;
        } else if (paidAmount.compareTo(this.totalAmount) >= 0) {
            this.paymentStatus = InvoicePaymentStatus.PAID;
        } else {
            this.paymentStatus = InvoicePaymentStatus.PARTIAL;
        }
    }

    public BigDecimal getOutstanding() {
        if (totalAmount == null) return BigDecimal.ZERO;
        BigDecimal paid = paidAmount != null ? paidAmount : BigDecimal.ZERO;
        return totalAmount.subtract(paid).max(BigDecimal.ZERO);
    }

    public void addDetail(InvoiceDetail detail) {
        details.add(detail);
        detail.setInvoice(this);
        recalculateTotalAmount();
    }

    public void removeDetail(InvoiceDetail detail) {
        details.remove(detail);
        detail.setInvoice(null);
        recalculateTotalAmount();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumber() {
        return number;
    }

    public void setNumber(String number) {
        this.number = number;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public Penawaran getSourcePenawaran() {
        return sourcePenawaran;
    }

    public void setSourcePenawaran(Penawaran sourcePenawaran) {
        this.sourcePenawaran = sourcePenawaran;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public InvoiceStatus getStatus() {
        return status;
    }

    public void setStatus(InvoiceStatus status) {
        this.status = status;
    }

    public InvoicePaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(InvoicePaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
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
        updatePaymentStatus();
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getTerms() {
        return terms;
    }

    public void setTerms(String terms) {
        this.terms = terms;
    }

    public String getWorkLocation() {
        return workLocation;
    }

    public void setWorkLocation(String workLocation) {
        this.workLocation = workLocation;
    }

    public List<InvoiceDetail> getDetails() {
        return details;
    }

    public void setDetails(List<InvoiceDetail> details) {
        this.details = details;
        if (details != null) {
            for (InvoiceDetail d : details) {
                d.setInvoice(this);
            }
        }
        recalculateTotalAmount();
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public String getClientPoNumber() {
        return clientPoNumber;
    }

    public void setClientPoNumber(String clientPoNumber) {
        this.clientPoNumber = clientPoNumber;
    }

    public String getClientSpkNumber() {
        return clientSpkNumber;
    }

    public void setClientSpkNumber(String clientSpkNumber) {
        this.clientSpkNumber = clientSpkNumber;
    }

    public String getBastNumber() {
        return bastNumber;
    }

    public void setBastNumber(String bastNumber) {
        this.bastNumber = bastNumber;
    }

    public BigDecimal getSubtotalDpp() {
        return subtotalDpp;
    }

    public void setSubtotalDpp(BigDecimal subtotalDpp) {
        this.subtotalDpp = subtotalDpp;
    }

    public TaxPpnType getTaxPpnType() {
        return taxPpnType;
    }

    public void setTaxPpnType(TaxPpnType taxPpnType) {
        this.taxPpnType = taxPpnType != null ? taxPpnType : TaxPpnType.NONE;
        recalculateTotalAmount();
        updatePaymentStatus();
    }

    public BigDecimal getTaxPpnRate() {
        return taxPpnRate;
    }

    public void setTaxPpnRate(BigDecimal taxPpnRate) {
        this.taxPpnRate = taxPpnRate;
        recalculateTotalAmount();
        updatePaymentStatus();
    }

    public BigDecimal getTaxPpnAmount() {
        return taxPpnAmount;
    }

    public void setTaxPpnAmount(BigDecimal taxPpnAmount) {
        this.taxPpnAmount = taxPpnAmount;
    }

    public TaxPphType getTaxPphType() {
        return taxPphType;
    }

    public void setTaxPphType(TaxPphType taxPphType) {
        this.taxPphType = taxPphType != null ? taxPphType : TaxPphType.NONE;
        recalculateTotalAmount();
        updatePaymentStatus();
    }

    public BigDecimal getTaxPphRate() {
        return taxPphRate;
    }

    public void setTaxPphRate(BigDecimal taxPphRate) {
        this.taxPphRate = taxPphRate;
        recalculateTotalAmount();
        updatePaymentStatus();
    }

    public BigDecimal getTaxPphAmount() {
        return taxPphAmount;
    }

    public void setTaxPphAmount(BigDecimal taxPphAmount) {
        this.taxPphAmount = taxPphAmount;
    }

    public BigDecimal getNetTotalAmount() {
        return netTotalAmount;
    }

    public void setNetTotalAmount(BigDecimal netTotalAmount) {
        this.netTotalAmount = netTotalAmount;
    }

    public BillingMode getBillingMode() {
        return billingMode;
    }

    public void setBillingMode(BillingMode billingMode) {
        this.billingMode = billingMode != null ? billingMode : BillingMode.ITEM_VOLUME;
    }

    public BigDecimal getTerminPercentage() {
        return terminPercentage;
    }

    public void setTerminPercentage(BigDecimal terminPercentage) {
        this.terminPercentage = terminPercentage;
    }

    public String getTerminName() {
        return terminName;
    }

    public void setTerminName(String terminName) {
        this.terminName = terminName;
    }

    public Invoice getPreviousDpInvoice() {
        return previousDpInvoice;
    }

    public void setPreviousDpInvoice(Invoice previousDpInvoice) {
        this.previousDpInvoice = previousDpInvoice;
    }
}

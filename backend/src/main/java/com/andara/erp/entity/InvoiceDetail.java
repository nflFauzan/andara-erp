package com.andara.erp.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "invoice_details")
public class InvoiceDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_penawaran_detail_id")
    private PenawaranDetail sourcePenawaranDetail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_kegiatan_id")
    private Kegiatan sourceKegiatan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_kegiatan_item_id")
    private KegiatanItem sourceKegiatanItem;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal quantity = BigDecimal.ONE;

    @Column(nullable = false, length = 50)
    private String unit = "unit";

    @Column(name = "unit_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public InvoiceDetail() {
    }

    public InvoiceDetail(String description, BigDecimal quantity, String unit, BigDecimal unitPrice, Integer sortOrder) {
        this.description = description;
        this.quantity = quantity;
        this.unit = unit;
        this.unitPrice = unitPrice;
        this.sortOrder = sortOrder != null ? sortOrder : 0;
        calculateAmount();
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
        if (sortOrder == null) {
            sortOrder = 0;
        }
        calculateAmount();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
        calculateAmount();
    }

    public void calculateAmount() {
        if (quantity != null && unitPrice != null) {
            this.amount = quantity.multiply(unitPrice).setScale(2, java.math.RoundingMode.HALF_UP);
        } else {
            this.amount = BigDecimal.ZERO;
        }
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Invoice getInvoice() {
        return invoice;
    }

    public void setInvoice(Invoice invoice) {
        this.invoice = invoice;
    }

    public PenawaranDetail getSourcePenawaranDetail() {
        return sourcePenawaranDetail;
    }

    public void setSourcePenawaranDetail(PenawaranDetail sourcePenawaranDetail) {
        this.sourcePenawaranDetail = sourcePenawaranDetail;
    }

    public Kegiatan getSourceKegiatan() {
        return sourceKegiatan;
    }

    public void setSourceKegiatan(Kegiatan sourceKegiatan) {
        this.sourceKegiatan = sourceKegiatan;
    }

    public KegiatanItem getSourceKegiatanItem() {
        return sourceKegiatanItem;
    }

    public void setSourceKegiatanItem(KegiatanItem sourceKegiatanItem) {
        this.sourceKegiatanItem = sourceKegiatanItem;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
        calculateAmount();
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
        calculateAmount();
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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
}

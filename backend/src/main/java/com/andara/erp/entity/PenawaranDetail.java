package com.andara.erp.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "penawaran_details")
public class PenawaranDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "penawaran_id", nullable = false)
    private Penawaran penawaran;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kegiatan_id")
    private Kegiatan kegiatan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kegiatan_item_id")
    private KegiatanItem kegiatanItem;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal volume = BigDecimal.ONE;

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

    public PenawaranDetail() {
    }

    public PenawaranDetail(String description, BigDecimal volume, String unit, BigDecimal unitPrice, Integer sortOrder) {
        this.description = description;
        this.volume = volume;
        this.unit = unit;
        this.unitPrice = unitPrice;
        this.sortOrder = sortOrder != null ? sortOrder : 0;
        this.calculateAmount();
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
        if (volume != null && unitPrice != null) {
            this.amount = volume.multiply(unitPrice).setScale(2, java.math.RoundingMode.HALF_UP);
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

    public Penawaran getPenawaran() {
        return penawaran;
    }

    public void setPenawaran(Penawaran penawaran) {
        this.penawaran = penawaran;
    }

    public Kegiatan getKegiatan() {
        return kegiatan;
    }

    public void setKegiatan(Kegiatan kegiatan) {
        this.kegiatan = kegiatan;
    }

    public KegiatanItem getKegiatanItem() {
        return kegiatanItem;
    }

    public void setKegiatanItem(KegiatanItem kegiatanItem) {
        this.kegiatanItem = kegiatanItem;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getVolume() {
        return volume;
    }

    public void setVolume(BigDecimal volume) {
        this.volume = volume;
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

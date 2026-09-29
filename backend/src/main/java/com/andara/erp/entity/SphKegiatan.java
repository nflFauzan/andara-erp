package com.andara.erp.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sph_kegiatan")
public class SphKegiatan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "penawaran_id", nullable = false)
    private Penawaran penawaran;

    @Column(nullable = false, length = 500)
    private String name;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @OneToMany(mappedBy = "sphKegiatan", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC, id ASC")
    private List<PenawaranDetail> items = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public SphKegiatan() {
    }

    public SphKegiatan(String name, Integer sortOrder) {
        this.name = name;
        this.sortOrder = sortOrder != null ? sortOrder : 0;
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
        recalculateSubtotal();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
        recalculateSubtotal();
    }

    public void recalculateSubtotal() {
        if (items == null || items.isEmpty()) {
            this.subtotal = BigDecimal.ZERO;
            return;
        }
        this.subtotal = items.stream()
                .map(item -> {
                    item.calculateAmount();
                    return item.getAmount() != null ? item.getAmount() : BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void addItem(PenawaranDetail item) {
        items.add(item);
        item.setSphKegiatan(this);
        if (this.penawaran != null) {
            item.setPenawaran(this.penawaran);
        }
        recalculateSubtotal();
    }

    public void removeItem(PenawaranDetail item) {
        items.remove(item);
        item.setSphKegiatan(null);
        recalculateSubtotal();
    }

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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public List<PenawaranDetail> getItems() {
        return items;
    }

    public void setItems(List<PenawaranDetail> items) {
        this.items = items;
        if (items != null) {
            for (PenawaranDetail item : items) {
                item.setSphKegiatan(this);
                if (this.penawaran != null) {
                    item.setPenawaran(this.penawaran);
                }
            }
        }
        recalculateSubtotal();
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

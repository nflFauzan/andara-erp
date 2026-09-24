package com.andara.erp.dto.penawaran;

import com.andara.erp.entity.PenawaranDetail;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public class PenawaranDetailDTO {

    private Long id;
    private Long penawaranId;
    private Long kegiatanId;
    private String kegiatanName;
    private Long kegiatanItemId;
    private String description;
    private BigDecimal volume;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal amount;
    private Integer sortOrder;
    private String notes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public PenawaranDetailDTO() {
    }

    public static PenawaranDetailDTO fromEntity(PenawaranDetail detail) {
        PenawaranDetailDTO dto = new PenawaranDetailDTO();
        dto.setId(detail.getId());
        dto.setPenawaranId(detail.getPenawaran() != null ? detail.getPenawaran().getId() : null);
        if (detail.getKegiatan() != null) {
            dto.setKegiatanId(detail.getKegiatan().getId());
            dto.setKegiatanName(detail.getKegiatan().getName());
        }
        if (detail.getKegiatanItem() != null) {
            dto.setKegiatanItemId(detail.getKegiatanItem().getId());
        }
        dto.setDescription(detail.getDescription());
        dto.setVolume(detail.getVolume());
        dto.setUnit(detail.getUnit());
        dto.setUnitPrice(detail.getUnitPrice());
        dto.setAmount(detail.getAmount());
        dto.setSortOrder(detail.getSortOrder());
        dto.setNotes(detail.getNotes());
        dto.setCreatedAt(detail.getCreatedAt());
        dto.setUpdatedAt(detail.getUpdatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPenawaranId() {
        return penawaranId;
    }

    public void setPenawaranId(Long penawaranId) {
        this.penawaranId = penawaranId;
    }

    public Long getKegiatanId() {
        return kegiatanId;
    }

    public void setKegiatanId(Long kegiatanId) {
        this.kegiatanId = kegiatanId;
    }

    public String getKegiatanName() {
        return kegiatanName;
    }

    public void setKegiatanName(String kegiatanName) {
        this.kegiatanName = kegiatanName;
    }

    public Long getKegiatanItemId() {
        return kegiatanItemId;
    }

    public void setKegiatanItemId(Long kegiatanItemId) {
        this.kegiatanItemId = kegiatanItemId;
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

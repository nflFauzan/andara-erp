package com.andara.erp.dto.invoice;

import java.math.BigDecimal;

public class PenawaranBillableItemDTO {

    private Long penawaranDetailId;
    private Long kegiatanId;
    private String kegiatanName;
    private Long kegiatanItemId;
    private String description;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal originalVolume;
    private BigDecimal alreadyBilledVolume;
    private BigDecimal remainingBillableVolume;
    private boolean fullyBilled;
    private Integer sortOrder;
    private String notes;

    public PenawaranBillableItemDTO() {
    }

    public Long getPenawaranDetailId() {
        return penawaranDetailId;
    }

    public void setPenawaranDetailId(Long penawaranDetailId) {
        this.penawaranDetailId = penawaranDetailId;
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

    public BigDecimal getOriginalVolume() {
        return originalVolume;
    }

    public void setOriginalVolume(BigDecimal originalVolume) {
        this.originalVolume = originalVolume;
    }

    public BigDecimal getAlreadyBilledVolume() {
        return alreadyBilledVolume;
    }

    public void setAlreadyBilledVolume(BigDecimal alreadyBilledVolume) {
        this.alreadyBilledVolume = alreadyBilledVolume;
    }

    public BigDecimal getRemainingBillableVolume() {
        return remainingBillableVolume;
    }

    public void setRemainingBillableVolume(BigDecimal remainingBillableVolume) {
        this.remainingBillableVolume = remainingBillableVolume;
    }

    public boolean isFullyBilled() {
        return fullyBilled;
    }

    public void setFullyBilled(boolean fullyBilled) {
        this.fullyBilled = fullyBilled;
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
}

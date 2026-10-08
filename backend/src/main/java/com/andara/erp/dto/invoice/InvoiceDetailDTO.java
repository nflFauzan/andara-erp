package com.andara.erp.dto.invoice;

import com.andara.erp.entity.InvoiceDetail;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public class InvoiceDetailDTO {

    private Long id;
    private Long invoiceId;
    private Long sourcePenawaranDetailId;
    private Long sourcePenawaranId;
    private String sourcePenawaranNumber;
    private Long sphKegiatanId;
    private String sphKegiatanName;
    private Long sourceKegiatanId;
    private String sourceKegiatanName;
    private Long sourceKegiatanItemId;
    private String description;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal amount;
    private Integer sortOrder;
    private com.andara.erp.entity.InvoiceItemType itemType;
    private Boolean isDeduction;
    private String notes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public InvoiceDetailDTO() {
    }

    public static InvoiceDetailDTO fromEntity(InvoiceDetail detail) {
        InvoiceDetailDTO dto = new InvoiceDetailDTO();
        dto.setId(detail.getId());
        dto.setInvoiceId(detail.getInvoice() != null ? detail.getInvoice().getId() : null);
        if (detail.getSourcePenawaranDetail() != null) {
            dto.setSourcePenawaranDetailId(detail.getSourcePenawaranDetail().getId());
        }
        if (detail.getSourcePenawaran() != null) {
            dto.setSourcePenawaranId(detail.getSourcePenawaran().getId());
            dto.setSourcePenawaranNumber(detail.getSourcePenawaran().getNumber());
        } else if (detail.getSourcePenawaranDetail() != null && detail.getSourcePenawaranDetail().getPenawaran() != null) {
            dto.setSourcePenawaranId(detail.getSourcePenawaranDetail().getPenawaran().getId());
            dto.setSourcePenawaranNumber(detail.getSourcePenawaranDetail().getPenawaran().getNumber());
        }
        if (detail.getSphKegiatan() != null) {
            dto.setSphKegiatanId(detail.getSphKegiatan().getId());
            dto.setSphKegiatanName(detail.getSphKegiatan().getName());
        }
        if (detail.getSourceKegiatan() != null) {
            dto.setSourceKegiatanId(detail.getSourceKegiatan().getId());
            dto.setSourceKegiatanName(detail.getSourceKegiatan().getName());
        } else if (detail.getSphKegiatan() != null && detail.getSphKegiatan().getKegiatan() != null) {
            dto.setSourceKegiatanId(detail.getSphKegiatan().getKegiatan().getId());
            dto.setSourceKegiatanName(detail.getSphKegiatan().getKegiatan().getName());
        }
        if (detail.getSourceKegiatanItem() != null) {
            dto.setSourceKegiatanItemId(detail.getSourceKegiatanItem().getId());
        }
        dto.setDescription(detail.getDescription());
        dto.setQuantity(detail.getQuantity());
        dto.setUnit(detail.getUnit());
        dto.setUnitPrice(detail.getUnitPrice());
        dto.setAmount(detail.getAmount());
        dto.setSortOrder(detail.getSortOrder());
        dto.setItemType(detail.getItemType());
        dto.setIsDeduction(detail.getIsDeduction());
        dto.setNotes(detail.getNotes());
        dto.setCreatedAt(detail.getCreatedAt());
        dto.setUpdatedAt(detail.getUpdatedAt());
        return dto;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(Long invoiceId) {
        this.invoiceId = invoiceId;
    }

    public Long getSourcePenawaranDetailId() {
        return sourcePenawaranDetailId;
    }

    public void setSourcePenawaranDetailId(Long sourcePenawaranDetailId) {
        this.sourcePenawaranDetailId = sourcePenawaranDetailId;
    }

    public Long getSphKegiatanId() {
        return sphKegiatanId;
    }

    public void setSphKegiatanId(Long sphKegiatanId) {
        this.sphKegiatanId = sphKegiatanId;
    }

    public String getSphKegiatanName() {
        return sphKegiatanName;
    }

    public void setSphKegiatanName(String sphKegiatanName) {
        this.sphKegiatanName = sphKegiatanName;
    }

    public Long getSourceKegiatanId() {
        return sourceKegiatanId;
    }

    public void setSourceKegiatanId(Long sourceKegiatanId) {
        this.sourceKegiatanId = sourceKegiatanId;
    }

    public String getSourceKegiatanName() {
        return sourceKegiatanName;
    }

    public void setSourceKegiatanName(String sourceKegiatanName) {
        this.sourceKegiatanName = sourceKegiatanName;
    }

    public Long getSourceKegiatanItemId() {
        return sourceKegiatanItemId;
    }

    public void setSourceKegiatanItemId(Long sourceKegiatanItemId) {
        this.sourceKegiatanItemId = sourceKegiatanItemId;
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

    public com.andara.erp.entity.InvoiceItemType getItemType() {
        return itemType;
    }

    public void setItemType(com.andara.erp.entity.InvoiceItemType itemType) {
        this.itemType = itemType;
    }

    public Boolean getIsDeduction() {
        return isDeduction;
    }

    public void setIsDeduction(Boolean isDeduction) {
        this.isDeduction = isDeduction;
    }

    public Long getSourcePenawaranId() {
        return sourcePenawaranId;
    }

    public void setSourcePenawaranId(Long sourcePenawaranId) {
        this.sourcePenawaranId = sourcePenawaranId;
    }

    public String getSourcePenawaranNumber() {
        return sourcePenawaranNumber;
    }

    public void setSourcePenawaranNumber(String sourcePenawaranNumber) {
        this.sourcePenawaranNumber = sourcePenawaranNumber;
    }
}

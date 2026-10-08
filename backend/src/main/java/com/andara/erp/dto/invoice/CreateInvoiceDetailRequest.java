package com.andara.erp.dto.invoice;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class CreateInvoiceDetailRequest {

    private Long sourcePenawaranDetailId;
    private Long sourcePenawaranId;
    private Long sphKegiatanId;
    private Long sourceKegiatanId;
    private Long sourceKegiatanItemId;

    @NotBlank(message = "Deskripsi item faktur wajib diisi")
    private String description;

    @NotNull(message = "Jumlah (kuantitas) wajib diisi")
    @DecimalMin(value = "0.01", message = "Jumlah minimal 0.01")
    private BigDecimal quantity;

    @NotBlank(message = "Satuan unit wajib diisi")
    private String unit;

    @NotNull(message = "Harga satuan wajib diisi")
    @DecimalMin(value = "0.00", message = "Harga satuan tidak boleh negatif")
    private BigDecimal unitPrice;

    private Integer sortOrder = 0;
    private com.andara.erp.entity.InvoiceItemType itemType = com.andara.erp.entity.InvoiceItemType.STANDARD;
    private Boolean isDeduction = false;
    private String notes;

    public CreateInvoiceDetailRequest() {
    }

    public CreateInvoiceDetailRequest(String description, BigDecimal quantity, String unit, BigDecimal unitPrice) {
        this.description = description;
        this.quantity = quantity;
        this.unit = unit;
        this.unitPrice = unitPrice;
        this.itemType = com.andara.erp.entity.InvoiceItemType.STANDARD;
        this.isDeduction = false;
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

    public Long getSourceKegiatanId() {
        return sourceKegiatanId;
    }

    public void setSourceKegiatanId(Long sourceKegiatanId) {
        this.sourceKegiatanId = sourceKegiatanId;
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

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public com.andara.erp.entity.InvoiceItemType getItemType() {
        return itemType;
    }

    public void setItemType(com.andara.erp.entity.InvoiceItemType itemType) {
        this.itemType = itemType != null ? itemType : com.andara.erp.entity.InvoiceItemType.STANDARD;
    }

    public Boolean getIsDeduction() {
        return isDeduction;
    }

    public void setIsDeduction(Boolean isDeduction) {
        this.isDeduction = isDeduction != null ? isDeduction : false;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Long getSourcePenawaranId() {
        return sourcePenawaranId;
    }

    public void setSourcePenawaranId(Long sourcePenawaranId) {
        this.sourcePenawaranId = sourcePenawaranId;
    }
}

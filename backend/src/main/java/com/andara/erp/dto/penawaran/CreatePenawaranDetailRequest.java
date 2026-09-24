package com.andara.erp.dto.penawaran;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class CreatePenawaranDetailRequest {

    private Long kegiatanId;
    private Long kegiatanItemId;

    @NotBlank(message = "Deskripsi item penawaran wajib diisi")
    private String description;

    @NotNull(message = "Volume wajib diisi")
    @DecimalMin(value = "0.01", message = "Volume minimal 0.01")
    private BigDecimal volume;

    @NotBlank(message = "Satuan unit wajib diisi")
    private String unit;

    @NotNull(message = "Harga satuan wajib diisi")
    @DecimalMin(value = "0.00", message = "Harga satuan tidak boleh negatif")
    private BigDecimal unitPrice;

    private Integer sortOrder = 0;
    private String notes;

    public CreatePenawaranDetailRequest() {
    }

    public CreatePenawaranDetailRequest(String description, BigDecimal volume, String unit, BigDecimal unitPrice) {
        this.description = description;
        this.volume = volume;
        this.unit = unit;
        this.unitPrice = unitPrice;
    }

    public Long getKegiatanId() {
        return kegiatanId;
    }

    public void setKegiatanId(Long kegiatanId) {
        this.kegiatanId = kegiatanId;
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

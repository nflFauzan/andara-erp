package com.andara.erp.dto.itemcatalog;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class CreateItemCatalogRequest {

    @Size(max = 50, message = "Kode item maksimal 50 karakter")
    private String code;

    @NotBlank(message = "Nama item / uraian pekerjaan wajib diisi")
    @Size(max = 500, message = "Nama item maksimal 500 karakter")
    private String name;

    @NotBlank(message = "Satuan default wajib diisi (misal: m2, m1, unit, bh, ls)")
    @Size(max = 50, message = "Satuan default maksimal 50 karakter")
    private String defaultUnit;

    @NotNull(message = "Harga default wajib diisi")
    @DecimalMin(value = "0.00", message = "Harga default tidak boleh negatif")
    private BigDecimal defaultPrice = BigDecimal.ZERO;

    @Size(max = 100, message = "Kategori maksimal 100 karakter")
    private String category;

    private String description;

    public CreateItemCatalogRequest() {
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDefaultUnit() {
        return defaultUnit;
    }

    public void setDefaultUnit(String defaultUnit) {
        this.defaultUnit = defaultUnit;
    }

    public BigDecimal getDefaultPrice() {
        return defaultPrice;
    }

    public void setDefaultPrice(BigDecimal defaultPrice) {
        this.defaultPrice = defaultPrice;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}

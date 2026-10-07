package com.andara.erp.entity;

import java.math.BigDecimal;

public enum TaxPpnType {
    NONE("Bebas / Tanpa PPN", BigDecimal.ZERO),
    INCLUDE("Termasuk PPN 11%", new BigDecimal("11.00")),
    EXCLUDE_11("PPN 11% (Tambahan/Exclude)", new BigDecimal("11.00")),
    EXCLUDE_12("PPN 12% (Tambahan/Exclude)", new BigDecimal("12.00"));

    private final String label;
    private final BigDecimal defaultRate;

    TaxPpnType(String label, BigDecimal defaultRate) {
        this.label = label;
        this.defaultRate = defaultRate;
    }

    public String getLabel() {
        return label;
    }

    public BigDecimal getDefaultRate() {
        return defaultRate;
    }
}

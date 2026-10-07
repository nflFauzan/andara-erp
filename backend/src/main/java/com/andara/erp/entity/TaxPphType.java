package com.andara.erp.entity;

import java.math.BigDecimal;

public enum TaxPphType {
    NONE("Tanpa PPh", BigDecimal.ZERO),
    PPH23_2("PPh 23 (2%)", new BigDecimal("2.00")),
    PPH_FINAL_KONSTRUKSI_1_75("PPh Final Konstruksi (1.75%)", new BigDecimal("1.75")),
    PPH_FINAL_KONSTRUKSI_2_65("PPh Final Konstruksi (2.65%)", new BigDecimal("2.65"));

    private final String label;
    private final BigDecimal defaultRate;

    TaxPphType(String label, BigDecimal defaultRate) {
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

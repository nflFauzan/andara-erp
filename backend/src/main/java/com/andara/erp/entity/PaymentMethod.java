package com.andara.erp.entity;

public enum PaymentMethod {
    BANK_TRANSFER("Transfer Bank"),
    CASH("Tunai"),
    GIRO("Giro / Cek"),
    OTHER("Lainnya");

    private final String label;

    PaymentMethod(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}

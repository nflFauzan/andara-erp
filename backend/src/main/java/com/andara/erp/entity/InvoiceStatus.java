package com.andara.erp.entity;

public enum InvoiceStatus {
    DRAFT("Draft"),
    ISSUED("Diterbitkan"),
    CANCELLED("Dibatalkan");

    private final String label;

    InvoiceStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}

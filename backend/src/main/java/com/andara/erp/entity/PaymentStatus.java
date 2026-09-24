package com.andara.erp.entity;

public enum PaymentStatus {
    CONFIRMED("Dikonfirmasi"),
    CANCELLED("Dibatalkan");

    private final String label;

    PaymentStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}

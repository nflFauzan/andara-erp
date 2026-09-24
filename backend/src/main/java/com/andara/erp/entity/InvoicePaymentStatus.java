package com.andara.erp.entity;

public enum InvoicePaymentStatus {
    UNPAID("Belum Bayar"),
    PARTIAL("Sebagian Dibayar"),
    PAID("Lunas");

    private final String label;

    InvoicePaymentStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}

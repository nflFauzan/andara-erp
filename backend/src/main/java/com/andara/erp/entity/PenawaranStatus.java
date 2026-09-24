package com.andara.erp.entity;

public enum PenawaranStatus {
    DRAFT("Draft"),
    SENT("Diajukan / Terkirim"),
    APPROVED("Disetujui / Diterima"),
    REJECTED("Ditolak"),
    CANCELLED("Dibatalkan");

    private final String label;

    PenawaranStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}

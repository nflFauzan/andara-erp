package com.andara.erp.entity;

/**
 * Klasifikasi tipe baris rincian faktur penjualan:
 * - STANDARD: Item pekerjaan, pengadaan, atau paket termin normal.
 * - DP_DEDUCTION: Baris pengurang pemotongan Uang Muka (DP) yang telah dibayar sebelumnya.
 * - RETENTION_DEDUCTION: Baris pengurang pemotongan retensi garansi masa pemeliharaan (Fase 3).
 */
public enum InvoiceItemType {
    STANDARD("Standard Item"),
    DP_DEDUCTION("Potongan Uang Muka (DP)"),
    RETENTION_DEDUCTION("Potongan Retensi Pemeliharaan");

    private final String label;

    InvoiceItemType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}

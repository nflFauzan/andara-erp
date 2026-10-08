package com.andara.erp.entity;

/**
 * Mode penagihan faktur penjualan:
 * - ITEM_VOLUME: Penagihan berbasis rincian volume/kuantitas item fisik (default).
 * - PERCENTAGE_TERMIN: Penagihan bertahap berbasis persentase kontrak proyek SPH (DP 30%, Termin I 40%, dst).
 */
public enum BillingMode {
    ITEM_VOLUME("Penagihan Kuantitas Fisik"),
    PERCENTAGE_TERMIN("Penagihan Termin Proyek (%)");

    private final String label;

    BillingMode(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}

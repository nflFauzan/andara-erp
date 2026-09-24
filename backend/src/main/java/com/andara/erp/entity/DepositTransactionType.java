package com.andara.erp.entity;

public enum DepositTransactionType {
    DEPOSIT_IN("Deposit Masuk (Kelebihan Bayar)"),
    DEPOSIT_USED("Penggunaan Saldo Deposit"),
    DEPOSIT_REFUND("Pengembalian Dana (Refund)"),
    DEPOSIT_ADJUSTMENT("Penyesuaian Resmi (Adjustment)");

    private final String label;

    DepositTransactionType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}

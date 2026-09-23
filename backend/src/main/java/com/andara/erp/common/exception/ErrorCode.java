package com.andara.erp.common.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    // Common
    INTERNAL_SERVER_ERROR("INTERNAL_SERVER_ERROR", "Terjadi kesalahan internal pada server", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_REQUEST("INVALID_REQUEST", "Permintaan tidak valid", HttpStatus.BAD_REQUEST),
    VALIDATION_ERROR("VALIDATION_ERROR", "Data yang dikirim tidak lolos validasi", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED("UNAUTHORIZED", "Sesi telah berakhir atau tidak terautentikasi", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("FORBIDDEN", "Anda tidak memiliki akses untuk tindakan ini", HttpStatus.FORBIDDEN),
    NOT_FOUND("NOT_FOUND", "Sumber daya tidak ditemukan", HttpStatus.NOT_FOUND),
    CONFLICT("CONFLICT", "Terjadi konflik data atau status tidak sesuai", HttpStatus.CONFLICT),

    // Auth & Users
    USER_NOT_FOUND("USER_NOT_FOUND", "Pengguna tidak ditemukan", HttpStatus.NOT_FOUND),
    INVALID_CREDENTIALS("INVALID_CREDENTIALS", "Nama pengguna atau kata sandi salah", HttpStatus.UNAUTHORIZED),
    USER_INACTIVE("USER_INACTIVE", "Akun pengguna tidak aktif", HttpStatus.FORBIDDEN),

    // Customer
    CUSTOMER_NOT_FOUND("CUSTOMER_NOT_FOUND", "Customer tidak ditemukan", HttpStatus.NOT_FOUND),

    // Kegiatan & Items
    KEGIATAN_NOT_FOUND("KEGIATAN_NOT_FOUND", "Kegiatan tidak ditemukan", HttpStatus.NOT_FOUND),
    KEGIATAN_ITEM_NOT_FOUND("KEGIATAN_ITEM_NOT_FOUND", "Item kegiatan tidak ditemukan", HttpStatus.NOT_FOUND),

    // Penawaran & Invoice
    PENAWARAN_NOT_FOUND("PENAWARAN_NOT_FOUND", "Penawaran tidak ditemukan", HttpStatus.NOT_FOUND),
    INVOICE_NOT_FOUND("INVOICE_NOT_FOUND", "Faktur tidak ditemukan", HttpStatus.NOT_FOUND),
    INVOICE_ALREADY_PAID("INVOICE_ALREADY_PAID", "Faktur sudah lunas", HttpStatus.CONFLICT),
    DOUBLE_BILLING_PREVENTED("DOUBLE_BILLING_PREVENTED", "Item atau kegiatan telah ditagihkan sebelumnya", HttpStatus.CONFLICT),

    // Payment & Allocation
    PAYMENT_NOT_FOUND("PAYMENT_NOT_FOUND", "Pembayaran tidak ditemukan", HttpStatus.NOT_FOUND),
    PAYMENT_OVER_ALLOCATED("PAYMENT_OVER_ALLOCATED", "Total alokasi pembayaran melebihi jumlah pembayaran", HttpStatus.CONFLICT),
    DEPOSIT_INSUFFICIENT("DEPOSIT_INSUFFICIENT", "Saldo deposit customer tidak mencukupi", HttpStatus.CONFLICT),
    FINANCIAL_RECORD_LOCKED("FINANCIAL_RECORD_LOCKED", "Dokumen telah terkunci secara finansial dan tidak dapat diubah", HttpStatus.CONFLICT);

    private final String code;
    private final String defaultMessage;
    private final HttpStatus httpStatus;

    ErrorCode(String code, String defaultMessage, HttpStatus httpStatus) {
        this.code = code;
        this.defaultMessage = defaultMessage;
        this.httpStatus = httpStatus;
    }

    public String getCode() {
        return code;
    }

    public String getDefaultMessage() {
        return defaultMessage;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}

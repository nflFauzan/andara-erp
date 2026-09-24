package com.andara.erp.util;

import java.math.BigDecimal;

public final class TerbilangUtil {

    private static final String[] ANGKA = {
            "", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"
    };

    private TerbilangUtil() {
    }

    public static String toTerbilang(BigDecimal amount) {
        if (amount == null) {
            return "Nol Rupiah";
        }
        long nominal = amount.longValue();
        if (nominal == 0) {
            return "Nol Rupiah";
        }
        if (nominal < 0) {
            return "Minus " + konversi(Math.abs(nominal)).trim() + " Rupiah";
        }
        return konversi(nominal).trim() + " Rupiah";
    }

    private static String konversi(long nilai) {
        if (nilai < 12) {
            return " " + ANGKA[(int) nilai];
        } else if (nilai < 20) {
            return konversi(nilai - 10) + " Belas";
        } else if (nilai < 100) {
            return konversi(nilai / 10) + " Puluh" + konversi(nilai % 10);
        } else if (nilai < 200) {
            return " Seratus" + konversi(nilai - 100);
        } else if (nilai < 1000) {
            return konversi(nilai / 100) + " Ratus" + konversi(nilai % 100);
        } else if (nilai < 2000) {
            return " Seribu" + konversi(nilai - 1000);
        } else if (nilai < 1000000) {
            return konversi(nilai / 1000) + " Ribu" + konversi(nilai % 1000);
        } else if (nilai < 1000000000) {
            return konversi(nilai / 1000000) + " Juta" + konversi(nilai % 1000000);
        } else if (nilai < 1000000000000L) {
            return konversi(nilai / 1000000000) + " Miliar" + konversi(nilai % 1000000000);
        } else {
            return konversi(nilai / 1000000000000L) + " Triliun" + konversi(nilai % 1000000000000L);
        }
    }
}

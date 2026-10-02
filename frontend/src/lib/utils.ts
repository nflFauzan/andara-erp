import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return 'Rp 0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Rp 0';
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
  // Pastikan ada spasi setelah "Rp" sesuai format invoice fisik
  return formatted.replace(/^Rp\s*/, 'Rp ');
}

// Alias for formatRupiah for consistent naming
export const formatCurrency = formatRupiah;

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Konversi nominal angka ke terbilang bahasa Indonesia (misal: "Lima Juta Seratus Empat Ribu Rupiah")
 */
export function angkaTerbilang(nominal: number | string | null | undefined): string {
  if (nominal === null || nominal === undefined) return 'Nol Rupiah';
  const val = Math.floor(Math.abs(typeof nominal === 'string' ? parseFloat(nominal) : nominal));
  if (isNaN(val) || val === 0) return 'Nol Rupiah';

  const angka = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

  function toWords(n: number): string {
    if (n < 12) {
      return angka[n];
    } else if (n < 20) {
      return toWords(n - 10) + ' Belas';
    } else if (n < 100) {
      const sisa = n % 10;
      return toWords(Math.floor(n / 10)) + ' Puluh' + (sisa > 0 ? ' ' + toWords(sisa) : '');
    } else if (n < 200) {
      const sisa = n - 100;
      return 'Seratus' + (sisa > 0 ? ' ' + toWords(sisa) : '');
    } else if (n < 1000) {
      const sisa = n % 100;
      return toWords(Math.floor(n / 100)) + ' Ratus' + (sisa > 0 ? ' ' + toWords(sisa) : '');
    } else if (n < 2000) {
      const sisa = n - 1000;
      return 'Seribu' + (sisa > 0 ? ' ' + toWords(sisa) : '');
    } else if (n < 1000000) {
      const sisa = n % 1000;
      return toWords(Math.floor(n / 1000)) + ' Ribu' + (sisa > 0 ? ' ' + toWords(sisa) : '');
    } else if (n < 1000000000) {
      const sisa = n % 1000000;
      return toWords(Math.floor(n / 1000000)) + ' Juta' + (sisa > 0 ? ' ' + toWords(sisa) : '');
    } else if (n < 1000000000000) {
      const sisa = n % 1000000000;
      return toWords(Math.floor(n / 1000000000)) + ' Miliar' + (sisa > 0 ? ' ' + toWords(sisa) : '');
    } else if (n < 1000000000000000) {
      const sisa = n % 1000000000000;
      return toWords(Math.floor(n / 1000000000000)) + ' Triliun' + (sisa > 0 ? ' ' + toWords(sisa) : '');
    }
    return '';
  }

  const result = toWords(val).trim();
  return result ? `${result} Rupiah` : 'Nol Rupiah';
}


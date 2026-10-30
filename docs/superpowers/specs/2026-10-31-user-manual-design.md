# Design Document: Buku Panduan Pengguna (User Manual & Handover Guide) CV. ANDARA

**Tanggal:** 31 Oktober 2026  
**Status:** Menunggu Verifikasi Builder & Persetujuan Klien  
**Pendekatan Terpilih:** Pendekatan 1 — Standar SOP & Kamus Form Lengkap (*Modular SOP & Field Directory*)

---

## 1. Intent and The Why

Sistem Manajemen Operasional & Transaksi CV. ANDARA telah selesai dikembangkan dan siap diserahterimakan (*project handover / BAST*). Untuk memastikan staf operasional, administrator, maupun manajemen CV. ANDARA dapat menggunakan sistem secara mandiri tanpa ketergantungan pada tim pengembang, dibutuhkan sebuah **Buku Panduan Pengguna (*User Manual & Handover Guide*)** resmi dalam format **PDF A4** berkualitas tinggi.

Buku manual ini disusun dengan filosofi **"Kamus Operasional Per Modul"**: ketika pengguna sedang membuka layar tertentu pada aplikasi, mereka dapat langsung membuka bab terkait layaknya sebuah kamus untuk mengetahui:
1. Apa fungsi layar/menu tersebut.
2. Apa arti setiap tombol dan tabel pada layar (dilengkapi tangkapan layar antarmuka dengan nomor pin/lingkaran anotasi ①, ②, ③).
3. Arti dan fungsi setiap kolom isian pada formulir (kamus field: wajib/opsional, tipe data, contoh isian, dan dampaknya pada kalkulasi sistem).
4. Prosedur standar langkah demi langkah (*step-by-step*) untuk menambah data, mengubah data, dan mencetak dokumen resmi.
5. Aturan integritas finansial dan pembatasan hak akses (Role Operator vs Admin).
6. Solusi cepat (*troubleshooting*) jika terjadi kendala atau muncul pesan validasi error.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- Menghasilkan dokumen resmi `docs/Buku_Panduan_Pengguna_CV_ANDARA.pdf` (berukuran A4, tajam, siap cetak/serah terima) dan berkas markdown master `docs/USER_MANUAL.md`.
- Mengotomasi pengambilan tangkapan layar (*screenshots*) beresolusi tinggi (Retina 2x, 1440x900) menggunakan Playwright Chromium dari sistem yang sedang aktif berjalan (`http://localhost:5173`).
- Menyajikan petunjuk langkah demi langkah berbasis tindakan nyata (*click-by-click*) yang terhubung dengan visual anotasi pada tangkapan layar.
- Mengakomodasi 12 bab komprehensif mencakup seluruh siklus: Login & Keamanan Role, Dashboard, Master Customer, Master Kegiatan & Item, SPH, Faktur Penjualan, Pembayaran & Alokasi, Deposit Customer, Kwitansi, Rekapitulasi Laporan, Konfigurasi Penomoran, dan FAQ.
- Menegaskan aturan pembagian role: `OPERATOR` berhak penuh atas kas masuk dan alokasi, sedangkan `ADMIN` dilarang memutasi transaksi pembayaran atau deposit demi kepatuhan finansial.

### Non-Goals
- Tidak mengimplementasikan fitur baru pada aplikasi web (sistem aplikasi sudah selesai dan beroperasi).
- Tidak membuat Visual Print Designer interaktif (fitur ini di luar scope sesuai kesepakatan kontrak & AGENTS.md).
- Tidak mendokumentasikan kode sumber teknis internal backend/frontend secara mendalam (dokumen ini ditujukan untuk pengguna akhir dan manajemen, bukan developer).

### Anti-Goals
- **Anti-Goal 1: Panduan Abstrak/Teoretis.** Dokumen tidak boleh hanya berisi deskripsi umum tanpa instruksi klik nyata.
- **Anti-Goal 2: Screenshot Polos Tanpa Penunjuk.** Gambar antarmuka tidak boleh dibiarkan polos tanpa penomoran/anotasi elemen yang dibahas pada teks panduan.
- **Anti-Goal 3: Mengabaikan Aturan Finansial.** Dokumen tidak boleh memberi instruksi yang melanggar aturan integritas sistem (misal: memanipulasi saldo deposit tanpa transaksi kas, mengedit nilai faktur yang sudah lunas tanpa mekanisme revisi resmi).

---

## 3. Constraints

- **Format Fisik & Digital:** Standar A4 Portrait, margin seimbang 20mm/15mm, tipografi profesional (Inter / sans-serif modern), skema warna resmi CV. ANDARA (Deep Navy `#1E3A8A`, Slate `#334155`, Gold `#D97706`).
- **CSS Paged Media Standards:** Wajib menerapkan `@page` rules, running header kop surat CV. ANDARA, running footer penomoran halaman dinamis (`Halaman X dari Y`), serta pencegahan pemotongan elemen canggung (`break-inside: avoid;` pada tabel, formulir, dan gambar).
- **Keamanan Data:** Screenshot menggunakan data operasional yang relevan dan representatif tanpa mengekspos kredensial rahasia atau kunci API.
- **Reproducibility:** Seluruh proses (generate screenshot + compile PDF) harus dapat dieksekusi ulang secara otomatis melalui satu perintah skrip konsol (`npm run manual:all`).

---

## 4. Approaches & Decision

### Pendekatan yang Dipertimbangkan:
1. **Pendekatan 1: Standar SOP & Kamus Form Lengkap (*SOP & Field Directory*)**  
   Setiap modul memuat: Fungsi & Hak Akses, Anatomi Antarmuka (Screenshot bernomor), Kamus Kolom Formulir (tabel atribut detail), Panduan Langkah demi Langkah (*Click-by-Click*), Aturan Finansial/Bisnis, dan Solusi Error Cepat.
   * *Trade-off:* Dokumen lebih tebal (sekitar 35–45 halaman A4), namun 100% tuntas dan melindungi pengembang saat serah terima.
2. **Pendekatan 2: Lembar Referensi Visual Cepat (*Visual Cheat-Sheet*)**  
   Setiap modul dibatasi tepat 2 halaman (*Two-Page Spread*) yang hanya memuat screenshot besar dan poin-poin alur singkat.
   * *Trade-off:* Ringkas (20–24 halaman), namun tidak menjelaskan arti per kolom formulir atau solusi saat terjadi kendala validasi.

### Keputusan:
**Pendekatan 1 dipilih oleh klien/partner.** Untuk sistem keuangan dan operasional proyek CV. ANDARA, kejelasan setiap kolom formulir dan kepatuhan alur transaksi adalah prioritas utama agar staf tidak salah mencatat tagihan atau uang masuk.

---

## 5. Blueprint Spesifikasi Konten Per Modul (Kamus 12 Bab)

Format standar yang diterapkan secara konsisten pada setiap bab:

```text
[BAB N: NAMA MODUL]
├── 1. Ringkasan & Hak Akses (Siapa yang boleh akses: Operator / Admin)
├── 2. Anatomi Layar (Screenshot Utama dengan Pin Lingkaran ①, ②, ③, ④)
├── 3. Kamus Formulir & Input Data (Tabel Field: Nama, Tipe, Wajib/Opsional, Keterangan)
├── 4. Prosedur Operasional Standar (Langkah demi langkah: Tambah, Cari, Edit, Cetak)
├── 5. Aturan Bisnis & Peringatan Finansial (Critical Guardrails)
└── 6. Tanya Jawab & Solusi Kendala Cepat (FAQ Modul)
```

### Rincian 12 Bab Modul:
1. **Bab 1: Pendahuluan & Autentikasi Pengguna**
   - URL akses sistem (localhost / Cloudflare HTTPS).
   - Hak Akses Role: Matriks wewenang Operator vs Admin.
   - Cara Login, Penanganan Login Gagal, Logout, dan Masa Aktif Sesi.
2. **Bab 2: Navigasi Antarmuka & Dashboard Eksekutif**
   - Tata letak header, toggle dark/light mode, sidebar navigasi.
   - Membaca kartu KPI finansial (Omzet, Piutang Berjalan, Saldo Deposit, Faktur Jatuh Tempo).
   - Status server & konektivitas database.
3. **Bab 3: Manajemen Master Data Customer**
   - Kamus data pelanggan: Nama Perusahaan/Instansi, PIC, Telepon, Email, Alamat, NPWP, Rekening Bank.
   - Langkah input customer baru, pencarian & filter, profil finansial customer (histori proyek, tagihan, dan saldo deposit).
4. **Bab 4: Manajemen Proyek / Kegiatan & Katalog Item**
   - Pembuatan Kegiatan/Proyek baru yang terikat ke Customer.
   - Penambahan rincian item pekerjaan (Volume × Harga Satuan = Subtotal otomatis).
   - Penggunaan katalog item standar pekerjaan lapangan untuk efisiensi input.
5. **Bab 5: Pembuatan & Penerbitan Surat Penawaran Harga (SPH)**
   - Alur penerbitan penawaran dari kegiatan proyek.
   - Pemilihan item pekerjaan, diskon proyek, dan ketentuan pembayaran (termin/DP).
   - Siklus status penawaran: Draft → Diajukan (Sent) → Disetujui (Approved) / Ditolak.
   - Cetak dokumen SPH resmi format A4 (kop surat, tabel harga terstruktur, total terbilang, kolom tanda tangan).
6. **Bab 6: Pembuatan Faktur Penjualan (Invoice) & Penagihan Bertahap**
   - Penerbitan faktur dari SPH yang disetujui (mendukung termin bertahap dan parsial item).
   - Mekanisme anti-double billing (mencegah penagihan ganda atas item yang sama).
   - Potongan Uang Muka (DP) dan retensi pekerjaan.
   - Memahami 3 status pembayaran: `BELUM BAYAR`, `SEBAGIAN DIBAYAR`, dan `LUNAS`.
   - Cetak faktur resmi siap kirim ke klien dengan rekening tujuan dan kode QR.
7. **Bab 7: Pencatatan Pembayaran & Alokasi Pelunasan Faktur**
   - Wewenang eksklusif Role Operator (Admin dilarang memutasi pembayaran).
   - Input penerimaan kas/bank: Tanggal, metode bayar, rekening tujuan, dan bukti transfer.
   - Alokasi dana ke satu atau beberapa faktur aktif.
   - Penanganan pembayaran lebih (*overpayment*): kelebihan dana otomatis masuk ke deposit pelanggan.
8. **Bab 8: Pengelolaan Deposit Pelanggan & Pemotongan Tagihan**
   - Konsep buku kas mutasi (*Deposit Ledger*): `DEPOSIT_IN`, `DEPOSIT_USED`, `DEPOSIT_REFUND`.
   - Cara menggunakan saldo deposit untuk memotong tagihan faktur baru.
   - Prosedur pengembalian dana (*refund*) bila proyek telah selesai.
9. **Bab 9: Penerbitan & Cetak Kwitansi Resmi**
   - Penerbitan tanda terima otomatis dari transaksi pembayaran yang tervalidasi.
   - Nominal otomatis terbilang dalam Bahasa Indonesia.
   - Cetak kwitansi fisik atau unduh PDF ber-KOP resmi.
10. **Bab 10: Rekapitulasi Laporan Keuangan Eksekutif**
    - Filter periode (Bulan, Kuartal, Tahun, Custom Range).
    - Metrik omzet, piutang tertunggak (*aging receivables*), dan arus kas masuk.
    - Ekspor data laporan ke format Excel (.xlsx / CSV) untuk pembukuan akuntansi internal.
11. **Bab 11: Format Penomoran Dokumen Otomatis**
    - Pengaturan pola penomoran: Penawaran, Faktur, Pembayaran, Kwitansi.
    - Variabel pola: `{PREFIX}`, `{YYYY}`, `{MM}`, `{ROMAN_MM}`, `{COUNTER:4}`.
    - Aturan reset nomor berkala (Tahunan / Bulanan) dan proteksi anti-nomor ganda (*concurrency lock*).
12. **Bab 12: Panduan Pemecahan Masalah (FAQ) & Kontak Serah Terima**
    - Kendala umum: lupa password, kendala jaringan, cara koreksi faktur salah input, dan kontak darurat pengembang.

---

## 5.1 Rincian 8 Studi Kasus Nyata di Lapangan (Probabilitas Transaksi Operasional)

Buku panduan ini mengintegrasikan 8 skenario operasional nyata di lapangan ke dalam bab-bab terkait:

1. **Kasus 1: 1 SPH → Banyak Faktur (Penagihan Bertahap: DP, Termin & Parsial Volume)**
   - *Lokasi:* Bab 6 (Faktur Penjualan).
   - *Detail:* Penagihan DP 30% (`billing_mode: 'TERMIN_PERCENTAGE'`), penagihan progres 50% dengan potongan otomatis DP terdahulu (`previous_dp_invoice_id` dan `is_deduction = true`), serta penagihan bertahap berbasis progres volume fisik (`billing_mode: 'ITEM_VOLUME'`).
2. **Kasus 2: Banyak SPH → 1 Faktur (Konsolidasi Multi-SPH Gabungan)**
   - *Lokasi:* Bab 6 (Faktur Penjualan).
   - *Detail:* Penggabungan beberapa penawaran SPH aktif milik 1 pelanggan ke dalam 1 dokumen tagihan faktur tunggal (`V18__multi_sph_invoicing_support`), dengan tracking penagihan presisi per SPH asal (`source_penawaran_id`).
3. **Kasus 3: 1 Pembayaran Transfer → Banyak Faktur Sekaligus (Multi-Invoice Allocation)**
   - *Lokasi:* Bab 7 (Pembayaran & Alokasi).
   - *Detail:* Pelanggan mentransfer dana gelondongan (misal Rp 50 jt) untuk melunasi 3 faktur outstanding berbeda. Cukup 1 kali input bukti bayar, seluruh faktur teralokasi dan otomatis berstatus `LUNAS`.
4. **Kasus 4: 1 Faktur → Banyak Kali Pembayaran (Cicilan / Partial Payment)**
   - *Lokasi:* Bab 7 (Pembayaran) & Bab 9 (Kwitansi).
   - *Detail:* Faktur bernilai besar dicicil beberapa kali. Menjelaskan perubahan status otomatis `BELUM BAYAR` → `SEBAGIAN DIBAYAR` → `LUNAS`, monitoring nilai sisa piutang (*outstanding*), dan penerbitan kwitansi terpisah untuk setiap cicilan.
5. **Kasus 5: Pembayaran Lebih (Overpayment) → Otomatis Saldo Deposit Pelanggan**
   - *Lokasi:* Bab 7 (Pembayaran) & Bab 8 (Deposit).
   - *Detail:* Klien mentransfer dana melebihi nilai tagihan faktur (misal tagihan Rp 38,5 jt, ditransfer Rp 40 jt). Sistem melunasi faktur dan secara otomatis mencatat kelebihan Rp 1,5 jt ke mutasi buku kas `DEPOSIT_IN`.
6. **Kasus 6: Pembayaran Kombinasi (Split Funding: Transfer Bank + Potong Saldo Deposit)**
   - *Lokasi:* Bab 7 (Pembayaran) & Bab 8 (Deposit).
   - *Detail:* Pembayaran faktur baru dengan memadukan kas transfer bank baru ditambah pemotongan saldo deposit mengendap milik pelanggan (`V16__payment_split_funding_and_deposit_usage`), tercatat rapi via mutasi `DEPOSIT_USED`.
7. **Kasus 7: Retensi Konstruksi (Masa Pemeliharaan Proyek 5% Ditagihkan Terpisah)**
   - *Lokasi:* Bab 6 (Faktur Penjualan).
   - *Detail:* Pemotongan retensi 5% dari tagihan utama proyek konstruksi, pencatatan tanggal jatuh tempo retensi (`retention_due_date`), dan penerbitan Faktur Retensi mandiri setelah masa garansi/pemeliharaan selesai (`V17__invoice_retention_tracking`).
8. **Kasus 8: Pekerjaan Tambah/Kurang di Lapangan (Addendum SPH)**
   - *Lokasi:* Bab 5 (SPH) & Bab 6 (Faktur).
   - *Detail:* Penanganan variasi pekerjaan lapangan dengan menerbitkan SPH Addendum berelasi (`V19__sph_addendum_support`), tanpa mengubah atau merusak riwayat penawaran awal.

---

## 6. Pipeline Otomasi & Teknis Kompilasi (What's Left to The Builder)

1. **Skrip Capture Screenshot Playwright (`scripts/manual/capture-screenshots.mjs`):**
   - Menjalankan Chromium headless dengan resolusi 1440x900 (deviceScaleFactor: 2).
   - Otomatisasi sesi login `operator` dan `admin`.
   - Melakukan penelusuran terstruktur ke seluruh halaman, membuka modal input, dan menangkap tampilan cetak print-preview.
   - Menghasilkan file-file PNG di direktori `docs/manual/assets/screenshots/`.
2. **Template Cetak HTML/CSS Paged Media (`docs/manual/template/manual-template.html` & `print.css`):**
   - Menata layout cover depan resmi, lembar pengesahan BAST, daftar isi dinamis, badan dokumen per modul, dan cover belakang.
   - Mengatur styling pin anotasi nomor (badge lingkaran ①, ②, ③ dengan background navy/gold) yang ditempatkan secara terstruktur.
3. **Skrip Kompilasi PDF (`scripts/manual/build-pdf.mjs`):**
   - Membaca file template HTML lokal.
   - Menunggu seluruh elemen gambar siap render (`networkidle`).
   - Memanggil `page.pdf({ path: 'docs/Buku_Panduan_Pengguna_CV_ANDARA.pdf', format: 'A4', printBackground: true, margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' } })`.


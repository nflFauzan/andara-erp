# Rencana Implementasi: Pembuatan Buku Panduan Pengguna (User Manual) PDF Resmi CV. ANDARA dengan Otomasi Screenshot Playwright

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menghasilkan dokumen Buku Panduan Pengguna (*User Manual & Handover Guide*) resmi berstandar profesional dalam format PDF A4 lengkap untuk serah terima proyek Sistem Manajemen Operasional & Transaksi CV. ANDARA, menggunakan tangkapan layar antarmuka nyata beresolusi tinggi yang diambil secara otomatis dengan Playwright.

**Architecture:** Alur pembuatan buku manual dibangun berbasis modular pipeline: (1) Otomasi Playwright untuk navigasi autentikasi, simulasi transaksi, dan pengambilan screenshot beresolusi tinggi (desktop & responsive) yang tersimpan terstruktur; (2) Komposisi konten manual lengkap berbahasa Indonesia berformat Markdown/HTML modular mencakup seluruh siklus operasional bisnis CV. ANDARA; (3) Engine kompilasi Playwright PDF (`page.pdf()`) dengan styling CSS Paged Media profesional (kop surat, palette CV. ANDARA, callout tips/peringatan finansial, penomoran halaman dinamis, daftar isi otomatis, dan bookmarking PDF).

**Tech Stack:** Node.js (v24), Playwright (v1.46+ Chromium headless), HTML5 / CSS3 Paged Media (`@page`, `@bottom-center`, `break-inside: avoid`), Tailwind / Custom Print Design, Markdown, Spring Boot (Backend 8080) & React Vite (Frontend 5173).

**Spec:** [docs/PRD.md](file:///c:/project/andara-erp/docs/PRD.md), [docs/Project_Scope_and_Development_Agreement.md](file:///c:/project/andara-erp/docs/Project_Scope_and_Development_Agreement.md), [AGENTS.md](file:///c:/project/andara-erp/AGENTS.md).

---

## Global Constraints

- **Bahasa Dokumen:** Bahasa Indonesia baku, formal, ramah pengguna non-teknis, dengan istilah bisnis yang konsisten (Customer, Kegiatan, Item Kegiatan, Penawaran/SPH, Faktur Penjualan, Pembayaran, Alokasi Pembayaran, Deposit Customer, Kwitansi, Rekapitulasi).
- **Integritas Aturan Finansial & Role:** Harus menegaskan batasan akses role: Role `OPERATOR` memiliki akses penuh termasuk transaksi pembayaran dan alokasi; Role `ADMIN` memiliki akses operasional namun **dilarang memutasi transaksi pembayaran atau deposit** sesuai [AGENTS.md](file:///c:/project/andara-erp/AGENTS.md#L450).
- **Kualitas Visual & Resolusi:** Seluruh tangkapan layar (screenshots) harus diambil dari aplikasi nyata yang aktif (`http://localhost:5173`) dengan viewport standar (1440x900 atau 1920x1080) pada device scale factor 2 (Retina crisp) tanpa artefak buram.
- **Format Output Dokumen:** PDF A4 standar cetak (*Print Background* aktif, margin seragam 20mm, running header & footer dengan nomor halaman, cover page elegan, dan daftar isi terperinci).
- **Reproducibility:** Seluruh proses pengambilan screenshot dan pembuatan PDF harus dapat dijalankan ulang sewaktu-waktu dengan satu perintah skrip konsol (*one-click build command*).

---

## Review Focus

1. **Kelengkapan Siklus Transaksi End-to-End:** Memastikan tidak ada tahapan terputus dari Customer → Kegiatan → Item → SPH → Faktur → Pembayaran → Alokasi & Excess Deposit → Kwitansi → Rekap.
2. **Penanganan Kasus Khusus Finansial:** Panduan harus menjelaskan dengan gamblang skenario pembayaran sebagian (*partial payment*), pembayaran bertahap/termin, pembayaran lebih (*overpayment* masuk deposit), dan penggunaan saldo deposit untuk memotong tagihan faktur baru.
3. **Pembedaan Hak Akses (Operator vs Admin):** Panduan secara eksplisit menunjukkan visual UI saat login sebagai Operator vs Admin (termasuk status proteksi tombol pembayaran bagi Admin).
4. **Tata Letak & Keterbacaan Cetak PDF:** Memastikan tidak ada pemotongan halaman canggung (*orphaned headers*, tabel terbelah tanpa header pengulang, atau gambar terpotong di tengah halaman).
5. **Kemudahan Pemeliharaan (*Maintainability*):** Teks panduan dipisahkan dari skrip kompilasi sehingga bila ada revisi redaksional di kemudian hari, pemilik sistem atau developer dapat mengedit teks tanpa mengganggu kode.

---

## File Structure

```text
c:\project\andara-erp\
├── docs/
│   ├── USER_MANUAL.md                                # Master dokumentasi manual (Markdown version)
│   ├── Buku_Panduan_Pengguna_CV_ANDARA.pdf           # File output PDF final hasil kompilasi untuk serah terima
│   └── manual/
│       ├── template/
│       │   ├── manual-template.html                  # Template HTML A4 lengkap dengan CSS Paged Media
│       │   └── print.css                             # Styling khusus print PDF, layout, tipografi, callouts
│       └── assets/
│           ├── logo.png                              # Logo resmi CV. ANDARA
│           └── screenshots/                          # Direktori tangkapan layar otomatis dari Playwright
│               ├── 01_login_page.png
│               ├── 02_login_error_validation.png
│               ├── 03_dashboard_operator.png
│               ├── 04_dashboard_admin.png
│               ├── 05_customer_list.png
│               ├── 06_customer_create_modal.png
│               ├── 07_customer_detail_profile.png
│               ├── 08_kegiatan_list.png
│               ├── 09_kegiatan_detail_items.png
│               ├── 10_item_catalog_list.png
│               ├── 11_sph_list.png
│               ├── 12_sph_create_form.png
│               ├── 13_sph_detail_view.png
│               ├── 14_sph_print_preview.png
│               ├── 15_invoice_list.png
│               ├── 16_invoice_create_from_sph.png
│               ├── 17_invoice_detail_view.png
│               ├── 18_invoice_print_preview.png
│               ├── 19_payment_list.png
│               ├── 20_payment_create_form.png
│               ├── 21_payment_allocation_excess.png
│               ├── 22_payment_detail_view.png
│               ├── 23_deposit_ledger_list.png
│               ├── 24_deposit_usage_in_payment.png
│               ├── 25_receipt_list.png
│               ├── 26_receipt_detail_print.png
│               ├── 27_rekap_dashboard_filter.png
│               ├── 28_rekap_export_excel.png
│               └── 29_numbering_settings.png
└── scripts/
    ├── manual/
    │   ├── capture-screenshots.mjs                   # Skrip Playwright untuk login & capture seluruh layar
    │   └── build-pdf.mjs                             # Skrip Playwright Chromium untuk build template ke PDF
    └── package.json                                  # Konfigurasi dependensi otomasi (Playwright)
```

---

## Rincian Modul yang Dicakup dalam User Manual

| Bab | Modul / Topik | Cakupan Bahasan & Tangkapan Layar |
|---|---|---|
| **Bab 1** | **Pendahuluan & Hak Akses** | Spesifikasi sistem, URL login, perbedaan hak akses Operator (Full) vs Admin (Non-kasir), panduan login, validasi keamanan, dan logout. |
| **Bab 2** | **Navigasi & Dashboard** | Navigasi menu sidebar, indikator tema terang/gelap, kartu ringkasan KPI (Omzet, Piutang, Saldo Deposit), indikator status server. |
| **Bab 3** | **Manajemen Customer** | Menambah data pelanggan baru (identitas, kontak, NPWP, alamat), melihat daftar, pencarian, dan halaman profil finansial customer. |
| **Bab 4** | **Kegiatan & Item Pekerjaan** | Input proyek/kegiatan baru, input rincian pekerjaan (volume & satuan), kalkulasi subtotal otomatis, dan pemanfaatan katalog standar harga. |
| **Bab 5** | **Surat Penawaran Harga (SPH)** | Alur pembuatan penawaran dari kegiatan, pemilihan item, penentuan diskon/termin, siklus status SPH (Draft, Sent, Approved), dan cetak PDF resmi bermaterai/tanda tangan. |
| **Bab 6** | **Faktur Penjualan (Invoice)** | Penerbitan faktur dari SPH atau mandiri, penagihan parsial/termin DP (Potongan DP terdahulu), retensi masa garansi 5%, konsolidasi multi-SPH dalam 1 faktur, status otomatis (Belum Bayar, Sebagian, Lunas), dan cetak Invoice siap kirim. |
| **Bab 7** | **Pembayaran & Alokasi Faktur** | Input kas/bank, alokasi pembayaran ke satu atau banyak faktur sekaligus, cicilan/partial payment, split funding (kombinasi transfer bank + potong saldo deposit), unggah bukti bayar, dan pencatatan kelebihan bayar otomatis ke deposit. |
| **Bab 8** | **Deposit Customer & Buku Kas** | Konsep saldo deposit berbasis mutasi ledger (DEPOSIT_IN, DEPOSIT_USED, DEPOSIT_REFUND), tata cara potong deposit untuk faktur baru, dan refund dana. |
| **Bab 9** | **Penerbitan Kwitansi Resmi** | Pembuatan kwitansi tanda terima otomatis setelah pembayaran diverifikasi, nominal terbilang otomatis, kwitansi cicilan per termin, dan cetak fisik/digital. |
| **Bab 10** | **Rekapitulasi & Laporan Eksekutif** | Filter laporan berdasarkan periode tanggal & customer, analisis piutang macet/outstanding, analisis arus kas masuk, dan ekspor laporan ke Excel/CSV. |
| **Bab 11** | **Konfigurasi Penomoran Dokumen** | Format penomoran dinamis untuk SPH, Faktur, Pembayaran, dan Kwitansi; variabel tag penomoran; aturan reset nomor (tahunan/bulanan). |
| **Bab 12** | **Panduan Pemecahan Masalah (FAQ)** | Prosedur saat lupa password, kendala koneksi server, koreksi salah input faktur/pembayaran, dan kontak bantuan teknis. |

---

## 8 Studi Kasus Nyata di Lapangan yang Diintegrasikan ke Dalam Dokumen

1. **Kasus 1: 1 SPH → Banyak Faktur (Penagihan Bertahap: DP 30%, Termin Progres 50% potong DP, Pelunasan 20%)**
2. **Kasus 2: Banyak SPH → 1 Faktur (Konsolidasi Multi-SPH dalam satu invoice tagihan tunggal)**
3. **Kasus 3: 1 Pembayaran Transfer → Banyak Faktur Sekaligus (Pelunasan Multi-Invoice)**
4. **Kasus 4: 1 Faktur → Banyak Kali Pembayaran (Cicilan bertahap / Partial Payment & Kwitansi per cicilan)**
5. **Kasus 5: Pembayaran Lebih (Overpayment) → Otomatis Masuk Saldo Deposit Customer**
6. **Kasus 6: Pembayaran Kombinasi (Split Funding: Transfer Bank Baru + Potong Saldo Deposit Customer)**
7. **Kasus 7: Retensi Konstruksi (Masa Pemeliharaan Proyek 5% Ditagihkan Terpisah)**
8. **Kasus 8: Pekerjaan Tambah/Kurang di Lapangan (Addendum SPH)**

---

## Tasks

### Task 1: Setup Skrip Otomasi Pengambilan Screenshot dengan Playwright

**Files:**
- Create: `scripts/package.json`
- Create: `scripts/manual/capture-screenshots.mjs`
- Target Output: `docs/manual/assets/screenshots/*.png`

**Interfaces:**
- Consumes: Frontend running on `http://localhost:5173`, Backend running on `http://localhost:8080`, kredensial `operator`/`operator123` dan `admin`/`admin123`.
- Produces: 29+ file gambar PNG beresolusi tajam (device scale 2, retina) yang diberi penamaan konsisten untuk masing-masing bab manual.

- [ ] **Step 1: Inisialisasi dependensi skrip otomasi Playwright**
  Membuat `scripts/package.json` dengan dependensi `playwright` (Chromium engine) dan type module.

- [ ] **Step 2: Menulis skrip penangkapan layar otomatis (`scripts/manual/capture-screenshots.mjs`)**
  Mengimplementasikan fungsi login otomatis, traversal ke seluruh rute halaman, pengisian sampel modal/form, trigger modal print preview, dan penyimpanan screenshot ke `docs/manual/assets/screenshots/`.

- [ ] **Step 3: Menjalankan skrip dan memverifikasi kelengkapan seluruh gambar**
  Menjalankan `node scripts/manual/capture-screenshots.mjs` dan memastikan ke-29 file gambar berhasil digenerate tanpa error rute atau timeout.

- [ ] **Step 4: Commit aset screenshot awal**
  ```bash
  git add scripts/ docs/manual/assets/screenshots/
  git commit -m "chore(manual): add automated playwright screenshot capture script and assets"
  ```

---

### Task 2: Penyusunan Konten Buku Panduan Pengguna (User Manual Master)

**Files:**
- Create: `docs/USER_MANUAL.md`

**Interfaces:**
- Consumes: Persyaratan proses bisnis pada `docs/PRD.md` dan aturan `AGENTS.md`.
- Produces: Dokumen Markdown komprehensif 12 bab lengkap dengan petunjuk langkah demi langkah, callout box, dan referensi tautan gambar.

- [ ] **Step 1: Menulis Bagian Pendahuluan, Ringkasan Eksekutif, dan Hak Akses (Bab 1 - 2)**
  Menyusun panduan login, peran Operator vs Admin, penjelasan antarmuka, indikator KPI dashboard, dan navigasi aplikasi.

- [ ] **Step 2: Menulis Panduan Operasional Proyek & Penawaran (Bab 3 - 5)**
  Menyusun langkah pengelolaan data Customer, Katalog Item, Manajemen Kegiatan/Proyek, kalkulasi volume x harga satuan, serta pembuatan & pencetakan Surat Penawaran Harga (SPH).

- [ ] **Step 3: Menulis Panduan Penagihan, Pembayaran & Deposit (Bab 6 - 9)**
  Menyusun langkah penerbitan Faktur Penjualan (termin/DP/parsial), pencatatan Pembayaran, alokasi ke faktur, penanganan kelebihan dana (*overpayment*) ke deposit, penggunaan saldo deposit, dan pencetakan Kwitansi resmi.

- [ ] **Step 4: Menulis Panduan Rekapitulasi Laporan, Penomoran Dokumen & FAQ (Bab 10 - 12)**
  Menyusun tata cara filter laporan dan ekspor Excel, konfigurasi pola penomoran otomatis dokumen, panduan penanganan kendala umum (FAQ), dan kontak serah terima.

- [ ] **Step 5: Review keterbacaan dan keselarasan istilah bisnis**
  Memverifikasi konsistensi istilah dengan PRD (Customer, Kegiatan, Penawaran, Faktur, Kwitansi, Deposit Ledger).

- [ ] **Step 6: Commit dokumen master user manual**
  ```bash
  git add docs/USER_MANUAL.md
  git commit -m "docs(manual): create comprehensive user manual markdown master document"
  ```

---

### Task 3: Desain Template Dokumen PDF Eksekutif (HTML/CSS Paged Media)

**Files:**
- Create: `docs/manual/template/print.css`
- Create: `docs/manual/template/manual-template.html`

**Interfaces:**
- Consumes: Konten dari `docs/USER_MANUAL.md` dan gambar dari `docs/manual/assets/screenshots/`.
- Produces: Berkas template HTML print-ready yang dioptimalkan untuk rendering PDF Playwright A4.

- [ ] **Step 1: Membuat stylesheet print profesional (`docs/manual/template/print.css`)**
  Mengatur konfigurasi CSS Paged Media:
  - `@page { size: A4 portrait; margin: 20mm 15mm 20mm 15mm; }`
  - Running header (Judul Dokumen & Logo CV. ANDARA) dan running footer (Nomor Halaman dinamis & kerahasiaan).
  - Skema warna elegan (Navy `#1E3A8A`, Slate `#334155`, Gold Accent `#D97706`).
  - Aturan pencegahan potong halaman (`break-inside: avoid;` untuk gambar, callout box, dan tabel).
  - Desain callout khusus: `callout-tip`, `callout-warning` (aturan finansial), dan `callout-info`.

- [ ] **Step 2: Merakit berkas HTML lengkap (`docs/manual/template/manual-template.html`)**
  Menggabungkan struktur:
  1. Halaman Cover Depan Eksklusif (Judul Proyek, Logo CV. ANDARA, Tanggal Serah Terima, Versi Sistem 1.0).
  2. Halaman Lembar Pengesahan & Hak Cipta.
  3. Halaman Daftar Isi Terstruktur dengan nomor halaman.
  4. Isi 12 Bab Dokumen lengkap dengan gambar berskala tajam, badge angka penunjuk langkah, dan tabel keterangan.
  5. Halaman Cover Belakang (Kontak Perusahaan & Informasi Lisensi Sistem).

- [ ] **Step 3: Uji tampilan HTML di browser lokal**
  Membuka template di browser untuk memverifikasi tata letak, proporsi gambar, dan kontras warna.

- [ ] **Step 4: Commit template cetak manual**
  ```bash
  git add docs/manual/template/
  git commit -m "feat(manual): create executive A4 HTML print template and paged media css"
  ```

---

### Task 4: Pembuatan Skrip Kompilator PDF Playwright & Eksekusi Build Final

**Files:**
- Create: `scripts/manual/build-pdf.mjs`
- Target Output: `docs/Buku_Panduan_Pengguna_CV_ANDARA.pdf`

**Interfaces:**
- Consumes: `docs/manual/template/manual-template.html` dan `docs/manual/template/print.css`.
- Produces: `docs/Buku_Panduan_Pengguna_CV_ANDARA.pdf` (berukuran A4, tajam, siap cetak/serah terima).

- [ ] **Step 1: Menulis skrip kompilator Playwright PDF (`scripts/manual/build-pdf.mjs`)**
  Menggunakan Playwright Chromium:
  - `page.goto('file:///' + templatePath)`
  - Menunggu seluruh gambar termuat (`networkidle` & `img.complete`)
  - Eksekusi `page.pdf({ path, format: 'A4', printBackground: true, displayHeaderFooter: false, preferCSSPageSize: true })`
  - Verifikasi ukuran file dan status keberhasilan.

- [ ] **Step 2: Mendaftarkan script npm di `package.json` untuk kemudahan eksekusi**
  Menambahkan alias perintah:
  - `"manual:screenshots": "node scripts/manual/capture-screenshots.mjs"`
  - `"manual:build": "node scripts/manual/build-pdf.mjs"`
  - `"manual:all": "npm run manual:screenshots && npm run manual:build"`

- [ ] **Step 3: Menjalankan proses kompilasi PDF dan verifikasi visual dokumen hasil render**
  Menjalankan perintah kompilasi dan memvalidasi file PDF yang terbentuk:
  - Tidak ada halaman kosong (*blank pages*).
  - Teks dapat diseleksi (*selectable text / vector fonts*).
  - Gambar tajam dan proporsional.
  - Callout aturan finansial tampil jelas dan mencolok.

- [ ] **Step 4: Commit hasil PDF resmi dan pipeline build**
  ```bash
  git add docs/Buku_Panduan_Pengguna_CV_ANDARA.pdf package.json scripts/
  git commit -m "docs(manual): generate official CV. ANDARA user manual PDF via playwright"
  ```

---

## Verifikasi & Kriteria Keberhasilan (Acceptance Criteria)

1. **Kelengkapan Dokumen:** Buku Panduan Pengguna mencakup seluruh modul operasional CV. ANDARA:
   - Login & Keamanan Role (Operator vs Admin)
   - Master Data Customer & Profil Finansial
   - Kegiatan/Proyek & Katalog Rincian Pekerjaan
   - Surat Penawaran Harga (SPH) & Cetak SPH Resmi
   - Faktur Penjualan (Termin, DP, Parsial) & Cetak Faktur
   - Pencatatan Pembayaran, Alokasi Faktur & Bukti Bayar
   - Pengelolaan Deposit Customer & Buku Kas (Ledger)
   - Penerbitan & Cetak Kwitansi Resmi
   - Rekapitulasi Keuangan & Ekspor Excel
   - Pengaturan Penomoran Dokumen Otomatis
   - Panduan Pemecahan Masalah (FAQ) & Kontak Serah Terima
2. **Kualitas Screenshot:** Minimal 25+ tangkapan layar antarmuka nyata beresolusi tinggi, bebas dari teks placeholder yang rusak, dan merefleksikan alur bisnis riil CV. ANDARA.
3. **Format & Estetika PDF:** Dokumen berformat A4 dengan tata letak profesional, tipografi bersih, kop surat CV. ANDARA, penomoran halaman otomatis, dan bebas dari potongan halaman yang tidak rapi.
4. **Otomasi Terintegrasi:** Seluruh alur (capture screenshot + compile PDF) dapat dijalankan ulang secara otomatis via satu perintah terminal kapan pun ada pembaruan fitur.


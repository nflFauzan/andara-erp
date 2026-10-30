# BUKU PANDUAN PENGGUNA (USER MANUAL & HANDOVER GUIDE)
## SISTEM MANAJEMEN OPERASIONAL & TRANSAKSI CV. ANDARA
**Versi:** 1.0 Final — **Tahun Rilis:** 2026  
**Dokumen Serah Terima Resmi (BAST):** Panduan Operasional Staf & Manajemen  
**Alamat Sistem Produksi:** [https://cvandaraerp.web.id](https://cvandaraerp.web.id)

---

# LEMBAR PENGESAHAN DOKUMEN

Buku Panduan Pengguna ini disusun sebagai bagian tak terpisahkan dari Berita Acara Serah Terima (BAST) pekerjaan pengembangan perangkat lunak **Sistem Manajemen Operasional & Transaksi CV. ANDARA**. Dokumen ini menjadi rujukan baku operasional (*Standard Operating Procedure / SOP*) bagi seluruh jajaran manajemen, staf operator keuangan, dan administrator lapangan.

| Pihak Pengembang | Pihak Pemilik Sistem / Klien |
| :--- | :--- |
| **Tim Pengembang Perangkat Lunak** | **Manajemen CV. ANDARA** |
| Tanda Tangan: ____________________ | Tanda Tangan: ____________________ |
| Tanggal: 31 Oktober 2026 | Tanggal: 31 Oktober 2026 |

---

# DAFTAR ISI

- [Bab 1: Pendahuluan, Hak Akses & Autentikasi Pengguna](#bab-1-pendahuluan-hak-akses--autentikasi-pengguna)
- [Bab 2: Navigasi Antarmuka & Dashboard Eksekutif](#bab-2-navigasi-antarmuka--dashboard-eksekutif)
- [Bab 3: Manajemen Master Data Customer (Pelanggan)](#bab-3-manajemen-master-data-customer-pelanggan)
- [Bab 4: Manajemen Kegiatan/Proyek & Katalog Item Pekerjaan](#bab-4-manajemen-kegiatanproyek--katalog-item-pekerjaan)
- [Bab 5: Pembuatan & Pengelolaan Surat Penawaran Harga (SPH)](#bab-5-pembuatan--pengelolaan-surat-penawaran-harga-sph)
- [Bab 6: Pembuatan Faktur Penjualan (Invoice) & Penagihan Bertahap](#bab-6-pembuatan-faktur-penjualan-invoice--penagihan-bertahap)
- [Bab 7: Pencatatan Pembayaran Masuk & Alokasi Pelunasan Faktur](#bab-7-pencatatan-pembayaran-masuk--alokasi-pelunasan-faktur)
- [Bab 8: Pengelolaan Deposit Pelanggan & Buku Kas (Ledger)](#bab-8-pengelolaan-deposit-pelanggan--buku-kas-ledger)
- [Bab 9: Penerbitan & Cetak Kwitansi Resmi](#bab-9-penerbitan--cetak-kwitansi-resmi)
- [Bab 10: Rekapitulasi Laporan Keuangan Eksekutif & Ekspor Excel](#bab-10-rekapitulasi-laporan-keuangan-eksekutif--ekspor-excel)
- [Bab 11: Konfigurasi Format Penomoran Dokumen Otomatis](#bab-11-konfigurasi-format-penomoran-dokumen-otomatis)
- [Bab 12: Panduan Pemecahan Masalah (Troubleshooting & FAQ)](#bab-12-panduan-pemecahan-masalah-troubleshooting--faq)
- [Lampiran Khusus: Ringkasan 8 Studi Kasus Transaksi Riil Lapangan](#lampiran-khusus-ringkasan-8-studi-kasus-transaksi-riil-lapangan)

---

# Bab 1: Pendahuluan, Hak Akses & Autentikasi Pengguna

### 1.1 Ringkasan & Hak Akses
Sistem Manajemen Operasional & Transaksi CV. ANDARA dibangun untuk mendigitalisasi dan mengotomasi tata kelola proyek lapangan, penawaran harga, penagihan invoice, pelunasan kas bank, serta pemantauan deposit pelanggan secara real-time.

Akses sistem diatur menggunakan **Role-Based Access Control (RBAC)** dengan 2 level hak akses utama:
1. **OPERATOR (Staff Operator Keuangan):**
   - Memiliki wewenang **penuh (Full Access)** ke seluruh modul sistem.
   - Wewenang eksklusif: Mencatat kas/bank masuk, memvalidasi bukti transfer, mengalokasikan pembayaran ke faktur, mencairkan/memotong saldo deposit pelanggan, dan membatalkan transaksi keuangan bila diperlukan.
2. **ADMIN (Administrator Operasional):**
   - Memiliki wewenang operasional penuh untuk Master Customer, Master Kegiatan, Item Pekerjaan, Penawaran SPH, Faktur Penjualan, serta melihat Kwitansi dan Rekapitulasi.
   - **Batasan Ketat Finansial:** Sesuai tata kelola sistem (AGENTS.md Bagian 11 & Dokumen PRD), Admin **dilarang keras** menambah, mengedit, menghapus, atau memutasi transaksi pembayaran kas/bank dan saldo deposit. Modul pembayaran akan tampil dalam mode *Read-Only* bagi Admin.

---

### 1.2 Anatomi Layar Login

![Tampilan Form Login CV. ANDARA](manual/assets/screenshots/01_login_page.png)  
*Gambar 1.1: Layar Autentikasi Utama CV. ANDARA*

**Elemen-Elemen Utama Layar Login:**
- **① Tombol Toggle Tema (Kanan Atas):** Beralih antara tema gelap (*dark mode*) dan tema terang (*light mode*).
- **② Input Nama Pengguna (*Username*):** Kotak isian untuk username akun yang terdaftar (`operator` atau `admin`).
- **③ Input Kata Sandi (*Password*):** Kotak isian password dengan tombol ikon mata untuk melihat/menyembunyikan teks sandi.
- **④ Tombol "Masuk ke Sistem":** Tombol eksekusi login dengan indikator loading animasi saat memvalidasi sesi ke server.

---

### 1.3 Kamus Formulir Login

| Nama Kolom / Input | Sifat | Tipe Data | Keterangan & Aturan Validasi |
| :--- | :--- | :--- | :--- |
| **Nama Pengguna** | Wajib | Teks (Alphanumeric) | Username terdaftar. Tidak boleh kosong. Case-sensitive. |
| **Kata Sandi** | Wajib | Password (Masked) | Password akun. Minimal 6 karakter. Diacak aman dengan hash bcrypt di database. |

---

### 1.4 Prosedur Operasional Standar (SOP Login & Logout)

#### A. Langkah Masuk ke Sistem (Login):
1. Buka browser web (Google Chrome, Microsoft Edge, atau Safari) pada laptop atau komputer Anda.
2. Masukkan alamat resmi sistem: `https://cvandaraerp.web.id` (atau `http://localhost:5173` pada server lokal).
3. Halaman login resmi CV. ANDARA akan muncul di layar.
4. Masukkan **Nama Pengguna** Anda pada kolom yang disediakan.
5. Masukkan **Kata Sandi** Anda dengan teliti.
6. Klik tombol biru **"Masuk ke Sistem"**.
7. Sistem akan memverifikasi kredensial Anda dalam 1 detik dan langsung mengarahkan Anda ke **Dashboard Utama**.

#### B. Langkah Keluar dari Sistem (Logout):
1. Arahkan kursor ke sudut kiri bawah layar (pada sidebar navigasi) atau di pojok kanan atas layar.
2. Klik tombol merah **"Keluar dari Sistem"** (ikon pintu keluar).
3. Sesi Anda akan ditutup secara aman dan Anda dikembalikan ke halaman login.

---

### 1.5 Validasi Keamanan & Error Handling

![Validasi Form Login](manual/assets/screenshots/02_login_error_validation.png)  
*Gambar 1.2: Respon Sistem jika Kredensial Tidak Diisi atau Salah*

> [!WARNING]
> **Aturan Keamanan Sesi:**
> Jika Anda memasukkan username atau password yang salah, sistem akan menampilkan pesan peringatan merah: *"Nama pengguna atau kata sandi salah"*. Demi keamanan kas perusahaan, jangan pernah memberikan kredensial akun Operator Anda kepada pihak yang tidak berwenang.

---

# Bab 2: Navigasi Antarmuka & Dashboard Eksekutif

### 2.1 Ringkasan & Hak Akses
Dashboard Utama adalah pusat kendali eksekutif yang menyajikan rangkuman metrik finansial, pergerakan omzet, saldo piutang berjalan, dan kesehatan koneksi server. Dashboard dapat diakses oleh Operator maupun Admin.

---

### 2.2 Anatomi Layar Dashboard Operator

![Dashboard Utama Operator](manual/assets/screenshots/03_dashboard_operator.png)  
*Gambar 2.1: Tampilan Dashboard Eksekutif Role Operator*

![Detail Metrik Finansial Dashboard](manual/assets/screenshots/04_dashboard_metrics_detail.png)  
*Gambar 2.2: Rincian Kartu KPI Keuangan dan Saldo Kas*

**Bagian-Bagian Antarmuka Dashboard:**
- **① Sidebar Navigasi Kiri:** Berisi menu terstruktur yang dikelompokkan:
  - *Ringkasan:* Dashboard Utama.
  - *Penjualan & Proyek:* Kegiatan & Proyek, Penawaran (SPH), Faktur Penjualan.
  - *Kas & Keuangan:* Pembayaran Masuk (Operator), Deposit Customer, Kwitansi Resmi.
  - *Data Master:* Data Pelanggan, Katalog Item & Tarif.
  - *Laporan & Sistem:* Rekap Keuangan, Format Nomor Surat, Status Server.
- **② Kartu KPI Total Omzet Penjualan:** Menampilkan akumulasi nilai faktur yang telah diterbitkan pada tahun berjalan.
- **③ Kartu KPI Total Kas/Bank Diterima:** Menampilkan total uang riil yang sudah masuk ke rekening CV. ANDARA.
- **④ Kartu KPI Total Sisa Piutang (Outstanding):** Menampilkan sisa uang perusahaan yang masih berada di tangan klien dan belum dibayarkan.
- **⑤ Kartu KPI Saldo Deposit Pelanggan:** Menampilkan total dana titipan/kelebihan bayar milik klien yang mengendap aman di CV. ANDARA.
- **⑥ Grafik Performa Bulanan & Tabel Transaksi Terkini:** Memvisualisasikan tren kas masuk versus nilai invoice per bulan.

---

### 2.3 Perbandingan Tampilan Menu: Operator vs Admin

| Menu Antarmuka | Role OPERATOR | Role ADMIN | Catatan Kepatuhan |
| :--- | :---: | :---: | :--- |
| **Data Pelanggan & Katalog** | Akses Penuh | Akses Penuh | Bebas kelola mitra & tarif |
| **Kegiatan & Item Proyek** | Akses Penuh | Akses Penuh | Bebas kelola proyek lapangan |
| **Surat Penawaran Harga (SPH)**| Akses Penuh | Akses Penuh | Buat & cetak penawaran |
| **Faktur Penjualan (Invoice)** | Akses Penuh | Akses Penuh | Terbitkan faktur & termin |
| **Pembayaran & Kas Masuk** | **Akses Penuh** | **Read-Only** | **Admin tidak dapat input kas** |
| **Deposit Pelanggan** | **Akses Penuh** | **Read-Only** | **Admin tidak dapat potong deposit** |
| **Cetak Kwitansi & Rekap** | Akses Penuh | Akses Penuh | Admin dapat cetak kwitansi sah |

---

# Bab 3: Manajemen Master Data Customer (Pelanggan)

### 3.1 Ringkasan & Hak Akses
Modul Customer digunakan untuk mencatat identitas lengkap klien, instansi, kontak PIC penanggung jawab, NPWP badan usaha, nomor rekening rekanan, serta melacak riwayat saldo deposit pelanggan. Dapat diakses oleh Operator dan Admin.

---

### 3.2 Anatomi Layar Data Pelanggan

![Daftar Pelanggan](manual/assets/screenshots/05_customer_list.png)  
*Gambar 3.1: Tabel Master Data Pelanggan dengan Pencarian Instan*

**Elemen-Elemen Utama:**
- **① Kolom Pencarian Cepat:** Mencari mitra berdasarkan kode customer, nama perusahaan, nama PIC, atau nomor telepon secara instan tanpa reload halaman.
- **② Tombol "+ Tambah Customer":** Membuka modal pop-up pendaftaran pelanggan baru.
- **③ Kolom Saldo Deposit:** Menampilkan saldo aktif deposit masing-masing pelanggan secara transparan.
- **④ Tombol Aksi "Lihat Detail & Profil":** Membuka kartu rekam jejak lengkap transaksi pelanggan.

---

### 3.3 Formulir Pendaftaran Customer Baru

![Modal Tambah Customer](manual/assets/screenshots/06_customer_create_modal.png)  
*Gambar 3.2: Formulir Pop-up Penambahan Data Pelanggan Baru*

### Kamus Formulir Customer:

| Nama Kolom | Sifat | Contoh Isian | Penjelasan Fungsi |
| :--- | :--- | :--- | :--- |
| **Nama Customer / Instansi** | Wajib | PT. Mahakarya Citra Sejahtera | Nama resmi perusahaan atau instansi pemerintah. |
| **Badan Usaha / Brand** | Opsional | Mahakarya Group | Divisi atau grup perusahaan rekanan. |
| **Nama Kontak PIC** | Wajib | Bambang Wijaya | Nama penanggung jawab operasional di pihak klien. |
| **Nomor Telepon / WA** | Wajib | 021-5551234 / 08123456789 | Nomor kontak aktif untuk koordinasi penagihan & proyek. |
| **Alamat Email** | Opsional | procurement@mahakarya.co.id | Email resmi untuk pengiriman SPH dan Invoice digital. |
| **Alamat Kantor / Domisili** | Wajib | Jl. Sudirman Kav. 28, Jakarta | Alamat lengkap yang akan tercetak resmi di KOP invoice. |
| **Nomor NPWP** | Opsional | 01.234.567.8-012.000 | Nomor Pokok Wajib Pajak untuk keperluan bukti potong pajak. |
| **Rekening Bank Mitra** | Opsional | BCA 1234567890 a.n PT Mahakarya | Rekening asal klien bila sewaktu-waktu ada refund deposit. |

---

### 3.4 Profil Finansial & Riwayat Pelanggan

![Profil Detail Customer](manual/assets/screenshots/07_customer_detail_profile.png)  
*Gambar 3.3: Layar Detail Profil Finansial, Histori Proyek, Tagihan & Saldo Deposit*

Pada halaman detail profil customer, sistem secara otomatis mengagregasi:
1. **Total Omzet Klien:** Akumulasi seluruh proyek yang pernah dikerjakan untuk klien ini.
2. **Total Piutang Berjalan:** Jumlah faktur yang belum lunas.
3. **Kartu Saldo Deposit:** Saldo lebih bayar yang siap dipotongkan pada faktur berikutnya.
4. **Tabel Riwayat Proyek:** Daftar kegiatan yang sedang berjalan atau sudah selesai.

---

# Bab 4: Manajemen Kegiatan/Proyek & Katalog Item Pekerjaan

### 4.1 Ringkasan & Hak Akses
Kegiatan adalah entitas induk untuk rencana kerja lapangan. Setiap kegiatan terikat pada satu Customer dan memiliki rincian item-item pekerjaan dengan volume dan harga satuan.

---

### 4.2 Anatomi Layar Kegiatan & Proyek

![Daftar Kegiatan Proyek](manual/assets/screenshots/08_kegiatan_list.png)  
*Gambar 4.1: Daftar Seluruh Kegiatan & Proyek Pekerjaan Lapangan*

![Detail Item Kegiatan](manual/assets/screenshots/09_kegiatan_detail_items.png)  
*Gambar 4.2: Rincian Item Pekerjaan, Volume Fisik, Satuan, dan Harga Satuan*

---

### 4.3 Menambahkan Item Pekerjaan ke Kegiatan
Setiap item pekerjaan memiliki rumus matematis baku yang dihitung otomatis oleh sistem:

$$\text{Subtotal Item} = \text{Volume} \times \text{Harga Satuan}$$

$$\text{Total Nilai Kegiatan} = \sum \text{Subtotal Item}$$

**Langkah Tambah Item Pekerjaan:**
1. Masuk ke halaman detail kegiatan bersangkutan.
2. Klik tombol **"+ Tambah Item Pekerjaan"**.
3. Pilih opsi: **Pilih dari Katalog Standar** atau **Ketik Kustom Baru**.
4. Masukkan **Volume** (misal: `120`) dan **Satuan** (misal: `m2`, `titik`, `hari`, `ls`).
5. Masukkan **Harga Satuan** (misal: `Rp 350.000`).
6. Subtotal sebesar `Rp 42.000.000` akan terhitung otomatis oleh sistem tanpa risiko salah hitung.
7. Klik **"Simpan Item"**.

---

### 4.4 Katalog Item & Standar Tarif

![Katalog Item dan Tarif](manual/assets/screenshots/10_item_catalog_list.png)  
*Gambar 4.3: Master Katalog Item Pekerjaan & Standar Harga Satuan*

Katalog Item menyimpan database material, sewa alat, dan jasa tukang standar sehingga staf tidak perlu mengetik ulang harga satuan dari nol setiap kali membuat proyek baru.

---

# Bab 5: Pembuatan & Pengelolaan Surat Penawaran Harga (SPH)

### 5.1 Ringkasan & Alur Bisnis SPH
Surat Penawaran Harga (SPH) adalah dokumen formal yang diajukan ke klien sebagai penawaran biaya sebelum pekerjaan dimulai. SPH ditarik langsung dari Kegiatan dan Item pekerjaan yang telah diinput sebelumnya.

---

### 5.2 Anatomi Layar Penawaran (SPH)

![Daftar Dokumen SPH](manual/assets/screenshots/11_sph_list.png)  
*Gambar 5.1: Daftar Dokumen SPH dengan Indikator Status & Filter*

**Siklus Status SPH:**
- **DRAFT:** Penawaran sedang disusun dan belum resmi diajukan ke klien (masih dapat diedit bebas).
- **DIAJUKAN (SENT):** Penawaran telah dikirimkan ke calon pelanggan.
- **DISETUJUI (APPROVED):** Pelanggan menerima penawaran. SPH yang disetujui **dapat langsung diterbitkan menjadi Faktur Penjualan**.
- **DITOLAK (REJECTED):** Pelanggan menolak penawaran.
- **ADDENDUM:** SPH perubahan spesifikasi pekerjaan di lapangan.

---

### 5.3 Formulir Pembuatan SPH Baru

![Form Pembuatan SPH](manual/assets/screenshots/12_sph_create_form.png)  
*Gambar 5.2: Formulir Pembuatan Dokumen SPH dari Data Kegiatan Lapangan*

### Kamus Formulir Pembuatan SPH:

| Nama Kolom / Input | Sifat | Contoh Isian | Penjelasan Fungsi |
| :--- | :--- | :--- | :--- |
| **Nomor SPH** | Otomatis | `Q-AND/2026/10/0002` | Dibuat otomatis oleh generator penomoran sistem. |
| **Tanggal Surat** | Wajib | `2026-10-31` | Tanggal penerbitan surat penawaran. |
| **Customer** | Wajib | PT. Mahakarya Citra Sejahtera | Pilih pelanggan tujuan penawaran dari dropdown. |
| **Kegiatan / Proyek** | Wajib | Renovasi Lantai 12 | Sistem otomatis menampilkan rincian item kegiatan ini. |
| **Pilihan Item Pekerjaan** | Wajib | [Centang Item] | Centang item mana saja yang akan dimasukkan dalam penawaran. |
| **Diskon Penawaran (Rp/%)**| Opsional | `0` atau `5%` | Potongan harga khusus yang disepakati untuk klien. |
| **Masa Berlaku Penawaran**| Wajib | 14 Hari Kalender | Batas waktu validitas harga penawaran. |
| **Syarat Pembayaran** | Wajib | DP 30%, Pelunasan 70% | Ketentuan pembayaran yang disepakati. |

---

### 5.4 Detail SPH & Pratinjau Cetak Formal (Print Preview)

![Detail Dokumen SPH](manual/assets/screenshots/13_sph_detail_view.png)  
*Gambar 5.3: Halaman Detail SPH dengan Rincian Subtotal dan Tombol Aksi*

![Pratinjau Cetak SPH](manual/assets/screenshots/14_sph_print_preview.png)  
*Gambar 5.4: Format Cetak Resmi Surat Penawaran Harga (SPH) KOP CV. ANDARA*

> [!TIP]
> **Cara Mengunduh Dokumen SPH Resmi:**
> Buka halaman detail SPH $\rightarrow$ Klik tombol **"Cetak SPH"** $\rightarrow$ Halaman pratinjau bersih akan tampil lengkap dengan KOP Surat CV. ANDARA, tabel item, nominal terbilang otomatis, dan kolom tanda tangan $\rightarrow$ Tekan `Ctrl + P` untuk mencetak atau pilih opsi **"Save as PDF"** pada browser untuk mengirimkan softcopy ke klien via WhatsApp atau Email.

---

# Bab 6: Pembuatan Faktur Penjualan (Invoice) & Penagihan Bertahap

### 6.1 Ringkasan & Aturan Integritas Finansial
Faktur Penjualan adalah dokumen penagihan berkekuatan hukum kepada pelanggan. Faktur dapat diterbitkan dari SPH yang telah disetujui (*Approved*) maupun dibuat secara mandiri.

**3 Status Pembayaran Faktur (Dihitung Otomatis Berbasis Alokasi Kas):**
1. **`BELUM BAYAR`:** Total pembayaran teralokasi = Rp 0. Sisa piutang = 100% nilai faktur.
2. **`SEBAGIAN DIBAYAR`:** Pembayaran masuk > 0 namun < total nilai faktur. Sisa piutang masih ada.
3. **`LUNAS`:** Total pembayaran teralokasi $\ge$ total nilai faktur. Sisa piutang = Rp 0.

$$\text{Sisa Piutang (Outstanding)} = \max(\text{Total Faktur} - \text{Total Pembayaran Teralokasi}, 0)$$

---

### 6.2 Anatomi Layar Faktur Penjualan

![Daftar Faktur Penjualan](manual/assets/screenshots/15_invoice_list.png)  
*Gambar 6.1: Daftar Faktur Penjualan dengan Tagihan, Terbayar, dan Sisa Piutang*

---

### 6.3 Formulir Pembuatan Faktur Penjualan (Termin & Multi-SPH)

![Form Pembuatan Faktur](manual/assets/screenshots/16_invoice_create_from_sph.png)  
*Gambar 6.2: Formulir Penagihan Faktur dengan Mode Termin DP & Konsolidasi Multi-SPH*

### Kamus Formulir Faktur Penjualan:

| Nama Kolom / Input | Sifat | Contoh Isian | Penjelasan Fungsi |
| :--- | :--- | :--- | :--- |
| **Nomor Faktur** | Otomatis | `INV-AND/2026/10/0003` | Pola nomor unik anti-duplikat. |
| **Customer** | Wajib | CV. Nusa Pratama Mandiri | Pelanggan yang ditagih. |
| **Tanggal Faktur** | Wajib | `2026-10-31` | Tanggal terbit faktur. |
| **Tanggal Jatuh Tempo** | Wajib | `2026-11-14` | Batas akhir pembayaran sebelum dinyatakan menunggak. |
| **Mode Penagihan** | Wajib | `TERMIN_PERCENTAGE` / `ITEM_VOLUME` | Pilihan tagihan berbasis persentase DP/termin atau rincian volume fisik. |
| **Persentase Termin** | Kondisional | `30%` (Uang Muka) | Persentase yang ditagihkan saat memilih mode termin. |
| **Potong DP Terdahulu** | Kondisional | [Pilih Faktur DP Terdahulu] | Otomatis membuat baris potongan (*deduction*) agar uang muka tidak tertagih ulang. |
| **Retensi Pemeliharaan** | Opsional | `5%` | Ditahan untuk masa pemeliharaan proyek konstruksi (tagihan terbit pasca masa garansi). |
| **No. PO / SPK Klien** | Opsional | `PO/NPM/X/2026-88` | Nomor surat perintah kerja dari klien sebagai rujukan penagihan. |

---

### 6.4 Detail Faktur & Pratinjau Cetak Invoice Resmi

![Detail Faktur Penjualan](manual/assets/screenshots/17_invoice_detail_view.png)  
*Gambar 6.3: Rincian Faktur Penjualan Lengkap dengan Histori Pembayaran Teralokasi*

![Pratinjau Cetak Faktur](manual/assets/screenshots/18_invoice_print_preview.png)  
*Gambar 6.4: Dokumen Cetak Invoice Resmi CV. ANDARA Siap Kirim ke Klien*

Faktur cetak memuat:
- Logo resmi & identitas legal CV. ANDARA.
- Nomor rekening bank resmi tujuan transfer (Bank Mandiri / BCA).
- QR code verifikasi keaslian dokumen.
- Rincian pekerjaan, potongan PPh/PPN (jika berlaku), dan total terbilang dalam Rupiah.

---

# Bab 7: Pencatatan Pembayaran Masuk & Alokasi Pelunasan Faktur

### 7.1 Ringkasan & Wewenang Eksklusif Operator
Pencatatan pembayaran merepresentasikan uang riil yang sudah masuk ke rekening bank atau kas CV. ANDARA.
- **Hanya Role OPERATOR yang berwenang mencatat pembayaran.**
- Jika login sebagai Role ADMIN, tombol pencatatan akan terkunci dalam mode *Read-Only* (Lihat Gambar 12.1).

---

### 7.2 Anatomi Layar Pembayaran Masuk

![Daftar Pembayaran Masuk](manual/assets/screenshots/19_payment_list.png)  
*Gambar 7.1: Riwayat Transaksi Kas/Bank Masuk yang Terverifikasi*

---

### 7.3 Formulir Pencatatan Kas Masuk & Alokasi Faktur

![Form Catat Pembayaran](manual/assets/screenshots/20_payment_create_form.png)  
*Gambar 7.2: Formulir Input Penerimaan Dana Kas & Alokasi ke Faktur Outstanding*

![Alokasi Pembayaran dan Deposit](manual/assets/screenshots/21_payment_allocation_excess.png)  
*Gambar 7.3: Otomasi Alokasi Multi-Faktur dan Penanganan Kelebihan Bayar Masuk Deposit*

### Kamus Formulir Pembayaran Masuk:

| Nama Kolom / Input | Sifat | Contoh Isian | Penjelasan Fungsi |
| :--- | :--- | :--- | :--- |
| **Customer** | Wajib | PT. Mahakarya Citra Sejahtera | Pilih pelanggan pembayar; sistem otomatis memuat faktur-faktur aktifnya. |
| **Sumber Dana** | Wajib | Kas/Bank atau Potong Deposit | Pilih apakah pembayaran berasal dari transfer bank baru atau memotong deposit mengendap. |
| **Tanggal Bayar** | Wajib | `2026-10-31` | Tanggal riil uang masuk di rekening koran bank. |
| **Nomor Bukti Transfer**| Wajib | `TRF-BCA-88912` | Nomor referensi mutasi bank dari slip setoran klien. |
| **Total Nominal Uang** | Wajib | `Rp 50.000.000` | Jumlah uang rupiah riil yang diterima. |
| **Unggah Bukti Transfer**| Opsional | Foto/PDF Slip Bank | Berkas lampiran bukti transfer yang tersimpan aman di Cloudflare R2. |
| **Tabel Alokasi Faktur**| Wajib | Diisi per faktur | Nominal alokasi pelunasan untuk setiap faktur yang dipilih. |

> [!IMPORTANT]
> **Aturan Invarian Finansial Sistem:**
> $$\sum \text{Alokasi Pembayaran ke Faktur} \le \text{Nominal Pembayaran Diterima}$$
> Sistem tidak akan pernah mengizinkan over-alokasi (*alokasi melebihi uang yang diterima*). Jika total nominal uang melebihi seluruh sisa tagihan, kelebihan uang tersebut **otomatis masuk ke Saldo Deposit Pelanggan**.

---

### 7.4 Detail Pembayaran & Bukti Pelunasan

![Detail Pembayaran](manual/assets/screenshots/22_payment_detail_view.png)  
*Gambar 7.4: Halaman Detail Pembayaran Lengkap dengan Daftar Faktur yang Terpotong*

---

# Bab 8: Pengelolaan Deposit Pelanggan & Buku Kas (Ledger)

### 8.1 Konsep Mutasi Buku Kas Deposit (*Ledger-Based Balance*)
Sistem CV. ANDARA menerapkan prinsip akuntansi ketat: **Saldo Deposit BUKAN angka bebas yang dapat diketik manual sembarangan.**  
Saldo deposit adalah hasil kumulatif dari mutasi buku kas yang tercatat sah:

$$\text{Saldo Deposit} = \sum \text{DEPOSIT\_IN} - \sum \text{DEPOSIT\_USED} - \sum \text{DEPOSIT\_REFUND} \pm \text{ADJUSTMENT}$$

**3 Jenis Mutasi Deposit:**
1. **`DEPOSIT_IN`:** Uang masuk dari kelebihan pembayaran faktur (*overpayment*) atau setoran deposit proyek di muka.
2. **`DEPOSIT_USED`:** Pemakaian saldo deposit untuk melunasi/memotong tagihan faktur baru.
3. **`DEPOSIT_REFUND`:** Pengembalian sisa saldo deposit kepada pelanggan jika proyek telah tuntas.

---

### 8.2 Anatomi Layar Buku Kas Deposit

![Daftar Buku Kas Deposit](manual/assets/screenshots/23_deposit_ledger_list.png)  
*Gambar 8.1: Buku Kas Mutasi Deposit Customer (Histori Debit/Kredit Lengkap)*

---

### 8.3 Cara Menggunakan Saldo Deposit untuk Membayar Faktur Baru (Split Funding)
Jika pelanggan memiliki saldo deposit mengendap sebesar Rp 200.000.000 dan menerima faktur baru senilai Rp 50.000.000:
1. Masuk ke menu **Pembayaran Masuk** $\rightarrow$ Klik **"+ Catat Pembayaran"**.
2. Pilih Customer bersangkutan.
3. Pada tombol **Sumber Dana**, klik **"Potong Deposit"** (atau kombinasi transfer baru + potong deposit).
4. Masukkan nominal pemakaian deposit: `Rp 50.000.000`.
5. Alokasikan ke faktur baru tersebut $\rightarrow$ Klik **"Simpan & Konfirmasi Pembayaran"**.
6. Faktur langsung berstatus **LUNAS**, dan saldo deposit pelanggan terpotong otomatis menjadi Rp 150.000.000 dengan bukti mutasi `DEPOSIT_USED`.

---

# Bab 9: Penerbitan & Cetak Kwitansi Resmi

### 9.1 Ringkasan & Alur Otomatis
Kwitansi adalah bukti tanda terima pembayaran sah yang diterbitkan oleh CV. ANDARA kepada pembayar.
- **Penerbitan Otomatis:** Setiap kali transaksi pembayaran kas/bank dikonfirmasi oleh Operator, sistem secara otomatis menerbitkan dokumen Kwitansi resmi dengan nomor tanda terima unik.
- **Terbilang Rupiah Otomatis:** Sistem secara otomatis mengonversi angka nominal ke ejaan bahasa Indonesia resmi (contoh: Rp 50.000.000 $\rightarrow$ *"Lima Puluh Juta Rupiah"*).

---

### 9.2 Anatomi Layar Daftar Kwitansi

![Daftar Kwitansi Resmi](manual/assets/screenshots/24_receipt_list.png)  
*Gambar 9.1: Daftar Kwitansi Tanda Terima Resmi CV. ANDARA*

---

### 9.3 Tampilan Cetak Kwitansi Resmi

![Format Cetak Kwitansi](manual/assets/screenshots/25_receipt_detail_print.png)  
*Gambar 9.2: Format Cetak Resmi Kwitansi Pembayaran CV. ANDARA Bermaterai*

Kwitansi mencakup:
- Nomor Kwitansi resmi.
- Nama pembayar (*Telah terima dari*).
- Jumlah uang angka dan kalimat terbilang.
- Untuk pembayaran (*Rincian faktur & proyek*).
- Tempat, tanggal penerbitan, tanda tangan penerima kas, dan stempel digital.

---

# Bab 10: Rekapitulasi Laporan Keuangan Eksekutif & Ekspor Excel

### 10.1 Ringkasan & Hak Akses
Halaman Rekapitulasi menyajikan analisis komprehensif performa keuangan CV. ANDARA dalam rentang waktu yang dapat difilter fleksibel (Bulan Ini, Kuartal Ini, Tahun Berjalan, atau Periode Kustom).

---

### 10.2 Anatomi Layar Rekapitulasi Keuangan

![Laporan Rekapitulasi Keuangan](manual/assets/screenshots/26_rekap_dashboard_filter.png)  
*Gambar 10.1: Layar Rekapitulasi Keuangan dengan Filter Periode & Ekspor Data*

**Metrik Utama yang Disajikan:**
- **Total Tagihan Diterbitkan (Total Invoiced):** Total nilai penjualan bruto.
- **Total Pembayaran Masuk (Realized Cash Flow):** Total uang riil yang sudah masuk kas/bank.
- **Total Piutang Tertunggak (Aging Receivables):** Sisa tagihan yang belum lunas dikelompokkan berdasarkan umur jatuh tempo.
- **Total Saldo Mengendap di Deposit:** Dana titipan pelanggan yang belum terpakai.

---

### 10.3 Prosedur Ekspor Laporan ke Excel / CSV
1. Masuk ke menu **Rekap Keuangan** di sidebar kiri.
2. Tentukan **Rentang Tanggal** (Tanggal Mulai s/d Tanggal Akhir).
3. Pilih filter **Customer** jika ingin melihat rekapitulasi per pelanggan spesifik.
4. Klik tombol hijau **"Ekspor Excel (.xlsx)"** di pojok kanan atas.
5. Browser akan mengunduh berkas spreadsheet yang siap dibuka di Microsoft Excel atau Google Sheets untuk arsip akuntansi dan perpajakan internal.

---

# Bab 11: Konfigurasi Format Penomoran Dokumen Otomatis

### 11.1 Ringkasan Pola Penomoran
Sistem dilengkapi engine penomoran dokumen otomatis berkecepatan tinggi yang menjamin nomor dokumen selalu urut, rapi, dan tidak pernah terduplikasi meskipun diakses bersamaan oleh banyak pengguna (*concurrency lock*).

---

### 11.2 Anatomi Layar Pengaturan Penomoran

![Pengaturan Format Penomoran](manual/assets/screenshots/27_numbering_settings.png)  
*Gambar 11.1: Formulir Pengaturan Format Penomoran Dokumen Otomatis*

### Daftar Variabel Pola Penomoran yang Didukung:

| Variabel Tag | Contoh Hasil | Keterangan |
| :--- | :--- | :--- |
| `{PREFIX}` | `INV-AND` / `Q-AND` | Awalan singkatan jenis dokumen dan nama perusahaan. |
| `{YYYY}` | `2026` | Tahun 4 digit saat dokumen diterbitkan. |
| `{YY}` | `26` | Tahun 2 digit. |
| `{MM}` | `10` | Bulan 2 digit (01 - 12). |
| `{ROMAN_MM}` | `X` | Bulan dalam angka Romawi (I, II, ..., XII). |
| `{COUNTER:4}` | `0001`, `0002` | Nomor urut dokumen dengan 4 digit angka (padding zero). |
| `{COUNTER:5}` | `00001` | Nomor urut dokumen dengan 5 digit angka. |

### Aturan Reset Nomor (*Reset Policy*):
- **YEARLY (Reset Tahunan):** Nomor counter kembali ke `1` setiap pergantian tahun baru (1 Januari). *Sangat direkomendasikan untuk Faktur & SPH.*
- **MONTHLY (Reset Bulanan):** Nomor counter kembali ke `1` setiap tanggal 1 bulan baru.
- **NEVER (Tidak Pernah Reset):** Counter nomor bertambah terus menerus tanpa batas waktu.

---

# Bab 12: Panduan Pemecahan Masalah (Troubleshooting & FAQ)

### 12.1 Status Server & Health Check Sistem

![Status Server dan Health Check](manual/assets/screenshots/28_system_status.png)  
*Gambar 12.1: Layar Pemantauan Kesehatan Server, Database PostgreSQL, dan API*

Jika terjadi kendala lambat atau gagal memuat data, buka menu **Status Koneksi Server** (`/status`). Pastikan indikator:
- Database PostgreSQL: **CONNECTED (Hijau)**
- REST API Server: **ONLINE (Hijau)**
- Cloudflare R2 Storage: **ACTIVE (Hijau)**

---

### 12.2 Tanya Jawab Operasional Sering Ditanyakan (FAQ)

#### Q1: "Mengapa akun Admin tidak bisa mengklik tombol Simpan Pembayaran?"
**Jawaban:** Sesuai regulasi sistem CV. ANDARA & dokumen tata kelola (AGENTS.md Bagian 11), akun Admin dibatasi khusus untuk operasional non-kasir. Pencatatan uang masuk dan pemotongan deposit dilindungi ketat dan hanya dapat dijalankan oleh akun ber-role **OPERATOR**.

![Proteksi Hak Akses Admin](manual/assets/screenshots/30_admin_restricted_payment.png)  
*Gambar 12.2: Banner Peringatan Kepatuhan Finansial saat Admin Membuka Modul Pembayaran*

#### Q2: "Bagaimana jika staf salah memasukkan nominal pembayaran yang sudah terlanjur disimpan?"
**Jawaban:** Sesuai aturan financial locking, data pembayaran yang sudah disetujui tidak boleh diubah angkanya secara diam-diam. Operator yang berwenang harus melakukan prosedur pembatalan (*Void/Cancel Payment*) dengan menyertakan alasan audit, kemudian mencatat kembali pembayaran dengan nominal yang benar.

#### Q3: "Bagaimana jika klien mentransfer uang lebih banyak dari total nilai faktur?"
**Jawaban:** Anda tidak perlu khawatir. Masukkan nominal uang riil yang masuk di bank pada form pembayaran, lalu alokasikan sesuai nilai faktur. Selisih kelebihan bayar (*overpayment*) akan secara otomatis disimpan oleh sistem sebagai **Deposit Customer** dan dapat dilihat pada buku kas deposit klien.

---

# Lampiran Khusus: Ringkasan 8 Studi Kasus Transaksi Riil Lapangan

Berikut adalah panduan praktis untuk 8 skenario transaksi yang paling sering terjadi di lapangan:

### 1. Kasus 1 SPH $\rightarrow$ Banyak Faktur (DP 30%, Progres 50% Potong DP, Pelunasan 20%)
- **Skenario:** Kontrak Rp 100 jt.
- **Faktur 1 (DP 30%):** Pilih mode `TERMIN_PERCENTAGE`, isi 30%. Terbit Faktur DP Rp 30 jt.
- **Faktur 2 (Progres 50%):** Pilih mode `TERMIN_PERCENTAGE`, isi 50%. Centang **Potong DP Terdahulu** $\rightarrow$ pilih Faktur DP terdahulu. Sistem otomatis mengurangi tagihan proporsional agar uang muka tidak tertagih dua kali.
- **Faktur 3 (Pelunasan 20%):** Tagihan sisa 20%.

### 2. Kasus Banyak SPH $\rightarrow$ 1 Faktur (Konsolidasi Multi-SPH Gabungan)
- **Skenario:** Klien punya 3 SPH pekerjaan kecil (SPH-01 Pengecatan, SPH-02 Kanopi, SPH-03 Partisi) dan minta 1 lembar faktur gabungan.
- **Cara Pakai:** Buka form Buat Faktur $\rightarrow$ pilih Customer $\rightarrow$ centang item-item billable dari ketiga SPH tersebut. Terbit 1 nomor invoice tagihan tunggal yang rapi.

### 3. Kasus 1 Pembayaran Transfer $\rightarrow$ Melunasi Banyak Faktur Sekaligus
- **Skenario:** Klien mentransfer 1 kali dana Rp 50 jt untuk membayar 3 faktur terpisah (Rp 10 jt, Rp 15 jt, Rp 25 jt).
- **Cara Pakai:** Buka form Catat Pembayaran $\rightarrow$ masukkan nominal Rp 50 jt $\rightarrow$ isi kolom alokasi pada masing-masing faktur (10 jt, 15 jt, 25 jt). Ketiga faktur otomatis berubah menjadi **LUNAS** secara bersamaan.

### 4. Kasus 1 Faktur $\rightarrow$ Banyak Kali Pembayaran (Cicilan Parsial)
- **Skenario:** Faktur Rp 60 jt dibayar 3 kali (Rp 20 jt, Rp 25 jt, Rp 15 jt).
- **Cara Pakai:** Pembayaran 1 menghasilkan status `SEBAGIAN DIBAYAR` (sisa Rp 40 jt). Pembayaran 2 status tetap `SEBAGIAN DIBAYAR` (sisa Rp 15 jt). Pembayaran 3 melunasi faktur menjadi `LUNAS`. Setiap pembayaran memiliki bukti kwitansi tersendiri.

### 5. Kasus Pembayaran Lebih (Overpayment) $\rightarrow$ Otomatis Masuk Saldo Deposit Pelanggan
- **Skenario:** Tagihan faktur Rp 38,5 jt, ditransfer bulat Rp 40 jt.
- **Cara Pakai:** Operator input Rp 40 jt dan alokasikan Rp 38,5 jt ke faktur. Faktur langsung LUNAS, dan selisih lebih Rp 1,5 jt otomatis masuk ke akun deposit pelanggan via mutasi `DEPOSIT_IN`.

### 6. Kasus Pembayaran Kombinasi (Split Funding: Transfer Bank + Potong Saldo Deposit)
- **Skenario:** Faktur baru Rp 12 jt. Klien punya deposit Rp 2 jt dan mentransfer uang baru Rp 10 jt.
- **Cara Pakai:** Di form pembayaran, input transfer bank Rp 10 jt + centang potong deposit Rp 2 jt. Faktur langsung berstatus LUNAS dan saldo deposit terpotong via mutasi `DEPOSIT_USED`.

### 7. Kasus Retensi Pemeliharaan Konstruksi (5% Ditahan Klien)
- **Skenario:** Kontrak Rp 100 jt dengan retensi 5% (Rp 5 jt) selama masa pemeliharaan 3 bulan.
- **Cara Pakai:** Saat membuat faktur pelunasan, input retensi 5%. Tagihan yang dibayarkan saat ini adalah Rp 95 jt. Setelah masa pemeliharaan 3 bulan usai, operator klik **Terbitkan Faktur Retensi** untuk menagih sisa retensi Rp 5 jt tersebut.

### 8. Kasus Pekerjaan Tambah/Kurang Lapangan (Addendum SPH)
- **Skenario:** Terjadi penambahan volume fisik di tengah proyek.
- **Cara Pakai:** Terbitkan SPH Addendum yang merujuk ke SPH awal tanpa menghapus penawaran lama. Saat pembuatan faktur, item dari SPH awal dan SPH Addendum dapat ditagihkan secara bersamaan.

---

*Dokumen Buku Panduan Pengguna ini disusun secara resmi oleh Tim Pengembang untuk CV. ANDARA. Seluruh hak cipta dilindungi undang-undang.*


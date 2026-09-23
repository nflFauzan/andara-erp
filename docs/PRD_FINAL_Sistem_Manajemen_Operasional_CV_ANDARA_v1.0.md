# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Sistem Manajemen Operasional & Transaksi CV. ANDARA

**Versi:** 1.0 Final
**Status:** Final / Baseline Pengembangan
**Tanggal:** 23 September 2026
**Dokumen:** Product Requirements Document (PRD)
**Proyek:** Sistem Manajemen Operasional & Transaksi CV. ANDARA

---

## 0. Status Dokumen dan Sumber Kebenaran

Dokumen ini merupakan baseline kebutuhan produk untuk implementasi sistem. PRD ini disusun agar kebutuhan bisnis, aturan proses, hak akses, perilaku sistem, dan kriteria penerimaan dapat digunakan langsung sebagai acuan desain, development, testing, UAT, dan handover.

PRD ini mencerminkan ruang lingkup terbaru proyek:

- Nilai total proyek: **Rp9.400.000**.
- Alokasi server + domain tahun awal: **Rp1.400.000**.
- Nilai pengembangan/software: **Rp8.000.000**.
- **Fitur Desain Cetakan / Visual Print Designer tidak termasuk dalam scope.**
- Sistem menggunakan **2 role login: Operator dan Admin**.
- Operator memiliki akses penuh ke fitur sistem.
- Admin memiliki akses ke seluruh fitur kecuali pengelolaan transaksi pembayaran.

Dokumen ini tidak menggantikan dokumen komersial. Untuk komersial, nilai proyek, termin, biaya infrastruktur, dan ketentuan kontraktual tetap merujuk pada **Project Scope & Development Agreement** dan **RAB** versi terbaru yang telah disepakati.

### Prioritas dokumen

| Dokumen | Fungsi | Status |
|---|---|---|
| Project Scope & Development Agreement | Acuan komersial dan batas scope | Source of Truth komersial |
| RAB | Acuan nilai/breakdown biaya | Acuan komersial |
| PRD | Acuan kebutuhan produk dan acceptance | Source of Truth produk |
| Technical & Infrastructure Baseline | Acuan implementasi teknis | Source of Truth teknis |

Apabila ditemukan konflik antar dokumen saat implementasi, konflik harus dicatat dan dikonfirmasi sebelum coding/implementasi dilanjutkan. Developer tidak boleh mengubah aturan bisnis berdasarkan asumsi pribadi.

---

# 1. Ringkasan Produk

## 1.1 Nama Produk

**Sistem Manajemen Operasional & Transaksi CV. ANDARA**

## 1.2 Tujuan Utama

Sistem dibuat untuk membantu CV. ANDARA mengelola data operasional dan transaksi secara terstruktur sehingga proses berikut tidak lagi bergantung pada rekap manual:

1. pengelolaan customer;
2. pengelolaan kegiatan/proyek pekerjaan;
3. pengelolaan item pekerjaan dan nilai transaksi;
4. pembuatan penawaran;
5. pembuatan faktur penjualan;
6. pencatatan pembayaran;
7. alokasi pembayaran terhadap faktur;
8. pengelolaan kelebihan pembayaran sebagai deposit customer;
9. pembuatan kwitansi;
10. monitoring outstanding dan rekap transaksi.

## 1.3 Masalah Bisnis yang Diselesaikan

Sistem harus mengurangi masalah berikut:

- data transaksi tersebar dan sulit ditelusuri;
- total atau rekap membutuhkan perhitungan manual;
- status pembayaran sulit dipantau;
- pembayaran sebagian dan berkali-kali sulit direkonsiliasi;
- kelebihan pembayaran tidak tercatat sebagai saldo customer secara terstruktur;
- data dari penawaran harus diketik ulang saat membuat faktur;
- nomor dokumen tidak konsisten atau membutuhkan pengaturan manual;
- riwayat transaksi sulit ditelusuri kembali.

---

# 2. Visi dan Hasil yang Diharapkan

Setelah sistem digunakan, pengguna harus dapat melihat hubungan transaksi secara jelas:

```text
CUSTOMER
   ↓
KEGIATAN
   ↓
ITEM
   ↓
PENAWARAN
   ↓
FAKTUR PENJUALAN
   ↓
PEMBAYARAN
   ├── pembayaran tepat / kurang
   │       ↓
   │    OUTSTANDING
   │
   └── kelebihan pembayaran
           ↓
      DEPOSIT CUSTOMER
           ↓
      FAKTUR BERIKUTNYA

PEMBAYARAN → KWITANSI

Seluruh data → REKAP & DASHBOARD
```

Hasil utama yang harus tercapai:

- total item, kegiatan, penawaran, dan faktur dihitung otomatis;
- outstanding faktur dapat diketahui tanpa hitung manual;
- pembayaran parsial dan multi-payment dapat direkonsiliasi;
- kelebihan pembayaran menjadi saldo deposit customer;
- deposit dapat digunakan untuk melunasi faktur berikutnya;
- histori dan hubungan antar transaksi dapat ditelusuri;
- nomor dokumen mengikuti konfigurasi penomoran;
- role akses berjalan sesuai hak masing-masing.

---

# 3. Tujuan Produk

## 3.1 Tujuan Fungsional

1. Menyediakan master data customer.
2. Menyediakan pencatatan kegiatan/proyek.
3. Menyediakan item pekerjaan dengan perhitungan volume × harga.
4. Menyediakan penawaran berbasis kegiatan/item.
5. Menyediakan faktur penjualan yang fleksibel.
6. Menyediakan pembayaran manual tanpa payment gateway.
7. Menyediakan payment allocation.
8. Menyediakan deposit customer dari kelebihan pembayaran.
9. Menyediakan kwitansi yang bersumber dari pembayaran.
10. Menyediakan dashboard dan rekap operasional.
11. Menyediakan penomoran transaksi yang dapat dikonfigurasi.
12. Menyediakan upload bukti transaksi.
13. Menjaga integritas dan auditability data keuangan.

## 3.2 Tujuan Non-Fungsional

- mudah digunakan untuk operasional harian;
- data konsisten dan tidak mudah rusak akibat edit sembarangan;
- memiliki kontrol akses berbasis role;
- aman untuk penggunaan melalui browser;
- dapat dijalankan pada infrastruktur VPS yang disepakati;
- memiliki backup database otomatis;
- dapat dipelihara dan dikembangkan tanpa merusak histori transaksi.

---

# 4. Batasan dan Non-Goals

## 4.1 Termasuk Scope

### Master Data
- Customer
- Kegiatan
- Item

### Transaksi
- Penawaran
- Faktur Penjualan
- Pembayaran
- Payment Allocation
- Deposit Customer
- Kwitansi

### Monitoring
- Dashboard
- Rekap transaksi
- Outstanding
- Ringkasan deposit

### Pengaturan
- Penomoran
- Pengguna/role dasar sesuai scope

### Infrastruktur dasar
- deployment production;
- domain;
- VPS;
- object storage untuk file/bukti;
- backup database;
- SSL melalui infrastruktur yang telah ditetapkan.

## 4.2 Tidak Termasuk Scope

Fitur berikut berada di luar baseline proyek ini kecuali dituangkan dalam Change Request terpisah:

- Visual Print Designer / Desain Cetakan;
- editor drag-and-drop untuk layout dokumen;
- payment gateway;
- integrasi marketplace;
- integrasi bank statement/API bank;
- payroll;
- inventory/warehouse penuh;
- akuntansi double-entry penuh/general ledger;
- perpajakan kompleks di luar kebutuhan dokumen transaksi dasar;
- aplikasi mobile native;
- multi-tenant / SaaS untuk banyak perusahaan;
- workflow approval bertingkat yang tidak didefinisikan dalam scope ini;
- integrasi eksternal lain yang belum disepakati.

### Catatan tentang output dokumen

Sistem dapat menyediakan tampilan/keluaran dokumen transaksi menggunakan **template standar/fixed** yang diimplementasikan pada sistem. Pengguna tidak mendapatkan editor layout atau designer untuk mengubah struktur dokumen secara visual.

---

# 5. Pengguna dan Hak Akses

## 5.1 Role

Sistem memiliki 2 role login:

### Operator
Akses penuh ke seluruh modul dan aksi sesuai scope.

### Admin
Dapat mengakses seluruh modul **kecuali fitur pengelolaan Pembayaran**.

## 5.2 Prinsip Permission

Permission diterapkan di frontend dan wajib ditegakkan kembali di backend/API. Menyembunyikan menu saja tidak dianggap sebagai kontrol keamanan.

## 5.3 Matriks Akses

Legenda:

- **Full** = lihat, tambah, ubah, proses, hapus sesuai aturan modul.
- **View/Use** = dapat melihat atau menggunakan fungsi yang tidak mengubah transaksi pembayaran.
- **No Access** = tidak dapat mengakses modul/aksi.

| Modul | Operator | Admin |
|---|---|---|
| Dashboard | Full | Full |
| Customer | Full | Full |
| Kegiatan | Full | Full |
| Item | Full | Full |
| Penawaran | Full | Full |
| Faktur Penjualan | Full | Full |
| Pembayaran | Full | No Access |
| Payment Allocation | Full | No Access |
| Deposit Customer | Full* | View/Use sesuai hak non-pembayaran |
| Kwitansi | Full | Full secara dokumen; sumber pembayaran tidak dapat diedit |
| Rekap | Full | Full |
| Penomoran | Full | Full |
| Manajemen pengguna/akun | sesuai scope deployment | sesuai scope deployment |

`*` Pengelolaan deposit yang mengubah saldo harus diperlakukan sebagai aktivitas finansial dan mengikuti pembatasan pembayaran.

### Aturan tambahan

1. Admin tidak boleh membuat, mengubah, menghapus, membatalkan, atau mengalokasikan transaksi pembayaran.
2. Admin tidak boleh mengubah saldo deposit melalui tindakan finansial.
3. Operator dapat melakukan seluruh proses pembayaran dan alokasi yang diizinkan sistem.
4. Aksi sensitif harus divalidasi lagi di backend berdasarkan role.
5. Penghapusan data finansial permanen sebaiknya dibatasi; histori transaksi harus tetap dapat ditelusuri.

---

# 6. Konsep Data Inti

## 6.1 Customer

Customer adalah pihak yang menjadi pelanggan/penerima pekerjaan atau transaksi.

Informasi minimum:

- ID
- kode customer
- nama customer
- nama instansi/perusahaan (bila ada)
- alamat
- nomor telepon
- email (opsional)
- kontak/PIC (opsional)
- catatan
- status aktif/nonaktif
- created_at
- updated_at

## 6.2 Kegiatan

Kegiatan merepresentasikan pekerjaan/proyek/pekerjaan tertentu milik customer.

Minimum:

- ID
- customer_id
- kode kegiatan
- nama kegiatan
- lokasi
- deskripsi
- catatan
- status kegiatan
- created_at
- updated_at

Satu customer dapat memiliki banyak kegiatan.

## 6.3 Item Kegiatan

Item adalah rincian pekerjaan/barang yang membentuk nilai kegiatan.

Minimum:

- ID
- kegiatan_id
- nama/deskripsi item
- volume
- satuan/unit
- harga satuan
- subtotal otomatis
- urutan
- catatan
- created_at
- updated_at

### Formula

```text
Subtotal Item = Volume × Harga Satuan
Total Kegiatan = Σ Subtotal Item
```

Sistem harus menghitung ulang di server/backend dan tidak menerima total akhir dari frontend sebagai sumber kebenaran.

---

# 7. Modul Customer

## 7.1 Tujuan

Menyediakan master data pelanggan sebagai referensi seluruh transaksi.

## 7.2 Fitur

- list customer;
- search customer;
- filter status;
- tambah customer;
- edit customer;
- nonaktifkan customer;
- lihat detail customer;
- lihat relasi kegiatan;
- lihat relasi penawaran;
- lihat relasi faktur;
- lihat ringkasan pembayaran/outstanding sesuai hak akses;
- lihat saldo deposit customer.

## 7.3 Validasi

- nama customer wajib;
- customer tidak boleh memiliki kode duplikat;
- customer nonaktif tidak boleh dipilih untuk transaksi baru kecuali sistem memberikan override yang terkontrol;
- customer yang sudah memiliki histori transaksi tidak boleh dihapus secara hard delete tanpa mekanisme aman.

---

# 8. Modul Kegiatan

## 8.1 Tujuan

Mengelompokkan pekerjaan berdasarkan customer.

## 8.2 Fitur

- list kegiatan;
- search/filter;
- tambah kegiatan;
- edit kegiatan;
- lihat detail kegiatan;
- tambah/edit/hapus item;
- kalkulasi total otomatis;
- lihat penawaran terkait;
- lihat faktur terkait;
- status kegiatan.

## 8.3 Status Kegiatan

Status minimal yang disarankan:

- Aktif
- Selesai
- Ditutup
- Dibatalkan

Status harus memiliki aturan transisi yang konsisten dan tidak boleh digunakan untuk mengubah histori finansial secara diam-diam.

---

# 9. Modul Item

Item dikelola di dalam kegiatan.

## 9.1 Perilaku

Saat user memasukkan:

- volume;
- unit;
- harga satuan;

sistem menghitung subtotal secara otomatis.

## 9.2 Ketentuan Numerik

- Volume dapat mendukung desimal.
- Harga menggunakan nilai Rupiah non-negatif.
- Subtotal dibulatkan sesuai aturan numerik yang konsisten di seluruh sistem.
- Nilai negatif tidak diizinkan kecuali secara eksplisit digunakan untuk penyesuaian yang memiliki aturan sendiri.

## 9.3 Integritas

Perubahan item dapat memengaruhi penawaran/faktur. Setelah data digunakan untuk dokumen finansial, perubahan tidak boleh merusak histori finansial.

---

# 10. Modul Penawaran

## 10.1 Tujuan

Membuat penawaran kepada customer berdasarkan kegiatan dan item.

## 10.2 Isi Penawaran

Minimum:

- nomor penawaran;
- tanggal;
- customer;
- satu atau lebih kegiatan;
- item per kegiatan;
- volume;
- satuan;
- harga satuan;
- subtotal;
- total per kegiatan;
- total keseluruhan;
- catatan/syarat;
- status penawaran.

## 10.3 Status Penawaran

Minimal:

- Draft
- Diajukan/Terkirim
- Diterima/Disetujui
- Ditolak
- Dibatalkan

Status dapat diperluas bila kebutuhan operasional mengharuskan, tetapi tidak boleh menambah workflow kompleks tanpa persetujuan perubahan scope.

## 10.4 Perhitungan

```text
Item Total = Volume × Harga Satuan
Kegiatan Total = Σ Item Total
Penawaran Total = Σ Kegiatan Total
```

## 10.5 Fitur dari Penawaran ke Faktur

Sistem harus menyediakan proses **Buat Faktur dari Penawaran**.

Ketentuan:

1. user memilih penawaran sumber;
2. sistem menampilkan kegiatan/item/nilai yang tersedia;
3. user dapat memilih nilai/item yang akan difakturkan sesuai kebutuhan yang diperbolehkan;
4. sistem membuat faktur dengan menyalin data transaksi yang dipilih;
5. sumber penawaran harus tetap tercatat di faktur;
6. sistem harus menyimpan berapa bagian dari penawaran/item yang sudah difakturkan;
7. sistem harus mencegah penagihan ganda terhadap bagian yang sama kecuali ada aksi revisi/penyesuaian yang sah;
8. satu penawaran dapat menghasilkan lebih dari satu faktur;
9. faktur juga dapat dibuat tanpa penawaran.

### Contoh

Satu penawaran berisi 10 item. User dapat membuat:

- Faktur 1 untuk sebagian item/nilai;
- Faktur 2 untuk item/nilai berikutnya;
- dan seterusnya,

selama sistem dapat mengetahui bagian mana yang telah ditagihkan.

---

# 11. Modul Faktur Penjualan

## 11.1 Tujuan

Mencatat tagihan resmi kepada customer secara fleksibel.

## 11.2 Prinsip Utama

**Tidak boleh ada asumsi bahwa satu invoice = satu kegiatan atau satu invoice = satu penawaran.**

Faktur harus dapat dibuat berdasarkan kebutuhan penagihan aktual.

## 11.3 Bentuk Faktur

Faktur dapat berasal dari:

1. penawaran;
2. satu kegiatan;
3. beberapa kegiatan;
4. item tertentu;
5. nilai tertentu;
6. transaksi manual/custom yang sah.

## 11.4 Data Minimum

- nomor faktur;
- tanggal faktur;
- customer;
- referensi penawaran (opsional);
- kegiatan/item yang ditagihkan (bila relevan);
- deskripsi tagihan;
- subtotal/detail;
- total faktur;
- catatan;
- status pembayaran;
- created_by;
- created_at;
- updated_at.

## 11.5 Status Pembayaran Faktur

Status pembayaran tidak boleh diinput secara manual sebagai sumber kebenaran.

Sistem menghitung status berdasarkan pembayaran yang dialokasikan.

| Kondisi | Status |
|---|---|
| Total dibayar = 0 | Belum Bayar |
| 0 < Total dibayar < Total faktur | Sebagian Dibayar |
| Total dibayar >= Total faktur | Lunas |

## 11.6 Outstanding

```text
Outstanding = Max(Total Faktur - Total Pembayaran Teralokasi, 0)
```

## 11.7 Validasi

- total faktur > 0;
- customer wajib;
- nomor faktur unik;
- tanggal wajib;
- nilai tidak boleh berubah sembarangan setelah pembayaran masuk;
- perubahan finansial setelah invoicing harus mengikuti aturan revisi/penyesuaian yang aman.

## 11.8 Edit dan Locking

Setelah faktur memiliki pembayaran, data finansial inti harus diperlakukan sebagai locked/controlled.

Perubahan yang mengubah nilai tagihan harus:

- dicegah secara default; atau
- dilakukan melalui mekanisme revisi/adjustment yang tercatat.

Sistem tidak boleh mengubah jumlah faktur secara diam-diam lalu membuat pembayaran historis menjadi tidak konsisten.

---

# 12. Modul Pembayaran

## 12.1 Tujuan

Mencatat pembayaran aktual yang diterima dari customer.

## 12.2 Prinsip

Pembayaran bersifat manual. Tidak ada payment gateway dalam scope.

## 12.3 Data Minimum Pembayaran

- ID pembayaran;
- nomor pembayaran;
- tanggal pembayaran;
- customer;
- nominal pembayaran;
- metode pembayaran;
- rekening/kas tujuan bila diperlukan;
- referensi/deskripsi;
- bukti pembayaran (opsional);
- catatan;
- created_by;
- created_at;
- updated_at.

## 12.4 Metode Pembayaran

Sistem sebaiknya menyediakan pilihan yang umum digunakan seperti:

- transfer bank;
- tunai;
- metode lain yang didefinisikan administrator.

Daftar metode harus bersifat configurable tanpa mengubah inti transaksi.

## 12.5 Multi-Payment

Satu faktur dapat dibayar berkali-kali.

Contoh:

```text
Invoice = Rp50.000.000
Payment 1 = Rp20.000.000
Payment 2 = Rp15.000.000
Payment 3 = Rp15.000.000
Status = Lunas
```

Sistem harus menjumlahkan seluruh pembayaran teralokasi secara otomatis.

---

# 13. Payment Allocation

## 13.1 Tujuan

Memisahkan transaksi pembayaran aktual dari penggunaan pembayaran terhadap faktur tertentu.

Hal ini diperlukan karena pembayaran dapat:

- membayar satu faktur;
- membayar sebagian faktur;
- membayar lebih dari satu faktur;
- menghasilkan kelebihan pembayaran.

## 13.2 Perilaku Dasar

Saat pembayaran diterima:

1. sistem menerima nominal pembayaran;
2. sistem menentukan faktur yang menjadi tujuan;
3. sistem mengalokasikan maksimal sebesar outstanding faktur;
4. jika pembayaran melebihi outstanding, selisih menjadi deposit customer;
5. seluruh alokasi dicatat.

## 13.3 Contoh Kelebihan Pembayaran

```text
Invoice A = Rp50.000.000
Payment   = Rp60.000.000

Alokasi ke Invoice A = Rp50.000.000
Deposit Customer     = Rp10.000.000
```

## 13.4 Contoh Penggunaan Deposit

```text
Deposit awal        = Rp10.000.000
Invoice B           = Rp20.000.000
Cash Payment Baru   = Rp10.000.000
Deposit digunakan   = Rp10.000.000
Outstanding Invoice = Rp0
Deposit akhir       = Rp0
```

## 13.5 Aturan Integritas

- jumlah alokasi tidak boleh melebihi nominal pembayaran;
- penggunaan deposit tidak boleh melebihi saldo deposit;
- alokasi ke faktur tidak boleh melebihi outstanding yang tersedia, kecuali mekanisme adjustment resmi;
- setiap perubahan allocation harus tercatat;
- sistem harus dapat menelusuri sumber setiap nilai pembayaran.

---

# 14. Modul Deposit Customer

## 14.1 Tujuan

Mencatat saldo dana customer yang belum digunakan untuk menyelesaikan faktur tertentu.

## 14.2 Sumber Deposit

Deposit dapat berasal dari:

- kelebihan pembayaran;
- penyesuaian resmi;
- pengembalian/refund yang dikonversi menjadi saldo, bila nanti dibutuhkan dan masuk scope perubahan.

## 14.3 Ledger Deposit

Saldo deposit tidak boleh menjadi angka yang diedit bebas.

Sistem harus menyimpan mutasi:

- deposit masuk;
- deposit digunakan;
- refund/keluar bila tersedia;
- adjustment resmi.

### Formula

```text
Saldo Deposit = Total Deposit Masuk
              - Total Deposit Digunakan
              - Total Refund
              ± Adjustment Resmi
```

## 14.4 Detail Customer

Detail customer harus dapat menampilkan minimal:

- total invoice;
- total pembayaran;
- total outstanding;
- saldo deposit;
- histori transaksi terkait.

## 14.5 Larangan

Tidak diperbolehkan mengubah saldo deposit secara langsung tanpa menghasilkan mutasi/riwayat.

---

# 15. Modul Kwitansi

## 15.1 Tujuan

Menyediakan bukti penerimaan pembayaran berdasarkan transaksi pembayaran yang sudah tercatat.

## 15.2 Prinsip

Kwitansi **bukan transaksi finansial baru**. Kwitansi adalah dokumen turunan dari payment.

## 15.3 Perilaku

- satu payment dapat menghasilkan satu kwitansi;
- nomor kwitansi mengikuti penomoran;
- data nominal/customer/tanggal mengacu pada payment;
- perubahan pada payment tidak boleh membuat kwitansi lama menjadi tidak terlacak;
- jika payment dibatalkan/diubah, status kwitansi terkait harus mengikuti aturan dokumen.

## 15.4 Akses

- Operator dapat mengelola proses kwitansi.
- Admin dapat menggunakan/melihat fungsi kwitansi sesuai batasan bahwa data pembayaran tidak boleh diedit melalui fitur kwitansi.

---

# 16. Modul Dashboard

## 16.1 Tujuan

Memberikan gambaran kondisi operasional dan finansial utama tanpa harus membuka semua transaksi satu per satu.

## 16.2 KPI Minimum

Dashboard minimal menampilkan:

- total customer aktif;
- total kegiatan aktif;
- total penawaran pada periode tertentu;
- total nilai penawaran;
- total invoice;
- total nilai invoice;
- total pembayaran;
- total outstanding;
- total deposit customer;
- invoice yang belum lunas;
- pembayaran terbaru;
- aktivitas/transaksi terbaru.

## 16.3 Filter

Minimal:

- periode/tanggal;
- customer.

Filter tambahan dapat dibuat bila tidak menambah scope secara material.

## 16.4 Prinsip Akurasi

Angka dashboard harus berasal dari query/aggregate data aktual. Tidak boleh ada angka dashboard yang diinput manual.

---

# 17. Modul Rekap

## 17.1 Tujuan

Menyediakan rekap transaksi untuk kebutuhan monitoring dan pengecekan.

## 17.2 Rekap Minimum

### Rekap Customer
- customer;
- jumlah kegiatan;
- jumlah invoice;
- total invoice;
- total pembayaran;
- outstanding;
- deposit.

### Rekap Invoice
- nomor;
- tanggal;
- customer;
- nilai;
- total dibayar;
- outstanding;
- status.

### Rekap Pembayaran
- nomor pembayaran;
- tanggal;
- customer;
- nominal;
- alokasi;
- deposit yang terbentuk/digunakan;
- metode.

### Rekap Kegiatan
- kegiatan;
- customer;
- total nilai kegiatan;
- status;
- jumlah transaksi terkait.

---

# 18. Modul Penomoran

## 18.1 Tujuan

Menyediakan penomoran dokumen transaksi yang fleksibel namun terkontrol.

## 18.2 Jenis Dokumen Minimum

- Penawaran
- Faktur Penjualan
- Pembayaran
- Kwitansi

## 18.3 Komponen

Sistem harus mendukung komponen seperti:

- prefix;
- tahun;
- bulan;
- counter;
- suffix;
- separator sesuai kebutuhan.

## 18.4 Reset Counter

Konfigurasi reset minimal mendukung konsep:

- tidak reset;
- reset tahunan;
- reset bulanan.

Implementasi akhir harus konsisten untuk seluruh dokumen yang mendukung konfigurasi tersebut.

## 18.5 Jumlah Digit Counter

User dapat menentukan panjang counter, misalnya 4 atau 5 digit.

## 18.6 Preview

Halaman penomoran harus memberikan contoh nomor hasil konfigurasi.

Contoh pola:

```text
JKT-[SHORT_YEAR][MONTH][COUNTER]
```

Contoh hasil:

```text
JKT-260900123
```

Contoh di atas bersifat ilustrasi pola, bukan nomor tetap yang diwajibkan.

## 18.7 Integritas Penomoran

- nomor harus unik sesuai tipe transaksi;
- generator harus aman terhadap concurrent request;
- nomor yang telah diterbitkan tidak boleh terduplikasi;
- perilaku nomor setelah dokumen dibatalkan/void harus konsisten;
- perubahan konfigurasi penomoran tidak boleh menghasilkan nomor duplikat.

---

# 19. Upload File dan Bukti Transaksi

## 19.1 File yang Didukung

Use case utama:

- bukti pembayaran;
- dokumen pendukung transaksi.

## 19.2 Ketentuan

- upload bersifat opsional kecuali transaksi tertentu ditandai wajib;
- tipe file yang diizinkan harus dibatasi;
- ukuran file harus dibatasi;
- nama file tidak boleh menjadi sumber otorisasi;
- akses file harus mengikuti permission user;
- file harus disimpan di object storage, bukan mengandalkan disk VPS sebagai storage utama.

## 19.3 Integritas

Metadata file harus menyimpan minimal:

- nama asli;
- object key/path;
- ukuran;
- content type;
- uploader;
- timestamp;
- relasi transaksi.

---

# 20. Search, Filter, Sort, dan Pagination

List utama harus mendukung pencarian/filter yang wajar agar sistem dapat digunakan untuk operasional harian.

Minimal pada:

- customer;
- kegiatan;
- penawaran;
- invoice;
- pembayaran;
- rekap.

### Prinsip

- search harus relevan terhadap kolom penting;
- filter tanggal tersedia pada transaksi;
- pagination digunakan untuk data besar;
- sorting harus deterministik.

---

# 21. Auditability dan Histori

Karena sistem menyimpan data finansial, sistem harus dapat menjawab:

- siapa yang membuat data;
- kapan dibuat;
- siapa yang mengubah data;
- kapan diubah;
- dari transaksi mana nilai berasal;
- ke faktur mana pembayaran dialokasikan;
- dari mana saldo deposit berasal;
- kapan deposit digunakan.

## 21.1 Minimal Audit Fields

Untuk entity relevan:

- created_at;
- created_by;
- updated_at;
- updated_by.

Untuk transaksi kritis, disarankan tersedia histori perubahan/status atau audit log yang memadai.

---

# 22. Lifecycle dan Status Transaksi

## 22.1 Penawaran

```text
DRAFT
  ↓
TERKIRIM / DIAJUKAN
  ├── DISETUJUI
  └── DITOLAK
```

Pembatalan dapat terjadi sesuai aturan bisnis.

## 22.2 Faktur

```text
DRAFT
  ↓
DITERBITKAN
  ↓
BELUM BAYAR
  ↓
SEBAGIAN DIBAYAR
  ↓
LUNAS
```

Bila dibatalkan:

```text
DITERBITKAN → DIBATALKAN
```

Faktur yang dibatalkan tidak boleh menjadi sumber pembayaran baru tanpa mekanisme yang jelas.

## 22.3 Pembayaran

```text
DRAFT → TERCATAT
```

Pembatalan/void, bila tersedia, harus menghasilkan histori dan tidak menghapus jejak transaksi.

## 22.4 Kwitansi

Kwitansi mengikuti payment sebagai dokumen turunan.

---

# 23. Business Rules dan Invariants

Aturan berikut adalah aturan inti yang wajib dipertahankan selama pengembangan.

### I-01 Customer
Setiap transaksi customer harus mengacu pada customer yang valid.

### I-02 Kegiatan
Setiap kegiatan memiliki satu customer.

### I-03 Item
Setiap item memiliki satu kegiatan.

### I-04 Perhitungan Item
`Item Total = Volume × Harga Satuan`.

### I-05 Total Kegiatan
`Total Kegiatan = Σ Item Total`.

### I-06 Total Penawaran
`Total Penawaran = Σ Total Kegiatan/Item yang termasuk penawaran`.

### I-07 Total Faktur
Nilai faktur harus berasal dari detail faktur yang tercatat atau nilai custom yang sengaja dimasukkan user melalui form resmi.

### I-08 Outstanding
`Outstanding = max(Total Faktur - Pembayaran Teralokasi, 0)`.

### I-09 Status Payment
Status faktur diturunkan dari total pembayaran teralokasi, bukan input manual.

### I-10 Allocation
Total payment allocation tidak boleh melebihi nominal payment.

### I-11 Deposit
Kelebihan pembayaran harus menjadi deposit customer dan dapat digunakan pada transaksi berikutnya.

### I-12 Deposit Integrity
Saldo deposit tidak boleh diubah langsung tanpa ledger/mutasi.

### I-13 No Double Billing
Bagian penawaran/item yang sudah difakturkan tidak boleh ditagihkan dua kali tanpa mekanisme revisi/adjustment resmi.

### I-14 Unique Number
Nomor transaksi yang telah diterbitkan tidak boleh duplikat.

### I-15 Role Enforcement
Permission harus ditegakkan di backend, bukan hanya pada tampilan.

### I-16 Financial Locking
Perubahan nilai finansial setelah transaksi digunakan tidak boleh menghancurkan histori pembayaran/alokasi.

### I-17 No Silent Mutation
Sistem tidak boleh mengubah histori transaksi secara diam-diam sebagai akibat perubahan master data.

### I-18 Traceability
Setiap saldo yang terbentuk dari proses finansial harus dapat ditelusuri ke sumber transaksi.

---

# 24. Validasi dan Error Handling

Sistem harus memberikan validasi yang jelas dan dapat dipahami user.

Contoh kondisi yang wajib ditolak:

- customer kosong;
- total faktur nol/negatif;
- volume atau harga invalid;
- pembayaran nol/negatif;
- allocation melebihi payment;
- allocation melebihi outstanding;
- penggunaan deposit melebihi saldo;
- transaksi pada dokumen yang tidak lagi valid;
- nomor dokumen duplikat;
- user tidak memiliki permission.

Error harus:

- aman;
- tidak membocorkan detail internal/server;
- menjelaskan tindakan yang harus dilakukan user;
- tercatat di log teknis untuk error sistem.

---

# 25. Keamanan

## 25.1 Authentication

- login menggunakan username/email dan password sesuai desain implementasi;
- password tidak disimpan dalam plaintext;
- session/token harus memiliki mekanisme expiry yang aman.

## 25.2 Authorization

- endpoint backend memeriksa role/permission;
- direct API request dari user tanpa akses harus ditolak;
- object-level authorization wajib diterapkan pada data yang sensitif.

## 25.3 Data Protection

- HTTPS wajib pada production;
- secret tidak boleh disimpan di source code;
- credential database/object storage disimpan melalui environment/secret management;
- file transaksi tidak boleh dapat diakses publik tanpa kontrol.

## 25.4 Sensitive Financial Actions

Aksi berikut dianggap sensitif:

- membuat payment;
- mengubah payment;
- void payment;
- allocation payment;
- penggunaan deposit;
- adjustment finansial.

Aksi tersebut wajib tercatat dan dibatasi role.

---

# 26. Non-Functional Requirements

## 26.1 Usability

- desktop-first, responsif untuk layar umum;
- form transaksi menggunakan label yang jelas;
- nominal Rupiah tampil konsisten;
- total penting terlihat jelas;
- status transaksi mudah dipahami;
- feedback sukses/error tersedia.

## 26.2 Performance

Target awal sistem:

- operasi CRUD normal harus terasa responsif pada workload awal;
- list menggunakan pagination;
- query dashboard/rekap tidak boleh melakukan query tidak perlu secara berulang;
- endpoint transaksi finansial harus menjaga konsistensi data lebih penting daripada optimasi prematur.

Tidak ditetapkan SLA enterprise atau throughput skala tinggi karena sistem ditujukan untuk kebutuhan operasional CV. ANDARA pada scope saat ini.

## 26.3 Availability

Sistem ditargetkan tersedia selama server dan layanan infrastruktur utama berjalan. Infrastruktur production mengikuti baseline teknis proyek.

## 26.4 Scalability

Arsitektur harus dapat ditingkatkan resource VPS ketika volume transaksi meningkat tanpa perlu mengganti keseluruhan aplikasi.

## 26.5 Maintainability

- struktur kode modular;
- API contract jelas;
- migration database terkontrol;
- logging memadai;
- konfigurasi dipisahkan dari kode;
- dokumentasi deployment tersedia.

---

# 27. Infrastruktur Production

Baseline implementasi produk mengikuti Technical & Infrastructure Baseline. Secara ringkas:

```text
Internet
   ↓
Cloudflare / DNS / SSL
   ↓
Nginx
   ↓
React Frontend + Spring Boot API
   ↓
PostgreSQL

File transaksi → Cloudflare R2
Backup DB       → R2 backup storage
```

Komponen utama:

- Backend: Java Spring Boot
- Frontend: React + TypeScript
- Database: PostgreSQL
- ORM: Spring Data JPA/Hibernate
- Migration: Flyway
- Security: Spring Security
- Build backend: Maven
- Containerization: Docker
- Server: Ubuntu LTS VPS
- Reverse Proxy: Nginx
- DNS/SSL: Cloudflare
- Object storage: Cloudflare R2
- Monitoring dasar: UptimeRobot/Sentry sesuai baseline teknis.

Detail teknis bukan acceptance produk dan harus mengikuti dokumen Technical Baseline.

---

# 28. Backup dan Recovery

## 28.1 Backup

Database production harus memiliki backup terjadwal.

Baseline:

- daily PostgreSQL dump;
- backup dikompresi;
- hasil backup dikirim ke storage terpisah dari database production;
- retention dasar: 7 daily, 4 weekly, 3 monthly, atau kebijakan final yang lebih ketat bila disepakati;
- backup harus dapat diverifikasi.

## 28.2 Restore Test

Sebelum go-live, minimal satu restore test harus dilakukan dengan contoh data:

- customer;
- kegiatan;
- penawaran;
- invoice;
- payment;
- deposit;
- payment allocation.

Tujuannya memastikan histori transaksi dapat dipulihkan.

---

# 29. API dan Integrasi Internal

Walaupun pengguna berinteraksi melalui frontend, business rules finansial harus dijalankan di backend.

Minimal endpoint/operation yang diperlukan:

- authentication;
- customer CRUD;
- kegiatan CRUD;
- item CRUD;
- penawaran CRUD/status;
- create invoice;
- create invoice from quotation;
- payment CRUD/void sesuai role;
- payment allocation;
- deposit ledger;
- kwitansi;
- numbering settings;
- dashboard;
- reports/rekap;
- file upload/access.

Nama endpoint dapat berbeda. Yang penting adalah kontrak perilaku dan integritas bisnisnya.

---

# 30. Acceptance Criteria

Acceptance criteria berikut merupakan baseline UAT.

## AT-01 Customer

**Given** user memiliki akses customer
**When** user membuat customer valid
**Then** customer tersimpan dan dapat dipilih pada transaksi.

## AT-02 Item Calculation

**Given** volume 10 dan harga Rp100.000
**When** item disimpan
**Then** subtotal menjadi Rp1.000.000.

## AT-03 Kegiatan Total

**Given** satu kegiatan memiliki beberapa item
**When** data item berubah
**Then** total kegiatan dihitung ulang otomatis.

## AT-04 Penawaran Total

**Given** penawaran memiliki beberapa kegiatan
**When** penawaran disimpan
**Then** total penawaran merupakan penjumlahan seluruh detail.

## AT-05 Invoice from Quotation

**Given** satu penawaran tersedia
**When** user membuat faktur dari penawaran
**Then** sistem menyalin data sumber sesuai detail yang dipilih dan mencatat referensi sumber.

## AT-06 Partial Invoicing

**Given** satu penawaran memiliki beberapa bagian yang belum ditagihkan
**When** user membuat faktur sebagian
**Then** hanya bagian yang dipilih yang ditandai telah difakturkan dan sisanya tetap tersedia.

## AT-07 Prevent Double Billing

**Given** bagian penawaran sudah difakturkan penuh
**When** user mencoba memfakturkan bagian yang sama lagi
**Then** sistem menolak atau meminta adjustment yang sah.

## AT-08 Partial Payment

**Given** invoice Rp50.000.000
**When** payment Rp20.000.000 dialokasikan
**Then** status invoice = Sebagian Dibayar dan outstanding = Rp30.000.000.

## AT-09 Multiple Payment

**Given** invoice Rp50.000.000
**When** payment Rp20.000.000 + Rp15.000.000 + Rp15.000.000 dialokasikan
**Then** status = Lunas dan outstanding = Rp0.

## AT-10 Overpayment to Deposit

**Given** invoice Rp50.000.000
**When** customer membayar Rp60.000.000
**Then** Rp50.000.000 dialokasikan ke invoice dan Rp10.000.000 menjadi deposit customer.

## AT-11 Deposit Usage

**Given** deposit customer Rp10.000.000 dan invoice baru Rp20.000.000
**When** deposit Rp10.000.000 digunakan dan pembayaran baru Rp10.000.000 masuk
**Then** invoice menjadi Lunas dan saldo deposit menjadi Rp0.

## AT-12 Prevent Excess Allocation

**Given** payment Rp10.000.000
**When** user mencoba membuat allocation total Rp11.000.000
**Then** sistem menolak transaksi.

## AT-13 Payment Status Automatic

**Given** payment berubah melalui transaksi valid
**When** total payment allocation berubah
**Then** status invoice diperbarui otomatis.

## AT-14 Numbering

**Given** konfigurasi prefix, tahun, bulan, counter dan reset
**When** transaksi baru dibuat
**Then** nomor mengikuti konfigurasi dan tidak duplikat.

## AT-15 Role Restriction

**Given** user Admin
**When** Admin mencoba membuat/ubah payment melalui UI atau direct API
**Then** sistem menolak akses.

## AT-16 Kwitansi

**Given** payment valid telah tercatat
**When** user membuat kwitansi
**Then** kwitansi mengambil data payment yang benar dan memiliki nomor kwitansi unik.

## AT-17 Dashboard Accuracy

**Given** ada invoice dan payment valid
**When** dashboard dibuka
**Then** total invoice/payment/outstanding/deposit konsisten dengan data transaksi.

## AT-18 Deposit Ledger

**Given** deposit terbentuk dari overpayment
**When** user membuka histori deposit customer
**Then** sumber transaksi dan mutasi deposit dapat ditelusuri.

## AT-19 Locking Financial Data

**Given** invoice telah memiliki payment
**When** user mencoba mengubah nilai finansial inti secara langsung
**Then** sistem menolak atau mengarahkan ke mekanisme revisi/adjustment yang valid.

## AT-20 Backup Restore

**Given** backup database valid
**When** backup dipulihkan pada environment test
**Then** customer, kegiatan, quotation, invoice, payment, allocation, dan deposit dapat dipulihkan secara konsisten.

---

# 31. Definition of Done (DoD)

Sebuah fitur dianggap selesai apabila:

1. requirement fungsional telah diimplementasikan;
2. validasi backend tersedia;
3. permission role sudah diterapkan;
4. business rule penting sudah diuji;
5. UI tidak memiliki error blocker;
6. perubahan database menggunakan migration;
7. error handling dasar tersedia;
8. audit field relevan tersedia;
9. acceptance criteria fitur lulus;
10. tidak merusak fitur yang sudah lolos sebelumnya;
11. dokumentasi teknis yang diperlukan diperbarui.

Untuk fitur finansial kritis, testing minimal harus mencakup happy path, invalid input, boundary condition, dan authorization.

---

# 32. Testing Strategy

## 32.1 Unit Test

Fokus pada:

- perhitungan subtotal;
- total kegiatan;
- total penawaran;
- outstanding;
- payment status;
- allocation;
- deposit.

## 32.2 Integration Test

Fokus pada:

- database persistence;
- transaction consistency;
- authorization;
- numbering concurrency;
- payment/deposit flow.

## 32.3 End-to-End / UAT

Minimal mencakup:

1. create customer;
2. create kegiatan;
3. add item;
4. create penawaran;
5. create invoice dari penawaran;
6. invoice manual;
7. partial payment;
8. multiple payment;
9. overpayment;
10. deposit usage;
11. kwitansi;
12. dashboard/rekap;
13. numbering;
14. role restriction;
15. backup/restore.

---

# 33. Produksi dan Deployment Acceptance

Sebelum go-live harus tersedia:

- domain aktif;
- HTTPS aktif;
- frontend dapat diakses;
- backend API berjalan;
- database production siap;
- migration selesai;
- object storage file berjalan;
- upload/download file diuji;
- backup otomatis berjalan;
- restore test selesai;
- role Operator/Admin diuji;
- payment restriction Admin diuji;
- numbering diuji;
- dashboard/rekap diuji;
- log error dasar tersedia.

---

# 34. Handover

Handover minimum mencakup:

- aplikasi production;
- akses administratif yang disepakati;
- source code sesuai kesepakatan;
- konfigurasi deployment yang relevan;
- dokumentasi instalasi/deployment;
- dokumentasi backup/restore;
- penjelasan penggunaan sistem dasar;
- daftar kredensial yang diserahkan melalui cara aman.

Credential tidak boleh ditulis plaintext di dokumen publik/source repository.

---

# 35. Change Request dan Pengendalian Scope

Perubahan kebutuhan setelah baseline final harus diperlakukan sebagai Change Request apabila berdampak pada:

- fitur baru;
- alur bisnis baru;
- integrasi eksternal;
- perubahan besar struktur data;
- perubahan role/permission;
- perubahan format dokumen yang melampaui template standar;
- perubahan infrastruktur yang menyebabkan biaya baru;
- perubahan besar acceptance criteria.

Contoh yang termasuk potensi Change Request:

- Visual Print Designer;
- payment gateway;
- integrasi bank otomatis;
- multi-company;
- mobile app native;
- accounting ledger penuh.

Perubahan tidak boleh dimasukkan diam-diam ke dalam implementasi hanya karena dianggap kecil jika berdampak pada scope, biaya, atau timeline.

---

# 36. Risiko Produk dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Perubahan nilai invoice setelah pembayaran | histori rusak | locking/revision |
| Payment dialokasikan berlebihan | saldo tidak konsisten | backend validation + transaction |
| Overpayment tidak tercatat | dana customer hilang dari rekonsiliasi | deposit ledger |
| Double billing dari quotation | customer tertagih ganda | invoiced quantity/amount tracking |
| Duplicate numbering | dokumen bentrok | unique constraint + sequence strategy |
| Admin bypass payment via API | kontrol akses gagal | backend authorization |
| Backup tidak bisa direstore | kehilangan data | restore test |
| File bukti hilang | bukti transaksi tidak tersedia | object storage + backup metadata |
| Master data dihapus | histori putus | soft delete/archive |

---

# 37. Prioritas Implementasi

## P0 — Wajib untuk Go-Live

- Authentication
- Role Operator/Admin
- Customer
- Kegiatan
- Item
- Penawaran
- Faktur
- Create Invoice from Quotation
- Pembayaran
- Payment Allocation
- Deposit Customer
- Kwitansi
- Dashboard dasar
- Rekap dasar
- Penomoran
- Upload bukti transaksi
- Backend authorization
- Backup database

## P1 — Penyempurnaan yang Masih Dalam Baseline

- filter dan pencarian yang lebih lengkap;
- audit/history yang lebih rinci;
- penyempurnaan dashboard;
- usability refinement;
- optimasi query berdasarkan hasil penggunaan awal.

P1 tidak boleh menghilangkan P0.

---

# 38. Indikator Keberhasilan Produk

Produk dianggap memenuhi tujuan utama apabila pengguna dapat menyelesaikan alur berikut tanpa spreadsheet/manual calculation sebagai sumber utama:

```text
Customer
→ Kegiatan
→ Item
→ Penawaran
→ Faktur
→ Pembayaran
→ Allocation
→ Deposit bila overpayment
→ Kwitansi
→ Rekap/Dashboard
```

Indikator keberhasilan:

1. total transaksi dapat dihitung otomatis;
2. outstanding faktur dapat diketahui tanpa rekap manual;
3. pembayaran parsial/multi-payment dapat direkonsiliasi;
4. overpayment menghasilkan deposit yang benar;
5. deposit dapat digunakan pada invoice berikutnya;
6. nomor dokumen konsisten;
7. Admin tidak dapat mengelola pembayaran;
8. histori transaksi tetap dapat ditelusuri;
9. database dapat dipulihkan dari backup;
10. tidak ada fitur out-of-scope yang masuk tanpa Change Request.

---

# 39. Checklist Final Requirement sebelum Coding

## Business

- [x] Customer memiliki banyak kegiatan.
- [x] Kegiatan memiliki banyak item.
- [x] Satu penawaran dapat memiliki banyak kegiatan/item.
- [x] Satu customer dapat memiliki banyak invoice.
- [x] Invoice fleksibel dan tidak dikunci satu kegiatan.
- [x] Satu invoice dapat menerima banyak payment.
- [x] Payment dapat overpay.
- [x] Overpay menjadi deposit customer.
- [x] Deposit dapat digunakan pada invoice berikutnya.
- [x] Status invoice dihitung otomatis.
- [x] Kwitansi berasal dari payment.
- [x] Penawaran dapat menjadi sumber invoice.
- [x] Partial invoicing didukung.
- [x] Double billing harus dicegah.

## Access

- [x] Operator full access.
- [x] Admin tanpa akses pengelolaan pembayaran.
- [x] Permission ditegakkan di backend.

## Scope

- [x] Total project Rp9,4 juta tercatat sebagai referensi baseline komersial.
- [x] Rp1,4 juta untuk server + domain tahun awal sesuai keputusan proyek.
- [x] Rp8 juta sebagai nilai pengembangan/software.
- [x] Desain Cetakan di luar scope.
- [x] Tidak ada Phase 2 untuk Print Designer dalam baseline ini.

## Technical readiness

- [x] API/business rules server-side.
- [x] Database transaction untuk finansial.
- [x] Unique numbering.
- [x] File storage eksternal.
- [x] Backup.
- [x] Restore test.
- [x] Monitoring/error logging dasar.

---

# 40. Aturan untuk AI Coding Assistant / Developer

Dokumen ini dapat digunakan sebagai context utama saat coding.

### Wajib

1. Jangan membuat fitur yang tidak ada di PRD tanpa persetujuan.
2. Jangan mengubah business rule finansial tanpa catatan perubahan.
3. Jangan menyelesaikan masalah hanya di frontend jika aturan harus aman di backend.
4. Jangan melakukan hard delete terhadap histori finansial tanpa mekanisme yang aman.
5. Jangan mengubah saldo deposit secara langsung.
6. Jangan membuat status pembayaran manual sebagai sumber kebenaran.
7. Jangan mengizinkan over-allocation.
8. Jangan mengizinkan double billing dari sumber penawaran.
9. Jangan mengizinkan Admin mengakses operasi pembayaran melalui API.
10. Jangan menambahkan Visual Print Designer ke baseline ini.

### Saat menemukan requirement ambigu

Prioritas penyelesaian:

1. cek PRD;
2. cek Project Scope & Development Agreement;
3. cek RAB;
4. cek Technical & Infrastructure Baseline;
5. jika tetap ambigu, hentikan asumsi dan minta keputusan sebelum mengubah business logic.

---

# 41. Ringkasan Baseline Final

Sistem final adalah aplikasi manajemen operasional dan transaksi yang berfokus pada:

**Master Data → Penawaran → Faktur → Pembayaran → Allocation → Deposit → Kwitansi → Rekap/Dashboard**.

Karakteristik utama:

- 2 role: Operator dan Admin;
- Admin tidak dapat mengelola pembayaran;
- invoice fleksibel;
- pembayaran dapat berkali-kali;
- overpayment menjadi deposit;
- deposit dapat digunakan untuk invoice berikutnya;
- penawaran dapat menjadi sumber invoice;
- partial invoicing didukung;
- double billing dicegah;
- nomor transaksi configurable;
- histori transaksi dapat ditelusuri;
- file bukti disimpan di object storage;
- backup database tersedia;
- tidak ada payment gateway;
- tidak ada Visual Print Designer;
- tidak ada scope Phase 2 print design.

Dokumen ini menjadi baseline kebutuhan produk untuk development dan UAT. Implementasi teknis rinci wajib mengikuti **Technical & Infrastructure Baseline** dan perubahan scope wajib mengikuti mekanisme **Change Request**.

---

## END OF DOCUMENT

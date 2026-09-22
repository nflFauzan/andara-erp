# Product Requirements Document (PRD)

## Sistem Keuangan CV Andara

**Versi:** 1.0
**Status:** Final
**Tanggal:** 23 September 2026
**Project:** Sistem Keuangan CV Andara
**Dokumen:** Product Requirements Document

---

# 1. Document Control

| Field               | Value                         |
| ------------------- | ----------------------------- |
| Project             | Sistem Keuangan CV Andara     |
| Client              | CV Andara                     |
| Project Owner / PIC | M. Dafa Fakhrika              |
| Developer / PIC     | Muhamad Naufal Fauzan         |
| Document            | Product Requirements Document |
| Version             | 1.0                           |
| Status              | Final                         |
| Last Updated        | 23 September 2026             |

## 1.1 Purpose

Dokumen ini mendefinisikan kebutuhan produk, fungsi sistem, aturan bisnis, hak akses, alur kerja, validasi, acceptance criteria, dan batasan scope untuk pembangunan Sistem Keuangan CV Andara.

PRD menjadi acuan utama untuk memastikan implementasi sistem sesuai kebutuhan bisnis yang telah disepakati.

Dokumen ini tidak mendefinisikan detail implementasi teknis secara mendalam. Detail arsitektur, infrastructure, deployment, server, database technology, dan konfigurasi teknis mengacu pada:

`Technical & Infrastructure Baseline.md`

---

# 2. Product Overview

## 2.1 Latar Belakang

CV Andara membutuhkan sistem terpusat untuk membantu pengelolaan administrasi transaksi dan keuangan yang sebelumnya berpotensi dilakukan secara manual atau tersebar.

Sistem dirancang untuk mengelola data customer, kegiatan, item, penawaran, faktur penjualan, pembayaran, kwitansi, deposit customer, serta rekap informasi keuangan dalam satu aplikasi.

## 2.2 Tujuan Produk

Sistem bertujuan untuk:

1. Memusatkan data administrasi dan transaksi.
2. Mempermudah pembuatan dan pengelolaan dokumen transaksi.
3. Mempermudah pencatatan pembayaran.
4. Memantau status pembayaran dan saldo deposit customer.
5. Menyediakan rekap transaksi dan keuangan.
6. Mengurangi kesalahan akibat pencatatan manual.
7. Memberikan pembatasan akses berdasarkan role pengguna.
8. Menyediakan histori transaksi yang dapat ditelusuri.

## 2.3 Product Scope

### Included

Sistem mencakup:

* Authentication
* Dashboard
* Customer
* Kegiatan
* Item
* Penawaran
* Faktur Penjualan
* Pembayaran
* Kwitansi
* Deposit Customer
* Rekap
* Penomoran dokumen
* Output/cetakan dokumen yang telah ditentukan dalam scope

### Excluded

Sistem tidak mencakup:

* Custom print designer
* Mobile application native
* Payment gateway
* Integrasi rekening bank
* WhatsApp API
* SMS gateway
* Email automation
* Payroll
* General Ledger / accounting penuh
* Inventory management penuh
* Point of Sale
* Multi-company
* Multi-currency
* Integrasi pihak ketiga yang tidak dinyatakan dalam scope

---

# 3. User & Role Definition

Sistem memiliki dua role pengguna:

1. Operator
2. Admin

## 3.1 Operator

Operator memiliki akses penuh terhadap seluruh fitur yang tersedia dalam sistem.

Operator dapat:

* Mengakses dashboard.
* Mengelola master data.
* Mengelola penawaran.
* Mengelola faktur.
* Mengelola pembayaran.
* Mengelola kwitansi.
* Mengelola deposit customer.
* Melihat rekap.
* Mengelola penomoran.
* Mengakses output/cetakan dokumen.

## 3.2 Admin

Admin memiliki akses terhadap seluruh fitur sistem **kecuali modul Pembayaran**.

Admin dapat:

* Mengakses dashboard.
* Mengelola master data.
* Mengelola penawaran.
* Mengelola faktur.
* Mengelola kwitansi.
* Mengelola deposit customer.
* Melihat rekap.
* Mengelola penomoran.
* Mengakses output/cetakan dokumen.

Admin tidak dapat:

* Membuka halaman Pembayaran.
* Mengakses endpoint/API Pembayaran.
* Membuat pembayaran.
* Mengubah pembayaran.
* Menghapus pembayaran.
* Melakukan tindakan lain yang secara langsung memerlukan permission pembayaran.

## 3.3 Permission Matrix

| Modul            | Operator    | Admin         |
| ---------------- | ----------- | ------------- |
| Dashboard        | View        | View          |
| Customer         | Full Access | Full Access   |
| Kegiatan         | Full Access | Full Access   |
| Item             | Full Access | Full Access   |
| Penawaran        | Full Access | Full Access   |
| Faktur Penjualan | Full Access | Full Access   |
| Pembayaran       | Full Access | **No Access** |
| Kwitansi         | Full Access | Full Access   |
| Deposit Customer | Full Access | Full Access   |
| Rekap            | View        | View          |
| Penomoran        | Full Access | Full Access   |
| Output/Cetakan   | Full Access | Full Access   |

### Authorization Requirement

Pembatasan role tidak boleh hanya dilakukan pada tampilan menu.

Sistem harus melakukan authorization pada:

1. Navigation/UI.
2. Route/page.
3. Backend/API/action.

Admin yang mencoba mengakses fungsi Pembayaran melalui URL atau request langsung harus ditolak oleh sistem.

---

# 4. Information Architecture

Struktur navigasi utama:

```text
DASHBOARD

MASTER DATA
├── Customer
├── Kegiatan
└── Item

TRANSAKSI
├── Penawaran
├── Faktur Penjualan
├── Pembayaran
└── Kwitansi

KEUANGAN
├── Deposit Customer
└── Rekap

PENGATURAN
└── Penomoran
```

Output/cetakan merupakan bagian dari fungsi dokumen terkait dan bukan modul `Desain Cetakan`.

---

# 5. Authentication

## 5.1 Login

Sistem menyediakan halaman login untuk pengguna yang telah terdaftar.

Input minimal:

* Username/email sesuai mekanisme autentikasi yang digunakan.
* Password.

## 5.2 Login Validation

Sistem harus:

* Menolak kredensial yang salah.
* Menampilkan feedback yang sesuai.
* Tidak membocorkan informasi sensitif.
* Membuat session setelah autentikasi berhasil.

## 5.3 Logout

Pengguna dapat melakukan logout.

Setelah logout:

* Session harus invalid.
* Halaman terproteksi tidak dapat diakses kembali tanpa autentikasi.

## 5.4 Authorization

Setiap user memiliki satu role yang menentukan permission-nya.

Role:

```text
OPERATOR
ADMIN
```

---

# 6. Dashboard

## 6.1 Purpose

Dashboard memberikan ringkasan kondisi transaksi dan keuangan secara cepat.

## 6.2 Dashboard Information

Dashboard dapat menampilkan ringkasan sesuai data yang tersedia, antara lain:

* Jumlah customer.
* Jumlah penawaran.
* Jumlah faktur.
* Nilai transaksi.
* Pembayaran.
* Piutang.
* Deposit customer.
* Ringkasan transaksi berdasarkan periode.

Data final yang ditampilkan harus mengikuti scope UI yang telah disepakati.

## 6.3 Period Filter

Jika digunakan, dashboard dapat difilter berdasarkan periode.

Contoh:

* Hari ini.
* Minggu ini.
* Bulan ini.
* Periode custom.

## 6.4 Empty State

Jika belum terdapat data, sistem harus menampilkan kondisi kosong yang jelas dan tidak dianggap sebagai error.

---

# 7. Master Data — Customer

## 7.1 Purpose

Menyimpan data customer yang digunakan oleh transaksi.

## 7.2 Data

Minimal mencakup:

* ID/customer code.
* Nama customer.
* Alamat.
* Nomor kontak.
* Email jika diperlukan.
* Status.
* Timestamp.

Field final mengikuti desain database dan UI yang disepakati.

## 7.3 Operations

User yang memiliki permission dapat:

* Melihat daftar customer.
* Mencari customer.
* Memfilter customer.
* Membuat customer.
* Melihat detail customer.
* Mengubah customer.
* Menghapus/nonaktifkan customer sesuai aturan bisnis.

## 7.4 Business Rules

1. Customer harus memiliki identifier unik.
2. Data wajib harus divalidasi.
3. Customer yang sudah digunakan dalam transaksi tidak boleh dihapus secara sembarangan.
4. Penghapusan data yang memiliki dependency harus ditangani dengan aman.

---

# 8. Master Data — Kegiatan

## 8.1 Purpose

Menyimpan data kegiatan/project/pekerjaan yang digunakan dalam transaksi.

## 8.2 Operations

* List.
* Search.
* Filter.
* Create.
* View.
* Edit.
* Delete/nonaktifkan sesuai dependency.

## 8.3 Business Rules

1. Kegiatan harus memiliki identifier.
2. Kegiatan dapat dikaitkan dengan customer.
3. Kegiatan yang sudah digunakan transaksi harus diperlakukan secara aman.
4. Data wajib harus divalidasi.

---

# 9. Master Data — Item

## 9.1 Purpose

Menyimpan item/jasa/barang yang digunakan dalam transaksi.

## 9.2 Data

Minimal dapat mencakup:

* Kode item.
* Nama item.
* Deskripsi.
* Satuan.
* Harga.
* Status.

## 9.3 Operations

* List.
* Search.
* Filter.
* Create.
* View.
* Edit.
* Delete/nonaktifkan sesuai dependency.

## 9.4 Business Rules

1. Item harus memiliki identifier unik.
2. Harga harus berupa nilai valid.
3. Item yang telah digunakan dalam transaksi tidak boleh menyebabkan histori transaksi berubah karena perubahan master data.

---

# 10. Penawaran

## 10.1 Purpose

Menyediakan dokumen penawaran kepada customer.

## 10.2 Data

### Header

* Nomor penawaran.
* Tanggal.
* Customer.
* Kegiatan jika relevan.
* Status.
* Catatan.

### Detail

* Item.
* Deskripsi.
* Quantity.
* Satuan.
* Harga.
* Subtotal.

### Summary

* Subtotal.
* Diskon jika digunakan.
* Pajak jika digunakan.
* Total.

Field yang tidak digunakan tidak boleh dipaksakan ke implementasi hanya berdasarkan asumsi.

## 10.3 Operations

* Create.
* View.
* Edit.
* Delete.
* Search.
* Filter.
* Print/output.

## 10.4 Status

Status minimal harus mampu membedakan:

```text
Draft
Issued
Approved
Rejected
```

Status final harus mengikuti workflow bisnis yang digunakan pada implementasi.

## 10.5 Business Rules

1. Nomor penawaran harus unik.
2. Detail penawaran minimal memiliki satu item.
3. Quantity tidak boleh bernilai tidak valid.
4. Harga tidak boleh bernilai tidak valid.
5. Total dihitung sistem.
6. Data transaksi tidak boleh bergantung pada harga master item secara dinamis setelah transaksi tersimpan.

---

# 11. Faktur Penjualan

## 11.1 Purpose

Mencatat tagihan kepada customer berdasarkan transaksi yang dilakukan.

## 11.2 Data

### Header

* Nomor faktur.
* Tanggal.
* Customer.
* Kegiatan jika relevan.
* Status.
* Jatuh tempo jika digunakan.
* Catatan.

### Detail

* Item.
* Deskripsi.
* Quantity.
* Satuan.
* Harga.
* Subtotal.

### Summary

* Subtotal.
* Diskon jika digunakan.
* Pajak jika digunakan.
* Grand total.

## 11.3 Operations

* Create.
* View.
* Edit.
* Delete sesuai status.
* Search.
* Filter.
* Print/output.

## 11.4 Status

Status pembayaran minimal harus dapat merepresentasikan:

```text
Draft
Issued
Partially Paid
Paid
Cancelled
```

## 11.5 Business Rules

1. Nomor faktur harus unik.
2. Faktur harus memiliki customer.
3. Faktur harus memiliki minimal satu detail.
4. Total dihitung oleh sistem.
5. Pembayaran yang telah tercatat memengaruhi outstanding invoice.
6. Faktur yang telah final tidak boleh diubah secara bebas jika perubahan tersebut merusak histori pembayaran.
7. Pembatalan harus mempertahankan integritas histori transaksi.

---

# 12. Pembayaran

## 12.1 Access

Modul ini hanya dapat diakses oleh:

```text
Operator = Allowed
Admin = Denied
```

## 12.2 Purpose

Mencatat pembayaran customer terhadap tagihan.

## 12.3 Data

Minimal:

* Nomor pembayaran.
* Tanggal pembayaran.
* Customer.
* Invoice terkait.
* Nominal.
* Metode pembayaran.
* Keterangan.
* Status.
* Timestamp.

## 12.4 Operations

Operator dapat:

* Melihat pembayaran.
* Membuat pembayaran.
* Melihat detail pembayaran.
* Mengubah pembayaran sesuai status.
* Membatalkan/menghapus pembayaran sesuai aturan bisnis.

## 12.5 Payment Calculation

Contoh:

```text
Invoice       Rp10.000.000
Payment 1      Rp4.000.000
Outstanding    Rp6.000.000

Payment 2      Rp6.000.000
Outstanding    Rp0
```

Setelah outstanding menjadi nol, status invoice dapat berubah menjadi `Paid`.

## 12.6 Business Rules

1. Nominal pembayaran harus lebih dari nol.
2. Pembayaran harus terkait dengan customer/invoice sesuai model bisnis.
3. Sistem harus menghitung outstanding secara konsisten.
4. Sistem harus mencegah pembayaran yang melanggar batas pembayaran yang ditentukan.
5. Pembatalan pembayaran harus memperbarui status/outstanding terkait secara konsisten.
6. Histori pembayaran tidak boleh hilang tanpa mekanisme yang dapat ditelusuri.

---

# 13. Kwitansi

## 13.1 Purpose

Menyediakan bukti penerimaan pembayaran.

## 13.2 Relationship

Kwitansi harus memiliki hubungan yang jelas dengan transaksi pembayaran apabila kwitansi diterbitkan sebagai bukti pembayaran.

## 13.3 Data

Minimal:

* Nomor kwitansi.
* Tanggal.
* Customer.
* Referensi pembayaran.
* Nominal.
* Keterangan.

## 13.4 Operations

* Create/generate.
* View.
* Search.
* Print/output.

## 13.5 Business Rules

1. Nomor kwitansi harus unik.
2. Data nominal harus konsisten dengan sumber transaksi.
3. Perubahan sumber pembayaran tidak boleh menyebabkan dokumen histori berubah tanpa aturan yang jelas.

---

# 14. Deposit Customer

## 14.1 Purpose

Mencatat uang muka/deposit customer dan penggunaannya.

## 14.2 Deposit Ledger

Sistem harus dapat merepresentasikan mutasi:

```text
Deposit masuk       +Rp10.000.000
Penggunaan          -Rp3.000.000
--------------------------------
Saldo                Rp7.000.000
```

## 14.3 Data

Minimal:

* Customer.
* Tanggal.
* Nominal.
* Jenis mutasi.
* Referensi transaksi.
* Keterangan.
* Saldo setelah transaksi.

## 14.4 Operations

* Melihat saldo.
* Melihat histori mutasi.
* Menambah deposit.
* Menggunakan deposit sesuai aturan bisnis.
* Melihat detail transaksi.

## 14.5 Business Rules

1. Setiap perubahan saldo harus memiliki histori.
2. Saldo tidak boleh menjadi negatif.
3. Deposit harus dimiliki oleh customer.
4. Penggunaan deposit harus memiliki referensi transaksi.
5. Saldo harus dapat dihitung kembali berdasarkan ledger.
6. Penghapusan mutasi tidak boleh menyebabkan histori keuangan menjadi tidak konsisten.

---

# 15. Rekap

## 15.1 Purpose

Menyediakan ringkasan data transaksi dan keuangan.

## 15.2 Rekap

Sistem dapat menyediakan:

* Rekap penawaran.
* Rekap faktur.
* Rekap pembayaran.
* Rekap piutang.
* Rekap deposit.

Jenis rekap final mengikuti kebutuhan bisnis dan scope implementasi.

## 15.3 Filter

Filter dapat mencakup:

* Periode.
* Customer.
* Kegiatan.
* Status.
* Jenis transaksi.

## 15.4 Calculation

Nilai rekap harus dihitung dari sumber transaksi, bukan dari angka yang diinput manual.

## 15.5 Access

Rekap dapat dilihat oleh Operator dan Admin sesuai permission matrix.

---

# 16. Penomoran Dokumen

## 16.1 Purpose

Mengatur nomor dokumen secara konsisten dan unik.

## 16.2 Document Types

Minimal mencakup nomor untuk:

* Penawaran.
* Faktur.
* Pembayaran.
* Kwitansi.

## 16.3 Format

Format nomor dapat menggunakan pola yang telah ditentukan oleh bisnis.

Contoh:

```text
INV/2026/09/0001
```

Contoh tersebut hanya merupakan ilustrasi format.

## 16.4 Business Rules

1. Nomor harus unik.
2. Nomor tidak boleh duplicate.
3. Sequence harus aman terhadap concurrent request.
4. Format nomor dapat dikonfigurasi melalui pengaturan yang tersedia.
5. Nomor transaksi yang telah diterbitkan tidak boleh berubah secara sembarangan.

---

# 17. Output / Cetakan Dokumen

Sistem menyediakan output/cetakan untuk dokumen yang termasuk scope.

Dokumen yang dapat memiliki output antara lain:

* Penawaran.
* Faktur.
* Kwitansi.

## 17.1 Print Output

Output harus:

* Menggunakan template yang telah ditentukan.
* Menampilkan data transaksi secara akurat.
* Menampilkan nomor dokumen.
* Menampilkan informasi customer.
* Menampilkan detail transaksi.
* Menampilkan total sesuai transaksi.

## 17.2 Scope Restriction

Sistem **tidak menyediakan custom print designer**.

User tidak dapat membuat atau mengubah layout dokumen secara bebas melalui aplikasi.

---

# 18. Business Rules

## BR-001 — Unique Identifier

Setiap dokumen yang membutuhkan nomor harus memiliki nomor unik.

## BR-002 — Transaction Snapshot

Nilai transaksi yang sudah disimpan harus mempertahankan nilai pada saat transaksi dibuat sehingga perubahan master data tidak mengubah histori transaksi.

## BR-003 — Invoice Calculation

Total invoice harus dihitung sistem berdasarkan detail transaksi.

## BR-004 — Payment Integrity

Pembayaran harus memengaruhi outstanding invoice secara konsisten.

## BR-005 — Deposit Integrity

Saldo deposit harus berasal dari histori mutasi yang valid.

## BR-006 — No Negative Deposit

Saldo deposit tidak boleh menjadi negatif.

## BR-007 — Admin Payment Restriction

Admin tidak memiliki akses terhadap fungsi Pembayaran.

Restriction harus diterapkan pada UI, route, dan backend/API.

## BR-008 — Document Number Uniqueness

Nomor dokumen tidak boleh duplicate walaupun terdapat request secara bersamaan.

## BR-009 — Historical Integrity

Data histori keuangan tidak boleh berubah secara tidak sengaja akibat perubahan master data.

## BR-010 — Dependency Protection

Data master yang telah digunakan oleh transaksi tidak boleh dihapus dengan cara yang menyebabkan referensi transaksi rusak.

---

# 19. Workflow & Status

## 19.1 Penawaran

Workflow konseptual:

```text
Draft
  ↓
Issued
  ↓
Approved / Rejected
```

## 19.2 Faktur

Workflow konseptual:

```text
Draft
  ↓
Issued
  ↓
Partially Paid
  ↓
Paid
```

Dengan jalur pembatalan:

```text
Issued / sesuai aturan
       ↓
Cancelled
```

## 19.3 Pembayaran

Workflow konseptual:

```text
Created
  ↓
Confirmed
```

Pembayaran yang dibatalkan harus memproses reversal secara konsisten terhadap invoice.

## 19.4 Deposit

Workflow:

```text
Deposit In
     ↓
Available Balance
     ↓
Deposit Usage
     ↓
Remaining Balance
```

---

# 20. Data Relationship

Relasi konseptual utama:

```text
Customer
│
├── Kegiatan
│
├── Penawaran
│    └── Penawaran Detail
│          └── Item
│
├── Faktur
│    └── Faktur Detail
│          └── Item
│
├── Pembayaran
│    └── Faktur
│
├── Kwitansi
│    └── Pembayaran
│
└── Deposit
     └── Deposit Mutation
```

Implementasi database final mengikuti dokumen teknis.

---

# 21. Validation Requirements

## 21.1 General

Semua input harus:

* Memiliki validasi required field.
* Memvalidasi tipe data.
* Memvalidasi format.
* Memvalidasi range.
* Memvalidasi dependency.

## 21.2 Numeric

Nilai:

* Quantity harus valid.
* Harga tidak boleh invalid.
* Nominal pembayaran harus > 0.
* Nominal deposit harus > 0.

## 21.3 Transaction

Transaksi harus memiliki:

* Customer yang valid.
* Minimal satu detail jika dokumen membutuhkan detail.
* Nilai transaksi yang valid.

---

# 22. Error & Edge Cases

Sistem harus menangani kondisi berikut secara aman.

## 22.1 Duplicate Document Number

Sistem menolak nomor duplicate.

## 22.2 Unauthorized Access

Admin yang mencoba membuka Pembayaran harus menerima response unauthorized/forbidden.

## 22.3 Deleted Master Data

Master data yang telah digunakan transaksi tidak boleh menyebabkan transaksi menjadi invalid.

## 22.4 Overpayment

Sistem harus mengikuti aturan bisnis yang ditetapkan untuk pembayaran melebihi outstanding.

Jika overpayment tidak diperbolehkan, transaksi harus ditolak.

## 22.5 Insufficient Deposit

Jika saldo deposit tidak mencukupi, penggunaan deposit harus ditolak.

## 22.6 Concurrent Transaction

Sistem harus menjaga integritas data apabila dua request terjadi secara bersamaan terhadap:

* Nomor dokumen.
* Pembayaran.
* Deposit.
* Saldo.

## 22.7 Session Expired

User harus diarahkan untuk melakukan login kembali jika session telah berakhir.

## 22.8 Failed Transaction

Kegagalan penyimpanan tidak boleh meninggalkan data parsial yang menyebabkan saldo atau transaksi tidak konsisten.

---

# 23. Audit & Traceability

Data transaksi keuangan sebaiknya memiliki informasi:

* Created at.
* Created by.
* Updated at.
* Updated by.

Untuk transaksi yang dibatalkan:

* Cancellation status.
* Cancellation timestamp.
* User yang melakukan pembatalan.
* Alasan pembatalan jika field tersebut digunakan dalam scope.

Detail audit log tingkat lanjut hanya diterapkan jika termasuk scope teknis proyek.

---

# 24. Non-Functional Requirements

## 24.1 Security

Sistem harus:

* Menggunakan authentication.
* Menggunakan authorization.
* Melindungi password.
* Mencegah unauthorized access.
* Memvalidasi input.
* Tidak mengekspos data sensitif.

## 24.2 Performance

Sistem harus:

* Menggunakan pagination untuk dataset besar.
* Menyediakan search/filter yang efisien.
* Menghindari loading seluruh data apabila tidak diperlukan.

## 24.3 Reliability

Operasi keuangan harus menjaga konsistensi data.

Operasi yang memengaruhi beberapa data terkait harus diproses secara atomic sesuai kebutuhan.

## 24.4 Usability

Interface harus:

* Konsisten.
* Memiliki feedback setelah action.
* Menampilkan error yang jelas.
* Menyediakan confirmation untuk tindakan destruktif.
* Responsive pada perangkat yang ditargetkan.

---

# 25. Reporting & Export

Fitur export hanya tersedia jika termasuk dalam scope implementasi yang telah disepakati.

Jika export diterapkan, format dan isi harus ditentukan sebelum development fitur tersebut.

Sistem tidak boleh menganggap semua halaman otomatis memiliki fitur export.

---

# 26. Notifications

Sistem tidak mencakup:

* WhatsApp notification.
* SMS.
* Email automation.
* Push notification.

Notifikasi eksternal merupakan scope terpisah kecuali ditambahkan melalui perubahan scope resmi.

---

# 27. Out of Scope

Fitur berikut tidak termasuk dalam scope baseline:

1. Custom print designer.
2. Mobile application native.
3. Payment gateway.
4. Automatic bank reconciliation.
5. Bank API integration.
6. WhatsApp API.
7. SMS gateway.
8. Email automation.
9. Payroll.
10. Full accounting/general ledger.
11. Full inventory management.
12. POS.
13. Multi-company.
14. Multi-currency.
15. External third-party integrations.
16. Fitur bisnis baru yang tidak tercantum dalam PRD ini.

Penambahan fitur setelah PRD disetujui merupakan perubahan scope dan harus dievaluasi secara terpisah.

---

# 28. Acceptance Criteria

## AC-001 — Authentication

**Given** user memiliki credential valid
**When** user melakukan login
**Then** sistem mengautentikasi user dan memberikan akses berdasarkan role.

## AC-002 — Operator Payment Access

**Given** user memiliki role Operator
**When** user membuka Pembayaran
**Then** sistem mengizinkan akses.

## AC-003 — Admin Payment Restriction

**Given** user memiliki role Admin
**When** user membuka menu atau endpoint Pembayaran
**Then** sistem menolak akses.

## AC-004 — Customer

**Given** user memiliki permission Customer
**When** user membuat customer dengan data valid
**Then** customer berhasil disimpan dan memiliki identifier unik.

## AC-005 — Invoice

**Given** invoice memiliki detail valid
**When** invoice disimpan
**Then** sistem menghitung total berdasarkan detail transaksi.

## AC-006 — Payment

**Given** invoice memiliki outstanding
**When** Operator mencatat pembayaran valid
**Then** sistem menyimpan pembayaran dan mengurangi outstanding.

## AC-007 — Paid Invoice

**Given** outstanding invoice menjadi Rp0
**When** pembayaran berhasil dikonfirmasi
**Then** status invoice menjadi `Paid` sesuai workflow.

## AC-008 — Deposit

**Given** customer memiliki saldo Rp10.000.000
**When** deposit sebesar Rp3.000.000 digunakan
**Then** saldo menjadi Rp7.000.000.

## AC-009 — Insufficient Deposit

**Given** saldo customer Rp2.000.000
**When** user mencoba menggunakan Rp3.000.000
**Then** sistem menolak transaksi.

## AC-010 — Unique Document Number

**Given** nomor dokumen sudah digunakan
**When** sistem mencoba membuat dokumen dengan nomor yang sama
**Then** sistem menolak duplicate number.

## AC-011 — Historical Integrity

**Given** invoice telah dibuat dengan harga tertentu
**When** harga master item berubah
**Then** nilai invoice lama tidak berubah.

## AC-012 — Unauthorized Direct Access

**Given** user adalah Admin
**When** user mengirim request langsung ke endpoint Pembayaran
**Then** backend tetap menolak request.

---

# 29. Definition of Done

Sebuah fitur dianggap selesai apabila:

1. Requirement telah diimplementasikan.
2. UI telah tersedia.
3. Backend/API telah tersedia jika diperlukan.
4. Database integration telah selesai.
5. Validation telah diterapkan.
6. Authorization telah diterapkan.
7. Error handling telah diterapkan.
8. Acceptance criteria terpenuhi.
9. Tidak terdapat critical bug.
10. Fitur tidak melanggar scope PRD.
11. Fitur telah diuji pada kondisi normal dan edge case yang relevan.

---

# 30. Testing Requirements

Testing minimal mencakup:

## 30.1 Authentication Test

* Login valid.
* Login invalid.
* Logout.
* Session expiration.

## 30.2 Authorization Test

```text
Operator → Payment → ALLOW
Admin    → Payment → DENY
```

Authorization harus diuji pada:

* UI.
* Route.
* Backend/API.

## 30.3 CRUD Test

Seluruh master data harus diuji untuk:

* Create.
* Read.
* Update.
* Delete/nonaktifkan.

## 30.4 Transaction Test

Uji:

* Penawaran.
* Invoice.
* Payment.
* Kwitansi.
* Deposit.

## 30.5 Financial Calculation Test

Uji:

* Subtotal.
* Total.
* Outstanding.
* Payment allocation.
* Deposit balance.

## 30.6 Regression Test

Perubahan pada satu modul tidak boleh merusak modul transaksi lain.

---

# 31. Success Criteria

Produk dianggap memenuhi tujuan apabila:

1. Pengguna dapat login sesuai role.
2. Operator dapat mengakses seluruh fitur yang ditentukan.
3. Admin dapat menggunakan seluruh fitur yang ditentukan kecuali Pembayaran.
4. Data customer, kegiatan, dan item dapat dikelola.
5. Penawaran dapat dibuat dan dikelola.
6. Faktur dapat dibuat dan dikelola.
7. Pembayaran dapat dicatat oleh Operator.
8. Admin tidak dapat mengakses Pembayaran.
9. Kwitansi dapat dihasilkan sesuai transaksi.
10. Deposit customer dapat dicatat dan dilacak.
11. Rekap dapat digunakan untuk melihat informasi transaksi.
12. Nomor dokumen dapat dikelola secara konsisten.
13. Data transaksi tetap konsisten.
14. Output dokumen sesuai data transaksi.
15. Tidak terdapat fitur di luar scope yang secara tidak sengaja dianggap sebagai bagian dari deliverable.

---

# 32. Open Questions / Decision Log

Bagian ini digunakan selama development untuk mencatat keputusan yang belum dikunci.

| ID      | Decision / Question                                              | Status                                                    |
| ------- | ---------------------------------------------------------------- | --------------------------------------------------------- |
| DEC-001 | Apakah pembayaran dapat dialokasikan ke lebih dari satu invoice? | Perlu dikunci bila dibutuhkan                             |
| DEC-002 | Apakah overpayment diperbolehkan?                                | Perlu dikunci                                             |
| DEC-003 | Apakah deposit dapat langsung digunakan untuk invoice?           | Perlu dikunci                                             |
| DEC-004 | Apakah invoice yang telah memiliki pembayaran boleh diedit?      | Perlu dikunci                                             |
| DEC-005 | Apakah export Excel/PDF termasuk scope final?                    | Perlu dikonfirmasi jika belum tercantum dalam kesepakatan |

### Rule

Jika sebuah decision belum dikunci, developer tidak boleh membuat asumsi yang dapat mengubah perilaku bisnis tanpa keputusan eksplisit.

---

# 33. Change Log

| Version | Date              | Changes                                  |
| ------- | ----------------- | ---------------------------------------- |
| 1.0     | 23 September 2026 | Final PRD baseline                       |
| 1.0     | 23 September 2026 | Added Operator/Admin role model          |
| 1.0     | 23 September 2026 | Restricted Admin from Payment            |
| 1.0     | 23 September 2026 | Removed Custom Print Designer from scope |

---

# 34. Document References

Dokumen yang menjadi referensi:

1. Project Scope and Development Agreement.
2. RAB / Project Budget.
3. Invoice Termin 1.
4. Technical & Infrastructure Baseline.
5. Dokumen keputusan/perubahan scope yang telah disetujui.

PRD ini harus dibaca bersama dokumen teknis dan dokumen kesepakatan proyek.

---

# 35. Final Scope Statement

Baseline produk yang akan dikembangkan adalah:

```text
SISTEM KEUANGAN CV ANDARA

Authentication
│
├── Operator
│   └── Full Access
│
└── Admin
    └── Full Access
        └── EXCEPT Pembayaran

DASHBOARD

MASTER DATA
├── Customer
├── Kegiatan
└── Item

TRANSAKSI
├── Penawaran
├── Faktur Penjualan
├── Pembayaran
└── Kwitansi

KEUANGAN
├── Deposit Customer
└── Rekap

PENGATURAN
└── Penomoran

OUTPUT
├── Penawaran
├── Faktur
└── Kwitansi
```

**Custom Print Designer tidak termasuk dalam baseline scope.**

PRD ini merupakan baseline requirement untuk development. Setiap perubahan terhadap fungsi, workflow, role, atau scope setelah dokumen ini disetujui harus dicatat sebagai perubahan requirement.


# Technical & Architecture Baseline
## Sistem Manajemen Operasional & Transaksi CV. ANDARA

**Document Type:** Internal Technical & Architecture Baseline  
**Version:** 1.1 Final  
**Status:** Final Baseline for Development  
**Date:** 23 September 2026  
**Project:** Sistem Manajemen Operasional & Transaksi CV. ANDARA  
**Client:** CV. ANDARA / M Dafa Fakhrika  
**Developer:** M Naufal Fauzan  

---

# 1. Document Purpose

Dokumen ini merupakan baseline teknis final untuk pembangunan Sistem Manajemen Operasional & Transaksi CV. ANDARA.

Dokumen ini menjadi acuan utama untuk:

- pemilihan teknologi;
- struktur aplikasi;
- arsitektur frontend dan backend;
- desain database;
- REST API;
- authentication dan authorization;
- financial transaction processing;
- payment allocation dan customer deposit;
- penomoran transaksi;
- file storage;
- deployment production;
- security;
- backup dan recovery;
- logging dan monitoring;
- testing;
- coding standards;
- aturan untuk developer dan AI coding assistant.

Dokumen ini menjawab pertanyaan **"bagaimana sistem dibangun"**, sedangkan PRD menjawab **"apa yang harus sistem lakukan"**.

---

# 2. Document Hierarchy & Source of Truth

Urutan acuan proyek adalah:

1. **PROJECT SCOPE & DEVELOPMENT AGREEMENT**  
   Sumber kebenaran untuk scope, batas pekerjaan, ketentuan komersial, dan kesepakatan kontraktual.

2. **RAB versi terbaru yang telah disepakati**  
   Sumber acuan breakdown biaya komersial.

3. **PRD Final**  
   Sumber kebenaran untuk kebutuhan produk, business rules, role behavior, dan acceptance criteria.

4. **Technical & Architecture Baseline ini**  
   Sumber kebenaran untuk keputusan arsitektur dan implementasi teknis.

5. **Keputusan tertulis terbaru yang disetujui**  
   Jika terdapat perubahan setelah dokumen final, perubahan yang disetujui harus didokumentasikan dan menjadi dasar revisi baseline.

### 2.1 Aturan Konflik Dokumen

Jika terdapat konflik antar dokumen:

- developer tidak boleh memilih aturan berdasarkan asumsi pribadi;
- AI coding assistant tidak boleh diam-diam mengubah business rule;
- konflik harus dicatat;
- keputusan final harus dibuat sebelum implementasi yang terdampak dilanjutkan;
- perubahan material harus menghasilkan pembaruan dokumen yang relevan.

### 2.2 Commercial Context

Sebagai konteks baseline terbaru yang tercermin di PRD:

- total project: **Rp9.400.000**;
- alokasi server + domain tahun awal: **Rp1.400.000**;
- nilai pengembangan/software: **Rp8.000.000**;
- **Visual Print Designer / Desain Cetakan berada di luar scope**.

Nilai di atas hanya konteks proyek dan **bukan source of truth komersial** di dokumen teknis ini.

---

# 3. Scope Teknis Sistem

Sistem yang dibangun adalah aplikasi web internal untuk operasional dan monitoring transaksi CV. ANDARA dengan alur utama:

```text
Customer
   ↓
Kegiatan
   ↓
Item
   ↓
Penawaran
   ↓
Faktur Penjualan
   ↓
Pembayaran
   ├── Payment Allocation → Faktur
   │
   └── Excess → Deposit Customer
                    ↓
              Invoice berikutnya

Pembayaran
   ↓
Kwitansi

Seluruh transaksi
   ↓
Rekap / Dashboard
```

Modul teknis:

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

KEUANGAN / REKAP
├── Deposit Customer
└── Rekap

PENGATURAN
└── Penomoran
```

Tidak ada arsitektur, entity, route, module, atau UI untuk Visual Print Designer dalam baseline ini.

---

# 4. Architectural Principles

Pengembangan mengikuti prinsip berikut:

1. **Simple over complex** — gunakan solusi paling sederhana yang memenuhi requirement.
2. **Correctness over premature optimization** — integritas transaksi keuangan lebih penting daripada optimasi yang belum dibutuhkan.
3. **Secure by default** — permission dan credential protection harus menjadi bagian dari desain, bukan tambahan belakangan.
4. **Data integrity first** — database constraint dan transaction boundary harus menjaga data tetap konsisten.
5. **Business logic explicit** — aturan bisnis finansial tidak boleh tersembunyi di frontend.
6. **Single source of truth** — setiap nilai finansial memiliki sumber data yang dapat ditelusuri.
7. **Modular monolith** — satu aplikasi backend modular dengan satu database PostgreSQL.
8. **Cost-efficient** — hindari service tambahan yang tidak diperlukan oleh workload saat ini.
9. **Maintainable** — struktur kode dan database harus mudah dipelihara oleh developer berikutnya.
10. **Scope controlled** — technical implementation tidak boleh memperluas product scope secara sepihak.
11. **Auditability** — transaksi finansial harus dapat ditelusuri dari sumber sampai hasil akhirnya.
12. **Forward compatible where reasonable** — struktur dapat ditingkatkan tanpa over-engineering.

---

# 5. Architecture Decision Summary

| Area | Decision |
|---|---|
| Architecture | Modular Monolith |
| Backend | Java + Spring Boot |
| API | REST + JSON |
| Frontend | React + TypeScript |
| Frontend Build | Vite |
| Routing | React Router |
| Server State | TanStack Query |
| Form | React Hook Form |
| Validation | Zod + backend validation |
| ORM | Spring Data JPA / Hibernate |
| Database | PostgreSQL |
| Migration | Flyway |
| Security | Spring Security |
| Authentication | Session-based authentication |
| Password Hashing | BCrypt |
| Runtime | Docker / Docker Compose |
| OS | Ubuntu LTS |
| Reverse Proxy | Nginx |
| DNS / Proxy / SSL | Cloudflare |
| Object Storage | Cloudflare R2 |
| Monitoring | UptimeRobot Free |
| Error Monitoring | Sentry Free |
| Payment Gateway | None |
| Redis | None |
| Kafka | None |
| Kubernetes | None |
| Elasticsearch | None |
| Microservices | None |
| Managed Database | None |

---

# 6. High-Level System Architecture

```text
                         INTERNET
                            │
                            ▼
                     ┌─────────────┐
                     │  Cloudflare │
                     │ DNS / Proxy │
                     │ SSL / TLS   │
                     └──────┬──────┘
                            │ HTTPS
                            ▼
                     ┌─────────────┐
                     │    Nginx    │
                     │ Reverse     │
                     │ Proxy       │
                     └──────┬──────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
      React static assets            /api/*
              │                           │
              │                           ▼
              │                    Spring Boot
              │                           │
              │                           ▼
              │                      PostgreSQL
              │
              └───────────────────────────┘

Application Files ───────────────► Cloudflare R2

Database Backup ────────────────► R2 Backup Bucket

Uptime / Errors ────────────────► UptimeRobot / Sentry
```

### 6.1 Deployment Model

Production menggunakan single-VPS deployment untuk scope dan workload awal.

Tidak ada kebutuhan untuk:

- multi-region;
- autoscaling cluster;
- load balancer terpisah;
- Kubernetes;
- microservices.

Jika workload meningkat, strategi pertama adalah **vertical scaling VPS** sebelum memecah arsitektur.

---

# 7. Technology Stack

## 7.1 Backend

- Java
- Spring Boot
- Spring Web
- Spring Data JPA
- Hibernate
- Spring Security
- Maven
- Bean Validation / Jakarta Validation

## 7.2 Frontend

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Zod

## 7.3 Database

- PostgreSQL
- Flyway

## 7.4 Infrastructure

- Ubuntu LTS
- Docker
- Docker Compose
- Nginx
- Cloudflare
- Cloudflare R2

---

# 8. Frontend Architecture

## 8.1 Struktur Konseptual

```text
frontend/
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   │   ├── auth/
│   │   ├── customers/
│   │   ├── kegiatan/
│   │   ├── penawaran/
│   │   ├── faktur/
│   │   ├── pembayaran/
│   │   ├── deposit/
│   │   ├── kwitansi/
│   │   ├── dashboard/
│   │   ├── rekap/
│   │   └── numbering/
│   ├── pages/
│   ├── layouts/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── schemas/
│   ├── types/
│   └── routes/
├── public/
└── package.json
```

Struktur dapat disesuaikan selama responsibility tetap modular.

## 8.2 Frontend Rules

- TypeScript digunakan secara konsisten.
- Hindari `any` kecuali ada alasan teknis yang terdokumentasi.
- Server state dikelola dengan TanStack Query.
- Form kompleks menggunakan React Hook Form.
- Validasi form menggunakan Zod.
- Client-side validation bukan security control.
- Permission UI hanya untuk UX; authorization sebenarnya tetap di backend.
- Loading, error, empty, success state harus ditangani.
- Komponen yang dipakai lintas fitur dibuat reusable.
- Formatting nominal dan tanggal harus konsisten.

---

# 9. Backend Architecture

## 9.1 Struktur Konseptual

```text
backend/
├── src/main/java/.../
│   ├── auth/
│   ├── customer/
│   ├── kegiatan/
│   ├── penawaran/
│   ├── invoice/
│   ├── payment/
│   ├── deposit/
│   ├── kwitansi/
│   ├── numbering/
│   ├── dashboard/
│   ├── report/
│   ├── file/
│   ├── common/
│   ├── security/
│   └── config/
└── src/main/resources/
    ├── db/migration/
    └── application*.yml
```

Feature-based package organization diperbolehkan dan disarankan selama layer responsibility tetap jelas.

## 9.2 Layer Responsibility

```text
Controller / API
      ↓
Application Service
      ↓
Domain / Business Rules
      ↓
Repository
      ↓
PostgreSQL
```

Controller tidak boleh menjadi tempat utama business logic finansial.

Service/application layer menjadi tempat utama untuk:

- transaction boundary;
- authorization-aware operations;
- financial allocation;
- deposit processing;
- numbering generation;
- status calculation;
- validation antar entity.

Repository bertanggung jawab atas persistence/query, bukan business workflow.

---

# 10. API Architecture

## 10.1 General Rules

API menggunakan:

- HTTPS di production;
- REST;
- JSON;
- standard HTTP methods;
- DTO sebagai API boundary;
- structured error response;
- server-side validation.

Database entity tidak boleh diekspos langsung sebagai response API jika menyebabkan coupling atau membocorkan field internal.

## 10.2 Base Path

```text
/api
```

## 10.3 Resource Baseline

```text
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

/api/customers
/api/kegiatan
/api/items
/api/penawaran
/api/faktur
/api/pembayaran
/api/payment-allocations
/api/deposits
/api/kwitansi
/api/numbering
/api/dashboard
/api/rekap
/api/files
```

Endpoint final dapat menggunakan nested resource bila lebih tepat, tetapi business capability harus tetap tersedia.

## 10.4 HTTP Semantics

- `GET` → read/query.
- `POST` → create/process operation.
- `PUT/PATCH` → update sesuai kebijakan resource.
- `DELETE` → hanya untuk data yang aman dihapus; financial history tidak di-hard-delete secara sembarangan.

## 10.5 Standard Success Response

Format dapat menggunakan wrapper konsisten seperti:

```json
{
  "success": true,
  "data": {},
  "message": null
}
```

## 10.6 Standard Error Response

```json
{
  "success": false,
  "code": "INVOICE_NOT_FOUND",
  "message": "Faktur tidak ditemukan",
  "errors": []
}
```

Error response harus konsisten dan tidak membocorkan stack trace, query database, secret, atau detail internal.

## 10.7 HTTP Status Baseline

| Kondisi | Status |
|---|---:|
| Sukses baca/create/update | 200 / 201 |
| No Content | 204 |
| Validation error | 400 |
| Authentication required/invalid | 401 |
| Authenticated but forbidden | 403 |
| Resource not found | 404 |
| Conflict/business invariant violation | 409 |
| Unexpected server error | 500 |

---

# 11. Authentication & Session Architecture

## 11.1 Authentication

Authentication menggunakan Spring Security dengan session-based authentication.

Baseline:

- login dengan credential user;
- password di-hash, bukan plaintext;
- session disimpan dan dikelola oleh backend;
- session cookie menggunakan `HttpOnly`;
- production menggunakan `Secure`;
- `SameSite` dikonfigurasi sesuai deployment same-origin;
- session fixation protection aktif;
- logout mengakhiri session.

Karena deployment menggunakan single backend instance, tidak diperlukan distributed session store pada baseline awal.

Restart service dapat mengakhiri session aktif dan user perlu login kembali. Ini dapat diterima pada baseline awal.

## 11.2 Password Hashing

Spring Security password encoder digunakan. BCrypt menjadi baseline password hashing.

Password tidak boleh:

- disimpan plaintext;
- ditulis ke log;
- dikirim ke frontend selain pada form login;
- dimasukkan ke source control.

## 11.3 CSRF

Karena authentication menggunakan cookie-based session, protection terhadap CSRF untuk request state-changing wajib diaktifkan dan diselaraskan dengan frontend.

## 11.4 Authentication Endpoints

Minimal:

- login;
- logout;
- current-user/session info.

Password reset/email recovery hanya dibuat jika tercantum di scope produk. Tidak boleh diasumsikan otomatis ada.

---

# 12. Authorization & Permission Architecture

Authorization wajib ditegakkan di backend.

## 12.1 Roles

```text
OPERATOR
ADMIN
```

## 12.2 Permission Matrix

| Capability | Operator | Admin |
|---|---:|---:|
| Dashboard | Full | Full |
| Customer | Full | Full |
| Kegiatan | Full | Full |
| Item | Full | Full |
| Penawaran | Full | Full |
| Faktur | Full | Full |
| Payment create | ✓ | ✕ |
| Payment edit | ✓ | ✕ |
| Payment void/cancel | ✓ | ✕ |
| Payment allocation | ✓ | ✕ |
| Deposit financial mutation | ✓ | ✕ |
| Deposit view | ✓ | ✓ |
| Kwitansi view/use | ✓ | ✓ |
| Kwitansi source-payment edit | ✓* | ✕ |
| Rekap | Full | Full |
| Penomoran | Full | Full |

`*` mengikuti kebijakan payment/financial mutation dan harus tetap tunduk pada authorization service.

### 12.3 Prinsip Penting

Menyembunyikan menu di frontend tidak cukup.

Contoh:

```text
Admin → POST /api/pembayaran
```

harus ditolak oleh backend meskipun request dikirim langsung tanpa UI.

Authorization harus memeriksa:

1. user authenticated;
2. role memiliki permission;
3. user memiliki akses terhadap object/resource bila object-level rule berlaku.

---

# 13. Domain Model & Database Design

## 13.1 Technical Naming Convention

Business terminology tetap menggunakan istilah Indonesia di UI.

Technical naming menggunakan convention berikut:

| Business | Technical Entity | Table Baseline |
|---|---|---|
| User | `User` | `users` |
| Customer | `Customer` | `customers` |
| Kegiatan | `Kegiatan` | `kegiatan` |
| Item | `KegiatanItem` | `kegiatan_items` |
| Penawaran | `Penawaran` | `penawaran` |
| Detail Penawaran | `PenawaranDetail` | `penawaran_details` |
| Faktur Penjualan | `Invoice` | `invoices` |
| Detail Faktur | `InvoiceDetail` | `invoice_details` |
| Pembayaran | `Payment` | `payments` |
| Payment Allocation | `PaymentAllocation` | `payment_allocations` |
| Deposit Ledger | `DepositTransaction` | `deposit_transactions` |
| Kwitansi | `Receipt` | `receipts` |
| Penomoran | `NumberingConfiguration` | `numbering_configurations` |
| File | `Attachment` | `attachments` |
| Audit | `AuditLog` | `audit_logs` |

Nama final boleh menyesuaikan convention codebase, tetapi satu istilah harus konsisten setelah implementasi dimulai.

## 13.2 Logical Entity Set

```text
User
Customer
Kegiatan
KegiatanItem
Penawaran
PenawaranDetail
Invoice
InvoiceDetail
Payment
PaymentAllocation
DepositTransaction
Receipt
NumberingConfiguration
Attachment
AuditLog
```

Tidak ada entity/module `PrintDesign` pada baseline.

---

# 14. Entity Relationships

```text
Customer
├──< Kegiatan
├──< Penawaran
├──< Invoice
├──< Payment
├──< DepositTransaction
└──< Attachment (opsional, sesuai relasi)

Kegiatan
└──< KegiatanItem

Penawaran
└──< PenawaranDetail
       └── optional source link → KegiatanItem

Invoice
└──< InvoiceDetail
       └── optional source link → PenawaranDetail

Payment
└──< PaymentAllocation >── Invoice

Invoice
└──< DepositTransaction (DEPOSIT_USED dapat mereferensikan invoice)

Payment
└──< Receipt

Semua transaksi kritis
└──< AuditLog
```

---

# 15. Database Field Baseline

Field di bawah adalah baseline minimal. Implementasi dapat menambahkan technical metadata yang tidak mengubah business meaning.

## 15.1 users

- `id` UUID/identity
- `username` atau `email` unique
- `password_hash`
- `role`
- `is_active`
- `created_at`
- `updated_at`

## 15.2 customers

- `id`
- `code` unique
- `name`
- `company_name` nullable
- `address` nullable
- `phone` nullable
- `email` nullable
- `pic_name` nullable
- `notes` nullable
- `is_active`
- `created_at`
- `updated_at`
- `created_by`
- `updated_by`

## 15.3 kegiatan

- `id`
- `customer_id` FK
- `code` unique
- `name`
- `location` nullable
- `description` nullable
- `notes` nullable
- `status`
- `created_at`
- `updated_at`
- `created_by`
- `updated_by`

## 15.4 kegiatan_items

- `id`
- `kegiatan_id` FK
- `description`
- `volume` numeric
- `unit`
- `unit_price` numeric
- `sort_order`
- `notes` nullable
- `created_at`
- `updated_at`
- `created_by`
- `updated_by`

`subtotal` boleh disimpan sebagai cached/calculated field bila diperlukan untuk query/reporting, tetapi source of truth tetap volume × unit price dan harus divalidasi backend.

## 15.5 penawaran

- `id`
- `number` unique per document type
- `customer_id` FK
- `date`
- `status`
- `notes` nullable
- `terms` nullable
- `total_amount`
- `created_at`
- `updated_at`
- `created_by`
- `updated_by`

`total_amount` harus berasal dari detail dan tidak boleh menjadi angka manual yang dapat berbeda dari detail.

## 15.6 penawaran_details

- `id`
- `penawaran_id` FK
- `kegiatan_id` FK/nullable bila detail tidak terkait langsung
- `kegiatan_item_id` FK/nullable
- `description`
- `volume`
- `unit`
- `unit_price`
- `amount`
- `sort_order`
- `notes`

## 15.7 invoices

- `id`
- `number` unique per document type
- `customer_id` FK
- `source_penawaran_id` nullable FK
- `date`
- `status`
- `total_amount`
- `notes` nullable
- `created_at`
- `updated_at`
- `created_by`
- `updated_by`

`payment_status` pada level database dapat disimpan sebagai derived/cached state bila diperlukan, tetapi business truth harus dihitung dari payment/deposit coverage yang sah.

## 15.8 invoice_details

- `id`
- `invoice_id` FK
- `source_penawaran_detail_id` nullable FK
- `source_kegiatan_id` nullable FK
- `source_kegiatan_item_id` nullable FK bila tersedia
- `description`
- `quantity` nullable
- `unit` nullable
- `unit_price` nullable
- `amount`
- `sort_order`
- `notes`

Jika detail adalah custom/manual, source fields boleh null.

Jika berasal dari penawaran, source link wajib dipertahankan untuk anti-double-billing.

## 15.9 payments

- `id`
- `number` unique per document type
- `customer_id` FK
- `date`
- `amount`
- `payment_method`
- `destination_account` nullable
- `reference` nullable
- `notes` nullable
- `status`
- `created_at`
- `updated_at`
- `created_by`
- `updated_by`

Nominal payment tidak boleh negatif.

## 15.10 payment_allocations

- `id`
- `payment_id` FK
- `invoice_id` FK
- `amount`
- `created_at`
- `created_by`

Constraint bisnis:

```text
SUM(payment_allocations.amount WHERE payment_id = X)
    <= payments.amount
```

## 15.11 deposit_transactions

Deposit customer diperlakukan sebagai ledger, bukan angka yang dapat diedit bebas.

Field minimal:

- `id`
- `customer_id` FK
- `type`
- `amount`
- `reference_type`
- `reference_id`
- `notes`
- `created_at`
- `created_by`

Type baseline:

```text
DEPOSIT_IN
DEPOSIT_USED
DEPOSIT_REFUND
DEPOSIT_ADJUSTMENT
```

UI `REFUND` dan `ADJUSTMENT` tidak otomatis dianggap fitur MVP; keduanya hanya boleh tersedia jika termasuk kebutuhan yang telah disetujui. Ledger harus tetap dirancang agar extensible.

## 15.12 receipts

- `id`
- `number` unique per document type
- `payment_id` FK unique
- `date`
- `notes` nullable
- `created_at`
- `created_by`

One payment → maksimal satu receipt pada baseline.

## 15.13 numbering_configurations

- `id`
- `document_type` unique
- `prefix`
- `suffix`
- `reset_period`
- `counter_digits`
- `include_year`
- `year_format`
- `include_month`
- `month_format`
- `separator`
- `is_active`
- `created_at`
- `updated_at`

Counter state harus dipisahkan dari konfigurasi atau dikelola dalam row counter periodik yang dapat dilock secara transactional.

## 15.14 attachments

- `id`
- `reference_type`
- `reference_id`
- `original_filename`
- `object_key`
- `content_type`
- `size_bytes`
- `checksum` nullable
- `created_at`
- `created_by`

## 15.15 audit_logs

- `id`
- `actor_user_id`
- `action`
- `entity_type`
- `entity_id`
- `before_data` nullable
- `after_data` nullable
- `created_at`
- `request_id` nullable

Audit payload harus menghindari password, secret, dan data sensitif yang tidak perlu.

---

# 16. Database Data Types & Constraints

## 16.1 Currency

Semua nominal Rupiah menggunakan `NUMERIC/DECIMAL`.

**Dilarang menggunakan floating point (`float`/`double`) sebagai source of truth nominal uang.**

## 16.2 Quantity

Volume/quantity menggunakan numeric/decimal agar mendukung desimal.

## 16.3 Primary Key

UUID atau identity/sequence diperbolehkan. Pilihan harus konsisten di seluruh schema.

## 16.4 Constraints Minimum

Database harus menggunakan:

- primary key;
- foreign key;
- unique constraints;
- not-null sesuai kebutuhan;
- check constraints bila aman dan berguna;
- indexes untuk field yang sering dicari/filter;
- transaction isolation yang sesuai untuk financial operations.

## 16.5 Referential Integrity

Data referential harus dipertahankan.

Parent entity tidak boleh di-hard-delete jika sudah memiliki histori transaksi yang bergantung padanya.

Gunakan soft delete/archive/nonaktif bila diperlukan.

---

# 17. Financial Calculation Rules

## 17.1 Item

```text
Item Total = Volume × Unit Price
```

## 17.2 Activity

```text
Activity Total = Σ Item Total
```

## 17.3 Quotation

```text
Quotation Total = Σ Quotation Detail Amount
```

## 17.4 Invoice

```text
Invoice Total = Σ Invoice Detail Amount
```

## 17.5 Paid/Covered Amount

Invoice dapat ditutup oleh kombinasi:

```text
Payment Allocation
+
Deposit Used
```

Sehingga:

```text
Covered Amount
= Σ PaymentAllocation.amount
+ Σ DepositUsed.amount
```

## 17.6 Outstanding

```text
Outstanding
= max(Invoice Total - Covered Amount, 0)
```

## 17.7 Invoice Status

```text
Covered Amount = 0
→ BELUM_BAYAR

0 < Covered Amount < Invoice Total
→ SEBAGIAN_DIBAYAR

Covered Amount >= Invoice Total
→ LUNAS
```

Status tidak boleh menjadi nilai manual yang menentukan financial truth.

---

# 18. Payment Allocation Engine

## 18.1 Tujuan

Payment allocation engine memisahkan:

- uang yang benar-benar diterima;
- bagian yang digunakan untuk invoice;
- bagian yang menjadi deposit.

## 18.2 Transaction Boundary

Pencatatan payment + allocation + deposit creation harus dilakukan dalam transaction boundary yang konsisten.

Jika salah satu langkah gagal, keseluruhan operasi harus rollback.

## 18.3 Scenario A — Exact Payment

```text
Invoice     50m
Payment     50m
Allocation  50m
Deposit      0
Outstanding  0
Status       LUNAS
```

## 18.4 Scenario B — Underpayment

```text
Invoice     50m
Payment     20m
Allocation  20m
Deposit      0
Outstanding 30m
Status       SEBAGIAN_DIBAYAR
```

## 18.5 Scenario C — Overpayment

```text
Invoice     50m
Payment     60m
Allocation  50m
Excess      10m
Deposit     10m
Outstanding  0
Status       LUNAS
```

## 18.6 Scenario D — Multiple Payments

Satu invoice dapat memiliki banyak payment allocations.

Satu payment juga dapat memiliki banyak allocation ke invoice yang berbeda jika workflow mendukungnya.

## 18.7 Allocation Invariants

Wajib benar:

```text
SUM(allocations per payment) <= payment.amount
```

```text
SUM(payment allocations + deposit used per invoice)
    <= invoice.total_amount
```

kecuali terdapat adjustment resmi yang memiliki workflow dan audit sendiri.

---

# 19. Customer Deposit Ledger

## 19.1 Logical Model

Deposit adalah saldo logis per customer yang dihitung dari ledger.

Tidak boleh ada field yang dapat diedit user seperti:

```text
customer.deposit_balance = 10000000
```

lalu diubah langsung menjadi angka lain tanpa mutasi.

## 19.2 Formula

```text
Deposit Balance
= Σ DEPOSIT_IN
- Σ DEPOSIT_USED
- Σ DEPOSIT_REFUND
± DEPOSIT_ADJUSTMENT
```

## 19.3 Deposit Creation

Overpayment menghasilkan `DEPOSIT_IN` yang mereferensikan payment sumber.

## 19.4 Deposit Usage

Saat deposit digunakan untuk invoice:

1. cek customer sama;
2. lock/validate balance yang tersedia;
3. pastikan penggunaan tidak melebihi saldo;
4. buat `DEPOSIT_USED` dengan reference invoice;
5. commit dalam transaction.

## 19.5 Concurrency

Dua request concurrent tidak boleh menghabiskan deposit yang sama.

Implementasi harus menggunakan transactional locking atau strategy setara sehingga:

```text
Available deposit before
- Deposit usage A
- Deposit usage B
>= 0
```

## 19.6 Traceability

Setiap `DEPOSIT_USED` harus dapat ditelusuri:

```text
Customer
  ↓
Deposit IN
  ↓
Deposit USED
  ↓
Invoice
```

---

# 20. Quotation → Invoice Architecture

## 20.1 Prinsip

Satu penawaran tidak sama dengan satu invoice.

Satu invoice tidak harus berasal dari satu penawaran.

## 20.2 Source Tracking

Setiap `invoice_detail` yang berasal dari penawaran menyimpan:

- `source_penawaran_detail_id`;
- source quantity bila digunakan;
- source amount bila digunakan.

## 20.3 Remaining Billable Amount

Untuk setiap penawaran detail yang menjadi sumber invoice:

```text
Remaining Billable
= Source Amount
- Σ Invoiced Amount
```

Jika sistem menggunakan quantity sebagai dasar partial invoicing:

```text
Remaining Quantity
= Source Quantity
- Σ Invoiced Quantity
```

Tidak boleh ada billing yang melewati nilai/quantity sumber yang masih tersedia.

## 20.4 Double Billing Prevention

Backend harus menolak atau menampilkan error ketika:

```text
Requested Bill > Remaining Billable
```

Untuk custom invoice yang tidak berasal dari quotation, source reference boleh kosong.

## 20.5 Locking Source Data

Setelah bagian quotation digunakan untuk invoice:

- data finansial sumber yang telah ditagihkan tidak boleh berubah secara diam-diam;
- perubahan harus menggunakan revision/controlled adjustment;
- histori invoice yang sudah ada tidak boleh ikut berubah karena master data berubah.

---

# 21. Financial Locking & Mutation Policy

## 21.1 Financial Core Data

Financial core mencakup:

- volume yang telah menjadi basis dokumen finansial;
- unit price yang telah menjadi basis dokumen finansial;
- invoice detail amount;
- invoice total;
- payment amount;
- payment allocation;
- deposit ledger;
- transaction number.

## 21.2 Locking Level

### Sebelum digunakan dalam transaksi

Data dapat diedit sesuai permission dan status.

### Setelah digunakan dalam financial transaction

Data menjadi controlled/locked.

Perubahan terhadap nominal harus:

- ditolak; atau
- dilakukan melalui revision/correction/adjustment yang tercatat.

## 21.3 No Silent Mutation

Contoh yang dilarang:

```text
Invoice = 50m
Payment  = 20m

User mengubah invoice menjadi 10m
```

tanpa mekanisme koreksi.

Sistem harus menjaga agar histori tetap konsisten.

---

# 22. Transaction Management

## 22.1 Financial Operations Requiring @Transactional

Minimal:

- create payment;
- edit/void payment bila tersedia;
- payment allocation;
- overpayment → deposit creation;
- deposit usage;
- invoice creation from quotation;
- numbering generation + document persistence;
- any operation that changes multiple financial tables atomically.

## 22.2 Rollback Rule

Jika bagian penting operation gagal, seluruh transaction harus rollback.

Contoh:

```text
Payment 60m
Allocation 50m
Deposit creation 10m
```

Jika deposit creation gagal, sistem tidak boleh meninggalkan payment allocation 50m dalam keadaan setengah jadi tanpa deposit/integrity resolution.

---

# 23. Numbering Engine

## 23.1 Supported Document Types

Minimum:

- Penawaran
- Faktur Penjualan
- Pembayaran
- Kwitansi

## 23.2 Configurable Components

- prefix;
- suffix;
- year;
- month;
- counter;
- separator;
- counter digit length;
- reset period.

## 23.3 Reset Period

Baseline:

- never reset;
- yearly;
- monthly.

## 23.4 Example

Pattern:

```text
JKT-[SHORT_YEAR][MONTH][COUNTER]
```

Possible output:

```text
JKT-260900123
```

Contoh hanya ilustrasi.

## 23.5 Generation Algorithm

Baseline teknis:

1. load active numbering configuration;
2. hitung period key berdasarkan reset period;
3. lock counter row untuk document type + period;
4. increment counter;
5. render formatted number;
6. insert document;
7. enforce unique constraint;
8. commit.

Jika terjadi unique conflict karena race condition, request harus gagal secara aman atau melakukan retry transaction tanpa menghasilkan duplicate number.

## 23.6 Database Constraint

Minimal:

```text
UNIQUE(document_type, number)
```

atau equivalent unique scope yang dipilih implementasi.

Nomor yang sudah diterbitkan tidak boleh dipakai ulang hanya karena dokumen dibatalkan.

Perilaku gap number dapat terjadi pada rollback/crash dan tidak wajib dipaksa contiguous selama uniqueness dan traceability terjaga.

---

# 24. File & Object Storage Architecture

## 24.1 Storage

Cloudflare R2 digunakan untuk:

- bukti pembayaran;
- attachment transaksi;
- file pendukung yang masuk scope.

Database hanya menyimpan metadata/reference.

## 24.2 Bucket Baseline

```text
andara-files
├── payment-proofs/
├── attachments/
└── other/

andara-backups
├── daily/
├── weekly/
└── monthly/
```

Application files dan backup dipisahkan.

## 24.3 Security

Bucket application file sebaiknya private.

Akses file harus melewati authorization system dan/atau signed URL yang berumur terbatas.

File tidak boleh dibuat public hanya agar UI dapat mengaksesnya.

## 24.4 Upload Flow

Baseline sederhana:

```text
User
 ↓
Frontend multipart upload
 ↓
Authorized backend
 ↓
Validate file
 ↓
Upload to R2
 ↓
Save metadata in PostgreSQL
```

Jika penyimpanan R2 gagal, metadata database tidak boleh tercatat sebagai file yang berhasil.

## 24.5 File Validation

Minimal:

- allowed content type;
- file size limit configurable;
- generated object key;
- filename tidak menjadi identifier unik utama;
- private access;
- uploader tercatat.

---

# 25. Dashboard & Reporting Architecture

Dashboard dan rekap harus membaca transactional truth dari database.

## 25.1 Source Data

KPI dihitung dari:

- customers;
- kegiatan;
- penawaran;
- invoices;
- payments;
- payment allocations;
- deposit transactions.

## 25.2 Query Rules

- gunakan aggregate query di database;
- hindari N+1 query pada dashboard;
- gunakan index untuk filter penting;
- jangan menyimpan angka dashboard manual.

## 25.3 Caching

Tidak diperlukan distributed cache pada baseline.

Caching hanya boleh ditambahkan kemudian jika profiling menunjukkan kebutuhan nyata.

---

# 26. Search, Filter, Pagination

Minimal resource dengan list:

- customers;
- kegiatan;
- penawaran;
- invoices;
- payments;
- rekaps.

harus mendukung kombinasi yang relevan dari:

- keyword search;
- date filter;
- status filter;
- customer filter;
- pagination;
- deterministic sorting.

Query yang besar harus menggunakan pagination dan tidak mengirim seluruh tabel sekaligus.

---

# 27. Database Migration Strategy

Flyway menjadi satu-satunya baseline schema migration mechanism.

## Rules

1. setiap perubahan schema memiliki migration baru;
2. migration yang sudah diterapkan tidak diedit untuk mengubah histori;
3. gunakan naming version yang konsisten;
4. production deployment menjalankan migration sebelum aplikasi menggunakan schema baru bila diperlukan;
5. backup database dilakukan sebelum migration production yang berisiko;
6. destructive migration harus diperlakukan sebagai perubahan berisiko dan memiliki recovery plan.

Contoh:

```text
V1__init.sql
V2__add_customer_indexes.sql
V3__add_payment_allocation.sql
V4__add_deposit_ledger.sql
```

Nama versi final mengikuti convention Flyway yang digunakan codebase.

---

# 28. Environment Management

Minimal environment:

```text
Development
Production
```

Staging bukan mandatory baseline.

## 28.1 Configuration

Semua environment-specific configuration dipisahkan dari source code.

Contoh variable:

```text
APP_ENV
APP_BASE_URL
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD
SESSION_COOKIE_NAME
R2_ENDPOINT
R2_ACCESS_KEY
R2_SECRET_KEY
R2_BUCKET_FILES
R2_BUCKET_BACKUPS
SENTRY_DSN
```

Nilai aktual tidak boleh dicommit ke Git.

---

# 29. Deployment Architecture

## 29.1 Container Strategy

Production menggunakan Docker Compose atau mekanisme container orchestration sederhana pada satu VPS.

Baseline services:

```text
nginx
frontend/static
backend
postgres
```

PostgreSQL dapat dijalankan sebagai container dengan persistent volume apabila deployment strategy menggunakan Compose. Backup tetap disimpan di R2, bukan hanya volume lokal.

## 29.2 Reverse Proxy

Nginx menangani:

- HTTPS termination bila SSL di-terminate pada origin;
- static frontend files;
- `/api` reverse proxy ke Spring Boot;
- upload/request size configuration sesuai kebutuhan;
- basic security headers.

Cloudflare tetap menjadi layer DNS/proxy/TLS sesuai konfigurasi production.

## 29.3 Deployment Flow

```text
Git
 ↓
Build
 ↓
Test
 ↓
Docker image/build artifacts
 ↓
Production VPS
 ↓
Migration
 ↓
Health Check
 ↓
Smoke Test
```

## 29.4 Rollback

Application rollback dilakukan dengan kembali ke image/version aplikasi yang diketahui baik.

Database rollback tidak mengandalkan down migration otomatis. Untuk schema/data issue, gunakan corrective migration atau restore procedure sesuai risiko.

---

# 30. VPS Baseline

Production baseline:

```text
CPU      : 2 Core
RAM      : 2 GB
Storage  : 30 GB SSD NVMe
Location : Jakarta, Indonesia
OS       : Ubuntu LTS
```

## 30.1 Memory Rules

Karena RAM awal 2 GB:

- JVM memory harus dibatasi secara realistis;
- PostgreSQL harus dituning sesuai kapasitas;
- jangan menjalankan service yang tidak diperlukan;
- swap hanya sebagai safety buffer, bukan pengganti RAM.

## 30.2 Scaling Path

Jika resource menjadi bottleneck:

```text
2 GB
 ↓
4 GB+
 ↓
resource upgrade lainnya sesuai kebutuhan
```

Tidak langsung berpindah ke microservices.

---

# 31. Domain, DNS, TLS, & Edge

## 31.1 Cloudflare

Digunakan untuk:

- DNS;
- proxy/CDN layer bila diperlukan;
- SSL/TLS configuration;
- basic security settings.

## 31.2 TLS

Production harus dapat diakses melalui HTTPS.

TLS configuration harus mengikuti konfigurasi aman yang tersedia dari Cloudflare/Nginx.

## 31.3 Domain Ownership

Domain production harus berada di bawah kontrol Client.

Developer mendapat access yang diperlukan untuk setup dan maintenance sesuai kesepakatan.

---

# 32. Security Baseline

## 32.1 Application

- authentication wajib;
- backend authorization wajib;
- input validation;
- output encoding sesuai kebutuhan;
- secure error handling;
- no secrets in source code;
- password hashing;
- CSRF protection sesuai auth model;
- protection dari insecure direct object access.

## 32.2 Infrastructure

- SSH access dibatasi;
- firewall aktif;
- PostgreSQL tidak exposed langsung ke public internet;
- production secrets tidak disimpan di repository;
- R2 credentials least privilege;
- private storage untuk bukti transaksi;
- backup access dibatasi.

## 32.3 Database

- application DB user tidak menggunakan superuser bila tidak diperlukan;
- least privilege;
- separate credentials untuk backup/operational jobs bila memungkinkan;
- database accessible only from trusted host/network.

---

# 33. Security Headers & HTTP Controls

Nginx/application sebaiknya mengaktifkan baseline security headers yang kompatibel dengan aplikasi, minimal mencakup:

- `X-Content-Type-Options`;
- `Referrer-Policy`;
- appropriate `Content-Security-Policy` bila tidak mengganggu aplikasi;
- frame protection melalui CSP/frame-ancestors atau equivalent;
- secure cookie attributes.

Header tidak boleh ditambahkan secara membabi buta hingga merusak frontend.

---

# 34. Logging Architecture

## 34.1 Application Logging

Log digunakan untuk diagnosis tanpa membocorkan:

- password;
- session secrets;
- database password;
- R2 secrets;
- token rahasia;
- data customer secara berlebihan.

## 34.2 Structured Logging

Sedapat mungkin gunakan structured fields:

```text
level
 timestamp
 request_id
 user_id
 action
 entity_type
 entity_id
 duration_ms
 status
```

## 34.3 Financial Audit vs Technical Log

Technical log bukan pengganti audit trail.

Financial mutation harus masuk audit/history sesuai kebutuhan walaupun log teknis sudah ada.

---

# 35. Monitoring & Error Tracking

## 35.1 Uptime

UptimeRobot Free digunakan untuk memonitor availability endpoint production.

## 35.2 Error Monitoring

Sentry Free digunakan untuk application error tracking bila dikonfigurasi.

## 35.3 Health Endpoints

Backend menyediakan health check sederhana untuk internal monitoring, misalnya:

```text
/actuator/health
```

Endpoint yang exposed ke public harus mempertimbangkan informasi sensitif yang ditampilkan.

---

# 36. Backup Architecture

## 36.1 Flow

```text
PostgreSQL
   ↓
pg_dump
   ↓
gzip/compress
   ↓
R2 backup bucket
   ↓
verify upload
   ↓
cleanup according to retention
```

## 36.2 Retention Baseline

```text
Daily   : 7
Weekly  : 4
Monthly : 3
```

## 36.3 Separation

Backup tidak boleh hanya berada di disk/VPS yang sama dengan database production.

## 36.4 Backup Verification

Job backup harus memverifikasi bahwa file benar-benar berhasil dibuat dan diupload.

## 36.5 Restore Test

Sebelum go-live, restore test dilakukan pada environment terpisah.

Minimal verifikasi:

- customer;
- kegiatan;
- penawaran;
- invoice;
- payment;
- payment allocation;
- deposit;
- receipt.

## 36.6 Object Storage Backup

Metadata object storage penting harus dapat ditelusuri dari database. Kebutuhan backup untuk file aplikasi mengikuti retention/infrastructure policy yang disepakati; backup database tidak otomatis berarti object files ikut terbackup.

---

# 37. Reliability & Recovery

Baseline recovery meliputi:

- application restart;
- container restart;
- PostgreSQL restart;
- VPS restart;
- database restore dari R2;
- redeploy image aplikasi;
- reconfiguration DNS/domain;
- restoration of environment secrets melalui secure source.

Tidak ditargetkan enterprise HA/multi-region pada baseline ini.

---

# 38. Performance Baseline

Target awal adalah operational small-business workload.

Prinsip:

- pagination pada list;
- indexed filtering;
- aggregate query untuk dashboard;
- hindari N+1 query;
- transaction scope sesingkat yang aman;
- financial operations mengutamakan correctness.

Tidak ada target concurrent-user atau throughput enterprise yang ditetapkan di baseline saat ini.

Performance tuning dilakukan berdasarkan profiling/monitoring nyata, bukan asumsi.

---

# 39. Data Integrity & Concurrency Controls

## 39.1 Critical Operations

Concurrency protection wajib pada:

- numbering;
- payment allocation;
- deposit usage;
- invoice coverage calculation;
- operations yang mengubah saldo/remaining amount.

## 39.2 Locking Strategy

Pilihan implementasi dapat menggunakan:

- row-level locking;
- `SELECT ... FOR UPDATE`;
- unique constraint;
- optimistic locking/version field;
- transaction isolation;

sesuai jenis operasi.

Untuk saldo deposit dan counter numbering, implementasi harus memilih mekanisme yang benar-benar mencegah race condition.

---

# 40. Testing Architecture

## 40.1 Unit Tests

Wajib untuk:

- item calculation;
- activity total;
- quotation total;
- invoice total;
- outstanding;
- payment status;
- allocation rules;
- deposit rules;
- numbering formatter.

## 40.2 Integration Tests

Wajib mencakup:

- database persistence;
- payment transaction;
- payment allocation;
- deposit transaction;
- quotation → invoice source tracking;
- authorization;
- numbering concurrency;
- file metadata flow.

## 40.3 End-to-End / UAT

Minimal:

1. login;
2. customer;
3. kegiatan;
4. item;
5. penawaran;
6. invoice dari penawaran;
7. partial invoice;
8. payment;
9. multiple payment;
10. overpayment;
11. deposit usage;
12. kwitansi;
13. dashboard;
14. rekap;
15. numbering;
16. Admin restriction;
17. backup/restore.

---

# 41. Mandatory Financial Test Matrix

| Test | Expected |
|---|---|
| Payment = 0 | Belum Bayar |
| Payment < invoice | Sebagian Dibayar |
| Payment = invoice | Lunas |
| Payment > invoice | Lunas + Deposit |
| Multiple payments | Covered amount dijumlahkan |
| Payment allocation > payment | Reject |
| Deposit use > balance | Reject |
| Allocation > remaining invoice | Reject |
| Quotation detail billed twice | Reject / controlled adjustment |
| Admin creates payment | Reject |
| Admin API bypass | Reject |
| Duplicate number | Reject / retry safely |
| Concurrent deposit usage | Tidak boleh double-spend |
| Financial edit after payment | Reject / controlled revision |

---

# 42. Definition of Done — Technical

Sebuah fitur teknis dianggap selesai apabila:

1. memenuhi requirement PRD;
2. endpoint/service yang dibutuhkan tersedia;
3. validation backend tersedia;
4. authorization tersedia;
5. database migration tersedia jika ada perubahan schema;
6. unit/integration test untuk business logic kritis tersedia;
7. error handling dasar tersedia;
8. audit fields relevan tersedia;
9. UI handling selesai;
10. acceptance criteria terkait lulus;
11. tidak merusak feature existing;
12. dokumentasi teknis yang terdampak diperbarui.

Financial feature wajib memiliki boundary/rollback test.

---

# 43. Repository & Git Standards

## 43.1 Repository Structure

```text
andara/
├── backend/
├── frontend/
├── infrastructure/
├── docs/
└── README.md
```

## 43.2 Branch Strategy

```text
main
└── feature/*
```

Tidak diperlukan GitFlow kompleks.

## 43.3 Commit

Commit harus menjelaskan intent perubahan.

Contoh:

```text
feat: add invoice from quotation flow
fix: prevent payment over-allocation
fix: restrict admin payment API
feat: add deposit ledger
```

## 43.4 Pull/Review Checklist

Sebelum merge:

- tests pass;
- migration reviewed;
- no secrets;
- authorization checked;
- financial invariants checked;
- scope unchanged.

---

# 44. Code Quality Standards

## 44.1 General

- naming konsisten;
- class/function fokus pada satu responsibility utama;
- hindari duplicate business logic;
- hindari abstraction yang belum diperlukan;
- error handling eksplisit;
- komentar hanya untuk logic yang non-obvious.

## 44.2 Backend

- Controller tipis;
- DTO boundary;
- Service untuk business workflow;
- Repository untuk persistence;
- validation di API dan service;
- transaction boundary eksplisit;
- exceptions dipetakan ke structured API errors.

## 44.3 Frontend

- typed API client;
- forms ter-validasi;
- permission-aware navigation;
- loading/error/empty states;
- financial values tidak dihitung sebagai source of truth di client.

---

# 45. Database Index Baseline

Index wajib dipertimbangkan pada:

- `customers.code` unique;
- `customers.name` bila search memerlukan;
- `kegiatan.customer_id`;
- `penawaran.customer_id`;
- `penawaran.date`;
- `penawaran.number` unique;
- `invoices.customer_id`;
- `invoices.date`;
- `invoices.number` unique;
- `payments.customer_id`;
- `payments.date`;
- `payments.number` unique;
- `payment_allocations.payment_id`;
- `payment_allocations.invoice_id`;
- `deposit_transactions.customer_id`;
- `deposit_transactions.reference_id`;
- `audit_logs.entity_type/entity_id`.

Index final harus divalidasi terhadap query aktual agar tidak berlebihan.

---

# 46. API Security & Idempotency Considerations

Untuk operasi yang berisiko duplicate request:

- create payment;
- create receipt;
- numbering;
- financial adjustment;

backend harus mempertimbangkan duplicate submission akibat refresh, double click, retry jaringan, atau request replay.

Strategi dapat berupa:

- disabling duplicate submit di UI;
- idempotency key untuk operation tertentu;
- unique business key;
- transaction/constraint.

Untuk operasi financial, UI protection saja tidak cukup.

---

# 47. Operational Admin Rules

Admin/operator aplikasi bukan berarti database administrator.

User aplikasi tidak diberikan hak:

- menjalankan SQL arbitrer melalui aplikasi;
- mengubah database schema;
- mengubah payment allocation lewat SQL;
- mengubah deposit balance secara langsung.

Semua financial mutation harus melalui application service yang tervalidasi.

---

# 48. Technical Non-Goals

Baseline ini tidak mencakup:

- microservices;
- Kubernetes;
- Redis;
- Kafka;
- Elasticsearch;
- event-driven distributed architecture;
- multi-region;
- managed database service;
- payment gateway;
- bank API integration;
- full accounting/general ledger;
- full inventory/warehouse;
- payroll;
- native mobile application;
- SaaS multi-tenant;
- Visual Print Designer / Desain Cetakan.

Fitur di atas membutuhkan scope/technical review baru sebelum implementasi.

---

# 49. Infrastructure Cost Baseline

Sebagai baseline teknis awal, komponen yang telah disepakati/direncanakan adalah:

| Component | Baseline |
|---|---:|
| VPS | ± Rp1.200.000/tahun |
| Domain .com | Rp210.000/tahun |
| Cloudflare DNS/SSL | Rp0 pada baseline |
| R2 | Free tier baseline; overage mengikuti penggunaan |
| UptimeRobot Free | Rp0 |
| Sentry Free | Rp0 |
| PostgreSQL | Rp0 software |
| Docker | Rp0 software |
| Nginx | Rp0 software |
| Known baseline infrastructure | ± Rp1.410.000/tahun |

Catatan:

- angka provider dapat berubah;
- biaya renewal/checkout dapat berbeda;
- penggunaan R2 di atas free tier dapat menimbulkan biaya;
- angka di tabel ini bukan source of truth komersial.

---

# 50. Ownership & Access

Production infrastructure harus berada di bawah kontrol Client.

```text
Domain              → Client
Cloudflare Account  → Client
VPS                 → Client
R2                  → Client
Production Database → Client
Business Data       → Client
```

Developer menerima technical access yang diperlukan untuk development, deployment, maintenance, dan troubleshooting sesuai kesepakatan.

Production credential tidak boleh bergantung pada akun personal developer sebagai satu-satunya jalan masuk.

---

# 51. Change Control Teknis

Perubahan architecture baseline wajib direview terlebih dahulu bila memengaruhi:

- product scope;
- security model;
- database engine;
- deployment architecture;
- infrastructure cost;
- data integrity;
- timeline secara material;
- maintenance complexity secara material.

Contoh perubahan material:

- mengganti PostgreSQL;
- mengganti Spring Boot/React stack;
- menambah Redis/Kafka;
- menambah managed database;
- memindahkan storage ke provider lain;
- menambah payment gateway;
- mengubah role/permission;
- menambah multi-company;
- menambah Visual Print Designer.

Perubahan internal kecil yang tidak mengubah scope, security baseline, biaya material, atau architectural principles dapat dilakukan tanpa merevisi keseluruhan baseline, tetapi harus terdokumentasi dalam code/review.

---

# 52. Production Readiness Checklist

## 52.1 Infrastructure

- [ ] VPS aktif
- [ ] Ubuntu LTS
- [ ] SSH secured
- [ ] firewall aktif
- [ ] Docker terpasang
- [ ] Nginx terpasang
- [ ] Domain aktif
- [ ] Cloudflare DNS aktif
- [ ] HTTPS aktif

## 52.2 Application

- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] PostgreSQL running
- [ ] Flyway migration sukses
- [ ] Login diuji
- [ ] Operator diuji
- [ ] Admin diuji
- [ ] Admin payment access ditolak

## 52.3 Storage

- [ ] `andara-files` tersedia
- [ ] `andara-backups` tersedia
- [ ] payment proof upload diuji
- [ ] private file access diuji
- [ ] R2 credentials aman

## 52.4 Financial

- [ ] item calculation
- [ ] quotation total
- [ ] invoice total
- [ ] payment
- [ ] partial payment
- [ ] multiple payment
- [ ] overpayment
- [ ] deposit creation
- [ ] deposit usage
- [ ] payment allocation
- [ ] double billing prevention
- [ ] financial locking
- [ ] numbering

## 52.5 Backup & Monitoring

- [ ] daily backup aktif
- [ ] R2 upload verified
- [ ] retention configured
- [ ] restore test lulus
- [ ] UptimeRobot aktif
- [ ] Sentry/logging aktif sesuai baseline

---

# 53. AI Coding Assistant Rules

AI coding assistant wajib:

1. membaca PRD dan Technical Baseline sebelum coding;
2. tidak menambahkan fitur di luar scope tanpa persetujuan;
3. tidak membuat Visual Print Designer;
4. tidak mengubah financial business rule tanpa keputusan eksplisit;
5. tidak menjadikan frontend sebagai sumber financial truth;
6. tidak menyimpan secret di source code;
7. tidak melakukan schema change tanpa migration;
8. tidak melakukan hard delete terhadap histori finansial secara sembarangan;
9. tidak mengubah deposit balance secara langsung;
10. tidak mengizinkan Admin mengakses payment mutation melalui API;
11. menambahkan test untuk critical financial logic;
12. mempertahankan transaction boundaries;
13. tidak menambahkan infrastructure service tanpa technical justification;
14. menandai konflik requirement sebelum melakukan perubahan business logic;
15. menjaga naming dan API contract tetap konsisten;
16. tidak menyederhanakan financial workflow dengan menghapus allocation/deposit traceability;
17. tidak memperkenalkan microservices/Kubernetes/Redis/Kafka hanya demi kompleksitas arsitektur;
18. memperlakukan PRD sebagai sumber kebenaran product behavior dan baseline ini sebagai sumber kebenaran technical implementation.

---

# 54. Technical Invariants — Quick Reference

```text
T-01  Money uses DECIMAL/NUMERIC, not floating point.

T-02  Item total = volume × unit price.

T-03  Invoice payment status is derived, not manually authoritative.

T-04  Payment allocation cannot exceed payment amount.

T-05  Invoice coverage cannot exceed invoice amount without approved adjustment.

T-06  Payment excess becomes customer deposit.

T-07  Deposit is ledger-based, not freely editable balance.

T-08  Deposit cannot be spent twice under concurrent requests.

T-09  Quotation source detail cannot be double billed.

T-10  Financial mutation happens inside DB transaction boundaries.

T-11  Admin cannot mutate payment/payment-allocation/deposit-financial transactions.

T-12  Transaction numbers are unique and concurrency-safe.

T-13  Production schema changes use Flyway migrations.

T-14  Financial history is not silently mutated by master-data edits.

T-15  Production secrets are never committed to Git.

T-16  Backup is stored outside the production database/VPS.

T-17  Restore must be tested before go-live.

T-18  File access is authorized; sensitive files are not public by default.
```

---

# 55. Final Technical Baseline

Arsitektur final proyek:

```text
                      INTERNET
                          │
                          ▼
                   CLOUDFLARE
                 DNS / Proxy / TLS
                          │
                          ▼
                       NGINX
                  ┌───────┴────────┐
                  │                │
                  ▼                ▼
             React App         /api/*
                                  │
                                  ▼
                           Spring Boot
                         Modular Monolith
                                  │
                                  ▼
                             PostgreSQL

         ┌──────────────────────────────────────┐
         │                                      │
         ▼                                      ▼
 Cloudflare R2                         R2 Backup Bucket
 Application Files                      PostgreSQL Backups

         │                                      │
         └────────────── Monitoring ────────────┘
                    UptimeRobot / Sentry
```

### Core Technical Decision

> CV. ANDARA menggunakan **modular monolith** berbasis **Spring Boot + React/TypeScript + PostgreSQL** yang dijalankan secara containerized pada **VPS Ubuntu LTS 2 Core / 2 GB RAM / 30 GB NVMe**, dengan **Cloudflare** sebagai layer DNS/proxy/TLS, **Cloudflare R2** sebagai object storage dan backup target, serta **Nginx** sebagai reverse proxy.

### Core Business Technical Decision

> Integritas finansial dibangun dengan kombinasi **database constraints, transactional service layer, payment allocation, customer deposit ledger, source tracking quotation→invoice, backend authorization, dan financial locking**.

### Scope Guard

> **Visual Print Designer / Desain Cetakan tidak termasuk dalam architecture baseline maupun implementation scope.** Tidak ada route, entity, service, permission, migration, atau UI untuk fitur tersebut pada baseline ini.

### Development Readiness

Dokumen ini siap digunakan sebagai **technical baseline untuk memulai implementation**, dengan dua artefak teknis berikutnya sebagai bagian normal dari proses development:

1. **Database Schema / ERD** — menurunkan entity dan relationship menjadi schema final per migration.
2. **API Contract** — menurunkan business capabilities menjadi request/response contract endpoint final.

Kedua artefak tersebut harus mengikuti PRD dan baseline ini dan tidak boleh mengubah business scope secara sepihak.

---

# END OF DOCUMENT

# Technical & Architecture Baseline
## Sistem Manajemen Operasional Bisnis CV. ANDARA

**Document Type:** Internal Technical Baseline  
**Version:** 1.0  
**Status:** Final Baseline for Development  
**Project:** Sistem Manajemen Operasional Bisnis CV. ANDARA  
**Client:** CV. ANDARA / M Dafa Fakhrika  
**Developer:** M Naufal Fauzan

---

## 1. Document Purpose

Dokumen ini menjadi baseline teknis dan arsitektur internal untuk pengembangan Sistem Manajemen Operasional Bisnis CV. ANDARA.

Digunakan sebagai acuan untuk:
- technology stack;
- struktur aplikasi;
- arsitektur backend/frontend;
- database dan data integrity;
- deployment production;
- infrastructure;
- security;
- backup dan recovery;
- development dan testing.

Dokumen ini tidak menggantikan **PROJECT SCOPE & DEVELOPMENT AGREEMENT** sebagai sumber kebenaran untuk scope, harga, timeline, dan ketentuan komersial.

### 1.1 Source of Truth

1. **PROJECT SCOPE & DEVELOPMENT AGREEMENT** — scope dan ketentuan proyek.
2. **RAB v2.1** — nilai dan struktur biaya proyek.
3. **Technical & Architecture Baseline** — implementasi teknis.
4. Keputusan tertulis terbaru yang disetujui kedua pihak — jika ada perubahan.

Technical implementation tidak boleh memperluas business scope secara sepihak.

---

# 2. Technical Principles

Pengembangan mengikuti prinsip:

- Simple over complex
- Maintainable
- Secure by default
- Data integrity first
- Cost-efficient
- Scalable secukupnya
- Avoid unnecessary infrastructure
- Business logic harus eksplisit
- Financial data harus diproses secara transactional
- Production infrastructure berada di bawah kontrol Client

Sistem bukan ERP enterprise atau high-scale distributed system.

Arsitektur awal menggunakan **modular monolith** dengan satu backend application dan satu PostgreSQL database.

Microservices tidak diperlukan pada baseline ini.

---

# 3. System Overview

Sistem adalah aplikasi web untuk membantu operasional dan monitoring transaksi bisnis CV. ANDARA.

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
├── Penomoran
└── Desain Cetakan
```

### 3.1 Core Business Flow

```text
Customer
   ↓
Kegiatan
   ↓
Item
   ↓
Penawaran
   ↓
Faktur
   ↓
Pembayaran
   ↓
Payment Allocation
   ├── Outstanding Invoice
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

---

# 4. Technology Stack

## 4.1 Backend

- Java
- Spring Boot
- Spring Web / REST API
- Spring Data JPA
- Hibernate
- Spring Security
- Maven

Backend menggunakan REST API sebagai communication layer dengan frontend.

### 4.1.1 Backend Layering

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
PostgreSQL
```

Controller menangani HTTP/API layer. Service menangani business logic dan transaction boundary. Repository menangani persistence/data access. DTO digunakan sebagai boundary API.

Business logic tidak boleh ditempatkan secara sembarangan di Controller.

## 4.2 Frontend

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Zod

Frontend bertanggung jawab atas UI, routing, form, client-side validation, API interaction, loading/error state, dan permission-aware UI.

Client-side validation tidak menggantikan server-side validation.

## 4.3 Database

- PostgreSQL
- Flyway untuk database migration
- Hibernate/JPA sebagai ORM

Database menjadi source of truth untuk transactional data.

Schema production tidak boleh diubah secara manual sebagai metode deployment normal.

## 4.4 Infrastructure Runtime

- Ubuntu LTS
- Docker
- Nginx
- Cloudflare

---

# 5. High-Level Architecture

```text
                         INTERNET
                            │
                            ▼
                     ┌─────────────┐
                     │  Cloudflare │
                     │ DNS / Proxy │
                     │ SSL / TLS   │
                     └──────┬──────┘
                            │
                            ▼
                     ┌─────────────┐
                     │    Nginx   │
                     │ Reverse     │
                     │ Proxy       │
                     └──────┬──────┘
                            │
                            ▼
                     ┌─────────────┐
                     │ React       │
                     │ Frontend    │
                     └──────┬──────┘
                            │ REST API
                            ▼
                     ┌─────────────┐
                     │ Spring Boot │
                     │ Backend     │
                     └──────┬──────┘
                            │
                            ▼
                     ┌─────────────┐
                     │ PostgreSQL  │
                     └─────────────┘


Application Files
        │
        ▼
Cloudflare R2
        │
        ├── andara-files
        │
        └── andara-backups
```

---

# 6. Application Architecture

## 6.1 Frontend Architecture

Struktur konseptual:

```text
frontend/
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── pages/
│   ├── layouts/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── schemas/
│   └── types/
```

Struktur final dapat disesuaikan selama modularitas tetap dipertahankan.

Rules:
- Gunakan TypeScript secara konsisten.
- Hindari `any` kecuali ada alasan teknis jelas.
- Gunakan reusable components.
- Gunakan React Hook Form untuk form kompleks.
- Gunakan Zod untuk schema validation.
- Gunakan TanStack Query untuk server state/API state.
- Permission UI mengikuti authorization backend.

## 6.2 Backend Architecture

Struktur konseptual:

```text
backend/
├── src/main/java/
│   └── ...
│       ├── controller/
│       ├── service/
│       ├── repository/
│       ├── entity/
│       ├── dto/
│       ├── mapper/
│       ├── validation/
│       ├── security/
│       ├── exception/
│       └── config/
└── src/main/resources/
    └── db/migration/
```

Struktur package dapat menggunakan feature-based organization apabila lebih maintainable, tetapi pemisahan responsibility wajib dipertahankan.

---

# 7. REST API Baseline

API menggunakan:
- REST
- JSON
- HTTP/HTTPS
- standard HTTP methods
- structured error response
- server-side validation

Contoh resource:

```text
/api/auth
/api/customers
/api/kegiatan
/api/items
/api/penawaran
/api/faktur
/api/pembayaran
/api/payment-allocations
/api/deposits
/api/kwitansi
/api/rekap
/api/dashboard
/api/numbering
/api/print-designs
```

Endpoint final dapat disesuaikan berdasarkan implementasi.

Gunakan DTO pada API boundary. Jangan mengekspos database entity secara mentah jika menimbulkan coupling atau security issue.

---

# 8. Database Architecture

## 8.1 Core Entities

Minimal mencakup:

```text
User
Customer
Kegiatan
Item
Penawaran
PenawaranDetail
Faktur
FakturDetail
Pembayaran
PaymentAllocation
Deposit
DepositTransaction
Kwitansi
NumberingConfiguration
PrintDesign
Attachment
```

Nama tabel/entity final dapat mengikuti coding convention, tetapi relationship dan business meaning harus dipertahankan.

## 8.2 Core Relationships

```text
Customer
├── Kegiatan
├── Penawaran
├── Faktur
├── Pembayaran
└── Deposit

Kegiatan
└── Item

Penawaran
└── Penawaran Detail

Penawaran
└── dapat menjadi sumber Faktur

Faktur
└── Faktur Detail

Faktur
└── Payment Allocation

Pembayaran
└── Payment Allocation

Pembayaran
└── Kwitansi

Deposit
└── Deposit Transaction
```

## 8.3 Data Integrity

Database harus menggunakan:
- primary key;
- foreign key;
- unique constraints;
- not-null constraints sesuai kebutuhan;
- indexes pada field yang sering dicari;
- database transaction untuk financial operations;
- decimal/numeric untuk nilai uang;
- migration melalui Flyway.

Jangan menggunakan floating point untuk nominal uang.

---

# 9. Financial Business Logic

Bagian ini adalah **critical business logic** dan wajib diperlakukan sebagai invariant sistem.

## 9.1 Item Calculation

```text
Volume × Harga Satuan = Total Item
```

Kemudian:

```text
Total Item
    ↓
Total Kegiatan
    ↓
Total Penawaran
```

## 9.2 Payment Status

```text
Paid = 0
→ BELUM BAYAR

0 < Paid < Invoice Total
→ SEBAGIAN DIBAYAR

Paid >= Invoice Total
→ LUNAS
```

Status tidak boleh bergantung pada input manual user jika dapat dihitung dari transactional data.

---

# 10. Payment Allocation & Customer Deposit

## 10.1 Principle

Satu pembayaran dapat dialokasikan ke invoice.

Jika nilai pembayaran melebihi outstanding invoice, kelebihannya menjadi **Customer Deposit**.

```text
Payment
   │
   ├── Allocation → Invoice Outstanding
   │
   └── Excess → Customer Deposit
```

## 10.2 Example

```text
Invoice A       Rp50.000.000
Payment         Rp60.000.000
```

Allocation:

```text
Invoice A       Rp50.000.000
Deposit         Rp10.000.000
```

Kemudian:

```text
Invoice B       Rp20.000.000
New Payment     Rp10.000.000
Deposit Used    Rp10.000.000
```

Hasil:

```text
Invoice B       LUNAS
Deposit Balance Rp0
```

## 10.3 Deposit Ledger

Saldo deposit tidak boleh diedit bebas.

Deposit memiliki histori transaksi, minimal konsep:

```text
DEPOSIT IN
DEPOSIT USED
DEPOSIT REFUND
DEPOSIT ADJUSTMENT
```

Saldo dihitung dari transaction history.

---

# 11. Penawaran → Faktur

Invoice bersifat fleksibel.

Sistem tidak boleh mengasumsikan:

```text
1 Penawaran = 1 Faktur
```

atau:

```text
1 Kegiatan = 1 Faktur
```

Yang didukung:
- satu Penawaran → beberapa Faktur;
- partial invoicing;
- selected Kegiatan;
- selected Item;
- selected amount/value;
- manual/custom invoice;
- invoice tanpa Penawaran jika diperlukan oleh workflow.

Sistem harus menyimpan referensi sumber ketika invoice dibuat dari quotation.

Sistem juga harus memiliki mekanisme untuk mencegah atau mendeteksi **double billing** terhadap nilai/item yang sudah ditagihkan.

---

# 12. Financial Data Integrity & Locking

Financial records harus diperlakukan lebih ketat daripada metadata biasa.

Financial data mencakup:
- harga;
- volume;
- total;
- invoice amount;
- payment amount;
- payment allocation;
- deposit balance/transaction;
- transaction number.

Perubahan terhadap data financial yang sudah digunakan dalam transaksi tidak boleh dilakukan secara sembarangan.

Jika koreksi diperlukan, gunakan mekanisme revision/correction/adjustment sesuai business rule.

Metadata non-financial dapat memiliki aturan edit yang lebih fleksibel.

---

# 13. Authentication & Authorization

Sistem menggunakan authentication dan role-based authorization.

## 13.1 Roles

### Operator
Memiliki akses penuh terhadap seluruh fitur yang termasuk scope aplikasi.

### Admin
Memiliki akses ke seluruh fitur **kecuali fitur Pembayaran**.

Tidak dibuat module Role Management karena role adalah fixed requirement project.

## 13.2 Permission Baseline

| Module | Operator | Admin |
|---|---:|---:|
| Dashboard | ✓ | ✓ |
| Customer | ✓ | ✓ |
| Kegiatan | ✓ | ✓ |
| Item | ✓ | ✓ |
| Penawaran | ✓ | ✓ |
| Faktur | ✓ | ✓ |
| Pembayaran | ✓ | ✕ |
| Deposit Customer | ✓ | sesuai aturan akses final |
| Kwitansi | ✓ | sesuai aturan akses final |
| Rekap | ✓ | ✓ |
| Penomoran | ✓ | ✓ |
| Desain Cetakan | ✓ | ✓ |

**Catatan:** akses Deposit Customer dan Kwitansi harus mengikuti business rule final. Jangan menebak hanya dari UI.

## 13.3 Authorization Rules

Authorization wajib diperiksa di backend.

Menyembunyikan menu pada frontend saja bukan security control.

Admin yang tidak memiliki akses Payment harus ditolak oleh API Payment meskipun endpoint dipanggil langsung.

---

# 14. User & Authentication Security

Baseline:
- password disimpan dalam bentuk hashed;
- credentials tidak disimpan dalam source code;
- secrets menggunakan environment/secrets configuration;
- session/token lifecycle memiliki expiry sesuai kebutuhan;
- invalid authentication ditangani secara aman;
- endpoint sensitif membutuhkan authentication.

---

# 15. File Upload & Object Storage

Application files menggunakan **Cloudflare R2**.

Contoh:
- bukti pembayaran;
- attachment transaksi;
- dokumen pendukung lainnya.

File besar tidak disimpan langsung sebagai binary di PostgreSQL. Database menyimpan metadata/reference file.

## 15.1 R2 Bucket Structure

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

Bucket application files dan backup tidak dicampur.

## 15.2 File Upload Security

Minimal:
- validasi file type;
- validasi MIME/type;
- batas ukuran file;
- generated object key;
- jangan menggunakan filename user sebagai satu-satunya storage key;
- bucket private secara default;
- controlled access/download;
- credentials R2 tidak boleh ditulis langsung di source code.

---

# 16. Infrastructure Specification

## 16.1 VPS

Production baseline:

```text
CPU      : 2 Core
RAM      : 2 GB
Storage  : 30 GB SSD NVMe
Location : Jakarta, Indonesia
OS       : Ubuntu LTS
```

Baseline ini ditujukan untuk initial production workload.

Jika kebutuhan meningkat, pendekatan pertama adalah vertical scaling/upgrading VPS sebelum distributed architecture.

## 16.2 Runtime Services

```text
Nginx
Spring Boot
PostgreSQL
```

Docker digunakan untuk application/runtime management.

Dengan RAM 2 GB:
- JVM memory harus dibatasi secara realistis;
- PostgreSQL dikonfigurasi sesuai kapasitas;
- service tidak diperlukan tidak dijalankan;
- swap dapat digunakan sebagai safety buffer, bukan pengganti RAM.

---

# 17. Domain, DNS & SSL

Domain baseline:

```text
.com
```

Domain dan production infrastructure accounts berada di bawah kontrol Client.

Cloudflare digunakan untuk:
- DNS;
- proxy;
- SSL/TLS;
- basic DNS/security configuration.

Baseline tidak membutuhkan paid Cloudflare plan.

---

# 18. Cloudflare R2 Baseline

R2 digunakan untuk object storage.

Baseline awal:
- Standard storage;
- free-tier sebagai baseline awal;
- target kebutuhan awal sekitar 10 GB-month atau di bawahnya;
- application files dipisahkan dari backup;
- penggunaan di atas free tier dapat menimbulkan biaya.

Free tier bukan berarti storage tanpa batas atau bebas biaya untuk penggunaan apa pun.

---

# 19. Backup Strategy

Backup database dilakukan otomatis:

```text
PostgreSQL
    ↓
pg_dump
    ↓
Compress
    ↓
R2 Backup Bucket
```

Backup harus berada di storage terpisah dari VPS.

## 19.1 Backup Retention

```text
Daily   : 7
Weekly  : 4
Monthly : 3
```

## 19.2 Restore Test

Sebelum production launch:

```text
Backup
   ↓
Download
   ↓
Temporary PostgreSQL
   ↓
Restore
   ↓
Verification
```

Minimal verification:
- Customer;
- Kegiatan;
- Penawaran;
- Faktur;
- Pembayaran;
- Payment Allocation;
- Deposit.

Backup yang tidak pernah diuji restore tidak dianggap cukup terverifikasi.

---

# 20. Security Baseline

## 20.1 Application Security

- HTTPS;
- authentication;
- role-based authorization;
- password hashing;
- server-side validation;
- input validation;
- secure error handling;
- no sensitive secrets in source code.

## 20.2 Infrastructure Security

- restricted SSH access;
- firewall;
- PostgreSQL tidak exposed langsung ke public internet;
- restricted R2 credentials;
- production secrets melalui secure configuration;
- database access dibatasi.

## 20.3 Data Security

- HTTPS/TLS untuk data in transit;
- R2 encryption at rest;
- private storage untuk sensitive attachments;
- protected database backups;
- least-privilege access.

---

# 21. Deployment Architecture

## 21.1 Development Flow

```text
Developer
   ↓
Git Repository
   ↓
Build
   ↓
Test
   ↓
Docker
```

## 21.2 Production Flow

```text
Source Code
    ↓
Build
    ↓
Docker Image
    ↓
VPS
    ↓
Nginx
    ↓
Application
```

Deployment harus mencakup:
- environment configuration;
- database migration;
- application deployment;
- health check;
- rollback procedure dasar.

---

# 22. Environment Management

Minimal:

```text
Development
Production
```

Staging bukan mandatory production infrastructure baseline.

Configuration harus dipisahkan dari source code.

Contoh secret/config:

```text
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD
R2_ENDPOINT
R2_ACCESS_KEY
R2_SECRET_KEY
AUTH_SECRET
```

Nama variable dapat disesuaikan dengan implementation.

Jangan commit secret ke Git repository.

---

# 23. Logging & Monitoring

## 23.1 Uptime Monitoring

**UptimeRobot Free** digunakan untuk monitoring availability/uptime endpoint production.

## 23.2 Error Monitoring

**Sentry Free** digunakan untuk application error tracking.

## 23.3 Application Logging

Log harus membantu diagnosis tanpa membocorkan:
- password;
- authentication secret;
- R2 secret;
- database password;
- sensitive business data secara berlebihan.

---

# 24. Performance & Scalability

Target awal adalah small-business operational workload, bukan high-scale public platform.

Baseline:

```text
2 Core CPU
2 GB RAM
PostgreSQL
Single Spring Boot application
Nginx
Docker
```

Jika workload meningkat:

```text
2 GB VPS
   ↓
Vertical Upgrade
   ↓
4 GB+
```

Microservices, Kubernetes, Redis, Kafka, Elasticsearch, atau distributed database tidak diperlukan pada baseline ini.

Scaling mengikuti kebutuhan nyata.

---

# 25. Availability & Recovery

Baseline recovery:
- Docker restart policy;
- application restart;
- PostgreSQL restart;
- VPS restart;
- database restore dari R2 backup;
- domain/DNS configuration recovery;
- R2 object recovery.

Target bukan enterprise high availability dengan multi-region architecture.

---

# 26. Development Standards

## 26.1 General

- readable code;
- consistent naming;
- small cohesive functions/classes;
- avoid unnecessary abstraction;
- avoid duplicate business logic;
- business rules didokumentasikan dalam code jika non-obvious.

## 26.2 Backend

Perhatikan:
- DTO boundary;
- service layer;
- transaction boundary;
- validation;
- exception handling;
- authorization;
- database constraints;
- migration.

## 26.3 Frontend

Perhatikan:
- reusable components;
- typed API data;
- form validation;
- loading state;
- error state;
- empty state;
- permission-aware UI.

## 26.4 Database

- schema migration via Flyway;
- foreign keys;
- constraints;
- indexes;
- numeric types for currency;
- no manual production schema modification sebagai workflow normal.

---

# 27. Git & Repository Structure

Baseline repository:

```text
andara/
├── backend/
├── frontend/
├── infrastructure/
├── docs/
└── README.md
```

Branch strategy:

```text
main
└── feature/*
```

Tidak diperlukan GitFlow kompleks.

Commit harus menjelaskan perubahan secara meaningful.

---

# 28. Testing Baseline

## 28.1 Backend

Minimal testing:
- service/business logic;
- API;
- financial calculation;
- payment allocation;
- deposit logic;
- authorization;
- critical persistence behavior.

## 28.2 Frontend

Minimal testing:
- form validation;
- critical interactions;
- API states;
- permission-aware UI;
- critical financial workflows.

## 28.3 Mandatory Business Tests

Sebelum production:
1. Item calculation.
2. Activity total.
3. Quotation total.
4. Invoice calculation.
5. Zero payment.
6. Partial payment.
7. Full payment.
8. Overpayment.
9. Deposit creation.
10. Deposit usage.
11. Multiple payments.
12. Payment allocation.
13. Quotation → multiple invoices.
14. Partial invoice.
15. Manual/custom invoice.
16. Operator access.
17. Admin access.
18. Admin blocked from Payment.
19. Numbering generation.
20. File upload/access.
21. Backup creation.
22. Restore test.

---

# 29. Production Deployment Checklist

## Infrastructure
- [ ] VPS active
- [ ] Ubuntu LTS installed
- [ ] SSH secured
- [ ] Firewall configured
- [ ] Docker installed
- [ ] Nginx configured
- [ ] Domain active
- [ ] Cloudflare DNS configured
- [ ] SSL/TLS active

## Application
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] PostgreSQL running
- [ ] Flyway migration successful
- [ ] Environment variables configured
- [ ] Authentication tested
- [ ] Operator tested
- [ ] Admin tested
- [ ] Admin cannot access Payment

## Storage
- [ ] R2 application bucket configured
- [ ] R2 backup bucket configured
- [ ] File upload tested
- [ ] File access tested
- [ ] R2 credentials secured

## Backup
- [ ] Daily backup configured
- [ ] Backup upload tested
- [ ] Retention configured
- [ ] Restore test completed

## Monitoring
- [ ] UptimeRobot configured
- [ ] Sentry configured
- [ ] Application logs verified

## Business Flow
- [ ] Customer flow tested
- [ ] Kegiatan tested
- [ ] Item calculation tested
- [ ] Penawaran tested
- [ ] Faktur tested
- [ ] Pembayaran tested
- [ ] Payment Allocation tested
- [ ] Deposit tested
- [ ] Kwitansi tested
- [ ] Rekap tested
- [ ] Dashboard tested

---

# 30. Technical Non-Goals

Baseline ini tidak mencakup:
- microservices;
- Kubernetes;
- Redis;
- Kafka;
- Elasticsearch;
- payment gateway;
- banking integration;
- managed database;
- native mobile application;
- full accounting/general ledger;
- full inventory system;
- payroll system;
- marketplace integration;
- unnecessary paid infrastructure services.

Fitur di luar baseline dapat dipertimbangkan sebagai future development atau scope change.

---

# 31. Infrastructure Cost Baseline

| Component | Baseline Cost |
|---|---:|
| VPS | ± Rp1.200.000 / tahun |
| Domain .com | Rp210.000 / tahun |
| Cloudflare DNS / SSL | Rp0 |
| Cloudflare R2 | Rp0 pada free-tier baseline |
| UptimeRobot Free | Rp0 |
| Sentry Free | Rp0 |
| PostgreSQL | Rp0 |
| Docker | Rp0 |
| Nginx | Rp0 |
| **Known Baseline** | **± Rp1.410.000 / tahun** |

Catatan:
- Harga provider dapat berubah.
- Pajak/biaya checkout dapat berbeda.
- Renewal domain dapat berbeda dari harga awal.
- Penggunaan R2 di luar free tier dapat menimbulkan biaya.
- Infrastructure recurring cost bukan bagian dari development fee kecuali dinyatakan lain dalam Agreement.

---

# 32. Ownership & Access

Production infrastructure harus berada di bawah kontrol Client.

```text
Domain
    → Client

Cloudflare Account
    → Client

VPS
    → Client

R2
    → Client

Production Database
    → Client

Business Data
    → Client
```

Developer memperoleh technical access yang diperlukan untuk development, deployment, maintenance, dan troubleshooting.

Production credentials tidak boleh bergantung pada akun personal Developer sebagai satu-satunya akses.

Source code/IP mengikuti ketentuan dalam Project Scope & Development Agreement.

---

# 33. Technical Change Control

Developer atau AI coding assistant tidak boleh mengubah architecture baseline secara sepihak apabila perubahan berdampak material terhadap:
- project cost;
- infrastructure cost;
- security;
- timeline;
- scope;
- maintainability;
- deployment complexity.

Contoh perubahan material:
- mengganti PostgreSQL;
- mengganti backend framework;
- mengganti frontend framework;
- menambahkan Redis/Kafka;
- memindahkan database ke managed service;
- menambah paid infrastructure;
- mengganti deployment architecture;
- menambah external integration.

Perubahan tersebut harus didokumentasikan dan disetujui sebelum diterapkan jika berdampak pada project scope.

Perubahan implementasi internal yang tidak mengubah scope, biaya, security baseline, atau deployment architecture dapat dilakukan selama tetap mengikuti prinsip dokumen ini.

---

# 34. AI Coding Assistant Rules

AI coding assistant harus:

1. Membaca dokumen ini sebelum melakukan perubahan architecture.
2. Mengikuti technology stack yang ditentukan.
3. Tidak mengganti framework tanpa persetujuan.
4. Tidak menambahkan infrastructure service tanpa alasan jelas.
5. Tidak mengubah business rule.
6. Tidak mengarang requirement.
7. Tidak menghapus financial integrity rule.
8. Tidak melewati authorization.
9. Tidak menyimpan secret di source code.
10. Tidak mengubah database production secara manual.
11. Menggunakan migration untuk schema change.
12. Menjaga backward compatibility bila memungkinkan.
13. Menulis test untuk perubahan critical business logic.
14. Memberi tahu developer jika requirement bertentangan dengan baseline.
15. Memprioritaskan correctness financial transaction dibanding convenience implementasi.

Jika requirement baru bertentangan dengan baseline, AI harus menandai konflik terlebih dahulu, bukan diam-diam mengganti baseline.

---

# 35. Final Technical Baseline

Baseline architecture:

```text
Frontend
React + TypeScript
        │
        │ REST API
        ▼
Backend
Java + Spring Boot
        │
        ▼
PostgreSQL
        │
        ├──────────────► R2 Application Storage
        │
        └──────────────► R2 Backup Storage

Internet
   │
   ▼
Cloudflare
   │
   ▼
Nginx
   │
   ▼
Dockerized Application
```

Production infrastructure:

```text
VPS
├── Nginx
├── Spring Boot
└── PostgreSQL

External Services
├── Cloudflare
├── Cloudflare R2
├── UptimeRobot Free
└── Sentry Free
```

**Core architectural decision:**

> CV ANDARA menggunakan modular monolith berbasis Spring Boot + React/TypeScript + PostgreSQL yang dijalankan menggunakan Docker pada VPS Ubuntu LTS 2 Core / 2 GB RAM / 30 GB NVMe, dengan Cloudflare sebagai DNS/proxy/SSL dan Cloudflare R2 sebagai object storage serta backup database.

Arsitektur ini menjadi baseline pengembangan awal dan dapat ditingkatkan secara bertahap apabila kebutuhan nyata meningkat.

---

# Appendix A — Quick Reference

| Area | Decision |
|---|---|
| Architecture | Modular Monolith |
| Backend | Java + Spring Boot |
| API | REST / JSON |
| Frontend | React + TypeScript |
| Build Frontend | Vite |
| Frontend Routing | React Router |
| Server State | TanStack Query |
| Forms | React Hook Form |
| Validation | Zod + Server-side validation |
| ORM | Spring Data JPA / Hibernate |
| Database | PostgreSQL |
| Migration | Flyway |
| Security | Spring Security |
| Runtime | Docker |
| OS | Ubuntu LTS |
| Reverse Proxy | Nginx |
| DNS / Proxy / SSL | Cloudflare |
| File Storage | Cloudflare R2 |
| Backup Storage | Separate R2 bucket |
| Monitoring | UptimeRobot Free |
| Error Monitoring | Sentry Free |
| VPS CPU | 2 Core |
| VPS RAM | 2 GB |
| VPS Storage | 30 GB SSD NVMe |
| Server Location | Jakarta, Indonesia |
| Domain | .com |
| Payment Gateway | None |
| Redis | None |
| Kafka | None |
| Kubernetes | None |
| Microservices | None |
| Managed DB | None |
| Backup Retention | 7 daily / 4 weekly / 3 monthly |
| Roles | Operator + Admin |
| Admin Payment Access | Not allowed |

---

# Appendix B — Critical Business Invariants

```text
1. Volume × Unit Price = Item Total.

2. Item Total → Activity Total.

3. Activity Total → Quotation Total.

4. Payment status is derived from valid paid/allocation amount.

5. Overpayment becomes Customer Deposit.

6. Deposit usage must be traceable.

7. One Invoice may have multiple Payments.

8. One Quotation may produce multiple Invoices.

9. Invoice may be partial/custom.

10. Admin cannot access Payment functionality.

11. Financial transactions require transactional integrity.

12. Financial values must not be silently altered after being used in financial transactions.

13. Production secrets must not be committed to source control.

14. Production database schema changes must use migration.

15. Backup must be stored separately from the VPS.

16. Backup restore must be tested before production launch.
```

---

**End of Technical & Architecture Baseline v1.0**

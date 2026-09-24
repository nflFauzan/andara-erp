# Task Tracking: Sistem Manajemen Keuangan & Operasional CV. ANDARA

## Project Status: PHASE 6 - Faktur Penjualan / Invoicing Management (COMPLETED ✅)
Next Target: **PHASE 7 - Pembayaran & Payment Allocation Engine**

---

### Phase 4: Numbering Engine (COMPLETED ✅)
- [x] Flyway migration `V1` + `NumberingConfiguration` entity & repository
- [x] Concurrency-safe atomic number generation using `PESSIMISTIC_WRITE` locking
- [x] Support 4 document types (`PENAWARAN`, `FAKTUR`, `PEMBAYARAN`, `KWITANSI`) with configurable reset periods
- [x] REST Controller `/api/numbering` + Unit & Integration tests (`NumberingControllerTest`)
- [x] Frontend `NumberingPage.tsx` with live prefix/suffix/counter previews

---

### Phase 5: Penawaran (Quotation) Management (COMPLETED ✅)
- [x] Flyway migration `V5__penawaran_and_details.sql` with check constraints & foreign keys
- [x] `Penawaran` & `PenawaranDetail` domain entities with authoritative server calculation
- [x] Lifecycle state transitions (`DRAFT`, `SENT`, `APPROVED`, `REJECTED`, `CANCELLED`)
- [x] Financial locking: `APPROVED` penawaran locked against modification (`FINANCIAL_RECORD_LOCKED` -> 409 Conflict)
- [x] REST Controller `/api/penawaran` + Integration tests (`PenawaranControllerTest`)
- [x] Frontend `PenawaranListPage`, `PenawaranFormPage` (with import from kegiatan), `PenawaranDetailPage` (print sheet view)

---

### Phase 6: Faktur Penjualan (Invoicing) Management (COMPLETED ✅)
- [x] Flyway migration `V6__invoice_and_details.sql` with tables `invoices` & `invoice_details`, check constraints, and realistic seeded demo invoices
- [x] `Invoice` & `InvoiceDetail` domain entities with authoritative calculations (`totalAmount`, `paymentStatus`, `outstanding`)
- [x] `InvoiceRepository` with dynamic search, customer, date range, status, and paymentStatus filtering
- [x] `InvoiceDetailRepository` with `sumBilledQuantityBySourcePenawaranDetailId` excluding `CANCELLED` invoices
- [x] **Anti-Double-Billing Rule:** Strict enforcement that total billed quantity across invoices cannot exceed the original penawaran detail volume (`DOUBLE_BILLING_PREVENTED` -> 409 Conflict)
- [x] **Remaining Billable Calculator:** `GET /api/faktur/penawaran/{id}/billable` returning remaining volume per item
- [x] Auto-numbering integration via `NumberingService.generateNextNumber(DocumentType.FAKTUR, date)`
- [x] Financial locking: Invoices with `paidAmount > 0` cannot mutate details (`FINANCIAL_RECORD_LOCKED` -> 409 Conflict)
- [x] REST Controller `/api/faktur` with full CRUD, status transitions (`DRAFT` -> `ISSUED` -> `CANCELLED`), and safe deletion rules
- [x] Frontend `invoice.ts`, `invoiceApi.ts`, `InvoiceListPage.tsx`, `InvoiceFormPage.tsx` (with modal "Tarik dari Penawaran Disetujui"), `InvoiceDetailPage.tsx` (printable tax invoice format)
- [x] 35/35 Automated tests passed (`mvn test` 100% BUILD SUCCESS)
- [x] Live API verification script (`test_invoice.ps1`) executed with 100% success

---

### Subsequent Phases Roadmap
- [ ] **Phase 7: Pembayaran & Payment Allocation Engine**
- [ ] **Phase 8: Customer Deposit Ledger System**
- [ ] **Phase 9: Kwitansi (Official Receipt) Management**
- [ ] **Phase 10: Financial Locking & Integrity Controls**
- [ ] **Phase 11: Rekap, Reports & Dashboard Analytics**
- [ ] **Phase 12: Production Hardening, VPS Deployment & Cloudflare Setup**


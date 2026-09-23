# AGENTS.md
# Sistem Manajemen Operasional & Transaksi CV. ANDARA

**Document Type:** Engineering / AI Coding Agent Instructions  
**Version:** 1.0 Final  
**Status:** Baseline for Development  
**Project:** Sistem Manajemen Operasional & Transaksi CV. ANDARA  

---

# 1. Purpose

This file defines the engineering rules, development workflow, coding standards,
architecture guardrails, safety constraints, testing requirements, and AI-agent
behavior for the CV. ANDARA project.

These rules apply to:

- Claude Code
- Antigravity IDE agents
- other AI coding assistants
- human developers

This file governs **how code is changed**.

It does not replace the project requirements or technical architecture documents.

The primary project references are:

1. **PROJECT SCOPE & DEVELOPMENT AGREEMENT**
2. **Latest approved RAB**
3. **PRD Final**
4. **Technical & Architecture Baseline**
5. **This AGENTS.md**
6. Existing implementation and tests

Higher-level project documents take precedence over lower-level implementation
assumptions.

---

# 2. Project Context

## 2.1 Product

Project:

**Sistem Manajemen Operasional & Transaksi CV. ANDARA**

The system is a web application for managing operational and transaction data.

Core business flow:

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
   ├── PAYMENT ALLOCATION → FAKTUR
   │
   └── EXCESS → DEPOSIT CUSTOMER
                         ↓
                   FAKTUR BERIKUTNYA

PEMBAYARAN
   ↓
KWITANSI

SELURUH TRANSAKSI
   ↓
REKAP / DASHBOARD
````

## 2.2 Core Modules

The current baseline includes:

* Dashboard
* Customer
* Kegiatan
* Item Kegiatan
* Penawaran
* Faktur Penjualan
* Pembayaran
* Payment Allocation
* Deposit Customer
* Kwitansi
* Rekap
* Penomoran
* Authentication / Authorization
* File / Attachment handling
* Backup / monitoring infrastructure

## 2.3 Current Project Scope

The current product baseline reflects:

* total project value: Rp9.400.000;
* server + domain initial-year allocation: Rp1.400.000;
* development/software allocation: Rp8.000.000;
* two application roles: Operator and Admin;
* Admin cannot manage payment transactions;
* Visual Print Designer / Desain Cetakan is outside the current scope.

Commercial values are context only in this file. The Agreement and latest approved RAB
remain the commercial source of truth.

---

# 3. Source of Truth and Conflict Resolution

## 3.1 Priority

When making implementation decisions, use this order:

```text
1. Project Scope & Development Agreement
2. Latest approved RAB
3. PRD Final
4. Technical & Architecture Baseline
5. AGENTS.md
6. Existing code
7. Personal assumptions
```

Existing code is **not** a higher authority than the documented requirements.

## 3.2 Conflict Rule

If two project documents conflict:

DO:

1. identify the exact conflict;
2. identify which behavior/code would be affected;
3. stop the affected material implementation;
4. report the conflict clearly;
5. ask for the required decision;
6. update the relevant documentation after the decision.

DO NOT:

* silently invent a resolution;
* silently rewrite requirements;
* choose the easiest implementation when it changes business behavior;
* use old code as proof that an undocumented behavior is still required.

## 3.3 Ambiguity Rule

When a requirement is ambiguous:

```text
Inspect → Compare → Identify ambiguity → Ask before material decision
```

A material decision includes anything that changes:

* business behavior;
* financial behavior;
* permission;
* database meaning;
* API contract;
* security;
* data integrity;
* infrastructure;
* scope;
* timeline;
* external service cost.

---

# 4. Non-Negotiable Engineering Rules

The following rules are mandatory.

1. Do not invent product requirements.
2. Do not silently change business rules.
3. Do not silently expand scope.
4. Do not implement out-of-scope features "because they may be useful".
5. Do not weaken financial integrity for UI convenience.
6. Do not rely on frontend validation for backend security.
7. Do not trust client-supplied role or permission information.
8. Do not hard-code secrets.
9. Do not commit credentials, tokens, private keys, or passwords.
10. Do not use floating-point types for monetary values.
11. Do not mutate production schema manually as the normal workflow.
12. Database schema changes must use Flyway migrations.
13. Do not hard-delete financial history without an explicitly approved mechanism.
14. Do not directly overwrite customer deposit balances without a ledger transaction.
15. Do not use manually entered payment status as the financial source of truth.
16. Do not allow payment over-allocation.
17. Do not allow deposit over-spending.
18. Do not allow unauthorized payment operations through direct API requests.
19. Do not disable tests, type checking, or linting merely to make a build pass.
20. Do not remove a test simply because the test exposes an implementation bug.
21. Do not add infrastructure services without technical justification.
22. Do not introduce unnecessary abstraction or complexity.
23. Do not mix unrelated refactoring with a focused feature change unless required.
24. Do not modify unrelated files just because an agent notices cosmetic improvements.
25. Do not expose database entities directly through the API when DTOs are required.
26. Do not silently change API contracts.
27. Do not silently change applied database migrations.
28. Do not implement Visual Print Designer / Desain Cetakan.
29. Do not introduce microservices, Kubernetes, Redis, Kafka, or other excluded
    infrastructure merely for architectural style.

---

# 5. Technology Stack Rules

The baseline stack is:

## Backend

* Java
* Spring Boot
* Spring Web
* Spring Data JPA
* Hibernate
* Spring Security
* Jakarta Validation
* Maven

## Frontend

* React
* TypeScript
* Vite
* React Router
* TanStack Query
* React Hook Form
* Zod

## Database

* PostgreSQL
* Flyway

## Infrastructure

* Ubuntu LTS
* Docker
* Docker Compose
* Nginx
* Cloudflare
* Cloudflare R2

## Monitoring

* UptimeRobot Free
* Sentry Free

Do not replace the above stack without an explicit technical decision.

---

# 6. Architecture Rules

## 6.1 Architecture Style

The application is a **modular monolith**.

Do not split the application into microservices unless a separately approved
architecture change requires it.

## 6.2 High-Level Flow

```text
Internet
   ↓
Cloudflare
   ↓
Nginx
   ↓
React frontend
   ↓ REST/JSON
Spring Boot backend
   ↓
PostgreSQL

Application files → Cloudflare R2
Database backups → separate R2 backup bucket
```

## 6.3 Backend Layering

Baseline:

```text
Controller
    ↓
Service / Domain Logic
    ↓
Repository
    ↓
PostgreSQL
```

Rules:

* Controllers stay thin.
* Controllers do not contain significant financial business logic.
* Business rules belong in services/domain logic.
* Repositories handle persistence/data access.
* DTOs form the API boundary.
* Security and authorization are enforced server-side.
* Transaction boundaries belong around business operations, not arbitrary UI actions.

## 6.4 Frontend Architecture

Conceptually:

```text
Page
  ↓
Feature
  ↓
Query / Mutation / Service
  ↓
REST API
```

Frontend should manage:

* UI state;
* route state;
* forms;
* client-side validation;
* server state;
* loading/error/empty states;
* permission-aware UI.

Frontend is not the final authority for financial calculations.

---

# 7. Repository Structure

Preferred structure:

```text
/
├── AGENTS.md
├── README.md
├── docs/
├── backend/
├── frontend/
└── infrastructure/
```

The exact folder structure may evolve with implementation, but responsibility
separation must remain clear.

Recommended backend conceptual structure:

```text
backend/
└── src/
    ├── main/
    │   ├── java/
    │   │   └── ...
    │   │       ├── controller/
    │   │       ├── service/
    │   │       ├── repository/
    │   │       ├── entity/
    │   │       ├── dto/
    │   │       ├── mapper/
    │   │       ├── validation/
    │   │       ├── security/
    │   │       ├── exception/
    │   │       └── config/
    │   └── resources/
    │       └── db/
    │           └── migration/
    └── test/
```

Recommended frontend conceptual structure:

```text
frontend/
└── src/
    ├── app/
    ├── components/
    ├── features/
    ├── pages/
    ├── layouts/
    ├── hooks/
    ├── lib/
    ├── services/
    ├── schemas/
    ├── types/
    └── routes/
```

Do not reorganize the repository merely for stylistic preference.

---

# 8. Domain Vocabulary

Use the following vocabulary consistently.

| Business term      | Technical baseline                    |
| ------------------ | ------------------------------------- |
| Customer           | `Customer`                            |
| Kegiatan           | `Kegiatan`                            |
| Item Kegiatan      | `KegiatanItem`                        |
| Penawaran          | `Penawaran`                           |
| Faktur Penjualan   | `Invoice`                             |
| Pembayaran         | `Payment`                             |
| Payment Allocation | `PaymentAllocation`                   |
| Deposit Customer   | `DepositTransaction` / deposit ledger |
| Kwitansi           | `Receipt`                             |
| Penomoran          | `NumberingConfiguration`              |
| File/Bukti         | `Attachment`                          |
| Audit              | `AuditLog`                            |

UI labels should follow the project's business terminology.

Technical names should remain consistent once implementation begins.

Do not switch terminology arbitrarily between files, services, routes, and database tables.

---

# 9. Domain and Business Rules

## 9.1 Customer

A customer may have multiple activities, quotations, invoices, payments, and
deposit transactions.

Customer records contain business identity/contact data and must be reusable
across transactions.

## 9.2 Kegiatan

Each activity belongs to exactly one customer.

A customer can have many activities.

## 9.3 Item Kegiatan

Each item belongs to one activity.

Core formula:

```text
Item Total = Volume × Unit Price
```

The backend must calculate the authoritative result.

A total supplied by the frontend is never trusted as the final financial truth.

## 9.4 Kegiatan Total

```text
Total Kegiatan = Σ Item Total
```

## 9.5 Penawaran

Quotation total:

```text
Total Penawaran = Σ included detail/activity values
```

A quotation can contain multiple activities and items.

Quotation statuses are defined by the PRD.

Do not invent a new workflow unless approved.

## 9.6 Penawaran → Faktur

The system must support creating an invoice from quotation data.

Important rules:

* one quotation may produce multiple invoices;
* an invoice may contain only part of a quotation;
* invoice selection may cover selected activities/items/values;
* source quotation must remain traceable;
* already billed portions must be tracked;
* double billing must be prevented;
* invoices can also be created without a quotation.

Never assume:

```text
1 quotation = 1 invoice
```

and never assume:

```text
1 activity = 1 invoice
```

## 9.7 Faktur

Invoice is a billable transaction.

Invoice amount must be derived from recorded details or an explicitly entered
custom invoice value through an approved form.

Payment status is derived from payment allocation.

Status rules:

```text
Paid = 0
→ BELUM BAYAR

0 < Paid < Invoice Total
→ SEBAGIAN DIBAYAR

Paid >= Invoice Total
→ LUNAS
```

Outstanding:

```text
Outstanding = max(Invoice Total - Allocated Payment, 0)
```

## 9.8 Financial Locking

Once a financial record has been used in another financial transaction,
financial core values must not be silently altered.

Examples of protected financial values:

* quantity/volume when financially committed;
* unit price;
* item subtotal;
* quotation/invoice value;
* payment amount;
* payment allocation;
* deposit mutation;
* transaction number.

If correction is required, use an approved revision/adjustment/cancellation
mechanism rather than mutating history silently.

---

# 10. Payment and Financial Integrity Rules

This project is financially sensitive. Treat this section as critical.

## 10.1 Payment

Payment records represent money actually received.

One invoice may be paid with multiple payment transactions.

Example:

```text
Invoice = Rp50.000.000

Payment 1 = Rp20.000.000
Payment 2 = Rp15.000.000
Payment 3 = Rp15.000.000

Result:
Paid = Rp50.000.000
Outstanding = Rp0
Status = LUNAS
```

## 10.2 Payment Allocation

Payment and invoice coverage are separate concepts.

A payment can:

* cover one invoice;
* cover part of an invoice;
* cover multiple invoices when the approved workflow supports it;
* create deposit from excess payment.

Core invariant:

```text
SUM(payment allocations for a payment) <= payment.amount
```

## 10.3 Overpayment

Example:

```text
Invoice A = Rp50.000.000
Payment   = Rp60.000.000

Invoice allocation = Rp50.000.000
Customer deposit   = Rp10.000.000
```

Do not record the whole Rp60.000.000 as invoice settlement.

The excess must remain traceable as customer deposit.

## 10.4 Deposit Ledger

Deposit is ledger-based.

Do not implement the deposit as a freely editable numeric field.

Concept:

```text
Deposit Balance
= Σ DEPOSIT_IN
- Σ DEPOSIT_USED
- Σ DEPOSIT_REFUND
± DEPOSIT_ADJUSTMENT
```

Every balance-changing event must be traceable to a transaction.

## 10.5 Deposit Usage

Example:

```text
Deposit = Rp10.000.000
Invoice = Rp20.000.000
New Payment = Rp10.000.000
Deposit Used = Rp10.000.000

Invoice = LUNAS
Deposit = Rp0
```

Deposit usage must:

1. belong to the same customer;
2. not exceed available balance;
3. be recorded as a ledger mutation;
4. be traceable to the invoice;
5. occur inside the appropriate database transaction.

## 10.6 Concurrency

Concurrent requests must not allow:

* double allocation;
* double spending of deposit;
* duplicate number generation.

Use appropriate transaction/locking strategy.

## 10.7 No Direct Balance Mutation

Never write code equivalent to:

```text
customer.depositBalance = newNumber
```

as the sole record of a financial event.

The source of truth must be the ledger/mutations.

---

# 11. Authentication and Authorization

## 11.1 Roles

Only two application roles are part of the current baseline:

```text
OPERATOR
ADMIN
```

## 11.2 Operator

Operator has full access to the modules and financial operations included in scope.

## 11.3 Admin

Admin can access all allowed modules except payment management.

Admin must not:

* create payment;
* edit payment;
* delete payment;
* void/cancel payment;
* perform payment allocation;
* perform financial deposit mutation.

Admin may view permitted deposit information and use document/report functions
that do not mutate payment/deposit financial state.

## 11.4 Backend Enforcement

Authorization must be enforced in backend/API.

This must fail:

```text
Admin
  ↓
POST /api/pembayaran
  ↓
403 Forbidden
```

Hiding a menu item is not authorization.

## 11.5 Object-Level Authorization

Where resources are sensitive, verify not only role but also access to the specific resource.

## 11.6 Authentication

Follow the Technical Baseline:

* secure login flow;
* password hashing;
* session lifecycle/expiry;
* secure production transport;
* CSRF protection as applicable to session-based authentication;
* logout handling.

Do not store plaintext passwords.

---

# 12. API Development Rules

Base path:

```text
/api
```

Core resources:

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
/api/numbering
/api/dashboard
/api/rekap
/api/files
```

## 12.1 HTTP Semantics

Use:

* `GET` for read/query;
* `POST` for create/process;
* `PUT/PATCH` for updates allowed by business rules;
* `DELETE` only where safe and approved.

Do not hard-delete financial history.

## 12.2 DTO Boundary

Use DTOs at API boundaries.

Do not expose persistence entities directly when that would:

* couple API to database schema;
* expose internal fields;
* weaken security;
* create recursive serialization problems.

## 12.3 Standard Success Response

Use a consistent response contract, aligned with the technical baseline:

```json
{
  "success": true,
  "data": {},
  "message": null
}
```

## 12.4 Standard Error Response

```json
{
  "success": false,
  "code": "INVOICE_NOT_FOUND",
  "message": "Faktur tidak ditemukan",
  "errors": []
}
```

Do not expose:

* stack traces;
* SQL statements;
* credentials;
* secrets;
* internal implementation details.

## 12.5 HTTP Status Baseline

Use appropriate status codes:

* `200` success;
* `201` created;
* `204` no content;
* `400` validation/bad request;
* `401` authentication failure;
* `403` authorization failure;
* `404` not found;
* `409` business conflict/invariant violation;
* `500` unexpected server error.

---

# 13. Validation Rules

Validation exists at three levels:

```text
Frontend validation
        +
Backend/business validation
        +
Database constraints
```

Their purposes differ.

## 13.1 Frontend

Optimize user experience and reduce invalid submissions.

## 13.2 Backend

Final authority for:

* business rules;
* authorization;
* financial validation;
* object access;
* invariants.

## 13.3 Database

Final structural protection for:

* unique identifiers;
* foreign keys;
* non-null constraints;
* numeric values;
* required integrity conditions.

Never assume frontend validation is sufficient.

---

# 14. Database Rules

## 14.1 Database

PostgreSQL is the source of truth for transactional data.

## 14.2 Migration

All schema changes must use Flyway.

Rules:

* never edit an already-applied production migration as the normal workflow;
* create a new migration for changes;
* review migration ordering;
* review data compatibility;
* review rollback/recovery implications.

## 14.3 Data Types

For monetary values:

```text
NUMERIC / DECIMAL
```

Never use floating-point arithmetic as the persisted financial type.

## 14.4 Constraints

Use appropriate:

* primary keys;
* foreign keys;
* unique constraints;
* not-null constraints;
* check constraints where useful;
* indexes for actual access patterns.

## 14.5 Referential Integrity

Do not use cascading deletion casually.

Before adding cascade behavior, determine whether it can destroy business history.

## 14.6 Audit Fields

Relevant entities should include:

* `created_at`
* `created_by`
* `updated_at`
* `updated_by`

Critical financial workflows must preserve traceability.

---

# 15. Database and Domain Naming

Baseline mapping:

```text
User                   → users
Customer               → customers
Kegiatan               → kegiatan
KegiatanItem           → kegiatan_items
Penawaran              → penawaran
PenawaranDetail        → penawaran_details
Invoice                → invoices
InvoiceDetail          → invoice_details
Payment                → payments
PaymentAllocation      → payment_allocations
DepositTransaction     → deposit_transactions
Receipt                → receipts
NumberingConfiguration → numbering_configurations
Attachment             → attachments
AuditLog               → audit_logs
```

Once implementation starts, do not rename core concepts repeatedly.

---

# 16. Numbering Rules

Supported minimum document types:

* Penawaran
* Faktur Penjualan
* Pembayaran
* Kwitansi

Configurable components may include:

* prefix;
* suffix;
* year;
* month;
* counter;
* separator;
* counter digit length;
* reset period.

Supported reset baseline:

* never;
* yearly;
* monthly.

## 16.1 Concurrency

Number generation must be safe under concurrent requests.

Baseline algorithm:

```text
Load configuration
      ↓
Determine period
      ↓
Lock counter scope
      ↓
Increment counter
      ↓
Render number
      ↓
Insert transaction
      ↓
Enforce unique constraint
      ↓
Commit
```

A generated number must never be duplicated.

Do not assume sequential requests from the UI.

## 16.2 No Reuse

A transaction number that has already been issued must not automatically be reused
merely because the document is cancelled.

Gaps caused by rollback/crash are acceptable unless the approved business rules
explicitly say otherwise.

---

# 17. File Upload and Storage Rules

Files are stored in Cloudflare R2.

Database stores file metadata/reference, not arbitrary binary blobs unless a
specific technical decision requires otherwise.

## 17.1 Security

For uploaded files:

* validate file type;
* validate MIME/type;
* enforce size limits;
* generate storage keys;
* do not rely on original filenames as unique identifiers;
* keep sensitive files private by default;
* authorize download/access;
* protect R2 credentials.

## 17.2 Typical Files

Examples include:

* payment proof;
* transaction attachment;
* supporting documents.

Do not create a separate file subsystem beyond the scope requirement.

---

# 18. Frontend Engineering Rules

## 18.1 TypeScript

Use TypeScript consistently.

Avoid `any`.

If `any` is unavoidable:

1. understand why;
2. keep the usage localized;
3. document the reason;
4. prefer a better type if practical.

## 18.2 Server State

Use TanStack Query for server state.

Do not create competing ad-hoc server-state systems without reason.

## 18.3 Forms

Use React Hook Form for complex forms.

Use Zod or equivalent schema validation for client-side schemas.

## 18.4 UI States

Every meaningful async screen should consider:

* loading;
* success;
* validation error;
* server error;
* empty state;
* permission restriction.

## 18.5 Financial UI

Formatted currency is presentation only.

Never use formatted strings such as:

```text
"Rp 10.000.000"
```

as the value used for financial calculations.

Keep calculations based on typed numeric/decimal-compatible data.

## 18.6 Duplicate Submission Protection

Financial action buttons should prevent accidental duplicate requests.

For example:

* disable submit while request is processing;
* handle retry intentionally;
* use server-side safeguards for true financial idempotency.

---

# 19. Backend Engineering Rules

## 19.1 Controllers

Controllers should:

* receive validated input;
* perform authorization checks through security mechanisms;
* delegate business operations;
* return standardized DTO responses.

Controllers should not implement complete payment allocation or deposit logic.

## 19.2 Services

Services own business operations and transaction boundaries.

For financial operations, use explicit transactional handling.

## 19.3 Repositories

Repositories should:

* query;
* persist;
* implement data-access concerns.

Repositories should not contain UI behavior.

## 19.4 Exceptions

Use meaningful domain/application exceptions.

Do not use generic `catch (Exception)` blocks to hide errors.

Do not return success after swallowing a failed financial operation.

---

# 20. Transaction Management

Financial operations must be transaction-safe.

Examples:

* create payment;
* allocate payment;
* create deposit from overpayment;
* use customer deposit;
* issue financial document number;
* financial adjustment/correction where supported.

For multi-step operations:

```text
validate
→ lock required records
→ calculate
→ persist mutations
→ persist audit/trace data
→ commit
```

If an operation fails:

```text
rollback
```

Do not leave half-completed financial state.

---

# 21. Idempotency and Duplicate Request Protection

For sensitive operations, think in terms of repeated requests.

Potential repeated actions include:

* payment submission;
* payment allocation;
* deposit usage;
* receipt issuance;
* number generation.

Do not rely solely on UI prevention.

Where an operation can accidentally be retried, use a suitable combination of:

* database constraints;
* transaction locking;
* unique business keys;
* request identifiers/idempotency strategy where appropriate.

Never implement a fake client-only idempotency mechanism for a financial invariant.

---

# 22. Search, Filter, Sort, Pagination

For list screens:

* use server-side pagination where appropriate;
* use deterministic sorting;
* validate filter inputs;
* do not load unbounded large datasets into the browser without a reason.

Filters should reflect real business use.

Do not add an elaborate search engine.

PostgreSQL queries are sufficient for the initial scope.

---

# 23. Dashboard and Reporting Rules

Dashboard and rekap are read models over the transactional source data.

Do not maintain independent manually editable totals.

Examples:

```text
Invoice total
Paid total
Outstanding total
Deposit total
```

must remain consistent with the underlying transaction data.

When adding a dashboard metric:

1. identify source tables;
2. define the exact formula;
3. use consistent filters;
4. verify against transaction-level calculations;
5. add tests for important metrics.

Do not duplicate financial truth in a manually maintained dashboard table unless a separate
approved architecture says so.

---

# 24. Auditability

For critical financial actions, the system should be able to answer:

* who created it;
* when it was created;
* who changed it;
* when it changed;
* what payment created an allocation;
* what invoice received an allocation;
* where a deposit came from;
* where a deposit was used.

Technical logs are not a replacement for business auditability.

Do not delete financial history merely to simplify administration.

---

# 25. Status and Lifecycle Rules

Follow the PRD.

## Penawaran

Baseline:

```text
DRAFT
   ↓
TERKIRIM / DIAJUKAN
   ├── DISETUJUI
   └── DITOLAK
```

## Faktur

Baseline:

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

Cancellation:

```text
DITERBITKAN → DIBATALKAN
```

## Pembayaran

Baseline:

```text
DRAFT → TERCATAT
```

If cancellation/void exists in the implemented workflow, it must preserve
transaction traceability.

## Kwitansi

Kwitansi is a document derived from a valid payment.

Do not create a receipt that claims payment exists when the source payment is absent
or invalid.

---

# 26. Scope Protection

The current baseline does NOT include:

* Visual Print Designer / Desain Cetakan;
* drag-and-drop document designer;
* payment gateway;
* banking API integration;
* marketplace integration;
* payroll;
* full inventory/warehouse;
* full double-entry accounting/general ledger;
* native mobile application;
* multi-tenant SaaS;
* unnecessary enterprise infrastructure.

Do not implement these features just because they are adjacent to the domain.

If a feature is requested that is outside the current scope:

```text
identify → classify → report → wait for approval
```

Do not hide scope expansion inside a refactor.

---

# 27. Security Rules

## Never

* hard-code password;
* hard-code API secret;
* hard-code R2 credential;
* commit `.env` secrets;
* expose PostgreSQL directly to public internet;
* trust client-supplied role;
* trust client-calculated financial totals;
* expose private attachments publicly;
* return stack traces through public API.

## Always

* use HTTPS in production;
* hash passwords;
* enforce backend authorization;
* validate input;
* protect session/auth state;
* use secure environment configuration;
* keep sensitive object storage private;
* apply appropriate HTTP security controls;
* log security-relevant events without leaking secrets.

---

# 28. Environment and Configuration

Minimum environments:

```text
Development
Production
```

Staging is not mandatory unless later approved.

Configuration belongs outside source code.

Typical environment variables include:

```text
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD
R2_ENDPOINT
R2_ACCESS_KEY
R2_SECRET_KEY
AUTH_SECRET / SESSION_SECRET
```

Actual names may follow the implementation.

Never commit real production values.

---

# 29. Testing Rules

Testing is part of implementation, not a post-processing step.

## 29.1 Required Test Categories

At minimum:

* unit tests;
* integration tests;
* API/security tests;
* financial workflow tests;
* frontend critical-path tests;
* regression tests.

## 29.2 Changes Requiring Tests

Tests are mandatory when changing:

* financial calculations;
* payment allocation;
* deposit logic;
* invoice status;
* quotation-to-invoice behavior;
* authorization;
* numbering;
* database integrity rules.

## 29.3 Critical Financial Test Matrix

At minimum test:

```text
Payment = 0
Payment < invoice
Payment = invoice
Payment > invoice
Multiple payments
Payment allocation > payment
Allocation > invoice outstanding
Deposit use > available balance
Quotation detail billed twice
Admin creates payment
Admin API bypass
Concurrent deposit usage
Concurrent number generation
Financial edit after payment
```

## 29.4 Acceptance Alignment

When implementing a PRD feature, locate the relevant acceptance criteria.

Examples:

* AT-05 Invoice from Quotation
* AT-06 Partial Invoicing
* AT-07 Prevent Double Billing
* AT-08 Partial Payment
* AT-09 Multiple Payment
* AT-10 Overpayment to Deposit
* AT-11 Deposit Usage
* AT-12 Prevent Excess Allocation
* AT-13 Automatic Payment Status
* AT-14 Numbering
* AT-15 Role Restriction
* AT-16 Kwitansi
* AT-17 Dashboard Accuracy
* AT-18 Deposit Ledger
* AT-19 Financial Locking
* AT-20 Backup Restore

Do not mark a feature complete merely because it compiles.

---

# 30. Definition of Done

A feature is DONE only when applicable items below are satisfied.

## Requirement

* [ ] Requirement is understood from the PRD.
* [ ] Business behavior matches the PRD.
* [ ] Scope is within the approved baseline.

## Architecture

* [ ] Implementation follows the Technical Baseline.
* [ ] Existing architecture is reused where appropriate.
* [ ] No unnecessary service or dependency was introduced.

## Security

* [ ] Authorization is correct.
* [ ] Sensitive operations are protected.
* [ ] No secret was introduced.
* [ ] File access is controlled where applicable.

## Data

* [ ] Validation exists.
* [ ] Database constraints are appropriate.
* [ ] Migration exists for schema changes.
* [ ] Financial values use safe numeric types.

## Testing

* [ ] Relevant unit tests exist.
* [ ] Relevant integration/API tests exist.
* [ ] Authorization tests exist for sensitive actions.
* [ ] Relevant acceptance criteria pass.
* [ ] Regression tests pass where applicable.

## Quality

* [ ] No unrelated changes.
* [ ] No unnecessary duplication.
* [ ] No obvious dead code.
* [ ] Error handling is meaningful.
* [ ] Build passes.
* [ ] Type checking/linting pass where configured.
* [ ] Diff has been reviewed.

---

# 31. AI Agent Workflow

Every AI coding agent should follow this workflow:

```text
READ
 ↓
UNDERSTAND
 ↓
INSPECT
 ↓
PLAN
 ↓
IMPLEMENT
 ↓
TEST
 ↓
REVIEW
 ↓
REPORT
```

## 31.1 READ

Before coding:

1. Read this `AGENTS.md`.
2. Read the relevant PRD section.
3. Read the relevant Technical Baseline section.
4. Read relevant existing code.
5. Read relevant tests.
6. Check for active migrations/API contracts if the task involves them.

Do not start changing files before understanding the affected area.

## 31.2 INSPECT

Before editing:

* locate the real implementation;
* find related business logic;
* identify existing reusable components/services;
* inspect relevant database entities and migrations;
* inspect authorization;
* inspect tests.

Avoid implementing a second version of something that already exists.

## 31.3 PLAN

For non-trivial tasks, produce a concise implementation plan internally or in the
working conversation before making broad changes.

Plan should identify:

* files likely to change;
* business rules involved;
* database impact;
* API impact;
* permission impact;
* tests required.

## 31.4 IMPLEMENT

Prefer the smallest change that correctly solves the problem.

Do not refactor unrelated parts merely because they are imperfect.

## 31.5 TEST

After implementation:

* run targeted tests first;
* then run broader relevant tests;
* run typecheck/lint/build where available;
* test authorization for restricted functions;
* test financial boundaries for financial changes.

## 31.6 REVIEW

Before reporting completion:

* inspect `git diff`;
* inspect changed files;
* verify no secrets;
* verify no unintended scope expansion;
* verify no regression in authorization;
* verify financial invariants;
* verify migration correctness.

## 31.7 REPORT

The agent's completion report should state:

1. what changed;
2. why it changed;
3. tests/checks run;
4. known limitations;
5. any unresolved ambiguity or follow-up.

Do not claim tests passed if they were not actually run.

---

# 32. Working with Existing Code

When the repository already contains implementation:

1. understand existing architecture before replacing it;
2. preserve behavior that matches the baseline;
3. identify deviations from PRD;
4. fix the smallest necessary surface;
5. avoid broad rewrites without a clear requirement.

Do not assume:

```text
"existing code" = "correct requirement"
```

The requirement documents remain authoritative.

---

# 33. Refactoring Rules

Refactor only when there is a clear reason.

Appropriate reasons:

* required by a current feature;
* necessary for correctness;
* necessary for security;
* necessary to remove duplicated financial logic;
* necessary to meet a documented architecture rule;
* necessary to make tests reliable.

Avoid refactors whose only purpose is:

* style preference;
* personal taste;
* architecture fashion;
* replacing working code with a different framework;
* increasing abstraction count.

Keep feature changes and large refactors separate when practical.

---

# 34. Dependency Management

Before adding a dependency:

1. check whether the existing stack already solves the problem;
2. check whether the dependency is necessary;
3. consider maintenance/security implications;
4. prefer established project dependencies;
5. avoid adding a library for a trivial helper.

Do not add:

* Redis;
* Kafka;
* Elasticsearch;
* another ORM;
* another state-management library;
* another form library;
* another validation system;

unless an explicit architecture decision changes the baseline.

---

# 35. Database Migration Workflow

When changing the database:

```text
Inspect current schema
        ↓
Inspect applied Flyway migrations
        ↓
Define change
        ↓
Write new migration
        ↓
Run migration locally
        ↓
Run tests
        ↓
Review compatibility
        ↓
Commit migration with code
```

Never edit an already-applied migration to "fix history".

If existing data must be transformed:

* use a controlled migration;
* test it on representative data;
* understand rollback/recovery implications.

---

# 36. Financial Change Workflow

For any change touching money:

```text
PRD rule
   ↓
Business invariant
   ↓
Service transaction
   ↓
Database constraint/locking
   ↓
Tests
   ↓
UI
```

Not:

```text
UI first
  ↓
hope backend is consistent
```

Before merging any financial feature, explicitly verify:

* calculation;
* allocation;
* outstanding;
* status;
* deposit;
* concurrency;
* authorization;
* traceability;
* regression.

---

# 37. UI and UX Quality Rules

The goal is not merely functional screens.

Use consistent:

* forms;
* buttons;
* table patterns;
* modal/dialog patterns;
* empty states;
* loading states;
* error feedback;
* currency/date formatting;
* validation messaging.

Financial actions should make irreversible or consequential actions clear.

Do not make destructive actions dangerously easy to trigger.

Do not hide important financial consequences behind ambiguous labels.

---

# 38. Accessibility and Usability Baseline

For important UI:

* interactive elements must be keyboard reachable;
* forms should have clear labels;
* errors should be understandable;
* disabled/loading states should be clear;
* tables should remain usable at the expected application viewport sizes.

Do not over-engineer accessibility infrastructure outside the application's practical
needs, but do not knowingly create unusable controls.

---

# 39. Error Handling Rules

Errors should be categorized:

```text
Validation
Authentication
Authorization
Not Found
Business Conflict
Infrastructure / Server Error
```

For user-facing messages:

* be clear;
* avoid stack traces;
* avoid internal SQL details;
* explain what the user can do next where practical.

For developers:

* preserve useful technical logging;
* include correlation/request information where available;
* never log secrets.

---

# 40. Logging Rules

Logs should help diagnose:

* request failures;
* validation failures;
* authorization failures;
* application errors;
* external storage failures;
* database failures.

Do not log:

* passwords;
* session secrets;
* API keys;
* R2 secrets;
* database passwords;
* unnecessary sensitive financial data.

Separate:

```text
Technical application logs
```

from:

```text
Business audit history
```

A technical log is not a substitute for a financial audit record.

---

# 41. Performance Rules

Initial workload is small-business operational usage.

Optimize for:

1. correctness;
2. maintainability;
3. reasonable responsiveness.

Avoid premature optimization.

Use:

* proper database indexes;
* pagination;
* efficient queries;
* sensible joins/fetching;
* targeted caching only when evidence supports it.

Do not introduce distributed caching or asynchronous event infrastructure merely for
speculative scale.

---

# 42. Concurrency Rules

Concurrency must be considered for:

* payment allocation;
* deposit usage;
* numbering;
* financial edits;
* any operation that consumes or mutates a shared financial balance.

Never reason only from the single-user happy path.

Ask:

```text
"What happens if two valid requests arrive at the same time?"
```

before approving code that mutates:

* payment coverage;
* deposit availability;
* transaction counters.

---

# 43. Backup and Recovery Awareness

Production database backups follow the Technical Baseline.

Expected baseline:

```text
PostgreSQL
   ↓
pg_dump
   ↓
compression
   ↓
R2 backup bucket
```

Retention baseline:

```text
7 daily
4 weekly
3 monthly
```

Before go-live:

* verify backup generation;
* verify backup upload;
* perform restore test;
* verify customer;
* verify activities;
* verify quotations;
* verify invoices;
* verify payments;
* verify allocations;
* verify deposits.

Do not claim a backup strategy is operational until restore has been tested.

---

# 44. Infrastructure Rules

Production baseline:

```text
VPS
- Ubuntu LTS
- 2 Core
- 2 GB RAM
- 30 GB SSD/NVMe
```

Services:

```text
Nginx
Spring Boot
PostgreSQL
Docker
```

External:

```text
Cloudflare
Cloudflare R2
UptimeRobot Free
Sentry Free
```

Do not add infrastructure merely because it is common in enterprise systems.

The baseline explicitly does not require:

* Kubernetes;
* Redis;
* Kafka;
* Elasticsearch;
* managed database;
* microservices.

---

# 45. Git Rules

Branch baseline:

```text
main
feature/*
fix/*
refactor/*
```

Commit prefixes may use:

```text
feat:
fix:
refactor:
test:
docs:
chore:
```

Rules:

* commits should be meaningful;
* avoid mixing unrelated changes;
* keep diffs focused;
* do not commit secrets;
* do not commit generated build artifacts unless intentionally required;
* do not rewrite history of shared branches without an approved reason.

Before committing:

```text
git diff
git status
tests
typecheck/lint/build as applicable
```

---

# 46. Pull Request / Change Review Checklist

Before considering a change complete:

```text
[ ] Requirement reviewed
[ ] Scope reviewed
[ ] Relevant architecture reviewed
[ ] Existing implementation inspected
[ ] Backend authorization reviewed
[ ] Financial invariants reviewed
[ ] Validation reviewed
[ ] Database migration reviewed
[ ] API contract reviewed
[ ] Tests added/updated
[ ] Targeted tests passed
[ ] Broader checks passed where applicable
[ ] Security checked
[ ] No secrets
[ ] No unnecessary dependency
[ ] No unrelated changes
[ ] Diff reviewed
[ ] Documentation updated if needed
```

---

# 47. Change Impact Analysis

Before a non-trivial change, classify the impact:

| Area           | Question                           |
| -------------- | ---------------------------------- |
| Product        | Does behavior change?              |
| Financial      | Does money/ledger behavior change? |
| Authorization  | Does any role permission change?   |
| Database       | Does schema/data change?           |
| API            | Does request/response change?      |
| Security       | Does attack surface change?        |
| Infrastructure | Does deployment change?            |
| Scope          | Does this add functionality?       |
| Tests          | What new failure modes exist?      |

Any material change in the above areas requires extra review.

---

# 48. When to Stop and Ask

Stop implementation and ask for clarification when:

* PRD and Technical Baseline conflict;
* financial rules are ambiguous;
* Admin permission is unclear;
* a change would alter historical financial data;
* a requested feature appears outside scope;
* an API breaking change seems necessary;
* a migration may destroy or reinterpret production data;
* security requirements are unclear;
* a new infrastructure service appears necessary;
* two valid implementations have materially different business outcomes.

Do not guess on financial or authorization behavior.

---

# 49. Common AI Failure Modes to Avoid

## 49.1 Coding Before Reading

Bad:

```text
User asks "add payment"
→ immediately create controller/entity/UI
```

Correct:

```text
Read PRD
→ read architecture
→ inspect existing payment module
→ understand allocation/deposit
→ implement
→ test
```

## 49.2 UI-Only Permission

Bad:

```text
hide Payment menu for Admin
```

Correct:

```text
hide UI
+
backend authorization
+
API/security test
```

## 49.3 Balance Shortcut

Bad:

```text
customer.depositBalance += amount
```

Correct:

```text
create ledger transaction
→ recalculate/derive balance
→ preserve traceability
```

## 49.4 Manual Payment Status

Bad:

```text
invoice.status = "PAID"
```

Correct:

```text
derive status from valid allocated payment amount
```

## 49.5 Double Billing Shortcut

Bad:

```text
copy quotation lines into invoice
```

without tracking previously billed amounts.

Correct:

```text
source link
+
billed amount tracking
+
remaining billable amount
+
double-billing prevention
```

## 49.6 Hard Delete Financial History

Bad:

```text
DELETE payment
```

just because the user made a mistake.

Correct behavior must preserve traceability through the approved correction/void
mechanism.

## 49.7 Overengineering

Bad:

```text
add Redis
add Kafka
add microservices
```

without an approved need.

Correct:

```text
use the baseline architecture
→ scale only when evidence requires it
```

---

# 50. Feature Implementation Template for AI Agents

For a non-trivial feature, use this mental checklist:

```text
FEATURE
│
├── Requirement
│   ├── PRD section
│   └── Acceptance criteria
│
├── Scope
│   └── In / Out
│
├── Architecture
│   ├── Backend
│   ├── Frontend
│   └── Database
│
├── Security
│   └── Role / object access
│
├── Business Rules
│   └── Invariants
│
├── API
│   ├── Request
│   ├── Response
│   └── Errors
│
├── Data
│   └── Migration
│
├── Tests
│   ├── Unit
│   ├── Integration
│   └── UAT
│
└── Review
    ├── Diff
    ├── Security
    ├── Financial integrity
    └── Scope
```

---

# 51. Final Development Principles

Prioritize:

1. **Correctness over speed**
2. **Explicit requirements over assumptions**
3. **Financial integrity over convenience**
4. **Server-side security over UI hiding**
5. **Simple architecture over unnecessary complexity**
6. **Small focused changes over broad rewrites**
7. **Tests over optimism**
8. **Traceability over silent mutation**
9. **Documented scope over feature creep**
10. **Maintainability over clever code**

When uncertain:

```text
Inspect first.
Compare against the documents.
Protect financial/security invariants.
Ask before making a material assumption.
```

---

# 52. Final "Do Not Break" Rules

These rules should be treated as hard constraints.

```text
DO NOT:

- add Visual Print Designer
- weaken Admin payment restriction
- allow Admin payment mutation through direct API
- allow payment over-allocation
- allow deposit over-spending
- make deposit a freely editable balance
- manually override invoice payment status as truth
- silently mutate financial history
- double-bill quotation source values
- reuse issued transaction numbers without an approved rule
- use floating point for money
- bypass Flyway for normal schema changes
- commit secrets
- expose private financial files publicly
- add unnecessary infrastructure
- invent undocumented business rules
```

---

# 53. Completion Standard

A task is not considered complete because:

* code exists;
* the screen renders;
* the API returns 200;
* the local build passes once.

A task is complete only when the implementation is consistent with:

```text
PRD
+
Technical Architecture Baseline
+
AGENTS.md
+
Tests
+
Security
+
Financial Invariants
```

and the actual behavior has been verified.

---

# END OF AGENTS.md

```

Catatan penting sebelum kamu memasukkannya ke repository: ada **dua hal yang sebaiknya kita sinkronkan lagi dengan dokumen PRD yang benar-benar final**, yaitu daftar ID acceptance test `AT-05` sampai `AT-20` dan detail status lifecycle. Saya menuliskannya di `AGENTS.md` mengikuti rancangan yang sudah kita bahas, tetapi bagian tersebut sebaiknya **persis sama dengan nomor/isi acceptance criteria di PRD Final yang kamu jadikan source of truth**, supaya AI tidak menemukan dua versi berbeda.
```

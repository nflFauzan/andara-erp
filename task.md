# Task Tracking: Sistem Manajemen Keuangan & Operasional CV. ANDARA

## Project Status: PHASE 3 - Kegiatan & Kegiatan Item Management (COMPLETED ✅)
Next Target: **PHASE 4 - Numbering Engine (Penomoran Dokumen)**

---

### Phase 0: Project Foundation & Scaffolding
- [x] **0.1 Environment & Git Baseline**
  - [x] Verify Java (JDK 21/27), Maven 3.9.9, Node.js v24 LTS & npm 11, Docker & Docker Compose
  - [x] Setup root `.gitignore` (Java, Maven, Node, IDE, env files, logs)
  - [x] Setup `.env.example` with standard environment variables
- [x] **0.2 Backend Scaffolding (`backend/`)**
  - [x] Initialize Spring Boot 3.3.4 project with Maven
    - Dependencies: Spring Web, Spring Data JPA, Spring Security, Validation (Jakarta), PostgreSQL Driver, Flyway Migration, DevTools, Test Starter
  - [x] Configure `application.yml`, `application-dev.yml`, and `application-prod.yml` (Datasource, JPA, Flyway, Server port 8080)
  - [x] Implement Base DTO / Response Wrapper (`ApiResponse<T>`, `ErrorDetail`)
  - [x] Implement `GlobalExceptionHandler` with standard error format & error codes
  - [x] Configure CORS for frontend development (`http://localhost:5173`)
  - [x] Create Flyway baseline migration `V1__init_schema.sql` (baseline structure, users, customers, numbering, audit log)
  - [x] Verify backend builds: `mvn clean compile` (Build Success)
- [x] **0.3 Frontend Scaffolding (`frontend/`)**
  - [x] Initialize Vite + React 18 + TypeScript project
  - [x] Install core dependencies: `react-router-dom`, `@tanstack/react-query`, `react-hook-form`, `zod`, `@hookform/resolvers`, `lucide-react`, `axios`, `clsx`, `tailwind-merge`
  - [x] Configure TailwindCSS design tokens & fonts (Inter & JetBrains Mono)
  - [x] Setup project directory structure: `lib/`, `components/`, `pages/`, `types/`
  - [x] Configure Axios client with `baseURL: /api` and credentials support
  - [x] Setup base layout (`AppLayout`), router, and query client provider
  - [x] Verify frontend builds: `npm run build` (Build Success, 0 errors)
- [x] **0.4 Infrastructure Scaffolding (`infrastructure/` & root)**
  - [x] Create `docker-compose.yml` for local development (PostgreSQL 16)
  - [x] Create `backend/Dockerfile` (multi-stage build with JVM memory caps 512MB for 2GB VPS)
  - [x] Create `frontend/Dockerfile` & `nginx.conf` (SPA fallback and reverse proxy)
- [x] **0.5 Verification & Handshake**
  - [x] Verify backend health endpoint `/api/health` with automated unit test (`HealthControllerTest`)
  - [x] Verify frontend build and routing structure with `StatusPage` and `DashboardPage`
  - [x] Update `README.md` with complete setup instructions

---

### Phase 1: Authentication, Authorization & User Management (COMPLETED ✅)
- [x] **1.1 Database Migration & Seed**
  - [x] Create `V2__seed_initial_users.sql` (Operator & Admin accounts with BCrypt hashes)
- [x] **1.2 Backend Security & Authentication**
  - [x] Create `Role` enum (`OPERATOR`, `ADMIN`)
  - [x] Create `User` JPA Entity mapped to `users` table
  - [x] Create `UserRepository` with query methods
  - [x] Implement `CustomUserDetails` and `CustomUserDetailsService`
  - [x] Create Auth DTOs: `LoginRequest`, `UserDTO`
  - [x] Configure `SecurityConfig` (session-based authentication, `HttpSessionSecurityContextRepository`, session fixation, CSRF with `CookieCsrfTokenRepository`, custom `AuthenticationEntryPoint` & `AccessDeniedHandler` returning standard JSON)
  - [x] Implement `AuthController` with endpoints:
    - [x] `POST /api/auth/login` (validates credentials, creates HTTP session, returns UserDTO)
    - [x] `POST /api/auth/logout` (invalidates session, clears context)
    - [x] `GET /api/auth/me` (returns currently authenticated user)
- [x] **1.3 Backend Unit & Integration Tests**
  - [x] Create `AuthControllerTest` (login success, login failure invalid password, inactive user, logout, me endpoint)
  - [x] Verify test suite passes with `mvn test` (8/8 tests pass, BUILD SUCCESS)
- [x] **1.4 Frontend Authentication Flow**
  - [x] Create Auth types & schemas with Zod (`loginSchema`, `User`, `AuthState`)
  - [x] Implement `AuthContext` and `useAuth` hook with session restoration on load
  - [x] Create `LoginPage` with corporate CV. ANDARA branding, error alert, and submit loading state
  - [x] Implement `ProtectedRoute` with loading indicator & unauthorized redirection
  - [x] Update `AppLayout` with user info, role badge, and functional logout button
  - [x] Update Axios interceptor to handle 401 cleanly and trigger auth logout
  - [x] Verify frontend build with `npm run build` (Build success, 0 errors)
- [x] **1.5 End-to-End Verification & User Testing**
  - [x] Test Operator login (`operator` / `operator123` -> 200 OK + UserDTO)
  - [x] Test Admin login (`admin` / `admin123` -> 200 OK + UserDTO)
  - [x] Test session persistence across requests via HTTP cookie
  - [x] Test logout functionality and session invalidation
  - [x] Test invalid credentials error handling (401 INVALID_CREDENTIALS)

---

### Phase 2: Master Data Customer & Attachment Management (COMPLETED ✅)
- [x] **2.1 Database Migration & Seed**
  - [x] Create `V3__customer_fields_and_attachments.sql` (`pic_name`, `notes` in `customers`, `attachments` table, and initial customer seed data)
- [x] **2.2 Customer Domain, Repository & Service**
  - [x] Create `Customer` JPA Entity with decimal `deposit_balance`
  - [x] Create `CustomerRepository` with search and pagination support
  - [x] Create Customer DTOs: `CustomerDTO`, `CreateCustomerRequest`, `UpdateCustomerRequest`
  - [x] Implement `CustomerService` with validation (unique code, soft delete/deactivation, deposit balance invariant)
  - [x] Implement `CustomerController` (`/api/customers`)
- [x] **2.3 Attachment Subsystem**
  - [x] Create `Attachment` JPA Entity and `AttachmentRepository`
  - [x] Create `StorageService` interface + `LocalStorageService` (with dev uploads folder)
  - [x] Create `AttachmentDTO` and `AttachmentService` (upload, download, delete, list by ref)
  - [x] Implement `AttachmentController` (`/api/attachments`)
- [x] **2.4 Backend Unit & Integration Tests**
  - [x] Create `CustomerControllerTest` (CRUD, duplicate code conflict, search, pagination, status toggle)
  - [x] Verify test suite passes with `mvn test` (12/12 tests pass, BUILD SUCCESS)
- [x] **2.5 Frontend Customer UI & Management**
  - [x] Create Customer types & schemas (`customerSchema`, `Customer`, `Attachment`)
  - [x] Implement API client functions in `customerApi.ts` and `attachmentApi.ts`
  - [x] Create `CustomerListPage` with data table, search input, status filter, and pagination
  - [x] Create `CustomerModal` for create and edit customer forms
  - [x] Create `CustomerDetailPage` with tabs (Info, Kegiatan, Penawaran, Faktur, Dokumen/Lampiran)
  - [x] Update router in `App.tsx` and navigation in `AppLayout.tsx`
  - [x] Verify frontend build with `npm run build` (Build success, 0 errors)
- [x] **2.6 End-to-End Verification**
  - [x] Test creating new customer with code and contact info
  - [x] Test unique code duplicate validation
  - [x] Test editing customer details
  - [x] Test activating/deactivating customer status
  - [x] Test uploading attachment to customer
  - [x] Test downloading attachment and checksum verification
  - [x] Test MIME type filtering and size limits

---

### Phase 3: Kegiatan & Kegiatan Item Management (COMPLETED ✅)
- [x] **3.1 Database Migration & Seed**
  - [x] Create `V4__kegiatan_and_items.sql` (`kegiatan` and `kegiatan_items` tables, constraints, foreign keys, and initial seed activities & items)
- [x] **3.2 Kegiatan Domain, Repository & Service Layer**
  - [x] Create `KegiatanStatus` enum (`PLANNED`, `ACTIVE`, `COMPLETED`, `CLOSED`, `CANCELLED`)
  - [x] Create `Kegiatan` and `KegiatanItem` JPA Entities with decimal precision (`BigDecimal`)
  - [x] Create `KegiatanRepository` and `KegiatanItemRepository` with filters & pagination
  - [x] Create DTOs: `KegiatanDTO`, `KegiatanItemDTO`, `CreateKegiatanRequest`, `UpdateKegiatanRequest`, `KegiatanItemRequest`
  - [x] Implement `KegiatanService` with authoritative financial calculation (`subtotal = volume * unit_price`, `total_amount = SUM(subtotal)`)
  - [x] Implement `KegiatanController` (`/api/kegiatan` and `/api/kegiatan/{id}/items`)
- [x] **3.3 Backend Automated Integration Tests**
  - [x] Create `KegiatanControllerTest` (CRUD, duplicate code rejection, authoritative calculation, customer retrieval)
  - [x] Verify test suite passes with `mvn test` (16/16 tests pass, BUILD SUCCESS)
- [x] **3.4 Frontend Kegiatan UI & Management**
  - [x] Create TypeScript types (`kegiatan.ts`) and API client (`kegiatanApi.ts`)
  - [x] Create `KegiatanItemModal` with real-time subtotal calculator preview
  - [x] Create `KegiatanModal` with active customer dropdown selector and form validation
  - [x] Create `KegiatanListPage` with table, filters, pagination, and action buttons
  - [x] Create `KegiatanDetailPage` with financial summary card, interactive item table, and tabbed attachment manager
  - [x] Connect activities tab in `CustomerDetailPage` to list activities and enable adding activities
  - [x] Update routing in `App.tsx`
  - [x] Verify frontend build with `npm run build` (Build success, 0 errors)
- [x] **3.5 End-to-End Verification**
  - [x] Test creating new kegiatan with multiple items via API
  - [x] Test authoritative financial recalculation upon adding items
  - [x] Test uploading attachment to kegiatan
  - [x] Test duplicate code validation (409 CONFLICT)

---

### Subsequent Phases Roadmap
- [ ] **Phase 4: Numbering Engine (Penomoran Dokumen)**
- [ ] **Phase 5: Penawaran (Quotation) Management**
- [ ] **Phase 6: Faktur Penjualan (Invoicing) Management**
- [ ] **Phase 7: Pembayaran & Payment Allocation Engine**
- [ ] **Phase 8: Customer Deposit Ledger System**
- [ ] **Phase 9: Kwitansi (Official Receipt) Management**
- [ ] **Phase 10: Financial Locking & Integrity Controls**
- [ ] **Phase 11: Rekap, Reports & Dashboard Analytics**
- [ ] **Phase 12: Production Hardening, VPS Deployment & Cloudflare Setup**


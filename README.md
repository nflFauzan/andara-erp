# Sistem Manajemen Operasional & Transaksi CV. ANDARA

Aplikasi enterprise terintegrasi untuk pengelolaan transaksi operasional, kegiatan, penawaran (quotation), penagihan (faktur penjualan), alokasi pembayaran, kwitansi, dan buku besar (ledger) deposit customer pada **CV. ANDARA**.

---

## 🏛️ Arsitektur & Teknologi

Sistem dirancang dengan arsitektur **Modular Monolith** berstandar enterprise yang menitikberatkan pada integritas finansial, kejelasan audit, dan performa tinggi:

- **Backend:** Java 21 LTS, Spring Boot 3.3.4, Spring Data JPA, Spring Security, Jakarta Validation, Flyway Database Migration, Maven / Maven Wrapper
- **Frontend:** React 18, TypeScript, Vite, TailwindCSS, TanStack Query (v5), React Hook Form, Zod, Lucide Icons, Axios
- **Database:** PostgreSQL 16 (Ledger-driven transaction integrity, decimal-safe `NUMERIC(15, 2)`)
- **Penyimpanan Berkas:** Cloudflare R2 (Object Storage S3-compatible untuk bukti bayar & lampiran)
- **Kontainerisasi & Deployment:** Docker, Docker Compose, Nginx Reverse Proxy, JVM 512MB RAM cap optimization

---

## 📂 Struktur Repositori

```text
andara-erp/
├── AGENTS.md               # Aturan rekayasa, batasan arsitektur & panduan AI agent
├── README.md               # Dokumentasi utama dan panduan instalasi/eksekusi
├── task.md                 # Pelacakan status fase pengembangan (Phase 0 - 12)
├── docker-compose.yml      # Konfigurasi container lokal (PostgreSQL 16)
├── .env.example            # Template variabel lingkungan sistem
├── docs/                   # Dokumen PRD, RAB, Scope, dan Architecture Baseline
│   ├── PRD.md
│   └── Technical_Architecture_Baseline.md
├── backend/                # Spring Boot 3.3.4 REST API
│   ├── mvnw / mvnw.cmd     # Maven Wrapper (eksekusi tanpa install Maven manual)
│   ├── pom.xml             # Konfigurasi dependensi Maven
│   ├── Dockerfile          # Multi-stage image build (Eclipse Temurin JRE 21)
│   └── src/
│       ├── main/java/      # Domain logic, controller, security, entity, DTO
│       │   └── com/andara/erp/
│       │       ├── common/     # ApiResponse, GlobalExceptionHandler, ErrorCodes
│       │       ├── config/     # SecurityConfig, CorsConfig
│       │       └── controller/ # HealthController, dll.
│       ├── main/resources/ # application.yml, application-dev.yml, application-prod.yml
│       │   └── db/migration/   # Skrip migrasi Flyway (V1__init_schema.sql, dst.)
│       └── test/java/      # Pengujian unit & integrasi (HealthControllerTest)
└── frontend/               # React 18 + TypeScript + Vite SPA
    ├── package.json        # NPM dependencies & scripts
    ├── vite.config.ts      # Konfigurasi Vite & proxy otomatis /api -> :8080
    ├── tailwind.config.js  # Design system token & font setup
    ├── nginx.conf          # Konfigurasi reverse proxy & SPA routing untuk produksi
    ├── Dockerfile          # Multi-stage image build dengan Nginx alpine
    └── src/
        ├── components/     # UI reusable components & AppLayout
        ├── pages/          # DashboardPage, StatusPage, modul pages
        ├── lib/            # Axios instance, formatting utilities
        ├── types/          # TypeScript interfaces & API contracts
        └── App.tsx         # Routing & TanStack Query Provider
```

---

## 📋 Prasyarat Sistem (Prerequisites)

Sebelum menjalankan aplikasi, pastikan komputer/server Anda telah terpasang:

| Perangkat Lunak | Versi Rekomendasi | Catatan |
|---|---|---|
| **Java Development Kit (JDK)** | 21 LTS | Rekomendasi: [Eclipse Adoptium Temurin 21](https://adoptium.net/) atau Oracle JDK 21 |
| **Node.js & npm** | Node v20+ atau v24 LTS, npm v10+ | Unduh dari [nodejs.org](https://nodejs.org/) |
| **Database PostgreSQL** | PostgreSQL 16 | Bisa dijalankan via **Docker Desktop** (direkomendasikan) atau instalasi langsung |
| **Git** | 2.40+ | Version control |
| **Maven** | *(Opsional)* | Proyek telah menyertakan **Maven Wrapper (`mvnw` / `mvnw.cmd`)**, sehingga tidak wajib install Maven global |

---

## 🚀 Panduan Lengkap: Cara Menjalankan Aplikasi

Ikuti 5 langkah berurutan di bawah ini untuk menjalankan aplikasi pada lingkungan lokal (*Local Development*).

---

### Langkah 1: Kloning Repositori & Masuk ke Folder Proyek

Buka terminal (PowerShell / Command Prompt di Windows, atau Terminal di macOS/Linux):

```bash
git clone https://github.com/nflFauzan/andara-erp.git
cd andara-erp
```

---

### Langkah 2: Konfigurasi File Environment (`.env`)

Salin file template `.env.example` menjadi `.env`:

**Di Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**Di Linux / macOS / Git Bash:**
```bash
cp .env.example .env
```

> **Catatan Konfigurasi:**  
> Pengaturan default pada `.env.example` sudah disesuaikan untuk langsung bekerja pada lingkungan lokal tanpa perlu mengubah apapun jika Anda menggunakan Docker Compose untuk PostgreSQL:
> - `POSTGRES_DB=andara_erp`
> - `POSTGRES_USER=andara_user`
> - `POSTGRES_PASSWORD=andara_dev_password_123`
> - `POSTGRES_PORT=5432`
> - `SERVER_PORT=8080`

---

### Langkah 3: Menjalankan Database PostgreSQL

Pilih salah satu dari dua metode di bawah ini:

#### Opsi A: Menggunakan Docker Compose (Sangat Direkomendasikan ⭐)
Pastikan aplikasi **Docker Desktop** sudah berjalan, kemudian eksekusi perintah berikut di root proyek:

```bash
docker compose up -d postgres
```

Periksa apakah kontainer database telah berjalan aktif:
```bash
docker compose ps
```
*Output harus menunjukkan kontainer `andara-postgres` berstatus `Up (healthy)` di port `0.0.0.0:5432->5432/tcp`.*

#### Opsi B: Menggunakan PostgreSQL Lokal (Tanpa Docker)
Jika Anda menginstal PostgreSQL secara native di sistem operasi Anda:
1. Buka `psql` atau pgAdmin.
2. Buat database dan user sesuai konfigurasi:
   ```sql
   CREATE USER andara_user WITH PASSWORD 'andara_dev_password_123';
   CREATE DATABASE andara_erp OWNER andara_user;
   GRANT ALL PRIVILEGES ON DATABASE andara_erp TO andara_user;
   ```
3. Jika Anda menggunakan username/password PostgreSQL yang berbeda (misalnya user `postgres`), sesuaikan nilai `DATABASE_USERNAME` dan `DATABASE_PASSWORD` pada file `.env`.

---

### Langkah 4: Menjalankan Backend (Spring Boot REST API)

Buka terminal, masuk ke subdirektori `backend/`:

```bash
cd backend
```

Jalankan aplikasi backend menggunakan **Maven Wrapper**:

**Di Windows (PowerShell / CMD):**
```powershell
.\mvnw.cmd spring-boot:run
```

**Di Linux / macOS:**
```bash
./mvnw spring-boot:run
```

*(Atau gunakan perintah `mvn spring-boot:run` jika Apache Maven sudah terpasang di PATH sistem Anda).*

#### Yang Terjadi Saat Backend Dimulai:
1. Spring Boot membaca konfigurasi aktif profil `dev`.
2. **Flyway** secara otomatis mendeteksi database dan menjalankan migrasi skema tabel (`V1__init_schema.sql`):
   - Tabel `users` (dengan autentikasi & role `OPERATOR`, `ADMIN`)
   - Tabel `numbering_configurations` (inisialisasi format nomor surat & faktur)
   - Tabel `customers` (master customer & deposit balance)
   - Tabel `audit_logs` (jejak audit sistem)
3. Server Spring Boot akan aktif dan siap menerima request di port **`8080`**.

#### Verifikasi Backend:
Buka peramban (browser) atau gunakan `curl` untuk mengecek status kesehatan backend:
```bash
curl http://localhost:8080/api/health
```
Respons yang diharapkan:
```json
{
  "success": true,
  "data": {
    "status": "UP",
    "application": "andara-erp-backend",
    "profile": "dev",
    "system": "Sistem Manajemen Keuangan & Operasional CV. ANDARA"
  },
  "message": "Sistem beroperasi normal"
}
```

---

### Langkah 5: Menjalankan Frontend (React + Vite)

Buka **jendela terminal baru**, lalu masuk ke direktori `frontend/`:

```bash
cd frontend
```

1. **Install Dependensi Node.js:**
   ```bash
   npm install
   ```

2. **Jalankan Vite Development Server:**
   ```bash
   npm run dev
   ```

Frontend akan aktif secara instan pada:
👉 **[http://localhost:5173](http://localhost:5173)**

> **Koneksi Otomatis ke Backend:**  
> Vite telah dikonfigurasi dengan reverse proxy internal (`vite.config.ts`), sehingga seluruh panggilan API ke path `/api/*` dari peramban secara otomatis diteruskan ke backend Spring Boot di `http://localhost:8080`.

---

## 🔍 Memverifikasi Aplikasi di Browser

Setelah frontend dan backend berjalan:

1. Buka peramban dan akses **`http://localhost:5173`**.
2. Anda akan melihat halaman antarmuka **Dashboard CV. ANDARA**.
3. Navigasikan ke menu **"Status Sistem"** pada bilah samping (sidebar) atau akses **`http://localhost:5173/status`**.
4. Halaman ini akan melakukan verifikasi live ke endpoint backend Spring Boot (`/api/health`). Jika terhubung, indikator akan menampilkan:
   - **Status:** `Terhubung (UP)` (badge hijau)
   - **Payload JSON Server:** detail profil `dev` dan timestamp aktif server.

---

## 🛠️ Perintah Pengujian & Kompilasi (Useful Commands)

### Backend (Spring Boot)

| Tindakan | Perintah (Windows) | Perintah (Linux/macOS) |
|---|---|---|
| Menjalankan Unit Test | `.\mvnw.cmd test` | `./mvnw test` |
| Kompilasi & Build JAR | `.\mvnw.cmd clean package -DskipTests` | `./mvnw clean package -DskipTests` |
| Menjalankan JAR hasil build | `java -jar target/andara-erp-backend-1.0.0.jar` | `java -jar target/andara-erp-backend-1.0.0.jar` |

### Frontend (React + Vite)

| Tindakan | Perintah |
|---|---|
| Menjalankan Dev Server | `npm run dev` |
| Type-checking & Build Produksi | `npm run build` |
| Pratinjau Hasil Build Produksi | `npm run preview` |
| Linter kode | `npm run lint` |

---

## 📦 Menjalankan dengan Kontainer Docker Penuh (Production Simulation)

Untuk menguji build kontainer produksi dengan Nginx dan Docker multi-stage:

```bash
# Build dan jalankan image backend & frontend
docker compose build
docker compose up -d
```

- **Frontend (Nginx Alpine):** `http://localhost:80`
- **Backend API:** `http://localhost:8080`
- **PostgreSQL 16:** `localhost:5432`

---

## 🛡️ Aturan Rekayasa & Integritas Finansial (AGENTS.md)

Seluruh kontributor dan agen AI wajib mematuhi aturan ketat dalam [`AGENTS.md`](./AGENTS.md):

1. **Financial Integrity:** Dilarang keras menggunakan tipe data floating point (`float` / `double`) untuk nilai uang. Seluruh kalkulasi finansial wajib menggunakan `BigDecimal` (Java) dan `NUMERIC(15, 2)` (PostgreSQL).
2. **Customer Deposit Ledger:** Saldo deposit tidak boleh diedit secara manual/langsung (`customer.depositBalance = newBalance` dilarang). Setiap perubahan saldo wajib melalui mutasi transaksi buku besar (`DEPOSIT_IN`, `DEPOSIT_USED`, `DEPOSIT_REFUND`).
3. **No Over-allocation:** Alokasi pembayaran tidak boleh melebihi nilai pembayaran yang diterima. Kelebihan pembayaran secara otomatis masuk ke deposit pelanggan.
4. **Server-Side Authorization:** Hak akses diverifikasi mutlak di tingkat backend:
   - **`OPERATOR`:** Akses penuh seluruh transaksi operasional dan finansial/pembayaran.
   - **`ADMIN`:** Akses operasional dan pelaporan; **dilarang** membuat atau memutasi transaksi pembayaran dan deposit.
5. **No Visual Print Designer:** Sesuai kesepakatan scope & RAB, modul visual drag-and-drop designer berada di luar cakupan proyek. Cetakan dokumen menggunakan template terstandarisasi.

---

## ❓ Kendala Umum & Solusi (Troubleshooting)

### 1. `docker: error during connect...` atau Docker tidak dapat dihubungi
- **Penyebab:** Docker Desktop belum dijalankan di komputer Anda.
- **Solusi:** Buka aplikasi **Docker Desktop**, tunggu hingga status di pojok kiri bawah menunjukkan *"Engine running"*, lalu ulangi perintah `docker compose up -d postgres`.

### 2. Port 5432 atau 8080 sudah digunakan (`Address already in use`)
- **Penyebab:** Ada layanan PostgreSQL lain atau server lokal yang sedang berjalan di port yang sama.
- **Solusi:** 
  - Ubah port di `.env` (misal: `POSTGRES_PORT=5433` atau `SERVER_PORT=8081`).
  - Atau hentikan proses yang menempati port tersebut.

### 3. PowerShell memblokir eksekusi skrip (`ExecutionPolicy`)
- **Penyebab:** Kebijakan keamanan Windows PowerShell membatasi script `.ps1`.
- **Solusi:** Jalankan perintah berikut di PowerShell untuk sesi saat ini:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  ```

### 4. Maven Wrapper Permission Denied di Linux/macOS
- **Penyebab:** File `mvnw` belum memiliki izin eksekusi.
- **Solusi:**
  ```bash
  chmod +x backend/mvnw
  ```

---

## 📄 Lisensi & Hak Cipta

Hak Cipta © 2026 **CV. ANDARA**. Seluruh hak cipta dilindungi undang-undang.
Dokumentasi internal dan kode sumber untuk **Sistem Manajemen Operasional & Transaksi CV. ANDARA**.
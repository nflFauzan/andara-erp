# Panduan Deployment & Operasional Produksi
## Sistem Manajemen Operasional & Transaksi CV. ANDARA

Dokumen ini adalah panduan resmi instalasi, konfigurasi infrastruktur, dan operasional sistem pada server produksi sesuai spesifikasi **Technical Architecture Baseline** dan **RAB**.

---

## 1. Spesifikasi Server & Prasyarat
- **Sistem Operasi:** Ubuntu 22.04 / 24.04 LTS
- **Hardware VPS (Baseline 2 GB):**
  - CPU: 2 Core
  - RAM: 2 GB (dengan Swap 2 GB aktif)
  - Penyimpanan: 30 GB SSD NVMe
- **Domain & SSL:** Dikelola melalui Cloudflare (DNS Proxy aktif, SSL Mode: *Full* atau *Full (Strict)*).
- **Layanan Cloudflare R2:**
  - Bucket `andara-files`: Penyimpanan bukti transfer pembayaran dan lampiran transaksi.
  - Bucket `andara-backups`: Arsip cadangan database otomatis terenkripsi.

---

## 2. Langkah Instalasi di Server VPS

### A. Pengaturan Awal VPS & Keamanan Dasar
```bash
# Update paket
sudo apt update && sudo apt upgrade -y

# Aktifkan Swap 2GB (sebagai safety buffer RAM 2GB)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Instalasi Docker & Docker Compose
sudo apt install -y ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Konfigurasi Firewall UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (Cloudflare reverse proxy)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### B. Deployment Aplikasi Menggunakan Docker Compose
1. Clone repositori aplikasi ke `/opt/andara-erp`:
   ```bash
   git clone <URL_REPOSITORY> /opt/andara-erp
   cd /opt/andara-erp
   ```
2. Buat file `.env` produksi dari template:
   ```bash
   cp .env.production.example .env
   nano .env
   ```
   *Isi kata sandi database yang kuat dan kredensial Cloudflare R2.*

3. Jalankan container produksi:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

4. Verifikasi status container dan log:
   ```bash
   docker compose -f docker-compose.prod.yml ps
   docker compose -f docker-compose.prod.yml logs -f backend
   ```

---

## 3. Otomatisasi Backup Database ke Cloudflare R2

1. Siapkan AWS CLI di server VPS untuk upload ke Cloudflare R2:
   ```bash
   sudo apt install -y awscli
   ```
2. Berikan izin eksekusi pada script backup:
   ```bash
   chmod +x /opt/andara-erp/infrastructure/scripts/backup.sh
   chmod +x /opt/andara-erp/infrastructure/scripts/restore.sh
   ```
3. Jadwalkan cron job pencadangan otomatis harian (setiap pukul 02:00 WIB):
   ```bash
   sudo crontab -e
   ```
   Tambahkan baris berikut:
   ```text
   0 19 * * * /opt/andara-erp/infrastructure/scripts/backup.sh >> /var/log/andara_backup.log 2>&1
   ```
   *(Pukul 19:00 UTC = 02:00 WIB dini hari).*

---

## 4. Prosedur Pemulihan Bencana (Disaster Recovery / Restore AT-20)

Jika terjadi kendala data atau server rusak:
```bash
/opt/andara-erp/infrastructure/scripts/restore.sh /var/backups/andara/andara_backup_YYYYMMDD_HHMMSS.sql.gz
```
Script akan:
1. Memverifikasi integritas checksum SHA-256 berkas arsip.
2. Memulihkan skema dan seluruh baris data ke database PostgreSQL.
3. Menjalankan query verifikasi konsistensi jumlah pelanggan, kegiatan, penawaran, faktur, pembayaran kas, dan saldo deposit.

---

## 5. Monitoring & Notifikasi Gangguan
- **UptimeRobot Free:** Daftarkan URL monitor `https://andara.co.id/actuator/health` dengan interval pengecekan 5 menit (notifikasi via email/Telegram).
- **Sentry Free:** Masukkan DSN pada `.env` (`SENTRY_DSN=...`) untuk penangkapan otomatis error/exception tanpa data sensitif.

#!/bin/bash
# ==============================================================================
# Sistem Manajemen Operasional & Transaksi CV. ANDARA
# VPS Initialization Script — Ubuntu 22.04 LTS
#
# Server  : 202.155.14.98 (Cloud VPS Lite 2GB — Domainesia Jakarta)
# Domain  : cvandaraerp.web.id
# Dijalankan SEKALI saat pertama kali setup server baru.
#
# Usage:
#   ssh root@202.155.14.98
#   bash <(curl -fsSL https://raw.githubusercontent.com/REPO/main/infrastructure/setup/init-vps.sh)
#
#   ATAU setelah clone repo:
#   chmod +x /opt/andara-erp/infrastructure/setup/init-vps.sh
#   bash /opt/andara-erp/infrastructure/setup/init-vps.sh
# ==============================================================================

set -euo pipefail

# --- Warna output ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log()     { echo -e "${GREEN}[✔] $1${NC}"; }
warn()    { echo -e "${YELLOW}[!] $1${NC}"; }
error()   { echo -e "${RED}[✘] $1${NC}"; exit 1; }
section() { echo -e "\n${BLUE}========================================${NC}"; echo -e "${BLUE}  $1${NC}"; echo -e "${BLUE}========================================${NC}"; }

# --- Pastikan dijalankan sebagai root ---
if [ "$(id -u)" -ne 0 ]; then
    error "Script ini harus dijalankan sebagai root. Gunakan: sudo bash $0"
fi

# ============================================================
# KONFIGURASI — Sesuaikan jika diperlukan
# ============================================================
APP_DIR="/opt/andara-erp"
APP_USER="andara"
SWAP_SIZE="2G"
DOMAIN="cvandaraerp.web.id"
# ============================================================

section "1/7 — Update Sistem"
apt-get update -y && apt-get upgrade -y
apt-get install -y \
    ca-certificates curl gnupg lsb-release \
    git htop nano ufw unzip jq \
    awscli
log "Sistem terupdate dan package dasar terinstall."

# ============================================================
section "2/7 — Konfigurasi Swap (${SWAP_SIZE})"
# ============================================================
if [ ! -f /swapfile ]; then
    fallocate -l "${SWAP_SIZE}" /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    # Optimasi swappiness untuk server
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
    sysctl -p
    log "Swap ${SWAP_SIZE} berhasil dikonfigurasi."
else
    warn "Swap sudah ada, dilewati."
fi

# ============================================================
section "3/7 — Konfigurasi Firewall UFW"
# ============================================================
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    comment 'SSH'
ufw allow 80/tcp    comment 'HTTP (Cloudflare Proxy)'
ufw allow 443/tcp   comment 'HTTPS (Cloudflare Proxy)'
ufw --force enable
log "Firewall UFW aktif: allow 22, 80, 443."

# ============================================================
section "4/7 — Instalasi Docker & Docker Compose"
# ============================================================
if ! command -v docker &>/dev/null; then
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
        | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
        | tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update -y
    apt-get install -y \
        docker-ce docker-ce-cli containerd.io \
        docker-buildx-plugin docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    log "Docker $(docker --version) terinstall."
else
    warn "Docker sudah terinstall: $(docker --version)"
fi

# ============================================================
section "5/7 — Konfigurasi AWS CLI untuk Cloudflare R2"
# ============================================================
# Buat AWS config profile khusus untuk Cloudflare R2
mkdir -p /root/.aws

cat > /root/.aws/config << 'EOF'
[default]
region = auto
output = json

[profile r2]
region = auto
output = json
EOF

# Credentials akan diisi dari .env saat deployment
# File credentials TIDAK disimpan di sini — diambil via environment variable di script backup
log "AWS CLI dikonfigurasi untuk Cloudflare R2."

# ============================================================
section "6/7 — Persiapan Direktori Aplikasi"
# ============================================================
mkdir -p "${APP_DIR}"
mkdir -p /var/backups/andara
mkdir -p /var/log
touch /var/log/andara_backup.log

# Clone atau update repo
if [ -d "${APP_DIR}/.git" ]; then
    warn "Repository sudah ada di ${APP_DIR}. Menjalankan git pull..."
    git -C "${APP_DIR}" pull
else
    warn "Repository belum ada. Clone secara manual:"
    warn "  git clone <URL_REPOSITORY> ${APP_DIR}"
    warn "Lanjutkan setup setelah clone selesai."
fi

# Izin eksekusi untuk semua script
find "${APP_DIR}/infrastructure/scripts" -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true
find "${APP_DIR}/infrastructure/setup"   -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true

log "Direktori aplikasi siap di ${APP_DIR}."

# ============================================================
section "7/7 — Verifikasi & Ringkasan"
# ============================================================
echo ""
echo -e "${GREEN}=== SETUP SELESAI ===${NC}"
echo ""
echo "Server     : 202.155.14.98"
echo "Domain     : ${DOMAIN}"
echo "Swap       : $(swapon --show | tail -n1 | awk '{print $3}') aktif"
echo "Docker     : $(docker --version)"
echo "Compose    : $(docker compose version)"
echo "UFW        : $(ufw status | head -1)"
echo ""
echo -e "${YELLOW}=== LANGKAH SELANJUTNYA ===${NC}"
echo ""
echo "1. Clone repository ke ${APP_DIR} jika belum:"
echo "   git clone <URL_REPO> ${APP_DIR}"
echo ""
echo "2. Buat file .env dari template:"
echo "   cp ${APP_DIR}/.env.production.example ${APP_DIR}/.env"
echo "   nano ${APP_DIR}/.env"
echo "   # Isi: POSTGRES_PASSWORD, R2_ENDPOINT, R2_ACCESS_KEY, R2_SECRET_KEY"
echo ""
echo "3. Dapatkan Cloudflare Origin Certificate dan simpan ke:"
echo "   /etc/nginx/ssl/cvandaraerp.web.id.pem"
echo "   /etc/nginx/ssl/cvandaraerp.web.id.key"
echo "   (Panduan: docs/DEPLOYMENT_GUIDE.md → Bagian SSL)"
echo ""
echo "4. Jalankan aplikasi:"
echo "   bash ${APP_DIR}/infrastructure/scripts/deploy.sh"
echo ""
echo -e "${GREEN}VPS siap untuk deployment! 🚀${NC}"

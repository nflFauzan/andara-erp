#!/bin/bash
# ==============================================================================
# Sistem Manajemen Operasional & Transaksi CV. ANDARA
# Deploy / Update Aplikasi Production
#
# Usage:
#   bash /opt/andara-erp/infrastructure/scripts/deploy.sh           # deploy normal
#   bash /opt/andara-erp/infrastructure/scripts/deploy.sh --rebuild  # rebuild image
#   bash /opt/andara-erp/infrastructure/scripts/deploy.sh --rollback # rollback ke image sebelumnya
# ==============================================================================

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log()     { echo -e "${GREEN}[✔] $1${NC}"; }
warn()    { echo -e "${YELLOW}[!] $1${NC}"; }
error()   { echo -e "${RED}[✘] $1${NC}"; exit 1; }
section() { echo -e "\n${BLUE}=== $1 ===${NC}"; }

APP_DIR="/opt/andara-erp"
COMPOSE_FILE="${APP_DIR}/docker-compose.prod.yml"
ENV_FILE="${APP_DIR}/.env"
MODE="${1:-}"

# --- Validasi ---
if [ ! -f "${COMPOSE_FILE}" ]; then
    error "docker-compose.prod.yml tidak ditemukan di ${APP_DIR}. Clone repository terlebih dahulu."
fi

if [ ! -f "${ENV_FILE}" ]; then
    error ".env tidak ditemukan di ${APP_DIR}. Buat dari template: cp .env.production.example .env"
fi

cd "${APP_DIR}"

# ============================================================
section "Mengambil update terbaru dari repository"
# ============================================================
if [ -d "${APP_DIR}/.git" ]; then
    git pull origin main
    log "Repository terupdate."
else
    warn "Bukan git repository, skip git pull."
fi

# ============================================================
if [ "${MODE}" = "--rollback" ]; then
    section "ROLLBACK — Mengembalikan ke container sebelumnya"
    warn "Rollback: merestart container tanpa rebuild."
    docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" restart
    log "Rollback selesai."
    exit 0
fi

# ============================================================
section "Menjalankan deployment"
# ============================================================

BUILD_FLAG=""
if [ "${MODE}" = "--rebuild" ]; then
    warn "Mode --rebuild: image akan di-rebuild dari source."
    BUILD_FLAG="--build"
fi

# Backup database sebelum deploy (safety net - hanya jika container database sudah aktif)
section "Backup database sebelum deploy"
if [ -f "${APP_DIR}/infrastructure/scripts/backup.sh" ] && docker ps --format '{{.Names}}' | grep -q "^andara-postgres-prod$"; then
    bash "${APP_DIR}/infrastructure/scripts/backup.sh" || warn "Backup pre-deploy gagal, melanjutkan deploy..."
    log "Backup pre-deploy selesai."
else
    warn "Container database belum aktif (deployment pertama kali), skip backup."
fi

# Pull image terbaru (jika menggunakan registry) atau build lokal
section "Menjalankan docker compose"
docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" up -d ${BUILD_FLAG}

# ============================================================
section "Verifikasi container berjalan"
# ============================================================
sleep 5
echo ""
docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" ps
echo ""

# Cek health backend
BACKEND_STATUS=$(docker inspect --format='{{.State.Health.Status}}' andara-backend-prod 2>/dev/null || echo "unknown")
if [ "${BACKEND_STATUS}" = "healthy" ] || [ "${BACKEND_STATUS}" = "unknown" ]; then
    log "Backend container: ${BACKEND_STATUS}"
else
    warn "Backend container status: ${BACKEND_STATUS} — cek log: docker compose -f docker-compose.prod.yml logs backend"
fi

echo ""
log "Deployment selesai!"
echo ""
echo "  Aplikasi: https://cvandaraerp.web.id"
echo "  Health  : https://cvandaraerp.web.id/actuator/health"
echo ""
echo "  Lihat log: docker compose -f ${COMPOSE_FILE} logs -f backend"

#!/bin/bash
# ==============================================================================
# Sistem Manajemen Operasional & Transaksi CV. ANDARA
# Cloudflare DNS Setup via API
#
# Script ini membuat DNS record di Cloudflare untuk domain cvandaraerp.web.id
# agar mengarah ke VPS server.
#
# Prasyarat:
#   - Domain sudah ditambahkan ke Cloudflare dan status Active
#   - CF_ZONE_ID dan CF_API_TOKEN sudah diisi
#
# Usage:
#   bash /opt/andara-erp/infrastructure/setup/setup-cloudflare-dns.sh
# ==============================================================================

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()   { echo -e "${GREEN}[✔] $1${NC}"; }
warn()  { echo -e "${YELLOW}[!] $1${NC}"; }
error() { echo -e "${RED}[✘] $1${NC}"; exit 1; }

# ============================================================
# KONFIGURASI — ISI NILAI INI
# ============================================================
CF_ZONE_ID="be7f99482a87a9b958c29de679e927bf"
CF_API_TOKEN=""           # ← Isi API Token Cloudflare baru (setelah di-revoke dan buat ulang)
SERVER_IPV4="202.155.14.98"
SERVER_IPV6="2001:df7:5300:18::5e8"
DOMAIN="cvandaraerp.web.id"
# ============================================================

if [ -z "${CF_API_TOKEN}" ]; then
    error "CF_API_TOKEN belum diisi! Edit script ini dan masukkan API Token Cloudflare."
fi

CF_API="https://api.cloudflare.com/client/v4"

cloudflare_api() {
    local METHOD="$1"
    local ENDPOINT="$2"
    local DATA="${3:-}"
    curl -s -X "${METHOD}" \
        "${CF_API}${ENDPOINT}" \
        -H "Authorization: Bearer ${CF_API_TOKEN}" \
        -H "Content-Type: application/json" \
        ${DATA:+-d "${DATA}"}
}

check_response() {
    local RESPONSE="$1"
    local SUCCESS
    SUCCESS=$(echo "${RESPONSE}" | jq -r '.success')
    if [ "${SUCCESS}" != "true" ]; then
        echo "${RESPONSE}" | jq '.errors'
        error "Cloudflare API request gagal."
    fi
}

upsert_dns_record() {
    local TYPE="$1"
    local NAME="$2"
    local CONTENT="$3"
    local PROXIED="${4:-true}"

    echo ""
    echo "  → Memeriksa record ${TYPE} ${NAME}..."

    # Cek apakah record sudah ada
    EXISTING=$(cloudflare_api GET "/zones/${CF_ZONE_ID}/dns_records?type=${TYPE}&name=${NAME}")
    RECORD_ID=$(echo "${EXISTING}" | jq -r '.result[0].id // empty')

    if [ -n "${RECORD_ID}" ]; then
        warn "Record sudah ada (ID: ${RECORD_ID}). Mengupdate..."
        RESPONSE=$(cloudflare_api PUT "/zones/${CF_ZONE_ID}/dns_records/${RECORD_ID}" \
            "{\"type\":\"${TYPE}\",\"name\":\"${NAME}\",\"content\":\"${CONTENT}\",\"proxied\":${PROXIED},\"ttl\":1}")
        check_response "${RESPONSE}"
        log "Record ${TYPE} ${NAME} → ${CONTENT} (updated, proxied=${PROXIED})"
    else
        RESPONSE=$(cloudflare_api POST "/zones/${CF_ZONE_ID}/dns_records" \
            "{\"type\":\"${TYPE}\",\"name\":\"${NAME}\",\"content\":\"${CONTENT}\",\"proxied\":${PROXIED},\"ttl\":1}")
        check_response "${RESPONSE}"
        log "Record ${TYPE} ${NAME} → ${CONTENT} (created, proxied=${PROXIED})"
    fi
}

echo ""
echo -e "${GREEN}=== Cloudflare DNS Setup — ${DOMAIN} ===${NC}"
echo ""

# Verifikasi token
echo "  Verifikasi API Token..."
TOKEN_CHECK=$(cloudflare_api GET "/user/tokens/verify")
check_response "${TOKEN_CHECK}"
log "API Token valid."

# === DNS Records ===

# Root domain A record (IPv4) — proxied melalui Cloudflare
upsert_dns_record "A"    "${DOMAIN}"         "${SERVER_IPV4}" "true"

# Root domain AAAA record (IPv6) — proxied melalui Cloudflare
upsert_dns_record "AAAA" "${DOMAIN}"         "${SERVER_IPV6}" "true"

# www subdomain → redirect ke root (proxied)
upsert_dns_record "CNAME" "www.${DOMAIN}"    "${DOMAIN}"     "true"

echo ""
echo -e "${GREEN}=== DNS Setup Selesai ===${NC}"
echo ""
echo "  Domain   : ${DOMAIN}"
echo "  IPv4     : ${SERVER_IPV4}"
echo "  IPv6     : ${SERVER_IPV6}"
echo "  Proxied  : Ya (traffic lewat Cloudflare)"
echo ""
echo -e "${YELLOW}Catatan:${NC}"
echo "  - SSL Mode di Cloudflare harus diset ke 'Full' atau 'Full (Strict)'"
echo "  - Pastikan Cloudflare Origin Certificate sudah dipasang di Nginx"
echo "  - DNS propagation bisa memakan waktu 1-5 menit"
echo ""
warn "LANGKAH BERIKUTNYA: Setup Cloudflare Origin Certificate untuk SSL"
echo "  Buka: Cloudflare → SSL/TLS → Origin Server → Create Certificate"
echo "  Simpan certificate ke: /etc/nginx/ssl/cvandaraerp.web.id.pem"
echo "  Simpan private key ke : /etc/nginx/ssl/cvandaraerp.web.id.key"

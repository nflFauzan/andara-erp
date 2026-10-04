#!/bin/bash
# ==============================================================================
# Sistem Manajemen Operasional & Transaksi CV. ANDARA
# Panduan Setup Cloudflare Origin Certificate (SSL)
#
# Script ini TIDAK otomatis — ini adalah panduan interaktif untuk
# meletakkan Cloudflare Origin Certificate di server.
#
# Jalankan setelah init-vps.sh selesai.
# ==============================================================================

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()     { echo -e "${GREEN}[✔] $1${NC}"; }
warn()    { echo -e "${YELLOW}[!] $1${NC}"; }
section() { echo -e "\n${BLUE}=== $1 ===${NC}"; }

SSL_DIR="/etc/nginx/ssl"
DOMAIN="cvandaraerp.web.id"
CERT_FILE="${SSL_DIR}/${DOMAIN}.pem"
KEY_FILE="${SSL_DIR}/${DOMAIN}.key"

mkdir -p "${SSL_DIR}"
chmod 700 "${SSL_DIR}"

echo ""
echo -e "${GREEN}=== Setup Cloudflare Origin Certificate ===${NC}"
echo ""
echo "Cloudflare Origin Certificate adalah sertifikat SSL gratis yang"
echo "dikeluarkan Cloudflare untuk koneksi aman antara Cloudflare dan"
echo "server VPS kamu (valid 15 tahun)."
echo ""

section "LANGKAH MANUAL — Ikuti instruksi berikut"
echo ""
echo "1. Buka: https://dash.cloudflare.com"
echo "2. Pilih domain: ${DOMAIN}"
echo "3. Klik menu: SSL/TLS → Origin Server"
echo "4. Klik: Create Certificate"
echo "5. Pilih: Let Cloudflare generate a private key and CSR"
echo "6. Hostnames: pastikan ada '${DOMAIN}' dan '*.${DOMAIN}'"
echo "7. Certificate Validity: pilih 15 years"
echo "8. Klik: Create"
echo ""
echo "   Kamu akan mendapat 2 blok teks:"
echo "   - Origin Certificate (-----BEGIN CERTIFICATE-----)"
echo "   - Private Key        (-----BEGIN PRIVATE KEY-----)"
echo ""

section "Tempel Certificate ke server"
echo ""
echo "Salin isi 'Origin Certificate' (termasuk baris BEGIN dan END),"
echo "lalu paste di bawah ini. Tekan Enter kosong 2x jika selesai:"
echo ""

# Baca certificate dari stdin
CERT_CONTENT=""
while IFS= read -r LINE; do
    [ -z "${LINE}" ] && break
    CERT_CONTENT+="${LINE}"$'\n'
done

if [ -n "${CERT_CONTENT}" ]; then
    echo "${CERT_CONTENT}" > "${CERT_FILE}"
    chmod 644 "${CERT_FILE}"
    log "Certificate disimpan ke ${CERT_FILE}"
else
    warn "Tidak ada input certificate. Buat manual:"
    warn "  nano ${CERT_FILE}"
    warn "  Paste isi Origin Certificate, simpan."
fi

section "Tempel Private Key ke server"
echo ""
echo "Salin isi 'Private Key' (termasuk baris BEGIN dan END),"
echo "lalu paste di bawah ini. Tekan Enter kosong 2x jika selesai:"
echo ""

KEY_CONTENT=""
while IFS= read -r LINE; do
    [ -z "${LINE}" ] && break
    KEY_CONTENT+="${LINE}"$'\n'
done

if [ -n "${KEY_CONTENT}" ]; then
    echo "${KEY_CONTENT}" > "${KEY_FILE}"
    chmod 600 "${KEY_FILE}"
    log "Private key disimpan ke ${KEY_FILE}"
else
    warn "Tidak ada input key. Buat manual:"
    warn "  nano ${KEY_FILE}"
    warn "  Paste isi Private Key, simpan."
fi

section "Verifikasi file SSL"
echo ""
if [ -f "${CERT_FILE}" ] && [ -f "${KEY_FILE}" ]; then
    log "Certificate: ${CERT_FILE} ($(wc -c < "${CERT_FILE}") bytes)"
    log "Private Key: ${KEY_FILE} ($(wc -c < "${KEY_FILE}") bytes)"
    echo ""
    log "File SSL siap digunakan oleh Nginx."
else
    warn "File SSL belum lengkap. Pastikan keduanya ada sebelum menjalankan deploy."
fi

section "Set SSL Mode di Cloudflare"
echo ""
echo "1. Buka: https://dash.cloudflare.com → ${DOMAIN}"
echo "2. Klik: SSL/TLS → Overview"
echo "3. Pilih mode: Full (Strict)"
echo ""
log "Setelah ini jalankan: bash /opt/andara-erp/infrastructure/scripts/deploy.sh"

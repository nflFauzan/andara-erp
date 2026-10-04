#!/bin/bash
# ==============================================================================
# Sistem Manajemen Operasional & Transaksi CV. ANDARA
# Setup SSH Key untuk GitHub Actions
#
# Jalankan di VPS: bash /opt/andara-erp/infrastructure/setup/setup-github-actions-ssh.sh
#
# Script ini akan:
#   1. Generate SSH key pair khusus untuk GitHub Actions
#   2. Tambahkan public key ke authorized_keys VPS
#   3. Tampilkan private key yang harus disalin ke GitHub Secrets
# ==============================================================================

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()     { echo -e "${GREEN}[✔] $1${NC}"; }
warn()    { echo -e "${YELLOW}[!] $1${NC}"; }
section() { echo -e "\n${BLUE}=== $1 ===${NC}"; }

KEY_DIR="/root/.ssh"
KEY_FILE="${KEY_DIR}/github_actions_andara"
AUTHORIZED_KEYS="${KEY_DIR}/authorized_keys"

mkdir -p "${KEY_DIR}"
chmod 700 "${KEY_DIR}"

section "1/3 — Generate SSH Key Pair untuk GitHub Actions"

if [ -f "${KEY_FILE}" ]; then
    warn "Key sudah ada di ${KEY_FILE}. Menghapus dan membuat ulang..."
    rm -f "${KEY_FILE}" "${KEY_FILE}.pub"
fi

ssh-keygen -t ed25519 -C "github-actions@cvandaraerp" -f "${KEY_FILE}" -N ""
chmod 600 "${KEY_FILE}"
chmod 644 "${KEY_FILE}.pub"

log "SSH key pair berhasil dibuat:"
echo "  Private key : ${KEY_FILE}"
echo "  Public key  : ${KEY_FILE}.pub"

section "2/3 — Daftarkan Public Key ke authorized_keys VPS"

touch "${AUTHORIZED_KEYS}"
chmod 600 "${AUTHORIZED_KEYS}"

# Tambahkan public key jika belum ada
PUB_KEY=$(cat "${KEY_FILE}.pub")
if ! grep -qF "${PUB_KEY}" "${AUTHORIZED_KEYS}"; then
    echo "${PUB_KEY}" >> "${AUTHORIZED_KEYS}"
    log "Public key berhasil ditambahkan ke authorized_keys."
else
    warn "Public key sudah ada di authorized_keys, dilewati."
fi

section "3/3 — Salin Private Key ke GitHub Secrets"

echo ""
echo -e "${YELLOW}============================================================${NC}"
echo -e "${YELLOW}  PENTING: Salin private key berikut ke GitHub Secrets      ${NC}"
echo -e "${YELLOW}============================================================${NC}"
echo ""
echo "Nama secret : SSH_PRIVATE_KEY"
echo "Isi secret  :"
echo ""
cat "${KEY_FILE}"
echo ""
echo -e "${YELLOW}============================================================${NC}"
echo ""
echo -e "${BLUE}Cara menambahkan ke GitHub:${NC}"
echo "  1. Buka repository GitHub kamu"
echo "  2. Settings → Secrets and variables → Actions"
echo "  3. Klik: New repository secret"
echo "  4. Name  : SSH_PRIVATE_KEY"
echo "  5. Secret: paste isi key di atas (termasuk baris -----BEGIN dan -----END)"
echo "  6. Klik: Add secret"
echo ""
log "Setup GitHub Actions SSH selesai!"
echo ""
warn "SECURITY: Jangan share private key ini ke siapapun selain GitHub Secrets."

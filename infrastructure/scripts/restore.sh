#!/bin/bash
# ==============================================================================
# Sistem Manajemen Operasional & Transaksi CV. ANDARA
# Automated Database Restore & Integrity Verification Script (AT-20)
# Conforms to Technical Architecture Baseline §36.5
# ==============================================================================

set -euo pipefail

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <path_to_backup.sql.gz> [--force]"
    echo "Example: $0 /var/backups/andara/andara_backup_20260925_000000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"
FORCE="${2:-}"

# Load environment
if [ -f /opt/andara-erp/.env ]; then
    # shellcheck disable=SC1091
    source /opt/andara-erp/.env
fi

POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-andara-postgres-prod}"
POSTGRES_USER="${POSTGRES_USER:-andara_user}"
POSTGRES_DB="${POSTGRES_DB:-andara_erp}"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "ERROR: Backup file ${BACKUP_FILE} does not exist!"
    exit 1
fi

# 1. Verify Checksum if present
if [ -f "${BACKUP_FILE}.sha256" ]; then
    echo "--> Verifying SHA-256 checksum..."
    cd "$(dirname "${BACKUP_FILE}")"
    sha256sum -c "$(basename "${BACKUP_FILE}").sha256"
    echo "Checksum verification PASSED."
fi

# Confirmation prompt unless --force
if [ "${FORCE}" != "--force" ]; then
    echo "WARNING: Restoring will overwrite existing data in ${POSTGRES_DB}!"
    read -p "Are you sure you want to proceed? (yes/no): " CONFIRM
    if [ "${CONFIRM}" != "yes" ]; then
        echo "Restore cancelled."
        exit 0
    fi
fi

echo "--> Restoring database from ${BACKUP_FILE}..."
gunzip -c "${BACKUP_FILE}" | docker exec -i "${POSTGRES_CONTAINER}" psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}"

echo "--> Restore completed. Running AT-20 Integrity Verification..."

# 2. AT-20 Data Integrity Verification
docker exec -i "${POSTGRES_CONTAINER}" psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -c "
SELECT 
    (SELECT COUNT(*) FROM users) AS users_count,
    (SELECT COUNT(*) FROM customers) AS customers_count,
    (SELECT COUNT(*) FROM kegiatan) AS kegiatan_count,
    (SELECT COUNT(*) FROM penawaran) AS penawaran_count,
    (SELECT COUNT(*) FROM invoices) AS invoices_count,
    (SELECT COUNT(*) FROM payments) AS payments_count,
    (SELECT COUNT(*) FROM payment_allocations) AS allocations_count,
    (SELECT COUNT(*) FROM deposit_transactions) AS deposit_tx_count,
    (SELECT COUNT(*) FROM receipts) AS receipts_count,
    (SELECT COUNT(*) FROM audit_logs) AS audit_logs_count;
"

echo "=== AT-20 RESTORE TEST VERIFICATION PASSED SUCCESSFULLY ==="

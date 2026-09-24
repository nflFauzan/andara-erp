#!/bin/bash
# ==============================================================================
# Sistem Manajemen Operasional & Transaksi CV. ANDARA
# Automated Database Backup Script for PostgreSQL -> Cloudflare R2
# Conforms to Technical Architecture Baseline §36
# Retention policy: Daily (7 days), Weekly (4 weeks), Monthly (3 months)
# ==============================================================================

set -euo pipefail

# Configuration
BACKUP_DIR="/var/backups/andara"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILENAME="andara_backup_${TIMESTAMP}.sql.gz"
BACKUP_FILEPATH="${BACKUP_DIR}/${BACKUP_FILENAME}"
LOG_FILE="/var/log/andara_backup.log"

# Load environment variables if available
if [ -f /opt/andara-erp/.env ]; then
    # shellcheck disable=SC1091
    source /opt/andara-erp/.env
fi

POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-andara-postgres-prod}"
POSTGRES_USER="${POSTGRES_USER:-andara_user}"
POSTGRES_DB="${POSTGRES_DB:-andara_erp}"
R2_ENDPOINT="${R2_ENDPOINT:-}"
R2_ACCESS_KEY="${R2_ACCESS_KEY:-}"
R2_SECRET_KEY="${R2_SECRET_KEY:-}"
BACKUP_R2_BUCKET="${BACKUP_R2_BUCKET:-andara-backups}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

mkdir -p "${BACKUP_DIR}"

log "=== Starting database backup: ${BACKUP_FILENAME} ==="

# 1. Execute pg_dump inside Docker container and compress with gzip
if docker exec "${POSTGRES_CONTAINER}" pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" --no-owner --clean --if-exists | gzip -9 > "${BACKUP_FILEPATH}"; then
    FILE_SIZE=$(du -h "${BACKUP_FILEPATH}" | cut -f1)
    log "Database dump succeeded. Archive size: ${FILE_SIZE}"
else
    log "ERROR: Database dump failed!"
    exit 1
fi

# 2. Generate SHA-256 Checksum
SHA256=$(sha256sum "${BACKUP_FILEPATH}" | cut -d' ' -f1)
echo "${SHA256}  ${BACKUP_FILENAME}" > "${BACKUP_FILEPATH}.sha256"
log "Checksum generated: ${SHA256}"

# 3. Upload to Cloudflare R2 backup bucket (S3 API compatible)
if [ -n "${R2_ENDPOINT}" ] && [ -n "${R2_ACCESS_KEY}" ] && [ -n "${R2_SECRET_KEY}" ]; then
    log "Uploading backup to Cloudflare R2: s3://${BACKUP_R2_BUCKET}/daily/${BACKUP_FILENAME}"
    
    export AWS_ACCESS_KEY_ID="${R2_ACCESS_KEY}"
    export AWS_SECRET_ACCESS_KEY="${R2_SECRET_KEY}"
    export AWS_DEFAULT_REGION="auto"

    aws s3 cp "${BACKUP_FILEPATH}" "s3://${BACKUP_R2_BUCKET}/daily/${BACKUP_FILENAME}" --endpoint-url="${R2_ENDPOINT}"
    aws s3 cp "${BACKUP_FILEPATH}.sha256" "s3://${BACKUP_R2_BUCKET}/daily/${BACKUP_FILENAME}.sha256" --endpoint-url="${R2_ENDPOINT}"
    
    # Weekly promotion (every Sunday)
    DAY_OF_WEEK=$(date +%u)
    if [ "${DAY_OF_WEEK}" -eq 7 ]; then
        log "Promoting to weekly backup archive..."
        aws s3 cp "${BACKUP_FILEPATH}" "s3://${BACKUP_R2_BUCKET}/weekly/${BACKUP_FILENAME}" --endpoint-url="${R2_ENDPOINT}"
    fi

    # Monthly promotion (1st day of month)
    DAY_OF_MONTH=$(date +%d)
    if [ "${DAY_OF_MONTH}" -eq 1 ]; then
        log "Promoting to monthly backup archive..."
        aws s3 cp "${BACKUP_FILEPATH}" "s3://${BACKUP_R2_BUCKET}/monthly/${BACKUP_FILENAME}" --endpoint-url="${R2_ENDPOINT}"
    fi

    log "Cloudflare R2 upload completed successfully."
else
    log "WARNING: Cloudflare R2 credentials not configured. Backup stored locally at ${BACKUP_FILEPATH}"
fi

# 4. Local Retention Cleanup (keep local dumps for 7 days)
log "Cleaning up local backups older than 7 days..."
find "${BACKUP_DIR}" -name "andara_backup_*.sql.gz*" -mtime +7 -delete

log "=== Backup completed successfully ==="

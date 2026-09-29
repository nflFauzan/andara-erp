-- ==============================================================================
-- V12: Invoice SPH Kegiatan Link & Work Location
-- Proyek: Sistem Manajemen Operasional & Transaksi CV. ANDARA
-- ==============================================================================

-- 1. Add work_location to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS work_location VARCHAR(255);

-- 2. Add sph_kegiatan_id to invoice_details
ALTER TABLE invoice_details ADD COLUMN IF NOT EXISTS sph_kegiatan_id BIGINT REFERENCES sph_kegiatan(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_invoice_details_sph_kegiatan_id ON invoice_details(sph_kegiatan_id);

-- 3. Backfill existing invoice_details that have source_penawaran_detail_id
UPDATE invoice_details id
SET sph_kegiatan_id = pd.sph_kegiatan_id
FROM penawaran_details pd
WHERE id.source_penawaran_detail_id = pd.id
  AND id.sph_kegiatan_id IS NULL
  AND pd.sph_kegiatan_id IS NOT NULL;

-- ==============================================================================
-- V18: Multi-SPH Invoicing Support (Konsolidasi Multi-SPH - Fase 4)
-- Proyek: Sistem Manajemen Operasional & Transaksi CV. ANDARA
-- ==============================================================================

-- 1. Tambah referensi penawaran langsung di level detail faktur
ALTER TABLE invoice_details
    ADD COLUMN IF NOT EXISTS source_penawaran_id BIGINT REFERENCES penawaran(id) ON DELETE SET NULL;

-- 2. Index untuk query penelusuran per SPH pada detail faktur
CREATE INDEX IF NOT EXISTS idx_invoice_details_source_penawaran_id ON invoice_details(source_penawaran_id);

-- 3. Backfill data existing: isi source_penawaran_id dari penawaran_details atau invoice induk
UPDATE invoice_details id
SET source_penawaran_id = pd.penawaran_id
FROM penawaran_details pd
WHERE id.source_penawaran_detail_id = pd.id
  AND id.source_penawaran_id IS NULL;

UPDATE invoice_details id
SET source_penawaran_id = inv.source_penawaran_id
FROM invoices inv
WHERE id.invoice_id = inv.id
  AND id.source_penawaran_id IS NULL
  AND inv.source_penawaran_id IS NOT NULL;

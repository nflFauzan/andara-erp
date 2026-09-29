-- ==============================================================================
-- V11: SPH Kegiatan Structure Migration
-- Proyek: Sistem Manajemen Operasional & Transaksi CV. ANDARA
-- ==============================================================================

-- 1. Create sph_kegiatan Table (Kegiatan kelompok di dalam SPH)
CREATE TABLE IF NOT EXISTS sph_kegiatan (
    id BIGSERIAL PRIMARY KEY,
    penawaran_id BIGINT NOT NULL REFERENCES penawaran(id) ON DELETE CASCADE,
    name VARCHAR(500) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sph_kegiatan_penawaran_id ON sph_kegiatan(penawaran_id);
CREATE INDEX IF NOT EXISTS idx_sph_kegiatan_sort_order ON sph_kegiatan(penawaran_id, sort_order);

-- 2. Add columns to penawaran_details
ALTER TABLE penawaran_details
    ADD COLUMN IF NOT EXISTS sph_kegiatan_id BIGINT REFERENCES sph_kegiatan(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS item_catalog_id BIGINT REFERENCES item_catalog(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_penawaran_details_sph_kegiatan_id ON penawaran_details(sph_kegiatan_id);
CREATE INDEX IF NOT EXISTS idx_penawaran_details_item_catalog_id ON penawaran_details(item_catalog_id);

-- 3. Auto-migration: Create 1 default sph_kegiatan for existing penawaran data
-- (Semua item penawaran lama masuk ke satu kegiatan default)
INSERT INTO sph_kegiatan (penawaran_id, name, sort_order, subtotal)
SELECT 
    p.id,
    COALESCE(NULLIF(TRIM(p.notes), ''), 'Pekerjaan Utama'),
    1,
    p.total_amount
FROM penawaran p
WHERE EXISTS (
    SELECT 1 FROM penawaran_details pd 
    WHERE pd.penawaran_id = p.id AND pd.sph_kegiatan_id IS NULL
)
ON CONFLICT DO NOTHING;

-- Link existing penawaran_details to their default sph_kegiatan
UPDATE penawaran_details pd
SET sph_kegiatan_id = sk.id
FROM sph_kegiatan sk
WHERE pd.penawaran_id = sk.penawaran_id
  AND pd.sph_kegiatan_id IS NULL;

-- Update sequence counters
SELECT setval('sph_kegiatan_id_seq', (SELECT COALESCE(MAX(id), 1) FROM sph_kegiatan));

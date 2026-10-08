-- =====================================================================
-- V20: Relasi Foreign Key sph_kegiatan ke Master Data kegiatan
-- Sistem Manajemen Operasional & Transaksi CV. ANDARA
-- =====================================================================

-- 1. Tambahkan kolom kegiatan_id ke tabel sph_kegiatan
ALTER TABLE sph_kegiatan
    ADD COLUMN IF NOT EXISTS kegiatan_id BIGINT REFERENCES kegiatan(id) ON DELETE SET NULL;

-- 2. Buat index performa untuk pencarian kegiatan terkait SPH
CREATE INDEX IF NOT EXISTS idx_sph_kegiatan_kegiatan_id ON sph_kegiatan(kegiatan_id);

-- 3. Backfill data lama: tautkan sph_kegiatan ke kegiatan jika rincian itemnya sudah memiliki kegiatan_id
UPDATE sph_kegiatan sk
SET kegiatan_id = sub.kegiatan_id
FROM (
    SELECT DISTINCT ON (sph_kegiatan_id) sph_kegiatan_id, kegiatan_id
    FROM penawaran_details
    WHERE sph_kegiatan_id IS NOT NULL 
      AND kegiatan_id IS NOT NULL
    ORDER BY sph_kegiatan_id, id ASC
) sub
WHERE sk.id = sub.sph_kegiatan_id
  AND sk.kegiatan_id IS NULL;

-- 4. Pastikan rincian item di penawaran_details juga terisi kegiatan_id jika sph_kegiatan memiliki kegiatan_id
UPDATE penawaran_details pd
SET kegiatan_id = sk.kegiatan_id
FROM sph_kegiatan sk
WHERE pd.sph_kegiatan_id = sk.id
  AND pd.kegiatan_id IS NULL
  AND sk.kegiatan_id IS NOT NULL;

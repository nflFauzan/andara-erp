-- =====================================================================
-- V19: Dukungan SPH Addendum / Variation Order (Pekerjaan Tambah-Kurang)
-- Sistem Manajemen Operasional & Transaksi CV. ANDARA
-- =====================================================================

ALTER TABLE penawaran
    ADD COLUMN IF NOT EXISTS parent_penawaran_id BIGINT REFERENCES penawaran(id) ON DELETE RESTRICT,
    ADD COLUMN IF NOT EXISTS is_addendum BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS addendum_number_index INT DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_penawaran_parent_id ON penawaran(parent_penawaran_id);
CREATE INDEX IF NOT EXISTS idx_penawaran_is_addendum ON penawaran(is_addendum);

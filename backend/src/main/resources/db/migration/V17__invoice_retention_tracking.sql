-- ==============================================================================
-- V17: Invoice Retention Tracking (Retensi Konstruksi Masa Pemeliharaan - Fase 3)
-- Proyek: Sistem Manajemen Operasional & Transaksi CV. ANDARA
-- ==============================================================================

-- 1. Tambah kolom retensi proyek pada tabel invoices
ALTER TABLE invoices
    ADD COLUMN IF NOT EXISTS is_retention_invoice BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS retention_percentage NUMERIC(5, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS retention_amount NUMERIC(15, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS retention_due_date DATE,
    ADD COLUMN IF NOT EXISTS parent_settlement_invoice_id BIGINT REFERENCES invoices(id) ON DELETE SET NULL;

-- 2. Indexes untuk performa query monitoring retensi dan relasi faktur induk
CREATE INDEX IF NOT EXISTS idx_invoices_retention ON invoices(is_retention_invoice, retention_due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_parent_settlement ON invoices(parent_settlement_invoice_id);

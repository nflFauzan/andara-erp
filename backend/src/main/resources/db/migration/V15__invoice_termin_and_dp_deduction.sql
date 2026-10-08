-- ==============================================================================
-- V15: Invoice Percentage Termin & Down Payment (DP) Deductions
-- Proyek: Sistem Manajemen Operasional & Transaksi CV. ANDARA
-- ==============================================================================

-- 1. Tambah kolom mode penagihan dan termin pada tabel invoices
ALTER TABLE invoices
    ADD COLUMN IF NOT EXISTS billing_mode VARCHAR(30) NOT NULL DEFAULT 'ITEM_VOLUME',
    ADD COLUMN IF NOT EXISTS termin_percentage NUMERIC(5, 2),
    ADD COLUMN IF NOT EXISTS termin_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS previous_dp_invoice_id BIGINT REFERENCES invoices(id) ON DELETE SET NULL;

-- 2. Tambah kolom klasifikasi item dan penanda potongan pada tabel invoice_details
ALTER TABLE invoice_details
    ADD COLUMN IF NOT EXISTS item_type VARCHAR(30) NOT NULL DEFAULT 'STANDARD',
    ADD COLUMN IF NOT EXISTS is_deduction BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Indexes untuk performa query termin dan penelusuran DP
CREATE INDEX IF NOT EXISTS idx_invoices_billing_mode ON invoices(source_penawaran_id, billing_mode);
CREATE INDEX IF NOT EXISTS idx_invoices_previous_dp ON invoices(previous_dp_invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_details_item_type ON invoice_details(item_type);

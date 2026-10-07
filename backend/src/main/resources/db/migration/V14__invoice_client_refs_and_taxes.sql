-- ==============================================================================
-- V14: Invoice Client References (PO/SPK/BAST) & Formal Tax Calculations
-- Proyek: Sistem Manajemen Operasional & Transaksi CV. ANDARA
-- ==============================================================================

-- 1. Tambah kolom referensi dokumen klien dan kalkulasi perpajakan formal
ALTER TABLE invoices
    ADD COLUMN IF NOT EXISTS client_po_number VARCHAR(100),
    ADD COLUMN IF NOT EXISTS client_spk_number VARCHAR(100),
    ADD COLUMN IF NOT EXISTS bast_number VARCHAR(100),
    ADD COLUMN IF NOT EXISTS subtotal_dpp NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal_dpp >= 0),
    ADD COLUMN IF NOT EXISTS tax_ppn_type VARCHAR(20) NOT NULL DEFAULT 'NONE' CHECK (tax_ppn_type IN ('NONE', 'INCLUDE', 'EXCLUDE_11', 'EXCLUDE_12')),
    ADD COLUMN IF NOT EXISTS tax_ppn_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (tax_ppn_rate >= 0),
    ADD COLUMN IF NOT EXISTS tax_ppn_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (tax_ppn_amount >= 0),
    ADD COLUMN IF NOT EXISTS tax_pph_type VARCHAR(30) NOT NULL DEFAULT 'NONE' CHECK (tax_pph_type IN ('NONE', 'PPH23_2', 'PPH_FINAL_KONSTRUKSI_1_75', 'PPH_FINAL_KONSTRUKSI_2_65')),
    ADD COLUMN IF NOT EXISTS tax_pph_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (tax_pph_rate >= 0),
    ADD COLUMN IF NOT EXISTS tax_pph_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (tax_pph_amount >= 0),
    ADD COLUMN IF NOT EXISTS net_total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (net_total_amount >= 0);

-- 2. Indexes untuk pencarian dokumen berdasarkan referensi PO / SPK klien
CREATE INDEX IF NOT EXISTS idx_invoices_client_po_number ON invoices(client_po_number);
CREATE INDEX IF NOT EXISTS idx_invoices_client_spk_number ON invoices(client_spk_number);

-- 3. Backfill data existing: subtotal_dpp dan net_total_amount diisi dari total_amount
UPDATE invoices
SET subtotal_dpp = total_amount,
    net_total_amount = total_amount
WHERE subtotal_dpp = 0.00 AND total_amount > 0.00;

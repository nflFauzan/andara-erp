-- ==============================================================================
-- V8: Receipts (Kwitansi) Migration
-- Proyek: Sistem Manajemen Operasional & Transaksi CV. ANDARA
-- ==============================================================================

CREATE TABLE IF NOT EXISTS receipts (
    id BIGSERIAL PRIMARY KEY,
    number VARCHAR(50) NOT NULL UNIQUE,
    payment_id BIGINT NOT NULL UNIQUE REFERENCES payments(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    received_from VARCHAR(150) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    spelled_out TEXT NOT NULL,
    description TEXT,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'BANK_TRANSFER',
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'VALID' CHECK (status IN ('VALID', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_receipts_number ON receipts(number);
CREATE INDEX IF NOT EXISTS idx_receipts_payment_id ON receipts(payment_id);
CREATE INDEX IF NOT EXISTS idx_receipts_date ON receipts(date);
CREATE INDEX IF NOT EXISTS idx_receipts_status ON receipts(status);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at);

-- Seed Initial Demo Receipt for Payment 1 (if Payment 1 exists)
INSERT INTO receipts (
    id,
    number,
    payment_id,
    date,
    received_from,
    amount,
    spelled_out,
    description,
    payment_method,
    notes,
    status,
    created_by
)
SELECT 
    1,
    'REC-AND/2026/09/0001',
    p.id,
    p.date,
    c.name,
    p.amount,
    'Dua Puluh Juta Rupiah',
    'Pembayaran Termin I Renovasi Kantor Lt. 12 (Invoice INV-AND/2026/09/0001)',
    p.payment_method,
    'Kwitansi resmi pembayaran termin 1',
    'VALID',
    'operator'
FROM payments p
JOIN customers c ON c.id = p.customer_id
WHERE p.id = 1
ON CONFLICT (payment_id) DO NOTHING;

-- Update sequence counter
SELECT setval('receipts_id_seq', (SELECT COALESCE(MAX(id), 1) FROM receipts));

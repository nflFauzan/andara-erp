-- ==============================================================================
-- V16: Support Split Funding (Cash/Bank + Customer Deposit Deduction) for Payments
-- Proyek: Sistem Manajemen Operasional & Transaksi CV. ANDARA
-- ==============================================================================

-- 1. Tambah kolom pencatatan porsi kas dan porsi deposit pada tabel payments
ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS cash_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00;

-- 2. Backfill data pembayaran yang sudah ada:
-- Jika metode pembayaran adalah DEPOSIT murni, isi deposit_amount dari amount
UPDATE payments
SET deposit_amount = amount,
    cash_amount = 0.00
WHERE payment_method = 'DEPOSIT' AND deposit_amount = 0.00;

-- Jika metode pembayaran bukan DEPOSIT, isi cash_amount dari amount
UPDATE payments
SET cash_amount = amount,
    deposit_amount = 0.00
WHERE payment_method != 'DEPOSIT' AND cash_amount = 0.00;

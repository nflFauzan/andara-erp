-- ==============================================================================
-- V7: Payments, Payment Allocations & Customer Deposits Migration
-- Proyek: Sistem Manajemen Operasional & Transaksi CV. ANDARA
-- ==============================================================================

-- 1. Create Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    number VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50) NOT NULL DEFAULT 'BANK_TRANSFER',
    destination_account VARCHAR(100),
    reference VARCHAR(100),
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_number ON payments(number);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- 2. Create Payment Allocations Table
CREATE TABLE IF NOT EXISTS payment_allocations (
    id BIGSERIAL PRIMARY KEY,
    payment_id BIGINT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_allocations_payment_id ON payment_allocations(payment_id);
CREATE INDEX IF NOT EXISTS idx_allocations_invoice_id ON payment_allocations(invoice_id);

-- 3. Create Deposit Transactions Table (Ledger-based Customer Deposit)
CREATE TABLE IF NOT EXISTS deposit_transactions (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('DEPOSIT_IN', 'DEPOSIT_USED', 'DEPOSIT_REFUND', 'DEPOSIT_ADJUSTMENT')),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    balance_after NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (balance_after >= 0),
    reference_type VARCHAR(50),
    reference_id BIGINT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_deposit_tx_customer_id ON deposit_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_deposit_tx_type ON deposit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_deposit_tx_created_at ON deposit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_deposit_tx_reference ON deposit_transactions(reference_type, reference_id);

-- 4. Seed Realistic Demo Payment Data
-- Payment 1: Pembayaran Termin I untuk Invoice 1 (PT. Mahakarya Citra Sejahtera)
INSERT INTO payments (id, number, customer_id, date, amount, payment_method, destination_account, reference, notes, status, created_by)
VALUES (
    1,
    'PAY-AND/2026/09/0001',
    1,
    '2026-09-22',
    20000000.00,
    'BANK_TRANSFER',
    'Bank Mandiri 142-00-1234567-8 a.n. CV. ANDARA',
    'TRF-MDR-992819',
    'Pembayaran Termin I Renovasi Kantor Lt. 12 (Invoice INV-AND/2026/09/0001)',
    'CONFIRMED',
    'operator'
) ON CONFLICT (number) DO NOTHING;

-- Allocation 1: Alokasi Rp20.000.000 ke Invoice 1
INSERT INTO payment_allocations (payment_id, invoice_id, amount, notes, created_by)
VALUES (
    1,
    1,
    20000000.00,
    'Alokasi Termin I untuk pekerjaan partisi dan pengecatan',
    'operator'
) ON CONFLICT DO NOTHING;

-- Update Invoice 1 state to reflect allocated payment
UPDATE invoices 
SET paid_amount = 20000000.00, 
    payment_status = 'PARTIAL',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 1 AND paid_amount = 0.00;

-- Update sequence counters
SELECT setval('payments_id_seq', (SELECT COALESCE(MAX(id), 1) FROM payments));
SELECT setval('payment_allocations_id_seq', (SELECT COALESCE(MAX(id), 1) FROM payment_allocations));
SELECT setval('deposit_transactions_id_seq', (SELECT COALESCE(MAX(id), 1) FROM deposit_transactions));

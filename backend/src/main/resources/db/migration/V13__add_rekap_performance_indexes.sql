-- ==============================================================================
-- V13: Rekap Module Performance & Composite Indexes
-- Proyek: Sistem Manajemen Operasional & Transaksi CV. ANDARA
-- ==============================================================================

-- 1. Invoices composite indexes for universal filter & aging schedule
CREATE INDEX IF NOT EXISTS idx_invoices_rekap_composite 
    ON invoices(customer_id, date, status, payment_status);

CREATE INDEX IF NOT EXISTS idx_invoices_aging_composite 
    ON invoices(status, payment_status, due_date);

CREATE INDEX IF NOT EXISTS idx_invoices_date_status
    ON invoices(date, status);

-- 2. Penawaran composite indexes for unbilled tracking & date ranges
CREATE INDEX IF NOT EXISTS idx_penawaran_rekap_composite 
    ON penawaran(customer_id, date, status);

CREATE INDEX IF NOT EXISTS idx_penawaran_date_status
    ON penawaran(date, status);

-- 3. Payments composite indexes for kas masuk & method filters
CREATE INDEX IF NOT EXISTS idx_payments_rekap_composite 
    ON payments(customer_id, date, status);

CREATE INDEX IF NOT EXISTS idx_payments_date_status_method
    ON payments(date, status, payment_method);

-- 4. Kegiatan composite indexes for project summaries
CREATE INDEX IF NOT EXISTS idx_kegiatan_rekap_composite 
    ON kegiatan(customer_id, created_at, status);

-- 5. Payment allocations composite index for settlement lookups
CREATE INDEX IF NOT EXISTS idx_allocations_inv_pay_composite 
    ON payment_allocations(invoice_id, payment_id);

-- ==============================================================================
-- V6: Invoices & Invoice Details Migration
-- Proyek: Sistem Manajemen Operasional & Transaksi CV. ANDARA
-- ==============================================================================

-- 1. Create Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id BIGSERIAL PRIMARY KEY,
    number VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    source_penawaran_id BIGINT REFERENCES penawaran(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    due_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ISSUED', 'CANCELLED')),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'PARTIAL', 'PAID')),
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    paid_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (paid_amount >= 0),
    notes TEXT,
    terms TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(number);
CREATE INDEX IF NOT EXISTS idx_invoices_source_penawaran_id ON invoices(source_penawaran_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status ON invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);

-- 2. Create Invoice Details Table
CREATE TABLE IF NOT EXISTS invoice_details (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    source_penawaran_detail_id BIGINT REFERENCES penawaran_details(id) ON DELETE SET NULL,
    source_kegiatan_id BIGINT REFERENCES kegiatan(id) ON DELETE SET NULL,
    source_kegiatan_item_id BIGINT REFERENCES kegiatan_items(id) ON DELETE SET NULL,
    description VARCHAR(500) NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(50) NOT NULL,
    unit_price NUMERIC(15, 2) NOT NULL CHECK (unit_price >= 0),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    sort_order INT NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invoice_details_invoice_id ON invoice_details(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_details_source_penawaran_detail_id ON invoice_details(source_penawaran_detail_id);
CREATE INDEX IF NOT EXISTS idx_invoice_details_source_kegiatan_id ON invoice_details(source_kegiatan_id);
CREATE INDEX IF NOT EXISTS idx_invoice_details_sort_order ON invoice_details(invoice_id, sort_order);

-- 3. Seed Realistic Demo Invoices
-- Invoice 1: Parsial dari Penawaran 1 (PT. Mahakarya Citra Sejahtera)
INSERT INTO invoices (id, number, customer_id, source_penawaran_id, date, due_date, status, payment_status, total_amount, paid_amount, notes, terms, created_by)
VALUES (
    1,
    'INV-AND/2026/09/0001',
    1,
    1,
    '2026-09-18',
    '2026-10-02',
    'ISSUED',
    'UNPAID',
    26000000.00,
    0.00,
    'Tagihan Termin I - Pekerjaan Partisi Gypsum dan Pengecatan Lantai 12',
    'Pembayaran ditransfer ke rekening resmi CV. ANDARA. Jatuh tempo 14 hari kalender.',
    'operator'
) ON CONFLICT (number) DO NOTHING;

INSERT INTO invoice_details (invoice_id, source_penawaran_detail_id, source_kegiatan_id, source_kegiatan_item_id, description, quantity, unit, unit_price, amount, sort_order)
VALUES 
    (1, 1, 1, 1, 'Pemasangan Partisi Gypsum 2 Muka Rangka Baja Ringan', 80.00, 'm2', 250000.00, 20000000.00, 1),
    (1, 2, 1, 2, 'Pengecatan Tembok Interior Cat Dulux Weathershield / Setara', 120.00, 'm2', 50000.00, 6000000.00, 2)
ON CONFLICT DO NOTHING;

-- Invoice 2: Manual Invoice (Dinas Kebudayaan & Pariwisata)
INSERT INTO invoices (id, number, customer_id, source_penawaran_id, date, due_date, status, payment_status, total_amount, paid_amount, notes, terms, created_by)
VALUES (
    2,
    'INV-AND/2026/09/0002',
    2,
    NULL,
    '2026-09-20',
    '2026-10-04',
    'DRAFT',
    'UNPAID',
    15000000.00,
    0.00,
    'Uang Muka Penyelenggaraan Pameran Seni Nusantara',
    'Transfer Bank Mandiri CV. ANDARA',
    'operator'
) ON CONFLICT (number) DO NOTHING;

INSERT INTO invoice_details (invoice_id, source_penawaran_detail_id, source_kegiatan_id, source_kegiatan_item_id, description, quantity, unit, unit_price, amount, sort_order)
VALUES 
    (2, NULL, 2, 5, 'Uang Muka Sewa & Instalasi Panggung Rigging Ukuran 10 x 8 Meter', 1.00, 'paket', 15000000.00, 15000000.00, 1)
ON CONFLICT DO NOTHING;

-- Update sequence counters
SELECT setval('invoices_id_seq', (SELECT COALESCE(MAX(id), 1) FROM invoices));
SELECT setval('invoice_details_id_seq', (SELECT COALESCE(MAX(id), 1) FROM invoice_details));

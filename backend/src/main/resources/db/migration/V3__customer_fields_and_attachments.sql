-- ==========================================================
-- Sistem Manajemen Operasional & Transaksi CV. ANDARA
-- Flyway Migration V3: Customer Fields & Attachment Subsystem
-- ==========================================================

-- 1. Add pic_name and notes columns to customers table if not exists
ALTER TABLE customers ADD COLUMN IF NOT EXISTS pic_name VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Create Attachments Table
CREATE TABLE IF NOT EXISTS attachments (
    id BIGSERIAL PRIMARY KEY,
    reference_type VARCHAR(50) NOT NULL, -- 'CUSTOMER', 'PAYMENT', 'FAKTUR', etc.
    reference_id BIGINT NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    object_key VARCHAR(500) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    checksum VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_attachments_reference ON attachments(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_attachments_created_at ON attachments(created_at);

-- 3. Seed Initial Realistic Customers
INSERT INTO customers (code, name, company_name, address, phone, email, pic_name, notes, deposit_balance, is_active, created_at, updated_at, created_by)
VALUES 
    (
        'CUST-001',
        'PT. Mahakarya Citra Sejahtera',
        'Mahakarya Group',
        'Jl. Sudirman Kav. 25, Lantai 12, Jakarta Selatan',
        '021-5551234',
        'procurement@mahakarya.co.id',
        'Bambang Wijaya',
        'Klien korporat sektor properti & arsitektur',
        0.00,
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        'operator'
    ),
    (
        'CUST-002',
        'Dinas Kebudayaan & Pariwisata',
        'Pemerintah Kota Bandung',
        'Jl. Wastukencana No. 2, Bandung, Jawa Barat',
        '022-4235555',
        'kontrak@disbudpar.bandung.go.id',
        'Siti Rahmawati',
        'Instansi pemerintah, pembayaran berbasis SP2D / termin faktur',
        0.00,
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        'operator'
    ),
    (
        'CUST-003',
        'CV. Nusa Pratama Mandiri',
        'Nusa Pratama Logistics',
        'Kawasan Industri MM2100 Blok C-3, Cikarang Barat, Bekasi',
        '021-8988776',
        'finance@nusapratama.com',
        'Hendra Kusuma',
        'Mitra logistik dan pengadaan berkala',
        0.00,
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        'operator'
    )
ON CONFLICT (code) DO NOTHING;

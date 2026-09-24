-- ==============================================================================
-- V4: Kegiatan & Kegiatan Items Migration
-- Proyek: Sistem Manajemen Operasional & Transaksi CV. ANDARA
-- ==============================================================================

-- 1. Create Kegiatan Table
CREATE TABLE IF NOT EXISTS kegiatan (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_kegiatan_customer_id ON kegiatan(customer_id);
CREATE INDEX IF NOT EXISTS idx_kegiatan_code ON kegiatan(code);
CREATE INDEX IF NOT EXISTS idx_kegiatan_status ON kegiatan(status);
CREATE INDEX IF NOT EXISTS idx_kegiatan_created_at ON kegiatan(created_at);

-- 2. Create Kegiatan Items Table
CREATE TABLE IF NOT EXISTS kegiatan_items (
    id BIGSERIAL PRIMARY KEY,
    kegiatan_id BIGINT NOT NULL REFERENCES kegiatan(id) ON DELETE CASCADE,
    description VARCHAR(500) NOT NULL,
    volume NUMERIC(12, 2) NOT NULL CHECK (volume > 0),
    unit VARCHAR(50) NOT NULL,
    unit_price NUMERIC(15, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(15, 2) NOT NULL CHECK (subtotal >= 0),
    sort_order INT NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_kegiatan_items_kegiatan_id ON kegiatan_items(kegiatan_id);
CREATE INDEX IF NOT EXISTS idx_kegiatan_items_sort_order ON kegiatan_items(kegiatan_id, sort_order);

-- 3. Seed Realistic Demo Data for Kegiatan & Items
-- Link to Customer 1 (PT. Mahakarya Citra Sejahtera)
INSERT INTO kegiatan (id, customer_id, code, name, location, description, status, total_amount, created_by)
VALUES (
    1,
    1,
    'ACT-2026-001',
    'Renovasi & Pemasangan Partisi Kantor Lantai 12',
    'Gedung Mahakarya Tower, Jakarta Selatan',
    'Pekerjaan sipil interior, partisi gypsum peredam, dan instalasi kelistrikan ruang meeting',
    'ACTIVE',
    35000000.00,
    'operator'
) ON CONFLICT (code) DO NOTHING;

INSERT INTO kegiatan_items (kegiatan_id, description, volume, unit, unit_price, subtotal, sort_order, created_by)
VALUES 
    (1, 'Pemasangan Partisi Gypsum 2 Muka Rangka Baja Ringan', 80.00, 'm2', 250000.00, 20000000.00, 1, 'operator'),
    (1, 'Pengecatan Tembok Interior Cat Dulux Weathershield / Setara', 120.00, 'm2', 50000.00, 6000000.00, 2, 'operator'),
    (1, 'Instalasi Titik Lampu Downlight LED & Saklar Panasonic', 15.00, 'titik', 300000.00, 4500000.00, 3, 'operator'),
    (1, 'Pintu Kaca Tempered 12mm Frameless & Aksesoris Fitting', 1.00, 'unit', 4500000.00, 4500000.00, 4, 'operator')
ON CONFLICT DO NOTHING;

-- Link to Customer 2 (Dinas Kebudayaan & Pariwisata)
INSERT INTO kegiatan (id, customer_id, code, name, location, description, status, total_amount, created_by)
VALUES (
    2,
    2,
    'ACT-2026-002',
    'Penyelenggaraan Pameran Seni & Budaya Nusantara 2026',
    'Gedung Sasana Budaya Ganesha (Sabuga), Bandung',
    'Penyediaan panggung pertunjukan, booth pameran UKM, sistem tata suara dan tata cahaya',
    'ACTIVE',
    42500000.00,
    'operator'
) ON CONFLICT (code) DO NOTHING;

INSERT INTO kegiatan_items (kegiatan_id, description, volume, unit, unit_price, subtotal, sort_order, created_by)
VALUES 
    (2, 'Sewa & Instalasi Panggung Rigging Ukuran 10 x 8 Meter', 1.00, 'paket', 15000000.00, 15000000.00, 1, 'operator'),
    (2, 'Booth Stand Pameran Partisi R8 Ukuran 3 x 3 Meter', 10.00, 'unit', 1500000.00, 15000000.00, 2, 'operator'),
    (2, 'Sistem Tata Suara (Sound System) 10.000 Watt 3 Hari', 3.00, 'hari', 2500000.00, 7500000.00, 3, 'operator'),
    (2, 'Pencahayaan Stage Lighting Moving Beam & Par LED', 1.00, 'paket', 5000000.00, 5000000.00, 4, 'operator')
ON CONFLICT DO NOTHING;

-- Update sequence counters to prevent collision with future inserts
SELECT setval('kegiatan_id_seq', (SELECT COALESCE(MAX(id), 1) FROM kegiatan));
SELECT setval('kegiatan_items_id_seq', (SELECT COALESCE(MAX(id), 1) FROM kegiatan_items));

-- ==============================================================================
-- V5: Penawaran & Penawaran Details Migration
-- Proyek: Sistem Manajemen Operasional & Transaksi CV. ANDARA
-- ==============================================================================

-- 1. Create Penawaran Table
CREATE TABLE IF NOT EXISTS penawaran (
    id BIGSERIAL PRIMARY KEY,
    number VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'CANCELLED')),
    notes TEXT,
    terms TEXT,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_penawaran_customer_id ON penawaran(customer_id);
CREATE INDEX IF NOT EXISTS idx_penawaran_number ON penawaran(number);
CREATE INDEX IF NOT EXISTS idx_penawaran_status ON penawaran(status);
CREATE INDEX IF NOT EXISTS idx_penawaran_date ON penawaran(date);
CREATE INDEX IF NOT EXISTS idx_penawaran_created_at ON penawaran(created_at);

-- 2. Create Penawaran Details Table
CREATE TABLE IF NOT EXISTS penawaran_details (
    id BIGSERIAL PRIMARY KEY,
    penawaran_id BIGINT NOT NULL REFERENCES penawaran(id) ON DELETE CASCADE,
    kegiatan_id BIGINT REFERENCES kegiatan(id) ON DELETE SET NULL,
    kegiatan_item_id BIGINT REFERENCES kegiatan_items(id) ON DELETE SET NULL,
    description VARCHAR(500) NOT NULL,
    volume NUMERIC(12, 2) NOT NULL CHECK (volume > 0),
    unit VARCHAR(50) NOT NULL,
    unit_price NUMERIC(15, 2) NOT NULL CHECK (unit_price >= 0),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    sort_order INT NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_penawaran_details_penawaran_id ON penawaran_details(penawaran_id);
CREATE INDEX IF NOT EXISTS idx_penawaran_details_kegiatan_id ON penawaran_details(kegiatan_id);
CREATE INDEX IF NOT EXISTS idx_penawaran_details_kegiatan_item_id ON penawaran_details(kegiatan_item_id);
CREATE INDEX IF NOT EXISTS idx_penawaran_details_sort_order ON penawaran_details(penawaran_id, sort_order);

-- 3. Seed Realistic Demo Data for Penawaran
-- Penawaran 1: Untuk PT. Mahakarya Citra Sejahtera (customer_id = 1)
INSERT INTO penawaran (id, number, customer_id, date, status, notes, terms, total_amount, created_by)
VALUES (
    1,
    'Q-AND/2026/09/0001',
    1,
    '2026-09-10',
    'APPROVED',
    'Penawaran pekerjaan renovasi dan partisi ruang kantor lt. 12',
    '1. Pembayaran DP 30% saat SPK disetujui\n2. Termin 2 50% setelah pekerjaan 70%\n3. Pelunasan 20% serah terima pekerjaan\n4. Masa garansi pemeliharaan 30 hari',
    35000000.00,
    'operator'
) ON CONFLICT (number) DO NOTHING;

INSERT INTO penawaran_details (penawaran_id, kegiatan_id, kegiatan_item_id, description, volume, unit, unit_price, amount, sort_order)
VALUES 
    (1, 1, 1, 'Pemasangan Partisi Gypsum 2 Muka Rangka Baja Ringan', 80.00, 'm2', 250000.00, 20000000.00, 1),
    (1, 1, 2, 'Pengecatan Tembok Interior Cat Dulux Weathershield / Setara', 120.00, 'm2', 50000.00, 6000000.00, 2),
    (1, 1, 3, 'Instalasi Titik Lampu Downlight LED & Saklar Panasonic', 15.00, 'titik', 300000.00, 4500000.00, 3),
    (1, 1, 4, 'Pintu Kaca Tempered 12mm Frameless & Aksesoris Fitting', 1.00, 'unit', 4500000.00, 4500000.00, 4)
ON CONFLICT DO NOTHING;

-- Penawaran 2: Untuk Dinas Kebudayaan & Pariwisata (customer_id = 2)
INSERT INTO penawaran (id, number, customer_id, date, status, notes, terms, total_amount, created_by)
VALUES (
    2,
    'Q-AND/2026/09/0002',
    2,
    '2026-09-15',
    'SENT',
    'Proposal pengadaan panggung dan tata suara pameran seni budaya',
    '1. Harga sudah termasuk sewa, instalasi, dan operator standby selama acara\n2. Pembayaran melalui transfer bank resmi CV. ANDARA\n3. Pajak PPN/PPh dipotong sesuai ketentuan dinas',
    42500000.00,
    'operator'
) ON CONFLICT (number) DO NOTHING;

INSERT INTO penawaran_details (penawaran_id, kegiatan_id, kegiatan_item_id, description, volume, unit, unit_price, amount, sort_order)
VALUES 
    (2, 2, 5, 'Sewa & Instalasi Panggung Rigging Ukuran 10 x 8 Meter', 1.00, 'paket', 15000000.00, 15000000.00, 1),
    (2, 2, 6, 'Booth Stand Pameran Partisi R8 Ukuran 3 x 3 Meter', 10.00, 'unit', 1500000.00, 15000000.00, 2),
    (2, 2, 7, 'Sistem Tata Suara (Sound System) 10.000 Watt 3 Hari', 3.00, 'hari', 2500000.00, 7500000.00, 3),
    (2, 2, 8, 'Pencahayaan Stage Lighting Moving Beam & Par LED', 1.00, 'paket', 5000000.00, 5000000.00, 4)
ON CONFLICT DO NOTHING;

-- Update sequence counters to prevent collision with future inserts
SELECT setval('penawaran_id_seq', (SELECT COALESCE(MAX(id), 1) FROM penawaran));
SELECT setval('penawaran_details_id_seq', (SELECT COALESCE(MAX(id), 1) FROM penawaran_details));

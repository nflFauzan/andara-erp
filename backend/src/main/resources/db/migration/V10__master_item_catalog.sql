-- ==============================================================================
-- V10: Master Data Item Catalog Migration
-- Proyek: Sistem Manajemen Operasional & Transaksi CV. ANDARA
-- ==============================================================================

-- 1. Create item_catalog Table
CREATE TABLE IF NOT EXISTS item_catalog (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(500) NOT NULL,
    default_unit VARCHAR(50) NOT NULL,
    default_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (default_price >= 0),
    category VARCHAR(100),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_item_catalog_name ON item_catalog(name);
CREATE INDEX IF NOT EXISTS idx_item_catalog_code ON item_catalog(code);
CREATE INDEX IF NOT EXISTS idx_item_catalog_category ON item_catalog(category);
CREATE INDEX IF NOT EXISTS idx_item_catalog_is_active ON item_catalog(is_active);

-- 2. Link kegiatan_items to item_catalog (optional foreign key)
ALTER TABLE kegiatan_items 
    ADD COLUMN IF NOT EXISTS item_catalog_id BIGINT REFERENCES item_catalog(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_kegiatan_items_catalog_id ON kegiatan_items(item_catalog_id);

-- 3. Seed Realistic Master Items (Berdasarkan dokumen operasional CV. ANDARA)
INSERT INTO item_catalog (id, code, name, default_unit, default_price, category, description, created_by)
VALUES 
    (1, 'ITM-001', 'Pek. Rangka Atap Baja Ringan (type Pelana) C.75x35 BMT tb. 0,70mm AZ100', 'm2', 180000.00, 'Baja Ringan', 'Pengadaan dan perakitan rangka atap baja ringan tipe pelana spesifikasi SNI AZ100', 'system'),
    (2, 'ITM-002', 'Penutup Atap Bitumen Onduvilla', 'm2', 295000.00, 'Genteng & Atap', 'Pemasangan genteng bitumen Onduvilla lengkap paku dan aksesoris penutup', 'system'),
    (3, 'ITM-003', 'Nok Bubungan Bitumen / Ridge', 'm1', 200000.00, 'Genteng & Atap', 'Nok bubungan bitumen untuk penutup sudut bubungan genteng Onduvilla', 'system'),
    (4, 'ITM-004', 'Nok Tepi Bitumen / Verge', 'm1', 190000.00, 'Genteng & Atap', 'Nok tepi bitumen samping untuk kerapian dan pelindung angin genteng Onduvilla', 'system'),
    (5, 'ITM-005', 'Pek. List Plank 3/25 GRC', 'm1', 55000.00, 'Plafon & Listplang', 'Listplang papan GRC tebal 8mm lebar 25cm motif urat kayu/polos terpasang', 'system'),
    (6, 'ITM-006', 'Listplang Tumpangsari', 'm2', 50000.00, 'Plafon & Listplang', 'Pekerjaan listplang tumpangsari tepi atap rangka baja ringan', 'system'),
    (7, 'ITM-007', 'Rangka & Plafon Gypsum Board 9mm Rangka Hollow Galvanis 4x4 & 2x4', 'm2', 125000.00, 'Plafon & Listplang', 'Plafon gypsum board Jayaboard/Elephant tebal 9mm rangka hollow galvanis', 'system'),
    (8, 'ITM-008', 'Partisi Gypsum 2 Muka Rangka Baja Ringan', 'm2', 250000.00, 'Sipil & Partisi', 'Pemasangan partisi gypsum 2 muka peredam rangka baja ringan', 'system'),
    (9, 'ITM-009', 'Pengecatan Tembok Interior Cat Dulux Weathershield / Setara', 'm2', 50000.00, 'Pengecatan', 'Cat tembok interior kualitas premium 2 lapis dan plamir dasar', 'system'),
    (10, 'ITM-010', 'Instalasi Titik Lampu Downlight LED & Saklar', 'titik', 300000.00, 'Kelistrikan', 'Pemasangan titik instalasi pipa kabel NYM, saklar Panasonic, dan lampu downlight LED 12W', 'system')
ON CONFLICT (id) DO NOTHING;

-- Update sequence counter
SELECT setval('item_catalog_id_seq', (SELECT COALESCE(MAX(id), 1) FROM item_catalog));

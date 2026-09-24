-- ==========================================================
-- Sistem Manajemen Operasional & Transaksi CV. ANDARA
-- Flyway Migration V2: Seed Initial Users (Operator & Admin)
-- ==========================================================

-- Default credentials:
-- 1. Username: operator | Password: operator123
-- 2. Username: admin    | Password: admin123

INSERT INTO users (username, password_hash, full_name, role, is_active, created_at, updated_at)
VALUES 
    (
        'operator',
        '$2a$10$XkPzecG3ayEwPC2CRgKFeu6jlB6aZPDiv/X.//DjjAM88Q9TonCJO',
        'Staff Operator Keuangan',
        'OPERATOR',
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'admin',
        '$2a$10$CCRBhUndvRcUXWyTmY64qexB3MG/XlRqSmF1Ikuv5oIbPjJUvGJ86',
        'Administrator Operasional',
        'ADMIN',
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
ON CONFLICT (username) DO NOTHING;

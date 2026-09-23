-- ==========================================================
-- Sistem Manajemen Operasional & Transaksi CV. ANDARA
-- Flyway Migration V1: Core Baseline Schema
-- ==========================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('OPERATOR', 'ADMIN')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 2. Numbering Configuration Table (Document Auto-numbering)
CREATE TABLE IF NOT EXISTS numbering_configurations (
    id BIGSERIAL PRIMARY KEY,
    document_type VARCHAR(50) NOT NULL UNIQUE, -- 'PENAWARAN', 'FAKTUR', 'PEMBAYARAN', 'KWITANSI'
    prefix VARCHAR(20) NOT NULL,
    suffix VARCHAR(20) DEFAULT '',
    counter_digits INT NOT NULL DEFAULT 4,
    reset_period VARCHAR(20) NOT NULL DEFAULT 'MONTHLY' CHECK (reset_period IN ('NEVER', 'YEARLY', 'MONTHLY')),
    current_counter INT NOT NULL DEFAULT 0,
    current_period VARCHAR(20) NOT NULL DEFAULT '',
    format_pattern VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Numbering Configurations
INSERT INTO numbering_configurations (document_type, prefix, suffix, counter_digits, reset_period, current_counter, current_period, format_pattern)
VALUES 
    ('PENAWARAN', 'Q-AND', '', 4, 'MONTHLY', 0, TO_CHAR(CURRENT_DATE, 'YYYY-MM'), '{PREFIX}/{YEAR}/{MONTH}/{COUNTER}'),
    ('FAKTUR', 'INV-AND', '', 4, 'MONTHLY', 0, TO_CHAR(CURRENT_DATE, 'YYYY-MM'), '{PREFIX}/{YEAR}/{MONTH}/{COUNTER}'),
    ('PEMBAYARAN', 'PAY-AND', '', 4, 'MONTHLY', 0, TO_CHAR(CURRENT_DATE, 'YYYY-MM'), '{PREFIX}/{YEAR}/{MONTH}/{COUNTER}'),
    ('KWITANSI', 'REC-AND', '', 4, 'MONTHLY', 0, TO_CHAR(CURRENT_DATE, 'YYYY-MM'), '{PREFIX}/{YEAR}/{MONTH}/{COUNTER}')
ON CONFLICT (document_type) DO NOTHING;

-- 3. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    company_name VARCHAR(150),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(100),
    deposit_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (deposit_balance >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_customers_code ON customers(code);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

-- 4. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50),
    username VARCHAR(50) NOT NULL,
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

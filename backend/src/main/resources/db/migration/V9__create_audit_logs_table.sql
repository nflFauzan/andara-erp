-- V9__create_audit_logs_table.sql
-- Update audit_logs table schema aligning with Technical Architecture Baseline §15.15

ALTER TABLE audit_logs 
    ADD COLUMN IF NOT EXISTS actor_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS before_data TEXT,
    ADD COLUMN IF NOT EXISTS after_data TEXT,
    ADD COLUMN IF NOT EXISTS request_id VARCHAR(100);

-- Allow username to be nullable if actor is null/system
ALTER TABLE audit_logs ALTER COLUMN username DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

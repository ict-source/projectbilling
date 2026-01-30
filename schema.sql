-- PostgreSQL Schema for Billing Notification Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
('Admin', 'Full system access and management'),
('Billing Officer', 'Manage bills and billing operations'),
('Cashier', 'Handle payments and receipts'),
('Patient', 'Access personal billing information');

-- Users table (extended from patients)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    patient_id VARCHAR(50) UNIQUE, -- Nullable for non-patients
    role_id UUID NOT NULL REFERENCES roles(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bills table
CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    billing_reference_id VARCHAR(100) UNIQUE NOT NULL, -- Avoids sensitive medical data
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notification types
CREATE TABLE notification_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    default_channels TEXT[] DEFAULT ARRAY['in-app'], -- in-app, email, sms
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default notification types
INSERT INTO notification_types (name, description, default_channels) VALUES
('bill_due', 'Notification when bill is due', ARRAY['in-app', 'email']),
('payment_reminder', 'Reminder for pending payments', ARRAY['in-app', 'email', 'sms']),
('payment_overdue', 'Notification for overdue payments', ARRAY['in-app', 'email', 'sms']),
('bill_updated', 'Notification when bill is updated', ARRAY['in-app']),
('payment_received', 'Confirmation of payment received', ARRAY['in-app', 'email']);

-- User notification preferences
CREATE TABLE user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    notification_type_id UUID NOT NULL REFERENCES notification_types(id),
    channels_enabled TEXT[] DEFAULT ARRAY['in-app'],
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, notification_type_id)
);

-- Notifications (sent notifications history)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    notification_type_id UUID NOT NULL REFERENCES notification_types(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    channels TEXT[] NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs for compliance
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id), -- Nullable for system actions
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_patient_id ON users(patient_id);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_bills_user_id ON bills(user_id);
CREATE INDEX idx_bills_billing_reference_id ON bills(billing_reference_id);
CREATE INDEX idx_bills_due_date ON bills(due_date);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_types_updated_at BEFORE UPDATE ON notification_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_notification_preferences_updated_at BEFORE UPDATE ON user_notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create audit log entries
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    old_row JSONB;
    new_row JSONB;
    action_type VARCHAR(10);
BEGIN
    IF TG_OP = 'INSERT' THEN
        action_type := 'INSERT';
        old_row := NULL;
        new_row := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        action_type := 'UPDATE';
        old_row := to_jsonb(OLD);
        new_row := to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        action_type := 'DELETE';
        old_row := to_jsonb(OLD);
        new_row := NULL;
    END IF;

    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (current_setting('app.current_user_id', TRUE)::UUID, action_type, TG_TABLE_NAME, COALESCE(NEW.id, OLD.id), old_row, new_row);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_users_trigger AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_bills_trigger AFTER INSERT OR UPDATE OR DELETE ON bills FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_notifications_trigger AFTER INSERT OR UPDATE OR DELETE ON notifications FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Function to update bill status based on due date
CREATE OR REPLACE FUNCTION update_overdue_bills()
RETURNS VOID AS $$
BEGIN
    UPDATE bills
    SET status = 'overdue', updated_at = CURRENT_TIMESTAMP
    WHERE status = 'pending' AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Create a view for user bills summary
CREATE VIEW user_bills_summary AS
SELECT
    u.id as user_id,
    u.first_name,
    u.last_name,
    u.email,
    COUNT(b.id) as total_bills,
    COALESCE(SUM(CASE WHEN b.status = 'pending' THEN b.amount ELSE 0 END), 0) as pending_amount,
    COALESCE(SUM(CASE WHEN b.status = 'paid' THEN b.amount ELSE 0 END), 0) as paid_amount,
    COALESCE(SUM(CASE WHEN b.status = 'overdue' THEN b.amount ELSE 0 END), 0) as overdue_amount,
    MIN(CASE WHEN b.status = 'pending' THEN b.due_date END) as next_due_date
FROM users u
LEFT JOIN bills b ON u.id = b.user_id
WHERE u.role_id = (SELECT id FROM roles WHERE name = 'Patient')
GROUP BY u.id, u.first_name, u.last_name, u.email;

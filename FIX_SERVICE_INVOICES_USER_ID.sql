-- First, drop all RLS policies
DROP POLICY IF EXISTS "Users can view their own service invoices" ON service_invoices;
DROP POLICY IF EXISTS "Users can insert their own service invoices" ON service_invoices;
DROP POLICY IF EXISTS "Users can update their own service invoices" ON service_invoices;
DROP POLICY IF EXISTS "Users can delete their own service invoices" ON service_invoices;

-- Then disable RLS
ALTER TABLE service_invoices DISABLE ROW LEVEL SECURITY;

-- Drop the old foreign key constraint
ALTER TABLE service_invoices DROP CONSTRAINT IF EXISTS service_invoices_user_id_fkey;

-- Change user_id from UUID to VARCHAR to support both Supabase auth UUIDs and employee session IDs
ALTER TABLE service_invoices ALTER COLUMN user_id TYPE VARCHAR(255);

-- Ensure permissions are set
GRANT SELECT, INSERT, UPDATE, DELETE ON service_invoices TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

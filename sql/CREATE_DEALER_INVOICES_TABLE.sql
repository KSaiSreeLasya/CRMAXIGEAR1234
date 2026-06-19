-- Migration: Create dealer_invoices table with correct schema
-- This table stores dealer product invoices with per-product GST support

CREATE TABLE IF NOT EXISTS dealer_invoices (
  id TEXT PRIMARY KEY,
  
  -- Invoice Details
  invoice_number VARCHAR(50) NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE,
  
  -- Dealer Information
  dealer_id UUID,
  dealer_name VARCHAR(255) NOT NULL,
  contact_no VARCHAR(20),
  location VARCHAR(255),
  
  -- Invoice Details
  purchase_order_no VARCHAR(100),
  sent_to VARCHAR(255),
  ship_to VARCHAR(255),
  
  -- Financial Summary
  labour_charges DECIMAL(12, 2) DEFAULT 0,
  subtotal DECIMAL(12, 2),
  total_gst_amount DECIMAL(12, 2),
  total_amount DECIMAL(12, 2) NOT NULL,
  
  -- Payment Information
  mode_of_payment VARCHAR(100),
  payment_status VARCHAR(50) DEFAULT 'pending',
  gst_enabled BOOLEAN DEFAULT true,
  
  -- Metadata
  lead_source VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT false
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_dealer_invoices_invoice_date ON dealer_invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_dealer_invoices_dealer_name ON dealer_invoices(dealer_name);
CREATE INDEX IF NOT EXISTS idx_dealer_invoices_payment_status ON dealer_invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_dealer_invoices_is_deleted ON dealer_invoices(is_deleted);

-- Create a trigger to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_dealer_invoices_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dealer_invoices_updated_at ON dealer_invoices;
CREATE TRIGGER dealer_invoices_updated_at
BEFORE UPDATE ON dealer_invoices
FOR EACH ROW
EXECUTE FUNCTION update_dealer_invoices_timestamp();

-- Enable Row Level Security (RLS)
ALTER TABLE dealer_invoices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read for authenticated users" ON dealer_invoices;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON dealer_invoices;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON dealer_invoices;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON dealer_invoices;

-- Create RLS policies for authenticated users
CREATE POLICY "Enable read for authenticated users" ON dealer_invoices
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON dealer_invoices
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON dealer_invoices
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON dealer_invoices
  FOR DELETE
  USING (true);

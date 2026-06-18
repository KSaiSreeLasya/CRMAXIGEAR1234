-- Dealers Invoice Schema
-- This table stores all dealer product invoices in proforma format

CREATE TABLE IF NOT EXISTS dealers_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Invoice Details
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  invoice_date DATE NOT NULL,
  
  -- Dealer Information
  dealer_id UUID REFERENCES dealers(id) ON DELETE SET NULL,
  dealer_name VARCHAR(255) NOT NULL,
  dealer_code VARCHAR(100),
  contact_no VARCHAR(20),
  location VARCHAR(255),
  
  -- Product Details
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  model_no VARCHAR(100),
  product_description TEXT,
  hsn_no VARCHAR(50),
  chassis_no VARCHAR(100),
  motor_no VARCHAR(100),
  battery_no VARCHAR(100),
  battery_capacity VARCHAR(100),
  battery_vehicle_specs TEXT,
  battery_warranty VARCHAR(100),
  vehicle_warranty VARCHAR(100),
  
  -- Invoice Line Items
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  
  -- Tax Information
  gst_enabled BOOLEAN DEFAULT true,
  gst_type VARCHAR(20) DEFAULT 'cgst-sgst', -- 'cgst-sgst' or 'igst'
  gst_amount DECIMAL(12, 2),
  total_amount DECIMAL(12, 2) NOT NULL,
  
  -- Payment Information
  mode_of_payment VARCHAR(100),
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, partial
  
  -- Metadata
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT false,
  
  -- Constraints
  CONSTRAINT valid_gst_type CHECK (gst_type IN ('cgst-sgst', 'igst')),
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'partial')),
  CONSTRAINT positive_amount CHECK (amount > 0),
  CONSTRAINT positive_total CHECK (total_amount > 0)
);

-- Create indexes for faster queries
CREATE INDEX idx_dealers_invoices_invoice_date ON dealers_invoices(invoice_date);
CREATE INDEX idx_dealers_invoices_dealer_id ON dealers_invoices(dealer_id);
CREATE INDEX idx_dealers_invoices_product_id ON dealers_invoices(product_id);
CREATE INDEX idx_dealers_invoices_payment_status ON dealers_invoices(payment_status);
CREATE INDEX idx_dealers_invoices_created_at ON dealers_invoices(created_at);
CREATE INDEX idx_dealers_invoices_deleted ON dealers_invoices(is_deleted) WHERE NOT is_deleted;

-- Create a view for active invoices
CREATE OR REPLACE VIEW active_dealers_invoices AS
SELECT * FROM dealers_invoices
WHERE is_deleted = false
ORDER BY invoice_date DESC;

-- Create a trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_dealers_invoices_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dealers_invoices_updated_at
BEFORE UPDATE ON dealers_invoices
FOR EACH ROW
EXECUTE FUNCTION update_dealers_invoices_timestamp();

-- Summary function: Get invoice statistics
CREATE OR REPLACE FUNCTION get_dealers_invoice_stats(p_dealer_id UUID DEFAULT NULL)
RETURNS TABLE (
  total_invoices BIGINT,
  total_amount DECIMAL,
  pending_amount DECIMAL,
  average_invoice_amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_invoices,
    COALESCE(SUM(total_amount), 0) as total_amount,
    COALESCE(SUM(CASE WHEN payment_status = 'pending' THEN total_amount ELSE 0 END), 0) as pending_amount,
    COALESCE(AVG(total_amount), 0) as average_invoice_amount
  FROM dealers_invoices
  WHERE is_deleted = false
    AND (p_dealer_id IS NULL OR dealer_id = p_dealer_id);
END;
$$ LANGUAGE plpgsql;

-- RLS Policies (if using Row Level Security)
-- Enable RLS on the table
ALTER TABLE dealers_invoices ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to view all invoices (adjust based on your auth)
CREATE POLICY "Enable read access for authenticated users" ON dealers_invoices
  FOR SELECT
  USING (true);

-- Policy for authenticated users to insert invoices
CREATE POLICY "Enable insert for authenticated users" ON dealers_invoices
  FOR INSERT
  WITH CHECK (true);

-- Policy for authenticated users to update invoices
CREATE POLICY "Enable update for authenticated users" ON dealers_invoices
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy for authenticated users to delete invoices (soft delete)
CREATE POLICY "Enable delete for authenticated users" ON dealers_invoices
  FOR DELETE
  USING (true);

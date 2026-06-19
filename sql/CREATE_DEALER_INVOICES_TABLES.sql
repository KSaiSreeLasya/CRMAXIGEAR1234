-- Create dealer_invoices table
CREATE TABLE IF NOT EXISTS dealer_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_invoice_no VARCHAR(50) UNIQUE NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE,
  dealer_id UUID,
  dealer_name VARCHAR(255) NOT NULL,
  contact_no VARCHAR(20),
  location VARCHAR(255),
  purchase_order_no VARCHAR(100),
  sent_to VARCHAR(255),
  ship_to VARCHAR(255),
  mode_of_payment VARCHAR(100),
  lead_source VARCHAR(255),
  labour_charges DECIMAL(12, 2) DEFAULT 0,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  gst_enabled BOOLEAN DEFAULT true,
  total_gst_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  payment_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT false
);

-- Create dealers_invoice_items table
CREATE TABLE IF NOT EXISTS dealers_invoice_items (
  id VARCHAR(255) PRIMARY KEY,
  invoice_id UUID NOT NULL,
  product_name VARCHAR(255),
  product_description TEXT,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(12, 2),
  line_total DECIMAL(12, 2),
  gst_rate DECIMAL(5, 2) DEFAULT 18,
  gst_amount DECIMAL(12, 2),
  line_amount_with_gst DECIMAL(12, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoice FOREIGN KEY (invoice_id) REFERENCES dealer_invoices(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_dealer_invoices_invoice_date ON dealer_invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_dealer_invoices_dealer_id ON dealer_invoices(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_invoices_payment_status ON dealer_invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_dealer_invoices_created_at ON dealer_invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_dealers_invoice_items_invoice_id ON dealers_invoice_items(invoice_id);

-- Create trigger to update updated_at
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

-- Enable RLS and create policies
ALTER TABLE dealer_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealers_invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for dealer_invoices
DROP POLICY IF EXISTS "Enable read for all" ON dealer_invoices;
CREATE POLICY "Enable read for all" ON dealer_invoices FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all" ON dealer_invoices;
CREATE POLICY "Enable insert for all" ON dealer_invoices FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all" ON dealer_invoices;
CREATE POLICY "Enable update for all" ON dealer_invoices FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable delete for all" ON dealer_invoices;
CREATE POLICY "Enable delete for all" ON dealer_invoices FOR DELETE USING (true);

-- RLS policies for dealers_invoice_items
DROP POLICY IF EXISTS "Enable read for all" ON dealers_invoice_items;
CREATE POLICY "Enable read for all" ON dealers_invoice_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all" ON dealers_invoice_items;
CREATE POLICY "Enable insert for all" ON dealers_invoice_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all" ON dealers_invoice_items;
CREATE POLICY "Enable update for all" ON dealers_invoice_items FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable delete for all" ON dealers_invoice_items;
CREATE POLICY "Enable delete for all" ON dealers_invoice_items FOR DELETE USING (true);

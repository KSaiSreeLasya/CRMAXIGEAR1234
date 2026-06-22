-- Spares Invoices Table
CREATE TABLE IF NOT EXISTS spares_invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  spares_invoice_no VARCHAR(50) UNIQUE NOT NULL,
  dealer_name VARCHAR(255) NOT NULL,
  dealer_id UUID REFERENCES dealers(id) ON DELETE SET NULL,
  contact_no VARCHAR(20),
  location VARCHAR(255),
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  po_number VARCHAR(50),
  sent_to VARCHAR(255),
  ship_to TEXT,
  mode_of_payment VARCHAR(50),
  lead_source VARCHAR(100),
  labour_charges DECIMAL(10, 2) DEFAULT 0,
  gst_enabled BOOLEAN DEFAULT TRUE,
  subtotal DECIMAL(12, 2) DEFAULT 0,
  gst_amount DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Spares Invoice Products Table
CREATE TABLE IF NOT EXISTS spares_invoice_products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  spares_invoice_id UUID NOT NULL REFERENCES spares_invoices(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  description TEXT,
  unit_quantity DECIMAL(10, 2) DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  gst_rate DECIMAL(5, 2) DEFAULT 18,
  line_total DECIMAL(12, 2),
  gst_amount DECIMAL(12, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_spares_invoices_dealer_name ON spares_invoices(dealer_name);
CREATE INDEX IF NOT EXISTS idx_spares_invoices_invoice_date ON spares_invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_spares_invoices_created_at ON spares_invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_spares_invoice_products_invoice_id ON spares_invoice_products(spares_invoice_id);

-- Enable Row Level Security
ALTER TABLE spares_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE spares_invoice_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for spares_invoices
CREATE POLICY "Enable read access for authenticated users" ON spares_invoices
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON spares_invoices
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON spares_invoices
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON spares_invoices
  FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for spares_invoice_products
CREATE POLICY "Enable read access for authenticated users" ON spares_invoice_products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON spares_invoice_products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON spares_invoice_products
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON spares_invoice_products
  FOR DELETE USING (auth.role() = 'authenticated');

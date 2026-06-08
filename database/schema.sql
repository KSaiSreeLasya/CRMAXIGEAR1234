-- Create Dealers Table
CREATE TABLE dealers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  contact_no VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_no VARCHAR(100) NOT NULL,
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  dealer_name VARCHAR(255) NOT NULL,
  dealer_code VARCHAR(100),
  contact_no VARCHAR(20),
  location VARCHAR(255),
  product_description TEXT,
  hsn_no VARCHAR(50),
  no_of_vehicles INTEGER,
  chassis_no VARCHAR(100),
  motor_no VARCHAR(100),
  battery_no VARCHAR(100),
  battery_vehicle_specs TEXT,
  battery_warranty VARCHAR(100),
  battery_capacity VARCHAR(50),
  vehicle_warranty VARCHAR(100),
  invoice_date DATE,
  amount DECIMAL(12, 2),
  mode_of_payment VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_products_dealer_id ON products(dealer_id);
CREATE INDEX idx_products_dealer_name ON products(dealer_name);
CREATE INDEX idx_products_invoice_date ON products(invoice_date);
CREATE INDEX idx_dealers_name ON dealers(name);

-- Enable Row Level Security (RLS) for security
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (adjust based on your authentication model)
-- Allow authenticated users to view all dealers
CREATE POLICY "Enable read access for all authenticated users" ON dealers
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert dealers
CREATE POLICY "Enable insert for authenticated users" ON dealers
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to update dealers
CREATE POLICY "Enable update for authenticated users" ON dealers
  FOR UPDATE
  USING (true);

-- Allow authenticated users to delete dealers
CREATE POLICY "Enable delete for authenticated users" ON dealers
  FOR DELETE
  USING (true);

-- Same policies for products
CREATE POLICY "Enable read access for all authenticated users" ON products
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON products
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON products
  FOR UPDATE
  USING (true);

CREATE POLICY "Enable delete for authenticated users" ON products
  FOR DELETE
  USING (true);

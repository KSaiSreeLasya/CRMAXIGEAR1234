-- Create Spares Inventory Table (Complete from scratch)
-- This is the master table for managing spare parts inventory

CREATE TABLE IF NOT EXISTS spares_inventory (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User Association
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Information
  part_name VARCHAR(255) NOT NULL,
  part_code VARCHAR(100),
  part_category VARCHAR(100),
  description TEXT,
  
  -- Pricing & Inventory
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  qty INTEGER NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) GENERATED ALWAYS AS (price * qty) STORED,
  
  -- Reorder Point (optional - for inventory management)
  reorder_level INTEGER DEFAULT 5,
  
  -- Supplier Information (optional)
  supplier_name VARCHAR(255),
  supplier_contact VARCHAR(20),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT price_positive CHECK (price >= 0),
  CONSTRAINT qty_positive CHECK (qty >= 0),
  CONSTRAINT unique_user_part UNIQUE(user_id, part_name)
);

-- Create Indexes for Better Query Performance
CREATE INDEX IF NOT EXISTS idx_spares_user_id ON spares_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_spares_part_name ON spares_inventory(part_name);
CREATE INDEX IF NOT EXISTS idx_spares_qty ON spares_inventory(qty);
CREATE INDEX IF NOT EXISTS idx_spares_category ON spares_inventory(part_category);
CREATE INDEX IF NOT EXISTS idx_spares_qty_filter ON spares_inventory(qty) WHERE qty > 0;

-- Create View for Low Stock Items (optional but useful)
CREATE OR REPLACE VIEW low_stock_spares AS
SELECT 
  id,
  user_id,
  part_name,
  qty,
  reorder_level,
  price,
  (reorder_level - qty) AS quantity_needed
FROM spares_inventory
WHERE qty <= reorder_level
ORDER BY quantity_needed DESC;

-- Create Function to Update updated_at Timestamp (optional)
CREATE OR REPLACE FUNCTION update_spares_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create Trigger for Auto-Update Timestamp
CREATE TRIGGER spares_update_timestamp
BEFORE UPDATE ON spares_inventory
FOR EACH ROW
EXECUTE FUNCTION update_spares_timestamp();

-- Insert Sample Data (Optional - for testing)
/*
INSERT INTO spares_inventory (user_id, part_name, part_code, part_category, description, price, qty, reorder_level, supplier_name)
VALUES
  ('user-uuid-here', 'Motor Brush', 'MB-001', 'Motor', 'Carbon brush for motor', 500.00, 10, 5, 'ABC Suppliers'),
  ('user-uuid-here', 'Battery Terminal', 'BT-001', 'Battery', 'Positive terminal connector', 200.00, 20, 10, 'XYZ Parts'),
  ('user-uuid-here', 'Bearing', 'BR-001', 'Mechanical', 'Front wheel bearing', 350.00, 15, 8, 'ABC Suppliers'),
  ('user-uuid-here', 'Brake Pad', 'BP-001', 'Brake', 'Front brake pad set', 400.00, 12, 6, 'XYZ Parts'),
  ('user-uuid-here', 'Wiring Harness', 'WH-001', 'Electrical', 'Main wiring harness', 1500.00, 5, 3, 'ABC Suppliers');
*/

-- Grant Permissions (if using separate user)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON spares_inventory TO your_app_user;

-- Enable Row Level Security (RLS) for multi-tenant safety
ALTER TABLE spares_inventory ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy - Users can only see their own spares
CREATE POLICY "Users can only view their own spares"
  ON spares_inventory
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create RLS Policy - Users can only insert their own spares
CREATE POLICY "Users can only insert their own spares"
  ON spares_inventory
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create RLS Policy - Users can only update their own spares
CREATE POLICY "Users can only update their own spares"
  ON spares_inventory
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS Policy - Users can only delete their own spares
CREATE POLICY "Users can only delete their own spares"
  ON spares_inventory
  FOR DELETE
  USING (auth.uid() = user_id);

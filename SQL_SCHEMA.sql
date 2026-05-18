-- Spares Inventory Table
-- This table stores spare parts inventory with part name, price, quantity, and total cost

CREATE TABLE IF NOT EXISTS spares_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  part_name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  qty INTEGER NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0 GENERATED ALWAYS AS (price * qty) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_spares_inventory_user_id ON spares_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_spares_inventory_created_at ON spares_inventory(created_at DESC);

-- Enable Row Level Security
ALTER TABLE spares_inventory ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to ensure users can only see their own spares
CREATE POLICY "Users can view their own spares"
  ON spares_inventory
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own spares"
  ON spares_inventory
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own spares"
  ON spares_inventory
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own spares"
  ON spares_inventory
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON spares_inventory TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

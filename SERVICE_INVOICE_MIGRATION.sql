-- Add new columns to service_invoices table
-- This migration adds unit and total fields to service invoices for better inventory tracking

ALTER TABLE service_invoices ADD COLUMN IF NOT EXISTS unit INTEGER DEFAULT 1;
ALTER TABLE service_invoices ADD COLUMN IF NOT EXISTS total DECIMAL(10, 2) DEFAULT 0;

-- Update existing records to calculate total (amount * unit)
UPDATE service_invoices SET total = amount * unit WHERE total = 0;

-- Add an index for faster queries
CREATE INDEX IF NOT EXISTS idx_service_invoices_product ON service_invoices(product);
CREATE INDEX IF NOT EXISTS idx_spares_inventory_qty ON spares_inventory(qty) WHERE qty > 0;

-- Optional: Add audit columns to track inventory changes
ALTER TABLE spares_inventory ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Ensure spares_inventory has necessary columns
-- (These should already exist, but adding for completeness)
ALTER TABLE spares_inventory 
ADD COLUMN IF NOT EXISTS part_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS qty INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create trigger to automatically update total in spares_inventory (optional, for database consistency)
-- Note: Trigger syntax varies by database. This is for PostgreSQL:
/*
CREATE OR REPLACE FUNCTION update_spare_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total := NEW.price * NEW.qty;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER spare_update_total
BEFORE INSERT OR UPDATE ON spares_inventory
FOR EACH ROW
EXECUTE FUNCTION update_spare_total();
*/

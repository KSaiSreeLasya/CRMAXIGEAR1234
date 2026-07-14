-- Create deliveries table linked to sales (projects)
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  project_name VARCHAR NOT NULL, -- Customer name from sales
  deliverables TEXT NOT NULL, -- Product description from sales
  delivery_date DATE NOT NULL,
  status VARCHAR DEFAULT 'pending', -- pending, completed, cancelled
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries on delivery_date
CREATE INDEX IF NOT EXISTS idx_deliveries_delivery_date ON deliveries(delivery_date);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_project_id ON deliveries(project_id);

-- Add delivery_date column to projects table if not exists
ALTER TABLE projects ADD COLUMN IF NOT EXISTS delivery_date DATE;

-- Create a view for upcoming deliveries (next 7 days)
DROP VIEW IF EXISTS upcoming_deliveries_7_days;
CREATE VIEW upcoming_deliveries_7_days AS
SELECT 
  d.*,
  p.customer_name,
  p.contact_no,
  p.location,
  p.amount
FROM deliveries d
JOIN projects p ON d.project_id = p.id
WHERE d.status = 'pending' 
  AND d.delivery_date >= CURRENT_DATE 
  AND d.delivery_date <= CURRENT_DATE + INTERVAL '7 days'
ORDER BY d.delivery_date ASC;

-- Optional: Add RLS policies if using authentication
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Create a policy for viewing deliveries (if using Supabase Auth)
-- DROP POLICY IF EXISTS "enable_read_deliveries" ON deliveries;
-- CREATE POLICY "enable_read_deliveries" ON deliveries
--   FOR SELECT
--   USING (auth.role() = 'authenticated');

-- DROP POLICY IF EXISTS "enable_write_deliveries" ON deliveries;
-- CREATE POLICY "enable_write_deliveries" ON deliveries
--   FOR INSERT
--   WITH CHECK (auth.role() = 'authenticated');

-- DROP POLICY IF EXISTS "enable_update_deliveries" ON deliveries;
-- CREATE POLICY "enable_update_deliveries" ON deliveries
--   FOR UPDATE
--   USING (auth.role() = 'authenticated');

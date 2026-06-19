-- Create dealers_invoice_items table to store individual line items for invoices
CREATE TABLE IF NOT EXISTS public.dealers_invoice_items (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  invoice_id UUID NOT NULL,
  product_name VARCHAR(255),
  product_description TEXT,
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC(12, 2),
  line_total NUMERIC(12, 2),
  gst_rate NUMERIC(5, 2) DEFAULT 18,
  gst_amount NUMERIC(12, 2),
  line_amount_with_gst NUMERIC(12, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_dealers_invoice_items_invoice FOREIGN KEY (invoice_id) 
    REFERENCES public.dealers_invoices(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_dealers_invoice_items_invoice_id 
  ON public.dealers_invoice_items(invoice_id);

-- Enable Row Level Security
ALTER TABLE public.dealers_invoice_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Enable read for all" ON public.dealers_invoice_items;
CREATE POLICY "Enable read for all" ON public.dealers_invoice_items 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all" ON public.dealers_invoice_items;
CREATE POLICY "Enable insert for all" ON public.dealers_invoice_items 
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all" ON public.dealers_invoice_items;
CREATE POLICY "Enable update for all" ON public.dealers_invoice_items 
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable delete for all" ON public.dealers_invoice_items;
CREATE POLICY "Enable delete for all" ON public.dealers_invoice_items 
  FOR DELETE USING (true);

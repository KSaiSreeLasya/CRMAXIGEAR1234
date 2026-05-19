# Spares Inventory Table - Complete Setup Guide

## Overview
This guide explains how to create the `spares_inventory` table from scratch in your Supabase database.

## Table Structure

### Columns Description

| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| **id** | UUID | ✅ | auto-generated | Primary key identifier |
| **user_id** | UUID | ✅ | - | User who owns this spare (foreign key) |
| **part_name** | VARCHAR(255) | ✅ | - | Name of the spare part |
| **part_code** | VARCHAR(100) | ❌ | NULL | Unique code/SKU for the part |
| **part_category** | VARCHAR(100) | ❌ | NULL | Category (e.g., Motor, Battery, Electrical) |
| **description** | TEXT | ❌ | NULL | Detailed description |
| **price** | DECIMAL(10,2) | ✅ | 0.00 | Unit price of the spare |
| **qty** | INTEGER | ✅ | 0 | Current quantity in stock |
| **total** | DECIMAL(10,2) | ✅ | auto | Auto-calculated (price × qty) |
| **reorder_level** | INTEGER | ❌ | 5 | Minimum qty before reorder needed |
| **supplier_name** | VARCHAR(255) | ❌ | NULL | Supplier company name |
| **supplier_contact** | VARCHAR(20) | ❌ | NULL | Supplier contact number |
| **created_at** | TIMESTAMP | ✅ | now | When record created |
| **updated_at** | TIMESTAMP | ✅ | now | When record last updated |

## Step-by-Step Setup

### Option 1: Using Supabase Dashboard

1. **Open Supabase Console**
   - Go to https://supabase.com → Your Project
   - Click "SQL Editor" in left sidebar

2. **Create New Query**
   - Click "New Query"
   - Copy the SQL from `SPARES_INVENTORY_TABLE.sql`
   - Paste into the editor

3. **Execute**
   - Click "Run" button
   - Wait for success message

4. **Verify**
   - Click "Table Editor" 
   - You should see `spares_inventory` table in the list

### Option 2: Using Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push

# Or manually create a migration
supabase migration new create_spares_inventory
```

### Option 3: Direct SQL (Minimal Version)

If you only need basic functionality:

```sql
CREATE TABLE IF NOT EXISTS spares_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  part_name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  qty INTEGER NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) GENERATED ALWAYS AS (price * qty) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_spares_user_id ON spares_inventory(user_id);
CREATE INDEX idx_spares_part_name ON spares_inventory(part_name);
CREATE INDEX idx_spares_qty ON spares_inventory(qty);
```

## Key Features Explained

### 1. **Auto-calculated Total**
```sql
total DECIMAL(10, 2) GENERATED ALWAYS AS (price * qty) STORED
```
- Automatically calculates `price × qty`
- Always accurate, no manual updates needed
- `STORED` means it's stored in database (not calculated on-read)

### 2. **Unique Constraint**
```sql
CONSTRAINT unique_user_part UNIQUE(user_id, part_name)
```
- Prevents duplicate part names per user
- Each user can have exactly one "Motor Brush" entry

### 3. **Check Constraints**
```sql
CONSTRAINT price_positive CHECK (price >= 0),
CONSTRAINT qty_positive CHECK (qty >= 0)
```
- Prevents negative prices or quantities
- Enforced at database level

### 4. **Indexes for Performance**
```sql
CREATE INDEX idx_spares_qty WHERE qty > 0;
```
- Speeds up queries (especially in service invoice dropdown)
- `WHERE qty > 0` makes it even faster for available items

### 5. **Row Level Security (RLS)**
```sql
ALTER TABLE spares_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only view their own spares"
  ON spares_inventory FOR SELECT
  USING (auth.uid() = user_id);
```
- Each user only sees their own spares
- Multi-tenant safe
- Automatic data isolation

### 6. **Auto-Update Timestamp**
```sql
CREATE TRIGGER spares_update_timestamp
BEFORE UPDATE ON spares_inventory
FOR EACH ROW EXECUTE FUNCTION update_spares_timestamp();
```
- Automatically updates `updated_at` when record changes
- No code changes needed

### 7. **Low Stock View** (Optional)
```sql
CREATE OR REPLACE VIEW low_stock_spares AS
SELECT ... WHERE qty <= reorder_level;
```
- Pre-built query for items below reorder level
- Useful for reporting

## Testing the Table

### 1. Check Table Created
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'spares_inventory';
```
Should return one row.

### 2. Check Indexes
```sql
SELECT indexname FROM pg_indexes 
WHERE tablename = 'spares_inventory';
```
Should list all created indexes.

### 3. Check RLS Policies
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'spares_inventory';
```
Should list 4 policies (SELECT, INSERT, UPDATE, DELETE).

### 4. Insert Sample Data
```sql
INSERT INTO spares_inventory (user_id, part_name, price, qty)
VALUES (
  '00000000-0000-0000-0000-000000000000',  -- Replace with actual user UUID
  'Motor Brush',
  500.00,
  10
);
```

### 5. Verify Auto-calculated Total
```sql
SELECT part_name, price, qty, total 
FROM spares_inventory 
WHERE part_name = 'Motor Brush';
```
Should show: total = 500 × 10 = 5000

## Sample Data (for testing)

```sql
-- Get your actual user_id first:
SELECT id FROM auth.users LIMIT 1;

-- Then insert sample data (replace 'your-actual-user-id'):
INSERT INTO spares_inventory (user_id, part_name, part_code, part_category, price, qty, reorder_level, supplier_name)
VALUES
  ('your-actual-user-id', 'Motor Brush', 'MB-001', 'Motor', 500.00, 10, 5, 'ABC Suppliers'),
  ('your-actual-user-id', 'Battery Terminal', 'BT-001', 'Battery', 200.00, 20, 10, 'XYZ Parts'),
  ('your-actual-user-id', 'Bearing', 'BR-001', 'Mechanical', 350.00, 15, 8, 'ABC Suppliers'),
  ('your-actual-user-id', 'Brake Pad', 'BP-001', 'Brake', 400.00, 12, 6, 'XYZ Parts'),
  ('your-actual-user-id', 'Wiring Harness', 'WH-001', 'Electrical', 1500.00, 5, 3, 'ABC Suppliers');
```

## Troubleshooting

### Error: "user_id" column does not exist
- Solution: Check that `auth.users` table exists (it should be default in Supabase)
- The foreign key references `auth.users(id)` which is Supabase's auth table

### Error: "gen_random_uuid()" not recognized
- Solution: Make sure you're using PostgreSQL (Supabase uses PostgreSQL by default)
- If not, use: `DEFAULT uuid_generate_v4()` instead

### Error: "GENERATED ALWAYS AS" not supported
- Solution: Upgrade your PostgreSQL version (needs 12+)
- Fallback: Use `total DECIMAL(10, 2)` and update manually with triggers

### RLS Policies Preventing Access
- Solution: Make sure `user_id` column matches current user's UUID
- Test with: `SELECT auth.uid();` to see current user

### Duplicate Part Names Error
- Solution: You already have that part name for this user
- Either update the existing record or use a different name

## Related Tables

Make sure these tables also exist (usually pre-exist in Supabase):

### auth.users
- Supabase authentication table
- Contains all user information
- Already created when you set up Supabase project

### service_invoices (created by you)
- Links to `spares_inventory.part_name`
- Also has `unit` and `total` fields

## Integration with Service Invoices

The `spares_inventory` table integrates with service invoices:

```
Service Invoice Form:
  Product (dropdown) → fetches from spares_inventory WHERE qty > 0
  Amount → auto-fills from spares_inventory.price
  Unit → user enters
  Total → calculates as amount × unit

On Submit:
  spares_inventory.qty -= unit
  Update reflected in dropdown immediately
```

## Maintenance Queries

### Check Low Stock Items
```sql
SELECT * FROM low_stock_spares;
```

### Find Most Used Parts (by count of invoices)
```sql
SELECT 
  product,
  COUNT(*) as usage_count,
  SUM(unit) as total_units_used
FROM service_invoices
GROUP BY product
ORDER BY total_units_used DESC;
```

### Find Expensive Parts
```sql
SELECT part_name, price, qty, total
FROM spares_inventory
WHERE price > 1000
ORDER BY price DESC;
```

### Check Total Inventory Value
```sql
SELECT 
  SUM(total) as total_inventory_value,
  COUNT(*) as total_parts,
  AVG(price) as avg_part_price
FROM spares_inventory;
```

## Best Practices

✅ **Do:**
- Always set a reorder_level for important parts
- Regularly check low_stock_spares view
- Use part_code for tracking in external systems
- Archive old spares instead of deleting them

❌ **Don't:**
- Manually edit the total column (it's auto-calculated)
- Delete records (they might be referenced in invoices)
- Have duplicate part names (unique constraint prevents it)
- Mix units (decide on unit beforehand: pieces, boxes, etc.)

## Next Steps

1. ✅ Run the SQL to create the table
2. ✅ Insert sample spare parts
3. ✅ Test with Service Invoice feature
4. ✅ Monitor inventory as invoices are created
5. ✅ Set up low stock alerts (optional)

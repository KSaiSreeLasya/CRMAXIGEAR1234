# Spares Inventory Table - Quick Reference Card

## Copy & Paste SQL

```sql
-- COMPLETE TABLE CREATION (Copy entire block and run in Supabase)

CREATE TABLE IF NOT EXISTS spares_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  part_name VARCHAR(255) NOT NULL,
  part_code VARCHAR(100),
  part_category VARCHAR(100),
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  qty INTEGER NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) GENERATED ALWAYS AS (price * qty) STORED,
  reorder_level INTEGER DEFAULT 5,
  supplier_name VARCHAR(255),
  supplier_contact VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT price_positive CHECK (price >= 0),
  CONSTRAINT qty_positive CHECK (qty >= 0),
  CONSTRAINT unique_user_part UNIQUE(user_id, part_name)
);

CREATE INDEX idx_spares_user_id ON spares_inventory(user_id);
CREATE INDEX idx_spares_part_name ON spares_inventory(part_name);
CREATE INDEX idx_spares_qty ON spares_inventory(qty);
CREATE INDEX idx_spares_category ON spares_inventory(part_category);
CREATE INDEX idx_spares_qty_filter ON spares_inventory(qty) WHERE qty > 0;

CREATE OR REPLACE FUNCTION update_spares_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER spares_update_timestamp
BEFORE UPDATE ON spares_inventory
FOR EACH ROW
EXECUTE FUNCTION update_spares_timestamp();

ALTER TABLE spares_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own spares"
  ON spares_inventory FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own spares"
  ON spares_inventory FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own spares"
  ON spares_inventory FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own spares"
  ON spares_inventory FOR DELETE USING (auth.uid() = user_id);
```

---

## Minimal Version (If Full Version Fails)

```sql
-- Simplified version - basic functionality only
CREATE TABLE IF NOT EXISTS spares_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  part_name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  qty INTEGER NOT NULL DEFAULT 0,
  total DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Update total manually for now
-- Or create a trigger to auto-update it

CREATE INDEX idx_spares_qty ON spares_inventory(qty) WHERE qty > 0;
```

---

## Column Quick Guide

| Column | Use Case | Example |
|--------|----------|---------|
| `id` | Record identifier | `123e4567-e89b-12d3-a456-426614174000` |
| `user_id` | Owner tracking | `user-uuid-here` |
| `part_name` | Search & dropdown | `"Motor Brush"` |
| `part_code` | Inventory tracking | `"MB-001"` |
| `part_category` | Filtering & sorting | `"Motor"` |
| `price` | Cost per unit | `500.00` |
| `qty` | Stock amount | `10` |
| `total` | Inventory value | `5000.00` (auto: 500 × 10) |
| `reorder_level` | Reorder trigger | `5` |
| `supplier_name` | Ordering | `"ABC Suppliers"` |
| `created_at` | Audit trail | `2024-05-19 10:30:00` |
| `updated_at` | Last change | `2024-05-19 14:45:00` |

---

## How to Run SQL in Supabase

1. Open https://supabase.com → Your Project
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy & paste the SQL above
5. Click **Run** button
6. Should see: ✅ "Success"

---

## Verify Table Created

```sql
-- Check if table exists
SELECT * FROM spares_inventory LIMIT 1;

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'spares_inventory';

-- Check columns
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'spares_inventory';
```

---

## Insert Test Data

```sql
-- First, get your user ID:
SELECT id FROM auth.users LIMIT 1;

-- Then insert (replace 'YOUR-USER-ID-HERE'):
INSERT INTO spares_inventory (user_id, part_name, price, qty) VALUES
  ('YOUR-USER-ID-HERE', 'Motor Brush', 500.00, 10),
  ('YOUR-USER-ID-HERE', 'Battery Terminal', 200.00, 20),
  ('YOUR-USER-ID-HERE', 'Brake Pad', 400.00, 12);
```

---

## Common SQL Queries

```sql
-- Get all spares for current user
SELECT * FROM spares_inventory ORDER BY part_name;

-- Get spares with available qty (for dropdown)
SELECT part_name, qty, price FROM spares_inventory 
WHERE qty > 0 ORDER BY part_name;

-- Check low stock items
SELECT part_name, qty, reorder_level 
FROM spares_inventory WHERE qty <= reorder_level;

-- Get total inventory value
SELECT SUM(total) as inventory_value FROM spares_inventory;

-- Find most expensive parts
SELECT part_name, price FROM spares_inventory 
ORDER BY price DESC LIMIT 10;

-- Update quantity after using in service
UPDATE spares_inventory SET qty = qty - 3 
WHERE part_name = 'Motor Brush';

-- Delete a spare (rarely used)
DELETE FROM spares_inventory WHERE id = 'spare-id-here';
```

---

## Column Definitions

### id
```sql
UUID PRIMARY KEY DEFAULT gen_random_uuid()
```
- **Type**: UUID (Universally Unique ID)
- **Auto-generated**: Yes
- **Unique**: Yes
- **Used for**: Linking to other tables

### user_id
```sql
UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
```
- **Type**: UUID
- **Required**: Yes
- **Foreign Key**: Points to auth.users table
- **ON DELETE CASCADE**: If user deleted, their spares deleted too
- **Used for**: Multi-tenant data isolation

### part_name
```sql
VARCHAR(255) NOT NULL
```
- **Type**: Text (max 255 chars)
- **Required**: Yes
- **Unique**: Yes (per user)
- **Used for**: Selection in service invoices dropdown
- **Examples**: "Motor Brush", "Battery Terminal", "Bearing"

### part_code
```sql
VARCHAR(100)
```
- **Type**: Text (max 100 chars)
- **Required**: No
- **Unique**: No
- **Used for**: SKU/Internal tracking
- **Examples**: "MB-001", "BT-001", "BR-001"

### part_category
```sql
VARCHAR(100)
```
- **Type**: Text (max 100 chars)
- **Required**: No
- **Used for**: Filtering/Organizing
- **Examples**: "Motor", "Battery", "Electrical", "Mechanical"

### description
```sql
TEXT
```
- **Type**: Long text
- **Required**: No
- **Used for**: Detailed information
- **Examples**: "Carbon brush for DC motor", "Positive battery terminal"

### price
```sql
DECIMAL(10, 2) NOT NULL DEFAULT 0.00
```
- **Type**: Decimal (10 digits, 2 decimal places)
- **Range**: 0.00 to 99,999,999.99
- **Default**: 0.00
- **Required**: Yes
- **Check**: Must be >= 0
- **Used for**: Unit cost calculation
- **Examples**: 500.00, 200.50, 1500.99

### qty
```sql
INTEGER NOT NULL DEFAULT 0
```
- **Type**: Integer (whole number)
- **Range**: 0 to 2,147,483,647
- **Default**: 0
- **Required**: Yes
- **Check**: Must be >= 0
- **Used for**: Stock quantity
- **Examples**: 10, 20, 5

### total
```sql
DECIMAL(10, 2) GENERATED ALWAYS AS (price * qty) STORED
```
- **Type**: Decimal (auto-calculated)
- **Formula**: price × qty
- **Storage**: Stored in database (not computed on read)
- **Editable**: No (read-only)
- **Used for**: Quick inventory value lookup
- **Examples**: 5000.00 (500 × 10), 4000.00 (200 × 20)

### reorder_level
```sql
INTEGER DEFAULT 5
```
- **Type**: Integer
- **Default**: 5
- **Used for**: Inventory alerts
- **Examples**: 5, 10, 20 (depends on usage)

### supplier_name
```sql
VARCHAR(255)
```
- **Type**: Text
- **Used for**: Ordering new stock
- **Examples**: "ABC Suppliers", "XYZ Parts"

### supplier_contact
```sql
VARCHAR(20)
```
- **Type**: Text
- **Used for**: Quick contact
- **Examples**: "+91-9876543210", "9876543210"

### created_at & updated_at
```sql
TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
```
- **Type**: Timestamp with timezone
- **Auto-set**: Yes (created_at on insert, updated_at on update via trigger)
- **Used for**: Audit trail, tracking changes
- **Format**: 2024-05-19 14:30:45.123456+00

---

## Constraints Explained

### NOT NULL
```sql
user_id UUID NOT NULL
part_name VARCHAR(255) NOT NULL
```
- **Means**: This field MUST have a value
- **Prevents**: Empty/null entries

### PRIMARY KEY
```sql
id UUID PRIMARY KEY
```
- **Means**: Unique identifier for each row
- **Prevents**: Duplicate IDs
- **Used for**: Linking to other tables

### REFERENCES (Foreign Key)
```sql
user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
```
- **Means**: user_id must exist in auth.users table
- **Prevents**: Invalid user references
- **CASCADE**: Delete spares if user deleted

### UNIQUE
```sql
CONSTRAINT unique_user_part UNIQUE(user_id, part_name)
```
- **Means**: Same part_name per user only once
- **Prevents**: Duplicate part entries for same user
- **Allows**: Different users can have "Motor Brush"

### CHECK
```sql
CONSTRAINT price_positive CHECK (price >= 0)
```
- **Means**: price must be >= 0
- **Prevents**: Negative prices

---

## Indexes Explained

```sql
CREATE INDEX idx_spares_qty ON spares_inventory(qty) WHERE qty > 0;
```
- **Purpose**: Speed up queries
- **Used by**: Service invoice dropdown query
- **Condition**: `WHERE qty > 0` - only indexes available items
- **Benefit**: Faster filtering in dropdown

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| `relation "spares_inventory" does not exist` | Run CREATE TABLE SQL |
| `duplicate key value violates unique constraint` | Same part_name for same user |
| `violates foreign key constraint` | user_id doesn't exist in auth.users |
| `division by zero in generated column` | Price/qty shouldn't cause this; check calculation |
| `permission denied` | Check RLS policies or user_id mismatch |

---

## Integration Checklist

- [ ] Table created in Supabase
- [ ] Indexes created
- [ ] RLS policies enabled
- [ ] Test data inserted
- [ ] Service invoice dropdown works
- [ ] Inventory decrements on invoice creation
- [ ] Spares list reloads with updated quantities

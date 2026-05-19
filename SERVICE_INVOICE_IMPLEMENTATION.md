# Service Invoice with Inventory Integration

## Overview
This implementation adds the following features to the Service Invoice system:
1. **Product Dropdown from Spare Inventory** - Select products from the spares inventory with automatic price population
2. **Inventory Decrement** - When a service invoice is created, the quantity in spares inventory is automatically decreased
3. **Unit and Total Fields** - Track units used and calculate total automatically (total = amount × unit)

## Database Schema Changes

### SQL Migration
Run the following SQL commands in your Supabase database:

```sql
-- Add new columns to service_invoices table
ALTER TABLE service_invoices ADD COLUMN IF NOT EXISTS unit INTEGER DEFAULT 1;
ALTER TABLE service_invoices ADD COLUMN IF NOT EXISTS total DECIMAL(10, 2) DEFAULT 0;

-- Update existing records to calculate total
UPDATE service_invoices SET total = amount * unit WHERE total = 0;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_service_invoices_product ON service_invoices(product);
CREATE INDEX IF NOT EXISTS idx_spares_inventory_qty ON spares_inventory(qty) WHERE qty > 0;

-- Ensure spares_inventory has all necessary columns
ALTER TABLE spares_inventory 
ADD COLUMN IF NOT EXISTS part_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS qty INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

### Table Structures

#### service_invoices table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | User who created the invoice |
| service_invoice_no | VARCHAR | Unique invoice number |
| customer_name | VARCHAR | Customer name |
| contact_no | VARCHAR | Customer contact |
| location | VARCHAR | Service location |
| product | VARCHAR | Product name (references spares_inventory.part_name) |
| product_description | TEXT | Product description |
| invoice_date | DATE | Invoice date |
| amount | DECIMAL(10,2) | Unit price |
| unit | INTEGER | Quantity used |
| total | DECIMAL(10,2) | Total = amount × unit |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

#### spares_inventory table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | User who owns this spare |
| part_name | VARCHAR | Spare part name |
| price | DECIMAL(10,2) | Unit price |
| qty | INTEGER | Available quantity |
| total | DECIMAL(10,2) | Total value (price × qty) |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## Frontend Implementation

### Key Features Implemented

1. **Product Selection Dropdown**
   - Fetches available spares from spares_inventory with qty > 0
   - Displays: `{partName} - Qty: {qty} - ₹{price}`
   - Automatically populates amount field with selected product's price

2. **Unit Field**
   - Input field for quantity of units used in the service
   - Validates against available inventory
   - Throws error if unit > available qty

3. **Total Field**
   - Auto-calculated as: amount × unit
   - Read-only disabled field (cannot be manually edited)
   - Updates in real-time as amount or unit changes

4. **Inventory Decrement**
   - When service invoice is created (not when edited):
     - Checks if requested unit quantity is available
     - Decreases spares_inventory.qty by the unit amount
     - Reloads spares list to reflect changes
   - Handles both Supabase and localStorage fallback

5. **Table Display**
   - Added columns: Unit, Total
   - Shows all invoice details with the new fields

## API Integration

### Supabase Operations

#### Load Available Spares
```typescript
const { data, error } = await supabase
  .from("spares_inventory")
  .select("*")
  .gt("qty", 0)  // Only items with quantity > 0
  .order("part_name", { ascending: true });
```

#### Create Service Invoice (with inventory update)
```typescript
// 1. Insert service invoice
const { data, error } = await supabase
  .from("service_invoices")
  .insert([{
    user_id: userData.user.id,
    service_invoice_no: payload.serviceInvoiceNo,
    customer_name: payload.customerName,
    // ... other fields
    unit: payload.unit,
    total: payload.total,
  }])
  .select()
  .single();

// 2. Update spare inventory quantity
const { error: updateError } = await supabase
  .from("spares_inventory")
  .update({ qty: newQty })
  .eq("id", selectedSpare.id);
```

## Form Fields Workflow

### User Input Flow
1. **Product Selection** → Auto-populate Amount
2. **Enter Amount** → Recalculate Total
3. **Enter Unit** → Recalculate Total
4. **Submit** → Validate inventory → Create invoice → Decrease inventory

### Validation
- **Product**: Required, must be selected from dropdown
- **Customer Name**: Required
- **Amount**: Required, numeric
- **Unit**: Required, numeric (must be > 0)
- **Inventory Check**: unit ≤ available qty in inventory

## Error Handling

### Insufficient Inventory
```
Error: Insufficient inventory. Available: 5
```
When user tries to use more units than available in inventory.

### Fallback Behavior
- If Supabase insert fails, data is saved to localStorage
- If Supabase inventory update fails, warning is logged but invoice is created
- localStorage also updated for offline support

## Example Workflow

1. **Spare in Inventory**: "Motor Brush" - 10 qty, ₹500/unit
2. **Create Service Invoice**:
   - Product: "Motor Brush - Qty: 10 - ₹500"
   - Amount: ₹500 (auto-filled)
   - Unit: 3
   - Total: ₹1500 (auto-calculated)
3. **Result**: 
   - Service invoice created with total = ₹1500
   - Spare inventory qty reduced from 10 → 7

## Testing Checklist

- [ ] Spares dropdown shows only items with qty > 0
- [ ] Amount auto-fills when product is selected
- [ ] Total auto-calculates as amount × unit
- [ ] Form validates that unit ≤ available qty
- [ ] Service invoice created successfully
- [ ] Spare inventory qty decreases after invoice creation
- [ ] Spares list reloads with updated quantities
- [ ] Edit functionality works (doesn't double-decrement inventory)
- [ ] Delete removes the invoice (note: inventory NOT restored)
- [ ] localStorage fallback works when offline
- [ ] PDF preview shows all fields including unit and total

## Notes

- **Inventory Decrement**: Only happens on invoice creation, not on edit
- **No Reversal**: Deleting a service invoice does NOT restore inventory (manual adjustment required)
- **Product Matching**: Uses exact match on part_name between service_invoices.product and spares_inventory.part_name
- **Currency**: All amounts displayed in INR (₹)

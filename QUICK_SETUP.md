# Quick Setup Guide - Service Invoice Inventory Integration

## Step 1: Database Migration

Copy and run this SQL in your Supabase SQL Editor:

```sql
-- Add new columns to service_invoices table
ALTER TABLE service_invoices ADD COLUMN IF NOT EXISTS unit INTEGER DEFAULT 1;
ALTER TABLE service_invoices ADD COLUMN IF NOT EXISTS total DECIMAL(10, 2) DEFAULT 0;

-- Update existing records to calculate total
UPDATE service_invoices SET total = amount * unit WHERE total = 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_invoices_product ON service_invoices(product);
CREATE INDEX IF NOT EXISTS idx_spares_inventory_qty ON spares_inventory(qty) WHERE qty > 0;

-- Ensure spares_inventory has all necessary columns (may already exist)
ALTER TABLE spares_inventory 
ADD COLUMN IF NOT EXISTS part_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS qty INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

## Step 2: Verify Tables Exist

Make sure these tables exist in Supabase:

**service_invoices**
- id (UUID, Primary Key)
- user_id (UUID)
- service_invoice_no (VARCHAR)
- customer_name (VARCHAR)
- contact_no (VARCHAR)
- location (VARCHAR)
- product (VARCHAR) - references spares_inventory.part_name
- product_description (TEXT)
- invoice_date (DATE)
- amount (DECIMAL)
- unit (INTEGER) - ✨ NEW
- total (DECIMAL) - ✨ NEW
- created_at (TIMESTAMP)

**spares_inventory**
- id (UUID, Primary Key)
- user_id (UUID)
- part_name (VARCHAR)
- price (DECIMAL)
- qty (INTEGER)
- total (DECIMAL)
- created_at (TIMESTAMP)

## Step 3: Update Code

The following changes are already implemented in `client/pages/ServiceInvoice.tsx`:

✅ Product dropdown fetches from spares_inventory
✅ Amount auto-fills from product price
✅ Unit field added (quantity used)
✅ Total field auto-calculated (amount × unit)
✅ Inventory decrements on invoice creation
✅ Table shows unit and total columns

## Step 4: Test the Feature

1. **Create test spares:**
   - Go to Inventory → Spares tab
   - Add: "Motor Brush" - Price: 500, Qty: 10
   - Add: "Battery Terminal" - Price: 200, Qty: 20

2. **Create service invoice:**
   - Go to Service Invoices
   - Select product: "Motor Brush - Qty: 10 - ₹500"
   - Check: Amount auto-filled to 500 ✓
   - Enter Unit: 3
   - Check: Total auto-calculated to 1500 ✓
   - Fill other fields and submit
   - Check: Spare qty reduced from 10 → 7 ✓

3. **Verify table:**
   - Should show Unit: 3, Total: ₹1500 ✓

## Key Behaviors

| Action | Behavior |
|--------|----------|
| Select Product | Amount auto-fills with product price |
| Change Amount | Total recalculates instantly |
| Change Unit | Total recalculates instantly |
| Submit Invoice | Spare qty decreases by unit amount |
| Try Unit > Qty | Error: "Insufficient inventory. Available: X" |
| Edit Invoice | Inventory NOT re-decremented (prevents double-decrease) |
| Delete Invoice | Inventory NOT restored (manual adjustment needed) |

## Form Fields Layout

```
Row 1: [Invoice No (auto)] [Customer Name]
Row 2: [Contact No] [Location]
Row 3: [Product (dropdown)] [Product Description]
Row 4: [Invoice Date] [Amount]
Row 5: [Unit] [Total (auto, disabled)]
Row 6: [Create Invoice] [Cancel]
```

## Troubleshooting

### "No spares available" in dropdown
- Check: Spares inventory has items
- Check: Items have qty > 0
- Check: Wait for page to load (check loading state)

### Inventory not decreasing
- Check: Product name matches exactly (case-sensitive)
- Check: Unit ≤ Available qty
- Check: Supabase connection is working
- Check: Browser console for errors

### Amount not auto-filling
- Ensure product is selected from dropdown
- Check: Spares have a price value
- Refresh page if stuck

### Total field shows 0
- Ensure both Amount and Unit have values
- Total = Amount × Unit
- Check browser console for calculation errors

## Important Reminders

🔴 **Do NOT:**
- Manually edit unit/total in database (they auto-calculate)
- Expect inventory to restore when deleting invoices
- Use inconsistent product names across tables

✅ **DO:**
- Use the dropdown to select products (don't type free text)
- Verify inventory levels before and after operations
- Monitor spare quantities in inventory page
- Test with small quantities first

## Support Docs

For detailed information, see:
- `SERVICE_INVOICE_IMPLEMENTATION.md` - Full technical details
- `CHANGES_SUMMARY.md` - Complete list of changes
- `SERVICE_INVOICE_MIGRATION.sql` - Complete SQL with comments

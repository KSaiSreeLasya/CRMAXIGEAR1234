# Dealers Product Invoice Feature Guide

## Overview

The **Dealers Product Invoices** feature provides a dedicated interface for creating, managing, and exporting professional proforma invoices for dealer products in AXIGEAR CRM.

## Features

✅ **Professional Proforma Invoice Format**
- Clean, attractive invoice layout with company branding
- SENT TO / SHIP TO / BILL TO sections
- Detailed product specifications table
- Automatic GST calculation (CGST-SGST or IGST)
- Professional signature blocks

✅ **Full Invoice Management**
- Create new invoices with auto-incrementing invoice numbers (DLRPROD/2026-27/XXX)
- Edit existing invoices
- Delete invoices with confirmation
- Preview invoices before downloading
- Export invoices as PDF files
- Import/Export invoices as CSV

✅ **Smart Features**
- Automatic invoice number generation
- Dealer information auto-population from dealers list
- GST calculations (18% total)
- Quantity-based amount calculation
- Payment mode tracking (Cash, Cheque, Bank Transfer, Credit Card)
- Payment status management (pending, paid, partial)

## Database Schema

### Table: `dealers_product_invoices`

```sql
CREATE TABLE dealers_product_invoices (
  id UUID PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE,
  invoice_date DATE,
  dealer_id UUID,
  dealer_name VARCHAR(255),
  dealer_code VARCHAR(100),
  contact_no VARCHAR(20),
  location VARCHAR(255),
  product_id UUID,
  model_no VARCHAR(100),
  product_description TEXT,
  hsn_no VARCHAR(50),
  chassis_no VARCHAR(100),
  motor_no VARCHAR(100),
  battery_no VARCHAR(100),
  battery_capacity VARCHAR(100),
  battery_vehicle_specs TEXT,
  battery_warranty VARCHAR(100),
  vehicle_warranty VARCHAR(100),
  quantity INTEGER,
  unit_price DECIMAL(12, 2),
  amount DECIMAL(12, 2),
  gst_enabled BOOLEAN,
  gst_type VARCHAR(20),
  gst_amount DECIMAL(12, 2),
  total_amount DECIMAL(12, 2),
  mode_of_payment VARCHAR(100),
  payment_status VARCHAR(50),
  created_by UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  is_deleted BOOLEAN
);
```

**Indexes:**
- `idx_dealers_product_invoices_invoice_date` - For date range queries
- `idx_dealers_product_invoices_dealer_id` - For dealer lookups
- `idx_dealers_product_invoices_payment_status` - For payment tracking
- `idx_dealers_product_invoices_deleted` - For active invoices only

## Setup Instructions

### 1. Database Setup

If using Supabase:

```sql
-- Run the SQL from docs/DEALERS_INVOICE_SCHEMA.sql
-- Create the dealers_product_invoices table
-- Enable RLS (Row Level Security) if needed
-- Set up indexes and views
```

### 2. Access the Feature

Navigate to: **Dashboard → DEALERS PRODUCT INVOICES**

Or visit: `/dealers-product-invoice`

### 3. Create an Invoice

1. Fill in the form with invoice details:
   - Invoice Number (auto-generated)
   - Invoice Date
   - Dealer Information (name, code, contact, location)
   - Product Details (model, description, HSN, etc.)
   - Vehicle Details (chassis, motor, battery info)
   - Unit Price and Quantity

2. Review the calculated total with GST

3. Click "Create Invoice"

### 4. Manage Invoices

**Preview**: Click the "Preview" button to see the invoice in a modal
**Download**: Click the "Download" button to save as PDF
**Edit**: Click the edit icon to modify invoice details
**Delete**: Click the trash icon to remove an invoice

### 5. Export/Import

Use the Import/Export tools to:
- Export all invoices as CSV
- Import invoices from CSV files
- Share invoice data with other systems

## Invoice Format

The proforma invoice displays:

```
┌─────────────────────────────────────┐
│    PROFORMA INVOICE                 │
├─────────────────────────────────────┤
│ SENT TO  │  SHIP TO  │  INVOICE #   │
├─────────────────────────────────────┤
│   AXIGEAR ELECTRIC LOUNGE            │
│   Company Details                   │
├─────────────────────────────────────┤
│ DESCRIPTION │ QTY │ PRICE │ AMOUNT  │
├─────────────────────────────────────┤
│ Product     │  1  │ 1000  │  1000   │
├─────────────────────────────────────┤
│ SUBTOTAL                  1000.00   │
│ CGST (9%)                   90.00   │
│ SGST (9%)                   90.00   │
│ TOTAL                     1180.00   │
├─────────────────────────────────────┤
│ Bank Details & Terms                │
├─────────────────────────────────────┤
│ Signature Blocks                    │
└─────────────────────────────────────┘
```

## Data Storage

- **Primary**: Supabase PostgreSQL database (if configured)
- **Fallback**: Browser localStorage for offline capability
- **Sync**: Automatic sync to both storage systems when available

## GST Configuration

The invoice supports two GST calculation modes:

1. **CGST-SGST (Default)**
   - Central GST: 9%
   - State GST: 9%
   - Total: 18%

2. **IGST (Interstate)**
   - Integrated GST: 18%

## Payment Status Tracking

Invoices can have the following payment statuses:
- `pending` - Invoice created, awaiting payment
- `paid` - Invoice fully paid
- `partial` - Invoice partially paid

## Invoice Number Format

Auto-generated invoice numbers follow the pattern:
- Format: `DLRPROD/2026-27/XXX`
- Prefix: `DLRPROD/2026-27/`
- Numeric suffix: Zero-padded (001, 002, 003, ...)
- Increments automatically for each new invoice

## API Integration

If you need to integrate with external systems:

```javascript
// Fetch all invoices
const invoices = await supabase
  .from('dealers_product_invoices')
  .select('*')
  .order('created_at', { ascending: false });

// Get invoice statistics
const stats = await supabase.rpc('get_dealers_invoice_stats', {
  p_dealer_id: dealerId
});
```

## Best Practices

1. **Invoice Numbers**: Never manually edit invoice numbers after creation to maintain uniqueness
2. **Dealer Data**: Update dealer information in the Dealers section to auto-populate here
3. **GST Settings**: Choose the correct GST type (CGST-SGST or IGST) before creating invoices
4. **Backups**: Regularly export invoices as CSV for backup
5. **Payment Tracking**: Update payment status as payments are received

## Troubleshooting

**Invoice not saving?**
- Check dealer name is not empty
- Ensure invoice number is unique
- Verify database connection if using Supabase

**PDF download not working?**
- Ensure html2pdf.js library is loaded
- Check browser console for errors
- Try a different browser

**Invoice data not appearing?**
- Clear browser localStorage: `localStorage.removeItem('dealers_product_invoices')`
- Check Supabase connection status
- Verify RLS policies if using Supabase

## Future Enhancements

- Multi-line items in single invoice
- Recurring invoices
- Email integration for sending invoices
- Payment gateway integration
- Invoice templates customization
- Bulk invoice generation

## Support

For issues or feature requests, contact the development team or check the application logs.

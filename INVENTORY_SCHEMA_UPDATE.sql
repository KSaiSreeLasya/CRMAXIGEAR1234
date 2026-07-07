-- Migration: Update inventory schema to support multiple motor/battery numbers per chassis
-- Remove sales_count field and adjust closing_stock calculation

-- Step 1: Add new columns to support multiple motor/battery numbers (JSON arrays)
ALTER TABLE public.inventory_items 
  ADD COLUMN IF NOT EXISTS chassis_motor_battery JSONB DEFAULT '[]'::jsonb;

-- Schema for chassis_motor_battery column:
-- [
--   { "chassis_no": "CH001", "motor_no": "MOT001", "battery_no": "BAT001" },
--   { "chassis_no": "CH002", "motor_no": "MOT002", "battery_no": "BAT002" }
-- ]

-- Step 2: Migrate existing data (optional - only if you want to preserve existing data)
-- This will move existing single values into the new structure
UPDATE public.inventory_items
SET chassis_motor_battery = CASE 
  WHEN chassis_no IS NOT NULL OR motor_no IS NOT NULL OR battery_no IS NOT NULL THEN
    jsonb_build_array(jsonb_build_object(
      'chassis_no', COALESCE(chassis_no, ''),
      'motor_no', COALESCE(motor_no, ''),
      'battery_no', COALESCE(battery_no, '')
    ))
  ELSE '[]'::jsonb
END
WHERE chassis_motor_battery = '[]'::jsonb;

-- Step 3: Drop the sales_count column (it will be removed from calculations)
ALTER TABLE public.inventory_items 
  DROP COLUMN IF EXISTS sales_count;

-- Step 4: Update closing_stock to be just equal to vehicle_count (since we removed sales_count)
UPDATE public.inventory_items
SET closing_stock = vehicle_count;

-- Step 5: Keep the old columns for backward compatibility, but they are now deprecated
-- In the future, data should use chassis_motor_battery column instead
-- The old columns can be dropped after a deprecation period
ALTER TABLE public.inventory_items 
  ADD COLUMN IF NOT EXISTS _deprecated_chassis_no text;
ALTER TABLE public.inventory_items 
  ADD COLUMN IF NOT EXISTS _deprecated_motor_no text;
ALTER TABLE public.inventory_items 
  ADD COLUMN IF NOT EXISTS _deprecated_battery_no text;

-- Optional: Copy old values to deprecated columns before we stop using them
-- UPDATE public.inventory_items
-- SET _deprecated_chassis_no = chassis_no,
--     _deprecated_motor_no = motor_no,
--     _deprecated_battery_no = battery_no;

-- Stock / Inventory module rectification — run once against EXISTING databases.

-- 1. Batch/lot + expiry tracking on purchases (critical for medicines & semen).
ALTER TABLE purchase_items ADD COLUMN IF NOT EXISTS "batch_number" VARCHAR(100);
ALTER TABLE purchase_items ADD COLUMN IF NOT EXISTS "expiry_date" DATE;

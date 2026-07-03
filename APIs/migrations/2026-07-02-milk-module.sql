-- Milk Management module rectification — run once against EXISTING databases.

-- 1. New milk-out type for withheld/dumped milk (antibiotic withdrawal, spoilage).
ALTER TYPE "enum_milk_out_outType" ADD VALUE IF NOT EXISTS 'dumped';

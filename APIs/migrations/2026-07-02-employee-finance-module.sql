-- Employee/HR + Finance rectification — run once against EXISTING databases.

-- 1. financial_transactions.transaction_source ENUM was missing the values the
--    advance hooks send, so every employee-advance ledger posting failed
--    silently. Add them (plus 'treatment' used by the vet-expense hook).
ALTER TYPE "enum_financial_transactions_transaction_source" ADD VALUE IF NOT EXISTS 'employee_advance';
ALTER TYPE "enum_financial_transactions_transaction_source" ADD VALUE IF NOT EXISTS 'employee_advance_recovery';
ALTER TYPE "enum_financial_transactions_transaction_source" ADD VALUE IF NOT EXISTS 'treatment';

-- 2. salary_invoices had a nonsensical default of 30 on money/day columns —
--    a bare insert produced deduction/bonus/overtime of 30.
ALTER TABLE salary_invoices ALTER COLUMN "present_days" SET DEFAULT 0;
ALTER TABLE salary_invoices ALTER COLUMN "absence_days" SET DEFAULT 0;
ALTER TABLE salary_invoices ALTER COLUMN "salary_days" SET DEFAULT 0;
ALTER TABLE salary_invoices ALTER COLUMN "deduction" SET DEFAULT 0;
ALTER TABLE salary_invoices ALTER COLUMN "bonus" SET DEFAULT 0;
ALTER TABLE salary_invoices ALTER COLUMN "overtime" SET DEFAULT 0;

-- 3. Prevent duplicate salary invoices per employee per month at the DB level.
CREATE UNIQUE INDEX IF NOT EXISTS "salary_invoices_farm_employee_month_unique"
    ON salary_invoices ("farmId", "employee_id", "month")
    WHERE "isDeleted" = false;

-- 4. Remove existing duplicate attendance rows (keep the most recent), then
--    prevent duplicates per employee per day going forward.
DELETE FROM attendance a USING attendance b
WHERE a."employee_id" = b."employee_id"
  AND a."date" = b."date"
  AND a."createdAt" < b."createdAt";
CREATE UNIQUE INDEX IF NOT EXISTS "attendance_employee_date_unique"
    ON attendance ("employee_id", "date");

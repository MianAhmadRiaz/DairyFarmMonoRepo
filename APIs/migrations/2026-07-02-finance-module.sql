-- Finance module rectification — run once against EXISTING databases.

-- 1. Account codes / entry numbers / transaction numbers were GLOBALLY unique,
--    so a second farm could never initialize its chart of accounts.
--    Make them unique per farm instead.
ALTER TABLE chart_of_accounts DROP CONSTRAINT IF EXISTS "chart_of_accounts_account_code_key";
ALTER TABLE journal_entries DROP CONSTRAINT IF EXISTS "journal_entries_entry_number_key";
ALTER TABLE financial_transactions DROP CONSTRAINT IF EXISTS "financial_transactions_transaction_number_key";

CREATE UNIQUE INDEX IF NOT EXISTS "chart_of_accounts_farm_code_unique"
    ON chart_of_accounts ("farmId", "account_code");
CREATE UNIQUE INDEX IF NOT EXISTS "journal_entries_farm_entry_number_unique"
    ON journal_entries ("farmId", "entry_number");
CREATE UNIQUE INDEX IF NOT EXISTS "financial_transactions_farm_txn_number_unique"
    ON financial_transactions ("farmId", "transaction_number");

-- 2. Idempotency support: fast lookup of postings by business reference.
CREATE INDEX IF NOT EXISTS "financial_transactions_farm_reference_idx"
    ON financial_transactions ("farmId", "reference_type", "reference_id");

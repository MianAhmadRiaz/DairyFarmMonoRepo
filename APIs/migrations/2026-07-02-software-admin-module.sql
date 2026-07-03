-- Software-admin / billing module enhancements — run once against EXISTING DBs.
-- NOTE: the ENUM types (enum_farms_discount_type, enum_farm_subscriptions_*,
-- enum_subscription_plans_pricing_model) are created automatically by
-- sequelize.sync on boot with the updated models. This file only adds the
-- columns, which is idempotent (IF NOT EXISTS). Run the app once (so sync
-- creates the enums) before running this against a DB that lacks them, OR
-- create them manually with the CREATE TYPE statements at the bottom.

-- 1. Subscription plans: per-animal pricing + trial flag.
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS "pricing_model" "enum_subscription_plans_pricing_model" NOT NULL DEFAULT 'flat';
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS "per_animal_rate" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS "is_trial_plan" BOOLEAN NOT NULL DEFAULT false;

-- 2. Farm subscriptions: pricing snapshot + discount + billed animal count.
ALTER TABLE farm_subscriptions ADD COLUMN IF NOT EXISTS "pricing_model" "enum_farm_subscriptions_pricing_model" NOT NULL DEFAULT 'flat';
ALTER TABLE farm_subscriptions ADD COLUMN IF NOT EXISTS "per_animal_rate" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE farm_subscriptions ADD COLUMN IF NOT EXISTS "billed_animal_count" INTEGER;
ALTER TABLE farm_subscriptions ADD COLUMN IF NOT EXISTS "discount_type" "enum_farm_subscriptions_discount_type" NOT NULL DEFAULT 'none';
ALTER TABLE farm_subscriptions ADD COLUMN IF NOT EXISTS "discount_value" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE farm_subscriptions ADD COLUMN IF NOT EXISTS "gross_amount" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- 3. Farms: hard revoke + per-farm discount.
ALTER TABLE farms ADD COLUMN IF NOT EXISTS "is_revoked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE farms ADD COLUMN IF NOT EXISTS "revoked_at" TIMESTAMPTZ;
ALTER TABLE farms ADD COLUMN IF NOT EXISTS "revoke_reason" VARCHAR(255);
ALTER TABLE farms ADD COLUMN IF NOT EXISTS "discount_type" "enum_farms_discount_type" NOT NULL DEFAULT 'none';
ALTER TABLE farms ADD COLUMN IF NOT EXISTS "discount_value" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE farms ADD COLUMN IF NOT EXISTS "discount_note" VARCHAR(255);

-- 4. Users: OTP columns (already added by auth migration; harmless if repeated).
ALTER TABLE users ADD COLUMN IF NOT EXISTS "otp" VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS "otptype" VARCHAR(30);
ALTER TABLE users ADD COLUMN IF NOT EXISTS "otpexpiry" BIGINT;

-- If the enum types do NOT exist yet (fresh DB not yet booted with the new
-- models), uncomment and run these first:
-- CREATE TYPE "enum_subscription_plans_pricing_model" AS ENUM ('flat', 'per_animal');
-- CREATE TYPE "enum_farm_subscriptions_pricing_model" AS ENUM ('flat', 'per_animal');
-- CREATE TYPE "enum_farm_subscriptions_discount_type" AS ENUM ('none', 'percentage', 'flat');
-- CREATE TYPE "enum_farms_discount_type" AS ENUM ('none', 'percentage', 'flat');

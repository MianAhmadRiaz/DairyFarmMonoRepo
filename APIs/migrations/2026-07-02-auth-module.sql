-- Auth module rectification — run once against EXISTING databases.

-- Password-reset OTP was completely stubbed out; these columns back the real
-- OTP verification now enforced in resetPassword.
ALTER TABLE users ADD COLUMN IF NOT EXISTS "otp" VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS "otptype" VARCHAR(30);
ALTER TABLE users ADD COLUMN IF NOT EXISTS "otpexpiry" BIGINT;

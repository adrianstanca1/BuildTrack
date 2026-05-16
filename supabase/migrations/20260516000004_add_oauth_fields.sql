ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS provider TEXT,
ADD COLUMN IF NOT EXISTS provider_id TEXT;

ALTER TABLE companies
ADD COLUMN IF NOT EXISTS company_domain TEXT;

-- Update provider for existing users based on existing auth method if available
-- This is best-effort; app_metadata.provider comes from auth.users which is in auth schema
-- The profile trigger will set these going forward

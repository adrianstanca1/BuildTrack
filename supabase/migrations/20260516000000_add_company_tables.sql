-- ============================================================================
-- Migration: Add company multi-tenancy tables
-- Date: 2026-05-16
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. Enums
-- --------------------------------------------------------------------------
DO $$
BEGIN
  CREATE TYPE company_role AS ENUM ('owner', 'admin', 'manager', 'member');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- --------------------------------------------------------------------------
-- 2. companies
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  vat_number TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
);

-- --------------------------------------------------------------------------
-- 3. company_users
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS company_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role company_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

-- --------------------------------------------------------------------------
-- 4. company_invites
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS company_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  role company_role NOT NULL DEFAULT 'member',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status invite_status NOT NULL DEFAULT 'pending'
);

-- --------------------------------------------------------------------------
-- 5. company_feature_flags
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS company_feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, feature_name)
);

-- --------------------------------------------------------------------------
-- 6. Indexes
-- --------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_companies_owner ON companies(owner_id);

CREATE INDEX IF NOT EXISTS idx_company_users_company ON company_users(company_id);
CREATE INDEX IF NOT EXISTS idx_company_users_user ON company_users(user_id);

CREATE INDEX IF NOT EXISTS idx_company_invites_company ON company_invites(company_id);
CREATE INDEX IF NOT EXISTS idx_company_invites_email ON company_invites(email);
CREATE INDEX IF NOT EXISTS idx_company_invites_code ON company_invites(code);

CREATE INDEX IF NOT EXISTS idx_company_feature_flags_company ON company_feature_flags(company_id);
CREATE INDEX IF NOT EXISTS idx_company_feature_flags_name ON company_feature_flags(feature_name);

-- --------------------------------------------------------------------------
-- 7. Add company_id to existing tables
-- --------------------------------------------------------------------------
ALTER TABLE projects ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL DEFAULT NULL;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_projects_company ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_team_members_company ON team_members(company_id);

-- --------------------------------------------------------------------------
-- 8. Helper: is user a member of a company?
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_company_member(p_company_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM company_users
    WHERE company_id = p_company_id
      AND user_id = auth.uid()
  );
END;
$$;

-- --------------------------------------------------------------------------
-- 9. Update RLS policies for projects
-- --------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

CREATE POLICY "Company members can view projects" ON projects
  FOR SELECT USING (
    (company_id IS NOT NULL AND is_company_member(company_id))
    OR (company_id IS NULL AND user_id = auth.uid())
    OR (company_id IS NULL AND user_id IS NULL)
  );

CREATE POLICY "Company members can insert projects" ON projects
  FOR INSERT WITH CHECK (
    (company_id IS NOT NULL AND is_company_member(company_id))
    OR (company_id IS NULL AND auth.uid() = user_id)
  );

CREATE POLICY "Company members can update projects" ON projects
  FOR UPDATE USING (
    (company_id IS NOT NULL AND is_company_member(company_id))
    OR (company_id IS NULL AND auth.uid() = user_id)
  )
  WITH CHECK (
    (company_id IS NOT NULL AND is_company_member(company_id))
    OR (company_id IS NULL AND auth.uid() = user_id)
  );

CREATE POLICY "Company members can delete projects" ON projects
  FOR DELETE USING (
    (company_id IS NOT NULL AND is_company_member(company_id))
    OR (company_id IS NULL AND auth.uid() = user_id)
  );

-- --------------------------------------------------------------------------
-- 10. Update RLS policies for team_members
-- --------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own team_members" ON team_members;
DROP POLICY IF EXISTS "Users can insert own team_members" ON team_members;
DROP POLICY IF EXISTS "Users can update own team_members" ON team_members;
DROP POLICY IF EXISTS "Users can delete own team_members" ON team_members;

CREATE POLICY "Company members can view team_members" ON team_members
  FOR SELECT USING (
    (company_id IS NOT NULL AND is_company_member(company_id))
    OR (company_id IS NULL AND user_id = auth.uid())
  );

CREATE POLICY "Company members can insert team_members" ON team_members
  FOR INSERT WITH CHECK (
    (company_id IS NOT NULL AND is_company_member(company_id))
    OR (company_id IS NULL AND auth.uid() = user_id)
  );

CREATE POLICY "Company members can update team_members" ON team_members
  FOR UPDATE USING (
    (company_id IS NOT NULL AND is_company_member(company_id))
    OR (company_id IS NULL AND user_id = auth.uid())
  )
  WITH CHECK (
    (company_id IS NOT NULL AND is_company_member(company_id))
    OR (company_id IS NULL AND user_id = auth.uid())
  );

CREATE POLICY "Company members can delete team_members" ON team_members
  FOR DELETE USING (
    (company_id IS NOT NULL AND is_company_member(company_id))
    OR (company_id IS NULL AND user_id = auth.uid())
  );

-- --------------------------------------------------------------------------
-- 11. Enable RLS on new tables
-- --------------------------------------------------------------------------
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_feature_flags ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------------
-- 12. RLS policies for new tables
-- --------------------------------------------------------------------------
CREATE POLICY "Company members and owners can view companies" ON companies
  FOR SELECT USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM company_users WHERE company_users.company_id = companies.id AND company_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Company members can view company_users" ON company_users
  FOR SELECT USING (
    user_id = auth.uid()
    OR is_company_member(company_id)
  );

CREATE POLICY "Invite recipients and owners can view invites" ON company_invites
  FOR SELECT USING (
    email = auth.email()
    OR EXISTS (
      SELECT 1 FROM companies WHERE companies.id = company_invites.company_id AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Company members can view feature flags" ON company_feature_flags
  FOR SELECT USING (
    is_company_member(company_id)
  );

-- --------------------------------------------------------------------------
-- 13. updated_at triggers
-- --------------------------------------------------------------------------
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_users_updated_at BEFORE UPDATE ON company_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

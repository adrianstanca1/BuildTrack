-- ============================================================================
-- Migration: Enhance drawing_pins for company multi-tenancy + status/assignments
-- Date: 2026-05-16
-- ============================================================================

-- 1. Add missing columns to drawing_pins
ALTER TABLE drawing_pins
  ADD COLUMN IF NOT EXISTS label TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','rejected')),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- 2. Ensure created_at is TIMESTAMPTZ for consistency
ALTER TABLE drawing_pins ALTER COLUMN created_at TYPE TIMESTAMPTZ;

-- 3. Drop old single-column index in favor of compound
DROP INDEX IF EXISTS idx_drawing_pins_drawing;
CREATE INDEX IF NOT EXISTS idx_drawing_pins_drawing_status ON drawing_pins(drawing_id, status);

-- 4. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_drawing_pins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_drawing_pins_updated_at ON drawing_pins;
CREATE TRIGGER trg_drawing_pins_updated_at
  BEFORE UPDATE ON drawing_pins
  FOR EACH ROW
  EXECUTE FUNCTION update_drawing_pins_updated_at();

-- 5. Drop legacy RLS policies
DROP POLICY IF EXISTS "Users can view drawing_pins" ON drawing_pins;
DROP POLICY IF EXISTS "Users can insert drawing_pins" ON drawing_pins;
DROP POLICY IF EXISTS "Users can delete drawing_pins" ON drawing_pins;
DROP POLICY IF EXISTS "Company members can view drawing_pins" ON drawing_pins;
DROP POLICY IF EXISTS "Company members can insert drawing_pins" ON drawing_pins;
DROP POLICY IF EXISTS "Company members can update drawing_pins" ON drawing_pins;
DROP POLICY IF EXISTS "Company members can delete drawing_pins" ON drawing_pins;

-- 6. Enable RLS
ALTER TABLE drawing_pins ENABLE ROW LEVEL SECURITY;

-- 7. RLS policies: company membership via drawings -> projects.company_id
CREATE POLICY "Company members can view drawing_pins" ON drawing_pins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM drawings d
      JOIN projects p ON p.id = d.project_id
      WHERE d.id = drawing_pins.drawing_id
        AND is_company_member(p.company_id)
    )
  );

CREATE POLICY "Company members can insert drawing_pins" ON drawing_pins
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM drawings d
      JOIN projects p ON p.id = d.project_id
      WHERE d.id = drawing_pins.drawing_id
        AND is_company_member(p.company_id)
    )
  );

CREATE POLICY "Company members can update drawing_pins" ON drawing_pins
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM drawings d
      JOIN projects p ON p.id = d.project_id
      WHERE d.id = drawing_pins.drawing_id
        AND is_company_member(p.company_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM drawings d
      JOIN projects p ON p.id = d.project_id
      WHERE d.id = drawing_pins.drawing_id
        AND is_company_member(p.company_id)
    )
  );

CREATE POLICY "Company members can delete drawing_pins" ON drawing_pins
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM drawings d
      JOIN projects p ON p.id = d.project_id
      WHERE d.id = drawing_pins.drawing_id
        AND is_company_member(p.company_id)
    )
  );

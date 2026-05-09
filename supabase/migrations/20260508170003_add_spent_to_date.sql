-- ============================================================================
-- BuildTrack: Add spent_to_date to projects
-- ============================================================================

ALTER TABLE projects ADD COLUMN IF NOT EXISTS spent_to_date DECIMAL(12,2) NOT NULL DEFAULT 0;

UPDATE projects SET spent_to_date = 0 WHERE spent_to_date IS NULL;

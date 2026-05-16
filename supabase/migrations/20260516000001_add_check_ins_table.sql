-- BuildTrack Phase 2: Check-ins + Geofencing
-- Adds check_ins table, project geofence radius, indexes, and RLS policies.

-- Add geofence_radius to projects (site_lat / site_lng already exist as latitude / longitude)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS geofence_radius INTEGER NOT NULL DEFAULT 200;

-- check_ins table
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  worker_name TEXT,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  checkInTime TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checkOutTime TIMESTAMPTZ,
  checkInLat DECIMAL(10, 8),
  checkInLng DECIMAL(11, 8),
  checkOutLat DECIMAL(10, 8),
  checkOutLng DECIMAL(11, 8),
  gpsVerified BOOLEAN DEFAULT FALSE,
  distanceFromSite DECIMAL(10, 2),
  durationMinutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_check_ins_project_id ON check_ins(project_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_checkInTime ON check_ins(checkInTime);

-- Enable RLS
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- RLS: users own their rows for all mutations
CREATE POLICY "Users can view own check_ins"
  ON check_ins FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own check_ins"
  ON check_ins FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own check_ins"
  ON check_ins FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own check_ins"
  ON check_ins FOR DELETE
  USING (user_id = auth.uid());

-- RLS: users can also view check-ins for projects they belong to (via team_members)
CREATE POLICY "Users can view project team check_ins"
  ON check_ins FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM team_members WHERE user_id = auth.uid()
    )
  );

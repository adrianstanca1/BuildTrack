-- ============================================================================
-- BuildTrack: Production Schema Enhancements
-- Migration: 20260508170000
-- Adds performance indexes, GIN index, and additional constraints
-- Run AFTER 20260508140000_init_schema.sql
-- ============================================================================

-- --------------------------------------------------------------------------
-- Additional performance indexes (not already in init_schema)
-- --------------------------------------------------------------------------

-- Project status index for dashboard filtering
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Task priority index for triage views
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

-- Combined task status + due_date for overdue detection queries
CREATE INDEX IF NOT EXISTS idx_tasks_status_due_date ON tasks(status, due_date);

-- Incident severity index for safety dashboards
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);

-- Incident date index for timeline views
CREATE INDEX IF NOT EXISTS idx_incidents_date ON incidents(incident_date);

-- Worker role index for team filtering
CREATE INDEX IF NOT EXISTS idx_workers_role ON workers(role);

-- Worker status index for active/off-duty filtering
CREATE INDEX IF NOT EXISTS idx_workers_status ON workers(status);

-- GIN index on worker certifications array for efficient array-contains searches
CREATE INDEX IF NOT EXISTS idx_workers_certifications_gin ON workers USING GIN(certifications);

-- Inspection status index
CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections(status);

-- Inspection date index
CREATE INDEX IF NOT EXISTS idx_inspections_date ON inspections(inspection_date);

-- Notification type index
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Notification user_id + read composite for unread badge count
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);

-- Photos category index
CREATE INDEX IF NOT EXISTS idx_photos_category ON photos(category);

-- Photos created_at for recent-photos queries
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at);

-- --------------------------------------------------------------------------
-- Additional constraints and defaults
-- --------------------------------------------------------------------------

-- Ensure budget is non-negative
ALTER TABLE projects ADD CONSTRAINT chk_budget_non_negative CHECK (budget >= 0);

-- Ensure worker name is not empty
ALTER TABLE workers ADD CONSTRAINT chk_worker_name_not_empty CHECK (length(trim(name)) > 0);

-- Ensure task title is not empty
ALTER TABLE tasks ADD CONSTRAINT chk_task_title_not_empty CHECK (length(trim(title)) > 0);

-- --------------------------------------------------------------------------
-- Composite indexes for common join patterns
-- --------------------------------------------------------------------------

-- Tasks by project + status (common dashboard query)
CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON tasks(project_id, status);

-- Tasks by project + priority
CREATE INDEX IF NOT EXISTS idx_tasks_project_priority ON tasks(project_id, priority);

-- Incidents by project + severity
CREATE INDEX IF NOT EXISTS idx_incidents_project_severity ON incidents(project_id, severity);

-- Inspections by project + status
CREATE INDEX IF NOT EXISTS idx_inspections_project_status ON inspections(project_id, status);

-- Photos by project + category
CREATE INDEX IF NOT EXISTS idx_photos_project_category ON photos(project_id, category);

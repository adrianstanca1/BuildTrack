-- ============================================================================
-- BuildTrack: Database Functions & Triggers
-- Migration: 20260508170002
-- Dashboard aggregation, budget alerts, progress auto-calculation
-- ============================================================================

-- --------------------------------------------------------------------------
-- Add spent column to projects (needed by budget alert trigger)
-- --------------------------------------------------------------------------
ALTER TABLE projects ADD COLUMN IF NOT EXISTS spent DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE projects ADD CONSTRAINT chk_spent_non_negative CHECK (spent >= 0);

-- --------------------------------------------------------------------------
-- 1. get_project_stats(user_uuid UUID)
--    Returns aggregated project statistics for a user
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_project_stats(user_uuid UUID)
RETURNS TABLE (
    active_projects   BIGINT,
    total_budget      NUMERIC,
    avg_progress      NUMERIC,
    total_tasks       BIGINT,
    completed_tasks   BIGINT,
    in_progress_tasks BIGINT,
    pending_tasks     BIGINT,
    overdue_tasks     BIGINT,
    total_workers     BIGINT,
    active_workers    BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        -- Project stats
        (SELECT COUNT(*) FROM projects WHERE user_id = user_uuid AND status = 'active'),
        (SELECT COALESCE(SUM(budget), 0) FROM projects WHERE user_id = user_uuid),
        (SELECT COALESCE(AVG(progress), 0) FROM projects WHERE user_id = user_uuid),
        -- Task stats
        (SELECT COUNT(*) FROM tasks WHERE user_id = user_uuid),
        (SELECT COUNT(*) FROM tasks WHERE user_id = user_uuid AND status = 'completed'),
        (SELECT COUNT(*) FROM tasks WHERE user_id = user_uuid AND status = 'in-progress'),
        (SELECT COUNT(*) FROM tasks WHERE user_id = user_uuid AND status = 'pending'),
        (SELECT COUNT(*) FROM tasks WHERE user_id = user_uuid AND status != 'completed' AND due_date < CURRENT_DATE),
        -- Worker stats
        (SELECT COUNT(*) FROM workers WHERE user_id = user_uuid),
        (SELECT COUNT(*) FROM workers WHERE user_id = user_uuid AND status = 'active');
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION get_project_stats(UUID) TO authenticated;

-- --------------------------------------------------------------------------
-- 2. get_dashboard_data(user_uuid UUID)
--    Returns combined dashboard payload as JSON
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_dashboard_data(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'stats', jsonb_build_object(
            'active_projects',   (SELECT COUNT(*) FROM projects WHERE user_id = user_uuid AND status = 'active'),
            'total_budget',      (SELECT COALESCE(SUM(budget), 0) FROM projects WHERE user_id = user_uuid),
            'avg_progress',      (SELECT COALESCE(AVG(progress), 0) FROM projects WHERE user_id = user_uuid),
            'total_tasks',       (SELECT COUNT(*) FROM tasks WHERE user_id = user_uuid),
            'completed_tasks',   (SELECT COUNT(*) FROM tasks WHERE user_id = user_uuid AND status = 'completed'),
            'in_progress_tasks', (SELECT COUNT(*) FROM tasks WHERE user_id = user_uuid AND status = 'in-progress'),
            'pending_tasks',     (SELECT COUNT(*) FROM tasks WHERE user_id = user_uuid AND status = 'pending'),
            'overdue_tasks',     (SELECT COUNT(*) FROM tasks WHERE user_id = user_uuid AND status != 'completed' AND due_date < CURRENT_DATE),
            'total_workers',     (SELECT COUNT(*) FROM workers WHERE user_id = user_uuid),
            'active_workers',    (SELECT COUNT(*) FROM workers WHERE user_id = user_uuid AND status = 'active')
        ),
        'projects', COALESCE((
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', p.id,
                    'name', p.name,
                    'location', p.location,
                    'description', p.description,
                    'budget', p.budget,
                    'spent', p.spent,
                    'progress', p.progress,
                    'status', p.status,
                    'start_date', p.start_date,
                    'end_date', p.end_date,
                    'team_size', p.team_size,
                    'latitude', p.latitude,
                    'longitude', p.longitude,
                    'task_count', (
                        SELECT COUNT(*)
                        FROM tasks t
                        WHERE t.project_id = p.id
                    ),
                    'completed_task_count', (
                        SELECT COUNT(*)
                        FROM tasks t
                        WHERE t.project_id = p.id AND t.status = 'completed'
                    )
                )
                ORDER BY p.updated_at DESC
            )
            FROM projects p
            WHERE p.user_id = user_uuid
        ), '[]'::jsonb),
        'recent_tasks', COALESCE((
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', t.id,
                    'title', t.title,
                    'project_name', t.project_name,
                    'assigned_to', t.assigned_to,
                    'priority', t.priority,
                    'status', t.status,
                    'due_date', t.due_date,
                    'is_overdue', t.is_overdue
                )
                ORDER BY t.due_date ASC
            )
            FROM tasks t
            WHERE t.user_id = user_uuid AND t.status != 'completed'
            LIMIT 10
        ), '[]'::jsonb),
        'recent_incidents', COALESCE((
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', i.id,
                    'title', i.title,
                    'project_name', i.project_name,
                    'severity', i.severity,
                    'incident_date', i.incident_date,
                    'injuries', i.injuries
                )
                ORDER BY i.incident_date DESC
            )
            FROM incidents i
            WHERE i.user_id = user_uuid
            LIMIT 5
        ), '[]'::jsonb),
        'unread_notifications', (
            SELECT COUNT(*)
            FROM notifications n
            WHERE n.user_id = user_uuid AND n.read = false
        ),
        'recent_notifications', COALESCE((
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', n.id,
                    'title', n.title,
                    'body', n.body,
                    'type', n.type,
                    'read', n.read,
                    'created_at', n.created_at
                )
                ORDER BY n.created_at DESC
            )
            FROM notifications n
            WHERE n.user_id = user_uuid
            LIMIT 10
        ), '[]'::jsonb)
    ) INTO result;

    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_dashboard_data(UUID) TO authenticated;

-- --------------------------------------------------------------------------
-- 3. check_budget_alerts() — trigger function
--    Inserts notification when spent > 90% of budget
--    Fires on INSERT or UPDATE of spent/budget on projects
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_budget_alerts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    usage_pct NUMERIC;
BEGIN
    -- Only check active/planning projects with a positive budget
    IF NEW.budget > 0 AND NEW.status NOT IN ('completed', 'cancelled') THEN
        usage_pct := (NEW.spent / NEW.budget) * 100;

        -- 90% threshold: budget alert
        IF usage_pct >= 90 AND usage_pct < 100 THEN
            -- Don't duplicate alerts — check if we already sent one recently
            IF NOT EXISTS (
                SELECT 1 FROM notifications
                WHERE user_id = NEW.user_id
                  AND type = 'project'
                  AND related_id = NEW.id
                  AND body LIKE '%90%%'
                  AND created_at > NOW() - INTERVAL '24 hours'
            ) THEN
                INSERT INTO notifications (title, body, type, related_id, user_id)
                VALUES (
                    '⚠️ Budget Alert',
                    format('Project "%s" has used 90%% of its budget (£%s of £%s)',
                           NEW.name,
                           trim(to_char(NEW.spent, '999,999,999,990.00')),
                           trim(to_char(NEW.budget, '999,999,999,990.00'))),
                    'project',
                    NEW.id,
                    NEW.user_id
                );
            END IF;
        END IF;

        -- 100% threshold: over-budget alert
        IF usage_pct >= 100 THEN
            IF NOT EXISTS (
                SELECT 1 FROM notifications
                WHERE user_id = NEW.user_id
                  AND type = 'project'
                  AND related_id = NEW.id
                  AND body LIKE '%exceeded%'
                  AND created_at > NOW() - INTERVAL '24 hours'
            ) THEN
                INSERT INTO notifications (title, body, type, related_id, user_id)
                VALUES (
                    '🚨 Budget Exceeded',
                    format('Project "%s" has exceeded its budget! Spent £%s of £%s budget.',
                           NEW.name,
                           trim(to_char(NEW.spent, '999,999,999,990.00')),
                           trim(to_char(NEW.budget, '999,999,999,990.00'))),
                    'project',
                    NEW.id,
                    NEW.user_id
                );
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Attach trigger to projects table
DROP TRIGGER IF EXISTS trg_check_budget_alerts ON projects;
CREATE TRIGGER trg_check_budget_alerts
    AFTER INSERT OR UPDATE OF spent, budget ON projects
    FOR EACH ROW
    EXECUTE FUNCTION check_budget_alerts();

-- --------------------------------------------------------------------------
-- 4. update_project_progress() — trigger function
--    Recalculates project progress from tasks completed/total
--    Fires on INSERT, UPDATE, or DELETE of tasks
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_project_id UUID;
    total_count       BIGINT;
    completed_count   BIGINT;
    new_progress      INTEGER;
BEGIN
    -- Determine which project to recalculate
    IF TG_OP = 'DELETE' THEN
        target_project_id := OLD.project_id;
    ELSE
        target_project_id := NEW.project_id;
    END IF;

    -- Exit if no project association
    IF target_project_id IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    -- Count tasks for this project
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
    INTO total_count, completed_count
    FROM tasks
    WHERE project_id = target_project_id;

    -- Calculate new progress percentage
    IF total_count = 0 THEN
        new_progress := 0;
    ELSE
        new_progress := (completed_count::NUMERIC / total_count::NUMERIC * 100)::INTEGER;
    END IF;

    -- Update the project's progress
    UPDATE projects
    SET progress = new_progress,
        updated_at = NOW()
    WHERE id = target_project_id
      AND progress != new_progress;  -- Only update if changed (avoids infinite loops)

    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Attach triggers to tasks table
DROP TRIGGER IF EXISTS trg_update_project_progress_insert ON tasks;
CREATE TRIGGER trg_update_project_progress_insert
    AFTER INSERT ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_project_progress();

DROP TRIGGER IF EXISTS trg_update_project_progress_update ON tasks;
CREATE TRIGGER trg_update_project_progress_update
    AFTER UPDATE OF status ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_project_progress();

DROP TRIGGER IF EXISTS trg_update_project_progress_delete ON tasks;
CREATE TRIGGER trg_update_project_progress_delete
    AFTER DELETE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_project_progress();

-- --------------------------------------------------------------------------
-- Helper: update_overdue_tasks() — trigger to mark overdue tasks
-- Fires on INSERT/UPDATE of tasks, and daily via cron if desired
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_overdue_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.is_overdue := (NEW.status != 'completed' AND NEW.due_date < CURRENT_DATE);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_overdue ON tasks;
CREATE TRIGGER trg_set_overdue
    BEFORE INSERT OR UPDATE OF status, due_date ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_overdue_tasks();

-- --------------------------------------------------------------------------
-- Helper: auto-set project_name from projects table on task/incident/inspection insert
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_project_name()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.project_id IS NOT NULL AND NEW.project_name IS NULL THEN
        SELECT name INTO NEW.project_name FROM projects WHERE id = NEW.project_id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_task_project_name ON tasks;
CREATE TRIGGER trg_set_task_project_name
    BEFORE INSERT ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION set_project_name();

DROP TRIGGER IF EXISTS trg_set_incident_project_name ON incidents;
CREATE TRIGGER trg_set_incident_project_name
    BEFORE INSERT ON incidents
    FOR EACH ROW
    EXECUTE FUNCTION set_project_name();

DROP TRIGGER IF EXISTS trg_set_inspection_project_name ON inspections;
CREATE TRIGGER trg_set_inspection_project_name
    BEFORE INSERT ON inspections
    FOR EACH ROW
    EXECUTE FUNCTION set_project_name();

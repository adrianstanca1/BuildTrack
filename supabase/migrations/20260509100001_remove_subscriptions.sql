-- ============================================================================
-- BuildTrack: Remove subscriptions — all users free with full access
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. Drop billing tables
-- --------------------------------------------------------------------------
DROP TABLE IF EXISTS billing_events;
DROP TABLE IF EXISTS subscription_items;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS tier_limits;

-- --------------------------------------------------------------------------
-- 2. Remove subscription columns from profiles
-- --------------------------------------------------------------------------
ALTER TABLE profiles
    DROP COLUMN IF EXISTS stripe_customer_id,
    DROP COLUMN IF EXISTS subscription_tier,
    DROP COLUMN IF EXISTS subscription_status;

-- --------------------------------------------------------------------------
-- 3. Update get_user_subscription — always return unlimited free access
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_user_subscription(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN jsonb_build_object(
        'subscription', jsonb_build_object(
            'id', user_uuid,
            'user_id', user_uuid,
            'tier', 'free',
            'status', 'active',
            'current_period_start', NOW(),
            'current_period_end', NOW() + INTERVAL '100 years'
        ),
        'limits', jsonb_build_object(
            'tier', 'free',
            'max_projects', 999999,
            'max_team_members', 999999,
            'max_storage_gb', 999999,
            'has_advanced_reports', true,
            'has_audit_logs', true,
            'has_priority_support', true,
            'price_monthly_gbp', 0
        )
    );
END;
$$;

-- --------------------------------------------------------------------------
-- 4. Update get_admin_stats — remove revenue_mrr
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_users', (SELECT COUNT(*) FROM profiles),
        'active_users', (SELECT COUNT(*) FROM profiles WHERE role IN ('user', 'admin', 'super_admin')),
        'total_projects', (SELECT COUNT(*) FROM projects),
        'active_projects', (SELECT COUNT(*) FROM projects WHERE status = 'active'),
        'total_tasks', (SELECT COUNT(*) FROM tasks),
        'completed_tasks', (SELECT COUNT(*) FROM tasks WHERE status = 'completed'),
        'total_incidents', (SELECT COUNT(*) FROM incidents),
        'total_workers', (SELECT COUNT(*) FROM workers)
    ) INTO result;

    RETURN result;
END;
$$;

-- --------------------------------------------------------------------------
-- 5. Remove RLS policies for dropped tables (no-op if already dropped)
-- --------------------------------------------------------------------------
-- Tables were dropped above, so their RLS policies are gone automatically.

-- --------------------------------------------------------------------------
-- 6. Update upsert_billing_event — make it a no-op
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION upsert_billing_event(
    p_stripe_event_id TEXT,
    p_event_type TEXT,
    p_payload JSONB,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN NULL;
END;
$$;

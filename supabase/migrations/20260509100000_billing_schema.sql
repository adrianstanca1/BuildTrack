-- ============================================================================
-- BuildTrack: Billing & Subscription Schema
-- Migration: 20260509100000
-- Adds subscription management, billing events, and profile extensions
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. Extend profiles table with billing fields
-- --------------------------------------------------------------------------
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
    ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'free'
        CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'inactive'
        CHECK (subscription_status IN ('active', 'inactive', 'past_due', 'cancelled', 'trialing')),
    ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
        CHECK (role IN ('user', 'admin', 'super_admin'));

-- Index for Stripe customer lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);

-- --------------------------------------------------------------------------
-- 2. subscriptions table
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    tier TEXT NOT NULL DEFAULT 'free'
        CHECK (tier IN ('free', 'pro', 'enterprise')),
    status TEXT NOT NULL DEFAULT 'inactive'
        CHECK (status IN ('active', 'inactive', 'past_due', 'cancelled', 'trialing')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- --------------------------------------------------------------------------
-- 3. subscription_items table (line items for a subscription)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscription_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    stripe_price_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_items_subscription_id ON subscription_items(subscription_id);

-- --------------------------------------------------------------------------
-- 4. billing_events table (idempotent audit trail for Stripe webhooks)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS billing_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    stripe_event_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_events_stripe_event_id ON billing_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_user_id ON billing_events(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_event_type ON billing_events(event_type);

-- Unique constraint to prevent duplicate event processing
CREATE UNIQUE INDEX IF NOT EXISTS idx_billing_events_unique_stripe_event
    ON billing_events(stripe_event_id, event_type);

-- --------------------------------------------------------------------------
-- 5. Triggers
-- --------------------------------------------------------------------------
CREATE TRIGGER IF NOT EXISTS update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_subscription_items_updated_at
    BEFORE UPDATE ON subscription_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------------
-- 6. Helper: tier_limits lookup (immutable reference table)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tier_limits (
    tier TEXT PRIMARY KEY CHECK (tier IN ('free', 'pro', 'enterprise')),
    max_projects INTEGER NOT NULL DEFAULT 1,
    max_team_members INTEGER NOT NULL DEFAULT 3,
    max_storage_gb INTEGER NOT NULL DEFAULT 1,
    has_advanced_reports BOOLEAN NOT NULL DEFAULT FALSE,
    has_audit_logs BOOLEAN NOT NULL DEFAULT FALSE,
    has_priority_support BOOLEAN NOT NULL DEFAULT FALSE,
    price_monthly_gbp DECIMAL(8,2) NOT NULL DEFAULT 0
);

INSERT INTO tier_limits (tier, max_projects, max_team_members, max_storage_gb, has_advanced_reports, has_audit_logs, has_priority_support, price_monthly_gbp)
VALUES
    ('free', 1, 3, 1, FALSE, FALSE, FALSE, 0),
    ('pro', 10, 15, 10, TRUE, FALSE, TRUE, 29),
    ('enterprise', 999999, 999999, 100, TRUE, TRUE, TRUE, 99)
ON CONFLICT (tier) DO UPDATE SET
    max_projects = EXCLUDED.max_projects,
    max_team_members = EXCLUDED.max_team_members,
    max_storage_gb = EXCLUDED.max_storage_gb,
    has_advanced_reports = EXCLUDED.has_advanced_reports,
    has_audit_logs = EXCLUDED.has_audit_logs,
    has_priority_support = EXCLUDED.has_priority_support,
    price_monthly_gbp = EXCLUDED.price_monthly_gbp;

-- --------------------------------------------------------------------------
-- 7. RLS Policies for billing tables
-- --------------------------------------------------------------------------
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_limits ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscription
CREATE POLICY "Users can read own subscription"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Users can read their own subscription items
CREATE POLICY "Users can read own subscription items"
    ON subscription_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM subscriptions s
        WHERE s.id = subscription_items.subscription_id AND s.user_id = auth.uid()
    ));

-- Users can read their own billing events
CREATE POLICY "Users can read own billing events"
    ON billing_events FOR SELECT
    USING (auth.uid() = user_id);

-- Admin/super_admin can read all subscriptions
CREATE POLICY "Admins can read all subscriptions"
    ON subscriptions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    ));

CREATE POLICY "Admins can read all subscription items"
    ON subscription_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    ));

CREATE POLICY "Admins can read all billing events"
    ON billing_events FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    ));

-- tier_limits is public read
CREATE POLICY "Tier limits are publicly readable"
    ON tier_limits FOR SELECT
    USING (true);

-- --------------------------------------------------------------------------
-- 8. Database Functions
-- --------------------------------------------------------------------------

-- get_user_subscription(user_uuid) → subscription row + limits
CREATE OR REPLACE FUNCTION get_user_subscription(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'subscription', COALESCE(to_jsonb(s), '{}'::jsonb),
        'limits', COALESCE(to_jsonb(l), '{}'::jsonb)
    )
    INTO result
    FROM profiles p
    LEFT JOIN subscriptions s ON s.user_id = p.id AND s.status = 'active'
    LEFT JOIN tier_limits l ON l.tier = COALESCE(s.tier, p.subscription_tier)
    WHERE p.id = user_uuid;

    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_subscription(UUID) TO authenticated;

-- get_admin_stats() → global admin statistics
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
        'active_users', (SELECT COUNT(*) FROM profiles WHERE subscription_status = 'active'),
        'total_projects', (SELECT COUNT(*) FROM projects),
        'active_projects', (SELECT COUNT(*) FROM projects WHERE status = 'active'),
        'total_tasks', (SELECT COUNT(*) FROM tasks),
        'completed_tasks', (SELECT COUNT(*) FROM tasks WHERE status = 'completed'),
        'total_incidents', (SELECT COUNT(*) FROM incidents),
        'total_workers', (SELECT COUNT(*) FROM workers),
        'revenue_mrr', (SELECT COALESCE(SUM(tl.price_monthly_gbp), 0)
                        FROM profiles p
                        JOIN tier_limits tl ON tl.tier = p.subscription_tier
                        WHERE p.subscription_status = 'active')
    ) INTO result;

    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_stats() TO authenticated;

-- upsert_billing_event — idempotent webhook handler helper
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
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO billing_events (stripe_event_id, event_type, payload, user_id)
    VALUES (p_stripe_event_id, p_event_type, p_payload, p_user_id)
    ON CONFLICT (stripe_event_id, event_type) DO NOTHING
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION upsert_billing_event(TEXT, TEXT, JSONB, UUID) TO authenticated;

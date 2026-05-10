-- ============================================================================
-- BuildTrack: Materials & Change Orders Tables
-- Migration: 20260510120000
-- Creates materials and change_orders tables with RLS policies
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. materials table
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'other'
        CHECK (category IN ('concrete', 'steel', 'timber', 'brick', 'block', 'insulation', 'roofing', 'electrical', 'plumbing', 'paint', 'hardware', 'aggregate', 'other')),
    unit TEXT NOT NULL DEFAULT 'ea',
    unit_cost NUMERIC(12,2) DEFAULT 0,
    quantity_on_hand NUMERIC(12,2) DEFAULT 0,
    quantity_ordered NUMERIC(12,2) DEFAULT 0,
    reorder_level NUMERIC(12,2) DEFAULT 0,
    reorder_quantity NUMERIC(12,2) DEFAULT 0,
    supplier_name TEXT,
    location TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_materials_project_id ON materials(project_id);
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_name ON materials USING gin(to_tsvector('english', name));

-- --------------------------------------------------------------------------
-- 2. change_orders table
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS change_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    project_name TEXT,
    co_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    reason TEXT,
    type TEXT NOT NULL DEFAULT 'scope'
        CHECK (type IN ('scope', 'price', 'time', 'design', 'other')),
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn')),
    requested_by TEXT,
    requested_by_id UUID,
    requested_date DATE,
    original_cost NUMERIC(12,2),
    proposed_cost NUMERIC(12,2),
    original_schedule_days INTEGER,
    proposed_schedule_days INTEGER,
    impact_cost NUMERIC(12,2) GENERATED ALWAYS AS (COALESCE(proposed_cost, 0) - COALESCE(original_cost, 0)) STORED,
    impact_days INTEGER GENERATED ALWAYS AS (COALESCE(proposed_schedule_days, 0) - COALESCE(original_schedule_days, 0)) STORED,
    reviewed_by TEXT,
    reviewed_by_id UUID,
    reviewed_date DATE,
    approved_by TEXT,
    approved_by_id UUID,
    approved_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_change_orders_project_id ON change_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_change_orders_status ON change_orders(status);
CREATE INDEX IF NOT EXISTS idx_change_orders_type ON change_orders(type);
CREATE INDEX IF NOT EXISTS idx_change_orders_co_number ON change_orders(co_number);

-- --------------------------------------------------------------------------
-- 3. RLS Policies for materials
-- --------------------------------------------------------------------------
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own materials"
    ON materials FOR SELECT
    USING (
        project_id IS NULL
        OR EXISTS (
            SELECT 1 FROM projects WHERE projects.id = materials.project_id AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own materials"
    ON materials FOR INSERT
    WITH CHECK (
        project_id IS NULL
        OR EXISTS (
            SELECT 1 FROM projects WHERE projects.id = materials.project_id AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own materials"
    ON materials FOR UPDATE
    USING (
        project_id IS NULL
        OR EXISTS (
            SELECT 1 FROM projects WHERE projects.id = materials.project_id AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own materials"
    ON materials FOR DELETE
    USING (
        project_id IS NULL
        OR EXISTS (
            SELECT 1 FROM projects WHERE projects.id = materials.project_id AND projects.user_id = auth.uid()
        )
    );

-- --------------------------------------------------------------------------
-- 4. RLS Policies for change_orders
-- --------------------------------------------------------------------------
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own change_orders"
    ON change_orders FOR SELECT
    USING (
        project_id IS NULL
        OR EXISTS (
            SELECT 1 FROM projects WHERE projects.id = change_orders.project_id AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own change_orders"
    ON change_orders FOR INSERT
    WITH CHECK (
        project_id IS NULL
        OR EXISTS (
            SELECT 1 FROM projects WHERE projects.id = change_orders.project_id AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own change_orders"
    ON change_orders FOR UPDATE
    USING (
        project_id IS NULL
        OR EXISTS (
            SELECT 1 FROM projects WHERE projects.id = change_orders.project_id AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own change_orders"
    ON change_orders FOR DELETE
    USING (
        project_id IS NULL
        OR EXISTS (
            SELECT 1 FROM projects WHERE projects.id = change_orders.project_id AND projects.user_id = auth.uid()
        )
    );

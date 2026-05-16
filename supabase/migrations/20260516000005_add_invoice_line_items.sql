-- ============================================================================
-- Migration: Add invoice line items + CIS support
-- Date: 2026-05-16
-- ============================================================================

-- 1. Expand invoices status constraint to include app-supported statuses
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE invoices ADD CONSTRAINT invoices_status_check CHECK (status IN ('draft', 'submitted', 'approved', 'sent', 'paid', 'overdue', 'cancelled'));

-- 2. Add missing columns to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS project_name TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS vendor TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS issue_date DATE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_date DATE;

-- 3. Indexes on invoices
CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
-- idx_invoices_status and idx_invoices_project already exist from 20260510000000

-- 4. Update invoice_line_items to support VAT/CIS
ALTER TABLE invoice_line_items RENAME COLUMN IF EXISTS description TO item_description;
ALTER TABLE invoice_line_items ADD COLUMN IF NOT EXISTS vat_rate DECIMAL(5,2) DEFAULT 20;
ALTER TABLE invoice_line_items ADD COLUMN IF NOT EXISTS cis_rate DECIMAL(5,2) DEFAULT 20;
ALTER TABLE invoice_line_items ADD COLUMN IF NOT EXISTS cis_deduction DECIMAL(15,2) DEFAULT 0;
ALTER TABLE invoice_line_items ADD COLUMN IF NOT EXISTS amount DECIMAL(15,2) DEFAULT 0;
-- Backfill amount from total where available
UPDATE invoice_line_items SET amount = total WHERE amount = 0 AND total IS NOT NULL;

-- 5. Create invoice_cis_summary
CREATE TABLE IF NOT EXISTS invoice_cis_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  gross_amount DECIMAL(15,2) DEFAULT 0,
  cis_deduction DECIMAL(15,2) DEFAULT 0,
  net_amount DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_cis_summary_invoice ON invoice_cis_summary(invoice_id);

-- 6. Enable RLS on new table
ALTER TABLE invoice_cis_summary ENABLE ROW LEVEL SECURITY;

-- 7. Drop old invoice/line_item policies and recreate with company-aware checks
DROP POLICY IF EXISTS "Users can view project invoices" ON invoices;
DROP POLICY IF EXISTS "Users can insert project invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update project invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete project invoices" ON invoices;

DROP POLICY IF EXISTS "Users can view invoice_line_items" ON invoice_line_items;
DROP POLICY IF EXISTS "Users can insert invoice_line_items" ON invoice_line_items;
DROP POLICY IF EXISTS "Users can delete invoice_line_items" ON invoice_line_items;

-- Invoices: company membership via company_id or project ownership fallback
CREATE POLICY "Company members can view invoices" ON invoices
  FOR SELECT USING (
    (company_id IS NOT NULL AND is_company_member(company_id))
    OR (company_id IS NULL AND (SELECT user_id FROM projects WHERE id = project_id) = auth.uid())
  );

CREATE POLICY "Company members can insert invoices" ON invoices
  FOR INSERT WITH CHECK (
    (company_id IS NOT NULL AND is_company_member(company_id))
    OR (company_id IS NULL AND auth.uid() = (SELECT user_id FROM projects WHERE id = project_id))
  );

CREATE POLICY "Company members can update invoices" ON invoices
  FOR UPDATE USING (
    (company_id IS NOT NULL AND is_company_member(company_id))
    OR (company_id IS NULL AND (SELECT user_id FROM projects WHERE id = project_id) = auth.uid())
  )
  WITH CHECK (
    (company_id IS NOT NULL AND is_company_member(company_id))
    OR (company_id IS NULL AND auth.uid() = (SELECT user_id FROM projects WHERE id = project_id))
  );

CREATE POLICY "Company members can delete invoices" ON invoices
  FOR DELETE USING (
    (company_id IS NOT NULL AND is_company_member(company_id))
    OR (company_id IS NULL AND (SELECT user_id FROM projects WHERE id = project_id) = auth.uid())
  );

-- Line items: via invoice → project (company-aware)
CREATE POLICY "Company members can view invoice_line_items" ON invoice_line_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_line_items.invoice_id
        AND (
          (i.company_id IS NOT NULL AND is_company_member(i.company_id))
          OR (i.company_id IS NULL AND (SELECT user_id FROM projects WHERE id = i.project_id) = auth.uid())
        )
    )
  );

CREATE POLICY "Company members can insert invoice_line_items" ON invoice_line_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_line_items.invoice_id
        AND (
          (i.company_id IS NOT NULL AND is_company_member(i.company_id))
          OR (i.company_id IS NULL AND (SELECT user_id FROM projects WHERE id = i.project_id) = auth.uid())
        )
    )
  );

CREATE POLICY "Company members can update invoice_line_items" ON invoice_line_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_line_items.invoice_id
        AND (
          (i.company_id IS NOT NULL AND is_company_member(i.company_id))
          OR (i.company_id IS NULL AND (SELECT user_id FROM projects WHERE id = i.project_id) = auth.uid())
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_line_items.invoice_id
        AND (
          (i.company_id IS NOT NULL AND is_company_member(i.company_id))
          OR (i.company_id IS NULL AND (SELECT user_id FROM projects WHERE id = i.project_id) = auth.uid())
        )
    )
  );

CREATE POLICY "Company members can delete invoice_line_items" ON invoice_line_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_line_items.invoice_id
        AND (
          (i.company_id IS NOT NULL AND is_company_member(i.company_id))
          OR (i.company_id IS NULL AND (SELECT user_id FROM projects WHERE id = i.project_id) = auth.uid())
        )
    )
  );

-- CIS summary policies
CREATE POLICY "Company members can view invoice_cis_summary" ON invoice_cis_summary
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_cis_summary.invoice_id
        AND (
          (i.company_id IS NOT NULL AND is_company_member(i.company_id))
          OR (i.company_id IS NULL AND (SELECT user_id FROM projects WHERE id = i.project_id) = auth.uid())
        )
    )
  );

CREATE POLICY "Company members can insert invoice_cis_summary" ON invoice_cis_summary
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_cis_summary.invoice_id
        AND (
          (i.company_id IS NOT NULL AND is_company_member(i.company_id))
          OR (i.company_id IS NULL AND (SELECT user_id FROM projects WHERE id = i.project_id) = auth.uid())
        )
    )
  );

CREATE POLICY "Company members can update invoice_cis_summary" ON invoice_cis_summary
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_cis_summary.invoice_id
        AND (
          (i.company_id IS NOT NULL AND is_company_member(i.company_id))
          OR (i.company_id IS NULL AND (SELECT user_id FROM projects WHERE id = i.project_id) = auth.uid())
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_cis_summary.invoice_id
        AND (
          (i.company_id IS NOT NULL AND is_company_member(i.company_id))
          OR (i.company_id IS NULL AND (SELECT user_id FROM projects WHERE id = i.project_id) = auth.uid())
        )
    )
  );

CREATE POLICY "Company members can delete invoice_cis_summary" ON invoice_cis_summary
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_cis_summary.invoice_id
        AND (
          (i.company_id IS NOT NULL AND is_company_member(i.company_id))
          OR (i.company_id IS NULL AND (SELECT user_id FROM projects WHERE id = i.project_id) = auth.uid())
        )
    )
  );

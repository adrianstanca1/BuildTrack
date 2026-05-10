-- =========================================================================
-- Migration: Add RLS policies for integration tables
-- Date: 2026-05-10
-- =========================================================================

-- Helper function: get current user_id from auth context
CREATE OR REPLACE FUNCTION public.get_auth_user_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN auth.uid();
END;
$$;

-- =========================================================================
-- team_members (has user_id column — direct ownership)
-- =========================================================================
CREATE POLICY "Users can view own team_members"
  ON team_members FOR SELECT
  USING (user_id = get_auth_user_id());

CREATE POLICY "Users can insert own team_members"
  ON team_members FOR INSERT
  WITH CHECK (user_id = get_auth_user_id());

CREATE POLICY "Users can update own team_members"
  ON team_members FOR UPDATE
  USING (user_id = get_auth_user_id())
  WITH CHECK (user_id = get_auth_user_id());

CREATE POLICY "Users can delete own team_members"
  ON team_members FOR DELETE
  USING (user_id = get_auth_user_id());

-- =========================================================================
-- daily_reports (project_id → projects.user_id indirect ownership)
-- =========================================================================
CREATE POLICY "Users can view project daily_reports"
  ON daily_reports FOR SELECT
  USING ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id());

CREATE POLICY "Users can insert project daily_reports"
  ON daily_reports FOR INSERT
  WITH CHECK ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id());

CREATE POLICY "Users can update project daily_reports"
  ON daily_reports FOR UPDATE
  USING ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id())
  WITH CHECK ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id());

CREATE POLICY "Users can delete project daily_reports"
  ON daily_reports FOR DELETE
  USING ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id());

-- =========================================================================
-- defects (project_id → projects.user_id indirect ownership)
-- =========================================================================
CREATE POLICY "Users can view project defects"
  ON defects FOR SELECT
  USING ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id());

CREATE POLICY "Users can insert project defects"
  ON defects FOR INSERT
  WITH CHECK ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id());

CREATE POLICY "Users can update project defects"
  ON defects FOR UPDATE
  USING ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id())
  WITH CHECK ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id());

CREATE POLICY "Users can delete project defects"
  ON defects FOR DELETE
  USING ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id());

-- =========================================================================
-- permits (project_id → projects.user_id indirect ownership)
-- =========================================================================
CREATE POLICY "Users can view project permits"
  ON permits FOR SELECT
  USING ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id());

CREATE POLICY "Users can insert project permits"
  ON permits FOR INSERT
  WITH CHECK ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id());

CREATE POLICY "Users can update project permits"
  ON permits FOR UPDATE
  USING ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id())
  WITH CHECK ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id());

CREATE POLICY "Users can delete project permits"
  ON permits FOR DELETE
  USING ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id());

-- =========================================================================
-- timesheets (project_id → projects.user_id indirect ownership)
-- =========================================================================
CREATE POLICY "Users can view project timesheets"
  ON timesheets FOR SELECT
  USING ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id());

CREATE POLICY "Users can insert project timesheets"
  ON timesheets FOR INSERT
  WITH CHECK ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id());

CREATE POLICY "Users can update project timesheets"
  ON timesheets FOR UPDATE
  USING ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id())
  WITH CHECK ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id());

CREATE POLICY "Users can delete project timesheets"
  ON timesheets FOR DELETE
  USING ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id());

-- =========================================================================
-- rfis (project_id → projects.user_id indirect ownership)
-- =========================================================================
CREATE POLICY "Users can view project rfis"
  ON rfis FOR SELECT
  USING ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id());

CREATE POLICY "Users can insert project rfis"
  ON rfis FOR INSERT
  WITH CHECK ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id());

CREATE POLICY "Users can update project rfis"
  ON rfis FOR UPDATE
  USING ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id())
  WITH CHECK ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id());

CREATE POLICY "Users can delete project rfis"
  ON rfis FOR DELETE
  USING ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id());

-- =========================================================================
-- rfi_comments (rfi_id → rfis → projects indirect ownership)
-- =========================================================================
CREATE POLICY "Users can view rfi_comments"
  ON rfi_comments FOR SELECT
  USING ((SELECT user_id FROM projects WHERE id = (SELECT project_id FROM rfis WHERE id = rfi_id)) = get_auth_user_id());

CREATE POLICY "Users can insert rfi_comments"
  ON rfi_comments FOR INSERT
  WITH CHECK ((SELECT user_id FROM projects WHERE id = (SELECT project_id FROM rfis WHERE id = rfi_id)) = get_auth_user_id());

CREATE POLICY "Users can delete rfi_comments"
  ON rfi_comments FOR DELETE
  USING ((SELECT user_id FROM projects WHERE id = (SELECT project_id FROM rfis WHERE id = rfi_id)) = get_auth_user_id());

-- =========================================================================
-- drawings (project_id → projects.user_id indirect ownership)
-- =========================================================================
CREATE POLICY "Users can view project drawings"
  ON drawings FOR SELECT
  USING ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id());

CREATE POLICY "Users can insert project drawings"
  ON drawings FOR INSERT
  WITH CHECK ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id());

CREATE POLICY "Users can update project drawings"
  ON drawings FOR UPDATE
  USING ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id())
  WITH CHECK ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id());

CREATE POLICY "Users can delete project drawings"
  ON drawings FOR DELETE
  USING ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id());

-- =========================================================================
-- drawing_pins (drawing_id → drawings → projects indirect ownership)
-- =========================================================================
CREATE POLICY "Users can view drawing_pins"
  ON drawing_pins FOR SELECT
  USING ((SELECT user_id FROM projects WHERE id = (SELECT project_id FROM drawings WHERE id = drawing_id)) = get_auth_user_id());

CREATE POLICY "Users can insert drawing_pins"
  ON drawing_pins FOR INSERT
  WITH CHECK ((SELECT user_id FROM projects WHERE id = (SELECT project_id FROM drawings WHERE id = drawing_id)) = get_auth_user_id());

CREATE POLICY "Users can delete drawing_pins"
  ON drawing_pins FOR DELETE
  USING ((SELECT user_id FROM projects WHERE id = (SELECT project_id FROM drawings WHERE id = drawing_id)) = get_auth_user_id());

-- =========================================================================
-- invoices (project_id → projects.user_id indirect ownership)
-- =========================================================================
CREATE POLICY "Users can view project invoices"
  ON invoices FOR SELECT
  USING ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id());

CREATE POLICY "Users can insert project invoices"
  ON invoices FOR INSERT
  WITH CHECK ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id());

CREATE POLICY "Users can update project invoices"
  ON invoices FOR UPDATE
  USING ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id())
  WITH CHECK ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id());

CREATE POLICY "Users can delete project invoices"
  ON invoices FOR DELETE
  USING ((SELECT user_id FROM projects WHERE id = project_id) = get_auth_user_id());

-- =========================================================================
-- invoice_line_items (invoice_id → invoices → projects indirect ownership)
-- =========================================================================
CREATE POLICY "Users can view invoice_line_items"
  ON invoice_line_items FOR SELECT
  USING ((SELECT user_id FROM projects WHERE id = (SELECT project_id FROM invoices WHERE id = invoice_id)) = get_auth_user_id());

CREATE POLICY "Users can insert invoice_line_items"
  ON invoice_line_items FOR INSERT
  WITH CHECK ((SELECT user_id FROM projects WHERE id = (SELECT project_id FROM invoices WHERE id = invoice_id)) = get_auth_user_id());

CREATE POLICY "Users can delete invoice_line_items"
  ON invoice_line_items FOR DELETE
  USING ((SELECT user_id FROM projects WHERE id = (SELECT project_id FROM invoices WHERE id = invoice_id)) = get_auth_user_id());

-- =========================================================================
-- audit_logs (view only, no insert/update/delete from client)
-- =========================================================================
CREATE POLICY "Users can view own audit_logs"
  ON audit_logs FOR SELECT
  USING (user_id = get_auth_user_id());

-- Fix RLS for local dev: seeded data (user_id = NULL) visible alongside user-owned rows

-- Projects
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Tasks
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
CREATE POLICY "Users can view own tasks" ON tasks
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Workers
DROP POLICY IF EXISTS "Users can view own workers" ON workers;
CREATE POLICY "Users can view own workers" ON workers
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Photos
DROP POLICY IF EXISTS "Users can view own photos" ON photos;
CREATE POLICY "Users can view own photos" ON photos
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Incidents
DROP POLICY IF EXISTS "Users can view own incidents" ON incidents;
CREATE POLICY "Users can view own incidents" ON incidents
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Inspections
DROP POLICY IF EXISTS "Users can view own inspections" ON inspections;
CREATE POLICY "Users can view own inspections" ON inspections
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Drawings (no user_id column, open to authenticated users)
ALTER TABLE IF EXISTS drawings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own drawings" ON drawings;
CREATE POLICY "Users can view own drawings" ON drawings
    FOR SELECT USING (EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid()));

-- Documents (no user_id column, open to authenticated users)
ALTER TABLE IF EXISTS documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own documents" ON documents;
CREATE POLICY "Users can view own documents" ON documents
    FOR SELECT USING (EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid()));

-- BuildTrack Database Schema
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    budget DECIMAL(12,2) NOT NULL DEFAULT 0,
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on-hold', 'completed', 'cancelled')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    team_size INTEGER NOT NULL DEFAULT 0,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tasks table
CREATE TABLE tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    project_name TEXT,
    assigned_to TEXT,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
    due_date DATE NOT NULL,
    completed_at TIMESTAMPTZ,
    is_overdue BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Safety incidents table
CREATE TABLE incidents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    project_name TEXT,
    description TEXT,
    severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    incident_date DATE NOT NULL,
    injuries INTEGER NOT NULL DEFAULT 0,
    witnesses TEXT[],
    reported_by TEXT,
    photos TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Inspections table
CREATE TABLE inspections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    project_name TEXT,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'failed')),
    inspection_date DATE NOT NULL,
    inspector TEXT,
    findings TEXT[],
    photos TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Workers table
CREATE TABLE workers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('foreman', 'electrician', 'plumber', 'carpenter', 'mason', 'laborer', 'engineer', 'safety-officer')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'off-duty', 'on-leave')),
    phone TEXT,
    email TEXT,
    weekly_hours INTEGER NOT NULL DEFAULT 40,
    certifications TEXT[],
    project_assignments UUID[],
    hourly_rate DECIMAL(8,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Photos table (for site documentation)
CREATE TABLE photos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    inspection_id UUID REFERENCES inspections(id) ON DELETE SET NULL,
    url TEXT NOT NULL,
    caption TEXT,
    category TEXT DEFAULT 'general' CHECK (category IN ('general', 'site', 'incident', 'inspection', 'progress')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT,
    type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'task', 'safety', 'project', 'team')),
    related_id UUID,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON inspections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON workers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_incidents_user_id ON incidents(user_id);
CREATE INDEX idx_incidents_project_id ON incidents(project_id);
CREATE INDEX idx_inspections_user_id ON inspections(user_id);
CREATE INDEX idx_inspections_project_id ON inspections(project_id);
CREATE INDEX idx_workers_user_id ON workers(user_id);
CREATE INDEX idx_photos_project_id ON photos(project_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Insert demo data
INSERT INTO projects (id, name, location, description, budget, progress, status, start_date, end_date, team_size, latitude, longitude) VALUES
('11111111-1111-1111-1111-111111111111', 'Skyline Tower', 'Downtown Business District', '42-storey commercial office tower with retail podium', 8500000, 35, 'active', '2026-01-15', '2027-12-30', 45, 40.7128, -74.0060),
('22222222-2222-2222-2222-222222222222', 'Riverside Apartments', 'Westside Waterfront', '120-unit residential apartment complex with underground parking', 4200000, 65, 'active', '2025-08-01', '2026-11-30', 28, 40.7580, -73.9855),
('33333333-3333-3333-3333-333333333333', 'Community Center', 'Northside Park', 'Multi-purpose community center with gymnasium and swimming pool', 1800000, 90, 'completed', '2025-03-01', '2026-04-15', 15, 40.7282, -73.7949);

INSERT INTO tasks (id, title, description, project_id, project_name, assigned_to, priority, status, due_date, is_overdue) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Foundation concrete pour', 'Pour concrete for main building foundation - Section A', '11111111-1111-1111-1111-111111111111', 'Skyline Tower', 'John Martinez', 'urgent', 'in-progress', '2026-05-10', FALSE),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Electrical rough-in', 'Install electrical conduits and boxes in residential units', '22222222-2222-2222-2222-222222222222', 'Riverside Apartments', 'Sarah Chen', 'high', 'pending', '2026-05-12', FALSE),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Plumbing inspection', 'Final plumbing inspection for community center', '33333333-3333-3333-3333-333333333333', 'Community Center', 'Mike Johnson', 'medium', 'completed', '2026-04-20', FALSE),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'HVAC system install', 'Install heating and cooling systems in all units', '22222222-2222-2222-2222-222222222222', 'Riverside Apartments', 'Emily Davis', 'high', 'in-progress', '2026-05-15', FALSE),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Safety barrier installation', 'Install perimeter safety barriers and signage', '11111111-1111-1111-1111-111111111111', 'Skyline Tower', 'Alex Thompson', 'medium', 'pending', '2026-05-05', TRUE);

INSERT INTO incidents (id, title, project_id, project_name, description, severity, incident_date, injuries, witnesses, reported_by) VALUES
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Minor scaffolding slip', '11111111-1111-1111-1111-111111111111', 'Skyline Tower', 'Worker slipped on wet scaffolding plank, caught by harness', 'low', '2026-04-28', 0, ARRAY['John Martinez', 'Alex Thompson'], 'Safety Officer');

INSERT INTO inspections (id, title, project_id, project_name, description, status, inspection_date, inspector, findings) VALUES
('00000000-0000-0000-0000-000000000001', 'Foundation Structural Check', '11111111-1111-1111-1111-111111111111', 'Skyline Tower', 'Structural engineer inspection of foundation work', 'passed', '2026-04-15', 'Dr. Robert Wilson', ARRAY['Foundation depth meets specifications', 'Reinforcement placement correct', 'Concrete curing satisfactory']),
('00000000-0000-0000-0000-000000000002', 'Fire Safety Systems', '22222222-2222-2222-2222-222222222222', 'Riverside Apartments', 'Fire sprinkler and alarm system inspection', 'failed', '2026-05-01', 'Lisa Park', ARRAY['Sprinkler coverage inadequate in corridor', 'Smoke detector placement needs adjustment', 'Fire exit signage missing on Level 3']);

INSERT INTO workers (id, name, role, status, phone, email, weekly_hours, certifications, project_assignments, hourly_rate) VALUES
('11111111-2222-3333-4444-555555555555', 'John Martinez', 'foreman', 'active', '+1-555-0101', 'john.m@buildtrack.com', 45, ARRAY['OSHA 30', 'First Aid'], ARRAY['11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333']::uuid[], 35.00),
('22222222-3333-4444-5555-666666666666', 'Sarah Chen', 'engineer', 'active', '+1-555-0102', 'sarah.c@buildtrack.com', 40, ARRAY['PE License', 'LEED AP'], ARRAY['11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222']::uuid[], 55.00),
('33333333-4444-5555-6666-777777777777', 'Mike Johnson', 'plumber', 'active', '+1-555-0103', 'mike.j@buildtrack.com', 40, ARRAY['Journeyman Plumber', 'Backflow Certified'], ARRAY['22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333']::uuid[], 32.00),
('44444444-5555-6666-7777-888888888888', 'Emily Davis', 'electrician', 'active', '+1-555-0104', 'emily.d@buildtrack.com', 42, ARRAY['Master Electrician', 'Solar PV Installer'], ARRAY['11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222']::uuid[], 38.00),
('55555555-6666-7777-8888-999999999999', 'Alex Thompson', 'safety-officer', 'active', '+1-555-0105', 'alex.t@buildtrack.com', 40, ARRAY['OSHA 30', 'NEBOSH', 'First Aid Instructor'], ARRAY['11111111-1111-1111-1111-111111111111']::uuid[], 42.00),
('66666666-7777-8888-9999-000000000000', 'Maria Rodriguez', 'carpenter', 'active', '+1-555-0106', 'maria.r@buildtrack.com', 40, ARRAY['Carpentry Journeyman'], ARRAY['22222222-2222-2222-2222-222222222222']::uuid[], 28.00),
('77777777-8888-9999-0000-111111111111', 'David Kim', 'mason', 'off-duty', '+1-555-0107', 'david.k@buildtrack.com', 35, ARRAY['Masonry Certificate'], ARRAY['11111111-1111-1111-1111-111111111111']::uuid[], 30.00),
('88888888-9999-0000-1111-222222222222', 'Lisa Park', 'engineer', 'active', '+1-555-0108', 'lisa.p@buildtrack.com', 40, ARRAY['PE License', 'Structural Engineering'], ARRAY['22222222-2222-2222-2222-222222222222']::uuid[], 58.00);

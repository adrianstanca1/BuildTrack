-- ============================================================================
-- BuildTrack: Documents Table
-- Migration: 20260515000000
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  uploaded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_name TEXT
);

-- Allow public access for demo
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Enable read access for all users" ON public.documents
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.documents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.documents
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON public.documents
  FOR DELETE USING (true);

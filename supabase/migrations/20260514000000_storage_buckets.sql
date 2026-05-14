-- Create storage buckets for BuildTrack
-- Run via Supabase SQL Editor or psql

-- Create buckets using storage schema (no extension needed)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('buildtrack-photos', 'buildtrack-photos', TRUE, 52428800, ARRAY['image/jpeg','image/png','image/webp','image/heic'])
ON CONFLICT (id) DO UPDATE SET public = TRUE, file_size_limit = 52428800;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('buildtrack-drawings', 'buildtrack-drawings', TRUE, 104857600, ARRAY['image/jpeg','image/png','image/webp','application/pdf'])
ON CONFLICT (id) DO UPDATE SET public = TRUE, file_size_limit = 104857600;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('buildtrack-documents', 'buildtrack-documents', TRUE, 104857600, ARRAY['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/msword','text/plain','image/png','image/jpeg'])
ON CONFLICT (id) DO UPDATE SET public = TRUE, file_size_limit = 104857600;

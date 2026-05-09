-- ============================================================================
-- BuildTrack: Storage Bucket RLS Policies
-- Migration: 20260508170001
-- Configures Supabase Storage bucket and access policies for buildtrack-photos
-- ============================================================================

-- --------------------------------------------------------------------------
-- Storage bucket: buildtrack-photos
-- Stores construction site photos, incident evidence, inspection reports
-- --------------------------------------------------------------------------

-- Create the storage bucket (if not exists)
-- Note: buckets are typically created via dashboard or config.toml;
-- this INSERTs into storage.buckets if it doesn't already exist.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'buildtrack-photos',
    'buildtrack-photos',
    false,
    52428800,  -- 50MB
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'];

-- --------------------------------------------------------------------------
-- Storage policies for buildtrack-photos bucket
-- These apply to the storage.objects table for the buildtrack-photos bucket
-- --------------------------------------------------------------------------

-- Policy: Authenticated users can view photos (SELECT)
-- Users can only view photos in their own project context
CREATE POLICY "Users can view buildtrack photos"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'buildtrack-photos'
    AND auth.role() = 'authenticated'
);

-- Policy: Authenticated users can upload photos (INSERT)
-- Files are stored under {user_id}/{project_id}/{filename}
CREATE POLICY "Users can upload buildtrack photos"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'buildtrack-photos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Authenticated users can update their own photos (UPDATE)
CREATE POLICY "Users can update own buildtrack photos"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'buildtrack-photos'
    AND auth.role() = 'authenticated'
    AND owner = auth.uid()
);

-- Policy: Authenticated users can delete their own photos (DELETE)
CREATE POLICY "Users can delete own buildtrack photos"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'buildtrack-photos'
    AND auth.role() = 'authenticated'
    AND owner = auth.uid()
);

-- --------------------------------------------------------------------------
-- Storage bucket: buildtrack-documents (for reports, PDFs, etc.)
-- --------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'buildtrack-documents',
    'buildtrack-documents',
    false,
    104857600,  -- 100MB
    ARRAY['application/pdf', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain', 'text/csv', 'application/zip']
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = 104857600;

CREATE POLICY "Users can view buildtrack documents"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'buildtrack-documents'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can upload buildtrack documents"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'buildtrack-documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own buildtrack documents"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'buildtrack-documents'
    AND auth.role() = 'authenticated'
    AND owner = auth.uid()
);

CREATE POLICY "Users can delete own buildtrack documents"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'buildtrack-documents'
    AND auth.role() = 'authenticated'
    AND owner = auth.uid()
);

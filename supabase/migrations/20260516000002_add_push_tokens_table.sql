-- Migration: add push_tokens table for Expo push notification tokens

-- Create platform enum
DO $$ BEGIN
  CREATE TYPE platform_type AS ENUM ('ios', 'android', 'web');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create push_tokens table
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  platform platform_type NOT NULL DEFAULT 'ios',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Foreign key to auth.users (or public.users depending on existing schema)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    ALTER TABLE push_tokens ADD CONSTRAINT fk_push_tokens_user_id
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  ELSE
    ALTER TABLE push_tokens ADD CONSTRAINT fk_push_tokens_user_id
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_token ON push_tokens(token);

-- Auto-update updated_at trigger
CREATE TRIGGER update_push_tokens_updated_at
BEFORE UPDATE ON push_tokens
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only manage their own tokens
CREATE POLICY "Users can insert own push token"
  ON push_tokens FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own push token"
  ON push_tokens FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own push token"
  ON push_tokens FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Users can select own push token"
  ON push_tokens FOR SELECT
  USING (user_id = auth.uid());

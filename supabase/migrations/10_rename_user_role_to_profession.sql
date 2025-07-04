-- Rename user_role enum to profession for better semantic clarity
-- This migration renames the enum and column to better reflect that these are professions, not roles

-- Create the new profession enum with the same values
CREATE TYPE profession AS ENUM ('ACTOR', 'MODEL', 'BOTH');

-- Add the new profession column to users table
ALTER TABLE public.users ADD COLUMN profession profession DEFAULT 'ACTOR';

-- Copy data from role column to profession column
UPDATE public.users SET profession = role::text::profession;

-- Set the profession column to NOT NULL since all data has been migrated
ALTER TABLE public.users ALTER COLUMN profession SET NOT NULL;

-- Drop the old role column
ALTER TABLE public.users DROP COLUMN role;

-- Drop the old user_role enum (now that it's no longer referenced)
DROP TYPE user_role;

-- Update indexes - drop old index and create new one
DROP INDEX IF EXISTS idx_users_role;
CREATE INDEX IF NOT EXISTS idx_users_profession ON public.users(profession);

-- Add comment for documentation
COMMENT ON TYPE profession IS 'User profession: ACTOR, MODEL, or BOTH';
COMMENT ON COLUMN public.users.profession IS 'The user''s profession in the entertainment industry';
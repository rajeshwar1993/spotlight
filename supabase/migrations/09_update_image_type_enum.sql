-- Update image_type enum to reflect usage locations
-- This migration updates the image_type enum values to better indicate where images are used

-- First, create the new enum with updated values
CREATE TYPE image_type_new AS ENUM ('PROFILE', 'HERO', 'GALLERY', 'INTERNAL');

-- Update existing records to map old values to new values
UPDATE public.images SET type = 
  CASE 
    WHEN type = 'HEADSHOT' THEN 'PROFILE'::image_type_new
    WHEN type = 'BODY_SHOT' THEN 'GALLERY'::image_type_new
    WHEN type = 'PORTFOLIO' THEN 'GALLERY'::image_type_new
    WHEN type = 'PROFILE' THEN 'PROFILE'::image_type_new
    ELSE 'GALLERY'::image_type_new -- Default fallback
  END::text::image_type_new;

-- Drop the constraint on the images table
ALTER TABLE public.images ALTER COLUMN type DROP DEFAULT;
ALTER TABLE public.images ALTER COLUMN type TYPE image_type_new USING type::text::image_type_new;

-- Drop the old enum and rename the new one
DROP TYPE image_type;
ALTER TYPE image_type_new RENAME TO image_type;

-- Restore the constraint with updated enum
ALTER TABLE public.images ALTER COLUMN type SET NOT NULL;

-- Update any indexes or constraints that might reference the enum
-- (The existing indexes should still work as they're on the column, not the enum values)

-- Add comment for documentation
COMMENT ON TYPE image_type IS 'Enum indicating where the image is used: PROFILE (profile/avatar), HERO (main banner), GALLERY (portfolio gallery), INTERNAL (system/internal use)';
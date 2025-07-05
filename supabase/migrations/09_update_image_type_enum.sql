-- Update image_type enum to reflect usage locations
-- This migration updates the image_type enum values to better indicate where images are used

-- First, create the new enum with updated values
CREATE TYPE image_type_new AS ENUM ('PROFILE', 'HERO', 'GALLERY', 'INTERNAL');

-- Add a temporary column with the new enum type
ALTER TABLE public.images ADD COLUMN type_new image_type_new;

-- Update the new column based on the old values
UPDATE public.images SET type_new = 
  CASE 
    WHEN type = 'HEADSHOT' THEN 'PROFILE'::image_type_new
    WHEN type = 'BODY_SHOT' THEN 'GALLERY'::image_type_new
    WHEN type = 'PORTFOLIO' THEN 'GALLERY'::image_type_new
    WHEN type = 'PROFILE' THEN 'PROFILE'::image_type_new
    ELSE 'GALLERY'::image_type_new -- Default fallback
  END;

-- Drop the old column and rename the new one
ALTER TABLE public.images DROP COLUMN type;
ALTER TABLE public.images RENAME COLUMN type_new TO type;

-- Drop the old enum and rename the new one
DROP TYPE image_type;
ALTER TYPE image_type_new RENAME TO image_type;

-- Restore the constraint with updated enum
ALTER TABLE public.images ALTER COLUMN type SET NOT NULL;

-- Update any indexes or constraints that might reference the enum
-- (The existing indexes should still work as they're on the column, not the enum values)

-- Add comment for documentation
COMMENT ON TYPE image_type IS 'Enum indicating where the image is used: PROFILE (profile/avatar), HERO (main banner), GALLERY (portfolio gallery), INTERNAL (system/internal use)';
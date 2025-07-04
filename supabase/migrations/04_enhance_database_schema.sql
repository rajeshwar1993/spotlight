-- Enhanced database schema for Spotlight
-- This migration adds missing fields and improves the existing schema

-- Create additional useful functions
CREATE OR REPLACE FUNCTION public.generate_unique_slug(base_text TEXT, table_name TEXT DEFAULT 'portfolios')
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
  slug_exists BOOLEAN;
BEGIN
  -- Create base slug from text
  base_slug := lower(trim(regexp_replace(base_text, '[^a-zA-Z0-9\s]', '', 'g')));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  -- Ensure minimum length
  IF length(base_slug) < 3 THEN
    base_slug := base_slug || '-portfolio';
  END IF;
  
  final_slug := base_slug;
  
  -- Check if slug exists and increment if needed
  LOOP
    EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE slug = $1)', table_name) 
    USING final_slug INTO slug_exists;
    
    IF NOT slug_exists THEN
      EXIT;
    END IF;
    
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Create view counting function
CREATE OR REPLACE FUNCTION public.increment_portfolio_views(portfolio_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.portfolios 
  SET view_count = view_count + 1 
  WHERE slug = portfolio_slug AND is_published = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create portfolio skills table for better normalization
CREATE TABLE IF NOT EXISTS public.portfolio_skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    skill_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced', 'expert'
    years_experience INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create portfolio tags table for categorization
CREATE TABLE IF NOT EXISTS public.portfolio_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL,
    tag_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(portfolio_id, tag_name)
);

-- Create user activity log table
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    activity_type VARCHAR(50) NOT NULL, -- 'login', 'profile_update', 'portfolio_create', etc.
    activity_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create portfolio analytics table
CREATE TABLE IF NOT EXISTS public.portfolio_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    views_count INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    referrer_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(portfolio_id, date)
);

-- Add missing columns to existing tables
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0;

-- Add missing columns to portfolios table
ALTER TABLE public.portfolios 
ADD COLUMN IF NOT EXISTS featured_image_id UUID REFERENCES public.images(id),
ADD COLUMN IF NOT EXISTS portfolio_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS availability_status VARCHAR(50) DEFAULT 'available', -- 'available', 'busy', 'unavailable'
ADD COLUMN IF NOT EXISTS location_preferences TEXT[], -- Array of preferred work locations
ADD COLUMN IF NOT EXISTS rate_per_hour DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS rate_per_day DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- Add missing columns to images table
ALTER TABLE public.images
ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS blur_hash VARCHAR(100), -- For progressive image loading
ADD COLUMN IF NOT EXISTS exif_data JSONB,
ADD COLUMN IF NOT EXISTS processed_sizes JSONB, -- Store different image sizes
ADD COLUMN IF NOT EXISTS upload_source VARCHAR(50) DEFAULT 'web', -- 'web', 'mobile', 'api'
ADD COLUMN IF NOT EXISTS is_nsfw BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(50) DEFAULT 'pending'; -- 'pending', 'approved', 'rejected'

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_portfolio_skills_portfolio_id ON public.portfolio_skills(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_skills_skill_name ON public.portfolio_skills(skill_name);
CREATE INDEX IF NOT EXISTS idx_portfolio_tags_portfolio_id ON public.portfolio_tags(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_tags_tag_name ON public.portfolio_tags(tag_name);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON public.user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON public.user_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_portfolio_id ON public.portfolio_analytics(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_date ON public.portfolio_analytics(date);

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON public.users(last_login_at);
CREATE INDEX IF NOT EXISTS idx_users_profile_completion ON public.users(profile_completion_percentage);
CREATE INDEX IF NOT EXISTS idx_portfolios_availability_status ON public.portfolios(availability_status);
CREATE INDEX IF NOT EXISTS idx_portfolios_published_at ON public.portfolios(published_at);
CREATE INDEX IF NOT EXISTS idx_portfolios_featured_image_id ON public.portfolios(featured_image_id);
CREATE INDEX IF NOT EXISTS idx_images_mime_type ON public.images(mime_type);
CREATE INDEX IF NOT EXISTS idx_images_moderation_status ON public.images(moderation_status);

-- Create updated_at triggers for new tables
CREATE TRIGGER handle_portfolio_analytics_updated_at
    BEFORE UPDATE ON public.portfolio_analytics
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION public.calculate_profile_completion(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  completion_score INTEGER := 0;
  user_record RECORD;
  portfolio_count INTEGER;
  image_count INTEGER;
BEGIN
  -- Get user record
  SELECT * INTO user_record FROM public.users WHERE id = user_uuid;
  
  IF user_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Basic profile fields (50% total)
  IF user_record.full_name IS NOT NULL AND length(user_record.full_name) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF user_record.bio IS NOT NULL AND length(user_record.bio) > 20 THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF user_record.location IS NOT NULL AND length(user_record.location) > 0 THEN
    completion_score := completion_score + 5;
  END IF;
  
  IF user_record.phone IS NOT NULL AND length(user_record.phone) > 0 THEN
    completion_score := completion_score + 5;
  END IF;
  
  IF user_record.avatar_url IS NOT NULL AND length(user_record.avatar_url) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF user_record.date_of_birth IS NOT NULL THEN
    completion_score := completion_score + 5;
  END IF;
  
  IF user_record.gender IS NOT NULL THEN
    completion_score := completion_score + 5;
  END IF;
  
  -- Portfolio existence (30% total)
  SELECT COUNT(*) INTO portfolio_count FROM public.portfolios WHERE user_id = user_uuid;
  IF portfolio_count > 0 THEN
    completion_score := completion_score + 30;
  END IF;
  
  -- Images uploaded (20% total)
  SELECT COUNT(*) INTO image_count FROM public.images WHERE user_id = user_uuid;
  IF image_count >= 1 THEN
    completion_score := completion_score + 10;
  END IF;
  IF image_count >= 3 THEN
    completion_score := completion_score + 10;
  END IF;
  
  RETURN LEAST(completion_score, 100);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update profile completion on user changes
CREATE OR REPLACE FUNCTION public.update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completion_percentage := public.calculate_profile_completion(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_profile_completion
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_profile_completion();

-- Create function to auto-generate portfolio slug
CREATE OR REPLACE FUNCTION public.auto_generate_portfolio_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_unique_slug(NEW.title);
  ELSE
    -- Ensure slug is unique
    NEW.slug := public.generate_unique_slug(NEW.slug);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_portfolio_slug
    BEFORE INSERT ON public.portfolios
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_generate_portfolio_slug();

-- Create function to update published_at timestamp
CREATE OR REPLACE FUNCTION public.update_published_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Set published_at when is_published changes from false to true
  IF OLD.is_published = FALSE AND NEW.is_published = TRUE THEN
    NEW.published_at := TIMEZONE('utc'::text, NOW());
  END IF;
  
  -- Clear published_at when is_published changes from true to false
  IF OLD.is_published = TRUE AND NEW.is_published = FALSE THEN
    NEW.published_at := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_published_at
    BEFORE UPDATE ON public.portfolios
    FOR EACH ROW
    EXECUTE FUNCTION public.update_published_at();

-- Create function to log user activities
CREATE OR REPLACE FUNCTION public.log_user_activity(
  user_uuid UUID,
  activity_type_param VARCHAR(50),
  activity_data_param JSONB DEFAULT NULL,
  ip_address_param INET DEFAULT NULL,
  user_agent_param TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_activities (
    user_id, 
    activity_type, 
    activity_data, 
    ip_address, 
    user_agent
  ) VALUES (
    user_uuid, 
    activity_type_param, 
    activity_data_param, 
    ip_address_param, 
    user_agent_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update daily portfolio analytics
CREATE OR REPLACE FUNCTION public.update_portfolio_analytics(
  portfolio_uuid UUID,
  view_date DATE DEFAULT CURRENT_DATE
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.portfolio_analytics (portfolio_id, date, views_count, unique_visitors)
  VALUES (portfolio_uuid, view_date, 1, 1)
  ON CONFLICT (portfolio_id, date)
  DO UPDATE SET 
    views_count = portfolio_analytics.views_count + 1,
    updated_at = TIMEZONE('utc'::text, NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
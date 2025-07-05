-- Advanced database functions and triggers for Spotlight
-- This migration adds business logic and automation at the database level

-- Create full-text search configuration
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Create custom text search configuration for portfolios
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_ts_config WHERE cfgname = 'portfolio_search'
  ) THEN
    CREATE TEXT SEARCH CONFIGURATION public.portfolio_search (COPY = pg_catalog.english);
  END IF;
END $$;
ALTER TEXT SEARCH CONFIGURATION public.portfolio_search
  ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part
  WITH unaccent, simple;

-- Add full-text search columns to portfolios
ALTER TABLE public.portfolios 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION public.update_portfolio_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('public.portfolio_search', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('public.portfolio_search', COALESCE(NEW.bio, '')), 'B') ||
    setweight(to_tsvector('public.portfolio_search', COALESCE(array_to_string(NEW.skills, ' '), '')), 'C') ||
    setweight(to_tsvector('public.portfolio_search', COALESCE(NEW.location_preferences::text, '')), 'D');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for search vector updates
CREATE TRIGGER trigger_update_portfolio_search_vector
    BEFORE INSERT OR UPDATE ON public.portfolios
    FOR EACH ROW
    EXECUTE FUNCTION public.update_portfolio_search_vector();

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_portfolios_search_vector ON public.portfolios USING GIN(search_vector);

-- Create function for portfolio search with ranking
CREATE OR REPLACE FUNCTION public.search_portfolios(
  search_query TEXT,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
  portfolio_id UUID,
  title TEXT,
  slug TEXT,
  bio TEXT,
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  location TEXT,
  template TEXT,
  view_count INTEGER,
  published_at TIMESTAMP WITH TIME ZONE,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.slug,
    p.bio,
    p.user_id,
    u.full_name,
    u.avatar_url,
    u.location,
    p.template::TEXT,
    p.view_count,
    p.published_at,
    ts_rank(p.search_vector, plainto_tsquery('public.portfolio_search', search_query)) as rank
  FROM public.portfolios p
  JOIN public.users u ON p.user_id = u.id
  WHERE 
    p.is_published = true 
    AND p.search_vector @@ plainto_tsquery('public.portfolio_search', search_query)
  ORDER BY rank DESC, p.view_count DESC, p.published_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get featured portfolios
CREATE OR REPLACE FUNCTION public.get_featured_portfolios(
  limit_count INTEGER DEFAULT 10,
  template_filter TEXT DEFAULT NULL
)
RETURNS TABLE(
  portfolio_id UUID,
  title TEXT,
  slug TEXT,
  bio TEXT,
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  location TEXT,
  template TEXT,
  view_count INTEGER,
  published_at TIMESTAMP WITH TIME ZONE,
  featured_image_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.slug,
    p.bio,
    p.user_id,
    u.full_name,
    u.avatar_url,
    u.location,
    p.template::TEXT,
    p.view_count,
    p.published_at,
    i.file_path as featured_image_url
  FROM public.portfolios p
  JOIN public.users u ON p.user_id = u.id
  LEFT JOIN public.images i ON p.featured_image_id = i.id
  WHERE 
    p.is_published = true 
    AND (template_filter IS NULL OR p.template::TEXT = template_filter)
    AND p.published_at >= NOW() - INTERVAL '30 days' -- Recent portfolios
  ORDER BY 
    p.view_count DESC, 
    p.published_at DESC,
    RANDOM() -- Add some randomness for variety
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get portfolio statistics
CREATE OR REPLACE FUNCTION public.get_portfolio_stats(portfolio_uuid UUID)
RETURNS TABLE(
  total_views INTEGER,
  views_last_30_days INTEGER,
  views_last_7_days INTEGER,
  views_today INTEGER,
  unique_visitors_last_30_days INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(p.view_count, 0) as total_views,
    COALESCE(SUM(CASE WHEN pa.date >= CURRENT_DATE - INTERVAL '30 days' THEN pa.views_count ELSE 0 END)::INTEGER, 0) as views_last_30_days,
    COALESCE(SUM(CASE WHEN pa.date >= CURRENT_DATE - INTERVAL '7 days' THEN pa.views_count ELSE 0 END)::INTEGER, 0) as views_last_7_days,
    COALESCE(SUM(CASE WHEN pa.date = CURRENT_DATE THEN pa.views_count ELSE 0 END)::INTEGER, 0) as views_today,
    COALESCE(SUM(CASE WHEN pa.date >= CURRENT_DATE - INTERVAL '30 days' THEN pa.unique_visitors ELSE 0 END)::INTEGER, 0) as unique_visitors_last_30_days
  FROM public.portfolios p
  LEFT JOIN public.portfolio_analytics pa ON p.id = pa.portfolio_id
  WHERE p.id = portfolio_uuid
  GROUP BY p.id, p.view_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user dashboard statistics
CREATE OR REPLACE FUNCTION public.get_user_dashboard_stats(user_uuid UUID)
RETURNS TABLE(
  total_portfolios INTEGER,
  published_portfolios INTEGER,
  draft_portfolios INTEGER,
  total_views INTEGER,
  total_images INTEGER,
  profile_completion INTEGER,
  last_login TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(p.id)::INTEGER as total_portfolios,
    COUNT(CASE WHEN p.is_published = true THEN 1 END)::INTEGER as published_portfolios,
    COUNT(CASE WHEN p.is_published = false THEN 1 END)::INTEGER as draft_portfolios,
    COALESCE(SUM(p.view_count), 0)::INTEGER as total_views,
    COUNT(i.id)::INTEGER as total_images,
    u.profile_completion_percentage as profile_completion,
    u.last_login_at as last_login
  FROM public.users u
  LEFT JOIN public.portfolios p ON u.id = p.user_id
  LEFT JOIN public.images i ON u.id = i.user_id
  WHERE u.id = user_uuid
  GROUP BY u.id, u.profile_completion_percentage, u.last_login_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update user login information
CREATE OR REPLACE FUNCTION public.update_user_login(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users
  SET 
    last_login_at = TIMEZONE('utc'::text, NOW()),
    login_count = COALESCE(login_count, 0) + 1
  WHERE id = user_uuid;
  
  -- Log the login activity
  PERFORM public.log_user_activity(
    user_uuid,
    'login',
    jsonb_build_object('timestamp', NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate portfolio data
CREATE OR REPLACE FUNCTION public.validate_portfolio_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate title length
  IF NEW.title IS NULL OR length(trim(NEW.title)) < 3 THEN
    RAISE EXCEPTION 'Portfolio title must be at least 3 characters long';
  END IF;
  
  IF length(NEW.title) > 255 THEN
    RAISE EXCEPTION 'Portfolio title cannot exceed 255 characters';
  END IF;
  
  -- Validate bio length for published portfolios
  IF NEW.is_published = true AND (NEW.bio IS NULL OR length(trim(NEW.bio)) < 50) THEN
    RAISE EXCEPTION 'Published portfolios must have a bio of at least 50 characters';
  END IF;
  
  -- Validate slug format
  IF NEW.slug !~ '^[a-z0-9-]+$' THEN
    RAISE EXCEPTION 'Portfolio slug can only contain lowercase letters, numbers, and hyphens';
  END IF;
  
  -- Validate rates are positive if provided
  IF NEW.rate_per_hour IS NOT NULL AND NEW.rate_per_hour < 0 THEN
    RAISE EXCEPTION 'Hourly rate must be positive';
  END IF;
  
  IF NEW.rate_per_day IS NOT NULL AND NEW.rate_per_day < 0 THEN
    RAISE EXCEPTION 'Daily rate must be positive';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_portfolio_data
    BEFORE INSERT OR UPDATE ON public.portfolios
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_portfolio_data();

-- Create function to automatically set featured image
CREATE OR REPLACE FUNCTION public.auto_set_featured_image()
RETURNS TRIGGER AS $$
DECLARE
  first_image_id UUID;
BEGIN
  -- If no featured image is set, use the first uploaded image
  IF NEW.featured_image_id IS NULL THEN
    SELECT id INTO first_image_id
    FROM public.images
    WHERE portfolio_id = NEW.id
    ORDER BY sort_order ASC, created_at ASC
    LIMIT 1;
    
    IF first_image_id IS NOT NULL THEN
      NEW.featured_image_id := first_image_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_set_featured_image
    BEFORE UPDATE ON public.portfolios
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_set_featured_image();

-- Create function to handle image upload validation
CREATE OR REPLACE FUNCTION public.validate_image_upload()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate file size (50MB limit)
  IF NEW.file_size > 52428800 THEN
    RAISE EXCEPTION 'Image file size cannot exceed 50MB';
  END IF;
  
  -- Validate image dimensions if provided
  IF NEW.width IS NOT NULL AND NEW.width < 100 THEN
    RAISE EXCEPTION 'Image width must be at least 100 pixels';
  END IF;
  
  IF NEW.height IS NOT NULL AND NEW.height < 100 THEN
    RAISE EXCEPTION 'Image height must be at least 100 pixels';
  END IF;
  
  -- Validate file name
  IF NEW.file_name IS NULL OR length(trim(NEW.file_name)) = 0 THEN
    RAISE EXCEPTION 'Image file name cannot be empty';
  END IF;
  
  -- Set default moderation status
  IF NEW.moderation_status IS NULL THEN
    NEW.moderation_status := 'pending';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_image_upload
    BEFORE INSERT OR UPDATE ON public.images
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_image_upload();

-- Create function to clean up orphaned data
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_data()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  temp_count INTEGER;
BEGIN
  -- Clean up orphaned portfolio skills
  DELETE FROM public.portfolio_skills
  WHERE portfolio_id NOT IN (SELECT id FROM public.portfolios);
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;
  
  -- Clean up orphaned portfolio tags
  DELETE FROM public.portfolio_tags
  WHERE portfolio_id NOT IN (SELECT id FROM public.portfolios);
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;
  
  -- Clean up old user activities (older than 1 year)
  DELETE FROM public.user_activities
  WHERE created_at < NOW() - INTERVAL '1 year';
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;
  
  -- Clean up old portfolio analytics (older than 2 years)
  DELETE FROM public.portfolio_analytics
  WHERE date < CURRENT_DATE - INTERVAL '2 years';
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get popular skills
CREATE OR REPLACE FUNCTION public.get_popular_skills(limit_count INTEGER DEFAULT 20)
RETURNS TABLE(
  skill_name TEXT,
  usage_count BIGINT,
  avg_experience NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.skill_name,
    COUNT(*)::BIGINT as usage_count,
    ROUND(AVG(ps.years_experience), 1) as avg_experience
  FROM public.portfolio_skills ps
  JOIN public.portfolios p ON ps.portfolio_id = p.id
  WHERE p.is_published = true
  GROUP BY ps.skill_name
  ORDER BY usage_count DESC, avg_experience DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get portfolio recommendations
CREATE OR REPLACE FUNCTION public.get_portfolio_recommendations(
  current_portfolio_uuid UUID,
  limit_count INTEGER DEFAULT 5
)
RETURNS TABLE(
  portfolio_id UUID,
  title TEXT,
  slug TEXT,
  user_full_name TEXT,
  similarity_score REAL
) AS $$
DECLARE
  current_skills TEXT[];
  current_template TEXT;
BEGIN
  -- Get current portfolio's skills and template
  SELECT array_agg(ps.skill_name), p.template::TEXT
  INTO current_skills, current_template
  FROM public.portfolios p
  LEFT JOIN public.portfolio_skills ps ON p.id = ps.portfolio_id
  WHERE p.id = current_portfolio_uuid
  GROUP BY p.template;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.slug,
    u.full_name,
    (
      -- Template similarity (30% weight)
      CASE WHEN p.template::TEXT = current_template THEN 0.3 ELSE 0.0 END +
      -- Skills similarity (70% weight)
      CASE 
        WHEN current_skills IS NULL THEN 0.0
        ELSE 0.7 * (
          SELECT COUNT(*)::REAL / GREATEST(array_length(current_skills, 1), 1)
          FROM public.portfolio_skills ps
          WHERE ps.portfolio_id = p.id 
          AND ps.skill_name = ANY(current_skills)
        )
      END
    ) as similarity_score
  FROM public.portfolios p
  JOIN public.users u ON p.user_id = u.id
  WHERE 
    p.id != current_portfolio_uuid
    AND p.is_published = true
  ORDER BY similarity_score DESC, p.view_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
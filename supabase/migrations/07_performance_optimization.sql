-- Performance optimization for Spotlight database
-- This migration adds advanced indexing and query optimization

-- Create composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolios_user_published 
ON public.portfolios(user_id, is_published) 
WHERE is_published = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolios_published_views 
ON public.portfolios(is_published, view_count DESC, published_at DESC) 
WHERE is_published = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolios_template_published 
ON public.portfolios(template, is_published, view_count DESC) 
WHERE is_published = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolios_status_updated 
ON public.portfolios(status, updated_at DESC) 
WHERE status = 'PUBLISHED';

-- Partial indexes for better performance on filtered queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_verified 
ON public.users(email) 
WHERE is_email_verified = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_profile_incomplete 
ON public.users(id, profile_completion_percentage) 
WHERE profile_completion_percentage < 100;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_recent_login 
ON public.users(last_login_at DESC) 
WHERE last_login_at > NOW() - INTERVAL '30 days';

-- Image-related performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_images_portfolio_type_order 
ON public.images(portfolio_id, type, sort_order) 
WHERE portfolio_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_images_user_primary 
ON public.images(user_id, is_primary) 
WHERE is_primary = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_images_moderation_pending 
ON public.images(moderation_status, created_at) 
WHERE moderation_status = 'pending';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_images_file_size 
ON public.images(file_size) 
WHERE file_size > 10485760; -- Files larger than 10MB

-- Analytics and activity indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_activities_user_type_date 
ON public.user_activities(user_id, activity_type, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_activities_recent 
ON public.user_activities(created_at DESC) 
WHERE created_at > NOW() - INTERVAL '7 days';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_analytics_recent 
ON public.portfolio_analytics(portfolio_id, date DESC) 
WHERE date > CURRENT_DATE - INTERVAL '90 days';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_analytics_views 
ON public.portfolio_analytics(date, views_count) 
WHERE views_count > 0;

-- Skills and tags indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_skills_name_level 
ON public.portfolio_skills(skill_name, skill_level, years_experience DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_skills_experience 
ON public.portfolio_skills(years_experience DESC) 
WHERE years_experience > 0;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_tags_name 
ON public.portfolio_tags(tag_name, created_at DESC);

-- Create expression indexes for common text searches
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolios_title_lower 
ON public.portfolios(lower(title)) 
WHERE is_published = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_name_lower 
ON public.users(lower(full_name)) 
WHERE full_name IS NOT NULL;

-- Create covering indexes (include columns) for read-heavy queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolios_published_covering 
ON public.portfolios(is_published, published_at DESC) 
INCLUDE (id, title, slug, user_id, template, view_count, bio) 
WHERE is_published = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_basic_info_covering 
ON public.users(id) 
INCLUDE (email, full_name, avatar_url, location, role);

-- Optimize existing indexes by adding conditions
DROP INDEX IF EXISTS idx_portfolios_is_published;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolios_published_optimized 
ON public.portfolios(published_at DESC, view_count DESC) 
WHERE is_published = true AND status = 'PUBLISHED';

-- Create indexes for JSON columns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolios_measurements_gin 
ON public.portfolios USING GIN(measurements) 
WHERE measurements IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_images_exif_gin 
ON public.images USING GIN(exif_data) 
WHERE exif_data IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_images_processed_sizes_gin 
ON public.images USING GIN(processed_sizes) 
WHERE processed_sizes IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_activities_data_gin 
ON public.user_activities USING GIN(activity_data);

-- Array indexes for better performance on array queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolios_skills_gin 
ON public.portfolios USING GIN(skills) 
WHERE skills IS NOT NULL AND array_length(skills, 1) > 0;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolios_keywords_gin 
ON public.portfolios USING GIN(seo_keywords) 
WHERE seo_keywords IS NOT NULL AND array_length(seo_keywords, 1) > 0;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolios_location_prefs_gin 
ON public.portfolios USING GIN(location_preferences) 
WHERE location_preferences IS NOT NULL AND array_length(location_preferences, 1) > 0;

-- Create materialized view for portfolio statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS public.portfolio_stats_summary AS
SELECT 
    p.id as portfolio_id,
    p.user_id,
    p.title,
    p.slug,
    p.template,
    p.view_count,
    p.published_at,
    u.full_name as user_name,
    u.location as user_location,
    u.avatar_url as user_avatar,
    COUNT(i.id) as image_count,
    COUNT(ps.id) as skill_count,
    COUNT(pt.id) as tag_count,
    COALESCE(AVG(ps.years_experience), 0) as avg_experience,
    COALESCE(SUM(CASE WHEN pa.date >= CURRENT_DATE - INTERVAL '30 days' THEN pa.views_count ELSE 0 END), 0) as views_last_30_days,
    COALESCE(SUM(CASE WHEN pa.date >= CURRENT_DATE - INTERVAL '7 days' THEN pa.views_count ELSE 0 END), 0) as views_last_7_days
FROM public.portfolios p
JOIN public.users u ON p.user_id = u.id
LEFT JOIN public.images i ON p.id = i.portfolio_id
LEFT JOIN public.portfolio_skills ps ON p.id = ps.portfolio_id
LEFT JOIN public.portfolio_tags pt ON p.id = pt.portfolio_id
LEFT JOIN public.portfolio_analytics pa ON p.id = pa.portfolio_id
WHERE p.is_published = true
GROUP BY p.id, p.user_id, p.title, p.slug, p.template, p.view_count, p.published_at, 
         u.full_name, u.location, u.avatar_url;

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_portfolio_stats_summary_id 
ON public.portfolio_stats_summary(portfolio_id);

-- Create indexes on materialized view for common queries
CREATE INDEX IF NOT EXISTS idx_portfolio_stats_summary_views 
ON public.portfolio_stats_summary(views_last_30_days DESC, view_count DESC);

CREATE INDEX IF NOT EXISTS idx_portfolio_stats_summary_template 
ON public.portfolio_stats_summary(template, views_last_30_days DESC);

CREATE INDEX IF NOT EXISTS idx_portfolio_stats_summary_recent 
ON public.portfolio_stats_summary(published_at DESC) 
WHERE published_at > NOW() - INTERVAL '90 days';

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION public.refresh_portfolio_stats()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.portfolio_stats_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create optimized search function using the materialized view
CREATE OR REPLACE FUNCTION public.search_portfolios_optimized(
  search_query TEXT DEFAULT NULL,
  template_filter TEXT DEFAULT NULL,
  location_filter TEXT DEFAULT NULL,
  skill_filter TEXT DEFAULT NULL,
  min_experience INTEGER DEFAULT NULL,
  sort_by TEXT DEFAULT 'relevance', -- 'relevance', 'views', 'recent', 'experience'
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
  portfolio_id UUID,
  title TEXT,
  slug TEXT,
  bio TEXT,
  user_id UUID,
  user_name TEXT,
  user_avatar TEXT,
  user_location TEXT,
  template TEXT,
  view_count BIGINT,
  views_last_30_days BIGINT,
  published_at TIMESTAMP WITH TIME ZONE,
  image_count BIGINT,
  skill_count BIGINT,
  avg_experience NUMERIC,
  rank REAL
) AS $$
DECLARE
  base_query TEXT;
  where_conditions TEXT[] := '{}';
  order_clause TEXT;
BEGIN
  -- Build where conditions
  IF template_filter IS NOT NULL THEN
    where_conditions := where_conditions || format('pss.template = %L', template_filter);
  END IF;
  
  IF location_filter IS NOT NULL THEN
    where_conditions := where_conditions || format('pss.user_location ILIKE %L', '%' || location_filter || '%');
  END IF;
  
  IF skill_filter IS NOT NULL THEN
    where_conditions := where_conditions || format(
      'pss.portfolio_id IN (SELECT portfolio_id FROM public.portfolio_skills WHERE skill_name ILIKE %L)',
      '%' || skill_filter || '%'
    );
  END IF;
  
  IF min_experience IS NOT NULL THEN
    where_conditions := where_conditions || format('pss.avg_experience >= %s', min_experience);
  END IF;
  
  -- Build order clause
  CASE sort_by
    WHEN 'views' THEN
      order_clause := 'pss.views_last_30_days DESC, pss.view_count DESC';
    WHEN 'recent' THEN
      order_clause := 'pss.published_at DESC';
    WHEN 'experience' THEN
      order_clause := 'pss.avg_experience DESC, pss.views_last_30_days DESC';
    ELSE
      order_clause := 'pss.views_last_30_days DESC, pss.view_count DESC, pss.published_at DESC';
  END CASE;
  
  -- Build and execute query
  base_query := format(
    'SELECT 
       pss.portfolio_id,
       pss.title,
       pss.slug,
       p.bio,
       pss.user_id,
       pss.user_name,
       pss.user_avatar,
       pss.user_location,
       pss.template,
       pss.view_count,
       pss.views_last_30_days,
       pss.published_at,
       pss.image_count,
       pss.skill_count,
       pss.avg_experience,
       %s as rank
     FROM public.portfolio_stats_summary pss
     JOIN public.portfolios p ON pss.portfolio_id = p.id
     %s
     %s
     ORDER BY %s
     LIMIT %s OFFSET %s',
    CASE 
      WHEN search_query IS NOT NULL THEN 
        'ts_rank(p.search_vector, plainto_tsquery(''public.portfolio_search'', ''' || search_query || '''))'
      ELSE '1.0'
    END,
    CASE 
      WHEN search_query IS NOT NULL THEN
        'WHERE p.search_vector @@ plainto_tsquery(''public.portfolio_search'', ''' || search_query || ''')'
        || CASE WHEN array_length(where_conditions, 1) > 0 THEN ' AND ' || array_to_string(where_conditions, ' AND ') ELSE '' END
      ELSE
        CASE WHEN array_length(where_conditions, 1) > 0 THEN 'WHERE ' || array_to_string(where_conditions, ' AND ') ELSE '' END
    END,
    CASE 
      WHEN search_query IS NOT NULL THEN 'AND p.is_published = true'
      ELSE ''
    END,
    CASE 
      WHEN search_query IS NOT NULL THEN 'rank DESC, ' || order_clause
      ELSE order_clause
    END,
    limit_count,
    offset_count
  );
  
  RETURN QUERY EXECUTE base_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to analyze slow queries
CREATE OR REPLACE FUNCTION public.analyze_slow_queries()
RETURNS TABLE(
  query_text TEXT,
  calls BIGINT,
  total_time DOUBLE PRECISION,
  mean_time DOUBLE PRECISION,
  max_time DOUBLE PRECISION
) AS $$
BEGIN
  -- This would typically query pg_stat_statements
  -- For now, return empty result as pg_stat_statements might not be enabled
  RETURN QUERY
  SELECT 
    'No slow query data available'::TEXT,
    0::BIGINT,
    0.0::DOUBLE PRECISION,
    0.0::DOUBLE PRECISION,
    0.0::DOUBLE PRECISION
  WHERE false; -- Return empty result
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get database performance statistics
CREATE OR REPLACE FUNCTION public.get_db_performance_stats()
RETURNS TABLE(
  table_name TEXT,
  row_count BIGINT,
  table_size TEXT,
  index_size TEXT,
  total_size TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname||'.'||tablename as table_name,
    n_tup_ins + n_tup_upd + n_tup_del as row_count,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) + pg_indexes_size(schemaname||'.'||tablename)) as total_size
  FROM pg_stat_user_tables 
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create automated maintenance function
CREATE OR REPLACE FUNCTION public.perform_maintenance()
RETURNS TEXT AS $$
DECLARE
  result_text TEXT := '';
  cleanup_count INTEGER;
BEGIN
  -- Refresh materialized view
  PERFORM public.refresh_portfolio_stats();
  result_text := result_text || 'Portfolio stats refreshed. ';
  
  -- Clean up orphaned data
  SELECT public.cleanup_orphaned_data() INTO cleanup_count;
  result_text := result_text || 'Cleaned up ' || cleanup_count || ' orphaned records. ';
  
  -- Update all users' profile completion percentages
  UPDATE public.users 
  SET profile_completion_percentage = public.calculate_profile_completion(id)
  WHERE profile_completion_percentage != public.calculate_profile_completion(id);
  
  GET DIAGNOSTICS cleanup_count = ROW_COUNT;
  result_text := result_text || 'Updated ' || cleanup_count || ' profile completion scores. ';
  
  -- Analyze tables for better query planning
  ANALYZE public.users;
  ANALYZE public.portfolios;
  ANALYZE public.images;
  ANALYZE public.portfolio_skills;
  ANALYZE public.portfolio_tags;
  ANALYZE public.portfolio_analytics;
  ANALYZE public.user_activities;
  
  result_text := result_text || 'Database analysis completed.';
  
  RETURN result_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.refresh_portfolio_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_portfolios_optimized(TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, INTEGER, INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.analyze_slow_queries() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_db_performance_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.perform_maintenance() TO authenticated;

-- Create a scheduled job placeholder (would need pg_cron extension)
-- This is a comment as pg_cron might not be available in all environments
-- SELECT cron.schedule('refresh-portfolio-stats', '*/30 * * * *', 'SELECT public.refresh_portfolio_stats();');
-- SELECT cron.schedule('daily-maintenance', '0 2 * * *', 'SELECT public.perform_maintenance();');
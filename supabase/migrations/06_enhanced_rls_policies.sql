-- Enhanced Row Level Security (RLS) policies for Spotlight
-- This migration adds comprehensive and granular security policies

-- Enable RLS on new tables
ALTER TABLE public.portfolio_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_analytics ENABLE ROW LEVEL SECURITY;

-- Create admin role check function
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND email IN (
      'admin@spotlight.com',
      'support@spotlight.com'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create portfolio owner check function
CREATE OR REPLACE FUNCTION public.is_portfolio_owner(portfolio_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.portfolios 
    WHERE id = portfolio_uuid 
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced policies for users table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Users can view their own profile
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Users can view basic info of users with published portfolios
CREATE POLICY "users_select_published_portfolio_owners" ON public.users
    FOR SELECT USING (
        id IN (
            SELECT user_id FROM public.portfolios 
            WHERE is_published = true
        )
    );

-- Users can update their own profile
CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (handled by trigger)
CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "admins_select_all_users" ON public.users
    FOR SELECT USING (public.is_admin_user());

-- Enhanced policies for portfolios table
DROP POLICY IF EXISTS "Users can view their own portfolios" ON public.portfolios;
DROP POLICY IF EXISTS "Users can view published portfolios" ON public.portfolios;
DROP POLICY IF EXISTS "Users can insert their own portfolios" ON public.portfolios;
DROP POLICY IF EXISTS "Users can update their own portfolios" ON public.portfolios;
DROP POLICY IF EXISTS "Users can delete their own portfolios" ON public.portfolios;

-- Users can view their own portfolios (any status)
CREATE POLICY "portfolios_select_own" ON public.portfolios
    FOR SELECT USING (auth.uid() = user_id);

-- Anyone can view published portfolios
CREATE POLICY "portfolios_select_published" ON public.portfolios
    FOR SELECT USING (is_published = true AND status = 'PUBLISHED');

-- Users can insert their own portfolios
CREATE POLICY "portfolios_insert_own" ON public.portfolios
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own portfolios
CREATE POLICY "portfolios_update_own" ON public.portfolios
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own portfolios
CREATE POLICY "portfolios_delete_own" ON public.portfolios
    FOR DELETE USING (auth.uid() = user_id);

-- Admins can view all portfolios
CREATE POLICY "admins_select_all_portfolios" ON public.portfolios
    FOR SELECT USING (public.is_admin_user());

-- Enhanced policies for images table
DROP POLICY IF EXISTS "Users can view their own images" ON public.images;
DROP POLICY IF EXISTS "Users can view images from published portfolios" ON public.images;
DROP POLICY IF EXISTS "Users can insert their own images" ON public.images;
DROP POLICY IF EXISTS "Users can update their own images" ON public.images;
DROP POLICY IF EXISTS "Users can delete their own images" ON public.images;

-- Users can view their own images
CREATE POLICY "images_select_own" ON public.images
    FOR SELECT USING (auth.uid() = user_id);

-- Anyone can view images from published portfolios
CREATE POLICY "images_select_published_portfolios" ON public.images
    FOR SELECT USING (
        portfolio_id IS NULL OR -- Profile images
        EXISTS (
            SELECT 1 FROM public.portfolios 
            WHERE portfolios.id = images.portfolio_id 
            AND portfolios.is_published = true
            AND portfolios.status = 'PUBLISHED'
        )
    );

-- Users can insert their own images
CREATE POLICY "images_insert_own" ON public.images
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        (portfolio_id IS NULL OR public.is_portfolio_owner(portfolio_id))
    );

-- Users can update their own images
CREATE POLICY "images_update_own" ON public.images
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own images
CREATE POLICY "images_delete_own" ON public.images
    FOR DELETE USING (auth.uid() = user_id);

-- Admins can moderate images
CREATE POLICY "admins_update_image_moderation" ON public.images
    FOR UPDATE USING (public.is_admin_user())
    WITH CHECK (public.is_admin_user());

-- Policies for portfolio_skills table
CREATE POLICY "portfolio_skills_select_published" ON public.portfolio_skills
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.portfolios 
            WHERE portfolios.id = portfolio_skills.portfolio_id 
            AND (
                portfolios.is_published = true OR 
                portfolios.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "portfolio_skills_insert_own" ON public.portfolio_skills
    FOR INSERT WITH CHECK (public.is_portfolio_owner(portfolio_id));

CREATE POLICY "portfolio_skills_update_own" ON public.portfolio_skills
    FOR UPDATE USING (public.is_portfolio_owner(portfolio_id))
    WITH CHECK (public.is_portfolio_owner(portfolio_id));

CREATE POLICY "portfolio_skills_delete_own" ON public.portfolio_skills
    FOR DELETE USING (public.is_portfolio_owner(portfolio_id));

-- Policies for portfolio_tags table
CREATE POLICY "portfolio_tags_select_published" ON public.portfolio_tags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.portfolios 
            WHERE portfolios.id = portfolio_tags.portfolio_id 
            AND (
                portfolios.is_published = true OR 
                portfolios.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "portfolio_tags_insert_own" ON public.portfolio_tags
    FOR INSERT WITH CHECK (public.is_portfolio_owner(portfolio_id));

CREATE POLICY "portfolio_tags_update_own" ON public.portfolio_tags
    FOR UPDATE USING (public.is_portfolio_owner(portfolio_id))
    WITH CHECK (public.is_portfolio_owner(portfolio_id));

CREATE POLICY "portfolio_tags_delete_own" ON public.portfolio_tags
    FOR DELETE USING (public.is_portfolio_owner(portfolio_id));

-- Policies for user_activities table
CREATE POLICY "user_activities_select_own" ON public.user_activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_activities_insert_system" ON public.user_activities
    FOR INSERT WITH CHECK (true); -- System can insert activities

-- Admins can view all activities
CREATE POLICY "admins_select_all_activities" ON public.user_activities
    FOR SELECT USING (public.is_admin_user());

-- Policies for portfolio_analytics table
CREATE POLICY "portfolio_analytics_select_own" ON public.portfolio_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.portfolios 
            WHERE portfolios.id = portfolio_analytics.portfolio_id 
            AND portfolios.user_id = auth.uid()
        )
    );

CREATE POLICY "portfolio_analytics_insert_system" ON public.portfolio_analytics
    FOR INSERT WITH CHECK (true); -- System can insert analytics

CREATE POLICY "portfolio_analytics_update_system" ON public.portfolio_analytics
    FOR UPDATE USING (true); -- System can update analytics

-- Admins can view all analytics
CREATE POLICY "admins_select_all_analytics" ON public.portfolio_analytics
    FOR SELECT USING (public.is_admin_user());

-- Enhanced policies for announcements table
DROP POLICY IF EXISTS "Anyone can view active announcements" ON public.announcements;

-- Anyone can view active announcements
CREATE POLICY "announcements_select_active" ON public.announcements
    FOR SELECT USING (is_active = true AND start_date <= NOW() AND (end_date IS NULL OR end_date >= NOW()));

-- Admins can manage announcements
CREATE POLICY "admins_manage_announcements" ON public.announcements
    FOR ALL USING (public.is_admin_user())
    WITH CHECK (public.is_admin_user());

-- Create rate limiting policies
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    user_uuid UUID,
    action_type TEXT,
    max_actions INTEGER,
    time_window INTERVAL
)
RETURNS BOOLEAN AS $$
DECLARE
    action_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO action_count
    FROM public.user_activities
    WHERE 
        user_id = user_uuid
        AND activity_type = action_type
        AND created_at > NOW() - time_window;
    
    RETURN action_count < max_actions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policy to limit portfolio creation (max 5 per day)
CREATE POLICY "portfolios_rate_limit" ON public.portfolios
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        public.check_rate_limit(auth.uid(), 'portfolio_create', 5, INTERVAL '1 day')
    );

-- Create policy to limit image uploads (max 50 per day)
CREATE POLICY "images_rate_limit" ON public.images
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        public.check_rate_limit(auth.uid(), 'image_upload', 50, INTERVAL '1 day')
    );

-- Create function to handle portfolio view tracking with rate limiting
CREATE OR REPLACE FUNCTION public.track_portfolio_view(
    portfolio_slug TEXT,
    viewer_ip INET DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    portfolio_uuid UUID;
    recent_views INTEGER;
BEGIN
    -- Get portfolio ID
    SELECT id INTO portfolio_uuid
    FROM public.portfolios
    WHERE slug = portfolio_slug AND is_published = true;
    
    IF portfolio_uuid IS NULL THEN
        RETURN;
    END IF;
    
    -- Check for rate limiting (same IP, max 1 view per hour)
    IF viewer_ip IS NOT NULL THEN
        SELECT COUNT(*) INTO recent_views
        FROM public.user_activities
        WHERE 
            activity_type = 'portfolio_view'
            AND activity_data->>'portfolio_id' = portfolio_uuid::TEXT
            AND ip_address = viewer_ip
            AND created_at > NOW() - INTERVAL '1 hour';
        
        IF recent_views > 0 THEN
            RETURN; -- Skip duplicate view from same IP within an hour
        END IF;
    END IF;
    
    -- Increment view count
    PERFORM public.increment_portfolio_views(portfolio_slug);
    
    -- Update analytics
    PERFORM public.update_portfolio_analytics(portfolio_uuid);
    
    -- Log activity if viewer IP is provided
    IF viewer_ip IS NOT NULL THEN
        PERFORM public.log_user_activity(
            (SELECT user_id FROM public.portfolios WHERE id = portfolio_uuid),
            'portfolio_view',
            jsonb_build_object(
                'portfolio_id', portfolio_uuid,
                'portfolio_slug', portfolio_slug,
                'viewer_ip', viewer_ip
            ),
            viewer_ip
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user can publish portfolio
CREATE OR REPLACE FUNCTION public.can_publish_portfolio(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_record RECORD;
    required_image_count INTEGER := 1;
    actual_image_count INTEGER;
BEGIN
    -- Get user information
    SELECT * INTO user_record FROM public.users WHERE id = user_uuid;
    
    IF user_record IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if email is verified
    IF NOT user_record.is_email_verified THEN
        RETURN FALSE;
    END IF;
    
    -- Check if profile is sufficiently complete (at least 70%)
    IF user_record.profile_completion_percentage < 70 THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user has uploaded at least required number of images
    SELECT COUNT(*) INTO actual_image_count
    FROM public.images
    WHERE user_id = user_uuid AND moderation_status = 'approved';
    
    IF actual_image_count < required_image_count THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policy to enforce publishing requirements
CREATE POLICY "portfolios_publish_requirements" ON public.portfolios
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id AND
        (
            -- Allow if not publishing (is_published = false)
            is_published = false OR
            -- Allow publishing only if requirements are met
            (is_published = true AND public.can_publish_portfolio(auth.uid()))
        )
    );

-- Create security functions for content moderation
CREATE OR REPLACE FUNCTION public.report_inappropriate_content(
    content_type TEXT, -- 'portfolio', 'image', 'user'
    content_id UUID,
    reason TEXT,
    description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    report_id UUID;
BEGIN
    -- This would typically insert into a reports table
    -- For now, we'll log it as an activity
    PERFORM public.log_user_activity(
        auth.uid(),
        'content_report',
        jsonb_build_object(
            'content_type', content_type,
            'content_id', content_id,
            'reason', reason,
            'description', description
        )
    );
    
    RETURN gen_random_uuid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_portfolio_owner(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(UUID, TEXT, INTEGER, INTERVAL) TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_portfolio_view(TEXT, INET) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.can_publish_portfolio(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.report_inappropriate_content(TEXT, UUID, TEXT, TEXT) TO authenticated;
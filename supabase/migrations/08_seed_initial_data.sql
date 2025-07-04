-- Seed initial data for Spotlight
-- This migration populates the database with initial templates, announcements, and sample data

-- Insert initial announcement
INSERT INTO public.announcements (title, content, type, is_active, start_date) 
VALUES (
  'Welcome to Spotlight!',
  'Create your professional portfolio in under 5 minutes. Choose from 4 stunning templates and showcase your talent to the world.',
  'info',
  true,
  NOW()
) ON CONFLICT DO NOTHING;

-- Insert template information announcement
INSERT INTO public.announcements (title, content, type, is_active, start_date) 
VALUES (
  'New Template Available',
  'Check out our latest portfolio templates designed specifically for actors and models. Each template is mobile-optimized and SEO-friendly.',
  'success',
  true,
  NOW()
) ON CONFLICT DO NOTHING;

-- Create sample skills data for common industry skills
INSERT INTO public.portfolio_skills (portfolio_id, skill_name, skill_level, years_experience)
SELECT 
  p.id,
  skill_data.skill_name,
  skill_data.skill_level,
  skill_data.years_experience
FROM 
  public.portfolios p,
  (VALUES 
    ('Acting', 'advanced', 5),
    ('Commercial Acting', 'intermediate', 3),
    ('Theater', 'expert', 8),
    ('Voice Acting', 'beginner', 1),
    ('Method Acting', 'advanced', 4),
    ('Improvisation', 'intermediate', 2),
    ('Stage Combat', 'beginner', 1),
    ('Singing', 'intermediate', 6),
    ('Dancing', 'advanced', 10),
    ('Modeling', 'expert', 7),
    ('Fashion Modeling', 'advanced', 5),
    ('Commercial Modeling', 'expert', 6),
    ('Fitness Modeling', 'intermediate', 3),
    ('Print Modeling', 'advanced', 4),
    ('Runway Modeling', 'intermediate', 2),
    ('Photography', 'beginner', 1),
    ('Choreography', 'intermediate', 4),
    ('Martial Arts', 'advanced', 8),
    ('Yoga', 'intermediate', 3),
    ('Sports', 'advanced', 12)
  ) AS skill_data(skill_name, skill_level, years_experience)
WHERE p.is_published = false -- Only add to non-published portfolios to avoid affecting real data
LIMIT 0; -- Set to 0 to prevent actual insertion, change to higher number if you want sample data

-- Create common portfolio tags
INSERT INTO public.portfolio_tags (portfolio_id, tag_name)
SELECT 
  p.id,
  tag_data.tag_name
FROM 
  public.portfolios p,
  (VALUES 
    ('Actor'),
    ('Model'),
    ('Performer'),
    ('Professional'),
    ('Experienced'),
    ('Versatile'),
    ('Commercial'),
    ('Theater'),
    ('Film'),
    ('Television'),
    ('Fashion'),
    ('Fitness'),
    ('Lifestyle'),
    ('Editorial'),
    ('Beauty'),
    ('Portrait'),
    ('Headshots'),
    ('Available'),
    ('Booking'),
    ('Talent')
  ) AS tag_data(tag_name)
WHERE p.is_published = false -- Only add to non-published portfolios to avoid affecting real data
LIMIT 0; -- Set to 0 to prevent actual insertion

-- Create template style definitions (as JSON for frontend use)
-- This would typically be stored in a templates table, but for now we'll use a function
CREATE OR REPLACE FUNCTION public.get_template_definitions()
RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object(
    'T1', jsonb_build_object(
      'name', 'Classic Professional',
      'description', 'A timeless, clean design perfect for traditional headshots and professional portfolios.',
      'features', jsonb_build_array(
        'Clean typography',
        'Grid-based layout',
        'Professional color scheme',
        'Mobile responsive',
        'SEO optimized'
      ),
      'best_for', jsonb_build_array(
        'Corporate headshots',
        'Business professionals',
        'Traditional acting portfolios',
        'Conservative industries'
      ),
      'color_scheme', jsonb_build_object(
        'primary', '#1a365d',
        'secondary', '#2c5aa0',
        'accent', '#e53e3e',
        'neutral', '#f7fafc',
        'text', '#2d3748'
      ),
      'layout_options', jsonb_build_object(
        'header_style', 'centered',
        'navigation', 'horizontal',
        'gallery_style', 'grid',
        'contact_position', 'footer'
      )
    ),
    'T2', jsonb_build_object(
      'name', 'Modern Bold',
      'description', 'Contemporary design with bold typography and vibrant colors for creative professionals.',
      'features', jsonb_build_array(
        'Bold typography',
        'Asymmetric layout',
        'Vibrant color palette',
        'Interactive elements',
        'Social media integration'
      ),
      'best_for', jsonb_build_array(
        'Creative industries',
        'Young professionals',
        'Social media influencers',
        'Fashion models'
      ),
      'color_scheme', jsonb_build_object(
        'primary', '#805ad5',
        'secondary', '#d53f8c',
        'accent', '#38b2ac',
        'neutral', '#fafafa',
        'text', '#1a202c'
      ),
      'layout_options', jsonb_build_object(
        'header_style', 'left_aligned',
        'navigation', 'sidebar',
        'gallery_style', 'masonry',
        'contact_position', 'floating'
      )
    ),
    'T3', jsonb_build_object(
      'name', 'Minimal Elegant',
      'description', 'Sophisticated minimalist design focusing on content with subtle animations.',
      'features', jsonb_build_array(
        'Minimalist design',
        'Elegant typography',
        'Subtle animations',
        'Content-focused',
        'Fast loading'
      ),
      'best_for', jsonb_build_array(
        'Fine art models',
        'Editorial photography',
        'Luxury brands',
        'Artistic portfolios'
      ),
      'color_scheme', jsonb_build_object(
        'primary', '#2d3748',
        'secondary', '#4a5568',
        'accent', '#e2e8f0',
        'neutral', '#ffffff',
        'text', '#1a202c'
      ),
      'layout_options', jsonb_build_object(
        'header_style', 'minimal',
        'navigation', 'top_bar',
        'gallery_style', 'slider',
        'contact_position', 'inline'
      )
    ),
    'T4', jsonb_build_object(
      'name', 'Creative Artistic',
      'description', 'Unique artistic layout with creative elements and dynamic presentation.',
      'features', jsonb_build_array(
        'Artistic layout',
        'Creative elements',
        'Dynamic presentation',
        'Custom animations',
        'Unique styling'
      ),
      'best_for', jsonb_build_array(
        'Creative artists',
        'Performers',
        'Unique personalities',
        'Alternative styles'
      ),
      'color_scheme', jsonb_build_object(
        'primary', '#e53e3e',
        'secondary', '#dd6b20',
        'accent', '#38b2ac',
        'neutral', '#f8f9fa',
        'text', '#2d3748'
      ),
      'layout_options', jsonb_build_object(
        'header_style', 'artistic',
        'navigation', 'creative',
        'gallery_style', 'collage',
        'contact_position', 'integrated'
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get industry-specific skill suggestions
CREATE OR REPLACE FUNCTION public.get_skill_suggestions(industry_type TEXT DEFAULT 'general')
RETURNS JSONB AS $$
BEGIN
  RETURN CASE industry_type
    WHEN 'acting' THEN jsonb_build_array(
      'Method Acting', 'Improvisation', 'Voice Acting', 'Stage Combat', 
      'Character Development', 'Script Analysis', 'Accent Work', 'Singing',
      'Dancing', 'Musical Theater', 'Shakespeare', 'Comedy', 'Drama',
      'Commercial Acting', 'Film Acting', 'Television', 'Theater'
    )
    WHEN 'modeling' THEN jsonb_build_array(
      'Fashion Modeling', 'Commercial Modeling', 'Runway Modeling', 
      'Print Modeling', 'Fitness Modeling', 'Beauty Modeling', 'Editorial',
      'Lifestyle Modeling', 'Plus Size Modeling', 'Petite Modeling',
      'Hand Modeling', 'Foot Modeling', 'Hair Modeling', 'Promotional Modeling'
    )
    WHEN 'performance' THEN jsonb_build_array(
      'Singing', 'Dancing', 'Musical Theater', 'Choreography', 'Acrobatics',
      'Circus Arts', 'Fire Performance', 'Magic', 'Comedy', 'Stand-up',
      'Mime', 'Juggling', 'Martial Arts', 'Stunt Work', 'Voice Over'
    )
    ELSE jsonb_build_array(
      'Acting', 'Modeling', 'Singing', 'Dancing', 'Photography', 'Performance',
      'Public Speaking', 'Presentation', 'Communication', 'Teamwork',
      'Time Management', 'Adaptability', 'Creativity', 'Professionalism'
    )
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get portfolio completion tips
CREATE OR REPLACE FUNCTION public.get_portfolio_tips(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  user_record RECORD;
  portfolio_count INTEGER;
  image_count INTEGER;
  tips JSONB := '[]'::jsonb;
BEGIN
  -- Get user information
  SELECT * INTO user_record FROM public.users WHERE id = user_uuid;
  
  IF user_record IS NULL THEN
    RETURN jsonb_build_array('User not found');
  END IF;
  
  -- Check various completion aspects and provide tips
  IF user_record.full_name IS NULL OR length(user_record.full_name) = 0 THEN
    tips := tips || jsonb_build_array('Add your full name to help people find and remember you');
  END IF;
  
  IF user_record.bio IS NULL OR length(user_record.bio) < 50 THEN
    tips := tips || jsonb_build_array('Write a compelling bio (at least 50 characters) to tell your story');
  END IF;
  
  IF user_record.avatar_url IS NULL THEN
    tips := tips || jsonb_build_array('Upload a professional profile photo');
  END IF;
  
  IF user_record.location IS NULL THEN
    tips := tips || jsonb_build_array('Add your location to help with local opportunities');
  END IF;
  
  IF NOT user_record.is_email_verified THEN
    tips := tips || jsonb_build_array('Verify your email address to enable portfolio publishing');
  END IF;
  
  -- Check portfolio status
  SELECT COUNT(*) INTO portfolio_count FROM public.portfolios WHERE user_id = user_uuid;
  IF portfolio_count = 0 THEN
    tips := tips || jsonb_build_array('Create your first portfolio to showcase your work');
  END IF;
  
  -- Check image uploads
  SELECT COUNT(*) INTO image_count FROM public.images WHERE user_id = user_uuid;
  IF image_count = 0 THEN
    tips := tips || jsonb_build_array('Upload high-quality photos to make your portfolio shine');
  ELSIF image_count < 3 THEN
    tips := tips || jsonb_build_array('Add more photos to give a complete picture of your abilities');
  END IF;
  
  -- If no tips, provide encouragement
  IF jsonb_array_length(tips) = 0 THEN
    tips := jsonb_build_array(
      'Your profile looks great! Consider adding more photos or updating your bio',
      'Share your portfolio on social media to increase visibility',
      'Regularly update your portfolio with new work and achievements'
    );
  END IF;
  
  RETURN tips;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get industry statistics
CREATE OR REPLACE FUNCTION public.get_industry_stats()
RETURNS JSONB AS $$
DECLARE
  total_users INTEGER;
  total_portfolios INTEGER;
  published_portfolios INTEGER;
  total_images INTEGER;
  popular_skills JSONB;
  template_usage JSONB;
BEGIN
  -- Get basic counts
  SELECT COUNT(*) INTO total_users FROM public.users;
  SELECT COUNT(*) INTO total_portfolios FROM public.portfolios;
  SELECT COUNT(*) INTO published_portfolios FROM public.portfolios WHERE is_published = true;
  SELECT COUNT(*) INTO total_images FROM public.images;
  
  -- Get popular skills
  SELECT jsonb_agg(
    jsonb_build_object(
      'skill', skill_name,
      'count', usage_count,
      'avg_experience', avg_experience
    )
  ) INTO popular_skills
  FROM public.get_popular_skills(10);
  
  -- Get template usage
  SELECT jsonb_object_agg(template, count) INTO template_usage
  FROM (
    SELECT template, COUNT(*) as count
    FROM public.portfolios
    WHERE is_published = true
    GROUP BY template
  ) t;
  
  RETURN jsonb_build_object(
    'total_users', total_users,
    'total_portfolios', total_portfolios,
    'published_portfolios', published_portfolios,
    'total_images', total_images,
    'publish_rate', CASE WHEN total_portfolios > 0 THEN ROUND((published_portfolios::NUMERIC / total_portfolios) * 100, 1) ELSE 0 END,
    'avg_images_per_portfolio', CASE WHEN published_portfolios > 0 THEN ROUND(total_images::NUMERIC / published_portfolios, 1) ELSE 0 END,
    'popular_skills', COALESCE(popular_skills, '[]'::jsonb),
    'template_usage', COALESCE(template_usage, '{}'::jsonb),
    'updated_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create sample user activity data patterns (for demo purposes)
CREATE OR REPLACE FUNCTION public.create_sample_activity_data()
RETURNS TEXT AS $$
DECLARE
  sample_user_id UUID;
  activity_types TEXT[] := ARRAY[
    'login', 'profile_update', 'portfolio_create', 'portfolio_update', 
    'image_upload', 'portfolio_view', 'portfolio_publish'
  ];
  i INTEGER;
BEGIN
  -- This function is for demonstration purposes only
  -- It creates sample activity data for testing analytics
  
  -- Note: This should only be run in development environments
  IF current_setting('server_environment', true) = 'production' THEN
    RETURN 'Sample data creation is disabled in production';
  END IF;
  
  -- Get first user ID (if any)
  SELECT id INTO sample_user_id FROM public.users LIMIT 1;
  
  IF sample_user_id IS NULL THEN
    RETURN 'No users found to create sample data';
  END IF;
  
  -- Create sample activities for the past 30 days
  FOR i IN 1..100 LOOP
    INSERT INTO public.user_activities (
      user_id,
      activity_type,
      activity_data,
      created_at
    ) VALUES (
      sample_user_id,
      activity_types[1 + (i % array_length(activity_types, 1))],
      jsonb_build_object(
        'sample_data', true,
        'iteration', i,
        'timestamp', NOW() - (random() * INTERVAL '30 days')
      ),
      NOW() - (random() * INTERVAL '30 days')
    );
  END LOOP;
  
  RETURN 'Created 100 sample activity records';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to functions
GRANT EXECUTE ON FUNCTION public.get_template_definitions() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_skill_suggestions(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_portfolio_tips(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_industry_stats() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.create_sample_activity_data() TO authenticated;

-- Update search vector for any existing portfolios
UPDATE public.portfolios SET updated_at = updated_at WHERE id IS NOT NULL;
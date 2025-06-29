-- Setup storage buckets for image uploads
-- This creates the necessary storage buckets and policies

-- Create storage bucket for user uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'user-uploads',
    'user-uploads',
    true,
    52428800, -- 50MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for portfolio images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'portfolios',
    'portfolios',
    true,
    52428800, -- 50MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for user-uploads bucket
CREATE POLICY "Users can view all uploaded images" ON storage.objects
    FOR SELECT USING (bucket_id = 'user-uploads');

CREATE POLICY "Users can upload images to their own folder" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'user-uploads' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'user-uploads' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'user-uploads' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for portfolios bucket
CREATE POLICY "Anyone can view portfolio images" ON storage.objects
    FOR SELECT USING (bucket_id = 'portfolios');

CREATE POLICY "Users can upload images to their own portfolio folder" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'portfolios' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own portfolio images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'portfolios' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own portfolio images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'portfolios' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
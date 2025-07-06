import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ImageOptimizationService } from '@/lib/image-optimization';
import { ImageFormatDetector } from '@/utils/image-format';
import { ImageType } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const imageType = formData.get('imageType') as ImageType;
    const portfolioId = formData.get('portfolioId') as string;
    const altText = formData.get('altText') as string;
    const sortOrder = formData.get('sortOrder') as string;
    const generateVariants = formData.get('generateVariants') === 'true';
    const optimizeFormat = formData.get('optimizeFormat') === 'true';

    if (!file || !imageType) {
      return NextResponse.json(
        { error: 'File and image type are required' },
        { status: 400 }
      );
    }

    // Validate file
    const validationResult = await validateFile(file);
    if (!validationResult.valid) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${user.id}/${portfolioId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;

    // Upload original file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('portfolio-images')
      .upload(fileName, file, {
        cacheControl: '31536000', // 1 year cache
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Generate optimized URLs
    const optimizedUrls = ImageOptimizationService.generateOptimizedUrls(
      'portfolio-images',
      fileName,
      imageType
    );

    // Create database record
    const { data: imageRecord, error: dbError } = await supabase
      .from('images')
      .insert({
        user_id: user.id,
        portfolio_id: portfolioId,
        file_name: fileName,
        file_path: uploadData.path,
        original_name: file.name,
        mime_type: file.type,
        file_size: file.size,
        image_type: imageType,
        alt_text: altText || '',
        sort_order: sortOrder ? parseInt(sortOrder) : 0,
        width: null, // Will be updated after processing
        height: null, // Will be updated after processing
        metadata: {
          optimized_urls: optimizedUrls,
          variants_generated: generateVariants,
          format_optimized: optimizeFormat,
          upload_timestamp: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      
      // Clean up uploaded file
      await supabase.storage
        .from('portfolio-images')
        .remove([fileName]);
      
      return NextResponse.json(
        { error: 'Failed to save image record' },
        { status: 500 }
      );
    }

    // Generate variants if requested
    if (generateVariants) {
      // This would typically be done in a background job
      // For now, we'll return the URLs that will be generated on-demand
      console.log('Variants will be generated on-demand via transformation API');
    }

    // Return success response
    return NextResponse.json({
      success: true,
      image: {
        id: imageRecord.id,
        fileName,
        originalName: file.name,
        fileSize: file.size,
        imageType,
        urls: optimizedUrls,
      },
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function validateFile(file: File) {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, WebP, and AVIF are allowed.',
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 10MB.',
    };
  }

  // Check image dimensions
  try {
    const dimensions = await getImageDimensions(file);
    
    // Maximum dimensions
    const maxWidth = 4000;
    const maxHeight = 4000;
    
    if (dimensions.width > maxWidth || dimensions.height > maxHeight) {
      return {
        valid: false,
        error: `Image dimensions too large. Maximum is ${maxWidth}x${maxHeight}px.`,
      };
    }

    // Minimum dimensions
    const minWidth = 100;
    const minHeight = 100;
    
    if (dimensions.width < minWidth || dimensions.height < minHeight) {
      return {
        valid: false,
        error: `Image dimensions too small. Minimum is ${minWidth}x${minHeight}px.`,
      };
    }

  } catch (error) {
    return {
      valid: false,
      error: 'Unable to process image. Please ensure it is a valid image file.',
    };
  }

  return { valid: true };
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}
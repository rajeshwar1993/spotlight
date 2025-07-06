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

    const { imageId, bucketName, fileName, imageType, optimizations } = await request.json();

    if (!imageId || !bucketName || !fileName || !imageType) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify image ownership
    const { data: imageRecord, error: imageError } = await supabase
      .from('images')
      .select('*')
      .eq('id', imageId)
      .eq('user_id', user.id)
      .single();

    if (imageError || !imageRecord) {
      return NextResponse.json(
        { error: 'Image not found or unauthorized' },
        { status: 404 }
      );
    }

    // Generate optimized URLs with custom options
    const optimizedUrls = await generateCustomOptimizedUrls(
      bucketName,
      fileName,
      imageType as ImageType,
      optimizations
    );

    // Update image metadata
    const { error: updateError } = await supabase
      .from('images')
      .update({
        metadata: {
          ...imageRecord.metadata,
          optimized_urls: optimizedUrls,
          optimization_timestamp: new Date().toISOString(),
          custom_optimizations: optimizations,
        },
      })
      .eq('id', imageId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update image metadata' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      optimizedUrls,
    });

  } catch (error) {
    console.error('Optimization error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const bucketName = url.searchParams.get('bucket');
    const fileName = url.searchParams.get('file');
    const imageType = url.searchParams.get('type');
    const variant = url.searchParams.get('variant');
    const format = url.searchParams.get('format');
    const quality = url.searchParams.get('quality');
    const width = url.searchParams.get('width');
    const height = url.searchParams.get('height');

    if (!bucketName || !fileName || !imageType) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Generate optimized URL based on parameters
    let optimizedUrl: string;

    if (variant) {
      // Get predefined variant
      const optimizedUrls = ImageOptimizationService.generateOptimizedUrls(
        bucketName,
        fileName,
        imageType as ImageType
      );
      optimizedUrl = optimizedUrls.variants[variant] || optimizedUrls.original;
    } else {
      // Generate custom transformation
      const transformOptions: any = {};
      
      if (width) transformOptions.width = parseInt(width);
      if (height) transformOptions.height = parseInt(height);
      if (quality) transformOptions.quality = parseInt(quality);
      if (format) transformOptions.format = format;

      // Use private method through a custom implementation
      optimizedUrl = await generateCustomTransformation(
        bucketName,
        fileName,
        transformOptions
      );
    }

    // Return redirect to optimized image
    return NextResponse.redirect(optimizedUrl);

  } catch (error) {
    console.error('Get optimization error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateCustomOptimizedUrls(
  bucketName: string,
  fileName: string,
  imageType: ImageType,
  customOptions: any = {}
) {
  const baseUrls = ImageOptimizationService.generateOptimizedUrls(
    bucketName,
    fileName,
    imageType
  );

  // Apply custom optimizations
  const optimizedUrls = { ...baseUrls };

  if (customOptions.formats) {
    // Generate variants in different formats
    for (const format of customOptions.formats) {
      const formatUrls = await generateFormatVariants(
        bucketName,
        fileName,
        imageType,
        format
      );
      optimizedUrls.variants = { ...optimizedUrls.variants, ...formatUrls };
    }
  }

  if (customOptions.sizes) {
    // Generate custom sizes
    for (const size of customOptions.sizes) {
      const sizeUrl = await generateCustomTransformation(
        bucketName,
        fileName,
        {
          width: size.width,
          height: size.height,
          quality: size.quality || 85,
          format: size.format || 'webp',
        }
      );
      optimizedUrls.variants[`custom_${size.width}x${size.height}`] = sizeUrl;
    }
  }

  return optimizedUrls;
}

async function generateFormatVariants(
  bucketName: string,
  fileName: string,
  imageType: ImageType,
  format: string
) {
  const variants: Record<string, string> = {};
  const sizes = [
    { name: 'thumbnail', width: 150 },
    { name: 'small', width: 300 },
    { name: 'medium', width: 600 },
    { name: 'large', width: 1200 },
  ];

  for (const size of sizes) {
    const url = await generateCustomTransformation(
      bucketName,
      fileName,
      {
        width: size.width,
        format,
        quality: await ImageFormatDetector.getOptimalQuality(format, 85),
      }
    );
    variants[`${size.name}_${format}`] = url;
  }

  return variants;
}

async function generateCustomTransformation(
  bucketName: string,
  fileName: string,
  options: any
) {
  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/render/image/public/${bucketName}/${fileName}`;
  const params = new URLSearchParams();

  if (options.width) params.append('width', options.width.toString());
  if (options.height) params.append('height', options.height.toString());
  if (options.quality) params.append('quality', options.quality.toString());
  if (options.format) params.append('format', options.format);
  if (options.resize) params.append('resize', options.resize);

  return `${baseUrl}?${params.toString()}`;
}
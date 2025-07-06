import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ImageOptimizationService } from '@/lib/image-optimization';
import { ImageType } from '@/types/database';

interface BatchUploadItem {
  file: File;
  imageType: ImageType;
  altText?: string;
  sortOrder?: number;
}

interface BatchUploadResult {
  success: boolean;
  results: Array<{
    fileName: string;
    originalName: string;
    success: boolean;
    error?: string;
    imageId?: string;
    urls?: any;
  }>;
}

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
    const portfolioId = formData.get('portfolioId') as string;
    const generateVariants = formData.get('generateVariants') === 'true';
    const optimizeFormat = formData.get('optimizeFormat') === 'true';

    if (!portfolioId) {
      return NextResponse.json(
        { error: 'Portfolio ID is required' },
        { status: 400 }
      );
    }

    // Extract files and metadata
    const uploadItems: BatchUploadItem[] = [];
    const fileEntries = Array.from(formData.entries()).filter(([key]) => key.startsWith('file_'));

    for (const [key, value] of fileEntries) {
      const index = key.split('_')[1];
      const file = value as File;
      const imageType = formData.get(`imageType_${index}`) as ImageType;
      const altText = formData.get(`altText_${index}`) as string;
      const sortOrder = formData.get(`sortOrder_${index}`) as string;

      if (file && imageType) {
        uploadItems.push({
          file,
          imageType,
          altText,
          sortOrder: sortOrder ? parseInt(sortOrder) : undefined,
        });
      }
    }

    if (uploadItems.length === 0) {
      return NextResponse.json(
        { error: 'No valid files to upload' },
        { status: 400 }
      );
    }

    // Process uploads in parallel (with concurrency limit)
    const concurrencyLimit = 3;
    const results = await processUploadsInBatches(
      uploadItems,
      concurrencyLimit,
      async (item, index) => {
        return await processSingleUpload(
          supabase,
          item,
          user.id,
          portfolioId,
          index,
          generateVariants,
          optimizeFormat
        );
      }
    );

    // Calculate success rate
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    return NextResponse.json({
      success: successCount > 0,
      totalUploaded: successCount,
      totalAttempted: totalCount,
      results,
    });

  } catch (error) {
    console.error('Batch upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processUploadsInBatches<T, R>(
  items: T[],
  concurrencyLimit: number,
  processor: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += concurrencyLimit) {
    const batch = items.slice(i, i + concurrencyLimit);
    const batchPromises = batch.map((item, batchIndex) => 
      processor(item, i + batchIndex)
    );
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach((result, batchIndex) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error(`Upload failed for item ${i + batchIndex}:`, result.reason);
        // Create error result
        const errorResult = {
          fileName: '',
          originalName: batch[batchIndex]?.file?.name || 'unknown',
          success: false,
          error: result.reason?.message || 'Upload failed',
        } as R;
        results.push(errorResult);
      }
    });
  }
  
  return results;
}

async function processSingleUpload(
  supabase: any,
  item: BatchUploadItem,
  userId: string,
  portfolioId: string,
  index: number,
  generateVariants: boolean,
  optimizeFormat: boolean
) {
  try {
    // Validate file
    const validationResult = await validateFile(item.file);
    if (!validationResult.valid) {
      return {
        fileName: '',
        originalName: item.file.name,
        success: false,
        error: validationResult.error,
      };
    }

    // Generate unique filename
    const fileExtension = item.file.name.split('.').pop()?.toLowerCase();
    const fileName = `${userId}/${portfolioId}/${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('portfolio-images')
      .upload(fileName, item.file, {
        cacheControl: '31536000', // 1 year cache
        upsert: false,
      });

    if (uploadError) {
      return {
        fileName: '',
        originalName: item.file.name,
        success: false,
        error: 'Failed to upload file',
      };
    }

    // Generate optimized URLs
    const optimizedUrls = ImageOptimizationService.generateOptimizedUrls(
      'portfolio-images',
      fileName,
      item.imageType
    );

    // Create database record
    const { data: imageRecord, error: dbError } = await supabase
      .from('images')
      .insert({
        user_id: userId,
        portfolio_id: portfolioId,
        file_name: fileName,
        file_path: uploadData.path,
        original_name: item.file.name,
        mime_type: item.file.type,
        file_size: item.file.size,
        image_type: item.imageType,
        alt_text: item.altText || '',
        sort_order: item.sortOrder || index,
        width: null, // Will be updated after processing
        height: null, // Will be updated after processing
        metadata: {
          optimized_urls: optimizedUrls,
          variants_generated: generateVariants,
          format_optimized: optimizeFormat,
          upload_timestamp: new Date().toISOString(),
          batch_index: index,
        },
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file
      await supabase.storage
        .from('portfolio-images')
        .remove([fileName]);
      
      return {
        fileName: '',
        originalName: item.file.name,
        success: false,
        error: 'Failed to save image record',
      };
    }

    return {
      fileName,
      originalName: item.file.name,
      success: true,
      imageId: imageRecord.id,
      urls: optimizedUrls,
    };

  } catch (error) {
    console.error('Single upload error:', error);
    return {
      fileName: '',
      originalName: item.file.name,
      success: false,
      error: 'Processing failed',
    };
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

  return { valid: true };
}
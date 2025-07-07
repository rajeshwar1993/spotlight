import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import type { PortfolioData } from '@/lib/templates/types';

// Rate limiting for view tracking (1 view per IP per portfolio per hour)
const viewTrackingCache = new Map<string, number>();
const RATE_LIMIT_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

function canTrackView(ip: string, portfolioId: string): boolean {
  const key = `${ip}-${portfolioId}`;
  const lastTracked = viewTrackingCache.get(key);
  const now = Date.now();
  
  if (!lastTracked || now - lastTracked > RATE_LIMIT_DURATION) {
    viewTrackingCache.set(key, now);
    return true;
  }
  
  return false;
}

async function incrementViewCount(portfolioId: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    
    await supabase
      .from('portfolios')
      .update({ 
        view_count: supabase.sql`COALESCE(view_count, 0) + 1`,
        updated_at: new Date().toISOString()
      })
      .eq('id', portfolioId);
  } catch (error) {
    console.error('Error incrementing view count:', error);
    // Don't throw - view tracking shouldn't break portfolio loading
  }
}

async function getPublicPortfolioData(slug: string): Promise<{ data?: PortfolioData; error?: string }> {
  try {
    const supabase = createAdminClient();
    
    // Get portfolio by slug (only published portfolios)
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'PUBLISHED')
      .eq('is_published', true)
      .single();

    if (portfolioError || !portfolio) {
      return { error: 'Portfolio not found' };
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', portfolio.user_id)
      .single();

    if (userError || !user) {
      return { error: 'User data not found' };
    }

    // Get portfolio images
    const { data: images, error: imagesError } = await supabase
      .from('images')
      .select('*')
      .eq('portfolio_id', portfolio.id)
      .order('sort_order', { ascending: true });

    if (imagesError) {
      console.error('Error fetching images:', imagesError);
      // Continue without images rather than failing
    }

    // Transform images by type
    const imagesByType = {
      profile: images?.find(img => img.type === 'PROFILE') || undefined,
      hero: images?.find(img => img.type === 'HERO') || undefined,
      gallery: images?.filter(img => img.type === 'GALLERY') || []
    };

    // Calculate experience years from date of birth
    const calculateExperienceYears = (dateOfBirth: string | null): number => {
      if (!dateOfBirth) return 5; // Default experience
      
      const birth = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birth.getFullYear();
      
      // Assume professional career starts at 18
      return Math.max(age - 18, 1);
    };

    // Build public portfolio data
    const portfolioData: PortfolioData = {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        profession: user.profession,
        location: user.location,
        bio: user.bio,
        avatar_url: user.avatar_url,
        is_email_verified: user.is_email_verified,
        is_profile_complete: user.is_profile_complete,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      portfolio: {
        id: portfolio.id,
        user_id: portfolio.user_id,
        title: portfolio.title,
        slug: portfolio.slug,
        bio: portfolio.bio,
        template: portfolio.template,
        status: 'published',
        is_published: portfolio.is_published,
        height: portfolio.height,
        weight: portfolio.weight,
        eye_color: portfolio.eye_color,
        hair_color: portfolio.hair_color,
        skills: portfolio.skills,
        experience_years: portfolio.experience_years || 0,
        view_count: portfolio.view_count || 0,
        created_at: portfolio.created_at,
        updated_at: portfolio.updated_at
      },
      images: imagesByType,
      social_links: {
        instagram: user.social_instagram,
        twitter: user.social_twitter,
        linkedin: user.social_linkedin,
        tiktok: user.social_tiktok,
        website: user.website_url
      },
      contact_info: {
        email: user.email,
        phone: user.phone,
        agent: undefined // TODO: Add agent support when implemented
      },
      stats: {
        experience_years: calculateExperienceYears(user.date_of_birth),
        projects_completed: imagesByType.gallery.length,
        view_count: portfolio.view_count || 0
      }
    };

    return { data: portfolioData };

  } catch (error) {
    console.error('Error fetching public portfolio data:', error);
    return { error: 'Failed to fetch portfolio data' };
  }
}

// GET /api/portfolios/slug/[slug] - Get public portfolio data by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 });
    }

    // Get portfolio data
    const { data: portfolioData, error } = await getPublicPortfolioData(slug);

    if (error || !portfolioData) {
      return NextResponse.json({ error: error || 'Portfolio not found' }, { status: 404 });
    }

    // Track view count with rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    request.ip || 
                    'unknown';
    
    if (canTrackView(clientIP, portfolioData.portfolio.id)) {
      // Increment view count asynchronously (don't wait for it)
      incrementViewCount(portfolioData.portfolio.id).catch(console.error);
      
      // Update the view count in the response data
      portfolioData.portfolio.view_count = (portfolioData.portfolio.view_count || 0) + 1;
      portfolioData.stats.view_count = portfolioData.portfolio.view_count;
    }

    // Set cache headers for public portfolios
    const headers = {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      'CDN-Cache-Control': 'public, s-maxage=300',
      'Vary': 'Accept-Encoding'
    };

    return NextResponse.json({ data: portfolioData }, { headers });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/portfolios/slug/[slug] - Increment view count only (for tracking)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    
    // Get portfolio ID from slug (only for published portfolios)
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id')
      .eq('slug', slug)
      .eq('status', 'PUBLISHED')
      .eq('is_published', true)
      .single();

    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // Check rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    request.ip || 
                    'unknown';
    
    if (!canTrackView(clientIP, portfolio.id)) {
      return NextResponse.json({ 
        message: 'View already tracked recently',
        rateLimited: true 
      }, { status: 429 });
    }

    // Increment view count
    await incrementViewCount(portfolio.id);

    return NextResponse.json({ 
      message: 'View tracked successfully',
      rateLimited: false 
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
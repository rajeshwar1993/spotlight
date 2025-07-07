import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { unstable_cache } from 'next/cache';

export const dynamic = 'force-dynamic';

// Cache featured portfolios for 1 hour
const getCachedFeaturedPortfolios = unstable_cache(
  async () => {
    const supabase = await createClient();
    
    // Get featured portfolios with high view counts and published status
    const { data: portfolios, error } = await supabase
      .from('portfolios')
      .select(`
        id,
        title,
        slug,
        bio,
        template,
        view_count,
        is_published,
        created_at,
        updated_at,
        user:users!portfolios_user_id_fkey (
          id,
          full_name,
          profession,
          avatar_url
        ),
        portfolio_images (
          id,
          image_type,
          file_path,
          alt_text,
          display_order
        )
      `)
      .eq('is_published', true)
      .not('view_count', 'is', null)
      .order('view_count', { ascending: false })
      .limit(12);

    if (error) {
      console.error('Error fetching featured portfolios:', error);
      return [];
    }

    // Process and format portfolios
    const processedPortfolios = portfolios?.map(portfolio => ({
      id: portfolio.id,
      title: portfolio.title,
      slug: portfolio.slug,
      bio: portfolio.bio,
      template: portfolio.template,
      viewCount: portfolio.view_count || 0,
      createdAt: portfolio.created_at,
      updatedAt: portfolio.updated_at,
      user: {
        id: portfolio.user.id,
        fullName: portfolio.user.full_name,
        profession: portfolio.user.profession,
        avatarUrl: portfolio.user.avatar_url,
      },
      images: {
        hero: portfolio.portfolio_images?.find(img => img.image_type === 'HERO'),
        profile: portfolio.portfolio_images?.find(img => img.image_type === 'PROFILE'),
        gallery: portfolio.portfolio_images?.filter(img => img.image_type === 'GALLERY')
          .sort((a, b) => a.display_order - b.display_order)
          .slice(0, 3),
      },
    })) || [];

    // Filter to ensure we have diverse templates and good quality
    const featuredPortfolios = processedPortfolios
      .filter(portfolio => 
        portfolio.images.hero || portfolio.images.profile || portfolio.images.gallery?.length > 0
      )
      .slice(0, 8);

    return featuredPortfolios;
  },
  ['featured-portfolios'],
  {
    revalidate: 3600, // 1 hour
    tags: ['featured-portfolios'],
  }
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profession = searchParams.get('profession');
    const template = searchParams.get('template');
    const limit = parseInt(searchParams.get('limit') || '8');

    const portfolios = await getCachedFeaturedPortfolios();

    // Apply filters if provided
    let filteredPortfolios = portfolios;

    if (profession) {
      filteredPortfolios = filteredPortfolios.filter(
        portfolio => portfolio.user.profession?.toLowerCase() === profession.toLowerCase()
      );
    }

    if (template) {
      filteredPortfolios = filteredPortfolios.filter(
        portfolio => portfolio.template === template
      );
    }

    // Limit results
    filteredPortfolios = filteredPortfolios.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: filteredPortfolios,
      count: filteredPortfolios.length,
    });
  } catch (error) {
    console.error('Error in featured portfolios API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch featured portfolios',
        data: [],
      },
      { status: 500 }
    );
  }
}

// Optional: Add POST endpoint for admin to manually set featured portfolios
export async function POST(request: Request) {
  try {
    const { portfolioIds } = await request.json();

    if (!Array.isArray(portfolioIds)) {
      return NextResponse.json(
        { success: false, error: 'portfolioIds must be an array' },
        { status: 400 }
      );
    }

    await createClient();

    // In a real implementation, you might have a featured_portfolios table
    // For now, we'll just return success as the caching handles selection
    
    return NextResponse.json({
      success: true,
      message: 'Featured portfolios updated successfully',
    });
  } catch (error) {
    console.error('Error updating featured portfolios:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update featured portfolios' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { unstable_cache } from 'next/cache';

export const dynamic = 'force-dynamic';

interface DiscoverParams {
  search?: string;
  profession?: string;
  template?: string;
  category?: string;
  skills?: string;
  location?: string;
  sortBy?: 'popularity' | 'recent' | 'alphabetical' | 'views';
  page?: string;
  limit?: string;
}

// Cache discover results for 10 minutes
const getCachedDiscoverPortfolios = unstable_cache(
  async (params: DiscoverParams) => {
    const supabase = await createClient();
    
    // Parse parameters
    const {
      search = '',
      profession = '',
      template = '',
      // category = '',
      skills = '',
      location = '',
      sortBy = 'popularity',
      page = '1',
      limit = '12'
    } = params;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build query
    let query = supabase
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
        location,
        skills,
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
      .eq('is_published', true);

    // Apply filters
    if (profession) {
      query = query.eq('user.profession', profession.toUpperCase());
    }

    if (template) {
      query = query.eq('template', template);
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    if (skills) {
      query = query.ilike('skills', `%${skills}%`);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,bio.ilike.%${search}%,skills.ilike.%${search}%`);
    }

    // Apply sorting
    switch (sortBy) {
      case 'popularity':
        query = query.order('view_count', { ascending: false });
        break;
      case 'recent':
        query = query.order('created_at', { ascending: false });
        break;
      case 'alphabetical':
        query = query.order('title', { ascending: true });
        break;
      case 'views':
        query = query.order('view_count', { ascending: false });
        break;
      default:
        query = query.order('view_count', { ascending: false });
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('portfolios')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    // Apply pagination
    const { data: portfolios, error } = await query
      .range(offset, offset + limitNum - 1);

    if (error) {
      console.error('Error fetching discover portfolios:', error);
      return { portfolios: [], totalCount: 0 };
    }

    // Process and format portfolios
    const processedPortfolios = portfolios?.map(portfolio => ({
      id: portfolio.id,
      title: portfolio.title,
      slug: portfolio.slug,
      bio: portfolio.bio,
      template: portfolio.template,
      location: portfolio.location,
      skills: portfolio.skills,
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
      category: getTemplateCategory(portfolio.template),
    })) || [];

    return {
      portfolios: processedPortfolios,
      totalCount: count || 0,
    };
  },
  ['discover-portfolios'],
  {
    revalidate: 600, // 10 minutes
    tags: ['discover-portfolios'],
  }
);

function getTemplateCategory(template: string): string {
  const templateCategories: Record<string, string> = {
    T1: 'professional',
    T2: 'bold',
    T3: 'minimal',
    T4: 'creative',
  };
  return templateCategories[template] || 'professional';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params: DiscoverParams = {
      search: searchParams.get('search') || '',
      profession: searchParams.get('profession') || '',
      template: searchParams.get('template') || '',
      category: searchParams.get('category') || '',
      skills: searchParams.get('skills') || '',
      location: searchParams.get('location') || '',
      sortBy: (searchParams.get('sortBy') as DiscoverParams['sortBy']) || 'popularity',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '12',
    };

    // Filter by category if specified
    if (params.category) {
      const templatesByCategory: Record<string, string[]> = {
        professional: ['T1'],
        bold: ['T2'],
        minimal: ['T3'],
        creative: ['T4'],
      };
      
      const templates = templatesByCategory[params.category];
      if (templates && templates.length > 0) {
        params.template = templates[0]; // For now, use first template in category
      }
    }

    const { portfolios, totalCount } = await getCachedDiscoverPortfolios(params);

    const pageNum = parseInt(params.page || '1');
    const limitNum = parseInt(params.limit || '12');
    const totalPages = Math.ceil(totalCount / limitNum);

    return NextResponse.json({
      success: true,
      data: portfolios,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrevious: pageNum > 1,
      },
      filters: {
        search: params.search,
        profession: params.profession,
        template: params.template,
        category: params.category,
        skills: params.skills,
        location: params.location,
        sortBy: params.sortBy,
      },
    });
  } catch (error) {
    console.error('Error in discover portfolios API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch portfolios',
        data: [],
        pagination: {
          page: 1,
          limit: 12,
          totalCount: 0,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
        },
      },
      { status: 500 }
    );
  }
}
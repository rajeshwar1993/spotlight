import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { portfolioService } from '@/lib/services/portfolio';
import { portfolioSchema } from '@/lib/validations';
import { z } from 'zod';

// GET /api/portfolios - List portfolios with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status'); // 'draft' | 'published'
    const template = searchParams.get('template');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const search = searchParams.get('search');

    // Build query
    let query = supabase
      .from('portfolios')
      .select(`
        *,
        images (
          id,
          url,
          type,
          alt_text
        )
      `)
      .eq('user_id', userId || user.id);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (template) {
      query = query.eq('template', template);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%, bio.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: portfolios, error } = await query;

    if (error) {
      console.error('Error fetching portfolios:', error);
      return NextResponse.json({ error: 'Failed to fetch portfolios' }, { status: 500 });
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('portfolios')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId || user.id);

    return NextResponse.json({
      data: portfolios,
      pagination: {
        page,
        limit,
        totalCount: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
        hasMore: (totalCount || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/portfolios - Create new portfolio
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate request body
    const validatedData = portfolioSchema.parse(body);

    // Create portfolio using service
    const portfolio = await portfolioService.createPortfolio({
      ...validatedData,
      user_id: user.id
    });

    if (!portfolio) {
      return NextResponse.json({ error: 'Failed to create portfolio' }, { status: 500 });
    }

    return NextResponse.json({ data: portfolio }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
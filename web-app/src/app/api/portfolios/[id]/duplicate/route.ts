import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { portfolioService } from '@/lib/services/portfolio';

// POST /api/portfolios/[id]/duplicate - Duplicate portfolio
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if portfolio exists and user owns it
    const existingPortfolio = await portfolioService.getPortfolio(params.id);
    if (!existingPortfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }
    if (existingPortfolio.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title } = body;

    // Create duplicate portfolio
    const duplicateData = {
      ...existingPortfolio,
      title: title || `${existingPortfolio.title} (Copy)`,
      slug: '', // Will be generated
      status: 'draft' as const,
      is_published: false,
      view_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Remove fields that shouldn't be copied
    delete duplicateData.id;
    delete duplicateData.images;

    const duplicatedPortfolio = await portfolioService.createPortfolio(duplicateData);

    if (!duplicatedPortfolio) {
      return NextResponse.json({ error: 'Failed to duplicate portfolio' }, { status: 500 });
    }

    // TODO: Copy images if needed
    // This would require implementing image duplication logic

    return NextResponse.json({ data: duplicatedPortfolio }, { status: 201 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
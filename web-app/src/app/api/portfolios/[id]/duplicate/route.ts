import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { portfolioService } from '@/lib/services/portfolio';

// POST /api/portfolios/[id]/duplicate - Duplicate portfolio
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    // Check if portfolio exists and user owns it
    const portfolioResult = await portfolioService.getPortfolio(id);
    if (portfolioResult.error || !portfolioResult.data) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }
    if (portfolioResult.data.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title } = body;

    // Create duplicate portfolio 
    const duplicateData = {
      title: title || `${portfolioResult.data.title} (Copy)`,
      slug: '', // Will be generated
      template_type: portfolioResult.data.template,
      bio: portfolioResult.data.bio || undefined,
      height: portfolioResult.data.height || undefined,
      weight: portfolioResult.data.weight || undefined,
      hair_color: portfolioResult.data.hair_color || undefined,
      eye_color: portfolioResult.data.eye_color || undefined,
      is_published: false
    };

    const duplicatedPortfolio = await portfolioService.createPortfolio(user.id, duplicateData);

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
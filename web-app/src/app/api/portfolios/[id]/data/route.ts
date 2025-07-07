import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { portfolioService } from '@/lib/services/portfolio';

// GET /api/portfolios/[id]/data - Get complete portfolio data for template rendering
export async function GET(
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
    const portfolioId = id;

    // Get complete portfolio data using the existing service
    const { data: portfolioData, error } = await portfolioService.getPortfolioData(portfolioId);

    if (error) {
      console.error('Error fetching portfolio data:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch portfolio data',
        details: error.message 
      }, { status: 500 });
    }

    if (!portfolioData) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // Verify ownership
    if (portfolioData.portfolio.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ data: portfolioData });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
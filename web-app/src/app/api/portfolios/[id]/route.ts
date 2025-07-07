import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { portfolioService } from '@/lib/services/portfolio';
import { updatePortfolioSchema } from '@/lib/validations';
import { z } from 'zod';

// GET /api/portfolios/[id] - Get single portfolio
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
    const portfolioResult = await portfolioService.getPortfolio(id);
    
    if (portfolioResult.error || !portfolioResult.data) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // Check if user owns this portfolio
    if (portfolioResult.data.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ data: portfolioResult.data });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/portfolios/[id] - Update portfolio
export async function PUT(
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
    
    // Validate request body
    const validatedData = updatePortfolioSchema.parse(body);

    // Update portfolio using service
    const portfolio = await portfolioService.updatePortfolio(id, validatedData);

    if (!portfolio) {
      return NextResponse.json({ error: 'Failed to update portfolio' }, { status: 500 });
    }

    return NextResponse.json({ data: portfolio });

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

// DELETE /api/portfolios/[id] - Delete portfolio
export async function DELETE(
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

    // Delete portfolio using service
    const success = await portfolioService.deletePortfolio(id);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete portfolio' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Portfolio deleted successfully' });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


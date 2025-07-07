import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import jwt from 'jsonwebtoken';

// GET /api/portfolios/[id]/preview-link - Generate shareable preview link
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

    // Verify portfolio ownership
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id, user_id, slug, status')
      .eq('id', portfolioId)
      .single();

    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    if (portfolio.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Generate preview token
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      {
        portfolioId: portfolio.id,
        userId: user.id,
        slug: portfolio.slug,
        type: 'preview'
      },
      secret,
      { 
        expiresIn: '7d', // Token expires in 7 days
        issuer: 'spotlight-preview'
      }
    );

    // Generate preview URLs
    const baseUrl = request.nextUrl.origin;
    const previewUrl = `${baseUrl}/preview/${token}`;
    const publicUrl = `${baseUrl}/mypage/${portfolio.slug}`;

    return NextResponse.json({
      data: {
        previewUrl,
        publicUrl,
        token,
        expiresIn: '7 days',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('Preview link generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/portfolios/[id]/preview-link - Refresh preview link
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
    const portfolioId = id;

    // Verify portfolio ownership
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id, user_id, slug, status')
      .eq('id', portfolioId)
      .single();

    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    if (portfolio.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Generate new preview token
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      {
        portfolioId: portfolio.id,
        userId: user.id,
        slug: portfolio.slug,
        type: 'preview',
        refreshed: true,
        refreshedAt: new Date().toISOString()
      },
      secret,
      { 
        expiresIn: '7d',
        issuer: 'spotlight-preview'
      }
    );

    // Generate new URLs
    const baseUrl = request.nextUrl.origin;
    const previewUrl = `${baseUrl}/preview/${token}`;
    const publicUrl = `${baseUrl}/mypage/${portfolio.slug}`;

    return NextResponse.json({
      data: {
        previewUrl,
        publicUrl,
        token,
        expiresIn: '7 days',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        refreshed: true
      }
    });

  } catch (error) {
    console.error('Preview link refresh error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
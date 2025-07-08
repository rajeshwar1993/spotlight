import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin';
import { z } from 'zod';

const updateAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters').optional(),
  content: z.string().min(1, 'Content is required').max(500, 'Content must be less than 500 characters').optional(),
  type: z.enum(['info', 'warning', 'success', 'error']).optional(),
  is_active: z.boolean().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/announcements/[id] - Get specific announcement
export async function GET(request: NextRequest, { params }: RouteParams) {
  const adminError = await requireAdmin(request);
  if (adminError) return adminError;

  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: announcement, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Announcement not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching announcement:', error);
      return NextResponse.json(
        { error: 'Failed to fetch announcement' },
        { status: 500 }
      );
    }

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error('Error in GET /api/admin/announcements/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/announcements/[id] - Update announcement
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const adminError = await requireAdmin(request);
  if (adminError) return adminError;

  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateAnnouncementSchema.parse(body);

    const supabase = await createClient();

    // Validate date logic if both dates are provided
    if (validatedData.start_date && validatedData.end_date) {
      if (new Date(validatedData.start_date) >= new Date(validatedData.end_date)) {
        return NextResponse.json(
          { error: 'Start date must be before end date' },
          { status: 400 }
        );
      }
    }

    const { data: announcement, error } = await supabase
      .from('announcements')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Announcement not found' },
          { status: 404 }
        );
      }
      console.error('Error updating announcement:', error);
      return NextResponse.json(
        { error: 'Failed to update announcement' },
        { status: 500 }
      );
    }

    return NextResponse.json({ announcement });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in PUT /api/admin/announcements/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/announcements/[id] - Delete announcement
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const adminError = await requireAdmin(request);
  if (adminError) return adminError;

  try {
    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting announcement:', error);
      return NextResponse.json(
        { error: 'Failed to delete announcement' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/announcements/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user verification status from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_email_verified')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Error checking user verification status:', userError);
      return NextResponse.json({ 
        error: 'Failed to check verification status' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      isVerified: userData.is_email_verified,
      email: user.email
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
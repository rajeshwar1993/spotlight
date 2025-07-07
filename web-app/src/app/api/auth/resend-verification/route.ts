import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if email is already verified
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

    if (userData.is_email_verified) {
      return NextResponse.json({ 
        error: 'Email is already verified' 
      }, { status: 400 });
    }

    // Resend the verification email
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: user.email!,
    });

    if (resendError) {
      console.error('Error resending verification email:', resendError);
      
      // Handle rate limiting specifically
      if (resendError.message.includes('rate limit') || resendError.message.includes('too many')) {
        return NextResponse.json({ 
          error: 'Please wait before requesting another verification email. Check your email inbox and spam folder.' 
        }, { status: 429 });
      }
      
      return NextResponse.json({ 
        error: resendError.message || 'Failed to send verification email' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Verification email sent successfully',
      email: user.email 
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
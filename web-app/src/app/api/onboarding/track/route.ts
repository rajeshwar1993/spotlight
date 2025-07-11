import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { rateLimit } from '@/lib/security/headers';

/**
 * POST /api/onboarding/track
 * Track onboarding progress and events
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, 'onboarding', 50, 900); // 50 requests per 15 minutes
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    const {
      event,
      step,
      data = {},
      timestamp = Date.now(),
    } = body;

    // Validate required fields
    if (!event) {
      return NextResponse.json(
        { error: 'Event is required' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Prepare tracking data
    const trackingData = {
      user_id: user.id,
      event_type: event,
      step_number: step,
      event_data: data,
      timestamp: new Date(timestamp).toISOString(),
      user_agent: request.headers.get('user-agent'),
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      created_at: new Date().toISOString(),
    };

    // Store in onboarding_events table
    const { error: insertError } = await supabase
      .from('onboarding_events')
      .insert([trackingData]);

    if (insertError) {
      console.error('Failed to track onboarding event:', insertError);
      return NextResponse.json(
        { error: 'Failed to track event' },
        { status: 500 }
      );
    }

    // Update user onboarding progress
    await updateOnboardingProgress(supabase, user.id, event, step, data);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Onboarding tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/onboarding/track
 * Get onboarding progress for current user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's onboarding progress
    const { data: progress, error: progressError } = await supabase
      .from('user_onboarding_progress')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (progressError && progressError.code !== 'PGRST116') { // Not found is OK
      console.error('Failed to get onboarding progress:', progressError);
      return NextResponse.json(
        { error: 'Failed to get progress' },
        { status: 500 }
      );
    }

    // Get recent onboarding events
    const { data: events, error: eventsError } = await supabase
      .from('onboarding_events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (eventsError) {
      console.error('Failed to get onboarding events:', eventsError);
      return NextResponse.json(
        { error: 'Failed to get events' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      progress: progress || {
        user_id: user.id,
        completed: false,
        current_step: 0,
        completed_steps: [],
        start_time: new Date().toISOString(),
      },
      events: events || [],
    });

  } catch (error) {
    console.error('Onboarding progress error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Update user onboarding progress based on events
 */
async function updateOnboardingProgress(
  supabase: any,
  userId: string,
  event: string,
  step?: number,
  data?: any
) {
  try {
    // Get current progress
    const { data: currentProgress } = await supabase
      .from('user_onboarding_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    let updatedProgress;

    if (!currentProgress) {
      // Create initial progress record
      updatedProgress = {
        user_id: userId,
        completed: false,
        current_step: 0,
        completed_steps: [],
        start_time: new Date().toISOString(),
        profile_data: {},
        template_selected: null,
        preferences: {
          skip_tutorial: false,
          email_notifications: true,
        },
        updated_at: new Date().toISOString(),
      };
    } else {
      updatedProgress = { ...currentProgress };
    }

    // Update progress based on event
    switch (event) {
      case 'onboarding_started':
        updatedProgress.start_time = new Date().toISOString();
        break;

      case 'step_completed':
        if (step !== undefined) {
          const completedSteps = updatedProgress.completed_steps || [];
          if (!completedSteps.includes(step)) {
            updatedProgress.completed_steps = [...completedSteps, step];
          }
          updatedProgress.current_step = Math.max(updatedProgress.current_step || 0, step + 1);
        }
        break;

      case 'profile_updated':
        updatedProgress.profile_data = {
          ...updatedProgress.profile_data,
          ...data,
        };
        break;

      case 'template_selected':
        updatedProgress.template_selected = data?.template;
        break;

      case 'onboarding_completed':
        updatedProgress.completed = true;
        updatedProgress.completed_at = new Date().toISOString();
        break;

      case 'onboarding_skipped':
        updatedProgress.completed = true;
        updatedProgress.skipped = true;
        updatedProgress.completed_at = new Date().toISOString();
        updatedProgress.preferences = {
          ...updatedProgress.preferences,
          skip_tutorial: true,
        };
        break;
    }

    updatedProgress.updated_at = new Date().toISOString();

    // Upsert progress record
    const { error: upsertError } = await supabase
      .from('user_onboarding_progress')
      .upsert([updatedProgress], {
        onConflict: 'user_id',
      });

    if (upsertError) {
      console.error('Failed to update onboarding progress:', upsertError);
    }

    // Update user profile if onboarding is completed
    if (updatedProgress.completed && !updatedProgress.skipped) {
      await updateUserProfile(supabase, userId, updatedProgress);
    }

  } catch (error) {
    console.error('Failed to update onboarding progress:', error);
  }
}

/**
 * Update user profile with onboarding data
 */
async function updateUserProfile(supabase: any, userId: string, progress: any) {
  try {
    const profileUpdates: any = {
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
    };

    // Add profile data if available
    if (progress.profile_data) {
      if (progress.profile_data.title) {
        profileUpdates.professional_title = progress.profile_data.title;
      }
      if (progress.profile_data.location) {
        profileUpdates.location = progress.profile_data.location;
      }
      if (progress.profile_data.bio) {
        profileUpdates.bio = progress.profile_data.bio;
      }
    }

    // Add template preference
    if (progress.template_selected) {
      profileUpdates.preferred_template = progress.template_selected;
    }

    // Update user profile
    const { error: updateError } = await supabase
      .from('users')
      .update(profileUpdates)
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update user profile:', updateError);
    }

  } catch (error) {
    console.error('Failed to update user profile:', error);
  }
}
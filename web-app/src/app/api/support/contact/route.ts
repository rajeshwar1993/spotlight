import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { rateLimit } from '@/lib/security/headers';

interface SupportRequest {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
  userAgent?: string;
  url?: string;
}

/**
 * POST /api/support/contact
 * Submit a support request
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - more restrictive for support requests
    const rateLimitResult = await rateLimit(request, 'support', 5, 3600); // 5 requests per hour
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many support requests. Please wait before submitting another request.' },
        { status: 429 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });
    const body: SupportRequest = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'email', 'category', 'subject', 'message'];
    for (const field of requiredFields) {
      if (!body[field]?.trim()) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate message length
    if (body.message.length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters long' },
        { status: 400 }
      );
    }

    // Get user info if authenticated
    let userId = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    } catch (error) {
      // User not authenticated - that's okay for support requests
    }

    // Generate ticket ID
    const ticketId = generateTicketId();

    // Prepare support request data
    const supportData = {
      ticket_id: ticketId,
      user_id: userId,
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      category: body.category,
      subject: body.subject.trim(),
      message: body.message.trim(),
      priority: body.priority || 'medium',
      status: 'open',
      user_agent: body.userAgent || request.headers.get('user-agent'),
      page_url: body.url,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Store in support_tickets table
    const { data: ticket, error: insertError } = await supabase
      .from('support_tickets')
      .insert([supportData])
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create support ticket:', insertError);
      return NextResponse.json(
        { error: 'Failed to create support ticket' },
        { status: 500 }
      );
    }

    // Send notification emails (in production)
    if (process.env.NODE_ENV === 'production') {
      await Promise.all([
        sendUserConfirmationEmail(body, ticketId),
        sendInternalNotificationEmail(supportData)
      ]);
    }

    // Track support request analytics
    await trackSupportAnalytics(supabase, supportData);

    return NextResponse.json({
      success: true,
      ticketId: ticketId,
      message: 'Support request submitted successfully'
    });

  } catch (error) {
    console.error('Support request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/support/contact
 * Get support ticket status (for authenticated users)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('ticket');

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (ticketId) {
      // Get specific ticket
      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('ticket_id', ticketId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Ticket not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ ticket });
    } else {
      // Get user's tickets
      const { data: tickets, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Failed to fetch tickets:', error);
        return NextResponse.json(
          { error: 'Failed to fetch tickets' },
          { status: 500 }
        );
      }

      return NextResponse.json({ tickets: tickets || [] });
    }

  } catch (error) {
    console.error('Support tickets error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate a unique ticket ID
 */
function generateTicketId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `SP-${timestamp}-${random}`.toUpperCase();
}

/**
 * Send confirmation email to user
 */
async function sendUserConfirmationEmail(request: SupportRequest, ticketId: string) {
  try {
    // In a real implementation, integrate with email service like SendGrid, Mailgun, etc.
    const emailData = {
      to: request.email,
      subject: `Support Request Received - Ticket #${ticketId}`,
      html: `
        <h2>Thank you for contacting Spotlight Support</h2>
        <p>Hello ${request.name},</p>
        <p>We've received your support request and will get back to you soon.</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>Ticket Details:</strong><br>
          Ticket ID: ${ticketId}<br>
          Category: ${request.category}<br>
          Subject: ${request.subject}<br>
          Priority: ${request.priority}
        </div>
        
        <p>Expected response time: ${getResponseTime(request.category)}</p>
        <p>If you have any additional information to add, please reply to this email with your ticket ID.</p>
        
        <p>Best regards,<br>The Spotlight Support Team</p>
      `
    };

    // Send email using your preferred service
    // await emailService.send(emailData);
    console.log('User confirmation email prepared:', emailData.subject);

  } catch (error) {
    console.error('Failed to send user confirmation email:', error);
  }
}

/**
 * Send notification to internal support team
 */
async function sendInternalNotificationEmail(supportData: any) {
  try {
    const emailData = {
      to: process.env.SUPPORT_EMAIL || 'support@spotlight.com',
      subject: `New Support Request - ${supportData.ticket_id} [${supportData.priority.toUpperCase()}]`,
      html: `
        <h2>New Support Request</h2>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>Ticket:</strong> ${supportData.ticket_id}<br>
          <strong>Category:</strong> ${supportData.category}<br>
          <strong>Priority:</strong> ${supportData.priority}<br>
          <strong>From:</strong> ${supportData.name} (${supportData.email})<br>
          <strong>User ID:</strong> ${supportData.user_id || 'Anonymous'}<br>
          <strong>Created:</strong> ${new Date(supportData.created_at).toLocaleString()}
        </div>
        
        <div style="margin: 20px 0;">
          <strong>Subject:</strong> ${supportData.subject}
        </div>
        
        <div style="margin: 20px 0;">
          <strong>Message:</strong><br>
          ${supportData.message.replace(/\n/g, '<br>')}
        </div>
        
        ${supportData.page_url ? `<p><strong>Page URL:</strong> ${supportData.page_url}</p>` : ''}
        ${supportData.user_agent ? `<p><strong>User Agent:</strong> ${supportData.user_agent}</p>` : ''}
      `
    };

    // Send email to support team
    // await emailService.send(emailData);
    console.log('Internal notification prepared:', emailData.subject);

  } catch (error) {
    console.error('Failed to send internal notification:', error);
  }
}

/**
 * Get expected response time based on category
 */
function getResponseTime(category: string): string {
  const responseTimes = {
    'technical': 'Within 24 hours',
    'billing': 'Within 12 hours',
    'portfolio': 'Within 24 hours',
    'general': 'Within 48 hours',
    'feedback': 'Within 72 hours'
  };
  
  return responseTimes[category as keyof typeof responseTimes] || 'Within 24 hours';
}

/**
 * Track support analytics
 */
async function trackSupportAnalytics(supabase: any, supportData: any) {
  try {
    const analyticsData = {
      event_name: 'support_request_created',
      properties: {
        ticket_id: supportData.ticket_id,
        category: supportData.category,
        priority: supportData.priority,
        user_authenticated: !!supportData.user_id,
      },
      user_id: supportData.user_id,
      timestamp: supportData.created_at,
    };

    await supabase
      .from('analytics_events')
      .insert([analyticsData]);

  } catch (error) {
    console.error('Failed to track support analytics:', error);
    // Don't throw - analytics failure shouldn't break support request
  }
}
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

// Admin users (for now, we'll use email-based detection)
// In production, this should be moved to environment variables or database
const ADMIN_EMAILS = [
  'admin@spotlight.com',
  'rajeshwarrudra@gmail.com', // Add your email here
  // Add more admin emails as needed
];

export async function isAdmin(_request: NextRequest): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return false;
    }

    // Check if user email is in admin list
    return ADMIN_EMAILS.includes(user.email || '');
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function requireAdmin(request: NextRequest) {
  const isAdminUser = await isAdmin(request);
  
  if (!isAdminUser) {
    return Response.json(
      { error: 'Unauthorized: Admin access required' },
      { status: 403 }
    );
  }
  
  return null; // No error, user is admin
}

export async function getAdminUser(_request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  const isAdminUser = ADMIN_EMAILS.includes(user.email || '');
  
  return isAdminUser ? user : null;
}
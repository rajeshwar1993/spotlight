import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env-client';
import type { Database } from '@/types/database';

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);
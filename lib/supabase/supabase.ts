import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qjqwkbrbfvwrxacgkunh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Client for frontend operations (Realtime subscriptions, public views)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for backend API routes (Bypasses RLS for secure uploads/downloads)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

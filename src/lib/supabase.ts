import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Add fallback for testing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase environment variables. Using fallback for testing.');
  // For testing only - remove in production
  // export const supabase = createClient('https://your-project.supabase.co', 'your-anon-key');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const TABLES = {
  DEPARTMENTS: 'departments',
  STUDENTS: 'students',
  CLEARANCE_REQUESTS: 'clearance_requests',
  ANNOUNCEMENTS: 'announcements',
  USERS: 'users',
  CLEARANCE_STATUS: 'clearance_status',
} as const;
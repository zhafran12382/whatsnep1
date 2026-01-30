import { createClient } from '@supabase/supabase-js'

// Supabase configuration
// Users need to replace these with their own Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// Create Supabase client with session-based auth (auto-logout on tab close)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Session-based authentication - auto logout when tab is closed
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: sessionStorage, // Using sessionStorage for auto-logout on tab close
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://your-project.supabase.co' && 
         supabaseAnonKey !== 'your-anon-key'
}

export default supabase

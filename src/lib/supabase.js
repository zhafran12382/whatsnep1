import { createClient } from '@supabase/supabase-js'

// Supabase configuration
// Users need to replace these with their own Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// Create Supabase client with session-based auth
// Using sessionStorage means session persists in current tab only
// Session is automatically cleared when tab/browser closes
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Persist within sessionStorage (current tab only)
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: sessionStorage, // Auto-logout when tab closes
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

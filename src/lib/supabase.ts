import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file')
}

export const supabase = createClient<Database>(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        },
        realtime: {
            params: {
                eventsPerSecond: 10
            }
        }
    }
)

// Helper function for session-based auto-logout
export const setupSessionLogout = () => {
    // Handle tab/browser close
    window.addEventListener('beforeunload', async () => {
        // Mark user as offline
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await supabase
                .from('profiles')
                .update({ is_online: false, last_seen: new Date().toISOString() })
                .eq('id', user.id)
        }
    })

    // Handle visibility change (tab switch)
    document.addEventListener('visibilitychange', async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await supabase
                .from('profiles')
                .update({
                    is_online: document.visibilityState === 'visible',
                    last_seen: new Date().toISOString()
                })
                .eq('id', user.id)
        }
    })
}

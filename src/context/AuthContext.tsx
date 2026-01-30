import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase, setupSessionLogout } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '../types'

interface AuthContextType {
    user: User | null
    profile: Profile | null
    session: Session | null
    isLoading: boolean
    signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>
    signOut: () => Promise<void>
    updatePassword: (newPassword: string) => Promise<{ error: Error | null }>
    checkUsernameAvailable: (username: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Fetch user profile
    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) {
            console.error('Error fetching profile:', error)
            return null
        }
        return data
    }

    // Update online status
    const updateOnlineStatus = async (userId: string, isOnline: boolean) => {
        await supabase
            .from('profiles')
            .update({
                is_online: isOnline,
                last_seen: new Date().toISOString()
            })
            .eq('id', userId)
    }

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)

            if (session?.user) {
                fetchProfile(session.user.id).then(setProfile)
                updateOnlineStatus(session.user.id, true)
            }

            setIsLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session)
                setUser(session?.user ?? null)

                if (session?.user) {
                    const profile = await fetchProfile(session.user.id)
                    setProfile(profile)
                    await updateOnlineStatus(session.user.id, true)
                } else {
                    setProfile(null)
                }
            }
        )

        // Setup session-based logout
        setupSessionLogout()

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const signUp = async (email: string, password: string, username: string) => {
        try {
            // Create auth user
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            })

            if (signUpError) throw signUpError
            if (!data.user) throw new Error('User creation failed')

            // Create profile
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: data.user.id,
                    username: username.toLowerCase(),
                    is_online: true,
                    last_seen: new Date().toISOString(),
                })

            if (profileError) throw profileError

            return { error: null }
        } catch (error) {
            return { error: error as Error }
        }
    }

    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error
            return { error: null }
        } catch (error) {
            return { error: error as Error }
        }
    }

    const signOut = async () => {
        if (user) {
            await updateOnlineStatus(user.id, false)
        }
        await supabase.auth.signOut()
        setProfile(null)
    }

    const updatePassword = async (newPassword: string) => {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            })

            if (error) throw error
            return { error: null }
        } catch (error) {
            return { error: error as Error }
        }
    }

    const checkUsernameAvailable = async (username: string): Promise<boolean> => {
        const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username.toLowerCase())
            .maybeSingle()

        if (error) {
            console.error('Error checking username:', error)
            return false
        }

        return data === null
    }

    const value = {
        user,
        profile,
        session,
        isLoading,
        signUp,
        signIn,
        signOut,
        updatePassword,
        checkUsernameAvailable,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

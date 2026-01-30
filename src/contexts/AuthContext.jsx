import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

// Authentication Context for managing user sessions
const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Ref to track current user id for cleanup functions
  const userIdRef = useRef(null)

  // Fetch user profile from database
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setUserProfile(data)
      return data
    } catch (err) {
      console.error('Error fetching user profile:', err)
      return null
    }
  }

  // Update user online status
  const updateOnlineStatus = async (userId, isOnline) => {
    try {
      await supabase
        .from('users')
        .update({ 
          is_online: isOnline, 
          last_seen: new Date().toISOString() 
        })
        .eq('id', userId)
    } catch (err) {
      console.error('Error updating online status:', err)
    }
  }

  // Keep ref in sync with user id
  useEffect(() => {
    userIdRef.current = user?.id || null
  }, [user?.id])

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        if (session?.user) {
          setUser(session.user)
          userIdRef.current = session.user.id
          await fetchUserProfile(session.user.id)
          await updateOnlineStatus(session.user.id, true)
        }
      } catch (err) {
        console.error('Session error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          userIdRef.current = session.user.id
          await fetchUserProfile(session.user.id)
          await updateOnlineStatus(session.user.id, true)
        } else if (event === 'SIGNED_OUT') {
          // Use ref to get current user id to avoid stale closure
          if (userIdRef.current) {
            await updateOnlineStatus(userIdRef.current, false)
          }
          userIdRef.current = null
          setUser(null)
          setUserProfile(null)
        }
        setLoading(false)
      }
    )

    // Handle tab/window close - set user offline
    // Note: We use synchronous update approach since sendBeacon requires auth headers
    // The server-side session timeout will handle cases where this fails
    const handleBeforeUnload = () => {
      if (userIdRef.current) {
        // Attempt to update status - this may not always succeed on tab close
        // but Supabase session timeout will handle cleanup
        updateOnlineStatus(userIdRef.current, false)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, []) // Empty dependency array - only run once on mount

  // Sign up with username and password
  const signUp = async (username, password) => {
    setError(null)
    try {
      // Check if username is already taken
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', username.toLowerCase())
        .single()

      if (existingUser) {
        throw new Error('Username is already taken')
      }

      // Create auth user with username as email (workaround for Supabase)
      const email = `${username.toLowerCase()}@whatsnep.local`
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.toLowerCase(),
          }
        }
      })

      if (error) throw error

      // Create user profile in database
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            username: username.toLowerCase(),
            is_online: true,
            created_at: new Date().toISOString(),
          })

        if (profileError) throw profileError
      }

      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err }
    }
  }

  // Sign in with username and password
  const signIn = async (username, password) => {
    setError(null)
    try {
      const email = `${username.toLowerCase()}@whatsnep.local`
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err }
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      if (user?.id) {
        await updateOnlineStatus(user.id, false)
      }
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (err) {
      console.error('Sign out error:', err)
      setError(err.message)
    }
  }

  // Change password
  const changePassword = async (newPassword) => {
    setError(null)
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err }
    }
  }

  // Check username availability
  const checkUsernameAvailable = async (username) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', username.toLowerCase())
        .single()

      if (error && error.code === 'PGRST116') {
        // No rows returned - username is available
        return true
      }
      return !data
    } catch {
      return true
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    changePassword,
    checkUsernameAvailable,
    fetchUserProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext

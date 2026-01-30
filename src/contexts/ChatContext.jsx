import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

// Chat Context for managing conversations and real-time messaging
const ChatContext = createContext({})

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}

export const ChatProvider = ({ children }) => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [typingUsers, setTypingUsers] = useState({})
  const [unreadCounts, setUnreadCounts] = useState({})
  const [loading, setLoading] = useState(false)
  
  // Ref to store typing channel for cleanup
  const typingChannelRef = useRef(null)

  // Fetch all conversations for the current user
  const fetchConversations = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant1:users!conversations_participant1_id_fkey(id, username, is_online, last_seen),
          participant2:users!conversations_participant2_id_fkey(id, username, is_online, last_seen),
          messages(content, created_at, sender_id)
        `)
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false })

      if (error) throw error

      // Process conversations to get the other participant
      const processedConversations = data?.map(conv => {
        const otherUser = conv.participant1_id === user.id 
          ? conv.participant2 
          : conv.participant1
        const lastMessage = conv.messages?.[conv.messages.length - 1]
        
        return {
          ...conv,
          otherUser,
          lastMessage,
        }
      }) || []

      setConversations(processedConversations)
    } catch (err) {
      console.error('Error fetching conversations:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Fetch messages for a specific conversation
  const fetchMessages = useCallback(async (conversationId) => {
    if (!conversationId) return

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(id, username)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])

      // Mark messages as read
      if (user) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('conversation_id', conversationId)
          .neq('sender_id', user.id)
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
    }
  }, [user])

  // Send a message
  const sendMessage = async (conversationId, content) => {
    if (!user || !content.trim()) return null

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
          is_read: false,
          created_at: new Date().toISOString(),
        })
        .select(`
          *,
          sender:users!messages_sender_id_fkey(id, username)
        `)
        .single()

      if (error) throw error

      // Update conversation's updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId)

      return data
    } catch (err) {
      console.error('Error sending message:', err)
      return null
    }
  }

  // Start a new conversation or get existing one
  const startConversation = async (otherUserId) => {
    if (!user || !otherUserId) return null

    try {
      // Check if conversation already exists
      const { data: existing, error: searchError } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${user.id})`)
        .single()

      if (searchError && searchError.code !== 'PGRST116') throw searchError

      if (existing) {
        return existing
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          participant1_id: user.id,
          participant2_id: otherUserId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      
      await fetchConversations()
      return data
    } catch (err) {
      console.error('Error starting conversation:', err)
      return null
    }
  }

  // Search for users
  const searchUsers = async (query) => {
    if (!query.trim() || !user) return []

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, is_online, last_seen')
        .ilike('username', `%${query}%`)
        .neq('id', user.id)
        .limit(10)

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error searching users:', err)
      return []
    }
  }

  // Set typing status - broadcasts to the conversation channel
  const setTyping = async (conversationId, isTyping) => {
    if (!user || !conversationId) return

    try {
      // Use the active typing channel if available
      if (typingChannelRef.current) {
        typingChannelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            userId: user.id,
            username: user.user_metadata?.username,
            isTyping,
          },
        })
      }
    } catch (err) {
      console.error('Error setting typing status:', err)
    }
  }

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new
          
          // Update messages if it's for the active chat
          if (activeChat && newMessage.conversation_id === activeChat.id) {
            setMessages(prev => [...prev, newMessage])
          }

          // Update unread counts
          if (newMessage.sender_id !== user.id) {
            setUnreadCounts(prev => ({
              ...prev,
              [newMessage.conversation_id]: (prev[newMessage.conversation_id] || 0) + 1,
            }))

            // Show browser notification
            if (Notification.permission === 'granted') {
              new Notification('New message on WhatsNep', {
                body: newMessage.content.substring(0, 50),
                icon: '/whatsnep-icon.svg',
              })
            }
          }

          // Refresh conversations list
          fetchConversations()
        }
      )
      .subscribe()

    // Subscribe to user status changes
    const presenceChannel = supabase
      .channel('online-users')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
        },
        () => {
          fetchConversations()
        }
      )
      .subscribe()

    return () => {
      messagesChannel.unsubscribe()
      presenceChannel.unsubscribe()
    }
  }, [user, activeChat, fetchConversations])

  // Subscribe to typing indicators for active chat
  useEffect(() => {
    if (!activeChat || !user) {
      typingChannelRef.current = null
      return
    }

    const typingChannel = supabase
      .channel(`typing:${activeChat.id}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId !== user.id) {
          setTypingUsers(prev => ({
            ...prev,
            [activeChat.id]: payload.isTyping ? payload.username : null,
          }))

          // Clear typing indicator after 2 seconds (matching ChatArea timeout)
          if (payload.isTyping) {
            setTimeout(() => {
              setTypingUsers(prev => ({
                ...prev,
                [activeChat.id]: null,
              }))
            }, 2500)
          }
        }
      })
      .subscribe()

    // Store ref for use in setTyping function
    typingChannelRef.current = typingChannel

    return () => {
      typingChannel.unsubscribe()
      typingChannelRef.current = null
    }
  }, [activeChat, user])

  // Fetch conversations on mount
  useEffect(() => {
    if (user) {
      fetchConversations()
    }
  }, [user, fetchConversations])

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const value = {
    conversations,
    activeChat,
    setActiveChat,
    messages,
    typingUsers,
    unreadCounts,
    loading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    startConversation,
    searchUsers,
    setTyping,
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export default ChatContext

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Search, Settings, LogOut, Send,
    MessageCircle, Check, CheckCheck,
    ChevronLeft, MoreVertical, Phone, Video,
    Smile, Paperclip, Circle
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Profile, Message, ConversationWithParticipants } from '../types'

export default function ChatPage() {
    const { conversationId } = useParams()
    const navigate = useNavigate()
    const { user, profile, signOut } = useAuth()

    // State
    const [conversations, setConversations] = useState<ConversationWithParticipants[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<Profile[]>([])
    const [showSidebar, setShowSidebar] = useState(true)
    const [isTyping, setIsTyping] = useState(false)
    const [typingUsers, setTypingUsers] = useState<string[]>([])
    const [currentConversation, setCurrentConversation] = useState<ConversationWithParticipants | null>(null)
    const [isSending, setIsSending] = useState(false)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Fetch conversations
    const fetchConversations = useCallback(async () => {
        if (!user) return

        const { data, error } = await supabase
            .from('conversation_participants')
            .select(`
        conversation_id,
        conversations!inner(id, created_at, updated_at)
      `)
            .eq('user_id', user.id)

        if (error) {
            console.error('Error fetching conversations:', error)
            return
        }

        // Get participants for each conversation
        const conversationsWithParticipants: ConversationWithParticipants[] = []

        for (const item of data || []) {
            const convId = item.conversation_id

            // Get other participants
            const { data: participants } = await supabase
                .from('conversation_participants')
                .select(`
          user_id,
          profiles!inner(*)
        `)
                .eq('conversation_id', convId)
                .neq('user_id', user.id)

            // Get last message
            const { data: lastMessageData } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', convId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            // Get unread count
            const { count: unreadCount } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('conversation_id', convId)
                .eq('is_read', false)
                .neq('sender_id', user.id)

            const conv = item.conversations as { id: string; created_at: string; updated_at: string }

            conversationsWithParticipants.push({
                id: convId,
                created_at: conv.created_at,
                updated_at: conv.updated_at,
                participants: (participants || []).map((p: { profiles: Profile }) => p.profiles),
                lastMessage: lastMessageData || undefined,
                unreadCount: unreadCount || 0,
            })
        }

        // Sort by last message time
        conversationsWithParticipants.sort((a, b) => {
            const aTime = a.lastMessage?.created_at || a.updated_at
            const bTime = b.lastMessage?.created_at || b.updated_at
            return new Date(bTime).getTime() - new Date(aTime).getTime()
        })

        setConversations(conversationsWithParticipants)
    }, [user])

    // Fetch messages for current conversation
    const fetchMessages = useCallback(async () => {
        if (!conversationId) return

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Error fetching messages:', error)
            return
        }

        setMessages(data || [])

        // Mark messages as read
        await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('conversation_id', conversationId)
            .neq('sender_id', user?.id)
    }, [conversationId, user])

    // Set current conversation
    useEffect(() => {
        if (conversationId) {
            const conv = conversations.find(c => c.id === conversationId)
            setCurrentConversation(conv || null)
        } else {
            setCurrentConversation(null)
        }
    }, [conversationId, conversations])

    // Initial fetch
    useEffect(() => {
        fetchConversations()
    }, [fetchConversations])

    useEffect(() => {
        if (conversationId) {
            fetchMessages()
        }
    }, [conversationId, fetchMessages])

    // Real-time subscriptions
    useEffect(() => {
        if (!user) return

        // Subscribe to new messages
        const messagesSubscription = supabase
            .channel('messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                (payload) => {
                    const newMsg = payload.new as Message

                    // Add to current conversation if matches
                    if (newMsg.conversation_id === conversationId) {
                        setMessages((prev) => [...prev, newMsg])

                        // Mark as read if from other user
                        if (newMsg.sender_id !== user.id) {
                            supabase
                                .from('messages')
                                .update({ is_read: true })
                                .eq('id', newMsg.id)
                        }
                    }

                    // Refresh conversations list
                    fetchConversations()
                }
            )
            .subscribe()

        // Subscribe to typing indicators
        const typingSubscription = supabase
            .channel(`typing:${conversationId}`)
            .on('broadcast', { event: 'typing' }, ({ payload }) => {
                if (payload.userId !== user.id) {
                    setTypingUsers(prev => {
                        if (!prev.includes(payload.userId)) {
                            return [...prev, payload.userId]
                        }
                        return prev
                    })

                    // Remove after 3 seconds
                    setTimeout(() => {
                        setTypingUsers(prev => prev.filter(id => id !== payload.userId))
                    }, 3000)
                }
            })
            .subscribe()

        return () => {
            messagesSubscription.unsubscribe()
            typingSubscription.unsubscribe()
        }
    }, [user, conversationId, fetchConversations])

    // Search users
    useEffect(() => {
        const searchUsers = async () => {
            if (searchQuery.length < 2) {
                setSearchResults([])
                return
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .ilike('username', `%${searchQuery}%`)
                .neq('id', user?.id)
                .limit(10)

            if (!error && data) {
                setSearchResults(data)
            }
        }

        const timer = setTimeout(searchUsers, 300)
        return () => clearTimeout(timer)
    }, [searchQuery, user])

    // Start conversation with user
    const startConversation = async (otherUser: Profile) => {
        if (!user) return

        // Check if conversation already exists
        const existingConv = conversations.find(c =>
            c.participants.some(p => p.id === otherUser.id)
        )

        if (existingConv) {
            navigate(`/chat/${existingConv.id}`)
            setSearchQuery('')
            setSearchResults([])
            return
        }

        // Create new conversation
        const { data: newConv, error: convError } = await supabase
            .from('conversations')
            .insert({})
            .select()
            .single()

        if (convError) {
            console.error('Error creating conversation:', convError)
            return
        }

        // Add participants
        const { error: partError } = await supabase
            .from('conversation_participants')
            .insert([
                { conversation_id: newConv.id, user_id: user.id },
                { conversation_id: newConv.id, user_id: otherUser.id },
            ])

        if (partError) {
            console.error('Error adding participants:', partError)
            return
        }

        setSearchQuery('')
        setSearchResults([])
        await fetchConversations()
        navigate(`/chat/${newConv.id}`)
    }

    // Send message
    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!newMessage.trim() || !conversationId || !user || isSending) return

        setIsSending(true)
        const messageContent = newMessage.trim()
        setNewMessage('')

        const { error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: user.id,
                content: messageContent,
            })

        if (error) {
            console.error('Error sending message:', error)
            setNewMessage(messageContent) // Restore message on error
        }

        setIsSending(false)
    }

    // Handle typing
    const handleTyping = () => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }

        if (!isTyping && conversationId) {
            setIsTyping(true)
            supabase.channel(`typing:${conversationId}`).send({
                type: 'broadcast',
                event: 'typing',
                payload: { userId: user?.id },
            })
        }

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false)
        }, 2000)
    }

    // Format time
    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }

    // Format date for message groups
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (date.toDateString() === today.toDateString()) {
            return 'Hari ini'
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Kemarin'
        } else {
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })
        }
    }

    // Handle logout
    const handleLogout = async () => {
        await signOut()
        navigate('/')
    }

    // Get other participant for display
    const getOtherParticipant = (conv: ConversationWithParticipants) => {
        return conv.participants[0] || { username: 'Unknown', is_online: false }
    }

    return (
        <div className="h-screen bg-dark-950 flex overflow-hidden">
            {/* Sidebar */}
            <AnimatePresence>
                {(showSidebar || !conversationId) && (
                    <motion.aside
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        className={`
              ${conversationId ? 'absolute lg:relative z-20' : 'relative'}
              w-full lg:w-80 h-full bg-dark-900 border-r border-dark-800 flex flex-col
            `}
                    >
                        {/* Sidebar header */}
                        <div className="p-4 border-b border-dark-800">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center">
                                        <MessageCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="font-bold gradient-text text-lg">WhatsNep</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => navigate('/settings')}
                                        className="btn-ghost p-2"
                                    >
                                        <Settings className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="btn-ghost p-2 text-red-400 hover:text-red-300"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                                <input
                                    type="text"
                                    placeholder="Cari user..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl 
                           text-sm text-dark-100 placeholder-dark-500 focus:outline-none 
                           focus:border-accent-500/50 transition-colors"
                                />
                            </div>

                            {/* Search results */}
                            <AnimatePresence>
                                {searchResults.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute z-30 left-4 right-4 mt-2 bg-dark-800 rounded-xl border border-dark-700 
                             shadow-xl overflow-hidden"
                                    >
                                        {searchResults.map((userResult) => (
                                            <button
                                                key={userResult.id}
                                                onClick={() => startConversation(userResult)}
                                                className="w-full flex items-center gap-3 p-3 hover:bg-dark-700/50 transition-colors"
                                            >
                                                <div className="relative">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-400 to-primary-400 
                                        flex items-center justify-center text-white font-medium">
                                                        {userResult.username[0].toUpperCase()}
                                                    </div>
                                                    {userResult.is_online && (
                                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full 
                                          border-2 border-dark-800" />
                                                    )}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-medium text-dark-100">@{userResult.username}</p>
                                                    <p className="text-xs text-dark-500">
                                                        {userResult.is_online ? 'Online' : 'Offline'}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Conversations list */}
                        <div className="flex-1 overflow-y-auto">
                            {conversations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                                    <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mb-4">
                                        <MessageCircle className="w-8 h-8 text-dark-600" />
                                    </div>
                                    <p className="text-dark-400 text-sm mb-2">Belum ada chat</p>
                                    <p className="text-dark-600 text-xs">Cari user untuk memulai percakapan</p>
                                </div>
                            ) : (
                                <div className="py-2">
                                    {conversations.map((conv) => {
                                        const other = getOtherParticipant(conv)
                                        const isActive = conv.id === conversationId

                                        return (
                                            <button
                                                key={conv.id}
                                                onClick={() => {
                                                    navigate(`/chat/${conv.id}`)
                                                    if (window.innerWidth < 1024) {
                                                        setShowSidebar(false)
                                                    }
                                                }}
                                                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${isActive
                                                    ? 'bg-accent-500/10 border-l-2 border-accent-500'
                                                    : 'hover:bg-dark-800/50'
                                                    }`}
                                            >
                                                <div className="relative flex-shrink-0">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-400 to-primary-400 
                                        flex items-center justify-center text-white font-semibold">
                                                        {other.username[0].toUpperCase()}
                                                    </div>
                                                    {other.is_online && (
                                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full 
                                          border-2 border-dark-900" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 text-left">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className="font-medium text-dark-100 truncate">
                                                            @{other.username}
                                                        </p>
                                                        {conv.lastMessage && (
                                                            <span className="text-xs text-dark-500">
                                                                {formatTime(conv.lastMessage.created_at)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm text-dark-400 truncate flex-1">
                                                            {conv.lastMessage?.content || 'Mulai chat...'}
                                                        </p>
                                                        {(conv.unreadCount ?? 0) > 0 && (
                                                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-500 
                                             text-white text-xs flex items-center justify-center">
                                                                {conv.unreadCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Current user */}
                        <div className="p-4 border-t border-dark-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-500 to-primary-500 
                              flex items-center justify-center text-white font-medium">
                                    {profile?.username?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-dark-100 truncate">
                                        @{profile?.username || 'user'}
                                    </p>
                                    <p className="text-xs text-green-400 flex items-center gap-1">
                                        <Circle className="w-2 h-2 fill-current" />
                                        Online
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Chat area */}
            <main className="flex-1 flex flex-col min-w-0">
                {conversationId && currentConversation ? (
                    <>
                        {/* Chat header */}
                        <header className="h-16 px-4 flex items-center justify-between border-b border-dark-800 bg-dark-900/50 backdrop-blur-xl">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        setShowSidebar(true)
                                        if (window.innerWidth < 1024) {
                                            navigate('/chat')
                                        }
                                    }}
                                    className="lg:hidden btn-ghost p-2"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-400 to-primary-400 
                                flex items-center justify-center text-white font-semibold">
                                        {getOtherParticipant(currentConversation).username[0].toUpperCase()}
                                    </div>
                                    {getOtherParticipant(currentConversation).is_online && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full 
                                  border-2 border-dark-900" />
                                    )}
                                </div>

                                <div>
                                    <p className="font-medium text-dark-100">
                                        @{getOtherParticipant(currentConversation).username}
                                    </p>
                                    <p className="text-xs text-dark-400">
                                        {typingUsers.length > 0
                                            ? 'Mengetik...'
                                            : getOtherParticipant(currentConversation).is_online
                                                ? 'Online'
                                                : 'Offline'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <button className="btn-ghost p-2 hidden sm:block">
                                    <Phone className="w-5 h-5" />
                                </button>
                                <button className="btn-ghost p-2 hidden sm:block">
                                    <Video className="w-5 h-5" />
                                </button>
                                <button className="btn-ghost p-2">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </header>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message, index) => {
                                const isMine = message.sender_id === user?.id
                                const showDate = index === 0 ||
                                    formatDate(messages[index - 1].created_at) !== formatDate(message.created_at)

                                return (
                                    <div key={message.id}>
                                        {showDate && (
                                            <div className="flex justify-center my-4">
                                                <span className="px-3 py-1 bg-dark-800/50 rounded-full text-xs text-dark-400">
                                                    {formatDate(message.created_at)}
                                                </span>
                                            </div>
                                        )}

                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                            className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={isMine ? 'chat-bubble-sent' : 'chat-bubble-received'}>
                                                <p className="break-words">{message.content}</p>
                                                <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'
                                                    }`}>
                                                    <span className={`text-xs ${isMine ? 'text-white/60' : 'text-dark-500'
                                                        }`}>
                                                        {formatTime(message.created_at)}
                                                    </span>
                                                    {isMine && (
                                                        message.is_read
                                                            ? <CheckCheck className="w-3.5 h-3.5 text-primary-300" />
                                                            : <Check className="w-3.5 h-3.5 text-white/60" />
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                )
                            })}

                            {/* Typing indicator */}
                            <AnimatePresence>
                                {typingUsers.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="flex justify-start"
                                    >
                                        <div className="chat-bubble-received flex items-center gap-1">
                                            <div className="flex gap-1">
                                                {[0, 1, 2].map((i) => (
                                                    <motion.div
                                                        key={i}
                                                        className="w-2 h-2 rounded-full bg-dark-400"
                                                        animate={{ scale: [1, 1.2, 1] }}
                                                        transition={{
                                                            duration: 0.6,
                                                            repeat: Infinity,
                                                            delay: i * 0.2,
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message input */}
                        <form onSubmit={sendMessage} className="p-4 border-t border-dark-800 bg-dark-900/50 backdrop-blur-xl">
                            <div className="flex items-center gap-2">
                                <button type="button" className="btn-ghost p-2 hidden sm:block">
                                    <Smile className="w-5 h-5" />
                                </button>
                                <button type="button" className="btn-ghost p-2 hidden sm:block">
                                    <Paperclip className="w-5 h-5" />
                                </button>

                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => {
                                        setNewMessage(e.target.value)
                                        handleTyping()
                                    }}
                                    placeholder="Ketik pesan..."
                                    className="flex-1 px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl 
                           text-dark-100 placeholder-dark-500 focus:outline-none 
                           focus:border-accent-500/50 transition-colors"
                                />

                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || isSending}
                                    className="w-12 h-12 rounded-xl bg-gradient-to-r from-accent-500 to-primary-500 
                           flex items-center justify-center text-white shadow-lg shadow-accent-500/30
                           hover:from-accent-400 hover:to-primary-400 transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    /* No conversation selected */
                    <div className="flex-1 flex items-center justify-center bg-dark-950">
                        <div className="text-center px-6">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-accent-500/20 to-primary-500/20 
                          flex items-center justify-center mx-auto mb-6"
                            >
                                <MessageCircle className="w-12 h-12 text-accent-400" />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-dark-100 mb-2">WhatsNep</h2>
                            <p className="text-dark-400 max-w-sm">
                                Pilih chat dari daftar atau cari user baru untuk memulai percakapan
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

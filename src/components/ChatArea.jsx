import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, MoreVertical } from 'lucide-react'
import { useChat } from '../contexts/ChatContext'
import { useAuth } from '../contexts/AuthContext'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'

// Main chat area component
const ChatArea = ({ onBack }) => {
  const { 
    activeChat, 
    messages, 
    fetchMessages, 
    sendMessage, 
    typingUsers,
    setTyping 
  } = useChat()
  const { user } = useAuth()
  
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const otherUser = activeChat?.otherUser

  // Fetch messages when active chat changes
  useEffect(() => {
    if (activeChat?.id) {
      fetchMessages(activeChat.id)
    }
  }, [activeChat?.id, fetchMessages])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [activeChat])

  // Handle typing indicator
  const handleTyping = () => {
    if (!activeChat) return

    // Set typing to true
    setTyping(activeChat.id, true)

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set typing to false after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(activeChat.id, false)
    }, 2000)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !activeChat || sending) return

    setSending(true)
    setTyping(activeChat.id, false)
    
    const messageContent = newMessage.trim()
    setNewMessage('')
    
    try {
      await sendMessage(activeChat.id, messageContent)
    } catch (error) {
      console.error('Failed to send message:', error)
      setNewMessage(messageContent) // Restore message on error
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  // Format last seen time
  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Unknown'
    const date = new Date(timestamp)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)
    
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex flex-col h-full bg-dark-950">
      {/* Chat header */}
      <motion.header
        className="flex items-center gap-3 p-4 border-b border-dark-800 bg-dark-900/80 backdrop-blur-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Back button for mobile */}
        {onBack && (
          <motion.button
            className="p-2 rounded-xl text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
            onClick={onBack}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft size={20} />
          </motion.button>
        )}

        {/* User avatar */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
            {otherUser?.username?.charAt(0).toUpperCase() || '?'}
          </div>
          {otherUser?.is_online && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-900" />
          )}
        </div>

        {/* User info */}
        <div className="flex-1">
          <h2 className="font-semibold text-white">
            {otherUser?.username || 'Unknown User'}
          </h2>
          <p className="text-xs text-dark-400">
            {otherUser?.is_online 
              ? 'Online' 
              : `Last seen ${formatLastSeen(otherUser?.last_seen)}`
            }
          </p>
        </div>

        {/* Menu button */}
        <motion.button
          className="p-2 rounded-xl text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <MoreVertical size={20} />
        </motion.button>
      </motion.header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender_id === user?.id}
              showAvatar={
                index === 0 || 
                messages[index - 1]?.sender_id !== message.sender_id
              }
            />
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {typingUsers[activeChat?.id] && (
          <TypingIndicator username={typingUsers[activeChat?.id]} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <motion.form
        className="p-4 border-t border-dark-800 bg-dark-900/80 backdrop-blur-lg"
        onSubmit={handleSendMessage}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value)
                handleTyping()
              }}
              placeholder="Type a message..."
              className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-dark-700 text-white placeholder-dark-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              disabled={sending}
            />
          </div>
          
          <motion.button
            type="submit"
            className={`
              p-3 rounded-xl flex items-center justify-center
              ${newMessage.trim() 
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-cyan-500/25' 
                : 'bg-dark-800 text-dark-400'
              }
              transition-all duration-200
            `}
            whileHover={newMessage.trim() ? { scale: 1.05 } : {}}
            whileTap={newMessage.trim() ? { scale: 0.95 } : {}}
            disabled={!newMessage.trim() || sending}
          >
            <Send size={20} />
          </motion.button>
        </div>
      </motion.form>
    </div>
  )
}

export default ChatArea

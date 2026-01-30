import { motion } from 'framer-motion'
import { useChat } from '../contexts/ChatContext'
import { useAuth } from '../contexts/AuthContext'

// Conversation list component
const ConversationList = ({ onSelectConversation }) => {
  const { conversations, activeChat, unreadCounts } = useChat()
  const { user } = useAuth()

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-dark-400">
        <p className="text-sm">No conversations yet</p>
        <p className="text-xs mt-1">Start a new chat to get going!</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-dark-800/50">
      {conversations.map((conversation, index) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isActive={activeChat?.id === conversation.id}
          unreadCount={unreadCounts[conversation.id] || 0}
          onClick={() => onSelectConversation(conversation)}
          delay={index * 0.05}
        />
      ))}
    </div>
  )
}

// Individual conversation item
const ConversationItem = ({ 
  conversation, 
  isActive, 
  unreadCount, 
  onClick,
  delay 
}) => {
  const otherUser = conversation.otherUser
  const lastMessage = conversation.lastMessage
  
  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    // Less than 24 hours
    if (diff < 86400000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    // Less than a week
    if (diff < 604800000) {
      return date.toLocaleDateString([], { weekday: 'short' })
    }
    // Older
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <motion.button
      className={`
        w-full p-4 flex items-center gap-3 text-left transition-all duration-200
        ${isActive 
          ? 'bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border-l-2 border-cyan-500' 
          : 'hover:bg-dark-800/50'
        }
      `}
      onClick={onClick}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      whileHover={{ x: 5 }}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-lg">
          {otherUser?.username?.charAt(0).toUpperCase() || '?'}
        </div>
        
        {/* Online indicator */}
        {otherUser?.is_online && (
          <motion.span
            className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-dark-900"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className={`font-medium truncate ${isActive ? 'text-white' : 'text-dark-200'}`}>
            {otherUser?.username || 'Unknown User'}
          </h3>
          <span className="text-xs text-dark-400 flex-shrink-0 ml-2">
            {formatTime(lastMessage?.created_at)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <p className={`text-sm truncate ${unreadCount > 0 ? 'text-dark-300 font-medium' : 'text-dark-400'}`}>
            {lastMessage?.content || 'No messages yet'}
          </p>
          
          {unreadCount > 0 && (
            <motion.span
              className="ml-2 flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-cyan-500 text-xs font-medium text-white flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </div>
      </div>
    </motion.button>
  )
}

export default ConversationList

import { motion } from 'framer-motion'

// Message bubble component with animations
const MessageBubble = ({ message, isOwn, showAvatar }) => {
  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <motion.div
      className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
    >
      {/* Avatar placeholder for spacing */}
      <div className={`w-8 flex-shrink-0 ${!showAvatar && 'invisible'}`}>
        {showAvatar && !isOwn && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-semibold">
            {message.sender?.username?.charAt(0).toUpperCase() || '?'}
          </div>
        )}
      </div>

      {/* Message bubble */}
      <div
        className={`
          relative max-w-[70%] sm:max-w-[60%] px-4 py-2.5 rounded-2xl
          ${isOwn 
            ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-br-md' 
            : 'bg-dark-800 text-white rounded-bl-md'
          }
        `}
      >
        {/* Sender name for group chats (not needed for DM but keeping for structure) */}
        {showAvatar && !isOwn && (
          <p className="text-xs font-medium text-cyan-400 mb-1">
            {message.sender?.username || 'Unknown'}
          </p>
        )}

        {/* Message content */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>

        {/* Timestamp and read status */}
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
          <span className={`text-[10px] ${isOwn ? 'text-white/70' : 'text-dark-400'}`}>
            {formatTime(message.created_at)}
          </span>
          {isOwn && (
            <span className="text-[10px] text-white/70">
              {message.is_read ? '✓✓' : '✓'}
            </span>
          )}
        </div>

        {/* Bubble tail effect */}
        <div
          className={`
            absolute bottom-0 w-3 h-3
            ${isOwn 
              ? 'right-0 translate-x-1 bg-cyan-500' 
              : 'left-0 -translate-x-1 bg-dark-800'
            }
          `}
          style={{
            clipPath: isOwn 
              ? 'polygon(0 0, 100% 0, 0 100%)' 
              : 'polygon(100% 0, 100% 100%, 0 0)'
          }}
        />
      </div>
    </motion.div>
  )
}

export default MessageBubble

import { motion } from 'framer-motion'

// Typing indicator component
const TypingIndicator = ({ username }) => {
  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-semibold">
        {username?.charAt(0).toUpperCase() || '?'}
      </div>

      {/* Typing bubble */}
      <div className="px-4 py-3 rounded-2xl bg-dark-800 rounded-bl-md">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              className="w-2 h-2 rounded-full bg-dark-400 typing-dot"
              style={{ animationDelay: `${index * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      {/* Username hint */}
      <span className="text-xs text-dark-500">{username} is typing...</span>
    </motion.div>
  )
}

export default TypingIndicator

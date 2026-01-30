import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, X, UserPlus } from 'lucide-react'
import { useChat } from '../contexts/ChatContext'

// User search modal component
const UserSearch = ({ onClose }) => {
  const { searchUsers, startConversation, setActiveChat } = useChat()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [starting, setStarting] = useState(null)
  const inputRef = useRef(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Search users with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true)
        const users = await searchUsers(query)
        setResults(users)
        setLoading(false)
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, searchUsers])

  // Handle starting a conversation
  const handleStartChat = async (userId) => {
    setStarting(userId)
    try {
      const conversation = await startConversation(userId)
      if (conversation) {
        setActiveChat(conversation)
        onClose()
      }
    } catch (error) {
      console.error('Failed to start conversation:', error)
    } finally {
      setStarting(null)
    }
  }

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md bg-dark-900 rounded-2xl border border-dark-800 shadow-2xl overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-dark-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Find Users</h2>
          <motion.button
            className="p-2 rounded-xl text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={20} />
          </motion.button>
        </div>

        {/* Search input */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by username..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-800 border border-dark-700 text-white placeholder-dark-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-dark-400">
              <motion.div
                className="w-6 h-6 mx-auto border-2 border-dark-700 border-t-cyan-500 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <p className="mt-2 text-sm">Searching...</p>
            </div>
          )}

          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <div className="p-8 text-center text-dark-400">
              <p className="text-sm">No users found matching "{query}"</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="divide-y divide-dark-800/50">
              {results.map((user, index) => (
                <motion.div
                  key={user.id}
                  className="p-4 flex items-center justify-between hover:bg-dark-800/50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                        {user.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                      {user.is_online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-900" />
                      )}
                    </div>

                    {/* User info */}
                    <div>
                      <p className="font-medium text-white">{user.username}</p>
                      <p className="text-xs text-dark-400">
                        {user.is_online ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>

                  {/* Start chat button */}
                  <motion.button
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 text-cyan-400 flex items-center gap-2 text-sm font-medium hover:from-indigo-500/30 hover:to-cyan-500/30 transition-all disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStartChat(user.id)}
                    disabled={starting === user.id}
                  >
                    {starting === user.id ? (
                      <motion.div
                        className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                    ) : (
                      <UserPlus size={16} />
                    )}
                    <span>Chat</span>
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && query.trim().length < 2 && (
            <div className="p-8 text-center text-dark-400">
              <Search className="mx-auto mb-2 opacity-50" size={32} />
              <p className="text-sm">Type at least 2 characters to search</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default UserSearch

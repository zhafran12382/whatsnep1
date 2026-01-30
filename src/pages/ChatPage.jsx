import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  MessageCircle, 
  Settings, 
  LogOut, 
  Search, 
  Plus,
  Menu,
  X
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useChat } from '../contexts/ChatContext'
import ConversationList from '../components/ConversationList'
import ChatArea from '../components/ChatArea'
import UserSearch from '../components/UserSearch'
import { LoadingScreen } from '../components/LoadingSpinner'

// Main Chat Dashboard with sidebar and chat area
const ChatPage = () => {
  const navigate = useNavigate()
  const { user, userProfile, signOut, loading: authLoading } = useAuth()
  const { 
    conversations, 
    activeChat, 
    setActiveChat, 
    loading: chatLoading 
  } = useChat()
  
  const [showSidebar, setShowSidebar] = useState(true)
  const [showUserSearch, setShowUserSearch] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) setShowSidebar(true)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Hide sidebar on mobile when chat is selected
  useEffect(() => {
    if (isMobile && activeChat) {
      setShowSidebar(false)
    }
  }, [activeChat, isMobile])

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const handleBackToList = () => {
    setActiveChat(null)
    setShowSidebar(true)
  }

  if (authLoading || chatLoading) {
    return <LoadingScreen message="Loading your chats..." />
  }

  return (
    <div className="h-screen bg-dark-950 flex overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {(showSidebar || !isMobile) && (
          <motion.aside
            className={`
              ${isMobile ? 'absolute inset-y-0 left-0 z-30 w-full' : 'relative w-80 lg:w-96'}
              bg-dark-900 border-r border-dark-800 flex flex-col
            `}
            initial={isMobile ? { x: '-100%' } : false}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Sidebar header */}
            <div className="p-4 border-b border-dark-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <MessageCircle className="text-white" size={20} />
                  </motion.div>
                  <div>
                    <h1 className="font-bold text-white">WhatsNep</h1>
                    <p className="text-xs text-dark-400">@{userProfile?.username || 'user'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <motion.button
                    className="p-2 rounded-xl text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/settings')}
                    title="Settings"
                  >
                    <Settings size={20} />
                  </motion.button>
                  <motion.button
                    className="p-2 rounded-xl text-dark-400 hover:text-red-400 hover:bg-dark-800 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleLogout}
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </motion.button>
                </div>
              </div>

              {/* New chat button */}
              <motion.button
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 text-white flex items-center justify-center gap-2 hover:from-indigo-500/30 hover:to-cyan-500/30 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowUserSearch(true)}
              >
                <Plus size={18} />
                <span>New Chat</span>
              </motion.button>
            </div>

            {/* Conversations list */}
            <div className="flex-1 overflow-y-auto">
              <ConversationList 
                onSelectConversation={(conv) => {
                  setActiveChat(conv)
                  if (isMobile) setShowSidebar(false)
                }}
              />
            </div>

            {/* Online status indicator */}
            <div className="p-4 border-t border-dark-800">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-dark-400">Online</span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col relative">
        {activeChat ? (
          <ChatArea onBack={isMobile ? handleBackToList : null} />
        ) : (
          <EmptyState onNewChat={() => setShowUserSearch(true)} />
        )}
      </main>

      {/* User search modal */}
      <AnimatePresence>
        {showUserSearch && (
          <UserSearch onClose={() => setShowUserSearch(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

// Empty state when no chat is selected
const EmptyState = ({ onNewChat }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
    <motion.div
      className="w-24 h-24 mb-6 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 rounded-3xl flex items-center justify-center"
      initial={{ scale: 0 }}
      animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
      transition={{ duration: 0.5 }}
    >
      <MessageCircle className="text-cyan-400" size={40} />
    </motion.div>
    
    <motion.h2
      className="text-2xl font-bold text-white mb-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      Welcome to WhatsNep
    </motion.h2>
    
    <motion.p
      className="text-dark-400 mb-6 max-w-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      Select a conversation from the sidebar or start a new chat to begin messaging.
    </motion.p>
    
    <motion.button
      className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-medium flex items-center gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onNewChat}
    >
      <Plus size={18} />
      <span>Start New Chat</span>
    </motion.button>
  </div>
)

export default ChatPage

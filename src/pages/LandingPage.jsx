import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Shield, Zap, Sparkles } from 'lucide-react'
import Button from '../components/Button'

// Landing page with animated hero section
const LandingPage = () => {
  const navigate = useNavigate()

  // Floating animation for background elements
  const floatAnimation = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }

  // Feature cards data
  const features = [
    {
      icon: MessageCircle,
      title: 'Real-time Chat',
      description: 'Instant messaging with typing indicators and read receipts',
    },
    {
      icon: Shield,
      title: 'Secure',
      description: 'End-to-end encryption and session-based authentication',
    },
    {
      icon: Zap,
      title: 'Fast',
      description: 'Lightning-fast performance with optimized real-time updates',
    },
  ]

  return (
    <div className="min-h-screen bg-dark-950 overflow-hidden relative">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.header
          className="flex items-center justify-between mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <MessageCircle className="text-white" size={20} />
            </motion.div>
            <span className="text-xl font-bold gradient-text">WhatsNep</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button onClick={() => navigate('/register')}>
              Get Started
            </Button>
          </div>
        </motion.header>

        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 min-h-[70vh]">
          {/* Left side - Text content */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-800/50 border border-dark-700 mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Sparkles className="text-cyan-400" size={16} />
              <span className="text-sm text-dark-300">Simple, Secure, Beautiful</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-white">Chat with </span>
              <span className="gradient-text">Confidence</span>
            </h1>

            <p className="text-lg text-dark-400 mb-8 max-w-xl mx-auto lg:mx-0">
              Experience the next generation of private messaging. 
              WhatsNep combines elegant design with rock-solid security 
              for seamless, worry-free conversations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" onClick={() => navigate('/register')}>
                Start Chatting Free
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>
                I have an account
              </Button>
            </div>
          </motion.div>

          {/* Right side - Animated illustration */}
          <motion.div
            className="flex-1 flex justify-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="relative w-72 h-72 md:w-96 md:h-96">
              {/* Floating chat bubbles */}
              <motion.div
                className="absolute top-0 left-0 p-4 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 rounded-2xl border border-indigo-500/30 backdrop-blur-sm"
                {...floatAnimation}
              >
                <p className="text-white text-sm">Hey! How are you? 👋</p>
              </motion.div>

              <motion.div
                className="absolute top-20 right-0 p-4 bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 rounded-2xl border border-cyan-500/30 backdrop-blur-sm"
                animate={{
                  y: [0, 20, 0],
                  transition: {
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1,
                  },
                }}
              >
                <p className="text-white text-sm">I'm great, thanks! 🎉</p>
              </motion.div>

              <motion.div
                className="absolute bottom-20 left-10 p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30 backdrop-blur-sm"
                animate={{
                  y: [0, -15, 0],
                  transition: {
                    duration: 4.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.5,
                  },
                }}
              >
                <p className="text-white text-sm">Let's catch up! ☕</p>
              </motion.div>

              {/* Center logo */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-500/30"
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <MessageCircle className="text-white" size={40} />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 mt-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="p-6 rounded-2xl bg-dark-900/50 border border-dark-800 hover:border-dark-700 transition-all duration-300 group"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center group-hover:from-indigo-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                <feature.icon className="text-cyan-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-dark-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.footer
          className="text-center mt-20 pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-dark-500 text-sm">
            © 2025 WhatsNep. Built with ❤️ for secure conversations.
          </p>
        </motion.footer>
      </div>
    </div>
  )
}

export default LandingPage

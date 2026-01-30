import { motion } from 'framer-motion'

// Loading spinner component with gradient animation
const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`${sizes[size]} rounded-full border-4 border-dark-700`}
        style={{
          borderTopColor: '#6366f1',
          borderRightColor: '#06b6d4',
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  )
}

// Full page loading screen
export const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-dark-950 flex flex-col items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Logo animation */}
      <motion.div
        className="mb-8"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-20 h-20 relative">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl"
            animate={{
              rotate: [0, 360],
              borderRadius: ['30%', '50%', '30%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <div className="absolute inset-2 bg-dark-950 rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold gradient-text">W</span>
          </div>
        </div>
      </motion.div>

      <LoadingSpinner size="md" className="mb-4" />
      
      <motion.p
        className="text-dark-400"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {message}
      </motion.p>
    </motion.div>
  )
}

export default LoadingSpinner

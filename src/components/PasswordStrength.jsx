import { motion } from 'framer-motion'

// Password strength indicator component
const PasswordStrength = ({ password }) => {
  const calculateStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-dark-600' }
    
    let score = 0
    
    // Length checks
    if (pwd.length >= 8) score += 1
    if (pwd.length >= 12) score += 1
    
    // Character variety checks
    if (/[a-z]/.test(pwd)) score += 1
    if (/[A-Z]/.test(pwd)) score += 1
    if (/[0-9]/.test(pwd)) score += 1
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1
    
    // Determine strength level
    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-red-500' }
    if (score <= 4) return { score: 2, label: 'Medium', color: 'bg-yellow-500' }
    if (score <= 5) return { score: 3, label: 'Strong', color: 'bg-green-500' }
    return { score: 4, label: 'Very Strong', color: 'bg-cyan-500' }
  }

  const strength = calculateStrength(password)

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((level) => (
          <motion.div
            key={level}
            className={`h-1 flex-1 rounded-full ${
              level <= strength.score ? strength.color : 'bg-dark-600'
            }`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: level * 0.1, duration: 0.2 }}
          />
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`text-xs ${
          strength.score <= 1 ? 'text-red-400' :
          strength.score <= 2 ? 'text-yellow-400' :
          strength.score <= 3 ? 'text-green-400' :
          'text-cyan-400'
        }`}
      >
        {strength.label} password
      </motion.p>
    </div>
  )
}

export default PasswordStrength

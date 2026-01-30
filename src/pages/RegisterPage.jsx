import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { User, Lock, MessageCircle, ArrowLeft, Check, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/Button'
import Input from '../components/Input'
import PasswordStrength from '../components/PasswordStrength'

// Register page with real-time validation
const RegisterPage = () => {
  const navigate = useNavigate()
  const { signUp, checkUsernameAvailable, error: authError } = useAuth()
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [usernameStatus, setUsernameStatus] = useState({
    checking: false,
    available: null,
    message: '',
  })

  // Real-time username availability check
  useEffect(() => {
    const checkUsername = async () => {
      const username = formData.username.trim()
      
      if (!username || username.length < 3) {
        setUsernameStatus({ checking: false, available: null, message: '' })
        return
      }

      // Validate username format
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setUsernameStatus({
          checking: false,
          available: false,
          message: 'Only letters, numbers, and underscores allowed',
        })
        return
      }

      setUsernameStatus({ checking: true, available: null, message: 'Checking...' })
      
      // Debounce the API call
      const timer = setTimeout(async () => {
        const isAvailable = await checkUsernameAvailable(username)
        setUsernameStatus({
          checking: false,
          available: isAvailable,
          message: isAvailable ? 'Username is available!' : 'Username is taken',
        })
      }, 500)

      return () => clearTimeout(timer)
    }

    checkUsername()
  }, [formData.username, checkUsernameAvailable])

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required')
      return false
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters')
      return false
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError('Username can only contain letters, numbers, and underscores')
      return false
    }
    if (!formData.password) {
      setError('Password is required')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (!usernameStatus.available) {
      setError('Please choose an available username')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) return

    setLoading(true)
    try {
      const { error: signUpError } = await signUp(formData.username, formData.password)
      
      if (signUpError) {
        setError(signUpError.message || 'Failed to create account')
      } else {
        navigate('/chat')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/3 -left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 7, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/3 -right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 9, repeat: Infinity }}
        />
      </div>

      {/* Back button */}
      <motion.button
        className="absolute top-6 left-6 flex items-center gap-2 text-dark-400 hover:text-white transition-colors"
        onClick={() => navigate('/')}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -5 }}
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </motion.button>

      {/* Register card */}
      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-dark-900/80 backdrop-blur-xl rounded-3xl border border-dark-800 p-8 shadow-2xl">
          {/* Logo and title */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <MessageCircle className="text-white" size={28} />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-dark-400">Join WhatsNep and start chatting</p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Input
                label="Username"
                value={formData.username}
                onChange={handleChange('username')}
                placeholder="Choose a unique username"
                icon={User}
                disabled={loading}
                success={usernameStatus.available === true}
                error={usernameStatus.available === false ? usernameStatus.message : null}
                hint={usernameStatus.checking ? 'Checking availability...' : null}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Input
                type="password"
                label="Password"
                value={formData.password}
                onChange={handleChange('password')}
                placeholder="Create a strong password"
                icon={Lock}
                showPasswordToggle
                disabled={loading}
              />
              <PasswordStrength password={formData.password} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Input
                type="password"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                placeholder="Confirm your password"
                icon={Lock}
                showPasswordToggle
                disabled={loading}
                success={formData.confirmPassword && formData.password === formData.confirmPassword}
                error={formData.confirmPassword && formData.password !== formData.confirmPassword ? 'Passwords do not match' : null}
              />
            </motion.div>

            {/* Error message */}
            {(error || authError) && (
              <motion.div
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {error || authError}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                type="submit"
                loading={loading}
                disabled={loading || usernameStatus.available === false}
                className="w-full"
                size="lg"
              >
                Create Account
              </Button>
            </motion.div>
          </form>

          {/* Login link */}
          <motion.p
            className="text-center mt-6 text-dark-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
            >
              Sign in
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}

export default RegisterPage

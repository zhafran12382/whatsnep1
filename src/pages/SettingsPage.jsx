import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock, User, Shield, Bell, Check } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/Button'
import Input from '../components/Input'
import PasswordStrength from '../components/PasswordStrength'

// Settings page for user preferences
const SettingsPage = () => {
  const navigate = useNavigate()
  const { userProfile, changePassword } = useAuth()
  
  const [activeSection, setActiveSection] = useState('password')
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handlePasswordChange = (field) => (e) => {
    setPasswordData(prev => ({ ...prev, [field]: e.target.value }))
    setError('')
    setSuccess('')
  }

  const handleSubmitPassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!passwordData.newPassword) {
      setError('New password is required')
      return
    }
    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await changePassword(passwordData.newPassword)
      
      if (updateError) {
        setError(updateError.message || 'Failed to update password')
      } else {
        setSuccess('Password updated successfully!')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const menuItems = [
    { id: 'password', icon: Lock, label: 'Change Password' },
    { id: 'account', icon: User, label: 'Account Info' },
    { id: 'privacy', icon: Shield, label: 'Privacy' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
  ]

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-10 bg-dark-900/80 backdrop-blur-lg border-b border-dark-800 p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <motion.button
            className="p-2 rounded-xl text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
            onClick={() => navigate('/chat')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft size={20} />
          </motion.button>
          <h1 className="text-xl font-bold text-white">Settings</h1>
        </div>
      </motion.header>

      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar menu */}
          <motion.nav
            className="md:w-56 flex-shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-dark-900 rounded-2xl border border-dark-800 p-2 md:sticky md:top-24">
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all
                    ${activeSection === item.id 
                      ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-white' 
                      : 'text-dark-400 hover:text-white hover:bg-dark-800'
                    }
                  `}
                  onClick={() => setActiveSection(item.id)}
                  whileHover={{ x: 5 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <item.icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.nav>

          {/* Content area */}
          <motion.main
            className="flex-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-dark-900 rounded-2xl border border-dark-800 p-6">
              {activeSection === 'password' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h2 className="text-lg font-semibold text-white mb-6">Change Password</h2>
                  
                  <form onSubmit={handleSubmitPassword} className="space-y-5 max-w-md">
                    <Input
                      type="password"
                      label="New Password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange('newPassword')}
                      placeholder="Enter new password"
                      icon={Lock}
                      showPasswordToggle
                      disabled={loading}
                    />
                    <PasswordStrength password={passwordData.newPassword} />

                    <Input
                      type="password"
                      label="Confirm New Password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange('confirmPassword')}
                      placeholder="Confirm new password"
                      icon={Lock}
                      showPasswordToggle
                      disabled={loading}
                      success={passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword}
                      error={passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword ? 'Passwords do not match' : null}
                    />

                    {error && (
                      <motion.div
                        className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        {error}
                      </motion.div>
                    )}

                    {success && (
                      <motion.div
                        className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <Check size={16} />
                        {success}
                      </motion.div>
                    )}

                    <Button
                      type="submit"
                      loading={loading}
                      disabled={loading}
                    >
                      Update Password
                    </Button>
                  </form>
                </motion.div>
              )}

              {activeSection === 'account' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h2 className="text-lg font-semibold text-white mb-6">Account Information</h2>
                  
                  <div className="space-y-6 max-w-md">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
                        {userProfile?.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">
                          @{userProfile?.username || 'user'}
                        </h3>
                        <p className="text-sm text-dark-400">
                          Member since {userProfile?.created_at 
                            ? new Date(userProfile.created_at).toLocaleDateString() 
                            : 'Unknown'}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700">
                      <p className="text-sm text-dark-400 mb-1">Username</p>
                      <p className="text-white font-medium">{userProfile?.username || 'N/A'}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700">
                      <p className="text-sm text-dark-400 mb-1">Account Status</p>
                      <p className="text-green-400 font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Active
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'privacy' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h2 className="text-lg font-semibold text-white mb-6">Privacy Settings</h2>
                  
                  <div className="space-y-4 max-w-md">
                    <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700 flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Show Online Status</p>
                        <p className="text-sm text-dark-400">Let others see when you're online</p>
                      </div>
                      <div className="w-12 h-6 rounded-full bg-cyan-500 relative cursor-pointer">
                        <div className="absolute right-0.5 top-0.5 w-5 h-5 rounded-full bg-white" />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700">
                      <p className="text-white font-medium mb-2">Session Security</p>
                      <p className="text-sm text-dark-400">
                        Your session is automatically logged out when you close the browser tab for maximum security.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h2 className="text-lg font-semibold text-white mb-6">Notification Settings</h2>
                  
                  <div className="space-y-4 max-w-md">
                    <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700 flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Browser Notifications</p>
                        <p className="text-sm text-dark-400">Receive notifications for new messages</p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => Notification.requestPermission()}
                      >
                        Enable
                      </Button>
                    </div>

                    <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700 flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Sound Notifications</p>
                        <p className="text-sm text-dark-400">Play sound for new messages</p>
                      </div>
                      <div className="w-12 h-6 rounded-full bg-dark-600 relative cursor-pointer">
                        <div className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-dark-400" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage

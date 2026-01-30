import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Check, X } from 'lucide-react'

// Animated input component with validation states
const Input = ({
  type = 'text',
  label,
  value,
  onChange,
  placeholder,
  error,
  success,
  hint,
  icon: Icon,
  showPasswordToggle = false,
  disabled = false,
  className = '',
  onBlur,
  onFocus,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const inputType = showPasswordToggle && showPassword ? 'text' : type

  const handleFocus = (e) => {
    setIsFocused(true)
    onFocus?.(e)
  }

  const handleBlur = (e) => {
    setIsFocused(false)
    onBlur?.(e)
  }

  return (
    <div className={`relative ${className}`}>
      {label && (
        <motion.label
          className="block text-sm font-medium text-dark-300 mb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {label}
        </motion.label>
      )}
      
      <div className="relative">
        {/* Icon */}
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">
            <Icon size={18} />
          </div>
        )}

        {/* Input field */}
        <motion.input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`
            w-full px-4 py-3 rounded-xl
            bg-dark-800/50 border
            text-white placeholder-dark-500
            transition-all duration-300
            focus:outline-none
            ${Icon ? 'pl-10' : ''}
            ${showPasswordToggle ? 'pr-20' : success || error ? 'pr-10' : ''}
            ${error ? 'border-red-500/50 focus:border-red-500' : 
              success ? 'border-green-500/50 focus:border-green-500' :
              isFocused ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/10' :
              'border-dark-600 hover:border-dark-500'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          {...props}
        />

        {/* Status indicators */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-dark-400 hover:text-dark-300 transition-colors p-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
          
          <AnimatePresence>
            {success && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="text-green-500"
              >
                <Check size={18} />
              </motion.span>
            )}
            {error && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="text-red-500"
              >
                <X size={18} />
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Error/Hint message */}
      <AnimatePresence>
        {(error || hint) && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={`mt-2 text-sm ${error ? 'text-red-400' : 'text-dark-400'}`}
          >
            {error || hint}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Input

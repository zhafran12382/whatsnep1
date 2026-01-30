import { motion } from 'framer-motion'

// Animated button component with gradient and hover effects
const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  const baseStyles = `
    relative overflow-hidden font-medium rounded-xl
    transition-all duration-300 ease-out
    focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-dark-900
    disabled:opacity-50 disabled:cursor-not-allowed
    flex items-center justify-center gap-2
  `

  const variants = {
    primary: `
      bg-gradient-to-r from-indigo-500 to-cyan-500
      hover:from-indigo-600 hover:to-cyan-600
      text-white shadow-lg shadow-cyan-500/25
      hover:shadow-cyan-500/40 hover:scale-[1.02]
      active:scale-[0.98]
    `,
    secondary: `
      bg-dark-800 border border-dark-600
      hover:bg-dark-700 hover:border-dark-500
      text-white
    `,
    ghost: `
      bg-transparent hover:bg-dark-800/50
      text-dark-300 hover:text-white
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-pink-500
      hover:from-red-600 hover:to-pink-600
      text-white shadow-lg shadow-red-500/25
    `,
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg',
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      {...props}
    >
      {loading && (
        <motion.span
          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )}
      {children}
    </motion.button>
  )
}

export default Button

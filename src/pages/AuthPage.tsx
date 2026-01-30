import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
    MessageCircle, Mail, Lock, User, Eye, EyeOff,
    Check, X, Loader2, ArrowLeft
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

type AuthMode = 'login' | 'register'

export default function AuthPage() {
    const [searchParams] = useSearchParams()
    const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login'

    const [mode, setMode] = useState<AuthMode>(initialMode)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    // Username validation
    const [isCheckingUsername, setIsCheckingUsername] = useState(false)
    const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null)

    const { signIn, signUp, checkUsernameAvailable } = useAuth()
    const navigate = useNavigate()

    // Check username availability with debounce
    useEffect(() => {
        if (mode !== 'register' || username.length < 3) {
            setIsUsernameAvailable(null)
            return
        }

        const timer = setTimeout(async () => {
            setIsCheckingUsername(true)
            const available = await checkUsernameAvailable(username)
            setIsUsernameAvailable(available)
            setIsCheckingUsername(false)
        }, 500)

        return () => clearTimeout(timer)
    }, [username, mode, checkUsernameAvailable])

    // Password strength calculation
    const getPasswordStrength = (pass: string): { score: number; label: string; color: string } => {
        let score = 0
        if (pass.length >= 6) score++
        if (pass.length >= 8) score++
        if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++
        if (/\d/.test(pass)) score++
        if (/[^a-zA-Z0-9]/.test(pass)) score++

        if (score <= 1) return { score, label: 'Lemah', color: 'bg-red-500' }
        if (score <= 2) return { score, label: 'Cukup', color: 'bg-yellow-500' }
        if (score <= 3) return { score, label: 'Bagus', color: 'bg-blue-500' }
        return { score, label: 'Kuat', color: 'bg-green-500' }
    }

    const passwordStrength = getPasswordStrength(password)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            if (mode === 'register') {
                if (!isUsernameAvailable) {
                    setError('Username tidak tersedia')
                    setIsLoading(false)
                    return
                }

                const { error } = await signUp(email, password, username)
                if (error) throw error
            } else {
                const { error } = await signIn(email, password)
                if (error) throw error
            }

            navigate('/chat')
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan'
            setError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const switchMode = () => {
        setMode(mode === 'login' ? 'register' : 'login')
        setError('')
        setIsUsernameAvailable(null)
    }

    return (
        <div className="min-h-screen bg-dark-950 flex">
            {/* Left side - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent-600 via-accent-700 to-primary-700" />

                {/* Pattern overlay */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />

                {/* Floating elements */}
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-white/10 backdrop-blur-sm"
                        style={{
                            width: Math.random() * 100 + 50,
                            height: Math.random() * 100 + 50,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 5 + Math.random() * 3,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center p-12 text-white">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <MessageCircle className="w-6 h-6" />
                            </div>
                            <span className="text-2xl font-bold">WhatsNep</span>
                        </div>

                        <h1 className="text-4xl font-bold mb-4">
                            {mode === 'login'
                                ? 'Selamat datang kembali!'
                                : 'Bergabung bersama kami'}
                        </h1>

                        <p className="text-lg text-white/80 max-w-md">
                            {mode === 'login'
                                ? 'Masuk ke akunmu dan lanjutkan percakapan dengan teman-temanmu.'
                                : 'Buat akun baru dan mulai chat dengan cara yang lebih menyenangkan.'}
                        </p>
                    </motion.div>

                    {/* Chat preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-12 space-y-3"
                    >
                        <div className="flex justify-start">
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl rounded-bl-md px-4 py-2 max-w-[250px]">
                                Hey, gimana kabarmu? 😊
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <div className="bg-white rounded-2xl rounded-br-md px-4 py-2 text-accent-700 max-w-[250px]">
                                Baik! Yuk ngobrol di WhatsNep!
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex-1 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold gradient-text">WhatsNep</span>
                    </div>

                    {/* Back link */}
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1 text-dark-400 hover:text-dark-200 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Kembali</span>
                    </Link>

                    {/* Form header */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-dark-100 mb-2">
                            {mode === 'login' ? 'Masuk' : 'Daftar'}
                        </h2>
                        <p className="text-dark-400">
                            {mode === 'login'
                                ? 'Masuk dengan email dan password'
                                : 'Buat akun baru untuk mulai chatting'}
                        </p>
                    </div>

                    {/* Error message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username field (register only) */}
                        <AnimatePresence>
                            {mode === 'register' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <label className="block text-sm font-medium text-dark-300 mb-2">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                            placeholder="username_kamu"
                                            className="input-field pl-12 pr-12"
                                            required={mode === 'register'}
                                            minLength={3}
                                            maxLength={20}
                                        />
                                        {/* Username availability indicator */}
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            {isCheckingUsername ? (
                                                <Loader2 className="w-5 h-5 text-dark-500 animate-spin" />
                                            ) : isUsernameAvailable === true ? (
                                                <Check className="w-5 h-5 text-green-500" />
                                            ) : isUsernameAvailable === false ? (
                                                <X className="w-5 h-5 text-red-500" />
                                            ) : null}
                                        </div>
                                    </div>
                                    {username.length > 0 && username.length < 3 && (
                                        <p className="mt-1 text-xs text-dark-500">Minimal 3 karakter</p>
                                    )}
                                    {isUsernameAvailable === false && (
                                        <p className="mt-1 text-xs text-red-400">Username sudah digunakan</p>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Email field */}
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nama@email.com"
                                    className="input-field pl-12"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-field pl-12 pr-12"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            {/* Password strength indicator */}
                            {mode === 'register' && password.length > 0 && (
                                <div className="mt-3">
                                    <div className="flex gap-1 mb-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full transition-colors ${i <= passwordStrength.score ? passwordStrength.color : 'bg-dark-700'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className={`text-xs ${passwordStrength.score <= 1 ? 'text-red-400' :
                                            passwordStrength.score <= 2 ? 'text-yellow-400' :
                                                passwordStrength.score <= 3 ? 'text-blue-400' :
                                                    'text-green-400'
                                        }`}>
                                        Password {passwordStrength.label}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isLoading || (mode === 'register' && !isUsernameAvailable)}
                            className="w-full btn-primary py-4 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <span>{mode === 'login' ? 'Masuk' : 'Daftar'}</span>
                            )}
                        </button>
                    </form>

                    {/* Switch mode */}
                    <p className="mt-6 text-center text-dark-400">
                        {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}
                        {' '}
                        <button
                            onClick={switchMode}
                            className="text-accent-400 hover:text-accent-300 font-medium transition-colors"
                        >
                            {mode === 'login' ? 'Daftar sekarang' : 'Masuk'}
                        </button>
                    </p>
                </motion.div>
            </div>
        </div>
    )
}

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
    ArrowLeft, Lock, Eye, EyeOff, Loader2,
    CheckCircle, AlertCircle, MessageCircle,
    User, Shield, Bell, Palette
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function SettingsPage() {
    const navigate = useNavigate()
    const { profile, updatePassword, signOut } = useAuth()

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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

    const passwordStrength = getPasswordStrength(newPassword)

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)

        // Validation
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password baru minimal 6 karakter' })
            return
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Konfirmasi password tidak cocok' })
            return
        }

        setIsLoading(true)

        try {
            const { error } = await updatePassword(newPassword)

            if (error) throw error

            setMessage({ type: 'success', text: 'Password berhasil diubah' })
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Gagal mengubah password'
            setMessage({ type: 'error', text: errorMessage })
        } finally {
            setIsLoading(false)
        }
    }

    const handleLogout = async () => {
        await signOut()
        navigate('/')
    }

    const settingsMenu = [
        { icon: User, label: 'Profil', description: 'Kelola informasi profil' },
        { icon: Shield, label: 'Keamanan', description: 'Password dan autentikasi', active: true },
        { icon: Bell, label: 'Notifikasi', description: 'Pengaturan notifikasi' },
        { icon: Palette, label: 'Tampilan', description: 'Tema dan personalisasi' },
    ]

    return (
        <div className="min-h-screen bg-dark-950">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-900/10 via-dark-950 to-primary-900/10" />

            <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        to="/chat"
                        className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center 
                     hover:bg-dark-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-dark-300" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-dark-100">Pengaturan</h1>
                        <p className="text-sm text-dark-400">Kelola akun dan preferensi</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-[240px,1fr] gap-6">
                    {/* Settings menu */}
                    <nav className="space-y-1">
                        {settingsMenu.map((item, index) => (
                            <motion.button
                                key={item.label}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${item.active
                                    ? 'bg-accent-500/10 border border-accent-500/20 text-accent-400'
                                    : 'hover:bg-dark-800/50 text-dark-300'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <div>
                                    <p className="font-medium text-sm">{item.label}</p>
                                    <p className="text-xs text-dark-500">{item.description}</p>
                                </div>
                            </motion.button>
                        ))}
                    </nav>

                    {/* Settings content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Profile card */}
                        <div className="glass-card p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-primary-500 
                              flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-accent-500/30">
                                    {profile?.username?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-dark-100">@{profile?.username || 'user'}</h2>
                                    <p className="text-sm text-dark-400">Akun aktif</p>
                                </div>
                            </div>
                        </div>

                        {/* Password change form */}
                        <div className="glass-card p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center">
                                    <Lock className="w-5 h-5 text-accent-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-dark-100">Ubah Password</h3>
                                    <p className="text-sm text-dark-400">Perbarui password untuk keamanan akun</p>
                                </div>
                            </div>

                            {/* Message */}
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success'
                                        ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                        : 'bg-red-500/10 border border-red-500/20 text-red-400'
                                        }`}
                                >
                                    {message.type === 'success'
                                        ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                        : <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    }
                                    <span className="text-sm">{message.text}</span>
                                </motion.div>
                            )}

                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                {/* Current password */}
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">
                                        Password Saat Ini
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                                        <input
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="input-field pl-12 pr-12"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 
                               hover:text-dark-300 transition-colors"
                                        >
                                            {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* New password */}
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">
                                        Password Baru
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="input-field pl-12 pr-12"
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 
                               hover:text-dark-300 transition-colors"
                                        >
                                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    {/* Password strength */}
                                    {newPassword.length > 0 && (
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

                                {/* Confirm password */}
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">
                                        Konfirmasi Password Baru
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="input-field pl-12"
                                            required
                                        />
                                    </div>
                                    {confirmPassword && confirmPassword !== newPassword && (
                                        <p className="mt-1 text-xs text-red-400">Password tidak cocok</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Menyimpan...</span>
                                        </>
                                    ) : (
                                        <span>Simpan Password Baru</span>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Danger zone */}
                        <div className="glass-card p-6 border-red-500/20">
                            <h3 className="font-semibold text-dark-100 mb-4">Zona Bahaya</h3>
                            <button
                                onClick={handleLogout}
                                className="px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-400 
                         font-medium rounded-xl hover:bg-red-500/20 transition-colors"
                            >
                                Logout dari semua perangkat
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Footer */}
                <footer className="mt-12 pt-8 border-t border-dark-800 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <MessageCircle className="w-4 h-4 text-accent-400" />
                        <span className="text-dark-400 text-sm">WhatsNep</span>
                    </div>
                    <p className="text-dark-600 text-xs">Versi 1.0.0</p>
                </footer>
            </div>
        </div>
    )
}

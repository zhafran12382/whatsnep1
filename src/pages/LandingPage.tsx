import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MessageCircle, Shield, Zap, Sparkles } from 'lucide-react'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-dark-950 overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent-900/30 via-dark-950 to-primary-900/30" />

                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />

                {/* Floating particles */}
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full blur-3xl"
                        style={{
                            width: Math.random() * 300 + 150,
                            height: Math.random() * 300 + 150,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            background: i % 2 === 0
                                ? 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)'
                                : 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
                        }}
                        animate={{
                            y: [0, -40, 0],
                            x: [0, 20, 0],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 8 + Math.random() * 4,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Navigation */}
                <nav className="px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center shadow-lg shadow-accent-500/30">
                            <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold gradient-text">WhatsNep</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Link
                            to="/auth"
                            className="btn-secondary text-sm"
                        >
                            Masuk
                        </Link>
                    </motion.div>
                </nav>

                {/* Hero Section */}
                <main className="px-6 pt-16 pb-24 max-w-7xl mx-auto">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                        bg-accent-500/10 border border-accent-500/20 mb-8"
                        >
                            <Sparkles className="w-4 h-4 text-accent-400" />
                            <span className="text-sm text-accent-300">
                                Chat dengan cara yang lebih baik
                            </span>
                        </motion.div>

                        {/* Heading */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
                        >
                            <span className="text-dark-100">Ngobrol Tanpa</span>
                            <br />
                            <span className="gradient-text">Batas & Ribet</span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-lg md:text-xl text-dark-400 mb-10 max-w-2xl mx-auto"
                        >
                            WhatsNep adalah platform chat private yang mengutamakan kemudahan,
                            keamanan, dan pengalaman terbaik untuk berkomunikasi.
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <Link to="/auth" className="btn-primary text-lg px-8 py-4">
                                Mulai Sekarang
                            </Link>
                            <Link to="/auth" className="btn-secondary text-lg px-8 py-4">
                                Sudah punya akun?
                            </Link>
                        </motion.div>
                    </div>

                    {/* Features */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-24 grid md:grid-cols-3 gap-6"
                    >
                        {/* Feature 1 */}
                        <div className="glass-card p-6 group hover:border-accent-500/30 transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/20 
                             flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Zap className="w-6 h-6 text-accent-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-dark-100 mb-2">
                                Super Cepat
                            </h3>
                            <p className="text-dark-400 text-sm">
                                Real-time messaging dengan latency minimal. Pesan terkirim dalam hitungan milidetik.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="glass-card p-6 group hover:border-primary-500/30 transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 
                             flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Shield className="w-6 h-6 text-primary-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-dark-100 mb-2">
                                100% Aman
                            </h3>
                            <p className="text-dark-400 text-sm">
                                Enkripsi password dan session management ketat untuk menjaga privasi Anda.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="glass-card p-6 group hover:border-accent-500/30 transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500/20 to-primary-500/20 
                             flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <MessageCircle className="w-6 h-6 text-accent-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-dark-100 mb-2">
                                Mudah Digunakan
                            </h3>
                            <p className="text-dark-400 text-sm">
                                Interface intuitif yang bisa langsung dipakai tanpa perlu tutorial.
                            </p>
                        </div>
                    </motion.div>

                    {/* App Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="mt-24 relative"
                    >
                        <div className="glass-card p-2 md:p-4 rounded-3xl overflow-hidden">
                            <div className="bg-dark-900 rounded-2xl p-4 md:p-8">
                                {/* Mock chat interface */}
                                <div className="flex gap-4 h-[300px] md:h-[400px]">
                                    {/* Sidebar mock */}
                                    <div className="hidden md:block w-64 bg-dark-800/50 rounded-xl p-4 space-y-3">
                                        {[1, 2, 3].map((i) => (
                                            <div
                                                key={i}
                                                className={`flex items-center gap-3 p-3 rounded-lg ${i === 1 ? 'bg-accent-500/10 border border-accent-500/20' : 'opacity-50'
                                                    }`}
                                            >
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-400 to-primary-400" />
                                                <div className="flex-1">
                                                    <div className="h-3 bg-dark-600 rounded w-20 mb-2" />
                                                    <div className="h-2 bg-dark-700 rounded w-32" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Chat area mock */}
                                    <div className="flex-1 bg-dark-800/30 rounded-xl p-4 flex flex-col">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex justify-start">
                                                <div className="chat-bubble-received">
                                                    Halo! Apa kabar? 👋
                                                </div>
                                            </div>
                                            <div className="flex justify-end">
                                                <div className="chat-bubble-sent">
                                                    Baik! Kamu gimana?
                                                </div>
                                            </div>
                                            <div className="flex justify-start">
                                                <div className="chat-bubble-received">
                                                    Lagi explore WhatsNep nih, keren banget! 🚀
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <div className="flex-1 bg-dark-700 rounded-xl h-12" />
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-accent-500 to-primary-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Glow effect */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-accent-500/20 via-transparent to-primary-500/20 blur-3xl -z-10" />
                    </motion.div>
                </main>

                {/* Footer */}
                <footer className="px-6 py-8 border-t border-dark-800">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-accent-400" />
                            <span className="text-dark-400">WhatsNep</span>
                        </div>
                        <p className="text-dark-500 text-sm">
                            © 2024 WhatsNep. Made with 💜
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    )
}

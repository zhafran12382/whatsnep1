import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import ChatPage from './pages/ChatPage'
import SettingsPage from './pages/SettingsPage'
import LoadingScreen from './components/LoadingScreen'

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth()

    if (isLoading) {
        return <LoadingScreen />
    }

    if (!user) {
        return <Navigate to="/auth" replace />
    }

    return <>{children}</>
}

// Public route wrapper (redirects to chat if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth()

    if (isLoading) {
        return <LoadingScreen />
    }

    if (user) {
        return <Navigate to="/chat" replace />
    }

    return <>{children}</>
}

function App() {
    return (
        <AnimatePresence mode="wait">
            <Routes>
                <Route
                    path="/"
                    element={
                        <PublicRoute>
                            <LandingPage />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/auth"
                    element={
                        <PublicRoute>
                            <AuthPage />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/chat"
                    element={
                        <ProtectedRoute>
                            <ChatPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/chat/:conversationId"
                    element={
                        <ProtectedRoute>
                            <ChatPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            <SettingsPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AnimatePresence>
    )
}

export default App

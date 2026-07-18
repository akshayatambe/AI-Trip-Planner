import { useState } from 'react'
import Logo from './Logo.jsx'
import { startGoogleLogin, AuthAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function SignInModal({ open, onClose, title, subtitle }) {
    const { login } = useAuth()
    const [mode, setMode] = useState('login') // 'login' | 'signup'
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    if (!open) return null

    const resetFields = () => {
        setName('')
        setEmail('')
        setPassword('')
        setError('')
    }

    const switchMode = (nextMode) => {
        setMode(nextMode)
        resetFields()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)
        try {
            const result =
                mode === 'signup'
                    ? await AuthAPI.register(name, email, password)
                    : await AuthAPI.login(email, password)

            await login(result.token)
            onClose?.()
            resetFields()
        } catch (err) {
            setError(err?.response?.data?.message || 'Something went wrong. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-black/40 hover:text-black transition"
                    aria-label="Close"
                >
                    ✕
                </button>

                <Logo className="mb-6" />

                <h2 className="text-xl font-semibold mb-2">
                    {title || (mode === 'signup' ? 'Create your account' : 'Sign in to check out your travel plan')}
                </h2>
                <p className="text-black/50 text-sm mb-6">
                    {subtitle || 'Continue with email or use your Google account.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-3 mb-4">
                    {mode === 'signup' && (
                        <input
                            type="text"
                            placeholder="Full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                    />

                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-ink text-white rounded-xl py-3.5 font-medium hover:bg-black transition disabled:opacity-60"
                    >
                        {submitting ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
                    </button>
                </form>

                <p className="text-center text-sm text-black/50 mb-4">
                    {mode === 'signup' ? (
                        <>
                            Already have an account?{' '}
                            <button onClick={() => switchMode('login')} className="text-ink font-medium hover:underline">
                                Sign in
                            </button>
                        </>
                    ) : (
                        <>
                            Don't have an account?{' '}
                            <button onClick={() => switchMode('signup')} className="text-ink font-medium hover:underline">
                                Sign up
                            </button>
                        </>
                    )}
                </p>

                <div className="flex items-center gap-3 mb-4">
                    <div className="h-px bg-black/10 flex-1" />
                    <span className="text-xs text-black/40">OR</span>
                    <div className="h-px bg-black/10 flex-1" />
                </div>

                <button
                    onClick={startGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 border border-black/10 text-ink rounded-xl py-3.5 font-medium hover:bg-black/5 transition"
                >
                    <GoogleG />
                    Sign in with Google
                </button>
            </div>
        </div>
    )
}

function GoogleG() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.68-3.87 2.68-6.62z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.16.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
        </svg>
    )
}
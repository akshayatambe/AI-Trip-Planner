import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from './Logo.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar({ onSignInClick }) {
    const { user, isAuthenticated, logout } = useAuth()
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <header className="border-b border-black/5">
            <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link to="/">
                    <Logo withWordmark />
                </Link>

                {isAuthenticated ? (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/preferences')}
                            className="px-4 py-2 rounded-full border border-black/10 text-sm font-medium hover:bg-black/5 transition"
                        >
                            + Create Trip
                        </button>
                        <button
                            onClick={() => navigate('/trips')}
                            className="px-4 py-2 rounded-full border border-black/10 text-sm font-medium hover:bg-black/5 transition"
                        >
                            My Trips
                        </button>
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setMenuOpen((open) => !open)}
                                title={user?.email}
                                className="w-9 h-9 rounded-full bg-coral text-white flex items-center justify-center font-semibold text-sm"
                            >
                                {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-black/10 bg-white shadow-lg py-2 z-20">
                                    <button
                                        onClick={() => {
                                            setMenuOpen(false)
                                            navigate('/profile')
                                        }}
                                        className="w-full text-left px-4 py-2 border-b border-black/5 hover:bg-black/5 transition"
                                    >
                                        <p className="text-sm font-medium truncate">{user?.name || 'My Account'}</p>
                                        <p className="text-xs text-black/50 truncate">{user?.email}</p>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setMenuOpen(false)
                                            navigate('/profile')
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-black/5 transition"
                                    >
                                        View profile
                                    </button>
                                    <button
                                        onClick={() => {
                                            setMenuOpen(false)
                                            logout()
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-black/5 transition"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={onSignInClick}
                        className="px-5 py-2.5 rounded-full bg-ink text-white text-sm font-medium hover:bg-black transition"
                    >
                        Sign In
                    </button>
                )}
            </div>
        </header>
    )
}
import { Link, useNavigate } from 'react-router-dom'
import Logo from './Logo.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar({ onSignInClick }) {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

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
            <button
              onClick={logout}
              title={user?.email}
              className="w-9 h-9 rounded-full bg-coral text-white flex items-center justify-center font-semibold text-sm"
            >
              {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
            </button>
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

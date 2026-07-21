import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Loader from '../components/Loader.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { TripAPI, AuthAPI } from '../api/client'

const PROVIDER_LABEL = {
    GOOGLE: 'Google',
    LOCAL: 'Email & password',
}

function formatMemberSince(dateString) {
    if (!dateString) return null
    try {
        return new Date(dateString).toLocaleDateString(undefined, {
            month: 'long',
            year: 'numeric',
        })
    } catch {
        return null
    }
}

export default function Profile() {
    const { user, logout, setUser } = useAuth()
    const navigate = useNavigate()

    const [tripCount, setTripCount] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [name, setName] = useState(user?.name || '')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [saved, setSaved] = useState(false)
    const [confirmingSignOut, setConfirmingSignOut] = useState(false)

    useEffect(() => {
        TripAPI.list()
            .then((trips) => setTripCount(trips.length))
            .catch(() => setTripCount(0))
    }, [])

    useEffect(() => {
        setName(user?.name || '')
    }, [user])

    if (!user) return <Loader message="Loading your account..." />

    const initial = (user.name || user.email || '?').charAt(0).toUpperCase()
    const memberSince = formatMemberSince(user.createdAt)
    const providerLabel = PROVIDER_LABEL[user.authProvider] || user.authProvider

    const handleSave = async (e) => {
        e.preventDefault()
        setError('')

        const trimmed = name.trim()
        if (!trimmed) {
            setError('Name cannot be empty.')
            return
        }
        if (trimmed === user.name) {
            setIsEditing(false)
            return
        }

        try {
            setSaving(true)
            const updated = await AuthAPI.updateProfile(trimmed)
            setUser(updated)
            setIsEditing(false)
            setSaved(true)
            setTimeout(() => setSaved(false), 2500)
        } catch (err) {
            setError(err.response?.data?.message || 'Could not save your changes. Try again.')
        } finally {
            setSaving(false)
        }
    }

    const handleCancelEdit = () => {
        setName(user.name || '')
        setError('')
        setIsEditing(false)
    }

    return (
        <div>
            <Navbar />

            <main className="max-w-3xl mx-auto px-6 py-14">
                <h1 className="text-2xl font-bold mb-8">Account</h1>

                {/* Profile card */}
                <section className="rounded-2xl border border-black/10 p-8">
                    <div className="flex items-start gap-6">
                        {user.pictureUrl ? (
                            <img
                                src={user.pictureUrl}
                                alt={user.name}
                                className="w-20 h-20 rounded-full object-cover shrink-0"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-coral text-white flex items-center justify-center font-semibold text-2xl shrink-0">
                                {initial}
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            {!isEditing ? (
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-semibold truncate">{user.name || 'Unnamed traveler'}</h2>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-sm text-black/50 hover:text-ink underline underline-offset-2 transition shrink-0"
                                    >
                                        Edit
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSave} className="space-y-3">
                                    <input
                                        autoFocus
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        maxLength={100}
                                        className="w-full border border-black/15 rounded-lg px-3 py-2 text-lg font-semibold outline-none focus:border-ink transition"
                                    />
                                    {error && <p className="text-sm text-red-600">{error}</p>}
                                    <div className="flex gap-3">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="px-4 py-2 rounded-full bg-ink text-white text-sm font-medium hover:bg-black transition disabled:opacity-50"
                                        >
                                            {saving ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="px-4 py-2 rounded-full border border-black/10 text-sm font-medium hover:bg-black/5 transition"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}

                            {!isEditing && (
                                <>
                                    <p className="text-black/50 mt-1 truncate">{user.email}</p>
                                    {saved && <p className="text-sm text-green-600 mt-2">Name updated.</p>}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-black/5">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-black/40 mb-1">Signed in with</p>
                            <p className="font-medium">{providerLabel}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-black/40 mb-1">Member since</p>
                            <p className="font-medium">{memberSince || '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-black/40 mb-1">Trips planned</p>
                            <p className="font-medium">{tripCount === null ? '…' : tripCount}</p>
                        </div>
                    </div>
                </section>

                {/* Quick links */}
                <section className="mt-6 rounded-2xl border border-black/10 divide-y divide-black/5">
                    <button
                        onClick={() => navigate('/trips')}
                        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-black/5 transition"
                    >
                        <span className="font-medium">My Trips</span>
                        <span className="text-black/40">→</span>
                    </button>
                    <button
                        onClick={() => navigate('/preferences')}
                        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-black/5 transition"
                    >
                        <span className="font-medium">Plan a new trip</span>
                        <span className="text-black/40">→</span>
                    </button>
                </section>

                {/* Danger zone */}
                <section className="mt-6 rounded-2xl border border-red-100 bg-red-50/40 p-6">
                    <h3 className="font-semibold text-red-900">Sign out</h3>
                    <p className="text-sm text-red-900/60 mt-1 mb-4">
                        You'll need to sign in again to access your trips.
                    </p>
                    {!confirmingSignOut ? (
                        <button
                            onClick={() => setConfirmingSignOut(true)}
                            className="px-5 py-2.5 rounded-full border border-red-200 text-red-600 text-sm font-medium hover:bg-red-100 transition"
                        >
                            Sign out
                        </button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-red-900/70">Are you sure?</span>
                            <button
                                onClick={logout}
                                className="px-4 py-2 rounded-full bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
                            >
                                Yes, sign out
                            </button>
                            <button
                                onClick={() => setConfirmingSignOut(false)}
                                className="px-4 py-2 rounded-full border border-black/10 text-sm font-medium hover:bg-black/5 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}
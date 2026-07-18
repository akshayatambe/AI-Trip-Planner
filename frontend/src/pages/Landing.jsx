import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import SignInModal from '../components/SignInModal.jsx'

export default function Landing() {
  const [showSignIn, setShowSignIn] = useState(false)
  const navigate = useNavigate()

  return (
    <div>
      <Navbar onSignInClick={() => setShowSignIn(true)} />

      <main className="max-w-5xl mx-auto px-6 pt-20 pb-28 text-center">
        <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight">
          <span className="text-coral">Discover your next adventure</span> with an AI
          <br className="hidden md:block" /> co-pilot for personalized itineraries
        </h1>

        <p className="mt-6 text-black/50 text-lg max-w-2xl mx-auto">
          Your personal trip planner and travel curator — custom day-by-day itineraries
          tailored to your interests, timeline, and budget.
        </p>

        <button
          onClick={() => navigate('/preferences')}
          className="mt-8 px-6 py-3 rounded-full bg-ink text-white font-medium hover:bg-black transition"
        >
          Get started, it's free
        </button>

        <div className="mt-24">
          <h2 className="font-display text-3xl font-semibold">AI Travel Planner</h2>
          <div className="w-16 h-px bg-black/20 mx-auto my-4" />
          <p className="text-black/50">Powered by Gemini AI</p>
        </div>

        <div className="mt-10 rounded-2xl border border-black/10 bg-coral-50/40 p-3 md:p-6">
          <div className="rounded-xl bg-white border border-black/5 shadow-sm overflow-hidden text-left">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-black/5">
              <span className="w-2.5 h-2.5 rounded-full bg-black/10" />
              <span className="w-2.5 h-2.5 rounded-full bg-black/10" />
              <span className="w-2.5 h-2.5 rounded-full bg-black/10" />
            </div>
            <img
              src="https://picsum.photos/seed/dubai-skyline/1200/420"
              alt="Sample destination"
              className="w-full h-48 md:h-72 object-cover"
            />
            <div className="p-5">
              <div className="font-semibold">Dubai · United Arab Emirates</div>
              <div className="text-xs text-black/40 mt-1">5 Day · Luxury budget · 3–5 people</div>
            </div>
          </div>
        </div>
      </main>

      <SignInModal open={showSignIn} onClose={() => setShowSignIn(false)} />
    </div>
  )
}

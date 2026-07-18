import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import SignInModal from '../components/SignInModal.jsx'
import OptionCard from '../components/OptionCard.jsx'
import Loader from '../components/Loader.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { TripAPI } from '../api/client'

const BUDGETS = [
  { value: 'CHEAP', emoji: '💵', title: 'Cheap', subtitle: 'Stay conscious of costs' },
  { value: 'MODERATE', emoji: '💰', title: 'Moderate', subtitle: 'Keep cost on the average side' },
  { value: 'LUXURY', emoji: '💎', title: 'Luxury', subtitle: "Don't worry about cost" },
]

const COMPANIONS = [
  { value: 'JUST_ME', emoji: '🧍', title: 'Just Me', subtitle: 'A sole traveler in exploration' },
  { value: 'A_COUPLE', emoji: '🥂', title: 'A Couple', subtitle: 'Two travelers in tandem' },
  { value: 'FAMILY', emoji: '🏡', title: 'Family', subtitle: 'A group of fun-loving adventurers' },
  { value: 'FRIENDS', emoji: '⛵', title: 'Friends', subtitle: 'A bunch of thrill-seekers' },
]

const PENDING_KEY = 'pendingTripRequest'

export default function Preferences() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [destination, setDestination] = useState('')
  const [days, setDays] = useState('')
  const [budget, setBudget] = useState('MODERATE')
  const [travelWith, setTravelWith] = useState('JUST_ME')
  const [showSignIn, setShowSignIn] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const buildPayload = () => ({
    destination: destination.trim(),
    days: Number(days),
    budget,
    travelWith,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!destination.trim() || !days || Number(days) < 1) {
      setError('Please enter a destination and a valid number of days.')
      return
    }

    const payload = buildPayload()

    if (!isAuthenticated) {
      sessionStorage.setItem(PENDING_KEY, JSON.stringify(payload))
      setShowSignIn(true)
      return
    }

    try {
      setSubmitting(true)
      const trip = await TripAPI.generate(payload)
      navigate(`/trips/${trip.id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong generating your trip.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitting) {
    return (
      <div>
        <Navbar onSignInClick={() => setShowSignIn(true)} />
        <Loader message={`Planning your trip to ${destination}...`} />
      </div>
    )
  }

  return (
    <div>
      <Navbar onSignInClick={() => setShowSignIn(true)} />

      <main className="max-w-4xl mx-auto px-6 py-14">
        <h1 className="text-3xl font-bold">Tell us your travel preferences 🏕️🌴</h1>
        <p className="text-black/50 mt-3">
          Just provide some basic information, and our trip planner will generate a
          customized itinerary based on your preferences.
        </p>

        <form onSubmit={handleSubmit} className="mt-12 space-y-10">
          <div>
            <label className="font-medium block mb-3">What is your destination of choice?</label>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Chicago, IL, USA"
              className="w-full border border-black/15 rounded-lg px-4 py-3 outline-none focus:border-ink transition"
            />
          </div>

          <div>
            <label className="font-medium block mb-3">How many days are you planning your trip?</label>
            <input
              type="number"
              min={1}
              max={14}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="Ex. 4"
              className="w-full border border-black/15 rounded-lg px-4 py-3 outline-none focus:border-ink transition"
            />
          </div>

          <div>
            <label className="font-medium block mb-3">What is your budget?</label>
            <div className="grid sm:grid-cols-3 gap-4">
              {BUDGETS.map((b) => (
                <OptionCard
                  key={b.value}
                  emoji={b.emoji}
                  title={b.title}
                  subtitle={b.subtitle}
                  selected={budget === b.value}
                  onClick={() => setBudget(b.value)}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="font-medium block mb-3">
              Who do you plan on traveling with on your next adventure?
            </label>
            <div className="grid sm:grid-cols-3 gap-4">
              {COMPANIONS.map((c) => (
                <OptionCard
                  key={c.value}
                  emoji={c.emoji}
                  title={c.title}
                  subtitle={c.subtitle}
                  selected={travelWith === c.value}
                  onClick={() => setTravelWith(c.value)}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-ink text-white font-medium hover:bg-black transition"
            >
              Generate Trip
            </button>
          </div>
        </form>
      </main>

      <SignInModal open={showSignIn} onClose={() => setShowSignIn(false)} />
    </div>
  )
}

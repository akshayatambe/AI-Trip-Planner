import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import HotelCard from '../components/HotelCard.jsx'
import DaySection from '../components/DaySection.jsx'
import Loader from '../components/Loader.jsx'
import SignInModal from '../components/SignInModal.jsx'
import { TripAPI } from '../api/client'

const BUDGET_LABEL = { CHEAP: 'Cheap Budget', MODERATE: 'Moderate Budget', LUXURY: 'Luxury Budget' }
const COMPANION_LABEL = {
  JUST_ME: '1 Traveler',
  A_COUPLE: '2 Travelers',
  FAMILY: '3 to 5 People',
  FRIENDS: '3 to 6 People',
}

export default function TripDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [error, setError] = useState('')
  const [showSignIn, setShowSignIn] = useState(false)

  useEffect(() => {
    let cancelled = false
    TripAPI.get(id)
        .then((data) => {
          if (!cancelled) setTrip(data)
        })
        .catch((err) => {
          if (!cancelled) setError(err.response?.data?.message || 'Could not load this trip.')
        })
    return () => {
      cancelled = true
    }
  }, [id])

  if (error) {
    return (
        <div>
          <Navbar onSignInClick={() => setShowSignIn(true)} />
          <div className="max-w-3xl mx-auto px-6 py-24 text-center">
            <p className="text-black/60">{error}</p>
            <button onClick={() => navigate('/trips')} className="mt-6 text-coral font-medium">
              Back to My Trips
            </button>
          </div>
          <SignInModal open={showSignIn} onClose={() => setShowSignIn(false)} />
        </div>
    )
  }

  if (!trip) {
    return (
        <div>
          <Navbar onSignInClick={() => setShowSignIn(true)} />
          <Loader message="Loading your itinerary..." />
        </div>
    )
  }

  return (
      <div>
        <Navbar onSignInClick={() => setShowSignIn(true)} />

        <main className="max-w-5xl mx-auto px-6 py-10">
          <img
              src={trip.heroImageUrl}
              alt={trip.destination}
              className="w-full h-64 md:h-96 object-cover rounded-2xl"
          />

          <h1 className="text-2xl font-bold mt-6">{trip.destination}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <Tag>🗓️ {trip.days} Day{trip.days > 1 ? 's' : ''}</Tag>
            <Tag>💰 {BUDGET_LABEL[trip.budget]}</Tag>
            <Tag>👥 {COMPANION_LABEL[trip.travelWith]}</Tag>
          </div>

          {trip.budgetSummary && <BudgetCard summary={trip.budgetSummary} />}

          <h2 className="text-lg font-semibold mt-12 mb-4">Hotel Recommendation</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {trip.hotels.map((hotel, i) => (
                <HotelCard key={i} hotel={hotel} />
            ))}
          </div>

          <h2 className="text-lg font-semibold mt-12 mb-6">Places to Visit</h2>
          {trip.itinerary.map((day) => (
              <DaySection key={day.dayNumber} day={day} />
          ))}

          <p className="text-center text-xs text-black/30 mt-16">AI Travel Planner</p>
        </main>

        <SignInModal open={showSignIn} onClose={() => setShowSignIn(false)} />
      </div>
  )
}

function BudgetCard({ summary }) {
    const format = (n) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  return (
      <div className="mt-8 bg-black/5 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Estimated Budget</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <BudgetStat label="Hotel (per night)" value={format(summary.estimatedHotelCostPerNight)} />
          <BudgetStat label="Hotel total" value={format(summary.estimatedHotelTotal)} />
          <BudgetStat label="Activities" value={format(summary.estimatedActivitiesCost)} />
        </div>
        <div className="mt-5 pt-5 border-t border-black/10 flex items-baseline justify-between">
          <span className="text-sm text-black/60">Estimated trip total</span>
          <span className="text-2xl font-bold">{format(summary.estimatedGrandTotal)}</span>
        </div>
        <p className="text-xs text-black/40 mt-3">{summary.note}</p>
      </div>
  )
}

function BudgetStat({ label, value }) {
  return (
      <div>
        <p className="text-xs text-black/50 mb-1">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
  )
}

function Tag({ children }) {
  return (
      <span className="text-xs bg-black/5 rounded-full px-3 py-1.5 text-black/60">{children}</span>
  )
}
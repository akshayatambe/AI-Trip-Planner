import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import TripCard from '../components/TripCard.jsx'
import Loader from '../components/Loader.jsx'
import { TripAPI } from '../api/client'

export default function MyTrips() {
  const [trips, setTrips] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    TripAPI.list().then(setTrips).catch(() => setTrips([]))
  }, [])

  return (
    <div>
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-8">My Trips</h1>

        {trips === null && <Loader message="Loading your trips..." />}

        {trips?.length === 0 && (
          <div className="text-center py-24">
            <p className="text-black/50 mb-4">You haven't planned any trips yet.</p>
            <button
              onClick={() => navigate('/preferences')}
              className="px-6 py-3 rounded-full bg-ink text-white font-medium hover:bg-black transition"
            >
              Plan your first trip
            </button>
          </div>
        )}

        {trips && trips.length > 0 && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

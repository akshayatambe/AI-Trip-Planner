import { useNavigate } from 'react-router-dom'

const BUDGET_LABEL = { CHEAP: 'Cheap', MODERATE: 'Moderate', LUXURY: 'Luxury' }

export default function TripCard({ trip }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/trips/${trip.id}`)}
      className="text-left group"
    >
      <div className="rounded-2xl overflow-hidden aspect-[4/3] mb-3">
        <img
          src={trip.heroImageUrl}
          alt={trip.destination}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
      </div>
      <div className="font-semibold">{trip.destination}</div>
      <div className="text-sm text-black/50">
        {trip.days} Day{trip.days > 1 ? 's' : ''} trip with {BUDGET_LABEL[trip.budget]} budget.
      </div>
    </button>
  )
}

import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Loader from '../components/Loader.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { TripAPI } from '../api/client'

const PENDING_KEY = 'pendingTripRequest'

export default function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [message, setMessage] = useState('Signing you in...')
  const ranOnce = useRef(false)

  useEffect(() => {
    if (ranOnce.current) return
    ranOnce.current = true

    const token = searchParams.get('token')

    async function run() {
      if (!token) {
        navigate('/')
        return
      }

      await login(token)

      const pendingRaw = sessionStorage.getItem(PENDING_KEY)
      if (pendingRaw) {
        sessionStorage.removeItem(PENDING_KEY)
        try {
          const payload = JSON.parse(pendingRaw)
          setMessage(`Planning your trip to ${payload.destination}...`)
          const trip = await TripAPI.generate(payload)
          navigate(`/trips/${trip.id}`)
          return
        } catch {
          // fall through to My Trips if generation failed
        }
      }

      navigate('/trips')
    }

    run()
  }, [searchParams, login, navigate])

  return <Loader message={message} />
}

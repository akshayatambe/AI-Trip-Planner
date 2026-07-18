import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Loader from './Loader.jsx'

export default function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <Loader message="Loading..." />
  if (!isAuthenticated) return <Navigate to="/" replace />

  return children
}

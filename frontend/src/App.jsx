import { Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Preferences from './pages/Preferences.jsx'
import TripDetail from './pages/TripDetail.jsx'
import MyTrips from './pages/MyTrips.jsx'
import OAuthCallback from './pages/OAuthCallback.jsx'
import RequireAuth from './components/RequireAuth.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/preferences" element={<Preferences />} />
      <Route path="/oauth-callback" element={<OAuthCallback />} />
      <Route
        path="/trips"
        element={
          <RequireAuth>
            <MyTrips />
          </RequireAuth>
        }
      />
      <Route
        path="/trips/:id"
        element={
          <RequireAuth>
            <TripDetail />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Landing />} />
    </Routes>
  )
}

import { Navigate, Outlet, useLocation } from 'react-router'
import { FullScreenSpinner } from '../../components/ui/FullScreenSpinner.tsx'
import { useRealtimeSync } from '../../lib/realtime.ts'
import { useThemeSync } from '../profile/hooks.ts'
import { useSession } from './sessionContext.ts'

export function ProtectedRoute() {
  const { session, loading, recovering } = useSession()
  const location = useLocation()
  useRealtimeSync(session?.user.id)
  useThemeSync()

  if (loading) return <FullScreenSpinner />
  if (recovering) return <Navigate to="/reset-password" replace />
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

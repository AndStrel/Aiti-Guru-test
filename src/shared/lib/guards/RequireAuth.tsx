import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../../features/auth/model/useAuthStore'
import { ROUTES } from '../../config/routes'

export function RequireAuth() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

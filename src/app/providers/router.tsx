import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../../pages/login/ui/LoginPage'
import { ProductsPage } from '../../pages/products/ui/ProductsPage'
import { useAuthStore } from '../../features/auth/model/useAuthStore'
import { ROUTES } from '../../shared/config/routes'
import { RequireAuth } from '../../shared/lib/guards/RequireAuth'

function RootRedirect() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <Navigate to={isAuthenticated ? ROUTES.PRODUCTS : ROUTES.LOGIN} replace />
  )
}

export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path={ROUTES.ROOT} element={<RootRedirect />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
        </Route>
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </HashRouter>
  )
}

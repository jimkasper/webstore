import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { Layout } from '../components/Layout'
import { Login } from '../pages/Login'
import { Register } from '../pages/Register'
import { Dashboard } from '../pages/Dashboard'
import { Profile } from '../pages/Profile'
import { Connections } from '../pages/Connections'
import { Transfers } from '../pages/Transfers'
import { Federation } from '../pages/Federation'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuth()
  if (!accessToken) return <Navigate to="/login" replace />
  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <RequireAuth><Dashboard /></RequireAuth> },
      { path: 'profile', element: <RequireAuth><Profile /></RequireAuth> },
      { path: 'connections', element: <RequireAuth><Connections /></RequireAuth> },
      { path: 'transfers', element: <RequireAuth><Transfers /></RequireAuth> },
      { path: 'federation', element: <RequireAuth><Federation /></RequireAuth> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
    ],
  },
])

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/hooks/useAuth.jsx'
import Layout   from '@/components/layout/Layout'
import Login    from '@/pages/Login'
import Dashboard  from '@/pages/Dashboard'
import Analyses   from '@/pages/Analyses'
import Nutrition  from '@/pages/Nutrition'
import Sleep      from '@/pages/Sleep'
import Exercise   from '@/pages/Exercise'
import Profile    from '@/pages/Profile'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  const { user, loading } = useAuth()

  // Redirecionar /login para / se já autenticado
  if (!loading && user) {
    return (
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route element={<Layout />}>
          <Route index             element={<Dashboard />} />
          <Route path="analyses"   element={<Analyses />} />
          <Route path="nutrition"  element={<Nutrition />} />
          <Route path="sleep"      element={<Sleep />} />
          <Route path="exercise"   element={<Exercise />} />
          <Route path="profile"    element={<Profile />} />
        </Route>
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={
        <ProtectedRoute>
          <Route element={<Layout />}>
            <Route index            element={<Dashboard />} />
            <Route path="analyses"  element={<Analyses />} />
            <Route path="nutrition" element={<Nutrition />} />
            <Route path="sleep"     element={<Sleep />} />
            <Route path="exercise"  element={<Exercise />} />
            <Route path="profile"   element={<Profile />} />
          </Route>
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index            element={<Dashboard />} />
            <Route path="analyses"  element={<Analyses />} />
            <Route path="nutrition" element={<Nutrition />} />
            <Route path="sleep"     element={<Sleep />} />
            <Route path="exercise"  element={<Exercise />} />
            <Route path="profile"   element={<Profile />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

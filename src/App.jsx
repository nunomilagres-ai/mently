import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Dashboard from '@/pages/Dashboard'
import Analyses from '@/pages/Analyses'
import Nutrition from '@/pages/Nutrition'
import Sleep from '@/pages/Sleep'
import Exercise from '@/pages/Exercise'
import Profile from '@/pages/Profile'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index            element={<Dashboard />} />
          <Route path="analyses"  element={<Analyses />} />
          <Route path="nutrition" element={<Nutrition />} />
          <Route path="sleep"     element={<Sleep />} />
          <Route path="exercise"  element={<Exercise />} />
          <Route path="profile"   element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

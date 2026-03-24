import { useState, useEffect, createContext, useContext } from 'react'
import { getCurrentUser, logout as doLogout } from '@/store'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(undefined) // undefined = ainda a carregar
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUser().then(u => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  async function logout() {
    await doLogout()
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

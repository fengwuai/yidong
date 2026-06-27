import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  isAuthenticated: boolean
  username: string
  login: (username: string, password: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      username: '',
      login: (username, password) => {
        if (username.trim() && password.trim()) {
          set({ isAuthenticated: true, username: username.trim() })
          return true
        }
        return false
      },
      logout: () => set({ isAuthenticated: false, username: '' }),
    }),
    { name: 'weather-auth' },
  ),
)

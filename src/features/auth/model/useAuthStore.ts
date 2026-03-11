import { create } from 'zustand'
import { loginRequest } from '../api/authApi'
import { clearAuthSession, loadAuthSession, saveAuthSession } from '../lib/authStorage'
import type { AuthUser, LoginRequest } from './auth.types'

const DEFAULT_AUTH_ERROR = 'Не удалось выполнить вход'

export interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  hydrateAuth: () => void
  login: (credentials: LoginRequest, remember: boolean) => Promise<void>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  hydrateAuth: () => {
    const session = loadAuthSession()

    if (!session) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      })
      return
    }

    set({
      user: session.user,
      token: session.token,
      isAuthenticated: true,
      error: null,
    })
  },
  login: async (credentials, remember) => {
    set({
      isLoading: true,
      error: null,
    })

    try {
      const session = await loginRequest(credentials)

      saveAuthSession(session, remember)
      set({
        user: session.user,
        token: session.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      clearAuthSession()

      const authError = error instanceof Error ? error : new Error(DEFAULT_AUTH_ERROR)

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: authError.message,
      })

      throw authError
    }
  },
  logout: () => {
    clearAuthSession()
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  },
  clearError: () => {
    set({ error: null })
  },
}))

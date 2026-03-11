import { create } from 'zustand'
import { loginRequest, registerRequest } from '../api/authApi'
import {
  clearAuthSession,
  loadAuthSession,
  loadRegisteredCredentials,
  saveAuthSession,
  saveRegisteredCredentials,
} from '../lib/authStorage'
import type { AuthSession, AuthUser, LoginRequest, RegisterRequest, RegisteredCredentials } from './auth.types'

const DEFAULT_AUTH_ERROR = 'Не удалось выполнить вход'
const DEFAULT_REGISTER_ERROR = 'Не удалось зарегистрироваться'
const LOCAL_AUTH_ERROR = 'Неверный логин или пароль для зарегистрированного аккаунта'

function buildLocalSession(registered: RegisteredCredentials): AuthSession {
  return {
    user: registered.user,
    token: `registered-${registered.user.id}-${Date.now()}`,
  }
}

export interface AuthState {
  user: AuthUser | null
  token: string | null
  registeredCredentials: RegisteredCredentials | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  hydrateAuth: () => void
  login: (credentials: LoginRequest, remember: boolean) => Promise<void>
  register: (credentials: RegisterRequest, remember: boolean) => Promise<void>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  registeredCredentials: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  hydrateAuth: () => {
    const session = loadAuthSession()
    const registeredCredentials = loadRegisteredCredentials()

    set({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session),
      registeredCredentials,
      error: null,
    })
  },
  login: async (credentials, remember) => {
    const normalizedUsername = credentials.username.trim()
    const existingRegisteredCredentials = get().registeredCredentials

    set({
      isLoading: true,
      error: null,
    })

    if (existingRegisteredCredentials && normalizedUsername === existingRegisteredCredentials.username) {
      if (credentials.password !== existingRegisteredCredentials.password) {
        clearAuthSession()

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: LOCAL_AUTH_ERROR,
          registeredCredentials: existingRegisteredCredentials,
        })

        throw new Error(LOCAL_AUTH_ERROR)
      }

      const localSession = buildLocalSession(existingRegisteredCredentials)
      saveAuthSession(localSession, remember)

      set({
        user: localSession.user,
        token: localSession.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        registeredCredentials: existingRegisteredCredentials,
      })

      return
    }

    try {
      const session = await loginRequest({
        username: normalizedUsername,
        password: credentials.password,
      })

      saveAuthSession(session, remember)
      set({
        user: session.user,
        token: session.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        registeredCredentials: existingRegisteredCredentials,
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
        registeredCredentials: existingRegisteredCredentials,
      })

      throw authError
    }
  },
  register: async (credentials, remember) => {
    const normalizedUsername = credentials.username.trim()
    const existingRegisteredCredentials = get().registeredCredentials

    set({
      isLoading: true,
      error: null,
    })

    try {
      const session = await registerRequest({
        username: normalizedUsername,
        password: credentials.password,
      })
      const registeredCredentials: RegisteredCredentials = {
        username: normalizedUsername,
        password: credentials.password,
        user: session.user,
      }

      saveRegisteredCredentials(registeredCredentials)
      saveAuthSession(session, remember)
      set({
        user: session.user,
        token: session.token,
        registeredCredentials,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      clearAuthSession()

      const registerError = error instanceof Error ? error : new Error(DEFAULT_REGISTER_ERROR)

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: registerError.message,
        registeredCredentials: existingRegisteredCredentials,
      })

      throw registerError
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
      registeredCredentials: get().registeredCredentials,
    })
  },
  clearError: () => {
    set({ error: null })
  },
}))

import { create } from 'zustand'
import { loginRequest, registerRequest } from '../api/authApi'
import {
  clearAuthSession,
  loadAuthSession,
  loadRegisteredCredentials,
  saveAuthSession,
  saveRegisteredCredentials,
} from '../lib/authStorage'
import type { AuthSession, AuthUser, LoginRequest, RegisterRequest, RegisteredCredentials } from '../../../types'

const DEFAULT_AUTH_ERROR = 'Не удалось выполнить вход'
const DEFAULT_REGISTER_ERROR = 'Не удалось зарегистрироваться'
const LOCAL_AUTH_ERROR = 'Неверный логин или пароль для зарегистрированного аккаунта'

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

type SetAuthState = (state: Partial<AuthState>) => void

function buildLocalSession(registeredCredentials: RegisteredCredentials): AuthSession {
  return {
    user: registeredCredentials.user,
    token: `registered-${registeredCredentials.user.id}-${Date.now()}`,
  }
}

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  return error instanceof Error ? error.message : fallbackMessage
}

function setAuthorizedState(
  setState: SetAuthState,
  session: AuthSession,
  registeredCredentials: RegisteredCredentials | null,
): void {
  setState({
    user: session.user,
    token: session.token,
    registeredCredentials,
    isAuthenticated: true,
    isLoading: false,
    error: null,
  })
}

function setUnauthorizedState(
  setState: SetAuthState,
  registeredCredentials: RegisteredCredentials | null,
  error: string | null = null,
): void {
  setState({
    user: null,
    token: null,
    registeredCredentials,
    isAuthenticated: false,
    isLoading: false,
    error,
  })
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

    if (session) {
      setAuthorizedState(set, session, registeredCredentials)
      return
    }

    setUnauthorizedState(set, registeredCredentials)
  },
  login: async (credentials, remember) => {
    const registeredCredentials = get().registeredCredentials
    const username = credentials.username.trim()

    set({ isLoading: true, error: null })

    if (registeredCredentials && username === registeredCredentials.username) {
      if (credentials.password !== registeredCredentials.password) {
        clearAuthSession()
        setUnauthorizedState(set, registeredCredentials, LOCAL_AUTH_ERROR)
        throw new Error(LOCAL_AUTH_ERROR)
      }

      const session = buildLocalSession(registeredCredentials)
      saveAuthSession(session, remember)
      setAuthorizedState(set, session, registeredCredentials)
      return
    }

    try {
      const session = await loginRequest({
        username,
        password: credentials.password,
      })

      saveAuthSession(session, remember)
      setAuthorizedState(set, session, registeredCredentials)
    } catch (error) {
      clearAuthSession()
      const errorMessage = getErrorMessage(error, DEFAULT_AUTH_ERROR)
      setUnauthorizedState(set, registeredCredentials, errorMessage)
      throw new Error(errorMessage)
    }
  },
  register: async (credentials, remember) => {
    const username = credentials.username.trim()
    const currentRegisteredCredentials = get().registeredCredentials

    set({ isLoading: true, error: null })

    try {
      const session = await registerRequest({
        username,
        password: credentials.password,
      })

      const registeredCredentials: RegisteredCredentials = {
        username,
        password: credentials.password,
        user: session.user,
      }

      saveRegisteredCredentials(registeredCredentials)
      saveAuthSession(session, remember)
      setAuthorizedState(set, session, registeredCredentials)
    } catch (error) {
      clearAuthSession()
      const errorMessage = getErrorMessage(error, DEFAULT_REGISTER_ERROR)
      setUnauthorizedState(set, currentRegisteredCredentials, errorMessage)
      throw new Error(errorMessage)
    }
  },
  logout: () => {
    clearAuthSession()
    setUnauthorizedState(set, get().registeredCredentials)
  },
  clearError: () => {
    set({ error: null })
  },
}))

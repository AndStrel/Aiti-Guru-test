import type { AuthSession, RegisteredCredentials } from '../model/auth.types'

const AUTH_STORAGE_KEY = 'auth-session'
const REGISTERED_CREDENTIALS_STORAGE_KEY = 'registered-credentials'

function parseStorageValue<T>(rawValue: string | null): T | null {
  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as T
  } catch {
    return null
  }
}

export function saveAuthSession(session: AuthSession, remember: boolean): void {
  const serializedSession = JSON.stringify(session)

  if (remember) {
    localStorage.setItem(AUTH_STORAGE_KEY, serializedSession)
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
    return
  }

  sessionStorage.setItem(AUTH_STORAGE_KEY, serializedSession)
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export function loadAuthSession(): AuthSession | null {
  const localSession = parseStorageValue<AuthSession>(localStorage.getItem(AUTH_STORAGE_KEY))
  if (localSession) {
    return localSession
  }

  return parseStorageValue<AuthSession>(sessionStorage.getItem(AUTH_STORAGE_KEY))
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY)
  sessionStorage.removeItem(AUTH_STORAGE_KEY)
}

export function saveRegisteredCredentials(credentials: RegisteredCredentials): void {
  localStorage.setItem(REGISTERED_CREDENTIALS_STORAGE_KEY, JSON.stringify(credentials))
}

export function loadRegisteredCredentials(): RegisteredCredentials | null {
  return parseStorageValue<RegisteredCredentials>(localStorage.getItem(REGISTERED_CREDENTIALS_STORAGE_KEY))
}

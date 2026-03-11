import type { AuthSession } from '../model/auth.types'

const AUTH_STORAGE_KEY = 'auth-session'

type MaybeSession = Partial<AuthSession>

function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object') {
    return false
  }

  const session = value as MaybeSession
  const user = session.user

  if (!user || typeof user !== 'object') {
    return false
  }

  return (
    typeof session.token === 'string' &&
    typeof user.id === 'number' &&
    typeof user.username === 'string'
  )
}

function parseSession(rawValue: string | null): AuthSession | null {
  if (!rawValue) {
    return null
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown
    return isAuthSession(parsed) ? parsed : null
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
  const localSession = parseSession(localStorage.getItem(AUTH_STORAGE_KEY))
  if (localSession) {
    return localSession
  }

  return parseSession(sessionStorage.getItem(AUTH_STORAGE_KEY))
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY)
  sessionStorage.removeItem(AUTH_STORAGE_KEY)
}

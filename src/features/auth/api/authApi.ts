import type { AuthSession, AuthUser, LoginRequest, LoginResponse } from '../model/auth.types'

const AUTH_LOGIN_URL = 'https://dummyjson.com/auth/login'
const DEFAULT_AUTH_ERROR = 'Не удалось выполнить вход'

interface ApiErrorPayload {
  message?: string
}

function extractErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const maybeError = payload as ApiErrorPayload
  return typeof maybeError.message === 'string' ? maybeError.message : null
}

function extractToken(payload: LoginResponse): string | null {
  if (typeof payload.accessToken === 'string' && payload.accessToken.length > 0) {
    return payload.accessToken
  }

  if (typeof payload.token === 'string' && payload.token.length > 0) {
    return payload.token
  }

  return null
}

function mapUser(payload: LoginResponse): AuthUser {
  if (typeof payload.id !== 'number' || typeof payload.username !== 'string') {
    throw new Error('Некорректный ответ сервера авторизации')
  }

  return {
    id: payload.id,
    username: payload.username,
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    image: payload.image,
  }
}

export async function loginRequest(credentials: LoginRequest): Promise<AuthSession> {
  const response = await fetch(AUTH_LOGIN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  const payload = (await response.json()) as unknown

  if (!response.ok) {
    throw new Error(extractErrorMessage(payload) ?? DEFAULT_AUTH_ERROR)
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error(DEFAULT_AUTH_ERROR)
  }

  const loginResponse = payload as LoginResponse
  const token = extractToken(loginResponse)

  if (!token) {
    throw new Error('Токен авторизации не получен')
  }

  return {
    token,
    user: mapUser(loginResponse),
  }
}

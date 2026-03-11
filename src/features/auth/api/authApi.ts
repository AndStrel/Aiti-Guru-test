import type { AuthSession, AuthUser, LoginRequest, LoginResponse, RegisterRequest } from '../../../types'

const AUTH_LOGIN_URL = 'https://dummyjson.com/auth/login'
const AUTH_REGISTER_URL = 'https://dummyjson.com/users/add'
const DEFAULT_AUTH_ERROR = 'Не удалось выполнить вход'
const DEFAULT_REGISTER_ERROR = 'Не удалось зарегистрироваться'

interface ApiErrorPayload {
  message?: string
}

async function sendAuthRequest(
  url: string,
  credentials: LoginRequest | RegisterRequest,
  defaultErrorMessage: string,
): Promise<LoginResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  const payload = (await response.json()) as unknown

  if (!response.ok) {
    throw new Error(extractErrorMessage(payload) ?? defaultErrorMessage)
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error(defaultErrorMessage)
  }

  return payload as LoginResponse
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
  const loginResponse = await sendAuthRequest(AUTH_LOGIN_URL, credentials, DEFAULT_AUTH_ERROR)
  const token = extractToken(loginResponse)

  if (!token) {
    throw new Error('Токен авторизации не получен')
  }

  return {
    token,
    user: mapUser(loginResponse),
  }
}

export async function registerRequest(credentials: RegisterRequest): Promise<AuthSession> {
  const registeredUser = mapUser(await sendAuthRequest(AUTH_REGISTER_URL, credentials, DEFAULT_REGISTER_ERROR))
  const localToken = `registered-${registeredUser.id}-${Date.now()}`

  return {
    token: localToken,
    user: registeredUser,
  }
}

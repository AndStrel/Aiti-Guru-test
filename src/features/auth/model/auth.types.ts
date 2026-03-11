export interface AuthUser {
  id: number
  username: string
  email?: string
  firstName?: string
  lastName?: string
  image?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse extends AuthUser {
  token?: string
  accessToken?: string
  refreshToken?: string
}

export interface AuthSession {
  user: AuthUser
  token: string
}

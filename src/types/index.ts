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

export interface RegisterRequest {
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

export interface RegisteredCredentials {
    username: string
    password: string
    user: AuthUser
}

export interface Product {
    id: number
    title: string
    brand?: string
    sku?: string
    category?: string
    thumbnail?: string
    rating: number
    price: number
    stock: number
}

export interface ProductsResponse {
    products: Product[]
    total: number
    skip: number
    limit: number
}

// Auth types
export interface AuthResponse {
  token: string // Access token
  refreshToken?: string // Refresh token (опционально, если сервер отправляет в теле)
  tokenType: 'Bearer'
  expiresIn: number
  issuedAt: string
  expiresAt: string
}

export interface LoginRequest {
  userName: string
  password: string
  deviceId?: string
}

export interface RegisterRequest {
  userName: string
  password: string
  name?: string
}

export interface UserProfile {
  id: string
  userName: string
  name?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateUserRequest {
  name?: string
}




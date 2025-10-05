// Auth types
export interface AuthResponse {
  token?: string | null // Access token
  tokenType?: string | null
  expiresIn?: number
  issuedAt?: string | null
  expiresAt?: string | null
  refreshToken?: string | null // Refresh token
}

export interface LoginRequest {
  userName?: string | null
  password?: string | null
}

export interface RegisterRequest {
  userName?: string | null
  password?: string | null
  name?: string | null
}

export interface UserProfileResponse {
  publicId?: string | null
  userName?: string | null
  name?: string | null
  isActive?: boolean
  createdAt?: string | null
  updatedAt?: string | null
}

// Legacy alias for backward compatibility
export type UserProfile = UserProfileResponse

export interface UpdateUserRequest {
  name?: string | null
}




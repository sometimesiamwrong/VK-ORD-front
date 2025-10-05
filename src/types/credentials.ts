// Credentials types
export interface ApiCredentialResponse {
  id?: string | null
  publicId?: string | null
  environment?: string | null
  displayName?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface CreateApiCredentialRequest {
  environment?: string | null
  tokenPlain?: string | null
  displayName?: string | null
}

export interface UpdateApiCredentialRequest {
  environment?: string | null
  tokenPlain?: string | null
  displayName?: string | null
}

// Legacy aliases for backward compatibility
export type Credential = ApiCredentialResponse
export type CreateCredentialRequest = CreateApiCredentialRequest
export type UpdateCredentialRequest = UpdateApiCredentialRequest




// Credentials types
export type Environment = 'Sandbox' | 'Production'

export interface Credential {
  id: string
  environment: Environment
  displayName?: string
  createdAt: string
  updatedAt: string
}

export interface CreateCredentialRequest {
  environment: Environment
  tokenPlain: string
  displayName?: string
}

export interface UpdateCredentialRequest {
  environment?: Environment
  tokenPlain?: string
  displayName?: string
}




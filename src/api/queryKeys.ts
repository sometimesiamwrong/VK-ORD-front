/**
 * Centralized Query Keys Factory
 *
 * This file provides a single source of truth for all React Query cache keys.
 * Using a factory pattern ensures type safety and prevents key collisions.
 *
 * @example
 * ```ts
 * const { queryKey, queryFn } = queryKeys.counterparties.list({ limit: 10 })
 * useQuery({ queryKey, queryFn })
 * ```
 */

export const queryKeys = {
  // Authentication
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
    refresh: () => [...queryKeys.auth.all, 'refresh'] as const,
  },

  // Users
  users: {
    all: ['users'] as const,
    profile: (userId?: string) =>
      userId ? [...queryKeys.users.all, 'profile', userId] as const : [...queryKeys.users.all, 'profile'] as const,
  },

  // Credentials (VK ORD API tokens)
  credentials: {
    all: ['credentials'] as const,
    list: () => [...queryKeys.credentials.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.credentials.all, 'detail', id] as const,
  },

  // Counterparties
  counterparties: {
    all: ['counterparties'] as const,
    lists: () => [...queryKeys.counterparties.all, 'list'] as const,
    list: (params?: { limit?: number; offset?: number }) =>
      [...queryKeys.counterparties.lists(), params] as const,
    detail: (id: string) => [...queryKeys.counterparties.all, 'detail', id] as const,
    byInn: (inn: string) => [...queryKeys.counterparties.all, 'byInn', inn] as const,
    contracts: (externalId: string) =>
      [...queryKeys.counterparties.all, 'contracts', externalId] as const,
  },

  // Contracts
  contracts: {
    all: ['contracts'] as const,
    lists: () => [...queryKeys.contracts.all, 'list'] as const,
    list: (params?: { limit?: number; offset?: number }) =>
      [...queryKeys.contracts.lists(), params] as const,
    detail: (externalId: string) => [...queryKeys.contracts.all, 'detail', externalId] as const,
    withCreatives: (externalId: string) =>
      [...queryKeys.contracts.all, 'withCreatives', externalId] as const,
  },

  // Creatives
  creatives: {
    all: ['creatives'] as const,
    lists: () => [...queryKeys.creatives.all, 'list'] as const,
    list: (params?: { limit?: number; offset?: number }) =>
      [...queryKeys.creatives.lists(), params] as const,
    detail: (externalId: string) => [...queryKeys.creatives.all, 'detail', externalId] as const,
  },

  // Media files
  media: {
    all: ['media'] as const,
    lists: () => [...queryKeys.media.all, 'list'] as const,
    list: (params?: { limit?: number; offset?: number }) =>
      [...queryKeys.media.lists(), params] as const,
    detail: (id: string) => [...queryKeys.media.all, 'detail', id] as const,
  },

  // Acts
  acts: {
    all: ['acts'] as const,
    lists: () => [...queryKeys.acts.all, 'list'] as const,
    list: (params?: { limit?: number; offset?: number }) =>
      [...queryKeys.acts.lists(), params] as const,
    detail: (id: string) => [...queryKeys.acts.all, 'detail', id] as const,
  },

  // Wizard-specific queries
  wizard: {
    all: ['wizard'] as const,
    partyLookup: (inn: string) => [...queryKeys.wizard.all, 'partyLookup', inn] as const,
    kktyByText: (text: string) => [...queryKeys.wizard.all, 'kktyByText', text] as const,
  },
} as const

/**
 * Type-safe mutation keys for cache invalidation
 */
export const mutationKeys = {
  auth: {
    login: ['auth', 'login'] as const,
    logout: ['auth', 'logout'] as const,
    register: ['auth', 'register'] as const,
  },

  counterparties: {
    create: ['counterparties', 'create'] as const,
    update: ['counterparties', 'update'] as const,
    delete: ['counterparties', 'delete'] as const,
  },

  contracts: {
    create: ['contracts', 'create'] as const,
    update: ['contracts', 'update'] as const,
    delete: ['contracts', 'delete'] as const,
  },

  creatives: {
    create: ['creatives', 'create'] as const,
    update: ['creatives', 'update'] as const,
    delete: ['creatives', 'delete'] as const,
  },

  media: {
    upload: ['media', 'upload'] as const,
    delete: ['media', 'delete'] as const,
  },

  acts: {
    create: ['acts', 'create'] as const,
    update: ['acts', 'update'] as const,
    delete: ['acts', 'delete'] as const,
  },
} as const

/**
 * Helper function to invalidate related queries after mutations
 *
 * @example
 * ```ts
 * await queryClient.invalidateQueries({ queryKey: queryKeys.counterparties.all })
 * ```
 */
export const invalidateQueries = {
  // After counterparty mutations
  afterCounterpartyMutation: () => [
    queryKeys.counterparties.all,
    queryKeys.wizard.all, // Wizard uses counterparties
  ] as const,

  // After contract mutations
  afterContractMutation: (externalId?: string) => {
    const keys = [queryKeys.contracts.all] as const
    if (externalId) {
      return [...keys, queryKeys.counterparties.contracts(externalId)] as const
    }
    return keys
  },

  // After creative mutations
  afterCreativeMutation: (contractExternalId?: string) => {
    const keys = [queryKeys.creatives.all] as const
    if (contractExternalId) {
      return [...keys, queryKeys.contracts.withCreatives(contractExternalId)] as const
    }
    return keys
  },

  // After media upload
  afterMediaUpload: () => [queryKeys.media.all] as const,

  // After act mutations
  afterActMutation: () => [queryKeys.acts.all] as const,
} as const

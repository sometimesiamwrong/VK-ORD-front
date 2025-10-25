import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  useWizardAdvertiser,
  useWizardContractor,
  useWizardActions
} from '../stores/wizardStore'
import CounterpartiesService from '../services/counterparties'
import WizardService from '../services/wizard'
import { queryKeys, invalidateQueries } from '../api/queryKeys'
import { createQueryOptions, createMutationWithInvalidation } from '../api/queryOptions'
import { getErrorMessage } from '../api/errorHandler'
import { isValidInn, getPartyDisplayName, getPartyShortWithOpf } from '../utils'
import type { CounterpartyDto, CounterpartyItem } from '../types'

// Функция преобразования CounterpartyDto в CounterpartyItem
const transformCounterpartyDto = (dto: CounterpartyDto): CounterpartyItem => {
  const juridicalDetails = dto.data.juridicalDetails
  return {
    id: dto.id,
    externalId: dto.externalId,
    name: dto.data.name,
    roles: dto.data.roles,
    juridicalDetails: juridicalDetails ? {
      type: juridicalDetails.type,
      modelScheme: juridicalDetails.modelScheme,
      inn: juridicalDetails.inn,
      kpp: juridicalDetails.kpp,
      phone: juridicalDetails.phone,
      foreignEpaymentMethod: juridicalDetails.foreignEpaymentMethod,
      foreignRegistrationNumber: juridicalDetails.foreignRegistrationNumber,
      foreignInn: juridicalDetails.foreignInn,
      foreignOksmCountryCode: juridicalDetails.foreignOksmCountryCode
    } : undefined,
    syncStatus: dto.syncStatus,
    updatedAt: dto.updatedAt,
    createdAt: dto.createdAt
  }
}

export const usePartyLookup = () => {
  const queryClient = useQueryClient()
  const advertiser = useWizardAdvertiser()
  const contractor = useWizardContractor()
  const {
    setAdvertiserInfo,
    setContractorInfo,
    addToPartyHistory,
    setLoading
  } = useWizardActions()

  // Mutation for party lookup
  const partyLookupMutation = useMutation({
    mutationFn: async ({ inn }: { kind: 'advertiser' | 'contractor'; inn: string }) => {
      return await WizardService.lookupParty({ inn })
    },
    onMutate: ({ kind }) => {
      setLoading(`lookup-${kind}`, true)
    },
    onSuccess: (data, { kind, inn }) => {
      const display = getPartyDisplayName(data.name)
      const shortWithOpf = getPartyShortWithOpf(data.name)
      const t = data.type || ''
      const info = display ? `${display}${t ? ` (${t})` : ''}` : null

      const infoData = { name: display || null, shortWithOpf: shortWithOpf || null, info }

      if (kind === 'advertiser') {
        setAdvertiserInfo(infoData)
      } else {
        setContractorInfo(infoData)
      }

      // Add to history
      addToPartyHistory({
        inn,
        shortWithOpf: shortWithOpf || display || null,
        fullName: display || null,
        type: (t as string) || null,
        timestamp: Date.now()
      })

      toast.success('Поиск выполнен успешно')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Ошибка поиска контрагента'))
    },
    onSettled: (_, __, { kind }) => {
      setLoading(`lookup-${kind}`, false)
    }
  })

  // Mutation for creating counterparty
  const createCounterpartyMutation = useMutation(
    createMutationWithInvalidation(queryClient, {
      mutationFn: async ({ inn, types }: { inn: string; types: any }) => {
        await CounterpartiesService.create({ inn, types })
        // After creation, fetch the counterparty to get external_id
        const response = await CounterpartiesService.getByInn({ inn })
        return response
      },
      successMessage: 'Контрагент успешно создан',
      errorMessage: 'Не удалось создать контрагента',
      invalidateKeys: invalidateQueries.afterCounterpartyMutation(),
      onMutate: ({ inn }) => {
        const kind = inn === advertiser.inn ? 'advertiser' : 'contractor'
        setLoading(`create-${kind}`, true)
      },
      onSuccess: (data, { inn }) => {
        // Set external_id after successful creation
        if (data && data.counterparties && data.counterparties.length > 0) {
          const counterparty = data.counterparties[0]
          const transformedCounterparty = transformCounterpartyDto(counterparty)
          const kind = inn === advertiser.inn ? 'advertiser' : 'contractor'
          
          if (kind === 'advertiser') {
            setAdvertiserInfo({ external_id: transformedCounterparty.externalId })
          } else {
            setContractorInfo({ external_id: transformedCounterparty.externalId })
          }
        }
      },
      onSettled: (_, __, { inn }) => {
        const kind = inn === advertiser.inn ? 'advertiser' : 'contractor'
        setLoading(`create-${kind}`, false)
      }
    })
  )

  // Wrapper functions for backward compatibility
  const lookupInn = useCallback(async (kind: 'advertiser' | 'contractor') => {
    const inn = kind === 'advertiser' ? advertiser.inn : contractor.inn

    if (!isValidInn(inn)) {
      toast.error('ИНН должен содержать 10 или 12 цифр')
      return
    }

    await partyLookupMutation.mutateAsync({ kind, inn })
  }, [advertiser.inn, contractor.inn, partyLookupMutation])

  const createCounterparty = useCallback(async (kind: 'advertiser' | 'publisher') => {
    const inn = kind === 'advertiser' ? advertiser.inn : contractor.inn
    const role = kind === 'advertiser' ? advertiser.role : contractor.role

    if (!isValidInn(inn)) {
      toast.error('ИНН должен содержать 10 или 12 цифр')
      return
    }

    if (role.length === 0) {
      toast.error('Необходимо выбрать роль контрагента')
      return
    }

    await createCounterpartyMutation.mutateAsync({ inn, types: role })
  }, [advertiser.inn, advertiser.role, contractor.inn, contractor.role, createCounterpartyMutation])

  return { lookupInn, createCounterparty }
}

/**
 * Hook for fetching counterparties list with proper caching
 */
export const useCounterpartiesList = (params?: { limit?: number; offset?: number }) => {
  return useQuery(
    createQueryOptions({
      queryKey: queryKeys.counterparties.list(params),
      queryFn: async () => {
        const defaultParams = {
          limit: 100,
          offset: 0,
          ...params
        }

        const response = await CounterpartiesService.getList(defaultParams)

        // Handle response structure (may contain $values wrapper from .NET serialization)
        let counterpartiesArray: CounterpartyDto[]
        if (response.data && typeof response.data === 'object' && '$values' in response.data) {
          counterpartiesArray = (response.data as any).$values
        } else {
          counterpartiesArray = response.data
        }

        return counterpartiesArray.map(transformCounterpartyDto)
      },
      staleTime: 30 * 1000, // 30 seconds
      retry: 1
    })
  )
}

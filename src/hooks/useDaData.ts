import { useMutation } from '@tanstack/react-query'
import DaDataService from '../services/dadata'
import type { DaDataPartyResponse } from '../types'

export const useDaDataPartyLookup = () => {
  return useMutation({
    mutationFn: async (inn: string) => {
      return await DaDataService.getPartyByInn(inn)
    },
  })
}




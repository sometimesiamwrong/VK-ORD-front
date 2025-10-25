import React from 'react'
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Autocomplete,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material'
import {
  Business as BusinessIcon,
} from '@mui/icons-material'
import type { CounterpartyItem } from '../../../types'

interface PartyLookupProps {
  selectedCompany: CounterpartyItem | null
  companies: CounterpartyItem[]
  isLoadingCompanies: boolean
  companySearchLoading: boolean
  onCompanySelect: (company: CounterpartyItem | null) => void
  onCompanySearch: (query: string) => Promise<CounterpartyItem[]>
}

export const PartyLookup: React.FC<PartyLookupProps> = ({
  selectedCompany,
  companies,
  isLoadingCompanies,
  companySearchLoading,
  onCompanySelect,
  onCompanySearch,
}) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Поиск контрагента
      </Typography>

            <Autocomplete
              options={companies}
              getOptionLabel={(option) => `${option.name} (ИНН: ${option.juridicalDetails?.inn || ''})`}
              value={selectedCompany}
              onChange={(_, newValue) => onCompanySelect(newValue)}
              loading={isLoadingCompanies || companySearchLoading}
              onInputChange={async (_, newInputValue) => {
                if (newInputValue.length >= 3) {
                  await onCompanySearch(newInputValue)
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Введите ИНН или название контрагента"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <>
                        {companySearchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box>
                    <Typography variant="body1">{option.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      ИНН: {option.juridicalDetails?.inn || ''}
                    </Typography>
                  </Box>
                </li>
              )}
              noOptionsText="Контрагенты не найдены"
              loadingText="Поиск контрагентов..."
              sx={{ mb: 2 }}
            />

      {selectedCompany && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {selectedCompany.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ИНН: {selectedCompany.juridicalDetails?.inn || ''}
            </Typography>
            {selectedCompany.juridicalDetails?.kpp && (
              <Typography variant="body2" color="text.secondary">
                КПП: {selectedCompany.juridicalDetails.kpp}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              Тип: {selectedCompany.juridicalDetails?.type === 'ip' ? 'ИП' : selectedCompany.juridicalDetails?.type === 'juridical' ? 'ЮР лицо' : selectedCompany.juridicalDetails?.type === 'physical' ? 'Физ. лицо' : 'Неизвестно'}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Paper>
  )
}

# Рефакторинг: Дублирования кода и сущностей

## Обзор

Данный документ содержит полный анализ дублирований кода и сущностей в проекте VK ORD Frontend. 
Цель - максимально переиспользовать существующие сущности, даже если не все их поля заполнены.

---

## 1. Дублирование трансформации CounterpartyDto → CounterpartyItem

### Файлы с дублированным кодом:
- `/src/hooks/usePartyLookup.ts` (строки 18-40)
- `/src/hooks/useCounterparties.ts` (строки 12-35)
- `/src/services/contracts.ts` (строки 66-91) - функция `mapCounterpartyDtoToItem`
- `/src/features/acts/hooks/useRelatedParties.ts` (строки 16-29) - частичная трансформация

### Описание проблемы:
Функция трансформации `CounterpartyDto` в `CounterpartyItem` дублируется как минимум 4 раза с незначительными отличиями. Это приводит к несогласованности данных и усложняет поддержку.

### Решение:
**Создать единый утилитный файл `/src/utils/transformers.ts`:**

```typescript
import type { CounterpartyDto, CounterpartyItem } from '../types'

/**
 * Преобразует CounterpartyDto в CounterpartyItem
 * Универсальная функция для всех частей приложения
 */
export const transformCounterpartyDto = (dto: CounterpartyDto): CounterpartyItem => {
  const juridicalDetails = dto.data?.juridicalDetails
  
  return {
    id: dto.id,
    externalId: dto.externalId,
    name: dto.data?.name ?? '',
    roles: dto.data?.roles ?? [],
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
```

**Использовать во всех местах:**
- Удалить локальные функции `transformCounterpartyDto` и `mapCounterpartyDtoToItem`
- Импортировать из `/src/utils/transformers.ts`
- В `useRelatedParties.ts` использовать вместо inline трансформации

---

## 2. Дублирование типов для Контрактов

### Файлы с дублированными типами:
- `/src/types/business.ts` - `ContractDetails` (строки 2-9)
- `/src/types/index.ts` - `ContractDto` (строки 421-446)
- `/src/types/index.ts` - `VkOrdContract` (строки 194-211)

### Описание проблемы:
Существует 3 разных типа для описания контракта:
- `ContractDetails` - упрощенная версия
- `ContractDto` - полная DTO с вложенным объектом `data`
- `VkOrdContract` - формат VK ORD API

Это создает путаницу и приводит к необходимости множественных преобразований.

### Решение:
**Использовать `ContractDto` как основной тип везде:**

1. Удалить `ContractDetails` из `/src/types/business.ts`
2. Создать утилиту-конвертер для обратной совместимости:

```typescript
// /src/utils/transformers.ts
export const contractDtoToLegacy = (dto: ContractDto): ContractDetails => ({
  externalId: dto.externalId || '',
  clientExternalId: dto.clientExternalId || dto.data?.clientExternalId || '',
  contractorExternalId: dto.contractorExternalId || dto.data?.contractorExternalId || '',
  paySum: Number(dto.amount || dto.data?.amount || 0),
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt
})
```

3. Заменить использование `ContractDetails` на `ContractDto` во всех компонентах
4. Использовать `VkOrdContract` только для прямых API-запросов к VK ORD

---

## 3. Дублирование типов для Креативов

### Файлы с дублированными типами:
- `/src/types/business.ts` - `CreativeDetails` (строки 11-24)
- `/src/types/index.ts` - `CreativeDto` (строки 462-507)
- `/src/types/index.ts` - `VkOrdCreativeV3Response` (строки 237-253)

### Описание проблемы:
Аналогично контрактам - 3 разных типа для одной сущности.

### Решение:
**Использовать `CreativeDto` как основной тип:**

1. Удалить `CreativeDetails` из `/src/types/business.ts`
2. Создать конвертер для обратной совместимости:

```typescript
// /src/utils/transformers.ts
export const creativeDtoToLegacy = (dto: CreativeDto): CreativeDetails => ({
  externalId: dto.externalId || '',
  contractExternalIds: dto.data?.contractExternalIds || [],
  kktus: dto.data?.kktus || [],
  format: String(dto.form || dto.data?.form || 0),
  contentUrls: dto.data?.targetUrls,
  targetAudience: dto.targeting || dto.data?.targeting,
  text: dto.data?.texts?.[0],
  name: dto.name || dto.data?.name,
  erid: dto.erid || dto.data?.erid,
  status: dto.status,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt
})
```

---

## 4. Дублирование компонентов поиска контрагентов

### Файлы с дублированным функционалом:
- `/src/features/acts/components/PartyLookup.tsx` (110 строк)
- `/src/features/wizard/components/PartyInputSection.tsx` (98 строк)
- `/src/components/ui/PartyModal.tsx` (содержит похожий функционал)
- `/src/components/ui/PartySelector.tsx` (похожий компонент)

### Описание проблемы:
Компоненты для поиска и выбора контрагентов дублируются в разных частях приложения с небольшими отличиями в UI, но одинаковой логикой.

### Решение:
**Создать универсальный компонент `/src/components/ui/PartySearchField.tsx`:**

```typescript
interface PartySearchFieldProps {
  value: CounterpartyItem | null
  onChange: (party: CounterpartyItem | null) => void
  parties: CounterpartyItem[]
  isLoading?: boolean
  onSearch: (query: string) => Promise<CounterpartyItem[]>
  label?: string
  placeholder?: string
  showFullDetails?: boolean
  variant?: 'outlined' | 'filled' | 'standard'
}
```

**Преимущества:**
- Единая логика автокомплита
- Единый формат отображения ИНН/КПП/Название
- Легко расширяемый через пропсы

**Использовать вместо:**
- `PartyLookup` - заменить на `PartySearchField` с пропсом `showFullDetails={true}`
- `PartyInputSection` - заменить часть с автокомплитом на `PartySearchField`

---

## 5. Дублирование хуков для работы с контрагентами

### Файлы с дублированными хуками:
- `/src/hooks/usePartyLookup.ts` - хук `usePartyLookup()` (194 строки)
- `/src/features/parties/hooks/usePartyLookup.ts` - другой хук `usePartyLookup()` (22 строки)

### Описание проблемы:
Два разных хука с одинаковым именем выполняют похожие, но не идентичные функции:
- `/src/hooks/usePartyLookup.ts` - комплексный хук для wizard с интеграцией в Zustand store
- `/src/features/parties/hooks/usePartyLookup.ts` - простая mutation для DaData lookup

Это создает путаницу при импортах и конфликты имен.

### Решение:
**Переименовать и разделить ответственность:**

1. **Переименовать специализированный хук:**
```typescript
// /src/features/parties/hooks/useDaDataLookup.ts
export const useDaDataLookup = () => {
  return useMutation({
    mutationFn: async (inn: string) => {
      const response = await http.post<DaDataPartyShortResponse>(
        '/api/client/v1/party',
        { inn }
      )
      return response.data
    },
  })
}
```

2. **Обновить `/src/hooks/usePartyLookup.ts`:**
   - Оставить логику интеграции с wizard store
   - Использовать внутри `useDaDataLookup` для получения данных

3. **Создать общий `/src/hooks/useCounterpartySearch.ts`:**
```typescript
export const useCounterpartySearch = () => {
  return useMutation({
    mutationFn: async (query: string) => {
      // Поиск по имени или ИНН в локальной базе + VK ORD
      const response = await CounterpartiesService.search({ query })
      return response.data.map(transformCounterpartyDto)
    }
  })
}
```

---

## 6. Дублирование типов Amount для Актов

### Файлы с дублированными типами:
- `/src/types/acts.ts`:
  - `InvoiceV3AmountElement` (строки 48-53)
  - `InvoiceV3Amount` (строки 56-59)
  - `InvoiceAmount` (строки 62-67)
- `/src/features/acts/schemas/actFormSchema.ts`:
  - `invoiceAmountSchema` (строки 11-16)
  - `invoiceV3AmountElementSchema` (строки 18-24)
  - `invoiceV3AmountSchema` (строки 26-30)

### Описание проблемы:
Типы и схемы для сумм актов дублируются между типами и Zod-схемами. При изменении структуры нужно править в двух местах.

### Решение:
**Использовать Zod как источник истины:**

1. Создать `/src/schemas/common.ts`:
```typescript
import * as z from 'zod'

export const invoiceAmountSchema = z.object({
  excludingVat: z.number().nonnegative(),
  vatRate: z.number().min(0).max(100),
  vat: z.number().nonnegative(),
  includingVat: z.number().positive(),
})

export const invoiceV3AmountElementSchema = z.object({
  excludingVat: z.string(),
  vatRate: z.string(),
  vat: z.string(),
  includingVat: z.string(),
})

export const invoiceV3AmountSchema = z.object({
  services: invoiceV3AmountElementSchema,
  commission: invoiceV3AmountElementSchema.nullable().optional(),
})

// Автоматически генерируем TypeScript типы из схем
export type InvoiceAmount = z.infer<typeof invoiceAmountSchema>
export type InvoiceV3AmountElement = z.infer<typeof invoiceV3AmountElementSchema>
export type InvoiceV3Amount = z.infer<typeof invoiceV3AmountSchema>
```

2. Импортировать в `/src/types/acts.ts`:
```typescript
export type { InvoiceAmount, InvoiceV3AmountElement, InvoiceV3Amount } from '../schemas/common'
```

3. Импортировать в `/src/features/acts/schemas/actFormSchema.ts`:
```typescript
import { invoiceAmountSchema, invoiceV3AmountElementSchema, invoiceV3AmountSchema } from '../../schemas/common'
```

---

## 7. Дублирование нормализации данных контрактов и креативов

### Файлы с дублированным функционалом:
- `/src/services/contracts.ts`:
  - `normalizeContract` (строки 93-132)
  - `normalizeCreative` (строки 134-214)

### Описание проблемы:
Функции `normalizeContract` и `normalizeCreative` используются только в одном сервисе, но содержат сложную логику слияния данных из разных источников (flat fields vs nested `data` object). Эта логика может понадобиться в других местах.

### Решение:
**Переместить в утилиты:**

1. Создать `/src/utils/normalizers.ts`:
```typescript
import type { ContractDto, CreativeDto, VkOrdPayType, VkOrdCreativeForm } from '../types'

/**
 * Нормализует контракт из любого формата API в единый ContractDto
 */
export const normalizeContract = (
  contract: Partial<ContractDto> | undefined,
  fallbackExternalId?: string
): ContractDto => {
  // Переместить код из contracts.ts
}

/**
 * Нормализует креатив из любого формата API в единый CreativeDto
 */
export const normalizeCreative = (
  creative: Partial<CreativeDto>,
  fallbackContractExternalId: string
): CreativeDto => {
  // Переместить код из contracts.ts
}
```

2. Использовать в `/src/services/contracts.ts`:
```typescript
import { normalizeContract, normalizeCreative } from '../utils/normalizers'
```

---

## 8. Дублирование логики инвалидации кэша React Query

### Файлы с дублированным кодом:
- `/src/features/acts/hooks/useCreateAct.ts`
- `/src/features/acts/hooks/useUpdateAct.ts`
- `/src/features/acts/hooks/useDeleteAct.ts`
- `/src/features/acts/hooks/useSubmitAct.ts`
- `/src/features/credentials/hooks/useCreateCredential.ts`
- `/src/features/credentials/hooks/useUpdateCredential.ts`
- `/src/features/credentials/hooks/useDeleteCredential.ts`

### Описание проблемы:
В каждом хуке вручную прописывается логика инвалидации кэша после мутации:
```typescript
await queryClient.invalidateQueries({ queryKey: ['acts'] })
await queryClient.invalidateQueries({ queryKey: ['act', externalId] })
```

Это приводит к дублированию и риску забыть инвалидировать связанные ключи.

### Решение:
**Уже есть частичное решение в `/src/api/queryKeys.ts` и `/src/api/queryOptions.ts`:**

Расширить использование функции `invalidateQueries`:
```typescript
// /src/api/queryKeys.ts
export const invalidateQueries = {
  afterActMutation: (externalId?: string) => [
    { queryKey: queryKeys.acts.all },
    { queryKey: queryKeys.acts.list() },
    ...(externalId ? [{ queryKey: queryKeys.acts.detail(externalId) }] : [])
  ],
  
  afterCredentialMutation: (publicId?: string) => [
    { queryKey: queryKeys.credentials.all },
    { queryKey: queryKeys.credentials.list() },
    ...(publicId ? [{ queryKey: queryKeys.credentials.detail(publicId) }] : [])
  ],
  
  afterCounterpartyMutation: (externalId?: string) => [
    { queryKey: queryKeys.counterparties.all },
    { queryKey: queryKeys.counterparties.list() },
    ...(externalId ? [{ queryKey: queryKeys.counterparties.byExternalId(externalId) }] : [])
  ]
}
```

**Использовать в хуках:**
```typescript
// Вместо ручного queryClient.invalidateQueries
import { invalidateQueries } from '@/api/queryKeys'

// В onSuccess:
onSuccess: async (_, variables) => {
  const invalidations = invalidateQueries.afterActMutation(variables.externalId)
  await Promise.all(invalidations.map(query => queryClient.invalidateQueries(query)))
}
```

---

## 9. Дублирование валидации ИНН

### Файлы, использующие валидацию ИНН:
- `/src/utils/index.ts` - функция `isValidInn` (строки 1-4)
- `/src/features/wizard/components/PartyInputSection.tsx` - импорт и использование
- `/src/features/wizard/hooks/useStep1Logic.ts` - импорт и использование
- `/src/hooks/usePartyLookup.ts` - импорт и использование

### Описание проблемы:
Функция `isValidInn` используется корректно (не дублируется), но есть места, где проверка делается inline без использования утилиты.

### Решение:
**Проверить все inline проверки и заменить на `isValidInn`:**

Поиск паттерна:
```typescript
// Плохо (inline)
if (inn.length === 10 || inn.length === 12) { ... }

// Хорошо (через утилиту)
if (isValidInn(inn)) { ... }
```

**Дополнительно: расширить валидацию:**
```typescript
// /src/utils/validators.ts
export function isValidInn(value: string): boolean {
  const digits = (value || '').replace(/\D/g, '')
  return digits.length === 10 || digits.length === 12
}

export function isValidKpp(value: string): boolean {
  const digits = (value || '').replace(/\D/g, '')
  return digits.length === 9
}

export function isValidOgrn(value: string): boolean {
  const digits = (value || '').replace(/\D/g, '')
  return digits.length === 13 || digits.length === 15
}
```

---

## 10. Дублирование обработки ошибок

### Файлы с похожей логикой:
- `/src/api/errorHandler.ts` - функция `getErrorMessage`
- Множество компонентов и хуков с inline обработкой ошибок

### Описание проблемы:
Функция `getErrorMessage` из `/src/api/errorHandler.ts` используется не везде. Есть места с дублированием логики:
```typescript
// Дублирование
catch (error) {
  console.error(error)
  toast.error(error?.message || 'Ошибка')
}

// Правильно
catch (error) {
  toast.error(getErrorMessage(error, 'Ошибка по умолчанию'))
}
```

### Решение:
**Создать единый хук для обработки ошибок мутаций:**

```typescript
// /src/hooks/useMutationWithToast.ts
import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '@/api/errorHandler'

interface MutationWithToastOptions<TData, TVariables> 
  extends UseMutationOptions<TData, unknown, TVariables> {
  successMessage?: string
  errorMessage?: string
}

export const useMutationWithToast = <TData, TVariables>(
  options: MutationWithToastOptions<TData, TVariables>
) => {
  const { successMessage, errorMessage, onSuccess, onError, ...restOptions } = options
  
  return useMutation({
    ...restOptions,
    onSuccess: (data, variables, context) => {
      if (successMessage) {
        toast.success(successMessage)
      }
      onSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      toast.error(getErrorMessage(error, errorMessage || 'Произошла ошибка'))
      onError?.(error, variables, context)
    }
  })
}
```

**Использовать вместо useMutation:**
```typescript
// Было:
const mutation = useMutation({
  mutationFn: async (data) => { ... },
  onSuccess: () => toast.success('Успех'),
  onError: (error) => toast.error(getErrorMessage(error, 'Ошибка'))
})

// Стало:
const mutation = useMutationWithToast({
  mutationFn: async (data) => { ... },
  successMessage: 'Успех',
  errorMessage: 'Ошибка'
})
```

---

## 11. Дублирование компонентов PartyContractSelector и ActCreationFlow

### Файлы:
- `/src/components/ui/PartyContractSelector.tsx` (788 строк) - универсальный компонент
- `/src/features/acts/components/ActCreationFlow.tsx` (89 строк) - обертка над PartyContractSelector

### Описание проблемы:
`ActCreationFlow` является тонкой оберткой над `PartyContractSelector` и добавляет минимальную функциональность (передает пропсы и обрабатывает результат). Это дублирование абстракций.

### Решение:
**Вариант 1: Удалить ActCreationFlow, использовать PartyContractSelector напрямую**

В `ActFormPage.tsx`:
```typescript
// Вместо:
<ActCreationFlow onActCreate={handleActCreate} />

// Использовать:
<PartyContractSelector
  party1Label="Клиент (Заказчик)"
  party2Label="Подрядчик (Исполнитель)"
  party1Icon={<BusinessIcon />}
  party2Icon={<PersonIcon />}
  onSelectionComplete={(selection) => {
    handleActCreate(selection.party1, selection.party2, selection.contract)
  }}
  // ... остальные пропсы
/>
```

**Вариант 2: Расширить ActCreationFlow дополнительной логикой**

Если планируется специфичная для актов логика - оставить, но добавить больше функциональности.

**Рекомендация: Вариант 1** (удалить обертку)

---

## 12. Дублирование типов Company и CounterpartyItem

### Файлы:
- `/src/types/acts.ts` - интерфейс `Company` (строки 24-31)
- `/src/types/business.ts` - интерфейс `CounterpartyItem` (строки 72-91)

### Описание проблемы:
Тип `Company` в acts.ts является подмножеством `CounterpartyItem`:
```typescript
interface Company {
  id: string
  name: string
  inn: string
  kpp?: string
  actCount?: number
  lastActDate?: string
}
```

Это создает путаницу - по сути это тот же контрагент с дополнительными полями статистики.

### Решение:
**Расширить CounterpartyItem опциональными полями статистики:**

```typescript
// /src/types/business.ts
export interface CounterpartyItem {
  id?: number
  externalId?: string
  name?: string
  roles?: string[]
  juridicalDetails?: {
    type?: string
    modelScheme?: string
    inn?: string
    kpp?: string
    // ... остальные поля
  }
  syncStatus?: string
  updatedAt?: string
  createdAt?: string
  
  // Статистические данные (опционально, для списков актов)
  actCount?: number
  lastActDate?: string
}
```

**Удалить тип `Company` из `/src/types/acts.ts`**

**Использовать везде `CounterpartyItem`:**
```typescript
// В ActFormPage.tsx и других местах
import type { CounterpartyItem } from '@/types'

// Вместо Company
const [selectedCompany, setSelectedCompany] = useState<CounterpartyItem | null>(null)
```

---

## Приоритизация рефакторинга

### Высокий приоритет (критичные для поддержки):
1. **#1** - Дублирование трансформации CounterpartyDto
2. **#2** - Дублирование типов для Контрактов
3. **#3** - Дублирование типов для Креативов
4. **#5** - Дублирование хуков usePartyLookup
5. **#12** - Дублирование типов Company и CounterpartyItem

### Средний приоритет (улучшение архитектуры):
6. **#4** - Дублирование компонентов поиска контрагентов
7. **#7** - Дублирование нормализации данных
8. **#8** - Дублирование логики инвалидации кэша
9. **#11** - Дублирование PartyContractSelector и ActCreationFlow

### Низкий приоритет (оптимизация):
10. **#6** - Дублирование типов Amount
11. **#9** - Дублирование валидации ИНН
12. **#10** - Дублирование обработки ошибок

---

## План выполнения

### Этап 1: Унификация типов (1-2 часа)
- Создать `/src/utils/transformers.ts`
- Реализовать единую `transformCounterpartyDto`
- Удалить дубликаты из всех файлов
- Удалить `Company` и использовать `CounterpartyItem`

### Этап 2: Унификация типов данных (2-3 часа)
- Использовать `ContractDto` вместо `ContractDetails`
- Использовать `CreativeDto` вместо `CreativeDetails`
- Создать конвертеры для обратной совместимости
- Обновить все компоненты и сервисы

### Этап 3: Рефакторинг хуков (2-3 часа)
- Переименовать хуки для избежания конфликтов
- Создать единый `useCounterpartySearch`
- Расширить `invalidateQueries` для всех сущностей

### Этап 4: Унификация компонентов (3-4 часа)
- Создать универсальный `PartySearchField`
- Заменить дублирующиеся компоненты
- Удалить ненужные обертки (ActCreationFlow)

### Этап 5: Оптимизация (1-2 часа)
- Создать `/src/utils/normalizers.ts`
- Создать `/src/hooks/useMutationWithToast.ts`
- Обновить все мутации для использования единого подхода

---

## Ожидаемые результаты

После рефакторинга:
- ✅ Единый источник истины для каждой сущности
- ✅ Сокращение кода на ~500-800 строк
- ✅ Упрощение добавления новых полей (изменения в одном месте)
- ✅ Консистентность данных по всему приложению
- ✅ Улучшение type safety (TypeScript будет лучше находить ошибки)
- ✅ Упрощение тестирования (меньше мест для mock-ов)

---

## Дополнительные рекомендации

### Создать общий интерфейс для всех сущностей VK ORD:
```typescript
// /src/types/common.ts
export interface BaseVkOrdEntity {
  id?: number
  externalId?: string
  syncStatus?: string
  createdAt?: string
  updatedAt?: string
  version?: number
}

// Использовать в типах
export interface CounterpartyDto extends BaseVkOrdEntity {
  data: {
    name: string
    roles: string[]
    // ...
  }
}

export interface ContractDto extends BaseVkOrdEntity {
  data: {
    // ...
  }
}
```

### Использовать Generic типы для списков:
```typescript
export interface PagedResponse<T> {
  data: T[]
  totalCount: number
  totalItemsCount?: number
  limit: number
  offset?: number
}

// Использование
type CounterpartiesListResponse = PagedResponse<CounterpartyDto>
type ContractsListResponse = PagedResponse<ContractDto>
type CreativesListResponse = PagedResponse<CreativeDto>
```

---

**Дата создания:** 2025-01-26  
**Версия:** 1.0  
**Автор:** Claude Code Analysis

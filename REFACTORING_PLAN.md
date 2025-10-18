# 🎯 ПЛАН РЕФАКТОРИНГА ПРОЕКТА VK ORD

## 📊 Текущее состояние
- **~4,200 строк кода**, 10 feature-модулей, 79 файлов
- **Критические проблемы**: двойная система state management (Context + Zustand), монолитные компоненты (300+ строк), разрозненная работа с API

---

## 🚀 ФАЗА 1: Унификация State Management (2-3 недели)

### Проблема
Сейчас используются **две несовместимые системы**:
1. **Legacy `useApp` Context** (404 строки) - только для wizard
2. **Zustand** - только для auth/environment

Это создает:
- Непоследовательность паттернов
- Сложность отладки
- Невозможность масштабирования

### Решение

#### 1.1 Миграция wizard с Context на Zustand
```typescript
// src/stores/wizardStore.ts (новый файл)
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WizardState {
  // State
  currentStep: number
  parties: {
    advertiser: { inn: string; info: CounterpartyItem | null; role: string | null }
    contractor: { inn: string; info: CounterpartyItem | null; role: string | null }
  }
  contract: {
    typeId: string | null
    name: string
    serialNumber: string
    // ... остальные поля
  }
  creative: {
    form: string | null
    description: string
    kktuCodes: string[]
    mediaFiles: File[]
  }
  erid: string | null

  // Actions (разделены по фичам)
  actions: {
    // Navigation
    setStep: (step: number) => void
    nextStep: () => void
    prevStep: () => void

    // Parties
    setAdvertiserInn: (inn: string) => void
    setAdvertiserInfo: (info: CounterpartyItem) => void
    setAdvertiserRole: (role: string) => void
    // ... аналогично для contractor

    // Contract
    updateContract: (data: Partial<ContractData>) => void

    // Creative
    updateCreative: (data: Partial<CreativeData>) => void

    // Reset
    resetWizard: () => void
  }
}

export const useWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      parties: {
        advertiser: { inn: '', info: null, role: null },
        contractor: { inn: '', info: null, role: null }
      },
      contract: { typeId: null, name: '', serialNumber: '' },
      creative: { form: null, description: '', kktuCodes: [], mediaFiles: [] },
      erid: null,

      actions: {
        setStep: (step) => set({ currentStep: step }),
        nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
        prevStep: () => set((s) => ({ currentStep: s.currentStep - 1 })),

        setAdvertiserInn: (inn) =>
          set((s) => ({
            parties: {
              ...s.parties,
              advertiser: { ...s.parties.advertiser, inn }
            }
          })),

        updateContract: (data) =>
          set((s) => ({ contract: { ...s.contract, ...data } })),

        resetWizard: () => set({
          currentStep: 1,
          parties: { advertiser: {...}, contractor: {...} },
          // ... reset all
        })
      }
    }),
    {
      name: 'vk-ord-wizard',
      partialize: (state) => ({
        // Сохраняем только нужные поля (без actions)
        currentStep: state.currentStep,
        parties: state.parties,
        contract: state.contract,
        creative: state.creative
      })
    }
  )
)

// Селекторы для оптимизации ре-рендеров
export const useWizardStep = () => useWizardStore((s) => s.currentStep)
export const useWizardParties = () => useWizardStore((s) => s.parties)
export const useWizardActions = () => useWizardStore((s) => s.actions)
```

#### 1.2 Создать custom hooks для каждого шага
```typescript
// src/features/wizard/hooks/useStep1Logic.ts
export const useStep1Logic = () => {
  const { advertiser, contractor } = useWizardParties()
  const { setAdvertiserInn, setAdvertiserInfo, setAdvertiserRole } = useWizardActions()

  // Валидация шага
  const canProceed = useMemo(() => {
    return advertiser.inn.length >= 10 &&
           contractor.inn.length >= 10 &&
           advertiser.role !== null &&
           contractor.role !== null
  }, [advertiser, contractor])

  return {
    advertiser,
    contractor,
    setAdvertiserInn,
    setAdvertiserInfo,
    setAdvertiserRole,
    canProceed
  }
}
```

#### 1.3 Рефакторинг компонентов
```typescript
// src/components/steps/Step1Parties.tsx - ДО (362 строки)
// ❌ Всё в одном файле: логика + UI + модалки

// src/components/steps/Step1Parties.tsx - ПОСЛЕ (50-70 строк)
export const Step1Parties: React.FC = () => {
  const logic = useStep1Logic()
  const partyModal = useModal<'advertiser' | 'contractor'>()

  return (
    <Box className="space-y-6">
      <PartyInputSection
        party={logic.advertiser}
        onInnChange={logic.setAdvertiserInn}
        onCreateNew={() => partyModal.open('advertiser')}
      />

      <PartyInputSection
        party={logic.contractor}
        onInnChange={logic.setContractorInn}
        onCreateNew={() => partyModal.open('contractor')}
      />

      <PartyModal
        isOpen={partyModal.isOpen}
        kind={partyModal.data}
        onClose={partyModal.close}
      />
    </Box>
  )
}
```

---

## 🧩 ФАЗА 2: Декомпозиция компонентов (2-3 недели)

### Проблема
Монолитные компоненты 300+ строк с перемешанной логикой и UI.

### Решение: Разделение на слои

#### 2.1 Уровень 1: Business Logic Hooks
```typescript
// src/features/wizard/hooks/usePartyLookup.ts
export const usePartyLookup = () => {
  const lookupByInn = useMutation({
    mutationFn: (inn: string) => CounterpartiesService.lookupByInn(inn),
    onError: (error) => {
      const apiError = handleApiError(error)
      toast.error(apiError.userMessage)
    }
  })

  const createCounterparty = useMutation({
    mutationFn: (data: CreateCounterpartyRequest) =>
      CounterpartiesService.create(data),
    onSuccess: (data) => {
      toast.success('Контрагент создан')
      queryClient.invalidateQueries({ queryKey: queryKeys.counterparties.all })
    }
  })

  return {
    lookupByInn: lookupByInn.mutate,
    isLookupLoading: lookupByInn.isPending,
    createCounterparty: createCounterparty.mutate,
    isCreateLoading: createCounterparty.isPending
  }
}
```

#### 2.2 Уровень 2: Presentational Components
```typescript
// src/features/wizard/components/PartyInputSection/PartyInputSection.tsx
interface PartyInputSectionProps {
  party: { inn: string; info: CounterpartyItem | null }
  onInnChange: (inn: string) => void
  onLookup: () => void
  onCreateNew: () => void
  isLoading?: boolean
}

export const PartyInputSection: React.FC<PartyInputSectionProps> = ({
  party,
  onInnChange,
  onLookup,
  onCreateNew,
  isLoading
}) => {
  return (
    <Box className="space-y-4">
      <div className="flex gap-2">
        <Input
          label="ИНН"
          value={party.inn}
          onChange={(e) => onInnChange(e.target.value)}
          maxLength={12}
        />
        <Button onClick={onLookup} disabled={isLoading}>
          {isLoading ? <Spinner /> : 'Найти'}
        </Button>
      </div>

      {party.info && (
        <PartyInfoCard party={party.info} />
      )}

      <Button variant="outline" onClick={onCreateNew}>
        Создать нового контрагента
      </Button>
    </Box>
  )
}
```

#### 2.3 Уровень 3: Container Components
```typescript
// src/features/wizard/components/Step1Parties/Step1Parties.tsx
export const Step1Parties: React.FC = () => {
  const { advertiser, contractor } = useWizardParties()
  const { setAdvertiserInn, setAdvertiserInfo } = useWizardActions()
  const { lookupByInn, isLookupLoading } = usePartyLookup()
  const partyModal = useModal<'advertiser' | 'contractor'>()

  const handleAdvertiserLookup = () => {
    lookupByInn(advertiser.inn, {
      onSuccess: (data) => setAdvertiserInfo(data)
    })
  }

  return (
    <div className="space-y-8">
      <PartyInputSection
        party={advertiser}
        onInnChange={setAdvertiserInn}
        onLookup={handleAdvertiserLookup}
        onCreateNew={() => partyModal.open('advertiser')}
        isLoading={isLookupLoading}
      />

      <Divider />

      <PartyInputSection
        party={contractor}
        onInnChange={setContractorInn}
        onLookup={handleContractorLookup}
        onCreateNew={() => partyModal.open('contractor')}
        isLoading={isLookupLoading}
      />

      <PartyModal {...partyModal} />
    </div>
  )
}
```

---

## 🔧 ФАЗА 3: Стандартизация Service Layer (1-2 недели)

### Проблема
4 разных паттерна работы с API (прямой http, service классы, hooks с логикой).

### Решение: Единый паттерн

#### 3.1 Централизованные Query Keys
```typescript
// src/api/queryKeys.ts
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const
  },

  contracts: {
    all: ['contracts'] as const,
    list: (params?: ListParams) => [...queryKeys.contracts.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.contracts.all, 'detail', id] as const,
    between: (inn1: string, inn2: string) =>
      [...queryKeys.contracts.all, 'between', { inn1, inn2 }] as const
  },

  counterparties: {
    all: ['counterparties'] as const,
    list: (params?: ListParams) => [...queryKeys.counterparties.all, 'list', params] as const,
    byInn: (inn: string) => [...queryKeys.counterparties.all, 'byInn', inn] as const,
    contracts: (externalId: string) =>
      [...queryKeys.counterparties.all, 'contracts', externalId] as const
  },

  credentials: {
    all: ['credentials'] as const,
    list: () => [...queryKeys.credentials.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.credentials.all, 'detail', id] as const
  },

  // ... для остальных фичей
}
```

#### 3.2 Стандартизированные сервисы
```typescript
// src/services/counterparties.ts
export class CounterpartiesService {
  // GET запросы
  static async getList(params?: CounterpartiesListParams) {
    const response = await http.get<CounterpartiesListResponse>(
      '/api/client/counterparties',
      { params }
    )
    return response.data
  }

  static async getByInn(inn: string) {
    const response = await http.get<CounterpartyItem>(
      `/api/v1/counterparties/by-inn/${inn}`
    )
    return response.data
  }

  static async getContracts(externalId: string) {
    const response = await http.get<CounterpartyContract[]>(
      `/api/client/counterparties/${externalId}/contracts`
    )
    return response.data
  }

  // POST/PUT/DELETE запросы
  static async create(data: CreateCounterpartyRequest) {
    const response = await http.post<CounterpartyItem>(
      '/api/client/counterparties',
      data
    )
    return response.data
  }

  static async update(id: string, data: UpdateCounterpartyRequest) {
    const response = await http.put<CounterpartyItem>(
      `/api/client/counterparties/${id}`,
      data
    )
    return response.data
  }

  static async lookupByInn(inn: string) {
    const response = await http.post<DaDataPartyShortResponse>(
      '/api/client/party',
      { inn }
    )
    return response.data
  }
}
```

#### 3.3 Query Options Factory
```typescript
// src/api/queryOptions.ts
import { queryOptions } from '@tanstack/react-query'

export const counterpartiesQueries = {
  list: (params?: CounterpartiesListParams) =>
    queryOptions({
      queryKey: queryKeys.counterparties.list(params),
      queryFn: () => CounterpartiesService.getList(params),
      staleTime: 5 * 60 * 1000, // 5 минут
      gcTime: 10 * 60 * 1000     // 10 минут
    }),

  byInn: (inn: string) =>
    queryOptions({
      queryKey: queryKeys.counterparties.byInn(inn),
      queryFn: () => CounterpartiesService.getByInn(inn),
      enabled: inn.length >= 10, // Валидация ИНН
      retry: 1
    }),

  contracts: (externalId: string) =>
    queryOptions({
      queryKey: queryKeys.counterparties.contracts(externalId),
      queryFn: () => CounterpartiesService.getContracts(externalId),
      staleTime: 30 * 1000 // 30 секунд
    })
}

export const contractsQueries = {
  detail: (id: string) =>
    queryOptions({
      queryKey: queryKeys.contracts.detail(id),
      queryFn: () => ContractsService.getContractDetails(id),
      staleTime: 2 * 60 * 1000
    })
}
```

#### 3.4 Hooks с инвалидацией
```typescript
// src/features/parties/hooks.ts
export const useCounterpartiesList = (params?: CounterpartiesListParams) => {
  return useQuery(counterpartiesQueries.list(params))
}

export const useCounterpartyByInn = (inn: string) => {
  return useQuery(counterpartiesQueries.byInn(inn))
}

export const useCreateCounterparty = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: CounterpartiesService.create,
    onSuccess: () => {
      // Инвалидация всех списков контрагентов
      queryClient.invalidateQueries({
        queryKey: queryKeys.counterparties.all
      })
      toast.success('Контрагент создан')
    },
    onError: (error) => {
      const apiError = handleApiError(error)
      toast.error(apiError.userMessage)
    }
  })
}

export const useLookupCounterparty = () => {
  return useMutation({
    mutationFn: CounterpartiesService.lookupByInn,
    onError: (error) => {
      const apiError = handleApiError(error)
      toast.error(apiError.userMessage)
    }
  })
}
```

---

## 📁 ФАЗА 4: Реорганизация типов (1 неделя)

### Проблема
`types/index.ts` — 645 строк с перемешанными enum, API типами и бизнес-моделями.

### Решение: Разделение по доменам

```typescript
src/types/
├── api/                          # API response/request типы
│   ├── auth.ts                   → LoginRequest, AuthResponse, RegisterRequest
│   ├── contracts.ts              → GetContractDetailsResponse, CreateContractRequest
│   ├── counterparties.ts         → CounterpartiesListResponse, CreateCounterpartyRequest
│   ├── credentials.ts            → CredentialResponse, CreateCredentialRequest
│   ├── creatives.ts              → CreateCreativeRequest, CreativeResponse
│   ├── media.ts                  → UploadMediaResponse
│   ├── acts.ts                   → ActResponse, CreateActRequest
│   └── index.ts                  → Реэкспорт всех API типов
│
├── domain/                       # Бизнес-модели (чистые типы)
│   ├── contract.ts               → Contract, ContractType
│   ├── counterparty.ts           → Counterparty, CounterpartyItem
│   ├── creative.ts               → Creative, CreativeForm
│   ├── credential.ts             → Credential
│   ├── user.ts                   → User, UserProfile
│   ├── act.ts                    → Act, ActStatus
│   └── index.ts
│
├── enums/                        # VK ORD константы
│   ├── vk-ord.ts                 → VkOrdCreativeForm, VkOrdPersonRoles, etc.
│   └── index.ts
│
├── wizard/                       # Wizard-специфичные типы
│   ├── state.ts                  → WizardState (если нужен отдельно)
│   ├── steps.ts                  → Step types
│   └── index.ts
│
├── common/                       # Общие типы
│   ├── pagination.ts             → PaginationParams, PaginatedResponse
│   ├── errors.ts                 → BrokenRule, ApiError
│   ├── cache.ts                  → CacheResponse
│   └── index.ts
│
└── index.ts                      → Главный реэкспорт
```

---

## 🛡️ ФАЗА 5: Централизация обработки ошибок (1 неделя)

### Проблема
Обработка ошибок размазана по 15+ файлам с дублированием логики.

### Решение: Единая система

#### 5.1 Error Classes
```typescript
// src/api/errors.ts
export class ApiError extends Error {
  constructor(
    public code: string,
    public userMessage: string,
    public details?: unknown,
    public originalError?: unknown
  ) {
    super(userMessage)
    this.name = 'ApiError'
  }
}

export class ValidationError extends ApiError {
  constructor(
    public brokenRules: BrokenRule[],
    userMessage: string
  ) {
    super('VALIDATION_ERROR', userMessage, { brokenRules })
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Требуется авторизация') {
    super('AUTH_ERROR', message)
    this.name = 'AuthenticationError'
  }
}

export class NetworkError extends ApiError {
  constructor(message = 'Ошибка сети. Проверьте подключение к интернету') {
    super('NETWORK_ERROR', message)
    this.name = 'NetworkError'
  }
}
```

---

## 📂 ФАЗА 6: Стандартизация структуры фич (1-2 недели)

### Решение: Единая структура

```typescript
features/{feature}/
├── index.ts                      // Экспорт страницы по умолчанию
├── {Feature}Page.tsx             // Главный компонент страницы
├── api.ts                        // Сервисы (если специфичны для фичи)
├── store.ts                      // Zustand store (если нужен)
├── types.ts                      // Типы специфичные для фичи
│
├── hooks/
│   ├── use{Feature}List.ts       // Query hook для списка
│   ├── use{Feature}Detail.ts     // Query hook для деталей
│   ├── useCreate{Feature}.ts     // Mutation hook
│   ├── useUpdate{Feature}.ts     // Mutation hook
│   └── index.ts                  // Реэкспорт всех hooks
│
├── components/
│   ├── {Component}/
│   │   ├── {Component}.tsx
│   │   ├── {Component}.types.ts  // Пропсы компонента
│   │   └── index.ts
│   ├── {AnotherComponent}/
│   └── index.ts
│
└── utils.ts                      // Утилиты специфичные для фичи
```

---

## 🎨 ФАЗА 7: UI/UX инфраструктура (1 неделя)

### 7.1 Loading States
```typescript
// src/components/ui/Skeleton.tsx (из shadcn/ui)
npx shadcn@latest add skeleton

// Использование
export const ContractListSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <Skeleton key={i} className="h-24 w-full" />
    ))}
  </div>
)

// В компоненте
const { data: contracts, isLoading } = useContractsList()

if (isLoading) return <ContractListSkeleton />
```

### 7.2 Empty States
```typescript
// src/components/EmptyState.tsx
export const EmptyState: React.FC<{
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    {icon && <div className="mb-4 text-gray-400">{icon}</div>}
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
)
```

### 7.3 Suspense Boundaries
```typescript
// src/routes.tsx
import { Suspense } from 'react'
import { PageLoader } from './components/PageLoader'

<Suspense fallback={<PageLoader />}>
  <Routes>
    <Route path="/contracts" element={<ContractsPage />} />
  </Routes>
</Suspense>
```

---

## 🧪 ФАЗА 8: Quality Tools (опционально, 1-2 недели)

### 8.1 Добавить тесты
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

### 8.2 Добавить Storybook
```bash
npx storybook@latest init
```

---

## 📋 ЧЕКЛИСТ ВЫПОЛНЕНИЯ

### Фаза 1: State Management ✅ COMPLETED
- [x] Создать `src/stores/wizardStore.ts` с Zustand
- [x] Создать селекторы для каждого шага
- [x] Мигрировать `Step1Parties` на новый store
- [x] Мигрировать `Step2Contract` на новый store
- [x] Мигрировать `Step3Creative` на новый store
- [x] Мигрировать `Step4Result` на новый store
- [x] Удалить `src/context/AppContext.tsx`
- [x] Обновить все компоненты, использующие `useApp()`

### Фаза 2: Декомпозиция компонентов ✅ COMPLETED
- [x] Создать `useStep1Logic`, `useStep3Logic` hooks
- [x] Разбить `Step1Parties` на подкомпоненты (`PartyInputSection`)
- [x] Разбить `Step3Creative` на подкомпоненты (`UrlTagList`, `KktyHintsPanel`)
- [x] Создать `useModal` hook
- [x] Обновить `usePartyLookup` hook на работу с Zustand
- [x] Обновить `useContractAndCreative` hook на работу с Zustand
- [x] Заменить все использования `setMessage` на `toast` из sonner

### Фаза 3: Service Layer ✅ COMPLETED
- [x] Создать `src/api/queryKeys.ts`
- [x] Создать `src/api/queryOptions.ts`
- [x] Создать `WizardService` (`src/services/wizard.ts`)
- [x] Стандартизировать `CounterpartiesService`
- [x] Стандартизировать `ContractsService`
- [x] Обновить `usePartyLookup` на использование query options и мутаций
- [x] Обновить `useContractAndCreative` на использование WizardService
- [x] Обновить `useCounterpartiesList` на использование query options
- [x] Добавить инвалидацию кэша в мутации создания контрагентов

### Фаза 4: Типы ✅ COMPLETED
- [x] Создать структуру `src/types/enums/`, `common/`
- [x] Создать `types/enums/vk-ord.ts` со всеми VK ORD енумами
- [x] Создать `types/common/pagination.ts`, `cache.ts`, `errors.ts`
- [x] Обновить `types/index.ts` для реэкспорта из новой структуры
- [x] Сохранить обратную совместимость со старыми импортами

### Фаза 5: Error Handling ✅ COMPLETED
- [x] Создать `src/api/errors.ts` с классами ошибок
- [x] Создать `src/api/errorHandler.ts`
- [x] Создать `src/utils/logger.ts`
- [x] Обновить `queryClient.ts` с error handling
- [x] Создать `ErrorBoundary` компонент
- [x] Обернуть роуты в `ErrorBoundary`
- [x] Удалить дублирование обработки ошибок из хуков

### Фаза 6: Структура фич ✅ COMPLETED
- [x] Стандартизировать `features/acts/` - Создана структура hooks/ с 12 отдельными файлами
- [x] Стандартизировать `features/creatives/` - Создана структура hooks/ с 2 файлами
- [x] Стандартизировать `features/credentials/` - Создана структура hooks/ с 4 файлами
- [x] Стандартизировать `features/parties/` - Создана структура hooks/ с 2 файлами
- [x] Создать `hooks/` в каждой фиче с index.ts для реэкспорта
- [x] Разделить монолитные hooks.ts на отдельные файлы по ответственности
- [x] Удалить дублирующиеся компоненты (CompanyLookup.tsx)

### Фаза 7: UI Infrastructure ✅ COMPLETED
- [x] Добавить `Skeleton` компонент (src/components/ui/skeleton.tsx)
- [x] Создать `EmptyState` компонент (src/components/EmptyState.tsx)
- [x] Создать `PageLoader` компонент (src/components/PageLoader.tsx)
- [x] Добавить `Suspense` в роутинг с PageLoader fallback
- [ ] Добавить loading states во все списки (опционально, можно добавлять по мере необходимости)

### Фаза 8: Quality (опционально) ✅ COMPLETED (Storybook)
- [ ] Setup Vitest
- [ ] Написать тесты для критичных хуков
- [x] Setup Storybook - Storybook 9.1.12 с Vite интеграцией
- [x] Создать stories для UI компонентов - button, EmptyState, skeleton, PageLoader (4 компонента, 38 вариантов stories)
- [x] Настроить Storybook с Material-UI theme provider
- [x] Настроить Storybook с Tailwind CSS v4
- [x] Исправить .env файлы для корректной работы Storybook
- [x] Успешная сборка production билда Storybook

---

## 🎯 КЛЮЧЕВЫЕ ПРИНЦИПЫ

1. **Single Responsibility**: Каждый файл делает одно дело
2. **DRY**: Переиспользуемые хуки для общей логики
3. **Separation of Concerns**: Логика ↔ UI ↔ API разделены
4. **Type Safety**: Строгая типизация на всех уровнях
5. **Predictable State**: Один source of truth (Zustand)
6. **Error Resilience**: Централизованная обработка ошибок
7. **Consistent Patterns**: Одинаковая структура для всех фич

---

## 📈 МЕТРИКИ УСПЕХА

**До рефакторинга:**
- Монолитные компоненты: 300+ строк
- 2 системы state management
- 4 паттерна работы с API
- `types/index.ts`: 645 строк

**После рефакторинга:**
- Компоненты: < 100 строк
- 1 система (Zustand)
- 1 паттерн (Service → queryOptions → hook)
- Типы разделены по доменам

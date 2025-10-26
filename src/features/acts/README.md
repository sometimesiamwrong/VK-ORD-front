# Фича: Управление актами (Acts/Invoices)

## Описание

Модуль создания и управления актами оказанных услуг для VK ORD. Акты документируют выполнение рекламных работ между контрагентами (рекламодатель, издатель, агентство) с указанием сумм, НДС, креативов и статистики размещения.

## Основные компоненты

### 1. ActsPage (`ActsPage.tsx`)

**Назначение:** Главная страница списка актов с поиском и быстрым созданием

**Структура:**
1. **ActCreationFlow** - пошаговый процесс создания акта (выбор клиент → подрядчик → контракт)
2. **PartyLookup** - поиск контрагента для фильтрации актов
3. **ActListPanel** - таблица актов выбранного контрагента
4. **ActEditor** (deprecated) - просмотр деталей в той же странице
5. **ActHintsSidebar** (deprecated) - подсказки и действия

**Навигация:**
- `/acts` - список актов
- `/acts/new` - создание нового акта (через ActCreationFlow или напрямую)
- `/acts/{actId}/edit` - редактирование акта

### 2. ActFormPage (`ActFormPage.tsx`)

**Назначение:** Полноценная форма создания/редактирования акта

**Режимы:**
- **Создание** - пустая форма с предзаполнением из navigation state
- **Редактирование** - загрузка данных по `actId` из URL

**Технологии:**
- React Hook Form + Zod валидация
- useFieldArray для динамических списков
- React Query для загрузки контрактов и креативов
- Automatic VAT calculation

## Структура данных акта

### ActDetails
```typescript
interface ActDetails {
  id: string                       // Внутренний ID
  externalId: string               // Внешний идентификатор
  number: string                   // Номер акта (serial)
  contractId: string               // External ID контракта
  issueDate: string                // Дата выдачи (date)
  periodStart: string              // Дата начала периода (dateStart)
  periodEnd: string                // Дата окончания периода (dateEnd)
  totalAmount: number              // Общая сумма с НДС (includingVat)
  vatRate: number                  // Ставка НДС (20%)
  vatAmount: number                // Сумма НДС (vat)
  amountWithoutVat: number         // Сумма без НДС (excludingVat)
  advertiserRole: ActRole          // Роль клиента (advertiser/publisher)
  contractorRole: ActRole          // Роль подрядчика (publisher/advertiser)
  status: ActStatus                // Статус акта
  distributions: Distribution[]    // Распределение по контрактам
  statistics: ActStatistic[]       // Статистика размещения
  createdAt: string
  updatedAt: string
}
```

### Distribution (Item)
```typescript
interface Distribution {
  contractExternalId: string       // ID контракта для распределения
  amount: InvoiceAmount            // Сумма распределения
  creatives: string[]              // Массив External IDs креативов
}
```

### InvoiceAmount
```typescript
interface InvoiceAmount {
  includingVat: number             // Сумма с НДС
  vatRate: number                  // Ставка НДС (обычно 20)
  vat: number                      // Сумма НДС
  excludingVat: number             // Сумма без НДС
}
```

### ActRole
```typescript
enum ActRole {
  advertiser = 'advertiser',       // Рекламодатель
  publisher = 'publisher',         // Издатель
  agency = 'agency',               // Агентство
  ors = 'ors'                      // Оператор рекламной системы
}
```

### ActStatus
```typescript
enum ActStatus {
  draft = 'draft',                 // Черновик
  sent = 'sent',                   // Отправлен в VK ORD
  approved = 'approved',           // Утвержден
  rejected = 'rejected',           // Отклонен
  error = 'error'                  // Ошибка
}
```

### ActStatistic
```typescript
interface ActStatistic {
  metric: string                   // Метрика (impressions, clicks, etc.)
  value: number                    // Значение
  unit: string                     // Единица измерения
  platform: string                 // Платформа (VK, OK, etc.)
  period: string                   // Период (дата)
  isValidated: boolean             // Прошла валидацию
  isManual: boolean                // Введена вручную
}
```

## ActFormPage - Полная форма

### Вкладки (Tabs)

**1. Основная информация**
- External ID
- Серийный номер акта
- Дата выдачи
- Период (начало/конец)
- Роли (клиент/подрядчик)
- Контракт (Autocomplete)
- Сумма с НДС, ставка НДС, сумма НДС, сумма без НДС
- Checkbox автоматического расчета НДС

**2. Распределение**
- Динамический список items (distributions)
- Для каждого item:
  - Контракт (Autocomplete)
  - Сумма с НДС (автоматический расчет НДС)
  - Креативы (Autocomplete multiple)
- Кнопки добавить/удалить item

**3. Статистика**
- Динамический список статистики
- Для каждой записи:
  - Метрика (Impressions, Clicks, etc.)
  - Значение
  - Единица измерения
  - Платформа (Select: VK, OK, Telegram, etc.)
  - Период (дата)
  - Checkboxes: валидирована, введена вручную
- Кнопки добавить/удалить статистику

### Кнопки действий

**Сохранить черновик** (SaveIcon)
- Валидация формы
- Создание/обновление акта со статусом `draft`
- Редирект на `/acts/{actId}/edit` после создания

**Отправить в VK ORD** (SendIcon)
- Валидация формы
- Отправка акта в VK ORD для регистрации
- Статус меняется на `sent`

**Удалить** (DeleteIcon)
- Только в режиме редактирования
- Подтверждение через confirm
- Редирект на `/acts` после удаления

**Назад** (ArrowBackIcon)
- Возврат на `/acts` без сохранения

### Автоматические расчеты

#### НДС для основной суммы
```typescript
// При autoCalculate = true и изменении includingVat или vatRate
const vat = includingVat * (vatRate / 100)
const excludingVat = includingVat - vat
```

#### НДС для items
```typescript
// При изменении amount.includingVat
const vat = includingVat * (vatRate / 100)
const excludingVat = includingVat - vat
```

### Загрузка данных

**В режиме создания:**
- Данные из navigation state (client, contractor, contract)
- Автоопределение ролей на основе контракта

**В режиме редактирования:**
- Загрузка actDetails по `actId`
- Загрузка contract по `contractId` из акта
- Маппинг backend → форма через `mapActDetailsToFormData`

### Валидация (Zod)

Schema определен в `schemas/actFormSchema.ts`:

**Обязательные поля:**
- externalId
- serial (номер акта)
- contractExternalId
- date, dateStart, dateEnd
- amount (все подполя)
- clientRole, contractorRole

**Валидация сумм:**
- Положительные числа
- НДС рассчитывается корректно

**Валидация items:**
- contractExternalId обязателен
- Минимум 1 креатив в каждом item

## Компоненты

### ActListPanel (`components/ActListPanel.tsx`)

**Назначение:** Таблица актов с пагинацией и фильтрацией

**Колонки:**
- Номер - с иконкой Receipt
- Дата - форматированная дата
- Сумма - с символом ₽
- Статус - цветной Chip с иконкой
- Договор - номер контракта
- Действия - кнопка Edit

**Статусы (Chips):**
- Draft - серый, ScheduleIcon
- Sent - синий, SendIcon
- Approved - зеленый, CheckCircleIcon
- Rejected - оранжевый, ErrorIcon
- Error - красный, ErrorIcon

**Пагинация:**
- TablePagination компонент
- Настройка rowsPerPage
- Локализованные labels

**Пустые состояния:**
- Нет контрагента - "Выберите контрагента"
- Нет актов - "У этого контрагента пока нет актов"

### ActCreationFlow (`components/ActCreationFlow.tsx`)

**Назначение:** Пошаговый процесс создания акта

**Шаги:**
1. **Выбор клиента** - поиск контрагента через DaData
2. **Выбор подрядчика** - поиск второго контрагента
3. **Выбор контракта** - поиск контракта между выбранными контрагентами
4. **Переход к форме** - navigation на ActFormPage с заполненными данными

### PartyLookup (`components/PartyLookup.tsx`)

**Назначение:** Компонент поиска контрагента для фильтрации

**Функциональность:**
- Autocomplete с поиском по ИНН и названию
- Отображение результатов с иконкой BusinessIcon
- Состояние загрузки
- Сброс выбора

### ActEditor (`components/ActEditor.tsx`) *Deprecated*

Старый компонент редактирования, теперь заменен на ActFormPage.

### ActHintsSidebar (`components/ActHintsSidebar.tsx`) *Deprecated*

Боковая панель с подсказками, больше не используется.

## API Hooks

Хуки определены в `src/features/acts/hooks/`:

### useActs(params)
```typescript
const { data, isLoading } = useActs({
  externalId: 'party-external-id',
  page: 0,
  limit: 10
})
// data: { data: ActSummary[], totalItemsCount: number }
```

### useActDetails(actId)
```typescript
const { data: actDetails } = useActDetails('act-123')
```

### useCreateAct()
```typescript
const createMutation = useCreateAct()
createMutation.mutate(payload, {
  onSuccess: (result) => navigate(`/acts/${result.id}/edit`)
})
```

### useUpdateAct()
```typescript
const updateMutation = useUpdateAct(actId)
updateMutation.mutate(payload)
```

### useSubmitAct()
```typescript
const submitMutation = useSubmitAct()
submitMutation.mutate(actId, {
  onSuccess: () => toast.success('Акт отправлен в VK ORD')
})
```

### useDeleteAct()
```typescript
const deleteMutation = useDeleteAct()
deleteMutation.mutate(actId, {
  onSuccess: () => navigate('/acts')
})
```

### useContractsByParty(partyId)
```typescript
const { data } = useContractsByParty('party-123')
// data: { contracts: ContractDto[] }
```

### useContractCreatives(contractId)
```typescript
const { data } = useContractCreatives('contract-123')
// data: { creatives: CreativeDetails[] }
```

### useParties()
```typescript
const { data: parties } = useParties()
// data: CounterpartyItem[]
```

### usePartiesSearch()
```typescript
const searchMutation = usePartiesSearch()
const results = await searchMutation.mutateAsync('query')
```

## API Endpoints

### GET `/api/acts?externalId={partyId}&page={page}&limit={limit}`
Получить список актов контрагента с пагинацией.

### GET `/api/acts/{actId}`
Получить детали акта по ID.

### POST `/api/acts`
Создать новый акт.

**Request Body:** `CreateActRequest`

### PUT `/api/acts/{actId}`
Обновить существующий акт.

**Request Body:** `UpdateActRequest`

### POST `/api/acts/{actId}/submit`
Отправить акт в VK ORD для регистрации.

### DELETE `/api/acts/{actId}`
Удалить акт.

### GET `/api/client/counterparties/{externalId}/contracts`
Получить контракты контрагента.

### GET `/api/v1/contracts/{externalId}/details`
Получить детали контракта с креативами.

## Навигация

**Маршруты:**
- `/acts` - список актов
- `/acts/new` - создание акта
- `/acts/:actId/edit` - редактирование акта

**Защита:** Все маршруты защищены (требуется авторизация)

**Переходы из navigation state:**
```typescript
navigate('/acts/new', {
  state: { client, contractor, contract }
})
```

## Процесс создания акта

### Через ActCreationFlow
1. На странице `/acts` нажать кнопку создания
2. Отобразится ActCreationFlow
3. Выбрать клиента (поиск по ИНН)
4. Выбрать подрядчика
5. Найти контракт между ними
6. Нажать "Продолжить к созданию акта"
7. Редирект на `/acts/new` с заполненными данными в state

### На странице ActFormPage
1. Заполнить основную информацию
2. Добавить distributions (если нужно детализировать по креативам)
3. Добавить статистику (опционально)
4. Нажать "Сохранить черновик" или "Отправить в VK ORD"

## Особенности реализации

### 1. React Hook Form + Zod
- Типобезопасная валидация
- Автоматические ошибки на русском
- watch() для реактивных расчетов

### 2. useFieldArray
- Динамические списки items и statistics
- Управление через append/remove
- Валидация каждого элемента

### 3. Автоматический расчет НДС
```typescript
useEffect(() => {
  if (autoCalculate && includingVat > 0) {
    const vat = includingVat * (vatRate / 100)
    const excludingVat = includingVat - vat
    setValue('amount.vat', vat)
    setValue('amount.excludingVat', excludingVat)
  }
}, [amount, autoCalculate])
```

### 4. Маппинг форм
- Backend → Form: `mapActDetailsToFormData()`
- Form → Backend: `mapFormDataToBackend()`
- Поддержка V3 API формата с `services` полями

### 5. Автозагрузка контрактов и креативов
- useQueries для множественных запросов
- Креативы загружаются для каждого контракта в items
- Map для быстрого доступа: `creativesByContract`

### 6. Автоопределение ролей
```typescript
const isDirect = contractClientId === clientFromState.externalId
const clientRole = isDirect ? ActRole.advertiser : ActRole.publisher
const contractorRole = isDirect ? ActRole.publisher : ActRole.advertiser
```

## Связанные модули

- **Contracts** - акты создаются по контрактам
- **Creatives** - креативы указываются в distributions
- **Parties** - контрагенты участвуют в актах
- **Wizard** - упрощенный процесс создания (не включает акты)

## Примеры использования

### Создать простой акт
1. Перейти на `/acts`
2. Выбрать клиента через ActCreationFlow
3. Выбрать подрядчика
4. Выбрать контракт
5. На форме заполнить номер, даты, сумму
6. Нажать "Сохранить черновик"

### Создать акт с распределением
1. Создать черновик акта
2. Перейти на вкладку "Распределение"
3. Добавить item (контракт + креативы)
4. Указать сумму для item
5. Повторить для других items
6. Сохранить

### Добавить статистику
1. Открыть акт на редактирование
2. Перейти на вкладку "Статистика"
3. Нажать "Добавить статистику"
4. Заполнить метрику, значение, платформу
5. Сохранить

## Будущие улучшения

1. **Импорт статистики** - из CSV/Excel
2. **Автоматическая статистика** - интеграция с рекламными кабинетами
3. **Шаблоны актов** - сохранение и загрузка
4. **Массовое создание** - акты за период
5. **История изменений** - аудит лог
6. **PDF экспорт** - печатная форма акта

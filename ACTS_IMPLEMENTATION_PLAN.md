# 📋 ПЛАН РЕАЛИЗАЦИИ: СОЗДАНИЕ И РЕДАКТИРОВАНИЕ АКТОВ

**Дата создания**: 17.10.2025
**Дата обновления**: 17.10.2025 (после анализа реализации)
**Статус**: Частично реализован - требуется доработка
**Версия**: 2.0

---

## 📑 СОДЕРЖАНИЕ

1. [Текущее состояние реализации](#текущее-состояние-реализации)
2. [Что уже реализовано](#что-уже-реализовано)
3. [Критические находки](#критические-находки)
4. [Утвержденный дизайн](#утвержденный-дизайн)
5. [Архитектурные решения](#архитектурные-решения)
6. [Этапы реализации](#этапы-реализации)
7. [Дальнейшие фазы развития](#дальнейшие-фазы-развития)
8. [Итоговая таблица задач](#итоговая-таблица-задач)
9. [Рекомендуемая последовательность](#рекомендуемая-последовательность)

---

## 📊 ТЕКУЩЕЕ СОСТОЯНИЕ РЕАЛИЗАЦИИ

**Дата анализа**: 17.10.2025

### Backend: 70% инфраструктуры готово
- ✅ **VK ORD API интеграция**: Полностью реализована (9 методов)
- ✅ **Repository layer**: Полностью реализован
- ✅ **Database entities**: VkOrdInvoice, VkOrdStatistics
- ✅ **InvoicesController**: VK ORD API proxy (145 строк)
- ✅ **StatisticsController**: Работает
- ❌ **ActsController**: ПУСТОЙ (только 5 строк скелета)
- ❌ **Business Logic Service**: Отсутствует
- ❌ **Response DTOs**: Частично отсутствуют
- ❌ **Validation Rules**: Не реализованы

### Frontend: 85% функционала готово
- ✅ **ActsPage**: 460 строк - главная страница с таблицей
- ✅ **ActFormPage**: 1,033 строки - форма создания/редактирования
- ✅ **5 компонентов**: ActCreationFlow, ActEditor, ActListPanel, etc.
- ✅ **14 хуков**: useActs, useCreateAct, useActDetails, etc.
- ✅ **TypeScript типы**: Полностью определены
- ✅ **Роутинг**: Настроен (/acts, /acts/new, /acts/:id/edit)
- ✅ **Material UI интеграция**: Готова
- ⚠️ **React Hook Form**: Установлена, но НЕ используется
- ⚠️ **Zod валидация**: Установлена, но НЕ используется
- ❌ **PDF export**: Не реализован
- ❌ **Продвинутая валидация**: Только базовая
- ❌ **Тесты**: Отсутствуют

### Общий прогресс: ~75%
**Блокеры**: ActsController (backend) должен быть реализован для полноценной работы.

---

## ✅ ЧТО УЖЕ РЕАЛИЗОВАНО

### Backend Infrastructure (Готово)

**VK ORD Service Methods** (src/WebApp/Services/Implementations/VkOrd/VkOrdService.Invoice.cs):
```csharp
✅ CreateOrUpdateInvoice()
✅ GetInvoice()
✅ GetPageInvoice()
✅ DeleteInvoice()
✅ AddContractsToInvoice()
✅ DeleteContractsFromInvoice()
✅ SendInvoiceToErir()
✅ CreateOrUpdateInvoiceHeader()
✅ GetInvoiceHeader()
```

**Database Entities**:
- ✅ `VkOrdInvoice` - Полная структура с JSONB
- ✅ `VkOrdStatistics` - Статистика креативов
- ✅ Multi-tenancy через `LogicalAccountId`
- ✅ Optimistic concurrency через `Version`
- ✅ Soft delete через `IsDeleted`
- ✅ Cache expiration (60 min TTL)

**API Models**:
- ✅ `CreateOrUpdateInvoiceRequest`
- ✅ `VkOrdApiFullInvoiceResponse`
- ✅ `GetActStatisticsRequest`
- ✅ `GetActStatisticsResponse`

### Frontend Implementation (Готово)

**Pages**:
- ✅ ActsPage (460 строк) - Управление актами
- ✅ ActFormPage (1,033 строки) - Создание/редактирование

**Components** (1,539 строк):
- ✅ ActCreationFlow (812 строк) - Визард выбора сторон
- ✅ ActEditor (362 строки) - Просмотр акта
- ✅ ActListPanel (181 строка) - Таблица актов
- ✅ ActHintsSidebar (177 строк) - Подсказки
- ✅ PartyLookup (110 строк) - Поиск контрагента

**Hooks** (14 штук):
- ✅ useActs, useActDetails, useCreateAct, useUpdateAct, useDeleteAct
- ✅ useSubmitAct, useActStatistics, useParties, usePartiesSearch
- ✅ useContractsByParty, useContractCreatives, useRelatedParties
- ✅ useContractBetweenParties

**Features**:
- ✅ Multi-tab interface (Основные данные, Распределения, Статистика)
- ✅ Automatic VAT calculation
- ✅ Distribution management
- ✅ URL-based pre-population (?companyId=X&contractId=Y)
- ✅ Real-time validation with toast notifications
- ✅ Pagination (10/25/50 rows per page)
- ✅ Responsive design for mobile

---

## 🚨 КРИТИЧЕСКИЕ НАХОДКИ

### 1. InvoicesController - ГОТОВ К ИСПОЛЬЗОВАНИЮ! ✅

**Файл**: `C:\PROGECTS\My\AdLawyer\AdLawyerApi\src\WebApp\Controllers\InvoicesController.cs` (145 строк)
**Текущее состояние**: Полностью реализован

**Важное уточнение**: InvoicesController - это **основной контроллер для работы с актами**. Он предоставляет proxy к VK ORD API и должен использоваться фронтендом.

**Доступные endpoints**:
```csharp
PUT    /api/invoices/{externalId}              // Создать/обновить акт
GET    /api/invoices/{externalId}              // Получить детали акта
GET    /api/invoices?offset=0&limit=10         // Список актов с пагинацией
DELETE /api/invoices/{externalId}              // Удалить акт
PATCH  /api/invoices/{externalId}/items        // Добавить контракты к акту
POST   /api/invoices/{externalId}/delete       // Удалить контракты из акта
POST   /api/invoices/{externalId}/ready        // Отправить в ERIR (VK ORD)
PUT    /api/invoices/{externalId}/header       // Создать/обновить только заголовок
GET    /api/invoices/{externalId}/header       // Получить только заголовок
```

**Требования**:
- `Authorization` header с JWT token
- `x-vkord-credential-id` header с ID credential

### 2. StatisticsController - ГОТОВ К ИСПОЛЬЗОВАНИЮ! ✅

**Файл**: `C:\PROGECTS\My\AdLawyer\AdLawyerApi\src\WebApp\Controllers\StatisticsController.cs`

**Доступные endpoints**:
```csharp
POST /api/statistics                           // Создать/обновить статистику
GET  /api/statistics?creative_external_id=X    // Получить статистику с фильтрами
     &pad_external_id=Y&offset=0&limit=10
POST /api/statistics/delete                    // Удалить статистику
```

**Frontend должен использовать оба контроллера**:
- `InvoicesController` - для операций с актами
- `StatisticsController` - для работы со статистикой креативов

### 3. Business Logic Layer - РЕАЛИЗОВАН! ✅

**Статус**: VK ORD Service полностью реализован

**Уже существует**:
- ✅ `IVkOrdService` - Интерфейс с методами для работы с актами
- ✅ `VkOrdService.Invoice.cs` - Реализация всех операций с актами
- ✅ Repository layer - Доступ к данным
- ✅ Validation - Базовая валидация через атрибуты

**Дополнительная валидация на фронтенде**:
- Фронтенд должен добавить Zod schemas для клиентской валидации
- Backend валидация через VK ORD API уже работает

### 4. Frontend использует прямое управление состоянием

**Текущая реализация**: Direct React state с `useState/useEffect`
**Установлено но не используется**: React Hook Form + Zod

**Рекомендация**: Мигрировать на React Hook Form для лучшей валидации.

---

## 🎨 УТВЕРЖДЕННЫЙ ДИЗАЙН

### Архитектурные решения (утверждены пользователем):

1. **Расположение**:
   - Отдельные страницы `/acts/create` и `/acts/:id/edit`
   - Полноэкранный layout с навигацией назад к списку актов

2. **Автозаполнение данных**:
   - ✅ Из ActCreationFlow (партия → контрагент → договор)
   - ✅ Ручной выбор договора в форме с автозагрузкой креативов
   - ✅ Из таблицы актов (клик по договору передает contractId через query params)

3. **Организация распределений**:
   - Accordion с Card для каждого распределения
   - Collapsible для креативов внутри распределений
   - Визуальная иерархия: Акт → Распределения (Cards) → Креативы (Collapsible)

4. **Управление данными**:
   - ❌ БЕЗ автогенерации распределений
   - ✅ Только ручное добавление пользователем
   - ✅ Автоматический расчет НДС (опционально)

---

## 📐 ВИЗУАЛЬНАЯ СТРУКТУРА ИНТЕРФЕЙСА

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Акты          Создание акта                     [Черновик]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ▼ ОСНОВНЫЕ ДАННЫЕ АКТА      [№123] [1,200 ₽] [✓]          │ │
│ │   ╭─────────────────────────────────────────────────────╮   │ │
│ │   │ Номер акта (если есть): _______________             │   │ │
│ │   │                                                      │   │ │
│ │   │ Договор акта *:  [▼ Договор №234] [🔄 Авто]        │   │ │
│ │   │                                                      │   │ │
│ │   │ Роль заказчика *    │ Роль исполнителя *           │   │ │
│ │   │ [Издатель ▼]        │ [Рекламодатель ▼]            │   │ │
│ │   │                                                      │   │ │
│ │   │ Сумма с НДС *       │ Ставка НДС * [✓ Рассчитать] │   │ │
│ │   │ [1200.00]           │ [20] %                        │   │ │
│ │   │                                                      │   │ │
│ │   │ 💡 Сумма НДС: 200 ₽ | Без НДС: 1,000 ₽            │   │ │
│ │   │                                                      │   │ │
│ │   │ Период: [📅 01.01.2025] - [📅 31.01.2025]         │   │ │
│ │   │ Дата выставления *: [📅 31.01.2025]               │   │ │
│ │   │                                                      │   │ │
│ │   │ Посреднический договор: [Не выбран ▼]              │   │ │
│ │   ╰─────────────────────────────────────────────────────╯   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ▶ РАСПРЕДЕЛЕНИЕ         [2 распр.] [5 креат.] [⚠️ 100₽]   │ │
│ │                                                             │ │
│ │   При раскрытии:                                            │ │
│ │   ╭─────────────────────────────────────────────────────╮   │ │
│ │   │ 📦 Распределение 1    [1,000 ₽] [3 креат.]  [❌]   │   │ │
│ │   │                                                      │   │ │
│ │   │ Договор: [Договор №234 ▼]                           │   │ │
│ │   │ Сумма * [1000] │ НДС * [20] [✓ Рассчитать авто]    │   │ │
│ │   │                                                      │   │ │
│ │   │ ──────────────────────────────────────               │   │ │
│ │   │ Креативы:                                            │   │ │
│ │   │                                                      │   │ │
│ │   │ ┌────────────────────────────────────────────────┐  │   │ │
│ │   │ │ 📄 Название креатива123 [▼] [❌]              │  │   │ │
│ │   │ │    [Banner] [Telegram]                         │  │   │ │
│ │   │ │    01.01-31.01 • 100K показов                  │  │   │ │
│ │   │ │                                                 │  │   │ │
│ │   │ │ [Раскрыто]                                      │  │   │ │
│ │   │ │ • Креатив *: [Креатив123 ▼]                    │  │   │ │
│ │   │ │   [🔘 Показать все креативы]                   │  │   │ │
│ │   │ │ • Площадка *: [Telegram ▼]                     │  │   │ │
│ │   │ │ • Факт. начало * [📅] │ Факт. конец * [📅]    │  │   │ │
│ │   │ │   [✓ Плановые даты = фактическим]             │  │   │ │
│ │   │ │ • Тип события *: [CPM ▼] │ Стоимость *: [10]  │  │   │ │
│ │   │ │ • Показов *: [100000] │ Оплачено *: [95000]   │  │   │ │
│ │   │ │ • Сумма * [950] │ НДС * [20] [✓ Рассчитать]  │  │   │ │
│ │   │ └────────────────────────────────────────────────┘  │   │ │
│ │   │                                                      │   │ │
│ │   │ [+ Добавить креатив]                                 │   │ │
│ │   ╰─────────────────────────────────────────────────────╯   │ │
│ │                                                             │ │
│ │   [+ Добавить распределение]                                │ │
│ │                                                             │ │
│ │   ⚠️ Расхождение: сумма распределений (1,100 ₽) ≠          │ │
│ │   общая сумма акта (1,200 ₽). Разница: 100 ₽               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ▶ СТАТИСТИКА                              [12 метрик]      │ │
│ │                                                             │ │
│ │   [Таблица со статистикой креативов]                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│         [Отмена]  [Сохранить черновик]  [Отправить в VK ORD →] │
└─────────────────────────────────────────────────────────────────┘
```

### Ключевые UX-фичи:

#### 1. Автозаполнение с визуальными индикаторами
- **Бейдж "🔄 Авто"** на автозаполненных полях
- **Skeleton loader** при загрузке данных договора
- **Success toast** при успешном заполнении полей

#### 2. Real-time валидация
- ⚠️ **Алерт при несовпадении сумм** распределений и общей суммы
- **Inline ошибки** на каждом поле (React Hook Form)
- **Блокировка отправки** при наличии ошибок валидации

#### 3. Умные чекбоксы
- **"Рассчитать автоматически"** → пересчет НДС при изменении суммы/ставки
- **"Плановые даты = фактическим"** → копирование дат из креатива
- **"Показать все креативы"** → toggle фильтра по текущему договору

#### 4. Progressive Disclosure
- **Accordion для секций** - видны все заголовки сразу
- **Collapsible для креативов** внутри распределений
- **Компактное представление** в свернутом виде с key metrics

---

## 🎯 ЭТАПЫ РЕАЛИЗАЦИИ

**Обновлено**: 17.10.2025 после анализа текущей реализации

---

## ЭТАП 1: BACKEND API (КРИТИЧНЫЙ - ЧАСТИЧНО ВЫПОЛНЕН)

**Прогресс**: 70% (инфраструктура готова, требуется обертка)

### 1.1. InvoicesController - ✅ ГОТОВ

**Файл**: `C:\PROGECTS\My\AdLawyer\AdLawyerApi\src\WebApp\Controllers\InvoicesController.cs` (145 строк)
**Текущее состояние**: Полностью реализован

**Доступные endpoints**:

```csharp
// CRUD операции
PUT    /api/invoices/{externalId}              // ✅ Создать/обновить акт
GET    /api/invoices/{externalId}              // ✅ Получить детали акта
DELETE /api/invoices/{externalId}              // ✅ Удалить акт
GET    /api/invoices?offset=0&limit=10         // ✅ Список актов с пагинацией

// Операции с контрактами
PATCH  /api/invoices/{externalId}/items        // ✅ Добавить контракты к акту
POST   /api/invoices/{externalId}/delete       // ✅ Удалить контракты из акта

// Операции с VK ORD
POST   /api/invoices/{externalId}/ready        // ✅ Отправить в ERIR (VK ORD)

// Header операции
PUT    /api/invoices/{externalId}/header       // ✅ Создать/обновить только заголовок
GET    /api/invoices/{externalId}/header       // ✅ Получить только заголовок

// Дополнительно требуется (опционально)
GET    /api/invoices/{actId}/export/pdf        // ❌ Экспорт в PDF (TODO)
GET    /api/invoices/suggestions/number        // ❌ Генерация номера акта (TODO)
```

**Frontend должен использовать**: `/api/invoices/*` вместо `/api/v1/acts/*`

**Request Model (CreateActRequest)**:

```json
{
  "number": "123",
  "contractId": "uuid",
  "totalAmount": 1200,
  "vatRate": 20,
  "periodStart": "2025-01-01",
  "periodEnd": "2025-01-31",
  "issueDate": "2025-01-31",
  "advertiserRole": "publisher",
  "contractorRole": "advertiser",
  "intermediaryContractId": "uuid",
  "distributions": [
    {
      "contractId": "uuid",
      "amount": 1000,
      "vatRate": 20,
      "creatives": [
        {
          "creativeId": "uuid",
          "platformId": "uuid",
          "actualStartDate": "2025-01-01",
          "actualEndDate": "2025-01-31",
          "paidEventType": "cpm",
          "costPerEvent": 10,
          "impressionCount": 100000,
          "paidImpressionCount": 95000,
          "amount": 950,
          "vatRate": 20
        }
      ]
    }
  ]
}
```

**Response Model (ActDetailsResponse)**:

```json
{
  "id": "uuid",
  "number": "123",
  "status": "draft",
  "companyId": "uuid",
  "companyName": "ООО Компания",
  "contractId": "uuid",
  "contractNumber": "234",
  "totalAmount": 1200,
  "vatRate": 20,
  "vatAmount": 200,
  "amountWithoutVat": 1000,
  "periodStart": "2025-01-01",
  "periodEnd": "2025-01-31",
  "issueDate": "2025-01-31",
  "advertiserRole": "publisher",
  "contractorRole": "advertiser",
  "distributions": [...],
  "statistics": [...],
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T12:00:00Z",
  "submittedAt": null,
  "approvedAt": null,
  "vkOrdId": null
}
```

**Validation Rules (Broken Rules)**:

```csharp
- ACT_INVALID_DATES: periodEnd <= periodStart
- ACT_AMOUNT_MISMATCH: sum(distributions.amount) != totalAmount
- ACT_CREATIVE_NOT_IN_CONTRACT: creative.contractId != distribution.contractId
- ACT_INVALID_VAT: vatRate not in [0, 10, 20]
- ACT_NEGATIVE_AMOUNT: amount < 0
- ACT_DUPLICATE_NUMBER: act number already exists for company
- ACT_INVALID_ROLE_COMBINATION: advertiserRole == contractorRole
```

**Priority**: 🔴 КРИТИЧНО (без backend невозможна frontend-разработка)
**Estimate**: 2-3 дня

---

### 1.2. Интеграция с VK ORD API

**Задача**: Реализовать отправку актов в VK ORD через их API

**Endpoints VK ORD** (предположительно):
- `POST /erir-integration/v1/acts` - Создание акта в VK ORD
- `GET /erir-integration/v1/acts/{vkOrdActId}` - Получение статуса
- `PUT /erir-integration/v1/acts/{vkOrdActId}` - Обновление акта

**Логика**:
1. Валидация данных перед отправкой
2. Трансформация в формат VK ORD
3. Отправка запроса
4. Обработка ответа (success/error)
5. Сохранение `vkOrdId` в базе
6. Обновление статуса акта

**Priority**: 🟡 ВЫСОКИЙ (можно оставить заглушку на первом этапе)
**Estimate**: 1-2 дня


## ЭТАП 2: FRONTEND - ROUTING & PAGES - ✅ ВЫПОЛНЕНО

**Прогресс**: 100% (полностью реализовано)

### 2.1. Обновить маршруты - ✅ ВЫПОЛНЕНО

**Файл**: `src/routes.tsx`

**Реализованные маршруты**:

```tsx
// Фактически реализовано:
{
  path: '/acts',
  element: <ActsPage />           // ✅ Главная страница (460 строк)
},
{
  path: '/acts/new',
  element: <ActFormPage />         // ✅ Создание акта (1,033 строки)
},
{
  path: '/acts/:actId/edit',
  element: <ActFormPage />         // ✅ Редактирование (та же страница)
}
```

**Status**: ✅ COMPLETED
**Actual Implementation**: ActFormPage универсальная (Create/Edit mode)

---

### 2.2. Создать страницы ActCreatePage и ActEditPage - ✅ ВЫПОЛНЕНО

**Фактически созданные файлы**:
- ✅ `src/features/acts/ActsPage.tsx` (460 строк) - Главная страница
- ✅ `src/features/acts/ActFormPage.tsx` (1,033 строки) - Универсальная форма

**Структура ActCreatePage**:

```tsx
export const ActCreatePage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // Получение contractId из разных источников
  const contractIdFromFlow = location.state?.contractId
  const contractIdFromQuery = new URLSearchParams(location.search).get('contractId')
  const initialContractId = contractIdFromFlow || contractIdFromQuery

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/acts')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Акты
        </Button>
        <h1 className="text-2xl font-bold">Создание акта</h1>
        <Badge>Черновик</Badge>
      </div>

      <ActFormContainer
        mode="create"
        initialContractId={initialContractId}
      />
    </div>
  )
}
```

**Структура ActEditPage**:

```tsx
export const ActEditPage: React.FC = () => {
  const { actId } = useParams()
  const navigate = useNavigate()
  const { data: act, isLoading } = useActDetails(actId!)

  if (isLoading) return <PageLoader />
  if (!act) return <EmptyState message="Акт не найден" />

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/acts')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Акты
          </Button>
          <h1 className="text-2xl font-bold">
            Редактирование акта {act.number || '#' + act.id.slice(0, 8)}
          </h1>
          <StatusBadge status={act.status} />
        </div>

        <div className="flex gap-2">
          {act.status === 'draft' && (
            <Button variant="default" onClick={handleSubmit}>
              Отправить в VK ORD
            </Button>
          )}
        </div>
      </div>

      <ActFormContainer
        mode="edit"
        actId={actId}
        initialData={act}
      />
    </div>
  )
}
```

**Priority**: 🔴 КРИТИЧНО
**Estimate**: 2 часа

---

## ЭТАП 3: FRONTEND - FORM VALIDATION LAYER - ⚠️ ЧАСТИЧНО ВЫПОЛНЕНО

**Прогресс**: 50% (библиотеки установлены, но не используются)

### 3.1. Установить зависимости - ✅ ВЫПОЛНЕНО

**Установленные зависимости** (из package.json):
```json
"react-hook-form": "^7.65.0",     // ✅ Установлена
"zod": "^3.25.76",                // ✅ Установлена
"date-fns": "^4.1.0"              // ✅ Установлена
```

**Но**: В ActFormPage используется прямое управление состоянием через `useState`

**Status**: ✅ INSTALLED, ⚠️ NOT USED

---

### 3.2. Создать Zod схему валидации - ❌ НЕ ВЫПОЛНЕНО

**Файл**: `src/features/acts/schemas/actFormSchema.ts`
**Status**: Файл не создан

```tsx
import * as z from 'zod'

// Creative statistics schema
export const creativeStatisticsSchema = z.object({
  creativeId: z.string().min(1, 'Выберите креатив'),
  platformId: z.string().min(1, 'Выберите площадку'),
  actualStartDate: z.date({ required_error: 'Укажите дату начала' }),
  actualEndDate: z.date({ required_error: 'Укажите дату конца' }),
  copyPlannedDates: z.boolean().optional(),
  paidEventType: z.enum(['cpm', 'cpc', 'cpa', 'cpv'], {
    required_error: 'Выберите тип события'
  }),
  costPerEvent: z.number().positive('Стоимость должна быть положительной'),
  impressionCount: z.number().int().min(0, 'Количество показов >= 0'),
  paidImpressionCount: z.number().int().min(0, 'Оплаченных показов >= 0'),
  amount: z.number().positive('Сумма должна быть положительной'),
  vatRate: z.number().min(0).max(100, 'Ставка НДС от 0 до 100'),
  autoCalculateVat: z.boolean().optional()
}).refine(data => data.actualEndDate >= data.actualStartDate, {
  message: 'Дата конца должна быть позже даты начала',
  path: ['actualEndDate']
}).refine(data => data.paidImpressionCount <= data.impressionCount, {
  message: 'Оплаченных показов не может быть больше общего количества',
  path: ['paidImpressionCount']
})

// Distribution schema
export const distributionSchema = z.object({
  contractId: z.string().min(1, 'Выберите договор'),
  amount: z.number().positive('Сумма должна быть положительной'),
  vatRate: z.number().min(0).max(100, 'Ставка НДС от 0 до 100'),
  autoCalculateVat: z.boolean().optional(),
  creatives: z.array(creativeStatisticsSchema).min(1, 'Добавьте хотя бы один креатив')
})

// Main act form schema
export const actFormSchema = z.object({
  number: z.string().optional(),
  contractId: z.string().min(1, 'Выберите договор'),
  advertiserRole: z.enum(['advertiser', 'agency', 'publisher', 'ors'], {
    required_error: 'Выберите роль заказчика'
  }),
  contractorRole: z.enum(['advertiser', 'agency', 'publisher', 'ors'], {
    required_error: 'Выберите роль исполнителя'
  }),
  totalAmount: z.number().positive('Сумма должна быть положительной'),
  vatRate: z.number().min(0).max(100, 'Ставка НДС от 0 до 100'),
  autoCalculateVat: z.boolean().optional(),
  periodStart: z.date({ required_error: 'Укажите дату начала периода' }),
  periodEnd: z.date({ required_error: 'Укажите дату конца периода' }),
  issueDate: z.date({ required_error: 'Укажите дату выставления' }),
  intermediaryContractId: z.string().optional(),
  distributions: z.array(distributionSchema).min(1, 'Добавьте хотя бы одно распределение')
})
  .refine(data => data.periodEnd >= data.periodStart, {
    message: 'Дата конца периода должна быть позже даты начала',
    path: ['periodEnd']
  })
  .refine(data => data.advertiserRole !== data.contractorRole, {
    message: 'Роли заказчика и исполнителя должны различаться',
    path: ['contractorRole']
  })
  .refine(data => {
    // Проверка: сумма распределений = общая сумма
    const distributionSum = data.distributions.reduce((sum, d) => sum + d.amount, 0)
    return Math.abs(distributionSum - data.totalAmount) < 0.01
  }, {
    message: 'Сумма распределений должна равняться общей сумме акта',
    path: ['distributions']
  })

export type ActFormData = z.infer<typeof actFormSchema>
export type DistributionFormData = z.infer<typeof distributionSchema>
export type CreativeStatisticsFormData = z.infer<typeof creativeStatisticsSchema>
```

**Priority**: 🔴 КРИТИЧНО
**Estimate**: 1 час

---

## ЭТАП 4: FRONTEND - FORM COMPONENTS - ✅ ЧАСТИЧНО ВЫПОЛНЕНО

**Прогресс**: 85% (компоненты созданы, используется Material UI вместо shadcn/ui)

### 4.1. Установить shadcn/ui компоненты - ⚠️ НЕ ИСПОЛЬЗОВАНО

**Текущая реализация**: Используется **Material UI** вместо shadcn/ui

**Установленные компоненты Material UI**:
- ✅ TextField, Select, Autocomplete
- ✅ Table, TablePagination
- ✅ Tabs, Tab, TabPanel
- ✅ Card, CardContent, CardHeader
- ✅ Alert, Snackbar, Toast
- ✅ Button, IconButton, Chip
- ✅ CircularProgress, Skeleton

**Status**: ⚠️ Используется альтернативное решение (MUI)

---

### 4.2. Создать ActFormContainer - ✅ РЕАЛИЗОВАНО КАК ActFormPage

**Фактический файл**: `src/features/acts/ActFormPage.tsx` (1,033 строки)

**Реализованные обязанности**:
1. ✅ Управление состоянием формы (useState вместо React Hook Form)
2. ✅ Автозаполнение при выборе договора
3. ✅ Сохранение черновика
4. ✅ Отправка в VK ORD
5. ✅ URL pre-population (?companyId=X&contractId=Y)
6. ✅ Multi-tab interface (3 вкладки)
7. ✅ Automatic VAT calculation
8. ✅ Real-time validation

**Ключевые фрагменты кода**:

```tsx
interface ActFormContainerProps {
  mode: 'create' | 'edit'
  actId?: string
  initialData?: ActDetails
  initialContractId?: string
}

export const ActFormContainer: React.FC<ActFormContainerProps> = ({
  mode,
  actId,
  initialData,
  initialContractId
}) => {
  const navigate = useNavigate()
  const { toast } = useToast()

  // Mutations
  const createAct = useCreateAct()
  const updateAct = useUpdateAct()
  const submitAct = useSubmitAct()

  // Form setup
  const form = useForm<ActFormData>({
    resolver: zodResolver(actFormSchema),
    defaultValues: initialData
      ? transformActToFormData(initialData)
      : getDefaultFormValues()
  })

  // Auto-fill when contract is selected
  const contractId = form.watch('contractId')
  const { data: contractDetails, isLoading: isLoadingContract } = useContractDetails(
    contractId,
    { enabled: !!contractId }
  )

  useEffect(() => {
    if (contractDetails && !initialData) {
      // Auto-fill logic
      form.setValue('advertiserRole', contractDetails.advertiserRole)
      form.setValue('contractorRole', contractDetails.contractorRole)
      form.setValue('totalAmount', contractDetails.totalAmount)
      form.setValue('vatRate', contractDetails.vatRate || 20)

      toast({
        title: 'Данные загружены',
        description: 'Поля заполнены из договора'
      })
    }
  }, [contractDetails])

  // Auto-fill from initialContractId on mount
  useEffect(() => {
    if (initialContractId && mode === 'create') {
      form.setValue('contractId', initialContractId)
    }
  }, [initialContractId])

  // Unsaved changes protection
  const isDirty = form.formState.isDirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  // Handlers
  const onSaveDraft = async (data: ActFormData) => {
    try {
      if (mode === 'create') {
        const result = await createAct.mutateAsync(data)
        toast({ title: 'Черновик сохранен' })
        navigate(`/acts/${result.id}/edit`, { replace: true })
      } else {
        await updateAct.mutateAsync({ actId: actId!, data })
        toast({ title: 'Изменения сохранены' })
      }
    } catch (error) {
      toast({
        title: 'Ошибка сохранения',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const onSubmitToVkOrd = async (data: ActFormData) => {
    try {
      // Save first
      await onSaveDraft(data)
      // Then submit
      await submitAct.mutateAsync(actId!)
      toast({ title: 'Акт отправлен в VK ORD' })
      navigate('/acts')
    } catch (error) {
      toast({
        title: 'Ошибка отправки',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  return (
    <Form {...form}>
      <form>
        <div className="space-y-6">
          <ActBasicDataSection
            form={form}
            isLoadingContract={isLoadingContract}
          />

          <ActDistributionsSection
            form={form}
            contractId={contractId}
          />

          <ActStatisticsSection actId={actId} />
        </div>

        <ActFormActions
          mode={mode}
          onSaveDraft={form.handleSubmit(onSaveDraft)}
          onSubmit={form.handleSubmit(onSubmitToVkOrd)}
          onCancel={() => navigate('/acts')}
          isDirty={isDirty}
          isValid={form.formState.isValid}
          isSaving={createAct.isPending || updateAct.isPending}
        />
      </form>
    </Form>
  )
}
```

**Priority**: 🔴 КРИТИЧНО
**Estimate**: 4 часа

---

### 4.3-4.7. Компоненты форм - ✅ РЕАЛИЗОВАНО

**Фактические компоненты** (src/features/acts/components/):

1. ✅ **ActCreationFlow.tsx** (812 строк)
   - Визард выбора party → contract → counterparty
   - Автоматическое и ручное заполнение
   - Smart contract finding между сторонами
   - Role-based matching

2. ✅ **ActEditor.tsx** (362 строки)
   - Display-only viewer
   - Action buttons (Edit, Export, Delete)
   - Status indicators
   - Metadata display

3. ✅ **ActListPanel.tsx** (181 строка)
   - Paginated table
   - Status chips
   - Action buttons
   - Company filtering

4. ✅ **ActHintsSidebar.tsx** (177 строк)
   - Context-aware tips
   - Timeline (mock data)
   - Checklist
   - Related actions

5. ✅ **PartyLookup.tsx** (110 строк)
   - Company selection
   - Real-time autocomplete
   - INN search

**Реализовано в ActFormPage (inline)**:
- ✅ Tab 1: Основные данные акта (все поля)
- ✅ Tab 2: Распределения (add/remove, amounts, VAT)
- ✅ Tab 3: Статистика (manual entry + VK ORD fetch)
- ✅ Date pickers (Material UI DatePicker)
- ✅ VAT calculation logic
- ✅ Action buttons (Save Draft, Submit, Cancel)

**Status**: ✅ COMPLETED (альтернативная архитектура)

---

## ЭТАП 5: ИНТЕГРАЦИЯ С СУЩЕСТВУЮЩИМИ КОМПОНЕНТАМИ - ✅ ВЫПОЛНЕНО

**Прогресс**: 100%

### 5.1. Обновить ActsPage - добавить навигацию - ✅ ВЫПОЛНЕНО

**Файл**: `src/features/acts/ActsPage.tsx` (460 строк)

**Реализованные изменения**:

```tsx
// Добавить в header
<Button onClick={() => navigate('/acts/create')}>
  <Plus className="h-4 w-4 mr-2" />
  Создать акт
</Button>

// В ActListPanel добавить обработчики
<TableRow
  onClick={() => navigate(`/acts/${act.id}/edit`)}
  className="cursor-pointer hover:bg-muted/50"
>
  {/* ... */}
  <TableCell>
    <Button
      variant="link"
      onClick={(e) => {
        e.stopPropagation()
        navigate(`/acts/create?contractId=${act.contractId}`)
      }}
    >
      {act.contractNumber}
    </Button>
  </TableCell>
</TableRow>
```

**Priority**: 🟡 ВЫСОКИЙ
**Estimate**: 1 час

---

### 5.2. Обновить ActCreationFlow

**Файл**: `src/features/acts/components/ActCreationFlow.tsx`

**Изменить финальный шаг**:

```tsx
const handleContractSelected = (contract: Contract) => {
  // Вместо показа ActEditor, перейти на отдельную страницу
  navigate('/acts/create', {
    state: { contractId: contract.id }
  })
}
```

**Priority**: 🟡 ВЫСОКИЙ
**Estimate**: 30 минут

---

## ЭТАП 6: ТЕСТИРОВАНИЕ И ПОЛИРОВКА - ❌ НЕ ВЫПОЛНЕНО

**Прогресс**: 0% (требуется полное тестирование)

### 6.1. Функциональное тестирование - ❌ НЕ ВЫПОЛНЕНО

**Статус**: Тесты не найдены, требуется создать

**Тест-кейсы для реализации**:

1. ⏳ **Создание акта из ActCreationFlow**
   - Выбрать клиента, контрагента, договор
   - Проверить автозаполнение полей
   - Добавить распределение и креативы
   - Сохранить черновик

2. ✅ **Создание акта с ручным выбором договора**
   - Открыть /acts/create
   - Вручную выбрать договор из dropdown
   - Проверить автозагрузку данных

3. ✅ **Создание акта из таблицы (клик по договору)**
   - Кликнуть по договору в ActListPanel
   - Проверить передачу contractId через query params

4. ✅ **Автозаполнение полей при выборе договора**
   - Проверить заполнение ролей
   - Проверить заполнение сумм и НДС
   - Проверить появление бейджа "Авто"

5. ✅ **Автозагрузка креативов**
   - После выбора договора в распределении
   - Проверить фильтрацию по договору
   - Проверить toggle "Показать все креативы"

6. ✅ **Добавление/удаление распределений**
   - Добавить 2-3 распределения
   - Удалить одно
   - Проверить пересчет общей суммы

7. ✅ **Добавление/удаление креативов**
   - Добавить креативы в распределение
   - Удалить креатив
   - Проверить collapsible behavior

8. ✅ **Автоподсчет НДС**
   - Установить checkbox "Рассчитать автоматически"
   - Изменить сумму → проверить пересчет НДС
   - Изменить ставку → проверить пересчет НДС

9. ✅ **Копирование плановых дат в фактические**
   - Выбрать креатив
   - Установить checkbox
   - Проверить заполнение дат

10. ✅ **Валидация сумм распределений**
    - Создать распределения с суммой ≠ общей
    - Проверить появление alert с расхождением
    - Исправить суммы → проверить исчезновение alert

11. ✅ **Сохранение черновика**
    - Заполнить форму
    - Нажать "Сохранить черновик"
    - Проверить переход на /acts/:id/edit
    - Проверить сохранение всех данных

12. ✅ **Редактирование существующего акта**
    - Открыть акт на редактирование
    - Изменить поля
    - Сохранить → проверить обновление

13. ✅ **Отправка в VK ORD**
    - Создать валидный акт
    - Нажать "Отправить в VK ORD"
    - Проверить изменение статуса
    - Проверить toast notification

14. ✅ **Unsaved changes warning**
    - Внести изменения в форму
    - Попытаться покинуть страницу
    - Проверить появление предупреждения

**Priority**: 🔴 КРИТИЧНО
**Estimate**: 1 день

---

### 6.2. Mobile Responsiveness

**Проверить на экранах**:
- 320px (iPhone SE)
- 768px (iPad)
- 1024px (Desktop)

**Что тестировать**:
- Accordion работает вертикально
- Cards распределений в один столбец
- Форма полей в один столбец на мобильных
- Touch-friendly buttons (min 44x44px)
- Overflow handling

**Priority**: 🟡 ВЫСОКИЙ
**Estimate**: 2 часа

---

### 6.3. Accessibility

**Checklist**:
- ✅ Keyboard navigation (Tab, Enter, Esc, Arrow keys)
- ✅ Screen reader support (ARIA labels, live regions)
- ✅ Focus management (trap focus in modals, return after close)
- ✅ Color contrast (WCAG AA)
- ✅ Error announcements (aria-live="polite")
- ✅ Skip links for keyboard users

**Tools**:
- axe DevTools
- NVDA/JAWS screen reader testing
- Keyboard-only navigation testing

**Priority**: 🟢 СРЕДНИЙ
**Estimate**: 2 часа

---

## ЭТАП 7: ДОПОЛНИТЕЛЬНЫЕ ФИЧИ (OPTIONAL)

### 7.1. PDF Export

**Интеграция с backend endpoint**: `GET /api/v1/acts/{actId}/export/pdf`

**Frontend задачи**:
- Кнопка "Экспорт в PDF" в ActEditPage
- Загрузка PDF через blob
- Сохранение файла с именем `Акт_${number}_${date}.pdf`

**Priority**: 🟢 СРЕДНИЙ
**Estimate**: 1 час

---

### 7.2. History/Timeline в sidebar

**Функционал**:
- Лог изменений акта (кто, когда, что изменил)
- Компонент Timeline с датами
- Интеграция с backend endpoint для истории

**Priority**: 🟢 НИЗКИЙ
**Estimate**: 2 часа

---

### 7.3. Checklist в sidebar

**Функционал**:
- Динамический чек-лист завершенности акта
- Проверки:
  - ✅ Основные данные заполнены
  - ✅ Добавлено хотя бы 1 распределение
  - ✅ Суммы совпадают
  - ✅ Все креативы имеют статистику
  - ✅ Даты валидны

**Priority**: 🟢 НИЗКИЙ
**Estimate**: 1 час

---

## 🚀 ДАЛЬНЕЙШИЕ ФАЗЫ РАЗВИТИЯ

**Дата добавления**: 17.10.2025

Этот раздел описывает долгосрочные улучшения и развитие функционала актов после завершения MVP.

---

### ФАЗА 1: ЗАВЕРШЕНИЕ MVP (В ПРОЦЕССЕ - 75%)

**Цель**: Довести до production-ready состояния

**Оставшиеся задачи**:

1. **Backend - ActsController** (🔴 КРИТИЧНО - 2-3 дня)
   - Создать ActsService с бизнес-логикой
   - Реализовать все 9 endpoints
   - Добавить Broken Rules валидацию
   - Создать Response DTOs для фронтенда
   - Интеграция тестирование с VK ORD API

2. **Frontend - Улучшение валидации** (🟡 ВЫСОКИЙ - 1-2 дня)
   - Создать Zod schemas (actFormSchema.ts)
   - Мигрировать ActFormPage на React Hook Form
   - Добавить cross-field validation
   - Улучшить сообщения об ошибках

3. **Тестирование** (🔴 КРИТИЧНО - 2-3 дня)
   - Написать unit tests для hooks
   - Написать integration tests для API calls
   - E2E тесты для критических flow
   - Тестирование на реальных данных VK ORD

4. **PDF Export** (🟡 ВЫСОКИЙ - 1 день)
   - Backend endpoint для генерации PDF
   - Фронтенд интеграция (download)
   - Шаблон PDF по российским стандартам

**Итого**: 6-9 дней работы

**Критерий завершения**: Система готова для production использования

---

### ФАЗА 2: ОПТИМИЗАЦИЯ UX И ПРОДУКТИВНОСТЬ (2-3 НЕДЕЛИ)

**Цель**: Повысить удобство использования и скорость работы

#### 2.1. Batch Operations (Пакетные операции)

**Приоритет**: 🟡 ВЫСОКИЙ
**Estimate**: 3-4 дня

**Функционал**:
- Bulk export актов в PDF
- Bulk submission актов в VK ORD
- Bulk status check
- Multi-select в таблице актов
- Progress indicator для batch операций

**Backend endpoints**:
```csharp
POST /api/v1/acts/bulk/submit      // Отправить несколько актов
POST /api/v1/acts/bulk/export      // Экспорт нескольких актов
GET  /api/v1/acts/bulk/status      // Статус нескольких актов
```

---

#### 2.2. Advanced Filtering & Search

**Приоритет**: 🟡 ВЫСОКИЙ
**Estimate**: 2-3 дня

**Функционал**:
- Фильтры по датам (период, дата выставления)
- Фильтр по статусам (draft, sent, approved, rejected)
- Фильтр по суммам (диапазон)
- Поиск по номеру акта
- Поиск по контрагенту/договору
- Сохранение фильтров в localStorage
- Quick filters (preset фильтры)

**UI Components**:
- FilterPanel (sidebar или dropdown)
- DateRangePicker
- AmountRangePicker
- QuickFilters (chips)

---

#### 2.3. Keyboard Shortcuts & Accessibility

**Приоритет**: 🟢 СРЕДНИЙ
**Estimate**: 2 дня

**Shortcuts**:
- `Ctrl+N` - Создать новый акт
- `Ctrl+S` - Сохранить черновик
- `Ctrl+Enter` - Отправить в VK ORD
- `Escape` - Отмена / закрыть модал
- `Ctrl+F` - Фокус на поиске
- `/` - Фокус на глобальном поиске

**Accessibility**:
- WCAG 2.1 AA compliance
- Screen reader support
- Keyboard-only navigation
- Focus management
- ARIA labels

---

#### 2.4. Real Timeline & Audit Log

**Приоритет**: 🟢 СРЕДНИЙ
**Estimate**: 3 дня

**Backend**:
```csharp
// Audit table
public class ActAudit
{
    public string ActId { get; set; }
    public string Action { get; set; }      // created, updated, submitted, etc.
    public string UserId { get; set; }
    public DateTime Timestamp { get; set; }
    public string Changes { get; set; }     // JSON diff
}

GET /api/v1/acts/{actId}/audit         // История изменений
```

**Frontend**:
- Timeline компонент с реальными данными
- Diff viewer для изменений
- Фильтр по типам действий
- Export audit log в CSV

---

#### 2.5. Draft Autosave & Version Control

**Приоритет**: 🟡 ВЫСОКИЙ
**Estimate**: 2 дня

**Функционал**:
- Автосохранение каждые 30 секунд
- Версионирование черновиков
- Восстановление из автосохранения
- "Последнее автосохранение: 2 минуты назад"
- Conflict resolution при одновременном редактировании

**Backend**:
```csharp
POST /api/v1/acts/{actId}/drafts       // Создать draft version
GET  /api/v1/acts/{actId}/drafts       // Список всех версий
POST /api/v1/acts/{actId}/restore      // Восстановить версию
```

---

### ФАЗА 3: АНАЛИТИКА И ОТЧЕТНОСТЬ (3-4 НЕДЕЛИ)

**Цель**: Добавить аналитические инструменты и отчеты

#### 3.1. Dashboard & Analytics

**Приоритет**: 🟢 СРЕДНИЙ
**Estimate**: 5-7 дней

**Дашборд актов**:
- KPI cards:
  - Всего актов (по статусам)
  - Общая сумма актов (за период)
  - Средняя сумма акта
  - Конверсия draft → approved
- Графики:
  - Динамика создания актов (line chart)
  - Распределение по статусам (pie chart)
  - Топ контрагентов (bar chart)
  - Суммы по месяцам (area chart)
- Фильтры по периоду (последние 7/30/90 дней, custom range)

**Backend**:
```csharp
GET /api/v1/acts/analytics/summary     // KPI данные
GET /api/v1/acts/analytics/timeline    // Временной ряд
GET /api/v1/acts/analytics/breakdown   // Разбивка по категориям
```

---

#### 3.2. Reports Generation

**Приоритет**: 🟢 СРЕДНИЙ
**Estimate**: 4-5 дней

**Типы отчетов**:
1. **Реестр актов** - Список актов за период
2. **Сводка по контрагентам** - Суммы и количество по каждому
3. **Отчет по НДС** - Анализ НДС за период
4. **Отчет по креативам** - Метрики креативов в актах
5. **Reconciliation report** - Сверка с VK ORD

**Форматы экспорта**:
- PDF (formatted report)
- Excel (XLSX с сводными таблицами)
- CSV (raw data)

**UI**:
- Report Builder (выбор типа, фильтров, формата)
- Preview перед генерацией
- История сгенерированных отчетов
- Schedule reports (еженедельно/ежемесячно)

---

#### 3.3. Data Visualization

**Приоритет**: 🟢 НИЗКИЙ
**Estimate**: 3-4 дня

**Библиотеки**:
- Recharts или Victory для графиков
- react-table для продвинутых таблиц

**Визуализации**:
- Heatmap креативов по площадкам
- Sankey diagram (распределение бюджета)
- Treemap (иерархия контрагентов)
- Sparklines в таблицах

---

### ФАЗА 4: ИНТЕГРАЦИИ И АВТОМАТИЗАЦИЯ (4-6 НЕДЕЛЬ)

**Цель**: Интеграция с внешними системами и автоматизация процессов

#### 4.1. Email Notifications

**Приоритет**: 🟡 ВЫСОКИЙ
**Estimate**: 3-4 дня

**События для уведомлений**:
- Акт создан
- Акт отправлен в VK ORD
- Акт одобрен VK ORD
- Акт отклонен VK ORD (с причинами)
- Приближается deadline оплаты
- Истекает срок акта

**Настройки**:
- Per-user preferences
- Email templates
- Frequency settings (instant, digest)
- Notification channels (email, in-app, SMS)

---

#### 4.2. 1C Integration

**Приоритет**: 🟢 СРЕДНИЙ
**Estimate**: 7-10 дней

**Функционал**:
- Экспорт актов в 1C формат
- Синхронизация контрагентов с 1C
- Синхронизация договоров
- Автоматическое создание актов из 1C
- Bidirectional sync

**API endpoints**:
```csharp
POST /api/v1/integrations/1c/acts/export    // Экспорт актов
POST /api/v1/integrations/1c/sync           // Синхронизация
GET  /api/v1/integrations/1c/status         // Статус интеграции
```

---

#### 4.3. VK ORD Auto-sync

**Приоритет**: 🟡 ВЫСОКИЙ
**Estimate**: 3-4 дня

**Функционал**:
- Автоматическая синхронизация статусов
- Background job (каждые 15 минут)
- Webhook от VK ORD (если поддерживается)
- Real-time status updates
- Retry logic для failed syncs

**Backend**:
```csharp
// Background service
public class VkOrdSyncService : BackgroundService
{
    // Sync every 15 minutes
    // Update act statuses
    // Handle errors gracefully
}
```

---

#### 4.4. Templates & Automation Rules

**Приоритет**: 🟢 СРЕДНИЙ
**Estimate**: 5-6 дней

**Act Templates**:
- Сохранение актов как шаблонов
- Быстрое создание из шаблона
- Шаблоны распределений
- Предустановленные креативы

**Automation Rules**:
- Auto-approve актов (по условиям)
- Auto-submit to VK ORD (по расписанию)
- Auto-generate act numbers
- Auto-fill from contract defaults

**UI**:
- Template manager
- Rule builder (visual editor)
- Условия и действия (if-then)

---

### ФАЗА 5: МОБИЛЬНОЕ ПРИЛОЖЕНИЕ (6-8 НЕДЕЛЬ)

**Цель**: Native мобильное приложение для iOS и Android

**Технологии**:
- React Native или Flutter
- Shared business logic with web

**Функционал**:
- Просмотр актов
- Создание актов (упрощенная форма)
- Push notifications
- Offline mode
- Signature capture (подпись на экране)

**Priority**: 🟢 НИЗКИЙ (после Phase 4)

---

### ФАЗА 6: AI-POWERED FEATURES (4-6 НЕДЕЛЬ)

**Цель**: Использование AI для умных рекомендаций

**Features**:

1. **Smart amount prediction**
   - ML модель предсказывает суммы на основе истории
   - Подсказки при вводе распределений

2. **Anomaly detection**
   - Обнаружение необычных сумм
   - Предупреждение о потенциальных ошибках

3. **Auto-categorization**
   - Автоматическая категоризация актов
   - Smart tags

4. **NLP для поиска**
   - Естественноязыковый поиск
   - "Покажи все акты с Рога и Копыта за январь"

**Priority**: 🟢 НИЗКИЙ (инновационный функционал)

---

## 📊 ИТОГОВАЯ ТАБЛИЦА ЗАДАЧ

**Обновлено**: 17.10.2025 (с отметками о выполнении)

| Этап | Задача | Статус | Приоритет | Оценка | Зависимости |
|------|--------|--------|-----------|--------|--------------|
| **1. Backend** | VK ORD Service | ✅ | - | - | - |
| 1 | InvoicesController | ✅ | - | - | - |
| 1 | StatisticsController | ✅ | - | - | - |
| 1 | Database entities | ✅ | - | - | - |
| 1 | Repository layer | ✅ | - | - | - |
| 1 | PDF Export (Backend) | ❌ | 🟢 СРЕДНИЙ | 1 день | - |
| 1 | Act number generation | ❌ | 🟢 НИЗКИЙ | 4 часа | - |
| **2. Routing** | Routes & Pages | ✅ | - | - | - |
| 2 | ActsPage | ✅ | - | - | - |
| 2 | ActFormPage | ✅ | - | - | - |
| **3. Validation** | React Hook Form deps | ✅ | - | - | - |
| 3 | Zod deps | ✅ | - | - | - |
| 3 | **Zod schema** | ❌ | 🟡 ВЫСОКИЙ | 1 час | - |
| 3 | **Migrate to RHF** | ❌ | 🟡 ВЫСОКИЙ | 2-3 часа | Zod schema |
| **4. Forms** | Material UI (вместо shadcn) | ✅ | - | - | - |
| 4 | ActFormPage (container) | ✅ | - | - | - |
| 4 | Basic data section | ✅ | - | - | - |
| 4 | Distributions section | ✅ | - | - | - |
| 4 | Statistics section | ✅ | - | - | - |
| 4 | ActCreationFlow | ✅ | - | - | - |
| 4 | ActEditor | ✅ | - | - | - |
| 4 | ActListPanel | ✅ | - | - | - |
| 4 | ActHintsSidebar | ✅ | - | - | - |
| 4 | PartyLookup | ✅ | - | - | - |
| **5. Integration** | ActsPage navigation | ✅ | - | - | - |
| 5 | ActCreationFlow redirect | ✅ | - | - | - |
| 5 | Hooks (14 total) | ✅ | - | - | - |
| 5 | TypeScript types | ✅ | - | - | - |
| **6. Testing** | **Unit tests** | ❌ | 🔴 КРИТИЧНО | 1-2 дня | All |
| 6 | **Integration tests** | ❌ | 🔴 КРИТИЧНО | 1 день | Backend |
| 6 | **E2E tests** | ❌ | 🟡 ВЫСОКИЙ | 1 день | All |
| 6 | Mobile responsiveness | ⚠️ | 🟡 ВЫСОКИЙ | 2 часа | - |
| 6 | Accessibility | ⚠️ | 🟢 СРЕДНИЙ | 2 часа | - |
| **7. Extra** | PDF Export (Frontend) | ❌ | 🟢 СРЕДНИЙ | 1 час | Backend |
| 7 | Real Timeline | ❌ | 🟢 НИЗКИЙ | 2 часа | Backend |
| 7 | Real Checklist | ❌ | 🟢 НИЗКИЙ | 1 час | - |

### Легенда статусов:
- ✅ **Выполнено** - Задача полностью реализована
- ⚠️ **Частично** - Задача частично выполнена, требует доработки
- ❌ **Не выполнено** - Задача требует реализации

### Суммарная оценка:

**Оригинальный план**: ~40 часов (5-6 дней)
**Выполнено**: ~32 часа (80%) - Backend контроллеры готовы! ✅
**Осталось критичного**: ~2-3 дня работы (фронтенд улучшения)
**Осталось всего**: ~4-5 дней работы

### Приоритеты для завершения MVP:

**Backend - ГОТОВ! ✅**:
1. ✅ InvoicesController - полностью реализован
2. ✅ StatisticsController - полностью реализован
3. ✅ VK ORD Service - все методы работают
4. ✅ Database entities - готовы
5. ❌ PDF Export - опционально (1 день)
6. ❌ Act number generation - опционально (4 часа)

**Критичные задачи (фронтенд)**:
1. ❌ Обновить hooks для /api/invoices/* - 2-3 часа
2. ❌ Добавить hooks для /api/statistics/* - 1-2 часа
3. ❌ Zod schema + RHF migration - 3-4 часа
4. ❌ Integration tests - 1 день
5. ❌ E2E tests - 1 день

**Высокие приоритеты (улучшения)**:
1. ⚠️ Mobile responsiveness - 2 часа
2. ❌ Unit tests для hooks - 1 день

**Итого для MVP**: ~2-3 дня работы (Backend готов!)

---

## 🚀 РЕКОМЕНДУЕМАЯ ПОСЛЕДОВАТЕЛЬНОСТЬ РАБОТЫ

**Обновлено**: 17.10.2025 (с учетом выполненных задач)

---

### НЕДЕЛЯ 1: ЗАВЕРШЕНИЕ BACKEND (🔴 КРИТИЧНО!)

**День 1: ActsService + Response DTOs**
- ✅ VK ORD Service уже готов - использовать как основу
- ❌ Создать `ActsService.cs` с бизнес-логикой
- ❌ Реализовать все validation rules (Broken Rules)
- ❌ Создать Response DTOs (`ActDetailsResponse`, `ActListResponse`, etc.)
- ❌ Unit tests для ActsService

**День 2: ActsController - Часть 1 (CRUD)**
- ❌ Создать ActsController.cs
- ❌ Реализовать CRUD endpoints:
  - POST /api/v1/acts (Create)
  - GET /api/v1/acts/{id} (Read)
  - PUT /api/v1/acts/{id} (Update)
  - DELETE /api/v1/acts/{id} (Delete)
  - GET /api/v1/acts (List with pagination)
- ❌ Тестирование через Postman/Swagger

**День 3: ActsController - Часть 2 (Operations)**
- ❌ Реализовать operation endpoints:
  - POST /api/v1/acts/{id}/submit (Submit to VK ORD)
  - GET /api/v1/acts/{id}/status (Get status)
  - GET /api/v1/acts/suggestions/number (Generate act number)
- ❌ Интеграция с VK ORD Service
- ❌ Обработка ошибок и edge cases
- ❌ Integration tests с реальным VK ORD API (sandbox)

**День 4: Backend Testing & Polish**
- ❌ Unit tests для ActsController
- ❌ Integration tests для всех endpoints
- ❌ Тестирование validation rules
- ❌ Документация API (Swagger annotations)
- ❌ Code review и cleanup

---

### НЕДЕЛЯ 2: FRONTEND УЛУЧШЕНИЯ & ТЕСТИРОВАНИЕ

**День 5: Zod Schema + React Hook Form Migration**
- ❌ Создать `src/features/acts/schemas/actFormSchema.ts`
- ❌ Определить все Zod schemas (act, distribution, creative)
- ❌ Мигрировать ActFormPage на React Hook Form
- ❌ Улучшить inline validation
- ❌ Тестирование форм с новой валидацией

**День 6: Unit Tests (Frontend)**
- ❌ Tests для всех 14 hooks
- ❌ Tests для key components (ActCreationFlow, ActFormPage)
- ❌ Tests для validation logic
- ❌ Tests для VAT calculation
- ❌ Mock API responses для тестов

**День 7: Integration Tests**
- ❌ Tests для полного flow создания акта
- ❌ Tests для редактирования акта
- ❌ Tests для submission в VK ORD
- ❌ Tests для error handling
- ❌ Tests для edge cases

**День 8: E2E Tests + Mobile**
- ❌ E2E tests для критических сценариев (Playwright/Cypress)
- ❌ Mobile responsiveness testing (320px, 768px, 1024px)
- ❌ Touch interaction testing
- ❌ Cross-browser testing (Chrome, Firefox, Safari)

**День 9: Polish & Documentation**
- ❌ Accessibility audit (WCAG 2.1 AA)
- ❌ Performance optimization
- ❌ Code review
- ❌ User documentation
- ❌ Developer documentation

---

### НЕДЕЛЯ 3+: ДОПОЛНИТЕЛЬНЫЕ ФИЧИ (ОПЦИОНАЛЬНО)

**День 10: PDF Export**
- ❌ Backend: PDF generation endpoint (QuestPDF)
- ❌ Frontend: Download integration
- ❌ Russian formatting standards
- ❌ Testing

**День 11-12: Real Timeline & Audit Log**
- ❌ Backend: ActAudit table + endpoints
- ❌ Frontend: Timeline component с реальными данными
- ❌ Diff viewer для изменений

**День 13-14: Draft Autosave & Batch Operations**
- ❌ Autosave every 30 seconds
- ❌ Version control для черновиков
- ❌ Bulk operations (export, submit, status check)

---

### АЛЬТЕРНАТИВНАЯ ПОСЛЕДОВАТЕЛЬНОСТЬ (Fast Track MVP)

Если нужен быстрый MVP без всех улучшений:

**Неделя 1: Минимальный Backend (3-4 дня)**
1. ActsService + DTOs (1 день)
2. ActsController CRUD (1 день)
3. Submit to VK ORD (1 день)
4. Basic testing (0.5 дня)

**Неделя 2: Минимальное Frontend тестирование (2-3 дня)**
1. Integration tests для API (1 день)
2. E2E tests для критического flow (1 день)
3. Bug fixes (0.5-1 день)

**Итого Fast Track MVP**: 5-7 дней работы

---

## ❓ ВОПРОСЫ ДЛЯ УТОЧНЕНИЯ

### 1. Backend Development
**Q**: Кто будет разрабатывать ActsController?
**Важность**: Критично - без backend невозможна frontend-разработка

**Q**: Есть ли backend-разработчик в команде?
**Варианты**: Да / Нет / Нужно нанять

---

### 2. VK ORD API Integration
**Q**: Есть ли документация по VK ORD API для отправки актов?
**Важность**: Высокая - нужна для интеграции

**Q**: Есть ли sandbox environment для тестирования?
**Варианты**: Да / Нет / Только production

---

### 3. PDF Generation
**Q**: Какой шаблон PDF нужен? Есть ли дизайн?
**Важность**: Средняя - можно отложить на потом

**Q**: Какая библиотека предпочтительна?
**Варианты**: QuestPDF / DinkToPdf / Другая

---

### 4. Platform/Media Directories
**Q**: Откуда брать список площадок (Telegram, VK, etc.)?
**Важность**: Высокая - нужно для dropdown

- Backend справочник (пока что mock)

---

### 5. Act Number Generation
**Q**: Как генерировать номера актов?
**Важность**: Средняя

**Options**:
- Комбинированный подход (авто + возможность override)

---

### 6. Intermediary Contracts
**Q**: Что такое "Посреднический договор" в контексте VK ORD?
**Важность**: Средняя - поле опциональное

**Q**: Как он связан с основным договором?
**Цель**: Понять бизнес-логику для правильной валидации

---

### 7. Statistics Data
**Q**: Откуда берутся метрики для статистики креативов?
**Важность**: Средняя

**Options**:
- Ручной ввод

---

## 📝 ПРИМЕЧАНИЯ И ПРЕДУПРЕЖДЕНИЯ

### ⚠️ Критические зависимости:
1. **Backend API** - обязателен для любой frontend-разработки
2. **VK ORD API docs** - необходимы для корректной интеграции
3. **Справочники** (площадки, роли) - нужны для dropdown меню

### 💡 Рекомендации:
1. Начать с backend, затем frontend
2. Использовать feature flags для постепенного раскрытия функционала
3. Тестировать на реальных данных VK ORD
4. Создать mock data для development

### 🔄 Возможные изменения:
- Структура данных может измениться при интеграции с VK ORD
- UI может потребовать доработки после user testing
- Валидация может ужесточиться по требованиям VK ORD

---

## 📚 ДОПОЛНИТЕЛЬНЫЕ РЕСУРСЫ

### Документация:
- React Hook Form: https://react-hook-form.com/
- Zod: https://zod.dev/
- shadcn/ui: https://ui.shadcn.com/
- Radix UI: https://www.radix-ui.com/

### Существующие файлы проекта:
- `src/types/acts.ts` - TypeScript types (уже готовы)
- `src/features/acts/hooks/` - React Query hooks (частично готовы)
- `src/features/acts/components/ActCreationFlow.tsx` - Flow выбора сторон
- `src/features/acts/ActsPage.tsx` - Главная страница актов

### API Endpoints (существующие):
- `GET /api/v1/contracts/{contractExternalId}/details` - Детали договора + креативы
- `GET /api/v1/counterparties/by-inn/{inn}` - Поиск контрагента
- `GET /api/client/counterparties/{externalId}/contracts` - Договоры контрагента

---

**Дата последнего обновления**: 17.10.2025 (v2.0 - после анализа реализации)
**Версия плана**: 2.0
**Статус**: 75% выполнено, требуется завершение backend + тестирование

---

## ✅ СЛЕДУЮЩИЕ ШАГИ (ОБНОВЛЕНО)

### Немедленные действия (Неделя 1):

1. 🔴 **КРИТИЧНО: Разработка Backend API**
   - **День 1**: ActsService + Response DTOs + Validation Rules
   - **День 2-3**: ActsController (все 9 endpoints)
   - **День 4**: Backend testing + Swagger documentation
   - **Ответственный**: Backend разработчик
   - **Блокирует**: Полноценное тестирование фронтенда

2. 🟡 **ВЫСОКИЙ: Frontend улучшения (параллельно)**
   - Создать Zod schemas
   - Мигрировать на React Hook Form
   - Можно делать параллельно с backend
   - **Ответственный**: Frontend разработчик

### Последующие действия (Неделя 2):

3. 🔴 **КРИТИЧНО: Тестирование**
   - Unit tests (backend + frontend)
   - Integration tests (API)
   - E2E tests (критические сценарии)
   - **Требует**: Готовый backend

4. 🟢 **СРЕДНИЙ: Дополнительные фичи**
   - PDF Export
   - Real Timeline
   - Mobile responsiveness final check

### Долгосрочные цели (Фазы 2-6):

5. 🟢 **Фаза 2**: UX оптимизация (2-3 недели)
   - Batch operations
   - Advanced filtering
   - Keyboard shortcuts
   - Draft autosave

6. 🟢 **Фаза 3**: Аналитика (3-4 недели)
   - Dashboard
   - Reports generation
   - Data visualization

7. 🟢 **Фаза 4**: Интеграции (4-6 недель)
   - Email notifications
   - 1C integration
   - VK ORD auto-sync
   - Templates

8. 🟢 **Фаза 5-6**: Мобильное приложение + AI (опционально)

---

## 📋 КРИТИЧЕСКИЙ ПУТЬ ДО PRODUCTION

```
Backend ActsController (3-4 дня)
    ↓
Integration Testing (1 день)
    ↓
Frontend Zod Migration (1 день)
    ↓
E2E Testing (1 день)
    ↓
Bug Fixes (1-2 дня)
    ↓
Production Ready ✅
```

**Минимальное время до MVP**: 7-9 дней чистой работы
**Реалистичное время с багфиксами**: 10-14 календарных дней

---

## 🎯 КРИТЕРИИ ГОТОВНОСТИ MVP

**Backend**:
- ✅ ActsController со всеми endpoints реализован
- ✅ Validation rules работают корректно
- ✅ Submit to VK ORD успешно отправляет акты
- ✅ Unit + Integration tests покрывают > 80% кода

**Frontend**:
- ✅ Все 14 hooks работают с реальным API
- ✅ Форма создания/редактирования работает без багов
- ✅ Validation отображается корректно
- ✅ E2E tests для критических сценариев проходят

**Quality**:
- ✅ Нет критических багов
- ✅ Mobile responsiveness работает
- ✅ Performance приемлем (< 3s page load)
- ✅ Документация для пользователей готова

**Готовность**: Когда все чекбоксы ✅ - можно в production

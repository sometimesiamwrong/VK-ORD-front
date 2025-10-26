# Фича: Мастер получения ERID (Wizard)

## Описание

Главный модуль приложения - пошаговый мастер для получения ERID (Единого Регистрационного Идентификатора Рекламы). Wizard проводит пользователя через весь процесс: от выбора контрагентов и создания контракта до регистрации креатива и получения ERID.

## Основные компоненты

### WizardPage (`WizardPage.tsx`)

**Назначение:** Контейнер для wizard компонента

**Структура:**
- Простая обертка, рендерит `<Wizard />`

### Wizard (`src/components/wizard/Wizard.tsx`)

**Назначение:** Главный компонент с переключением между режимами

**Два режима:**

1. **WizardCreationFlow** (упрощенный, по умолчанию)
   - Быстрый выбор контрагентов и контракта
   - Компактный UI
   - Переход к шагу 3 (креатив) одной кнопкой

2. **Step-by-step wizard** (полный, после WizardCreationFlow)
   - Все 4 шага с детальной информацией
   - Редактирование на каждом шаге
   - Полный контроль над процессом

**Кнопки действий:**
- 📋 Загрузить из шаблона - `TemplateSelector` modal
- 🔄 Начать сначала - очистка всех данных (появляется после перехода к креативу)

## Четыре шага Wizard

### Step 1: Контрагенты (`Step1Parties.tsx`)

**Цель:** Выбрать рекламодателя и исполнителя

**Функциональность:**

1. **Рекламодатель (Advertiser)**
   - Ввод ИНН (с автодополнением из истории)
   - Кнопка "Найти" - поиск через DaData
   - Кнопка "Выбрать из списка" - modal с существующими контрагентами
   - Кнопка "Создать" - создание в VK ORD (если найден но не создан)
   - Выбор ролей (множественный select)
   - Отображение информации (название, КПП, тип)

2. **Исполнитель (Contractor)**
   - Аналогичный набор функций
   - Отдельная роль по умолчанию (publisher)

3. **Согласие на обработку данных**
   - Checkbox обязателен для продолжения

4. **Кнопки**
   - "Очистить поля" - сброс всех данных шага
   - "Далее" - переход к шагу 2 (disabled если не все заполнено)

**Индикаторы:**
- ✅ Зеленый badge "В контрагентах" если найден в VK ORD
- Loading spinner во время запросов
- Template indicator если загружен шаблон

### Step 2: Контракт (`Step2Contract.tsx`)

**Цель:** Создать или выбрать контракт между выбранными контрагентами

**Функциональность:**

1. **Поиск существующего контракта**
   - Autocomplete по external ID
   - Загрузка списка контрактов выбранных контрагентов
   - Отображение информации о контракте

2. **Создание нового контракта**
   - External ID (генерируется автоматически или вручную)
   - Серийный номер
   - Сумма оплаты
   - Срок оплаты (дата)
   - Кнопка "Создать контракт"

3. **Кнопки**
   - "Назад" - возврат к шагу 1
   - "Далее" - переход к шагу 3 (креатив)

**Особенности:**
- Автоматическое определение clientId/contractorId из контрагентов
- Валидация обязательных полей
- Отображение созданного контракта

### Step 3: Креатив (`Step3Creative.tsx`)

**Цель:** Создать креатив и получить ERID

**Функциональность:**

1. **Основная информация**
   - External ID (генерируется или вводится)
   - Название креатива
   - Формат (select): Banner, Video, Text Block, Text Graphic Block
   - Тип оплаты: CPM, CPC, CPA, CPView

2. **Связь с контрактами**
   - Contract External IDs (множественный выбор)
   - По умолчанию - контракт из шага 2

3. **ККТУ коды**
   - Поле ввода кода (например, "50.31.10")
   - Кнопка "Добавить код"
   - Список добавленных кодов (Chips с удалением)
   - 🤖 AI подсказки ККТУ - анализ текста креатива

4. **Content URLs**
   - Поле ввода URL
   - Кнопка "Добавить URL"
   - Список URL (теги с удалением)

5. **Целевая аудитория**
   - Текстовое поле описания

6. **Текст креатива**
   - Multiline textarea
   - Используется для AI подсказок ККТУ

7. **Кнопки**
   - "Назад" - к шагу 2
   - "Создать креатив" - отправка в VK ORD

**Особенности:**
- AI подсказки ККТУ через backend `/api/ai/suggest-kktu`
- Динамические списки (кодов, URLs)
- Валидация обязательных полей
- Автоматический переход к шагу 4 при успехе

### Step 4: Результат (`Step4Result.tsx`)

**Цель:** Показать результат регистрации - ERID и статус

**Функциональность:**

1. **Отображение ERID**
   - Большой зеленый блок с ERID
   - Кнопка "Копировать ERID" (clipboard)
   - Иконка ✅ успеха

2. **Детали креатива**
   - External ID
   - Название
   - Формат
   - Статус регистрации

3. **Действия**
   - "Создать еще один креатив" - возврат к шагу 3 с очисткой
   - "Начать заново" - полная очистка всех шагов

**Состояния:**
- Загрузка - spinner
- Успех - зеленый блок с ERID
- Ошибка - красный блок с описанием

## Вспомогательные компоненты

### WizardCreationFlow (`components/WizardCreationFlow.tsx`)

**Назначение:** Упрощенный процесс выбора контрагентов и контракта

**Шаги:**
1. Выбор клиента (Autocomplete или поиск по ИНН)
2. Выбор подрядчика (Autocomplete или поиск)
3. Выбор/создание контракта между ними
4. Кнопка "Перейти к созданию креатива"

**Особенности:**
- Компактный UI (все в одной секции)
- Автоматический поиск контрактов между выбранными контрагентами
- Быстрый переход к креативу
- Используется перед полным wizard

### PartyInputSection (`components/PartyInputSection.tsx`)

**Назначение:** Переиспользуемая секция для ввода контрагента

**Функции:**
- Поле ввода ИНН с автодополнением
- Кнопки: Найти, Выбрать из списка, Создать
- Мультивыбор ролей
- Отображение найденной информации
- Индикатор "В контрагентах"
- Loading состояния

### ContractSelector (`components/ContractSelector.tsx`)

**Назначение:** Выбор существующего контракта

**Функции:**
- Autocomplete по списку контрактов
- Поиск по external ID
- Отображение деталей контракта

### CreateContractModal (`components/CreateContractModal.tsx`)

**Назначение:** Модальное окно создания контракта

**Поля:**
- External ID
- Serial (серийный номер)
- Pay Sum (сумма)
- Pay Date End (срок оплаты)

### KktyHintsPanel (`components/KktyHintsPanel.tsx`)

**Назначение:** Панель с AI подсказками ККТУ кодов

**Функции:**
- Кнопка "Получить подсказки ККТУ" 🤖
- Запрос к AI на основе текста креатива
- Отображение предложенных кодов
- Кнопка "Добавить" для каждого кода

### TemplateSelector (`components/TemplateSelector.tsx`)

**Назначение:** Модальное окно выбора шаблона

**Функции:**
- Список сохраненных шаблонов
- Фильтры и поиск
- Счетчик использований
- Кнопка "Загрузить"

### TemplateIndicator (`components/TemplateIndicator.tsx`)

**Назначение:** Индикатор загруженного шаблона

**Отображение:**
- 📋 Badge "Из шаблона"
- Показывается на шагах если данные загружены из шаблона

## Zustand Store (wizardStore)

Хранилище состояния wizard определено в `src/stores/wizardStore.ts`.

### Структура состояния

```typescript
interface WizardState {
  // Current step (1-4)
  step: number
  
  // Step 1: Parties
  advertiser: {
    inn: string
    role: string[]
    info: DaDataPartyShortResponse | null
  }
  contractor: {
    inn: string
    role: string[]
    info: DaDataPartyShortResponse | null
  }
  consent: boolean
  partyHistory: PartyHistoryItem[]
  
  // Step 2: Contract
  contract: {
    externalId: string
    serial: string
    paySum: string
    payDateEnd: string
  }
  selectedContract: ContractDto | null
  
  // Step 3: Creative
  creative: {
    externalId: string
    name: string
    format: VkOrdCreativeForm
    payType: number
    contractExternalIds: string[]
    kktus: string[]
    contentUrls: string[]
    targetAudience: string
    texts: string[]
  }
  
  // Step 4: Result
  erid: string | null
  creativeStatus: CreativeStatus | null
  
  // UI state
  loadingState: Record<string, boolean>
  showCreativeFlow: boolean
  isTemplateLoaded: boolean
  loadedTemplateId: number | null
  openSections: Record<number, boolean>
  
  // Actions
  actions: WizardActions
}
```

### Основные селекторы

```typescript
// Current step
const step = useWizardStep()

// Can proceed checks
const canNext = useCanNextFromStep1()

// Individual fields
const advertiser = useWizardAdvertiser()
const contract = useWizardContract()
const creative = useWizardCreative()

// Complete store
const { advertiser, contractor, consent, actions } = useWizardStore()
```

### Actions

```typescript
// Navigation
actions.setStep(2)
actions.nextStep()
actions.prevStep()

// Step 1
actions.setAdvertiserInn(inn)
actions.setAdvertiserInfo(info)
actions.setAdvertiserRole(roles)
actions.setConsent(true)

// Step 2
actions.updateContract({ externalId, serial, paySum })
actions.setSelectedContract(contract)

// Step 3
actions.updateCreative({ format, kktus, contentUrls })
actions.addKktyCode(code)
actions.removeKktyCode(code)
actions.addContentUrl(url)

// Step 4
actions.setErid(erid)
actions.setCreativeStatus(status)

// UI
actions.setShowCreativeFlow(true)
actions.setLoadedTemplate(templateId)
actions.toggleSection(sectionNumber)

// Cleanup
actions.clearStep1()
actions.clearStep2()
actions.clearAll()
```

## Hooks

### useStep1Logic (`hooks/useStep1Logic.ts`)

Логика шага 1 (контрагенты):
- Поиск по ИНН через DaData
- Создание контрагента в VK ORD
- Работа с модалом выбора
- История ИНН
- Проверка наличия в VK ORD

### useFlowTemplates (`hooks/useFlowTemplates.ts`)

Работа с шаблонами:
- `useFlowTemplates()` - список шаблонов
- `useTemplateById(id)` - получение шаблона
- `useSaveFlowTemplate()` - сохранение
- `useDeleteFlowTemplate(id)` - удаление
- `useIncrementTemplateUse()` - счетчик использований

### useCreateCreative (`hooks/useCreateCreative.ts`)

Создание креатива:
- Формирование запроса
- Отправка в VK ORD
- Обработка ответа (ERID)
- Error handling

## Процесс получения ERID

### Полный путь

1. **Выбор контрагентов** (Step 1)
   - Поиск рекламодателя по ИНН
   - Создание в VK ORD если нужно
   - Поиск исполнителя
   - Создание исполнителя
   - Согласие на обработку

2. **Создание контракта** (Step 2)
   - Поиск существующего или
   - Создание нового контракта
   - Указание суммы и сроков

3. **Создание креатива** (Step 3)
   - Заполнение данных креатива
   - Добавление ККТУ кодов (обязательно!)
   - Добавление URLs контента
   - Отправка в VK ORD

4. **Получение ERID** (Step 4)
   - Автоматическое появление после успешной регистрации
   - Копирование ERID в буфер обмена
   - Использование ERID в рекламных материалах

### Быстрый путь (WizardCreationFlow)

1. Выбрать клиента
2. Выбрать подрядчика
3. Выбрать контракт
4. Нажать "Перейти к созданию креатива"
5. Заполнить данные креатива (Step 3)
6. Получить ERID (Step 4)

## Шаблоны (Templates)

### Назначение
Сохранение часто используемых комбинаций контрагентов, контрактов и настроек креатива.

### Структура шаблона
```typescript
interface FlowTemplate {
  id: number
  name: string
  description?: string
  value: {
    advertiser: PartyData
    contractor: PartyData
    contract: ContractData
    creative: CreativeData
  }
  useCount: number
  createdAt: string
  updatedAt: string
}
```

### Использование
1. Создать первый раз весь flow
2. Сохранить как шаблон (кнопка "Сохранить как шаблон")
3. При следующем использовании - "Загрузить из шаблона"
4. Изменить только необходимые поля (например, текст креатива)
5. Получить ERID быстрее

## Навигация

**Маршрут:** `/wizard`

**Доступ:** Защищенный маршрут (требуется авторизация)

**Переходы:**
- Из Dashboard (кнопка быстрого доступа)
- Из бокового меню
- Из Profile страницы ("Быстро получить ERID")

## Связанные модули

- **Parties** - поиск и создание контрагентов
- **Contracts** - создание контрактов
- **Creatives** - создание креативов и получение ERID
- **DaData API** - поиск организаций по ИНН
- **AI API** - подсказки ККТУ кодов

## API Endpoints (используемые в Wizard)

### Контрагенты
- `GET /api/parties/lookup?inn={inn}` - поиск по ИНН (DaData)
- `POST /api/parties/set` - создание контрагента в VK ORD
- `GET /api/counterparties` - список всех контрагентов

### Контракты
- `PUT /api/contracts/{externalId}` - создание/обновление контракта
- `GET /api/contracts/{externalId}` - получение контракта

### Креативы
- `POST /api/creatives` - создание креатива
- `GET /api/creatives/{externalId}/status` - получение статуса (ERID)

### AI
- `POST /api/ai/suggest-kktu` - получение подсказок ККТУ

### Шаблоны
- `GET /api/flow-templates` - список шаблонов
- `GET /api/flow-templates/{id}` - получение шаблона
- `POST /api/flow-templates` - сохранение шаблона
- `DELETE /api/flow-templates/{id}` - удаление шаблона
- `POST /api/flow-templates/{id}/increment-use` - счетчик использований

## Особенности реализации

1. **Zustand persist:**
   - Состояние сохраняется в localStorage
   - Ключ: `wizard-store`
   - Восстановление при перезагрузке страницы

2. **Collapsible sections:**
   - Каждый шаг - `<details>` элемент
   - Состояние открытия в store
   - Автоматическое открытие текущего шага

3. **История ИНН:**
   - Автодополнение через `<datalist>`
   - Сохранение последних поисков
   - Быстрый повтор

4. **Автоматическая генерация ID:**
   - Contract External ID: `contract_${timestamp}_${random}`
   - Creative External ID: `creative_${timestamp}_${random}`

5. **Template indicator:**
   - Показывается когда данные из шаблона
   - Помогает понять источник данных

6. **AI интеграция:**
   - Анализ текста креатива
   - Предложение релевантных ККТУ кодов
   - Сокращение времени на подбор

## Примеры использования

### Первый раз получить ERID
1. Перейти на `/wizard`
2. Ввести ИНН рекламодателя → Найти → Создать
3. Ввести ИНН исполнителя → Найти → Создать
4. Поставить галочку согласия → Далее
5. Создать контракт с суммой → Далее
6. Заполнить креатив, добавить ККТУ → Создать креатив
7. Скопировать полученный ERID

### Использовать шаблон
1. Нажать "Загрузить из шаблона"
2. Выбрать нужный шаблон из списка
3. Изменить текст креатива (остальное заполнено)
4. Создать креатив → получить ERID

### Получить AI подсказки ККТУ
1. На шаге 3 ввести текст креатива
2. Нажать "Получить AI подсказки ККТУ" 🤖
3. Просмотреть предложенные коды
4. Добавить подходящие одним кликом

## Будущие улучшения

1. **Batch creation** - несколько креативов за раз
2. **Медиа интеграция** - загрузка баннеров/видео прямо из wizard
3. **Расширенная валидация** - проверка перед отправкой
4. **История ERID** - список всех полученных ERID
5. **Export/Import** - сохранение всего flow в JSON
6. **Автосохранение** - периодическое сохранение прогресса
7. **Уведомления** - оповещение о статусе модерации

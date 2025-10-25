# Инструкция по работе с Flow Templates API для фронтенд разработчика

## Обзор

Flow Templates — это система управления шаблонами потоков для VK ORD API. Позволяет сохранять, редактировать и повторно использовать конфигурации для различных типов операций.

---

## 1. Типы шаблонов (FlowTemplateType)

Система поддерживает следующие типы шаблонов:

```typescript
enum FlowTemplateType {
  Basic = 0,              // Базовый шаблон потока
  VkOrdContract = 1,      // Шаблон для контрактов VK ORD
  VkOrdCreative = 2,      // Шаблон для креативов
  VkOrdStatistics = 3,    // Шаблон для статистики
  VkOrdWizard = 4,        // Шаблон для Wizard
  Custom = 99             // Пользовательский шаблон
}
```

**Важно**: Каждый тип имеет свою структуру данных для поля `value`. На фронтенде необходимо использовать соответствующий тип данных в зависимости от `FlowTemplateType`.

---

## 2. API Endpoints

### 2.1 Создание шаблона

**POST** `/api/flow-templates`

#### Request
```json
{
  "name": "Мой первый шаблон",
  "type": 4,  // FlowTemplateType.VkOrdWizard
  "description": "Описание шаблона",
  "value": {
    // Структура value зависит от type - см. раздел 3
  },
  "tags": ["tag1", "tag2"]
}
```

#### Response (201 Created)
```json
{
  "id": 123,
  "publicId": "550e8400-e29b-41d4-a716-446655440000",
  "apiCredentialId": 456,
  "name": "Мой первый шаблон",
  "type": 4,
  "description": "Описание шаблона",
  "value": { /* десериализованный объект */ },
  "tags": ["tag1", "tag2"],
  "version": 1,
  "isActive": true,
  "createdAt": "2025-10-19T10:30:00Z",
  "updatedAt": "2025-10-19T10:30:00Z",
  "lastUsedAt": null,
  "useCount": 0
}
```

---

### 2.2 Получение списка шаблонов

**GET** `/api/flow-templates`

#### Query Parameters
```
?limit=50
&offset=0
&search=текст для поиска
&type=4
&tags=tag1,tag2
&sort=created_at  // или: name, use_count, last_used_at
&order=desc       // или: asc
&activeOnly=false
```

#### Response (200 OK)
```json
{
  "data": [
    {
      "id": 123,
      "publicId": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Мой первый шаблон",
      "type": 4,
      "description": "Описание шаблона",
      "tags": ["tag1", "tag2"],
      "isActive": true,
      "createdAt": "2025-10-19T10:30:00Z",
      "lastUsedAt": "2025-10-19T11:00:00Z",
      "useCount": 5
    }
  ],
  "pagination": {
    "total": 42,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

---

### 2.3 Получение шаблона по ID

**GET** `/api/flow-templates/{id}`

#### Response (200 OK)
```json
{
  "id": 123,
  "publicId": "550e8400-e29b-41d4-a716-446655440000",
  "apiCredentialId": 456,
  "name": "Мой первый шаблон",
  "type": 4,
  "description": "Описание шаблона",
  "value": { /* полные данные, включая обогащенные данные с сервера */ },
  "tags": ["tag1", "tag2"],
  "version": 1,
  "isActive": true,
  "createdAt": "2025-10-19T10:30:00Z",
  "updatedAt": "2025-10-19T10:30:00Z",
  "lastUsedAt": "2025-10-19T11:00:00Z",
  "useCount": 5
}
```

---

### 2.4 Обновление шаблона

**PUT** `/api/flow-templates/{id}`

#### Request
```json
{
  "name": "Обновленное имя",
  "type": 4,
  "description": "Новое описание",
  "value": { /* обновленные данные */ },
  "tags": ["новый_tag"],
  "isActive": true
}
```

**Все поля опциональны** — отправляйте только те, которые хотите обновить.

#### Response (200 OK)
```json
{
  "id": 123,
  "version": 2,  // версия инкрементировалась
  "updatedAt": "2025-10-19T11:30:00Z",
  // остальные поля...
}
```

---

### 2.5 Удаление шаблона (Soft Delete)

**DELETE** `/api/flow-templates/{id}`

#### Response (204 No Content)
Нет содержимого, статус 204 означает успех.

---

### 2.6 Активация/деактивация шаблона

**PATCH** `/api/flow-templates/{id}/activate`

#### Request
```json
{
  "isActive": false
}
```

#### Response (200 OK)
```json
{
  "success": true
}
```

---

### 2.7 Увеличение счетчика использования

**POST** `/api/flow-templates/{id}/use`

Вызывайте этот эндпоинт, когда пользователь применяет шаблон.

#### Response (200 OK)
```json
{
  "success": true
}
```

---

### 2.8 Получение типов шаблонов

**GET** `/api/flow-templates/types/all`

**Не требует авторизации** (AllowAnonymous)

#### Response (200 OK)
```json
{
  "types": [
    {
      "type": 0,
      "name": "Basic",
      "description": "Базовый шаблон потока"
    },
    {
      "type": 1,
      "name": "VkOrdContract",
      "description": "Шаблон для контрактов VK ORD"
    },
    {
      "type": 2,
      "name": "VkOrdCreative",
      "description": "Шаблон для креативов"
    },
    {
      "type": 3,
      "name": "VkOrdStatistics",
      "description": "Шаблон для статистики"
    },
    {
      "type": 4,
      "name": "VkOrdWizard",
      "description": "Шаблон для Wizard"
    },
    {
      "type": 99,
      "name": "Custom",
      "description": "Пользовательский шаблон"
    }
  ]
}
```

---

## 3. Структуры данных для поля `value` по типам

### ⚠️ КРИТИЧНО: Соответствие контрактов

На фронтенде ДОЛЖНЫ использоваться точные структуры. При несовпадении валидация на бэке отклонит запрос.

---

### 3.1 VkOrdWizard (type = 4)

**Входные данные (CreateFlowTemplateRequest/UpdateFlowTemplateRequest):**

```typescript
// Что отправляется на создание/обновление
value: {
  contractExternalId: "string",      // Внешний ID контракта из VK ORD
  contractorExternalId: "string",    // Внешний ID подрядчика
  clientExternalId: "string",        // Внешний ID клиента
  creativeExternalId: "string"       // Внешний ID креатива
}
```

**Выходные данные (FlowTemplateResponse - при GET):**

```typescript
// Что возвращается при получении шаблона
// Система обогащает данные, подгружая полные объекты с сервера
value: {
  contract: {
    id: 123,
    externalId: "string",
    // ... полная структура VkOrdContract
  },
  contractor: {
    id: 456,
    externalId: "string",
    // ... полная структура VkOrdCounterparty
  },
  client: {
    id: 789,
    externalId: "string",
    // ... полная структура VkOrdCounterparty
  },
  creative: {
    id: 101112,
    externalId: "string",
    // ... полная структура VkOrdCreative
  }
}
```

**Использование на фронтенде:**

```typescript
// При создании
const request: CreateFlowTemplateRequest = {
  name: "Мой Wizard",
  type: FlowTemplateType.VkOrdWizard,
  value: {
    contractExternalId: "contract_123",
    contractorExternalId: "party_456",
    clientExternalId: "party_789",
    creativeExternalId: "creative_101"
  }
};

// При получении
const response = await getFlowTemplate(templateId);
if (response.type === FlowTemplateType.VkOrdWizard) {
  const wizardData = response.value as WizardFlowTemplateResponse;
  // Теперь доступны полные объекты:
  console.log(wizardData.contract);      // VkOrdContract
  console.log(wizardData.contractor);    // VkOrdCounterparty
  console.log(wizardData.client);        // VkOrdCounterparty
  console.log(wizardData.creative);      // VkOrdCreative
}
```

---

### 3.2 VkOrdContract (type = 1)

**Структура для type = 1** (требует уточнения - сейчас не используется)

```typescript
value: {
  // Определение зависит от требований VK ORD Contract API
  // На текущий момент используется только VkOrdWizard
}
```

---

### 3.3 VkOrdCreative (type = 2)

**Структура для type = 2** (требует уточнения - сейчас не используется)

```typescript
value: {
  // Определение зависит от требований VK ORD Creative API
  // На текущий момент используется только VkOrdWizard
}
```

---

### 3.4 VkOrdStatistics (type = 3)

**Структура для type = 3** (требует уточнения - сейчас не используется)

```typescript
value: {
  // Определение зависит от требований VK ORD Statistics API
  // На текущий момент используется только VkOrdWizard
}
```

---

### 3.5 Basic (type = 0) и Custom (type = 99)

На текущий момент эти типы не имеют специальной валидации. Могут содержать любой JSON.

```typescript
value: {
  // Произвольная структура JSON
  [key: string]: any
}
```

---

## 4. Обработка ошибок

### 4.1 Ошибки валидации (400 Bad Request)

```json
{
  "errors": [
    {
      "code": 400,
      "message": "Шаблон с именем 'Мой шаблон' уже существует"
    }
  ]
}
```

**Возможные ошибки:**
- `FlowTemplateWithSuchNameAlreadyExists` — имя шаблона не уникально для текущих credentials
- `FlowTemplateProcessingError` — ошибка при обработке value
- `ContractNotFound` — контракт не найден в VK ORD
- `CreativeNotFound` — креатив не найден в VK ORD
- `DataIsEmpty` — контрагент не найден

### 4.2 Не найдено (404 Not Found)

```json
{
  "errors": [
    {
      "code": 404,
      "message": "Шаблон не найден"
    }
  ]
}
```

---

## 5. Логика выбора структуры на фронтенде

```typescript
interface FlowTemplateBase {
  id: number;
  publicId: string;
  name: string;
  type: FlowTemplateType;
  description?: string;
  tags: string[];
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
  useCount: number;
}

// Тип зависит от type
interface FlowTemplateResponse extends FlowTemplateBase {
  value: FlowTemplateValueByType[FlowTemplateType];
}

// Маппинг структур value по типам
type FlowTemplateValueByType = {
  [FlowTemplateType.VkOrdWizard]: WizardFlowTemplateResponse;
  [FlowTemplateType.VkOrdContract]: any; // TBD
  [FlowTemplateType.VkOrdCreative]: any; // TBD
  [FlowTemplateType.VkOrdStatistics]: any; // TBD
  [FlowTemplateType.Basic]: any;
  [FlowTemplateType.Custom]: any;
};

// Использование
function renderTemplate(template: FlowTemplateResponse) {
  switch (template.type) {
    case FlowTemplateType.VkOrdWizard:
      const wizardValue = template.value as WizardFlowTemplateResponse;
      return renderWizardTemplate(wizardValue);
    
    case FlowTemplateType.VkOrdContract:
      // const contractValue = template.value as ContractTemplateValue;
      // return renderContractTemplate(contractValue);
      break;
    
    default:
      return renderBasicTemplate(template.value);
  }
}
```

---

## 6. Примеры использования

### 6.1 Создание и сохранение Wizard шаблона

```typescript
async function saveWizardTemplate() {
  const request: CreateFlowTemplateRequest = {
    name: "Импорт данных для Wizard",
    type: FlowTemplateType.VkOrdWizard,
    description: "Шаблон для быстрого импорта контрактов",
    value: {
      contractExternalId: "contract_ext_123",
      contractorExternalId: "party_ext_456",
      clientExternalId: "party_ext_789",
      creativeExternalId: "creative_ext_101"
    },
    tags: ["wizard", "import", "production"]
  };

  const response = await fetch('/api/flow-templates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-vkord-credential-id': credentialId
    },
    body: JSON.stringify(request)
  });

  const template = await response.json();
  console.log('Шаблон создан:', template.id);
}
```

### 6.2 Получение и применение шаблона

```typescript
async function applyWizardTemplate(templateId: number) {
  // Получить шаблон
  const response = await fetch(`/api/flow-templates/${templateId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-vkord-credential-id': credentialId
    }
  });

  const template = await response.json();

  if (template.type !== FlowTemplateType.VkOrdWizard) {
    throw new Error('Неправильный тип шаблона');
  }

  const wizardData = template.value as WizardFlowTemplateResponse;

  // Применить данные к форме
  loadWizardForm({
    contract: wizardData.contract,
    contractor: wizardData.contractor,
    client: wizardData.client,
    creative: wizardData.creative
  });

  // Увеличить счетчик использования
  await fetch(`/api/flow-templates/${templateId}/use`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-vkord-credential-id': credentialId
    }
  });
}
```

### 6.3 Список и фильтрация шаблонов

```typescript
async function getWizardTemplates() {
  const params = new URLSearchParams({
    type: FlowTemplateType.VkOrdWizard.toString(),
    activeOnly: 'true',
    sort: 'use_count',
    order: 'desc',
    limit: '10'
  });

  const response = await fetch(`/api/flow-templates?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-vkord-credential-id': credentialId
    }
  });

  const result = await response.json();
  
  return result.data.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    usedCount: item.useCount,
    lastUsed: item.lastUsedAt
  }));
}
```

---

## 7. TypeScript типы для фронтенда

```typescript
// Enums
export enum FlowTemplateType {
  Basic = 0,
  VkOrdContract = 1,
  VkOrdCreative = 2,
  VkOrdStatistics = 3,
  VkOrdWizard = 4,
  Custom = 99
}

// DTOs для создания/обновления
export interface CreateFlowTemplateRequest {
  name: string;
  type: FlowTemplateType;
  description?: string;
  value: any; // тип зависит от type
  tags?: string[];
}

export interface UpdateFlowTemplateRequest {
  name?: string;
  type?: FlowTemplateType;
  description?: string;
  value?: any;
  tags?: string[];
  isActive?: boolean;
}

export interface ActivateFlowTemplateRequest {
  isActive: boolean;
}

// DTOs для ответов
export interface FlowTemplateListItemResponse {
  id: number;
  publicId: string;
  name: string;
  type: FlowTemplateType;
  description?: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
  useCount: number;
}

export interface FlowTemplateResponse extends FlowTemplateListItemResponse {
  apiCredentialId: number;
  value: any;
  version: number;
  updatedAt: string;
}

export interface FlowTemplateListResponse {
  data: FlowTemplateListItemResponse[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface FlowTemplateTypeDto {
  type: FlowTemplateType;
  name: string;
  description: string;
}

export interface FlowTemplateTypesResponse {
  types: FlowTemplateTypeDto[];
}

// Специфичные для VkOrdWizard
export interface WizardFlowTemplateData {
  contractExternalId: string;
  contractorExternalId: string;
  clientExternalId: string;
  creativeExternalId: string;
}

export interface WizardFlowTemplateResponse {
  contract: VkOrdContract;
  contractor: VkOrdCounterparty;
  client: VkOrdCounterparty;
  creative: VkOrdCreative;
}
```

---

## 8. Заголовки запросов

Все запросы (кроме `/api/flow-templates/types/all`) требуют:

```
Authorization: Bearer {jwt_token}
x-vkord-credential-id: {credential_public_id}
Content-Type: application/json
```

**Где взять `x-vkord-credential-id`?**
- Получить список credentials: `GET /api/credentials/v1/{userId}`
- Использовать `publicId` из ответа

---

## 9. Кэширование на фронтенде

### Рекомендации:

```typescript
// Кэшируйте типы шаблонов (не меняются часто)
const templateTypes = await fetchTemplateTypes();
localStorage.setItem('flowTemplateTypes', JSON.stringify(templateTypes));

// Для списков применяйте кэш с инвалидацией
const TEMPLATES_CACHE_TIME = 5 * 60 * 1000; // 5 минут
let templatesCache = null;
let templatesCacheTime = 0;

async function getTemplatesList() {
  if (Date.now() - templatesCacheTime < TEMPLATES_CACHE_TIME && templatesCache) {
    return templatesCache;
  }
  
  templatesCache = await fetchTemplatesList();
  templatesCacheTime = Date.now();
  return templatesCache;
}

// Инвалидируйте кэш при создании/обновлении
function invalidateTemplatesCache() {
  templatesCache = null;
  templatesCacheTime = 0;
}
```

---

## 10. Диаграмма потока данных

```
┌─────────────────────────────────────────────────────────┐
│           WIZARD FLOW TEMPLATE FLOW                     │
└─────────────────────────────────────────────────────────┘

1. СОЗДАНИЕ
   Frontend                          Backend
     │                                │
     ├─ CreateFlowTemplateRequest    │
     │  (с External IDs)             │
     └──────────────────────────────>│
                                     ├─ Валидация structure
                                     ├─ Запрос в VK ORD API
                                     ├─ Проверка существования
                                     └─ Сохранение в БД
                    FlowTemplateResponse│
     <──────────────────────────────────┤

2. ПОЛУЧЕНИЕ
   Frontend                          Backend
     │                                │
     ├─ GET /api/flow-templates/{id} │
     └──────────────────────────────>│
                                     ├─ Загрузка из БД
                                     ├─ Обогащение данных
                                     │ (запрос в VK ORD API)
                                     └─ Возврат полных объектов
     <──────────────────────────────────┤
     │ (value содержит полные)         │
     │  Contract, Counterparties,      │
     │  Creative)                      │
     │                                │

3. ПРИМЕНЕНИЕ
   Frontend                          Backend
     │                                │
     ├─ POST /use                    │
     └──────────────────────────────>│
                                     ├─ Инкремент UseCount
                                     ├─ Обновление LastUsedAt
                                     └─ Сохранение
                    { success: true } │
     <──────────────────────────────────┤
     │                                │
     └─ Применить данные в UI        │
```

---

## 11. Контрольный список для разработчика фронтенда

- [ ] Получить список типов шаблонов (`/api/flow-templates/types/all`)
- [ ] Реализовать форму создания с выбором типа
- [ ] Для каждого типа реализовать соответствующий UI ввода `value`
- [ ] Валидировать структуру `value` перед отправкой
- [ ] При получении шаблона определять его тип и выбирать правильный компонент отображения
- [ ] Реализовать обогащение UI данными из `value` (особенно для Wizard)
- [ ] Вызывать `/use` при применении шаблона пользователем
- [ ] Реализовать пагинацию в списке шаблонов
- [ ] Добавить фильтрацию по типу и поиск
- [ ] Обработать ошибки валидации с информативными сообщениями
- [ ] Кэшировать типы и списки со сбросом при изменениях

---

## 12. Заключение

**Ключевые моменты:**

1. ✅ **Всегда проверяйте тип шаблона** перед работой с `value`
2. ✅ **На фронте используйте точные структуры** для каждого типа
3. ✅ **Вход (создание) отличается от выхода (получение)**
   - При создании: отправляем External IDs
   - При получении: получаем полные обогащенные объекты
4. ✅ **Вызывайте `/use` при применении** шаблона пользователем
5. ✅ **Обрабатывайте ошибки валидации** с информативными сообщениями пользователю

# Фича: VK ORD Credentials (Учетные данные)

## Описание

Модуль управления токенами доступа к VK ORD API. Позволяет создавать, редактировать и удалять credentials (токены) для работы с sandbox и production окружениями VK ORD.

## Основные компоненты

### CredentialsPage (`CredentialsPage.tsx`)

**Назначение:** Страница управления VK ORD токенами

**Функциональность:**
1. Просмотр списка всех токенов
2. Создание нового токена
3. Редактирование существующего токена
4. Удаление токена
5. Маскирование токенов для безопасности

## Структура данных

### Credential
```typescript
interface Credential {
  id: string
  environment: 'Sandbox' | 'Production'
  tokenPlain?: string           // Используется только при создании/обновлении
  displayName?: string          // Отображаемое имя токена
  createdAt: string
  updatedAt: string
}
```

### API Response
```typescript
interface ApiCredentialResponse {
  id: string
  environment: 'Sandbox' | 'Production'
  displayName?: string
  createdAt: string
  updatedAt: string
  // tokenPlain не возвращается в ответах для безопасности
}
```

## API Hooks

Хуки определены в `src/features/credentials/hooks/`:

### useCredentials()

Получает список всех токенов пользователя.

**Query Key:** `['credentials', userProfile.publicId]`

**Endpoint:** `GET /api/credentials/v1/{publicId}`

**Зависимости:** требует загруженного профиля пользователя

**Особенности:**
- Автоматически обрабатывает различные форматы ответа от сервера
- Поддержка массивов в полях `data`, `items`, `$values`
- Всегда возвращает массив (даже при ошибках)

### useCreateCredential()

Создает новый токен.

**Mutation Function:** `POST /api/credentials/v1/me`

**Request Body:**
```typescript
interface CreateCredentialRequest {
  environment: 'Sandbox' | 'Production'
  tokenPlain: string          // Обязательно при создании
  displayName?: string
}
```

**Поведение:**
- Успех: автоматическая инвалидация cache + закрытие диалога
- Ошибка: отображение в Alert

### useUpdateCredential()

Обновляет существующий токен.

**Mutation Function:** `PUT /api/credentials/v1/{id}`

**Request Body:**
```typescript
interface UpdateCredentialRequest {
  environment?: 'Sandbox' | 'Production'
  tokenPlain?: string         // Опционально (если не указан, токен не меняется)
  displayName?: string
}
```

**Особенности:**
- Все поля опциональны
- Если tokenPlain пустой - токен не изменяется
- Обновляются только указанные поля

### useDeleteCredential()

Удаляет токен.

**Mutation Function:** `DELETE /api/credentials/v1/{id}`

**Параметры:** ID токена

**Подтверждение:** window.confirm перед удалением

## UI Компоненты

**Material UI:**
- Table, TableContainer, TableHead, TableBody, TableRow, TableCell - таблица токенов
- Dialog, DialogTitle, DialogContent, DialogActions - модальное окно
- TextField - поля формы
- FormControl, InputLabel, Select, MenuItem - выбор окружения
- Chip - badges для окружения
- Alert - отображение ошибок
- Tooltip - подсказки
- Typography, Paper, Box - layout

**Material UI Icons:**
- AddIcon - добавить токен
- EditIcon - редактировать
- DeleteIcon - удалить
- VpnKeyIcon - иконка токенов (placeholder)

**shadcn/ui:**
- Button - кнопки действий

## Основной функционал

### 1. Список токенов (Таблица)

**Колонки:**
- **Название** - displayName или "Без названия"
- **Окружение** - Sandbox (серый chip) / Production (красный chip)
- **Токен** - замаскированный (****...***)
- **Создан** - дата создания
- **Обновлен** - дата обновления
- **Действия** - кнопки Edit/Delete

**Пустое состояние:**
- Иконка VpnKey (64px)
- Текст "Нет сохраненных токенов"
- Кнопка "Добавить первый токен"

### 2. Создание токена (Диалог)

**Поля:**
- **Окружение** (обязательно) - Select с опциями Sandbox/Production
- **Токен VK ORD** (обязательно) - TextField type="password"
- **Отображаемое название** (опционально) - TextField с placeholder

**Валидация:**
- Токен обязателен
- Кнопка "Создать" disabled если токен пустой

### 3. Редактирование токена (Диалог)

**Поля:**
- **Окружение** - Select (можно изменить)
- **Токен VK ORD** - TextField type="password" (опционально)
  - Placeholder: "Оставьте пустым, если не хотите менять токен"
- **Отображаемое название** - TextField (можно изменить)

**Логика:**
- Токен можно оставить пустым (не изменится)
- Обновляются только измененные поля
- Сравнение с исходными значениями

### 4. Удаление токена

**Процесс:**
1. Нажать кнопку Delete (иконка)
2. Confirm диалог: "Вы уверены, что хотите удалить этот токен?"
3. При подтверждении - DELETE запрос
4. При успехе - токен исчезает из списка

## Безопасность

### Маскирование токенов

Функция `maskToken()`:
```typescript
const maskToken = (token: string) => {
  if (token.length <= 8) return '*'.repeat(token.length)
  return token.substring(0, 4) + '*'.repeat(token.length - 8) + token.substring(token.length - 4)
}
```

**Примеры:**
- `"abc123xyz789"` → `"abc1*****789"`
- `"short"` → `"*****"`

**Особенности:**
- Показываются только первые 4 и последние 4 символа
- Середина заменяется на звездочки
- В таблице всегда показывается placeholder текст

### Хранение токенов

- **Клиент:** токены НЕ хранятся на клиенте (кроме временного в форме)
- **Сервер:** токены хранятся на бэкенде в зашифрованном виде
- **API ответы:** tokenPlain никогда не возвращается из API
- **Формы:** поле password type скрывает ввод

## Цвета и индикация

**Окружение:**
- **Sandbox** - Chip цвет: `default` (серый)
- **Production** - Chip цвет: `error` (красный)

**Кнопки действий:**
- Edit - `variant="ghost"` + EditIcon
- Delete - `variant="ghost"` + DeleteIcon

## Состояния UI

### Загрузка
```tsx
if (isLoading) {
  return <Typography>Загрузка credentials...</Typography>
}
```

### Ошибка загрузки
```tsx
if (error) {
  return (
    <Alert severity="error">
      Ошибка загрузки credentials: {error.message}
    </Alert>
  )
}
```

### Пустой список
Специальная карточка с иконкой и призывом к действию.

### Мутации в процессе
- Кнопки disabled
- Текст "Сохранение..." / "Создание..."

## Навигация

**Маршрут:** `/credentials`

**Доступ:** Защищенный маршрут (требуется аутентификация)

**Расположение в меню:** Дашборд → Credentials (карточка на главной)

## API Endpoints

### GET `/api/credentials/v1/{publicId}`
Получить все токены пользователя.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "environment": "Sandbox",
    "display_name": "Тестовый токен",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### POST `/api/credentials/v1/me`
Создать новый токен.

**Request Body:**
```json
{
  "environment": "Sandbox",
  "token_plain": "your-vk-ord-token-here",
  "display_name": "Мой токен"
}
```

### PUT `/api/credentials/v1/{id}`
Обновить токен.

**Request Body:**
```json
{
  "environment": "Production",
  "token_plain": "new-token-if-changing",
  "display_name": "Обновленное название"
}
```

### DELETE `/api/credentials/v1/{id}`
Удалить токен.

**Response:** 204 No Content

## Использование токенов

### Автоматический выбор
При выполнении API запросов к VK ORD:
1. Читается cookie `x-vkord-credential-id`
2. Если есть - используется указанный токен
3. Если нет - используется первый доступный токен для текущего окружения

### Переключение окружения
В `useEnvironmentStore`:
```typescript
const environment = useEnvironmentStore(state => state.environment) // 'sandbox' | 'production'
```

HTTP interceptor добавляет заголовок:
```
x-api-vk-env: sandbox
```

### Cookie установка
Backend устанавливает cookie `x-vkord-credential-id` при выборе токена.

## Связанные модули

- **Environment Store** (`src/auth/tokenStore.ts`) - переключение sandbox/production
- **HTTP Client** (`src/api/http.ts`) - добавление `x-vkord-credential-id` и `x-api-vk-env`
- **User Profile** - получение `publicId` пользователя

## Примеры использования

### Добавить токен для Sandbox
1. Нажать "Добавить токен"
2. Выбрать окружение: Sandbox
3. Вставить токен VK ORD
4. Ввести название: "Тестовый токен"
5. Нажать "Создать"

### Изменить окружение токена
1. Нажать Edit (иконка карандаша)
2. Изменить окружение с Sandbox на Production
3. Нажать "Обновить"

### Обновить токен без изменения окружения
1. Нажать Edit
2. Вставить новый токен в поле "Токен VK ORD"
3. Оставить окружение и название без изменений
4. Нажать "Обновить"

## Особенности реализации

1. **Кастомная логика обновления:**
   - Сравнение с исходными значениями
   - Обновление только измененных полей
   - Undefined для неизмененных значений

2. **Обработка различных форматов API:**
   - Прямой массив
   - Обертка в `{ data: [] }`
   - Обертка в `{ items: [] }`
   - .NET формат с `{ $values: [] }`

3. **Query invalidation:**
   - После создания/обновления/удаления
   - Автоматическое обновление списка
   - Использование `queryClient.invalidateQueries`

4. **Форматирование дат:**
   ```typescript
   new Date(credential.createdAt).toLocaleDateString('ru-RU')
   ```

5. **Tooltip для безопасности:**
   - Наведение на замаскированный токен
   - Подсказка: "Токен скрыт для безопасности"

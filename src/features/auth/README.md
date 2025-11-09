# Фича: Аутентификация (Auth)

## Описание

Модуль аутентификации обеспечивает регистрацию, вход и управление сессиями пользователей в системе VK ORD. Использует токен-based аутентификацию с автоматическим обновлением токенов через httpOnly cookies.

## Основные компоненты

### 1. LoginPage (`LoginPage.tsx`)

**Назначение:** Страница входа в систему

**Функциональность:**
- Форма входа с полями "Имя пользователя" и "Пароль"
- Валидация полей (обязательные поля)
- Отображение ошибок аутентификации
- Состояние загрузки во время входа
- Ссылка на страницу регистрации

**UI Компоненты:**
- Material UI: Container, Paper, TextField, Typography, Box, Alert
- shadcn/ui: Button

**Навигация:**
- Маршрут: `/login`
- После успешного входа: редирект на `/dashboard`
- Ссылка на регистрацию: `/register`

### 2. RegisterPage (`RegisterPage.tsx`)

**Назначение:** Страница регистрации нового пользователя

**Функциональность:**
- Форма регистрации с полями:
  - Имя пользователя (обязательно)
  - Отображаемое имя (опционально)
  - Пароль (обязательно)
- Валидация полей
- Отображение ошибок регистрации
- Состояние загрузки во время регистрации
- Ссылка на страницу входа

**UI Компоненты:**
- Material UI: Container, Paper, TextField, Typography, Box, Alert
- shadcn/ui: Button

**Навигация:**
- Маршрут: `/register`
- После успешной регистрации: автоматический вход и редирект на `/dashboard`
- Ссылка на вход: `/login`

## Хуки аутентификации

Хуки определены в `src/auth/hooks.ts`:

### useLogin()
Мутация для входа в систему. Принимает `{ userName, password }`.

**Успешный ответ:**
```typescript
{
  accessToken: string
  refreshToken: string
}
```

**Поведение:**
- Сохраняет access token в Zustand store (в памяти)
- Refresh token сохраняется в httpOnly cookie через backend
- Редиректит на `/dashboard`

### useRegister()
Мутация для регистрации нового пользователя. Принимает `{ userName, password, name? }`.

**Успешный ответ:**
```typescript
{
  accessToken: string
  refreshToken: string
}
```

**Поведение:**
- Автоматически выполняет вход после регистрации
- Сохраняет токены
- Редиректит на `/dashboard`

### useLogout()
Мутация для выхода из системы.

**Поведение:**
- Очищает access token из памяти
- Удаляет refresh token cookie через API запрос
- Редиректит на `/login`

### useAutoRefresh()
Хук для автоматического обновления токена при монтировании приложения.

**Поведение:**
- Запускается при загрузке приложения
- Пытается обновить access token используя refresh token из cookie
- Если успешно - пользователь остается авторизованным
- Если неудачно - токены очищаются

## API Endpoints

### POST `/api/auth/login`
Вход в систему.

**Request Body:**
```json
{
  "user_name": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access_token": "string",
  "refresh_token": "string"
}
```

### POST `/api/auth/register`
Регистрация нового пользователя.

**Request Body:**
```json
{
  "user_name": "string",
  "password": "string",
  "name": "string" // optional
}
```

**Response:**
```json
{
  "access_token": "string",
  "refresh_token": "string"
}
```

### POST `/api/auth/logout`
Выход из системы (удаление refresh token).

**Request:** Пустое тело (refresh token передается через cookie)

**Response:** 200 OK

### POST `/api/auth/refresh`
Обновление access token.

**Request:** Пустое тело (refresh token передается через cookie)

**Response:**
```json
{
  "access_token": "string"
}
```

## Типы данных

```typescript
interface LoginRequest {
  userName: string
  password: string
}

interface RegisterRequest {
  userName: string
  password: string
  name?: string
}

interface AuthResponse {
  accessToken: string
  refreshToken: string
}
```

## Механизм работы токенов

### Access Token
- Хранится: в памяти (Zustand store `useTokenStore`)
- Время жизни: короткое (обычно 15-30 минут)
- Использование: добавляется в заголовок Authorization каждого API запроса
- Не сохраняется в localStorage для безопасности

### Refresh Token
- Хранится: в httpOnly cookie через backend
- Время жизни: длительное (обычно 7-30 дней)
- Использование: автоматическое обновление access token при истечении
- Недоступен для JavaScript (защита от XSS)

### Автоматическое обновление
Логика в `src/api/http.ts`:
1. При получении 401 ответа (кроме `/api/auth/*` эндпоинтов)
2. Ставит все последующие запросы в очередь
3. Делает запрос на `/api/auth/refresh`
4. Если успешно - сохраняет новый access token и повторяет все запросы из очереди
5. Если неудачно - очищает токены и редиректит на `/login`

## Защита маршрутов

### ProtectedRoute
Обертка для защищенных страниц (требуют аутентификации).

**Логика:**
- Проверяет наличие access token
- Если токена нет - редирект на `/login`
- Если токен есть - рендерит страницу

**Использование:**
```tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

### PublicRoute
Обертка для публичных страниц (login, register).

**Логика:**
- Проверяет наличие access token
- Если токен есть - редирект на `/dashboard`
- Если токена нет - рендерит страницу

**Использование:**
```tsx
<Route
  path="/login"
  element={
    <PublicRoute>
      <LoginPage />
    </PublicRoute>
  }
/>
```

## Связанные модули

- **Token Store** (`src/auth/tokenStore.ts`) - Zustand хранилище для токенов
- **HTTP Client** (`src/api/http.ts`) - Axios инстанс с interceptors для токенов
- **Profile** (`src/features/users`) - Профиль авторизованного пользователя

## Тестовые данные

Для разработки и тестирования используйте:
- **Username:** 123123
- **Password:** 123

## Примеры использования

### Вход в систему
1. Перейти на `/login`
2. Ввести имя пользователя и пароль
3. Нажать "Войти"
4. При успехе - редирект на dashboard

### Регистрация
1. Перейти на `/register`
2. Ввести имя пользователя, пароль и опционально отображаемое имя
3. Нажать "Зарегистрироваться"
4. При успехе - автоматический вход и редирект на dashboard

### Выход
Реализуется через компонент в DashboardLayout с использованием хука `useLogout()`.

## Особенности реализации

1. **Безопасность:**
   - Access token только в памяти (не в localStorage)
   - Refresh token в httpOnly cookie
   - Автоматическая очистка при ошибках

2. **UX:**
   - Disabled состояние кнопок во время загрузки
   - Отображение ошибок через Alert компонент
   - Валидация обязательных полей

3. **Автоматизация:**
   - Автоматическое обновление токенов
   - Повтор неудачных запросов после обновления
   - Автопопытка восстановления сессии при загрузке приложения

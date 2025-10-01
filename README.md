# VK ORD Frontend - Личный Кабинет

Современное React приложение для управления VK ORD (Обязательная Регистрация Данных) через личный кабинет с безопасной аутентификацией.

## 🚀 Описание

Приложение предоставляет полный функционал личного кабинета для работы с VK ORD API:

- 🔐 **Безопасная аутентификация** с JWT токенами и автоматическим refresh
- 👤 **Управление профилем** пользователя
- 🔑 **Управление VK ORD credentials** (токенами)
- 📄 **Работа с контрактами** - создание и просмотр
- 🎨 **Управление креативами** - создание, статус, удаление
- 📎 **Загрузка медиафайлов** с получением ERID
- 🌍 **Переключение окружений** (Sandbox/Production)

## 🏗️ Архитектура

Проект построен по принципам современной веб-разработки с четким разделением ответственности:

### Структура проекта

```
src/
├── api/                    # HTTP клиент и React Query
│   ├── http.ts             # Axios instance с interceptors
│   └── queryClient.ts      # React Query конфигурация
├── auth/                   # Аутентификация
│   ├── hooks.ts            # Auth хуки (login, logout, etc.)
│   └── tokenStore.ts       # In-memory token storage (zustand)
├── components/             # UI компоненты
│   ├── layout/             # Layout компоненты
│   └── ...
├── features/               # Бизнес-функции
│   ├── auth/               # Страницы аутентификации
│   ├── dashboard/          # Главная страница
│   ├── users/              # Профиль пользователя
│   ├── credentials/        # Управление токенами
│   ├── contracts/          # Контракты
│   ├── creatives/          # Креативы
│   └── media/              # Медиафайлы
├── types/                  # TypeScript типы
│   ├── auth.ts             # Типы аутентификации
│   ├── credentials.ts      # Типы credentials
│   ├── business.ts         # Типы бизнес-логики
│   └── index.ts            # Экспорты всех типов
└── routes.tsx              # Роутинг с guards
```

### Ключевые принципы

- **Feature-based architecture**: Группировка кода по бизнес-функциям
- **Type Safety**: Полная типизация TypeScript
- **Separation of Concerns**: Четкое разделение ответственности
- **Modern React**: Хуки, функциональные компоненты
- **Security First**: Безопасное хранение токенов, автоматический refresh

## 🛠️ Технологии

- **React 19** - Современная версия React
- **TypeScript** - Строгая типизация
- **Vite** - Быстрый bundler
- **React Router** - Клиентский роутинг
- **TanStack Query** - Управление серверным состоянием
- **Axios** - HTTP клиент с interceptors
- **Material UI** - UI компоненты
- **Zustand** - Легковесное управление состоянием
- **React Toastify** - Уведомления
- **Zod** - Валидация (готово для использования)

## 📋 Установка и запуск

### Предварительные требования

- Node.js 18+
- npm или yarn

### Установка

1. **Клонируйте репозиторий:**
   ```bash
   git clone <repository-url>
   cd vk-ord-frontend
   ```

2. **Установите зависимости:**
   ```bash
   npm install
   ```

3. **Создайте файл конфигурации:**
   ```bash
   # Создайте .env файл в корне проекта
   echo "VITE_API_BASE_URL=https://your-api-domain.com" > .env
   ```

4. **Запустите приложение:**
   ```bash
   # Режим разработки
   npm run dev

   # Приложение будет доступно на http://localhost:5173
   ```

### Скрипты

- `npm run dev` - запуск сервера разработки
- `npm run build` - сборка для продакшена
- `npm run preview` - предпросмотр собранного приложения

## ⚙️ Конфигурация

### Переменные окружения

Создайте `.env` файл в корне проекта:

```env
# URL бэкенда VK ORD API
VITE_API_BASE_URL=https://your-api-domain.com
```

### Настройка бэкенда

Убедитесь, что ваш .NET 8 бэкенд:

- Поддерживает JWT аутентификацию
- Выдает httpOnly cookies для refresh токенов
- Реализует все необходимые API эндпоинты
- Поддерживает заголовок `x-api-vk-env` для переключения окружений

## 🔐 Аутентификация

### Процесс входа

1. **Регистрация/Вход**: Пользователь вводит userName и password
2. **Получение токенов**: Access токен сохраняется в памяти, refresh в httpOnly cookie
3. **Автоматический refresh**: При истечении access токена автоматически обновляется
4. **Выход**: Очистка токенов и редирект на страницу входа

### Безопасность

- Access токены хранятся только в памяти (не в localStorage)
- Refresh токены в httpOnly cookies (недоступны JavaScript)
- Автоматический logout при ошибках аутентификации
- Защищенные роуты требуют валидной сессии

## 🎯 Использование

### Навигация

Личный кабинет включает следующие разделы:

- **Dashboard** - Главная страница с быстрыми действиями
- **Профиль** - Управление личными данными
- **Credentials** - Управление VK ORD токенами
- **Контракты** - Создание и просмотр контрактов
- **Креативы** - Управление креативами
- **Медиа** - Загрузка и управление файлами

### Работа с API

Все запросы автоматически включают:

- Authorization: Bearer {accessToken}
- withCredentials: true (для cookies)
- x-api-vk-env: "sandbox" | "prod" (в зависимости от выбора)

### Переключение окружений

В боковой панели доступен переключатель Sandbox/Production, который влияет на заголовок `x-api-vk-env` во всех запросах.

## 🧪 Разработка

### Добавление новых функций

1. **Создайте папку в `features/`** для новой бизнес-функции
2. **Реализуйте API хуки** в соответствующей папке
3. **Создайте UI компоненты** с Material UI
4. **Добавьте роуты** в `routes.tsx`
5. **Обновите навигацию** в `DashboardLayout`

### Работа с API

```typescript
// Создание хука для API
export const useMyApiCall = () => {
  return useMutation({
    mutationFn: async (data: MyRequestType) => {
      const response = await http.post<ApiResponse<MyResponseType>>('/api/my-endpoint', data)
      return response.data
    },
  })
}
```

### Стилизация

Используйте Material UI компоненты и theme для консистентного дизайна:

```typescript
import { Button, Paper, Typography } from '@mui/material'

const MyComponent = () => (
  <Paper sx={{ p: 3 }}>
    <Typography variant="h6">Мой компонент</Typography>
    <Button variant="contained">Действие</Button>
  </Paper>
)
```

## 📚 API Reference

### Аутентификация

- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/refresh` - Обновление токена
- `POST /api/auth/logout` - Выход

### Пользователь

- `GET /api/users/me` - Получение профиля
- `PATCH /api/users/me` - Обновление профиля

### Credentials

- `GET /api/credentials` - Список токенов
- `POST /api/credentials` - Создание токена
- `PUT /api/credentials/{id}` - Обновление токена
- `DELETE /api/credentials/{id}` - Удаление токена

### Бизнес-функции

- `PUT /api/contracts/{externalId}` - Создание/обновление контракта
- `GET /api/contracts/{externalId}` - Просмотр контракта
- `POST /api/creatives` - Создание креатива
- `GET /api/creatives/{externalId}` - Просмотр креатива
- `GET /api/creatives/{externalId}/status` - Статус креатива
- `DELETE /api/creatives/{externalId}` - Удаление креатива
- `POST /api/media/upload` - Загрузка файла
- `GET /api/media/{externalId}` - Просмотр файла
- `DELETE /api/media/{externalId}` - Удаление файла

## 🔧 Устранение неполадок

### Проблемы с аутентификацией

1. Проверьте URL бэкенда в `.env`
2. Убедитесь, что бэкенд запущен и доступен
3. Проверьте CORS настройки бэкенда

### Ошибки API

- Все ошибки API отображаются через toast уведомления
- Проверьте Network вкладку в DevTools
- Убедитесь в корректности токенов и заголовков

### Проблемы со сборкой

```bash
# Очистка кэша
rm -rf node_modules/.vite
npm run build
```

## 🤝 Contributing

1. Fork репозиторий
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Создайте Pull Request

## 📄 Лицензия

[Укажите лицензию проекта]

---

Разработано для VK ORD системы с ❤️
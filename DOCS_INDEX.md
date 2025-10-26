# 📚 Индекс документации VK ORD Application

## Оглавление

- [Общая информация](#общая-информация)
- [Фичи (Features)](#фичи-features)
- [Разработка](#разработка)
- [Архитектура](#архитектура)

---

## Общая информация

### Основные файлы

📘 **[README.md](./README.md)** - Главная документация проекта
- Описание проекта
- Установка и запуск
- Архитектура
- shadcn/ui и компоненты
- Система агентов
- API Reference

📙 **[CLAUDE.md](./CLAUDE.md)** - Руководство для AI ассистента (Claude)
- Структура проекта
- Команды разработки
- Паттерны кода
- Важные детали реализации
- Что нельзя делать

📗 **[agents.md](./agents.md)** - Система специализированных агентов
- ui-ux-reviewer
- backend-inspector
- feature-architect
- api-integrator
- state-manager
- testing-specialist

---

## Фичи (Features)

### Обзор всех фич

📗 **[src/features/README.md](./src/features/README.md)** - Главная документация фич
- Список всех фич с описанием
- Связи между фичами
- Паттерны организации
- Технологии
- Начало работы

---

### 1. Auth (Аутентификация)

📘 **[src/features/auth/README.md](./src/features/auth/README.md)**

**Страницы:**
- `/login` - вход в систему
- `/register` - регистрация

**Основная функциональность:**
- Вход/регистрация пользователя
- Token-based аутентификация
- Автоматическое обновление токенов
- Защита маршрутов

**Хуки:**
- `useLogin()` - вход
- `useRegister()` - регистрация
- `useLogout()` - выход
- `useAutoRefresh()` - автообновление токена

---

### 2. Dashboard (Главная панель)

📘 **[src/features/dashboard/README.md](./src/features/dashboard/README.md)**

**Страницы:**
- `/dashboard` - главная панель

**Основная функциональность:**
- Приветственная страница
- Быстрые действия (карточки)
- Персонализация по имени пользователя
- Статистика аккаунта (будущее)

**Быстрые действия:**
- Контракты → `/contracts`
- Креативы → `/creatives`
- Медиа → `/media`
- Credentials → `/credentials`

---

### 3. Users (Профиль пользователя)

📘 **[src/features/users/README.md](./src/features/users/README.md)**

**Страницы:**
- `/profile` - профиль пользователя

**Основная функциональность:**
- Просмотр личной информации
- Редактирование отображаемого имени
- Статистика аккаунта
- Информация о подписке

**Хуки:**
- `useUserProfile()` - получение профиля
- `useUpdateUserProfile()` - обновление профиля

---

### 4. Credentials (VK ORD Токены)

📘 **[src/features/credentials/README.md](./src/features/credentials/README.md)**

**Страницы:**
- `/credentials` - управление токенами

**Основная функциональность:**
- Создание VK ORD токенов
- Редактирование токенов
- Удаление токенов
- Переключение окружения (Sandbox/Production)
- Маскирование токенов для безопасности

**Хуки:**
- `useCredentials()` - список токенов
- `useCreateCredential()` - создание
- `useUpdateCredential()` - обновление
- `useDeleteCredential()` - удаление

---

### 5. Contracts (Контракты)

📘 **[src/features/contracts/README.md](./src/features/contracts/README.md)**

**Страницы:**
- `/contracts` - управление контрактами

**Основная функциональность:**
- Создание/обновление контрактов
- Просмотр деталей контракта
- Связь с контрагентами (client/contractor)

**API Methods:**
- `PUT /api/contracts/{externalId}` - создание/обновление
- `GET /api/contracts/{externalId}` - просмотр

---

### 6. Creatives (Креативы)

📘 **[src/features/creatives/README.md](./src/features/creatives/README.md)**

**Страницы:**
- `/creatives` - управление креативами

**Основная функциональность:**
- Создание креативов
- Связь с контрактами
- Управление ККТУ кодами
- Получение статуса и ERID
- Поиск по ERID
- Список с пагинацией

**Форматы:**
- Banner
- Video
- Text Block
- Text Graphic Block

**Хуки:**
- `useCreativesList()` - список
- `useCreativeByErid()` - поиск по ERID

---

### 7. Media (Медиафайлы)

📘 **[src/features/media/README.md](./src/features/media/README.md)**

**Страницы:**
- `/media` - управление медиафайлами

**Основная функциональность:**
- Загрузка файлов (изображения, видео, аудио)
- Просмотр информации о медиа
- Удаление файлов
- Предпросмотр изображений

**API Methods:**
- `POST /api/media/v1/upload` - загрузка
- `GET /api/media/v1/{externalId}` - просмотр
- `DELETE /api/media/v1/{externalId}` - удаление

---

### 8. Parties (Контрагенты)

📘 **[src/features/parties/README.md](./src/features/parties/README.md)**

**Страницы:**
- `/parties` - управление контрагентами

**Основная функциональность:**
- Поиск контрагентов по ИНН (DaData API)
- Создание контрагентов в VK ORD
- Назначение ролей (Advertiser, Agency, Publisher, ORS)
- Просмотр информации об организациях

**Роли:**
- Advertiser (Рекламодатель)
- Agency (Рекламное агентство)
- Publisher (Издатель)
- ORS (Оператор рекламной системы)

**Хуки:**
- `usePartyLookup()` - поиск по ИНН
- `useSetCounterparty()` - создание в VK ORD

---

### 9. Acts (Акты)

📘 **[src/features/acts/README.md](./src/features/acts/README.md)**

**Страницы:**
- `/acts` - список актов
- `/acts/new` - создание акта
- `/acts/:actId/edit` - редактирование акта

**Основная функциональность:**
- Создание актов оказанных услуг
- Редактирование актов
- Распределение по контрактам и креативам
- Управление статистикой размещения
- Автоматический расчет НДС
- Отправка в VK ORD

**Компоненты:**
- `ActsPage` - список актов
- `ActFormPage` - полная форма (React Hook Form + Zod)
- `ActCreationFlow` - пошаговое создание
- `ActListPanel` - таблица актов
- `PartyLookup` - поиск контрагента

**Статусы:**
- Draft - черновик
- Sent - отправлен
- Approved - утвержден
- Rejected - отклонен
- Error - ошибка

**Хуки:**
- `useActs()` - список актов с пагинацией
- `useActDetails()` - детали акта
- `useCreateAct()` - создание
- `useUpdateAct()` - обновление
- `useSubmitAct()` - отправка в VK ORD
- `useDeleteAct()` - удаление
- `useContractsByParty()` - контракты контрагента
- `useContractCreatives()` - креативы контракта

---

### 10. Wizard (Мастер получения ERID) ⭐

📘 **[src/features/wizard/README.md](./src/features/wizard/README.md)**

**Страницы:**
- `/wizard` - пошаговый мастер

**Основная функциональность:**
- Пошаговый процесс получения ERID
- Выбор контрагентов (рекламодатель + исполнитель)
- Создание/выбор контракта
- Создание креатива с ККТУ кодами
- AI подсказки ККТУ
- Шаблоны для быстрого повтора
- Получение ERID

**4 шага:**

**Step 1: Контрагенты**
- Поиск рекламодателя по ИНН (DaData)
- Создание в VK ORD
- Поиск исполнителя
- Согласие на обработку данных

**Step 2: Контракт**
- Поиск существующего контракта
- Создание нового контракта
- Указание суммы и сроков

**Step 3: Креатив**
- Заполнение данных креатива
- Добавление ККТУ кодов
- AI подсказки ККТУ
- Отправка в VK ORD

**Step 4: Результат**
- Отображение ERID
- Копирование в буфер обмена
- Создание еще одного креатива

**Компоненты:**
- `WizardPage` - контейнер
- `Wizard` - главный компонент
- `WizardCreationFlow` - упрощенный flow
- `Step1Parties` - выбор контрагентов
- `Step2Contract` - создание контракта
- `Step3Creative` - создание креатива
- `Step4Result` - получение ERID
- `PartyInputSection` - ввод контрагента
- `KktyHintsPanel` - AI подсказки
- `TemplateSelector` - выбор шаблона

**Zustand Store:**
- `wizardStore` - состояние всех шагов
- Persist в localStorage

**Хуки:**
- `useStep1Logic()` - логика контрагентов
- `useFlowTemplates()` - работа с шаблонами
- `useCreateCreative()` - создание креатива

---

## Разработка

### Технологии

**Frontend:**
- React 19
- TypeScript
- Vite
- React Router v7
- TanStack Query (React Query)
- Zustand
- React Hook Form + Zod

**UI Libraries:**
- Material UI
- shadcn/ui + Tailwind CSS
- Sonner (toast notifications)

**API:**
- Axios с interceptors
- Automatic camelCase ↔ snake_case conversion
- Automatic token refresh

### Команды разработки

```bash
# Запуск dev сервера
npm run dev

# Сборка проекта
npm run build

# Предпросмотр сборки
npm run preview

# Запуск реестра компонентов
npm run registry:start

# MCP TypeScript helper
npm run mcp:ts-dev
```

### Тестовые данные

**Учетные данные для разработки:**
- Username: `123123`
- Password: `123`

### Паттерны кода

**Компоненты:**
```typescript
export const MyComponent: React.FC<Props> = ({ prop }) => {
  return <div>{prop}</div>
}
```

**API Hooks:**
```typescript
export const useMyData = (id: string) => {
  return useQuery({
    queryKey: ['myData', id],
    queryFn: () => MyService.getData(id)
  })
}
```

**Mutations:**
```typescript
export const useCreateMyData = () => {
  return useMutation({
    mutationFn: (data) => MyService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myData'] })
      toast.success('Создано успешно')
    }
  })
}
```

---

## Архитектура

### Feature-based структура

Каждая фича содержит:
- `README.md` - документация
- `*Page.tsx` - основная страница
- `components/` - компоненты фичи
- `hooks/` - React Query хуки
- `utils/` - утилиты
- `schemas/` - Zod схемы

### Shared модули

**API Layer:**
- `src/api/http.ts` - Axios instance
- `src/api/queryClient.ts` - React Query config
- `src/api/errorHandler.ts` - обработка ошибок

**Auth Layer:**
- `src/auth/hooks.ts` - auth хуки
- `src/auth/tokenStore.ts` - token storage (Zustand)

**Types:**
- `src/types/index.ts` - все TypeScript типы

**Components:**
- `src/components/layout/` - layout компоненты
- `src/components/ui/` - UI примитивы (shadcn/ui)
- `src/components/wizard/` - wizard компоненты
- `src/components/steps/` - шаги wizard

**Stores:**
- `src/stores/wizardStore.ts` - состояние wizard (Zustand)

---

## Связи между фичами

```
Dashboard
   ↓
   ├─→ Auth (login/register)
   ├─→ Users (profile)
   ├─→ Credentials (VK ORD tokens)
   ├─→ Parties (counterparties)
   ├─→ Contracts
   ├─→ Creatives → ERID
   ├─→ Media
   ├─→ Acts
   └─→ Wizard ⭐
         ↓
         ├─→ Parties (search + create)
         ├─→ Contracts (create)
         ├─→ Creatives (create)
         └─→ ERID (result)
```

### Основной flow получения ERID

1. **Wizard Start** (`/wizard`)
2. **Step 1** → Parties (поиск контрагентов)
3. **Step 2** → Contracts (создание контракта)
4. **Step 3** → Creatives (создание креатива + ККТУ)
5. **Step 4** → Result (получение ERID)

---

## Быстрые ссылки

### Основная документация
- [README.md](./README.md) - главная
- [CLAUDE.md](./CLAUDE.md) - для AI
- [agents.md](./agents.md) - агенты

### Фичи
- [Auth](./src/features/auth/README.md)
- [Dashboard](./src/features/dashboard/README.md)
- [Users](./src/features/users/README.md)
- [Credentials](./src/features/credentials/README.md)
- [Contracts](./src/features/contracts/README.md)
- [Creatives](./src/features/creatives/README.md)
- [Media](./src/features/media/README.md)
- [Parties](./src/features/parties/README.md)
- [Acts](./src/features/acts/README.md)
- [Wizard](./src/features/wizard/README.md) ⭐

### Конфигурация
- `.cursor/mcp.json` - MCP конфигурация
- `components.json` - shadcn/ui конфигурация
- `vite.config.ts` - Vite конфигурация
- `tsconfig.json` - TypeScript конфигурация
- `tailwind.config.js` - Tailwind конфигурация

---

**Последнее обновление:** 2024-10-26

**Проект:** VK ORD Frontend Application

**Разработано с ❤️**

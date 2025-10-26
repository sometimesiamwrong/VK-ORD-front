# Фичи (Features) VK ORD Application

## Обзор

Проект организован по **feature-based** архитектуре, где каждая фича содержит все необходимые компоненты: страницы, компоненты, хуки, утилиты и типы.

## Структура директорий

```
src/features/
├── auth/               # Аутентификация и регистрация
├── dashboard/          # Главная панель управления
├── users/              # Профиль пользователя
├── credentials/        # Управление VK ORD токенами
├── contracts/          # Управление контрактами
├── creatives/          # Управление креативами
├── media/              # Управление медиафайлами
├── parties/            # Управление контрагентами
├── acts/               # Управление актами
└── wizard/             # Мастер получения ERID
```

## Описание фич

### 1. Auth (Аутентификация)
**Маршруты:** `/login`, `/register`

**Функциональность:**
- Вход в систему
- Регистрация нового пользователя
- Автоматическое обновление токенов
- Защита маршрутов

**Компоненты:**
- `LoginPage` - страница входа
- `RegisterPage` - страница регистрации

**Хуки:**
- `useLogin()` - вход
- `useRegister()` - регистрация
- `useLogout()` - выход
- `useAutoRefresh()` - автообновление токена

[Подробная документация →](./auth/README.md)

---

### 2. Dashboard (Главная панель)
**Маршруты:** `/dashboard`

**Функциональность:**
- Приветственная страница после входа
- Быстрый доступ к основным разделам
- Отображение профиля пользователя
- Статистика (будущее)

**Компоненты:**
- `DashboardPage` - главная страница с карточками

**Быстрые действия:**
- Контракты
- Креативы
- Медиа
- Credentials

[Подробная документация →](./dashboard/README.md)

---

### 3. Users (Профиль пользователя)
**Маршруты:** `/profile`

**Функциональность:**
- Просмотр личной информации
- Редактирование отображаемого имени
- Статистика аккаунта
- Информация о подписке

**Компоненты:**
- `ProfilePage` - страница профиля

**Редактируемые поля:**
- Отображаемое имя

[Подробная документация →](./users/README.md)

---

### 4. Credentials (VK ORD Токены)
**Маршруты:** `/credentials`

**Функциональность:**
- Создание VK ORD токенов
- Редактирование токенов
- Удаление токенов
- Переключение окружения (Sandbox/Production)

**Компоненты:**
- `CredentialsPage` - управление токенами

**Хуки:**
- `useCredentials()` - список токенов
- `useCreateCredential()` - создание
- `useUpdateCredential()` - обновление
- `useDeleteCredential()` - удаление

[Подробная документация →](./credentials/README.md)

---

### 5. Contracts (Контракты)
**Маршруты:** `/contracts`

**Функциональность:**
- Создание контрактов VK ORD
- Обновление контрактов
- Просмотр деталей контракта
- Связь с контрагентами

**Компоненты:**
- `ContractsPage` - создание и просмотр

**Основные поля:**
- External ID
- Client/Contractor External IDs
- Серийный номер
- Сумма оплаты

[Подробная документация →](./contracts/README.md)

---

### 6. Creatives (Креативы)
**Маршруты:** `/creatives`

**Функциональность:**
- Создание креативов
- Связь с контрактами
- Управление ККТУ кодами
- Получение статуса и ERID
- Поиск по ERID
- Список с пагинацией

**Компоненты:**
- `CreativesPage` - полное управление креативами

**Хуки:**
- `useCreativesList()` - список
- `useCreativeByErid()` - поиск по ERID

**Форматы:**
- Banner
- Video
- Text Block
- Text Graphic Block

[Подробная документация →](./creatives/README.md)

---

### 7. Media (Медиафайлы)
**Маршруты:** `/media`

**Функциональность:**
- Загрузка файлов (изображения, видео, аудио)
- Просмотр информации о медиа
- Удаление файлов
- Предпросмотр изображений

**Компоненты:**
- `MediaPage` - загрузка и управление

**Поддерживаемые форматы:**
- Изображения: `image/*`
- Видео: `video/*`
- Аудио: `audio/*`

[Подробная документация →](./media/README.md)

---

### 8. Parties (Контрагенты)
**Маршруты:** `/parties`

**Функциональность:**
- Поиск контрагентов по ИНН (DaData)
- Создание контрагентов в VK ORD
- Назначение ролей (Advertiser, Agency, Publisher)
- Просмотр информации об организациях

**Компоненты:**
- `PartiesPage` - поиск и создание

**Хуки:**
- `usePartyLookup()` - поиск по ИНН
- `useSetCounterparty()` - создание в VK ORD

**Роли:**
- Advertiser (Рекламодатель)
- Agency (Рекламное агентство)
- Publisher (Издатель)
- ORS (Оператор рекламной системы)

[Подробная документация →](./parties/README.md)

---

### 9. Acts (Акты)
**Маршруты:** `/acts`, `/acts/new`, `/acts/:actId/edit`

**Функциональность:**
- Создание актов оказанных услуг
- Редактирование актов
- Распределение по контрактам и креативам
- Управление статистикой размещения
- Автоматический расчет НДС
- Отправка в VK ORD

**Компоненты:**
- `ActsPage` - список актов
- `ActFormPage` - полная форма создания/редактирования
- `ActCreationFlow` - пошаговое создание
- `ActListPanel` - таблица актов
- `PartyLookup` - поиск контрагента

**Хуки:**
- `useActs()` - список актов
- `useActDetails()` - детали акта
- `useCreateAct()` - создание
- `useUpdateAct()` - обновление
- `useSubmitAct()` - отправка в VK ORD
- `useDeleteAct()` - удаление
- `useContractsByParty()` - контракты контрагента
- `useContractCreatives()` - креативы контракта

**Статусы:**
- Draft - черновик
- Sent - отправлен
- Approved - утвержден
- Rejected - отклонен
- Error - ошибка

[Подробная документация →](./acts/README.md)

---

### 10. Wizard (Мастер ERID) ⭐
**Маршруты:** `/wizard`

**Функциональность:**
- Пошаговый процесс получения ERID
- Выбор контрагентов (рекламодатель + исполнитель)
- Создание/выбор контракта
- Создание креатива с ККТУ кодами
- AI подсказки ККТУ
- Шаблоны для быстрого повтора
- Получение ERID

**Компоненты:**
- `WizardPage` - контейнер
- `Wizard` - главный компонент
- `WizardCreationFlow` - упрощенный flow
- `Step1Parties` - выбор контрагентов
- `Step2Contract` - создание контракта
- `Step3Creative` - создание креатива
- `Step4Result` - получение ERID
- `PartyInputSection` - ввод контрагента
- `ContractSelector` - выбор контракта
- `CreateContractModal` - создание контракта
- `KktyHintsPanel` - AI подсказки
- `TemplateSelector` - выбор шаблона

**Хуки:**
- `useStep1Logic()` - логика шага контрагентов
- `useFlowTemplates()` - работа с шаблонами
- `useCreateCreative()` - создание креатива

**Zustand Store:**
- `wizardStore` - состояние всех шагов

**Шаги:**
1. Контрагенты (Advertiser + Contractor)
2. Контракт (между контрагентами)
3. Креатив (с ККТУ кодами)
4. Результат (ERID)

[Подробная документация →](./wizard/README.md)

---

## Паттерны организации фич

### Типичная структура фичи

```
feature/
├── README.md              # Документация фичи
├── FeaturePage.tsx        # Главная страница
├── components/            # Компоненты фичи
│   ├── Component1.tsx
│   └── Component2.tsx
├── hooks/                 # React Query хуки
│   ├── useFeatureList.ts
│   ├── useCreateFeature.ts
│   └── index.ts
├── utils/                 # Утилиты
│   └── helpers.ts
└── schemas/               # Zod схемы (если используются)
    └── featureSchema.ts
```

### Хуки (React Query)

Каждая фича использует React Query для работы с API:

**Queries (useQuery):**
- Получение списков: `useFeatureList()`
- Получение деталей: `useFeatureDetails(id)`
- Поиск: `useFeatureSearch(query)`

**Mutations (useMutation):**
- Создание: `useCreateFeature()`
- Обновление: `useUpdateFeature()`
- Удаление: `useDeleteFeature()`

### Общие паттерны

1. **Feature-based routing:**
   ```typescript
   /feature -> FeaturePage (список)
   /feature/new -> Создание
   /feature/:id/edit -> Редактирование
   ```

2. **Защита маршрутов:**
   Все маршруты защищены через `ProtectedRoute`, кроме `/login` и `/register`.

3. **Навигация:**
   - Dashboard → быстрые действия
   - Боковое меню → все разделы
   - Прямые ссылки → `/feature`

4. **UI компоненты:**
   - Material UI для основных компонентов
   - shadcn/ui для кнопок и современных элементов
   - Tailwind CSS для утилит

5. **Toast уведомления:**
   Используется `sonner` для всех уведомлений:
   - Успех: `toast.success(message)`
   - Ошибка: `toast.error(message)`
   - Информация: `toast.info(message)`

## Связи между фичами

```
Wizard → Parties → Contracts → Creatives → ERID
  ↓         ↓           ↓
Acts ← ─ ← ─ ┘           ↓
                    Media
```

**Основной flow:**
1. **Wizard** использует **Parties** для поиска контрагентов
2. **Contracts** создаются между контрагентами из **Parties**
3. **Creatives** привязываются к **Contracts**
4. **Media** загружаются для использования в креативах
5. **Acts** формируются на основе **Contracts** и **Creatives**
6. **Credentials** управляют доступом ко всем VK ORD операциям
7. **Dashboard** предоставляет доступ ко всем модулям
8. **Users** управляет профилем пользователя

## Технологии

### Frontend
- **React 19** - UI библиотека
- **TypeScript** - типизация
- **React Router v7** - маршрутизация
- **TanStack Query** - server state management
- **Zustand** - client state management
- **React Hook Form + Zod** - формы и валидация
- **Material UI** - компоненты
- **shadcn/ui** - современные UI примитивы
- **Tailwind CSS** - стили

### API Integration
- **Axios** - HTTP клиент
- **Automatic case conversion** - camelCase ↔ snake_case
- **Automatic token refresh** - управление токенами
- **Environment switching** - Sandbox/Production

## Документация по фичам

Каждая фича имеет собственный `README.md` с подробным описанием:

- [Auth →](./auth/README.md)
- [Dashboard →](./dashboard/README.md)
- [Users →](./users/README.md)
- [Credentials →](./credentials/README.md)
- [Contracts →](./contracts/README.md)
- [Creatives →](./creatives/README.md)
- [Media →](./media/README.md)
- [Parties →](./parties/README.md)
- [Acts →](./acts/README.md)
- [Wizard →](./wizard/README.md) ⭐

## Начало работы

### Для нового пользователя

1. **Регистрация:**
   - Перейти на `/register`
   - Ввести имя пользователя и пароль
   - Автоматический вход

2. **Настройка Credentials:**
   - Перейти на `/credentials`
   - Добавить VK ORD токен
   - Выбрать окружение (Sandbox/Production)

3. **Получение ERID через Wizard:**
   - Перейти на `/wizard`
   - Следовать шагам 1-4
   - Скопировать полученный ERID

### Для разработчика

1. **Создание новой фичи:**
   ```
   src/features/new-feature/
   ├── README.md
   ├── NewFeaturePage.tsx
   ├── hooks/
   └── components/
   ```

2. **Добавление маршрута:**
   ```typescript
   // src/routes.tsx
   <Route 
     path="/new-feature" 
     element={
       <ProtectedRoute>
         <DashboardLayout>
           <NewFeaturePage />
         </DashboardLayout>
       </ProtectedRoute>
     } 
   />
   ```

3. **Создание хука:**
   ```typescript
   // hooks/useNewFeature.ts
   export const useNewFeature = () => {
     return useQuery({
       queryKey: ['new-feature'],
       queryFn: async () => {
         const response = await http.get('/api/new-feature')
         return response.data
       }
     })
   }
   ```

## Соглашения

1. **Именование:**
   - Компоненты: PascalCase (`FeaturePage.tsx`)
   - Хуки: camelCase с префиксом `use` (`useFeature.ts`)
   - Утилиты: camelCase (`formatDate.ts`)

2. **Exports:**
   - Named exports для компонентов
   - Default exports избегаем
   - Barrel exports через `index.ts`

3. **Типы:**
   - Определяются в `src/types/index.ts` или локально
   - Используем `interface` для объектов
   - Используем `type` для unions и примитивов

4. **Стили:**
   - Material UI sx prop для одноразовых стилей
   - Tailwind классы для утилит
   - CSS модули для комплексных стилей (редко)

## Дополнительные ресурсы

- [CLAUDE.md](../../CLAUDE.md) - руководство для AI ассистента
- [API Documentation](../../docs/api.md) - описание API endpoints (если есть)
- [Architecture](../../docs/architecture.md) - общая архитектура (если есть)

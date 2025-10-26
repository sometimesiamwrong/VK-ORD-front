# Фича: Управление контрактами (Contracts)

## Описание

Модуль управления договорами VK ORD. Позволяет создавать/обновлять контракты, просматривать детали существующих контрактов и отображает связанный набор данных (клиент, подрядчик, сумма, серийный номер).

## Основные компоненты

### ContractsPage (`ContractsPage.tsx`)

**Назначение:** Страница для взаимодействия с VK ORD контрактами

**Функциональность:**
1. **Создание/обновление** контракта по `externalId`
2. **Просмотр** подробной информации по существующему контракту
3. **Валидация** входных данных
4. **Отображение ошибок** при запросах
5. **Toast notifications** при успешных операциях

## Структура страницы

Страница разделена на две панели (flex, адаптивно):

1. **Создать/обновить контракт** (левая панель)
   - Форма ввода данных
   - Валидация обязательных полей
   - Отправка запроса `PUT /api/contracts/{externalId}`

2. **Просмотр контракта** (правая панель)
   - Форма поиска по `externalId`
   - Запрос `GET /api/contracts/{externalId}`
   - Отображение результатов в карточке

## Создание или обновление контракта

### Поля формы
- **External ID контракта** *(обязательно)*
- **Client External ID** *(обязательно)*
- **Contractor External ID** *(обязательно)*
- **Серийный номер** *(опционально)*
- **Сумма оплаты** *(обязательно, числовое поле)*

### Типы данных
```typescript
interface CreateContractRequest {
  externalId: string
  clientExternalId: string
  contractorExternalId: string
  serial?: string
  paySum?: number | null
}
```

### Валидация
- Проверка обязательных полей
- `paySum` приводится к `number`
- Если `paySum` пустой или NaN → `null`

### API запрос
```
PUT /api/contracts/{externalId}
Body: CreateContractRequest
```

**Ответ:** `ContractDetails`

### Обработка результата
- `toast.success('Контракт успешно создан/обновлен')`
- Очищение формы после успеха

## Просмотр контракта

### Поле формы
- **External ID контракта** *(обязательно)*

### API запрос
```
GET /api/contracts/{externalId}
```

**Ответ:** `ContractDetails`

```typescript
interface ContractDetails {
  externalId: string
  clientExternalId: string
  contractorExternalId: string
  paySum: number | null
  creatives?: CreativeSummary[]
  status?: string
  createdAt?: string
  updatedAt?: string
}
```

### Отображение результата
- Карточка с сеткой (`gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'`)
- Поля: External ID, Client ID, Contractor ID, Сумма оплаты (₽)

## Хуки и запросы

Использует `useMutation` из `@tanstack/react-query` (без кастомных хуков).

### Мутация создания/обновления
```typescript
const createContractMutation = useMutation({
  mutationFn: async (data: CreateContractRequest) => {
    const response = await http.put<ContractDetails>(`/api/contracts/${data.externalId}`, data)
    return response.data
  },
  onSuccess: () => toast.success('Контракт успешно создан/обновлен'),
})
```

### Мутация просмотра
```typescript
const viewContractMutation = useMutation({
  mutationFn: async (externalId: string) => {
    const response = await http.get<ContractDetails>(`/api/contracts/${externalId}`)
    return response.data
  },
  onSuccess: (data) => setContractDetails(data),
})
```

## UI Компоненты

**Material UI:**
- Typography - заголовки
- Paper - контейнеры секций
- Box - layout
- TextField - формы ввода
- Alert - сообщения об ошибках
- Card, CardContent - отображение результата
- Divider - разделители

**shadcn/ui:**
- Button - отправка форм

**Прочее:**
- `toast` из библиотеки `sonner` для уведомлений

## Адаптивность

**Широкий экран (md и выше):**
- Две колонки: формы создания слева, просмотр справа

**Мобильные устройства:**
- Стек из двух секций одна под другой
- Формы и результаты на всю ширину

## Навигация

**Маршрут:** `/contracts`

**Доступ:** Защищенный маршрут (требуется аутентификация)

**Переходы:**
- Из Dashboard быстрым действием "Контракты"
- Из бокового меню DashboardLayout

## UX детали

- Кнопки переключают состояние disable при отправке (`isPending`)
- Формы очищаются после успешного создания/обновления
- Ошибки отображаются в `Alert severity="error"`
- Сумма оплаты отображается с символом рубля (₽)

## Ошибки и обработка

### Ошибка создания/обновления
```tsx
{createContractMutation.isError && (
  <Alert severity="error" sx={{ mt: 2 }}>
    {createContractMutation.error?.message}
  </Alert>
)}
```

### Ошибка просмотра
```tsx
{viewContractMutation.isError && (
  <Alert severity="error" sx={{ mb: 2 }}>
    {viewContractMutation.error?.message}
  </Alert>
)}
```

## Примеры использования

### Создание контракта
1. Заполнить форму в секции "Создать/Обновить контракт"
2. Нажать "Создать/Обновить контракт"
3. Получить toast уведомление об успехе

### Просмотр контракта
1. Ввести `externalId` в секции "Просмотр контракта"
2. Нажать "Найти контракт"
3. Просмотреть детали в карточке

## Связанные модули

- **Creatives** (`src/features/creatives`) - контракты связаны с креативами
- **Wizard** (`src/features/wizard`) - использует контракты в шаге 2
- **Acts** (`src/features/acts`) - формирование актов по контрактам

## Возможные улучшения

1. **Список контрактов** - отображение таблицы с фильтрами
2. **Редактирование** - поддержка дополнительных полей (сроки, условия)
3. **Связанные креативы** - отображение списка креативов по контракту
4. **Удаление** - реализация DELETE endpoint
5. **Валидация** - расширенная валидация (zod, react-hook-form)

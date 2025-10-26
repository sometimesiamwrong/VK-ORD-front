# Фича: Управление креативами (Creatives)

## Описание

Модуль управления рекламными креативами VK ORD. Позволяет создавать креативы, связывать их с контрактами, получать ERID (идентификатор рекламы), отслеживать статусы и управлять ККТУ кодами (классификатор товаров и услуг).

## Основные компоненты

### CreativesPage (`CreativesPage.tsx`)

**Назначение:** Полнофункциональная страница для работы с креативами VK ORD

**Функциональность:**
1. **Создание** креатива с полным набором параметров
2. **Просмотр** деталей существующего креатива по External ID
3. **Получение статуса** креатива (статус модерации, ERID)
4. **Удаление** креатива
5. **Список креативов** с пагинацией
6. **Поиск по ERID** - быстрый поиск креатива по ERID

## Структура страницы

Двухколоночный layout (адаптивный):

1. **Создать креатив** (левая панель)
   - Расширенная форма со всеми полями
   - Динамическое добавление контрактов, ККТУ кодов, URLs

2. **Действия** (правая панель)
   - Список креативов с пагинацией
   - Форма просмотра по External ID
   - Форма получения статуса
   - Форма удаления

3. **Результаты** (внизу или справа)
   - Детали креатива
   - Статус креатива

## Типы данных

### CreateCreativeRequest
```typescript
interface CreateCreativeRequest {
  externalId: string                              // Уникальный ID
  contractExternalIds: string[]                   // Массив ID контрактов
  kktus: string[]                                 // ККТУ коды
  type: VkOrdCreativeForm                         // Формат (banner, video, etc.)
  payType: number                                 // Тип оплаты (CPM, CPC, CPA, CPView)
  targetUrls?: string[]                           // URL контента
  targetAudience?: string                         // Целевая аудитория
  texts?: string[]                                // Тексты креатива
  name?: string                                   // Название
}
```

### VkOrdCreativeForm
```typescript
const VkOrdCreativeForm = {
  Banner: 'banner',
  TextBlock: 'text_block',
  Video: 'video',
  TextGraphicBlock: 'text_graphic_block',
}
```

### CreativeDetails
```typescript
interface CreativeDetails {
  externalId: string
  erid?: string                    // Идентификатор рекламы (результат регистрации)
  contractExternalIds: string[]
  kktus: string[]
  type: VkOrdCreativeForm
  payType: number
  targetUrls?: string[]
  targetAudience?: string
  texts?: string[]
  name?: string
  status?: string
  createdAt?: string
  updatedAt?: string
}
```

### CreativeStatus
```typescript
interface CreativeStatus {
  externalId: string
  status: string                   // Статус модерации
  erid?: string                    // ERID если одобрен
  rejectionReason?: string         // Причина отказа (если отклонен)
}
```

## Основной функционал

### 1. Создание креатива

**Поля формы:**
- **External ID** *(обязательно)* - уникальный идентификатор
- **Формат** *(обязательно)* - Select: Banner, Text Block, Video, Text Graphic Block
- **Contract External IDs** - динамический список с добавлением/удалением
- **KKTY Codes** - динамический список кодов ККТУ
- **Content URLs** - динамический список URL контента
- **Target Audience** - описание целевой аудитории (multiline)
- **Text** - тексты креатива (multiline, разделение по строкам)
- **Name** - название креатива

**API запрос:**
```
POST /api/creatives
Body: CreateCreativeRequest
```

**Особенности:**
- Динамические списки: добавление элемента через input + кнопка Add
- Удаление элементов через Chip (onDelete) или ListItemSecondaryAction
- Текст разбивается по строкам: `split('\n').filter(t => t.trim())`

### 2. Список креативов

**Хук:** `useCreativesList(offset, limit)`

**Эндпоинт:** `GET /api/creatives?offset={offset}&limit={limit}`

**Пагинация:**
- Показано: X–Y из Z
- Кнопки: « ‹ Назад | Стр. 1/N | Вперед › »
- Limit: 10 элементов на страницу

**Отображение:**
- List с ListItem
- Primary: name или externalId
- Secondary: `External ID: ... • ERID: ...`
- Action: кнопка "Открыть" → загружает детали

### 3. Просмотр креатива

**Форма:**
- Input: External ID
- Кнопка: "Найти" (SearchIcon)

**API запрос:**
```
GET /api/creatives/{externalId}
```

**Отображение:**
- Карточка с деталями (см. раздел "Отображение деталей")

### 4. Получение статуса

**Форма:**
- Input: External ID
- Кнопка: "Получить статус" (InfoIcon)

**API запрос:**
```
GET /api/creatives/{externalId}/status
```

**Отображение:**
- Статус модерации
- ERID (если одобрен)
- Причина отказа (если отклонен)

### 5. Удаление креатива

**Форма:**
- Input: External ID
- Кнопка: "Удалить" (DeleteIcon), variant="destructive"

**Подтверждение:** `window.confirm('Вы уверены?')`

**API запрос:**
```
DELETE /api/creatives/{externalId}
```

### 6. Поиск по ERID

**Форма:**
- Input: ERID
- Кнопка: "Найти по ERID" (SearchIcon)

**Хук:** `useCreativeByErid()`

**API запрос:**
```
GET /api/creatives/by-erid/{erid}
```

**Отображение:**
- Toast: "Креатив найден по ERID" или "Креатив не найден"
- Загрузка деталей в карточку

## Отображение деталей

Карточка с детальной информацией (появляется после просмотра/поиска):

**Секции:**
1. **Основная информация**
   - External ID
   - ERID (если есть)
   - Название
   - Формат (type)
   - Статус

2. **Контракты**
   - Список Contract External IDs (Chips)

3. **ККТУ коды**
   - Список кодов (Chips)

4. **Target URLs**
   - Список URLs (List)

5. **Целевая аудитория**
   - Текст описания

6. **Тексты креатива**
   - Список строк текста

7. **Даты**
   - Дата создания
   - Дата обновления

## Хуки креативов

Хуки определены в `src/features/creatives/hooks/`:

### useCreativesList(offset, limit)
```typescript
const { data, isLoading } = useCreativesList(0, 10)
// data: { creatives: CreativeDetails[], totalItemsCount: number }
```

### useCreativeByErid()
```typescript
const creativeByErid = useCreativeByErid()
creativeByErid.mutate(erid, {
  onSuccess: (data) => console.log(data)
})
```

## UI Компоненты

**Material UI:**
- Typography, Paper, Box, Divider - layout
- TextField - поля формы
- FormControl, InputLabel, Select, MenuItem - выбор формата
- List, ListItem, ListItemText, ListItemSecondaryAction - списки
- Chip - badges для контрактов/кодов
- Alert - ошибки

**Material UI Icons:**
- AddIcon, DeleteIcon, RemoveIcon - управление списками
- SearchIcon - поиск
- InfoIcon - статус

**shadcn/ui:**
- Button - действия

## Адаптивность

**Широкие экраны (lg и выше):**
- Две колонки: создание слева, действия справа

**Узкие экраны:**
- Стек из двух секций
- Детали и статус на полную ширину

## Навигация

**Маршрут:** `/creatives`

**Доступ:** Защищенный маршрут

**Переходы:**
- Из Dashboard карточкой "Креативы"
- Из бокового меню

## Форматы креативов (VkOrdCreativeForm)

| Формат              | Значение            | Описание                      |
|---------------------|---------------------|-------------------------------|
| Banner              | `banner`            | Баннерная реклама             |
| Text Block          | `text_block`        | Текстовый блок                |
| Video               | `video`             | Видеореклама                  |
| Text Graphic Block  | `text_graphic_block`| Текстово-графический блок     |

## Типы оплаты (VkOrdPayType)

| Тип       | Значение | Описание                |
|-----------|----------|-------------------------|
| CPM       | 0        | Cost Per Mille          |
| CPC       | 1        | Cost Per Click          |
| CPA       | 2        | Cost Per Action         |
| CPView    | 3        | Cost Per View           |

## Связанные модули

- **Contracts** (`src/features/contracts`) - креативы связаны с контрактами
- **Wizard** (`src/features/wizard`) - создание креатива в шаге 3
- **Acts** (`src/features/acts`) - креативы указываются в актах

## Примеры использования

### Создание креатива
1. Заполнить External ID
2. Выбрать формат (например, Banner)
3. Добавить Contract IDs
4. Добавить ККТУ коды (например, "50.31.10")
5. Добавить URLs контента
6. Заполнить Target Audience и тексты
7. Нажать "Создать креатив"

### Получение ERID
1. Создать креатив
2. Дождаться модерации VK ORD
3. Получить статус по External ID
4. ERID появится в ответе статуса

### Поиск по ERID
1. Ввести ERID в форму "Поиск по ERID"
2. Нажать "Найти"
3. Просмотреть детали найденного креатива

## Особенности реализации

1. **Динамические списки:**
   - Separate state для каждого input (newContractId, newKktyCode, newContentUrl)
   - Добавление в массив через кнопку
   - Удаление через Chip.onDelete или IconButton

2. **Разделение текстов:**
   ```typescript
   const texts = e.target.value.split('\n').filter(t => t.trim())
   ```

3. **Пагинация:**
   - Кастомные кнопки навигации
   - Расчет totalPages = ceil(totalItemsCount / limit)
   - Защита от выхода за границы

4. **Toast уведомления:**
   - Успешное создание
   - Успешное удаление
   - Креатив найден/не найден по ERID

5. **Мутации inline:**
   - Не используются кастомные хуки
   - Прямой useMutation с обработчиками

## Будущие улучшения

1. **AI подсказки ККТУ** - автоматическое предложение кодов на основе текста
2. **Превью креатива** - предварительный просмотр баннера/видео
3. **Массовое создание** - импорт из CSV/JSON
4. **История изменений** - отслеживание версий
5. **Фильтры** - поиск по формату, статусу, дате

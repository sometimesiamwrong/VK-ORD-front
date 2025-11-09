# Отчет по адаптивности для iPhone 14 Pro Max (430x932)

**Дата проверки:** 2025-11-09
**Разрешение тестирования:** 430x932 px (iPhone 14 Pro Max)
**Браузер:** Chrome с DevTools

---

## Резюме

Проект имеет базовую адаптивность благодаря использованию Material UI и наличию медиа-запросов в `src/styles/index.css`. Однако обнаружены критические проблемы с отображением таблиц и некоторых сложных компонентов на мобильных устройствах.

**Общий результат:** 6.5/10

---

## 1. Credentials Page (Учетные данные) ❌

### Проблемы:
- **Критическая проблема:** Таблица с credentials не адаптирована для мобильных устройств
- Видны только первые 3 колонки из 6: "Название", "Окружение", "Токен"
- Колонки "Создан", "Обновлен", "Действия" обрезаны и недоступны
- Горизонтальный скролл отсутствует или не очевиден

### Рекомендации:
```typescript
// src/features/credentials/CredentialsPage.tsx

// Вариант 1: Использовать карточки вместо таблицы на мобильных
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

{isMobile ? (
  // Card-based layout
  credentials.map(credential => (
    <Card key={credential.id} sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">{credential.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          Окружение: {credential.environment}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Токен: {credential.token}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Создан: {credential.createdAt}
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button size="small">Редактировать</Button>
          <Button size="small" color="error">Удалить</Button>
        </Box>
      </CardContent>
    </Card>
  ))
) : (
  // Table layout for desktop
  <TableContainer>...</TableContainer>
)}

// Вариант 2: Сделать таблицу горизонтально скроллируемой
<Box sx={{ overflowX: 'auto', width: '100%' }}>
  <TableContainer component={Paper} sx={{ minWidth: 650 }}>
    <Table>...</Table>
  </TableContainer>
</Box>
```

### Приоритет: 🔴 Высокий
**Файл:** `src/features/credentials/CredentialsPage.tsx`

---

## 2. Wizard Page (Создание ERID) ⚠️

### Проблемы:
- Карточки "Рекламодатель", "Договор", "Исполнитель" в `WizardCreationFlow` отображаются в grid
- На экране 430px видны только 2 карточки, третья обрезана
- Нет индикации того, что можно прокрутить вправо
- Кнопка "Перейти к креативу" может быть недоступна из-за disabled состояния, но не очевидно почему

### Рекомендации:
```typescript
// src/features/wizard/components/WizardCreationFlow.tsx

// Изменить grid на вертикальный стек для мобильных
<Box sx={{
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',  // Одна колонка на мобильных
    sm: 'repeat(2, 1fr)',  // Две на планшетах
    md: 'repeat(3, 1fr)'   // Три на десктопе
  },
  gap: 3
}}>
  {/* Карточки */}
</Box>

// Или использовать Stack с direction="column" на мобильных
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

<Stack
  direction={isMobile ? 'column' : 'row'}
  spacing={2}
  sx={{ width: '100%' }}
>
  {/* Карточки */}
</Stack>
```

### Приоритет: 🟡 Средний
**Файл:** `src/features/wizard/components/WizardCreationFlow.tsx:162-198`

---

## 3. Dashboard Page (Дашборд) ✅

### Оценка: Хорошо

**Что работает:**
- Карточки "Быстрые действия" корректно отображаются в одну колонку
- Grid с `gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'` работает корректно
- Все кнопки доступны и имеют достаточный размер для touch
- Текст читаем и не обрезан

### Мелкие улучшения:
```typescript
// src/features/dashboard/DashboardPage.tsx:75

// Можно уменьшить минимальную ширину карточки для очень узких экранов
<Box sx={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
  gap: 3
}}>
```

### Приоритет: 🟢 Низкий

---

## 4. Contracts Page (Контракты) ⚠️

### Проблемы:
- Форма создания контракта использует grid с `minmax(250px, 1fr)`
- На экране 430px поля стекаются в одну колонку, что хорошо
- НО: на планшетах (768px) может быть только 1 колонка, что неоптимально
- Две колонки ("Создать" и "Просмотр") занимают по 50% на мобильных через flexDirection: 'row'

### Рекомендации:
```typescript
// src/features/contracts/ContractsPage.tsx:105

<Box sx={{
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },  // Вертикально на мобильных
  gap: 3
}}>
  {/* Create/Update Contract */}
  <Box sx={{ flex: 1 }}>...</Box>

  {/* View Contract */}
  <Box sx={{ flex: 1 }}>...</Box>
</Box>
```

### Приоритет: 🟡 Средний
**Файл:** `src/features/contracts/ContractsPage.tsx:105`

---

## 5. Creatives Page (Креативы) ⚠️

### Проблемы:
- Очень сложная форма с множеством полей
- Три колонки на десктопе: "Создать", "Действия", "Результаты"
- На мобильных все три колонки стекаются вертикально через `flexDirection: { xs: 'column', lg: 'row' }`
- Кнопки добавления (Add icon) могут быть слишком маленькими для touch (размер иконки 16x16)
- Chip-элементы могут быть трудно удалить на мобильных

### Рекомендации:
```typescript
// src/features/creatives/CreativesPage.tsx:250-406

// 1. Увеличить минимальный размер кнопок на мобильных
<Button
  variant="outline"
  size="icon"
  onClick={addContractId}
  sx={{
    minWidth: { xs: 44, sm: 36 },  // Больше на мобильных
    minHeight: { xs: 44, sm: 36 }
  }}
>
  <AddIcon sx={{ fontSize: { xs: 20, sm: 16 } }} />
</Button>

// 2. Увеличить Chip для лучшей touch-доступности
<Chip
  label={id}
  onDelete={() => removeContractId(id)}
  size={isMobile ? "medium" : "small"}
  sx={{
    '& .MuiChip-deleteIcon': {
      fontSize: { xs: 20, sm: 18 }  // Больше иконка удаления
    }
  }}
/>

// 3. Разделить форму на вкладки/шаги на мобильных
const [activeTab, setActiveTab] = useState(0);

{isMobile ? (
  <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
    <Tab label="Создать" />
    <Tab label="Поиск" />
    <Tab label="Управление" />
  </Tabs>
  <TabPanel value={activeTab} index={0}>
    {/* Create form */}
  </TabPanel>
  ...
) : (
  {/* Current 3-column layout */}
)}
```

### Приоритет: 🟡 Средний
**Файл:** `src/features/creatives/CreativesPage.tsx`

---

## 6. Parties Page (Контрагенты) ✅

### Оценка: Отлично

**Что работает:**
- Простая вертикальная форма
- Все поля занимают 100% ширины на мобильных
- Кнопки достаточно большие для touch
- Нет горизонтального переполнения

**Улучшение:**
```typescript
// src/features/parties/PartiesPage.tsx

// Добавить больше padding для touch-friendly интерфейса
<TextField
  fullWidth
  label="ИНН"
  value={lookupInn}
  onChange={(e) => setLookupInn(e.target.value)}
  sx={{
    mb: 2,
    '& .MuiInputBase-root': {
      minHeight: { xs: 48, sm: 40 }  // Больше на мобильных
    }
  }}
/>
```

### Приоритет: 🟢 Низкий

---

## 7. Acts Page (Акты) ✅

### Оценка: Хорошо

**Что работает:**
- Autocomplete для поиска контрагента работает корректно
- Кнопка "Создать акт" адекватного размера
- Информационное сообщение хорошо читается

**Нет критических проблем**

---

## 8. Profile Page (Профиль) ✅

### Оценка: Отлично

**Что работает:**
- Все текстовые поля вертикально расположены
- Карточки информации хорошо читаются
- Нет переполнения контента
- Кнопка "Редактировать" доступна

**Нет критических проблем**

---

## 9. Credential Required Modal (Модальное окно) ⚠️

### Проблемы:
- Модальное окно отображается корректно
- НО: на скриншоте видно, что модальное окно занимает почти весь экран
- Select с API ключами может быть сложно использовать, если список длинный
- Кнопки "Управление ключами" и "Подтвердить выбор" расположены горизонтально

### Рекомендации:
```typescript
// src/components/ui/CredentialRequiredModal.tsx

// Сделать кнопки вертикально на узких экранах
<Box sx={{
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  gap: 2,
  mt: 3
}}>
  <Button onClick={handleManageClick} fullWidth>
    Управление ключами
  </Button>
  <Button
    onClick={handleConfirm}
    disabled={!selectedCredentialId}
    fullWidth
  >
    Подтвердить выбор
  </Button>
</Box>
```

### Приоритет: 🟢 Низкий
**Файл:** `src/components/ui/CredentialRequiredModal.tsx`

---

## 10. Общие CSS стили (index.css) ✅

### Оценка: Хорошо

**Что работает:**
- Есть медиа-запросы для @media (max-width: 480px)
- Минимальные размеры для touch: кнопки 44px, инпуты 44px
- Адаптивные размеры шрифтов
- Карточки имеют адаптивный padding

**Улучшения:**
```css
/* src/styles/index.css */

/* Добавить медиа-запрос специально для iPhone 14 Pro Max */
@media (max-width: 430px) {
  /* Более агрессивные оптимизации для узких экранов */
  #app {
    padding: 12px;
  }

  .vk-card {
    padding: 12px;
  }

  h1 {
    font-size: 22px;
  }
}

/* Улучшить модальные окна */
.vk-modal {
  width: min(820px, 96vw);  /* Больше ширины на мобильных */
  max-height: 92vh;  /* Больше высоты */
}

@media (max-width: 480px) {
  .vk-modal {
    width: 98vw;
    max-height: 94vh;
    margin: 8px;
  }
}
```

### Приоритет: 🟢 Низкий

---

## Сводная таблица приоритетов

| Страница/Компонент | Статус | Приоритет | Критичность |
|-------------------|--------|-----------|-------------|
| Credentials Page | ❌ Не работает | 🔴 Высокий | Критическая |
| Wizard Page | ⚠️ Частично | 🟡 Средний | Средняя |
| Contracts Page | ⚠️ Частично | 🟡 Средний | Средняя |
| Creatives Page | ⚠️ Частично | 🟡 Средний | Средняя |
| Dashboard Page | ✅ Работает | 🟢 Низкий | Низкая |
| Parties Page | ✅ Работает | 🟢 Низкий | Нет |
| Acts Page | ✅ Работает | 🟢 Низкий | Нет |
| Profile Page | ✅ Работает | 🟢 Низкий | Нет |
| Credential Modal | ⚠️ Частично | 🟢 Низкий | Низкая |
| CSS Styles | ✅ Работает | 🟢 Низкий | Нет |

---

## Общие рекомендации

### 1. Использовать Material UI breakpoints

Во всех компонентах последовательно использовать систему breakpoints:

```typescript
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
```

### 2. Заменить таблицы на карточки для мобильных

Все таблицы должны иметь альтернативное представление в виде карточек на мобильных устройствах.

### 3. Touch-friendly элементы

- Минимальный размер кликабельных элементов: 44x44px (Apple HIG)
- Минимальное расстояние между кликабельными элементами: 8px
- Увеличенные иконки удаления в Chip: минимум 20x20px

### 4. Адаптивные grid layouts

```typescript
// Вместо фиксированных значений
gridTemplateColumns: 'repeat(3, 1fr)'

// Использовать
gridTemplateColumns: {
  xs: '1fr',
  sm: 'repeat(2, 1fr)',
  md: 'repeat(3, 1fr)'
}
```

### 5. Тестирование на реальных устройствах

После внесения изменений протестировать на:
- iPhone 14 Pro Max (430x932)
- iPhone SE (375x667)
- Samsung Galaxy S21 (360x800)
- iPad (768x1024)

---

## План действий

### Фаза 1: Критические исправления (1-2 дня)
1. ✅ Переделать Credentials Page - заменить таблицу на карточки для мобильных
2. ✅ Исправить layout Wizard Page - вертикальный стек на мобильных

### Фаза 2: Средние улучшения (2-3 дня)
1. ✅ Оптимизировать Contracts Page - вертикальный layout колонок
2. ✅ Улучшить Creatives Page - вкладки для мобильных, увеличенные кнопки
3. ✅ Добавить адаптивные breakpoints во все компоненты

### Фаза 3: Полировка (1-2 дня)
1. ✅ Улучшить CSS для специфических разрешений
2. ✅ Добавить больше padding/spacing для touch
3. ✅ Протестировать все потоки на реальных устройствах
4. ✅ Оптимизировать производительность (lazy loading, code splitting)

### Фаза 4: QA (1 день)
1. ✅ Полное тестирование на всех целевых устройствах
2. ✅ Проверка accessibility (VoiceOver, TalkBack)
3. ✅ Проверка landscape ориентации
4. ✅ Финальные правки

---

## Технические детали

### Breakpoints Material UI (по умолчанию)
- xs: 0px
- sm: 600px
- md: 900px
- lg: 1200px
- xl: 1536px

### iPhone 14 Pro Max
- Ширина: 430px
- Высота: 932px
- Pixel Ratio: 3
- Safe Area: учитывать Dynamic Island

### Рекомендуемые инструменты
- Chrome DevTools Device Mode
- React Developer Tools
- Material UI DevTools
- Lighthouse для mobile performance

---

## Заключение

Проект имеет хорошую основу для мобильной адаптивности благодаря Material UI и базовым медиа-запросам в CSS. Однако требуется доработка критических компонентов (Credentials Page) и улучшение UX на мобильных устройствах для остальных страниц.

**Следующие шаги:**
1. Начать с исправления Credentials Page (высокий приоритет)
2. Провести code review всех компонентов с фокусом на mobile-first подход
3. Внедрить систематическое использование Material UI breakpoints
4. Добавить Storybook stories для мобильных разрешений
5. Настроить автоматическое тестирование на различных разрешениях

**Ожидаемый результат после всех исправлений:** 9/10

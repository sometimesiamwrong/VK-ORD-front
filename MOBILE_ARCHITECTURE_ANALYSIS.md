# ULTRATHINK: Глубокий архитектурный анализ мобильной адаптивности

**Дата:** 2025-11-09
**Контекст:** Полный аудит архитектуры адаптивности проекта VK ORD

---

## 🧠 Системный анализ проблем

### 1. Архитектурные антипаттерны

#### 1.1 Фрагментация UI-фреймворков

```
Текущее состояние:
├── Material UI (основной)
│   ├── Breakpoints: 600, 900, 1200, 1536
│   ├── sx prop для стилизации
│   └── Theme system
├── shadcn/ui + Tailwind
│   ├── Utility-first approach
│   ├── Breakpoints: sm:640, md:768, lg:1024, xl:1280
│   └── Radix UI primitives
└── Custom CSS (index.css)
    ├── Breakpoints: 480, 640, 960
    ├── BEM-подобная номенклатура (vk-*)
    └── Media queries

ПРОБЛЕМА: Три независимые системы breakpoints!
```

**Последствия:**
- Компонент может быть адаптивным в MUI, но не в Tailwind
- CSS breakpoints срабатывают на других ширинах
- Невозможно предсказать поведение на промежуточных разрешениях
- iPhone 14 Pro Max (430px) находится между CSS 390px и 480px

**Решение:**
```typescript
// src/theme/unified-breakpoints.ts
export const UNIFIED_BREAKPOINTS = {
  // Mobile First
  mobile: {
    xs: 0,      // Все мобильные
    sm: 375,    // iPhone SE
    md: 430,    // iPhone 14 Pro Max
  },
  // Tablet
  tablet: {
    sm: 600,    // Small tablets
    md: 768,    // iPad portrait
    lg: 900,    // iPad landscape
  },
  // Desktop
  desktop: {
    sm: 1024,   // Small desktop
    md: 1200,   // Medium desktop
    lg: 1440,   // Large desktop
    xl: 1920,   // Full HD
  }
} as const;

// Создать единый источник истины
export const createResponsiveTheme = () => ({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

// Синхронизировать Tailwind
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'xs': '0px',
      'sm': '600px',
      'md': '900px',
      'lg': '1200px',
      'xl': '1536px',
    }
  }
}
```

#### 1.2 Desktop-First мышление

**Анализ кодовой базы:**
```typescript
// Типичный паттерн в проекте (ПЛОХО):
<Box sx={{ display: 'flex', flexDirection: 'row' }}>
  <Box sx={{ width: '50%' }}>...</Box>
  <Box sx={{ width: '50%' }}>...</Box>
</Box>

// Затем "патчится" для мобильных:
<Box sx={{
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' }  // Afterthought!
}}>
```

**Mobile-First подход (ПРАВИЛЬНО):**
```typescript
// Начинать с мобильных, расширять для десктопа
<Box sx={{
  display: 'flex',
  flexDirection: 'column',  // По умолчанию вертикально
  gap: 2,
  md: {
    flexDirection: 'row',   // Горизонтально только на больших экранах
    gap: 3,
  }
}}>
  <Box sx={{ width: { xs: '100%', md: '50%' } }}>...</Box>
  <Box sx={{ width: { xs: '100%', md: '50%' } }}>...</Box>
</Box>
```

#### 1.3 Таблицы как фундаментальная проблема

**Почему HTML таблицы не работают на мобильных:**

1. **Семантика vs Презентация:**
   - `<table>` подразумевает табличные данные
   - Не может стать flexbox или grid без потери семантики
   - Screen readers ожидают табличную структуру

2. **Фиксированная структура:**
   - `<tr>`, `<td>`, `<th>` требуют определенной иерархии
   - Нельзя просто сделать `display: block` без проблем
   - Scroll горизонтально не является решением (плохой UX)

3. **Текущее использование в проекте:**
   - `CredentialsPage`: Material UI Table
   - Потенциально в других местах

**Архитектурное решение - ResponsiveDataView:**

```typescript
// src/components/data-display/ResponsiveDataView.tsx

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  mobileLabel?: string;  // Метка для мобильной карточки
  hideOnMobile?: boolean;
}

interface ResponsiveDataViewProps<T> {
  data: T[];
  columns: Column<T>[];
  mobileRenderer?: (row: T, index: number) => React.ReactNode;
  keyExtractor: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyState?: React.ReactNode;
}

export function ResponsiveDataView<T extends Record<string, any>>({
  data,
  columns,
  mobileRenderer,
  keyExtractor,
  onRowClick,
  loading,
  emptyState
}: ResponsiveDataViewProps<T>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Loading state
  if (loading) {
    return (
      <Stack spacing={2}>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} variant="rectangular" height={isMobile ? 120 : 60} />
        ))}
      </Stack>
    );
  }

  // Empty state
  if (data.length === 0) {
    return emptyState || (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">Нет данных</Typography>
      </Paper>
    );
  }

  // Mobile view - Cards
  if (isMobile) {
    if (mobileRenderer) {
      return (
        <Stack spacing={2}>
          {data.map((row, index) => (
            <Box key={keyExtractor(row)}>
              {mobileRenderer(row, index)}
            </Box>
          ))}
        </Stack>
      );
    }

    // Default mobile card
    return (
      <Stack spacing={2}>
        {data.map(row => (
          <Card
            key={keyExtractor(row)}
            onClick={() => onRowClick?.(row)}
            sx={{
              cursor: onRowClick ? 'pointer' : 'default',
              '&:hover': onRowClick ? {
                boxShadow: 3,
                transform: 'translateY(-2px)',
                transition: 'all 0.2s ease'
              } : {}
            }}
          >
            <CardContent>
              <Stack spacing={1.5}>
                {columns.filter(col => !col.hideOnMobile).map(col => (
                  <Box key={String(col.key)}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      {col.mobileLabel || col.header}
                    </Typography>
                    <Typography variant="body2">
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key])
                      }
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  // Desktop view - Table
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map(col => (
              <TableCell key={String(col.key)}>
                {col.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(row => (
            <TableRow
              key={keyExtractor(row)}
              hover={!!onRowClick}
              onClick={() => onRowClick?.(row)}
              sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map(col => (
                <TableCell key={String(col.key)}>
                  {col.render
                    ? col.render(row[col.key], row)
                    : String(row[col.key])
                  }
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
```

**Использование:**
```typescript
// src/features/credentials/CredentialsPage.tsx

<ResponsiveDataView
  data={credentials}
  columns={[
    { key: 'name', header: 'Название' },
    { key: 'environment', header: 'Окружение' },
    {
      key: 'token',
      header: 'Токен',
      render: (token) => maskToken(token)
    },
    {
      key: 'createdAt',
      header: 'Создан',
      hideOnMobile: true  // Скрыть на мобильных
    },
    {
      key: 'updatedAt',
      header: 'Обновлен',
      hideOnMobile: true
    },
  ]}
  keyExtractor={cred => cred.id}
  onRowClick={(cred) => navigate(`/credentials/${cred.id}`)}
  loading={isLoading}
/>
```

### 2. Edge Cases и недокументированные проблемы

#### 2.1 iOS Safari специфика

**Проблема 1: 100vh не учитывает URL bar**
```css
/* ПЛОХО */
.full-height {
  height: 100vh;  /* На iOS = screen + URL bar */
}

/* ХОРОШО */
.full-height {
  height: 100dvh;  /* Dynamic viewport height - учитывает UI браузера */
  /* Fallback для старых браузеров */
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
}
```

```typescript
// Установить CSS переменную с правильной высотой
useEffect(() => {
  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  setVH();
  window.addEventListener('resize', setVH);
  return () => window.removeEventListener('resize', setVH);
}, []);
```

**Проблема 2: Zoom на input focus (font-size < 16px)**
```css
/* iOS зумит input если текст меньше 16px */
input, textarea, select {
  font-size: 16px !important;  /* Не меньше! */
}

/* Но можно уменьшить placeholder */
input::placeholder {
  font-size: 14px;
  transform: scale(0.875);
  transform-origin: left;
}
```

**Проблема 3: Fixed positioning и клавиатура**
```typescript
// Когда клавиатура открывается, fixed элементы могут "уехать"
const [keyboardHeight, setKeyboardHeight] = useState(0);

useEffect(() => {
  if (window.visualViewport) {
    const handleResize = () => {
      const viewport = window.visualViewport!;
      const keyboardHeight = window.innerHeight - viewport.height;
      setKeyboardHeight(keyboardHeight);
    };

    window.visualViewport.addEventListener('resize', handleResize);
    return () => window.visualViewport.removeEventListener('resize', handleResize);
  }
}, []);

// Использовать для корректировки position
<Box
  sx={{
    position: 'fixed',
    bottom: keyboardHeight || 0,
    transition: 'bottom 0.2s ease'
  }}
>
```

**Проблема 4: Safe Area (Dynamic Island, Notch)**
```css
/* iPhone 14 Pro Max имеет Dynamic Island */
.header {
  padding-top: max(16px, env(safe-area-inset-top));
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
}

/* Для fullscreen модалей */
.modal-fullscreen {
  position: fixed;
  inset: 0;
  /* Учесть safe areas */
  padding: env(safe-area-inset-top) env(safe-area-inset-right)
           env(safe-area-inset-bottom) env(safe-area-inset-left);
}
```

#### 2.2 Touch events особенности

**Проблема: Hover состояния "застревают"**
```css
/* ПЛОХО - hover работает на touch, но "залипает" */
.button:hover {
  background: #f0f0f0;
}

/* ХОРОШО - hover только для устройств с мышью */
@media (hover: hover) and (pointer: fine) {
  .button:hover {
    background: #f0f0f0;
  }
}

/* Для touch устройств использовать :active */
@media (hover: none) and (pointer: coarse) {
  .button:active {
    background: #f0f0f0;
    transform: scale(0.98);
  }
}
```

**300ms tap delay (устарело, но знать нужно)**
```html
<!-- Устраняет 300ms задержку на старых браузерах -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
```

**Touch target sizing (Apple HIG, Material Design)**
```typescript
// Создать компонент для обеспечения минимального размера
export const TouchTarget: React.FC<{
  children: React.ReactNode;
  minSize?: number;
}> = ({ children, minSize = 44 }) => (
  <Box
    sx={{
      minWidth: minSize,
      minHeight: minSize,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    {children}
  </Box>
);

// Использование
<TouchTarget>
  <IconButton>
    <DeleteIcon />
  </IconButton>
</TouchTarget>
```

#### 2.3 Performance ловушки на мобильных

**Проблема 1: React Query infinite cache**
```typescript
// ПЛОХО - кеш растет бесконечно
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,  // Никогда не invaliate
      cacheTime: Infinity,  // Никогда не удалять
    },
  },
});

// ХОРОШО - оптимизировать для мобильных
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 минут
      cacheTime: 1000 * 60 * 10,     // 10 минут
      // На мобильных агрессивнее GC
      gcTime: isMobile ? 1000 * 60 * 5 : 1000 * 60 * 10,
    },
  },
});
```

**Проблема 2: Излишние re-renders**
```typescript
// ПЛОХО - re-render всего списка при изменении одного элемента
{items.map(item => (
  <ItemCard key={item.id} item={item} />
))}

// ХОРОШО - мемоизировать компоненты
const MemoizedItemCard = React.memo(ItemCard, (prev, next) => {
  return prev.item.id === next.item.id &&
         prev.item.updatedAt === next.item.updatedAt;
});

{items.map(item => (
  <MemoizedItemCard key={item.id} item={item} />
))}
```

**Проблема 3: Большие списки без виртуализации**
```typescript
// Для списков >50 элементов использовать виртуализацию
import { Virtuoso } from 'react-virtuoso';

<Virtuoso
  style={{ height: '600px' }}
  data={items}
  itemContent={(index, item) => (
    <ItemCard item={item} />
  )}
  // Мобильная оптимизация
  overscan={isMobile ? 2 : 5}
/>
```

**Проблема 4: Неоптимизированные изображения**
```typescript
// ПЛОХО
<img src="/images/large-photo.jpg" alt="..." />

// ХОРОШО - responsive images
<picture>
  <source
    media="(max-width: 600px)"
    srcSet="/images/photo-mobile.webp"
    type="image/webp"
  />
  <source
    media="(max-width: 600px)"
    srcSet="/images/photo-mobile.jpg"
  />
  <source
    srcSet="/images/photo-desktop.webp"
    type="image/webp"
  />
  <img
    src="/images/photo-desktop.jpg"
    alt="..."
    loading="lazy"
    decoding="async"
  />
</picture>
```

### 3. Системное решение - Adaptive Components Library

#### 3.1 ResponsiveContainer

```typescript
// src/components/layout/ResponsiveContainer.tsx
interface ResponsiveContainerProps {
  children: React.ReactNode;
  variant?: 'narrow' | 'medium' | 'wide' | 'full';
  disableGutters?: boolean;
  className?: string;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  variant = 'medium',
  disableGutters = false,
  className
}) => {
  const maxWidth = {
    narrow: 'sm',   // 600px
    medium: 'md',   // 900px
    wide: 'lg',     // 1200px
    full: false     // No max width
  }[variant] as 'sm' | 'md' | 'lg' | false;

  return (
    <Container
      maxWidth={maxWidth}
      disableGutters={disableGutters}
      className={className}
      sx={{
        px: disableGutters ? 0 : { xs: 2, sm: 3, md: 4 },
        py: disableGutters ? 0 : { xs: 2, sm: 3 }
      }}
    >
      {children}
    </Container>
  );
};
```

#### 3.2 ResponsiveGrid

```typescript
// src/components/layout/ResponsiveGrid.tsx
interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  minItemWidth?: number;
  gap?: number | { xs?: number; sm?: number; md?: number };
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns,
  minItemWidth = 280,
  gap = 3,
  alignItems = 'stretch'
}) => {
  const getGridColumns = () => {
    if (columns) {
      return {
        xs: `repeat(${columns.xs || 1}, 1fr)`,
        sm: `repeat(${columns.sm || columns.xs || 2}, 1fr)`,
        md: `repeat(${columns.md || columns.sm || 3}, 1fr)`,
        lg: `repeat(${columns.lg || columns.md || 4}, 1fr)`,
        xl: `repeat(${columns.xl || columns.lg || 4}, 1fr)`,
      };
    }

    // Auto-fit с минимальной шириной
    return {
      xs: '1fr',
      sm: `repeat(auto-fit, minmax(min(${minItemWidth}px, 100%), 1fr))`,
    };
  };

  const getGap = () => {
    if (typeof gap === 'number') {
      return gap;
    }
    return {
      xs: gap.xs || 2,
      sm: gap.sm || gap.xs || 3,
      md: gap.md || gap.sm || 3,
    };
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: getGridColumns(),
        gap: getGap(),
        alignItems
      }}
    >
      {children}
    </Box>
  );
};
```

#### 3.3 ResponsiveStack

```typescript
// src/components/layout/ResponsiveStack.tsx
interface ResponsiveStackProps extends StackProps {
  mobileDirection?: 'column' | 'row';
  desktopDirection?: 'column' | 'row';
  breakpoint?: 'sm' | 'md' | 'lg';
}

export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  mobileDirection = 'column',
  desktopDirection = 'row',
  breakpoint = 'md',
  children,
  ...stackProps
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(breakpoint));

  return (
    <Stack
      direction={isMobile ? mobileDirection : desktopDirection}
      {...stackProps}
    >
      {children}
    </Stack>
  );
};
```

#### 3.4 ResponsiveForm

```typescript
// src/components/forms/ResponsiveForm.tsx
interface ResponsiveFormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  columns?: { xs?: number; sm?: number; md?: number };
  gap?: number;
  submitButton?: React.ReactNode;
  loading?: boolean;
}

export const ResponsiveForm: React.FC<ResponsiveFormProps> = ({
  children,
  onSubmit,
  columns = { xs: 1, sm: 2, md: 3 },
  gap = 2,
  submitButton,
  loading = false
}) => {
  return (
    <Box component="form" onSubmit={onSubmit}>
      <ResponsiveGrid columns={columns} gap={gap}>
        {children}
      </ResponsiveGrid>

      {submitButton && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          {React.cloneElement(submitButton as React.ReactElement, {
            disabled: loading,
            fullWidth: true,
            sx: {
              ...((submitButton as any).props?.sx || {}),
              width: { xs: '100%', sm: 'auto' },
              minWidth: { sm: 200 }
            }
          })}
        </Box>
      )}
    </Box>
  );
};
```

### 4. Testing стратегия

#### 4.1 Visual Regression Testing

```typescript
// .storybook/preview.ts
export const parameters = {
  viewport: {
    viewports: {
      iphoneSE: {
        name: 'iPhone SE',
        styles: { width: '375px', height: '667px' },
      },
      iphone14ProMax: {
        name: 'iPhone 14 Pro Max',
        styles: { width: '430px', height: '932px' },
      },
      ipadAir: {
        name: 'iPad Air',
        styles: { width: '768px', height: '1024px' },
      },
      desktop: {
        name: 'Desktop',
        styles: { width: '1440px', height: '900px' },
      },
    },
  },
  // Chromatic для visual regression
  chromatic: {
    viewports: [375, 430, 768, 1440],
  },
};
```

#### 4.2 E2E тесты для мобильных

```typescript
// cypress/e2e/mobile/wizard.cy.ts
describe('Wizard Flow - Mobile', () => {
  beforeEach(() => {
    cy.viewport('iphone-14-pro-max');
    cy.visit('/#/wizard');
  });

  it('should display vertical card stack on mobile', () => {
    cy.get('[data-testid="wizard-cards"]')
      .should('have.css', 'flex-direction', 'column');
  });

  it('should have touch-friendly buttons (min 44px)', () => {
    cy.get('button').each($btn => {
      cy.wrap($btn)
        .should('have.css', 'min-height', '44px')
        .should('have.css', 'min-width', '44px');
    });
  });

  it('should not have horizontal scroll', () => {
    cy.window().then(win => {
      expect(win.document.body.scrollWidth).to.equal(win.innerWidth);
    });
  });
});
```

#### 4.3 Performance тесты

```typescript
// tests/performance/mobile-performance.test.ts
import { devices, chromium } from '@playwright/test';

test('mobile performance metrics', async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices['iPhone 14 Pro Max'],
    // Эмуляция медленного 3G
    offline: false,
    // Throttle CPU 4x
    timezoneId: 'Europe/Moscow',
  });

  const page = await context.newPage();

  // Начать трейсинг
  await page.tracing.start({ screenshots: true, snapshots: true });

  await page.goto('http://localhost:5174/#/wizard');

  // Измерить метрики
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');

    return {
      FCP: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
      LCP: // ... largest contentful paint
      TTI: // ... time to interactive
    };
  });

  await page.tracing.stop({ path: 'trace.json' });

  // Ассерты
  expect(metrics.FCP).toBeLessThan(1800); // < 1.8s
  expect(metrics.LCP).toBeLessThan(2500); // < 2.5s
  expect(metrics.TTI).toBeLessThan(3500); // < 3.5s

  await browser.close();
});
```

### 5. Долгосрочная дорожная карта

#### Квартал 1: Фундамент (Недели 1-12)

**Недели 1-2: Инфраструктура**
- [ ] Унифицировать breakpoints (MUI + Tailwind + CSS)
- [ ] Создать ResponsiveContainer, Grid, Stack
- [ ] Настроить Storybook с viewport addon
- [ ] Внедрить visual regression testing

**Недели 3-4: Критические компоненты**
- [ ] ResponsiveDataView для замены таблиц
- [ ] Переделать CredentialsPage
- [ ] Оптимизировать WizardCreationFlow
- [ ] Touch target audit и исправления

**Недели 5-8: Формы и UX**
- [ ] ResponsiveForm компонент
- [ ] Multi-step forms для Contracts/Creatives
- [ ] Keyboard handling для мобильных
- [ ] iOS Safari specific fixes

**Недели 9-12: Performance**
- [ ] Code splitting по роутам
- [ ] Lazy loading компонентов
- [ ] Image optimization
- [ ] React Query optimization

#### Квартал 2: Продвинутые фичи (Недели 13-24)

**Недели 13-16: PWA**
- [ ] Service Worker setup
- [ ] Offline mode
- [ ] App manifest
- [ ] Install prompt

**Недели 17-20: Native-like UX**
- [ ] Pull-to-refresh
- [ ] Swipe gestures
- [ ] Bottom sheet navigation
- [ ] Haptic feedback (где поддерживается)

**Недели 21-24: Advanced**
- [ ] Network-aware loading
- [ ] Adaptive images
- [ ] Request batching
- [ ] Background sync

#### Квартал 3: Оптимизация (Недели 25-36)

**Недели 25-28: Accessibility**
- [ ] WCAG 2.1 Level AA compliance
- [ ] Screen reader optimization
- [ ] Keyboard navigation full support
- [ ] Focus management

**Недели 29-32: Analytics & Monitoring**
- [ ] Real User Monitoring (RUM)
- [ ] Performance budgets
- [ ] Error tracking (Sentry mobile)
- [ ] User behavior analytics

**Недели 33-36: Refinement**
- [ ] A/B testing framework
- [ ] Feature flags
- [ ] Gradual rollout system
- [ ] User feedback collection

### 6. Метрики успеха и KPI

#### Performance Metrics

```typescript
// Performance budget
const PERFORMANCE_BUDGET = {
  mobile: {
    FCP: 1800,  // First Contentful Paint < 1.8s
    LCP: 2500,  // Largest Contentful Paint < 2.5s
    TTI: 3500,  // Time to Interactive < 3.5s
    TBT: 300,   // Total Blocking Time < 300ms
    CLS: 0.1,   // Cumulative Layout Shift < 0.1
  },
  desktop: {
    FCP: 1000,
    LCP: 1500,
    TTI: 2000,
    TBT: 150,
    CLS: 0.05,
  }
};

// Lighthouse scores
const LIGHTHOUSE_TARGETS = {
  performance: 90,
  accessibility: 100,
  bestPractices: 95,
  seo: 100,
  pwa: 80
};
```

#### Business Metrics

- **Mobile Traffic**: Ожидаем рост на 40% после оптимизации
- **Bounce Rate**: Снижение с 60% до <40% на мобильных
- **Conversion Rate**: Mobile/Desktop ratio > 0.8
- **Session Duration**: Увеличение на 30%
- **User Satisfaction**: NPS score >50

#### Technical Metrics

- **Code Coverage**: >80% для адаптивных компонентов
- **Bundle Size**: Mobile bundle <200KB (gzipped)
- **Time to Interactive**: <3.5s on 3G
- **Error Rate**: <0.1% на мобильных
- **Crash-free Rate**: >99.9%

### 7. Риски и митigation

| Риск | Вероятность | Влияние | Митigation |
|------|-------------|---------|------------|
| Breaking changes в desktop версии | Высокая | Критическое | Comprehensive E2E tests, feature flags |
| Bundle size увеличение | Средняя | Высокое | Code splitting, tree shaking, анализ |
| iOS Safari специфичные баги | Высокая | Среднее | Тестирование на реальных устройствах |
| Performance degradation | Средняя | Высокое | Performance budgets, monitoring |
| Resistance от команды | Низкая | Среднее | Education, демонстрация пользы |
| Scope creep | Высокая | Высокое | Четкие milestones, приоритизация |

### 8. Альтернативы и trade-offs

#### Альтернатива 1: Отдельное React Native приложение
**Pros:**
- Полностью нативный UX
- Доступ к нативным API
- Оптимальная производительность

**Cons:**
- 2x разработка и поддержка
- Дополнительная команда
- App Store approval процесс
- Нет веб-версии для desktop

**Вердикт:** ❌ Не рекомендуется. Дублирование усилий.

#### Альтернатива 2: Separate mobile site (m.site.com)
**Pros:**
- Полностью оптимизирован под мобильные
- Независимая разработка
- Можно использовать другой стек

**Cons:**
- SEO проблемы (duplicate content)
- Двойная поддержка кода
- Inconsistent UX
- URL fragmentation

**Вердикт:** ❌ Не рекомендуется. Устаревший подход.

#### Альтернатива 3: Hybrid (Capacitor/Ionic)
**Pros:**
- Web + Native wrapper
- Push notifications, offline
- Одна кодовая база
- App store presence

**Cons:**
- Overhead от wrapper
- Ограничения нативных API
- Дополнительная сложность

**Вердикт:** ⚠️ Рассмотреть для Квартала 3 если нужны native features.

#### Альтернатива 4: Mobile-first полный редизайн
**Pros:**
- Современный дизайн с нуля
- Оптимален для всех устройств
- Можно внедрить best practices

**Cons:**
- Огромная стоимость
- Минимум 6 месяцев
- Риск для существующих пользователей
- Business disruption

**Вердикт:** ❌ Слишком дорого. Инкрементальный подход лучше.

### 9. Рекомендуемый подход

**Progressive Enhancement + Incremental Improvement**

1. **Сохранить текущую архитектуру**
2. **Систематически улучшать компоненты**
3. **Внедрить адаптивную библиотеку компонентов**
4. **Автоматизировать тестирование**
5. **Мониторить и оптимизировать**

**Стоимость:** ~3-4 месяца работы одного разработчика
**ROI:** Высокий (улучшение UX, SEO, конверсии)
**Риск:** Низкий (инкрементальные изменения)

---

## 🎯 Immediate Action Items

### This Week (Критические)
1. ✅ Создать `ResponsiveDataView` компонент
2. ✅ Переделать `CredentialsPage` с card layout
3. ✅ Унифицировать breakpoints в конфиге

### Next Week (Высокий приоритет)
4. ✅ Исправить `WizardCreationFlow` vertical stack
5. ✅ Audit всех touch targets (минимум 44px)
6. ✅ Добавить iOS Safe Area support

### Following Weeks (Средний приоритет)
7. ✅ Создать `ResponsiveForm` и `ResponsiveGrid`
8. ✅ Настроить Storybook viewports
9. ✅ Внедрить performance monitoring

---

## 📚 References

- [Material UI Responsive Design](https://mui.com/material-ui/guides/responsive-ui/)
- [Apple Human Interface Guidelines - iOS](https://developer.apple.com/design/human-interface-guidelines/ios)
- [Google Material Design - Layout](https://m3.material.io/foundations/layout/understanding-layout/overview)
- [Web.dev - Responsive Design](https://web.dev/responsive-web-design-basics/)
- [Can I Use - CSS Features](https://caniuse.com/)
- [MDN - Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)

---

## 💬 Заключение

Проект имеет **solid foundation**, но требует **систематического подхода** к адаптивности. Ключевые проблемы:

1. **Фрагментация UI frameworks** - нужна унификация
2. **Desktop-first мышление** - переход на mobile-first
3. **Таблицы на мобильных** - замена на cards
4. **iOS Safari quirks** - специфичные исправления
5. **Performance** - оптимизация для мобильных сетей

**Recommended Path Forward:**
Инкрементальное улучшение с фокусом на критические компоненты, затем систематическая оптимизация всех страниц. Это позволит достичь отличного мобильного UX без полного редизайна.

**Timeline:** 3-4 месяца до production-ready
**Expected Outcome:** 9/10 mobile experience

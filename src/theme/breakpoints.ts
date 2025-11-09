/**
 * Unified Breakpoints Configuration
 * Используется во всех системах: MUI, Tailwind, CSS
 */

export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;

// Для использования в CSS медиа-запросах
export const BREAKPOINT_VALUES = {
  xs: `${BREAKPOINTS.xs}px`,
  sm: `${BREAKPOINTS.sm}px`,
  md: `${BREAKPOINTS.md}px`,
  lg: `${BREAKPOINTS.lg}px`,
  xl: `${BREAKPOINTS.xl}px`,
} as const;

// Helper функции для медиа-запросов
export const mediaQuery = {
  up: (key: keyof typeof BREAKPOINTS) => `@media (min-width: ${BREAKPOINTS[key]}px)`,
  down: (key: keyof typeof BREAKPOINTS) => {
    const value = BREAKPOINTS[key];
    return `@media (max-width: ${value - 0.05}px)`;
  },
  between: (start: keyof typeof BREAKPOINTS, end: keyof typeof BREAKPOINTS) =>
    `@media (min-width: ${BREAKPOINTS[start]}px) and (max-width: ${BREAKPOINTS[end] - 0.05}px)`,
  only: (key: keyof typeof BREAKPOINTS) => {
    const keys = Object.keys(BREAKPOINTS) as Array<keyof typeof BREAKPOINTS>;
    const index = keys.indexOf(key);
    if (index === keys.length - 1) {
      return mediaQuery.up(key);
    }
    return mediaQuery.between(key, keys[index + 1]);
  },
};

// Типы для TypeScript
export type Breakpoint = keyof typeof BREAKPOINTS;
export type BreakpointValue = typeof BREAKPOINTS[Breakpoint];

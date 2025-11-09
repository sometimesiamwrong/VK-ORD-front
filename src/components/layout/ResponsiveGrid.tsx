import React from 'react';
import { Box } from '@mui/material';
import type { BoxProps } from '@mui/material/Box';

export interface ResponsiveGridProps extends Omit<BoxProps, 'gap'> {
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  minItemWidth?: number;
  gap?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns,
  minItemWidth = 280,
  gap = 3,
  alignItems = 'stretch',
  ...boxProps
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
      lg: gap.lg || gap.md || 3,
      xl: gap.xl || gap.lg || 3,
    };
  };

  return (
    <Box
      {...boxProps}
      sx={{
        display: 'grid',
        gridTemplateColumns: getGridColumns(),
        gap: getGap(),
        alignItems,
        ...boxProps.sx,
      }}
    >
      {children}
    </Box>
  );
};

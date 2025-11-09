import React from 'react';
import { Stack, useTheme, useMediaQuery } from '@mui/material';
import type { StackProps } from '@mui/material/Stack';

export interface ResponsiveStackProps extends Omit<StackProps, 'direction'> {
  mobileDirection?: 'column' | 'row';
  desktopDirection?: 'column' | 'row';
  breakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
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

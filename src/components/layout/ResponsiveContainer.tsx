import React from 'react';
import { Container } from '@mui/material';
import type { ContainerProps } from '@mui/material/Container';

export interface ResponsiveContainerProps extends Omit<ContainerProps, 'maxWidth'> {
  variant?: 'narrow' | 'medium' | 'wide' | 'full';
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  variant = 'medium',
  disableGutters = false,
  ...props
}) => {
  const maxWidth = {
    narrow: 'sm' as const,    // 600px
    medium: 'md' as const,    // 900px
    wide: 'lg' as const,      // 1200px
    full: false as const,     // No max width
  }[variant];

  return (
    <Container
      maxWidth={maxWidth}
      disableGutters={disableGutters}
      {...props}
      sx={{
        px: disableGutters ? 0 : { xs: 2, sm: 3, md: 4 },
        py: disableGutters ? 0 : { xs: 2, sm: 3 },
        ...props.sx,
      }}
    >
      {children}
    </Container>
  );
};

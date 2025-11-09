import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Stack,
  Box,
  Typography,
  Skeleton,
  useTheme,
  useMediaQuery,
} from '@mui/material';

export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  mobileLabel?: string;
  hideOnMobile?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface ResponsiveDataViewProps<T> {
  data: T[];
  columns: Column<T>[];
  mobileRenderer?: (row: T, index: number) => React.ReactNode;
  keyExtractor: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyState?: React.ReactNode;
  cardActions?: (row: T) => React.ReactNode;
}

export function ResponsiveDataView<T extends Record<string, any>>({
  data,
  columns,
  mobileRenderer,
  keyExtractor,
  onRowClick,
  loading,
  emptyState,
  cardActions,
}: ResponsiveDataViewProps<T>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Loading state
  if (loading) {
    return (
      <Stack spacing={2}>
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={isMobile ? 120 : 60}
            sx={{ borderRadius: isMobile ? 2 : 0 }}
          />
        ))}
      </Stack>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      emptyState || (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">Нет данных</Typography>
        </Paper>
      )
    );
  }

  // Mobile view - Cards
  if (isMobile) {
    if (mobileRenderer) {
      return (
        <Stack spacing={2}>
          {data.map((row, index) => (
            <Box key={keyExtractor(row)}>{mobileRenderer(row, index)}</Box>
          ))}
        </Stack>
      );
    }

    // Default mobile card
    return (
      <Stack spacing={2}>
        {data.map((row) => (
          <Card
            key={keyExtractor(row)}
            onClick={() => onRowClick?.(row)}
            sx={{
              cursor: onRowClick ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              '&:hover': onRowClick
                ? {
                    boxShadow: 3,
                    transform: 'translateY(-2px)',
                  }
                : {},
              '&:active': onRowClick
                ? {
                    transform: 'translateY(0)',
                    boxShadow: 1,
                  }
                : {},
            }}
          >
            <CardContent>
              <Stack spacing={1.5}>
                {columns
                  .filter((col) => !col.hideOnMobile)
                  .map((col) => (
                    <Box key={String(col.key)}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}
                      >
                        {col.mobileLabel || col.header}
                      </Typography>
                      <Typography variant="body2">
                        {col.render
                          ? col.render(row[col.key], row)
                          : String(row[col.key] || '-')}
                      </Typography>
                    </Box>
                  ))}
              </Stack>
              {cardActions && (
                <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  {cardActions(row)}
                </Box>
              )}
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
            {columns.map((col) => (
              <TableCell key={String(col.key)} align={col.align || 'left'}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {col.header}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={keyExtractor(row)}
              hover={!!onRowClick}
              onClick={() => onRowClick?.(row)}
              sx={{
                cursor: onRowClick ? 'pointer' : 'default',
                '&:last-child td, &:last-child th': { border: 0 },
              }}
            >
              {columns.map((col) => (
                <TableCell key={String(col.key)} align={col.align || 'left'}>
                  {col.render
                    ? col.render(row[col.key], row)
                    : String(row[col.key] || '-')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

import React from 'react'
import { Box, Typography, Link } from '@mui/material'

interface FooterProps {
  variant?: 'default' | 'compact'
}

export const Footer: React.FC<FooterProps> = ({ variant = 'default' }) => {
  const isCompact = variant === 'compact'

  return (
    <Box
      component="footer"
      sx={{
        py: isCompact ? 1 : 1.5,
        px: isCompact ? 2 : 3,
        mt: 'auto',
        textAlign: 'center',
        borderTop: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        flexShrink: 0,
      }}
    >
      <Typography variant={isCompact ? 'caption' : 'body2'} color="text.secondary">
        © 2025 Платформа Юриста для VK ОРД
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25 }}>
        По проблемам и предложениям обращайтесь к{' '}
        <Link
          href="https://t.me/reslixx"
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          color="primary"
        >
          разработчику
        </Link>
      </Typography>
    </Box>
  )
}

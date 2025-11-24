import React, { useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useImpersonate as useImpersonate } from '@/auth/hooks'
import { Box, CircularProgress, Typography } from '@mui/material'

export const ImpersonatePage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const impersonate = useImpersonate()
  const token = searchParams.get('token')
  const hasAttempted = useRef(false)

  useEffect(() => {
    // Only attempt impersonation once
    if (hasAttempted.current) return

    if (token) {
      hasAttempted.current = true
      impersonate.mutate(token)
    } else {
      // Redirect to login if no token
      navigate('/login')
    }
  }, [token, navigate, impersonate])

  // Note: Redirect on success/error is handled by useImpersonate hook

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Загрузка...
        </Typography>
      </Box>
    </Box>
  )
}

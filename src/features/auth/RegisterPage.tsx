import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Typography,
  Box,
  Alert,
} from '@mui/material'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/layout/Footer'
import { useRegister } from '../../auth/hooks'

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
    name: '',
  })

  const registerMutation = useRegister()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    registerMutation.mutate(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateRows: '1fr auto',
        height: '100vh',
        overflow: 'hidden',
        margin: '-32px',
        marginTop: 'calc(-32px - env(safe-area-inset-top))',
        marginBottom: 'calc(-32px - env(safe-area-inset-bottom))',
        width: 'calc(100% + 64px)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          px: 2,
        }}
      >
        <Container component="main" maxWidth="sm" sx={{ py: 3 }}>
          <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
            <Typography component="h1" variant="h4" align="center" gutterBottom>
              Регистрация
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="userName"
                label="Имя пользователя"
                name="userName"
                autoComplete="username"
                autoFocus
                value={formData.userName}
                onChange={handleChange}
                disabled={registerMutation.isPending}
              />
              <TextField
                margin="normal"
                fullWidth
                id="name"
                label="Отображаемое имя"
                name="name"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                disabled={registerMutation.isPending}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Пароль"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                disabled={registerMutation.isPending}
              />

              {registerMutation.isError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {registerMutation.error?.message || 'Ошибка регистрации'}
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full mt-3 mb-2"
                disabled={registerMutation.isPending || !formData.userName || !formData.password}
              >
                {registerMutation.isPending ? 'Регистрация...' : 'Зарегистрироваться'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="primary">
                    Уже есть аккаунт? Войти
                  </Typography>
                </Link>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
      <Footer />
    </Box>
  )
}




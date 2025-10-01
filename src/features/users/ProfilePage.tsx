import React, { useState } from 'react'
import {
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Alert,
  Divider,
  Card,
  CardContent,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useUserProfile, useUpdateUserProfile } from '../../auth/hooks'

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const { data: profile, isLoading, error, refetch } = useUserProfile()
  const updateProfileMutation = useUpdateUserProfile()

  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
  })

  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
      })
    }
  }, [profile])

  const handleEdit = () => {
    setEditMode(true)
  }

  const handleCancel = () => {
    setEditMode(false)
    if (profile) {
      setFormData({
        name: profile.name || '',
      })
    }
  }

  const handleSave = () => {
    updateProfileMutation.mutate(formData, {
      onSuccess: () => {
        setEditMode(false)
        refetch()
      },
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (isLoading) {
    return <Typography>Загрузка профиля...</Typography>
  }

  if (error) {
    return (
      <Alert severity="error">
        Ошибка загрузки профиля: {error.message}
      </Alert>
    )
  }

  if (!profile) {
    return (
      <Alert severity="warning">
        Профиль не найден
      </Alert>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Профиль пользователя
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Profile Information */}
        <Box sx={{ flex: { xs: '1', md: '2' } }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Личная информация
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
              <TextField
                fullWidth
                label="Имя пользователя"
                value={profile.userName}
                disabled
                helperText="Имя пользователя изменить нельзя"
              />
              <TextField
                fullWidth
                label="Отображаемое имя"
                name="name"
                value={editMode ? formData.name : profile.name || ''}
                onChange={handleChange}
                disabled={!editMode}
              />
              <TextField
                fullWidth
                label="Статус аккаунта"
                value={profile.isActive ? 'Активен' : 'Неактивен'}
                disabled
              />
              <TextField
                fullWidth
                label="Дата регистрации"
                value={new Date(profile.createdAt).toLocaleDateString('ru-RU')}
                disabled
              />
              <TextField
                fullWidth
                label="Последнее обновление"
                value={new Date(profile.updatedAt).toLocaleDateString('ru-RU')}
                disabled
              />
            </Box>

            {updateProfileMutation.isError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Ошибка обновления профиля: {updateProfileMutation.error?.message}
              </Alert>
            )}

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              {!editMode ? (
                <Button variant="contained" onClick={handleEdit}>
                  Редактировать
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                  <Button variant="outlined" onClick={handleCancel}>
                    Отмена
                  </Button>
                </>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Account Statistics */}
        <Box sx={{ flex: { xs: '1', md: '1' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Статистика аккаунта
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Статус
                </Typography>
                <Typography variant="body1" sx={{
                  color: profile.isActive ? 'success.main' : 'error.main'
                }}>
                  {profile.isActive ? '✓ Активен' : '✗ Неактивен'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Дата регистрации
                </Typography>
                <Typography variant="body1">
                  {new Date(profile.createdAt).toLocaleDateString('ru-RU')}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Дней с регистрации
                </Typography>
                <Typography variant="body1">
                  {Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Subscription Info */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Подписка
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'grid', gap: 1.5 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Тип подписки</Typography>
                  <Typography variant="body1" fontWeight={700}>Безлимитная</Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">Начало подписки</Typography>
                  <Typography variant="body1">{new Date(profile.createdAt).toLocaleDateString('ru-RU')}</Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">Статус</Typography>
                  <Typography variant="body1" sx={{ color: 'success.main' }}>Активна</Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">Срок действия</Typography>
                  <Typography variant="body1">Бессрочно</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Recent Activity / Quick Action */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Недавняя активность
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/wizard')}
                >
                  Быстро получить ERID
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  )
}

import React from 'react'
import {
  Typography,
  Paper,
  Box,
  Card,
  CardContent,
  CardActions,
} from '@mui/material'
import { Button } from '@/components/ui/button'
import {
  Description as DescriptionIcon,
  Movie as MovieIcon,
  Image as ImageIcon,
  VpnKey as VpnKeyIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { useUserProfile } from '../../auth/hooks'

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { data: userProfile, isLoading, error } = useUserProfile()
  console.log('DashboardPage rendered, userProfile:', userProfile, 'isLoading:', isLoading, 'error:', error);

 const quickActions = [
    {
      title: 'Контракты',
      description: 'Создание и управление контрактами',
      icon: <DescriptionIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/contracts',
      color: 'primary.main',
    },
    {
      title: 'Креативы',
      description: 'Создание и управление креативами',
      icon: <MovieIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      path: '/creatives',
      color: 'secondary.main',
    },
    {
      title: 'Медиа',
      description: 'Загрузка и управление медиафайлами',
      icon: <ImageIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      path: '/media',
      color: 'success.main',
    },
    {
      title: 'Credentials',
      description: 'Управление VK ORD токенами',
      icon: <VpnKeyIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      path: '/credentials',
      color: 'warning.main',
    },
  ]

  return (
    <DashboardLayout>
      <Box sx={{ flexGrow: 1 }}>
        {/* Welcome Section */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Добро пожаловать{userProfile?.name ? `, ${userProfile.name}` : ''}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Личный кабинет VK ORD. Здесь вы можете управлять контрактами, креативами, медиафайлами и настройками интеграции.
          </Typography>
        </Paper>

        {/* Quick Actions */}
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Быстрые действия
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3 }}>
          {quickActions.map((action) => (
            <Card key={action.title} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  {action.icon}
                </Box>
                <Typography variant="h6" component="h2" gutterBottom>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(action.path)}
                >
                  Перейти
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>

        {/* Recent Activity Placeholder */}
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Недавняя активность
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Здесь будет отображаться история ваших последних действий.
          </Typography>
        </Paper>
      </Box>
    </DashboardLayout>
  )
}

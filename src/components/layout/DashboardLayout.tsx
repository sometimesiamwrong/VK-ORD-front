import React from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  VpnKey as VpnKeyIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  Movie as MovieIcon,
  Logout as LogoutIcon,
  AccountCircle,
  AutoAwesome as AutoAwesomeIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material'
import { useLogout } from '../../auth/hooks'
import { useEnvironmentStore } from '../../auth/tokenStore'

const drawerWidth = 240

interface DashboardLayoutProps {
  children?: React.ReactNode
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const logoutMutation = useLogout()
  const { environment, setEnvironment } = useEnvironmentStore()

  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  
  console.log('DashboardLayout rendered, children:', children, 'environment:', environment);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    handleProfileMenuClose()
    logoutMutation.mutate()
  }

  const handleEnvironmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEnvironment(event.target.checked ? 'prod' : 'sandbox')
  }

  const menuItems = [
    { text: 'Дашборд', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Визард ERID', icon: <AutoAwesomeIcon />, path: '/wizard' },
    { text: 'Контрагенты', icon: <PeopleIcon />, path: '/parties' },
    { text: 'Акты', icon: <ReceiptIcon />, path: '/acts' },
    { text: 'Профиль', icon: <PersonIcon />, path: '/profile' },
    { text: 'Credentials', icon: <VpnKeyIcon />, path: '/credentials' },
    { text: 'Контракты', icon: <DescriptionIcon />, path: '/contracts' },
    { text: 'Креативы', icon: <MovieIcon />, path: '/creatives' },
    { text: 'Медиа', icon: <ImageIcon />, path: '/media' },
  ]

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          VK ORD Cabinet
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              onClick={() => isMobile && setMobileOpen(false)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={environment === 'prod'}
              onChange={handleEnvironmentChange}
              color="primary"
            />
          }
          label={environment === 'prod' ? 'Production' : 'Sandbox'}
        />
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            VK ORD Личный Кабинет
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Box>

          <Menu
            id="primary-search-account-menu"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profile') }}>
              <PersonIcon sx={{ mr: 1 }} />
              Профиль
            </MenuItem>
            <MenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
              <LogoutIcon sx={{ mr: 1 }} />
              {logoutMutation.isPending ? 'Выход...' : 'Выйти'}
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` }
        }}
      >
        <Toolbar />
        <Container maxWidth="lg">
          {children || <Outlet />}
        </Container>
      </Box>
    </Box>
  )
}

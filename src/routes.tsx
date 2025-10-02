import React, { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ToastContainer } from 'react-toastify'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import 'react-toastify/dist/ReactToastify.css'

import { queryClient } from './api/queryClient'
import { useAuth, useAutoRefresh } from './auth/hooks'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { ProfilePage } from './features/users/ProfilePage'
import { CredentialsPage } from './features/credentials/CredentialsPage'
import { ContractsPage } from './features/contracts/ContractsPage'
import { CreativesPage } from './features/creatives/CreativesPage'
import { MediaPage } from './features/media/MediaPage'
import { WizardPage } from './features/wizard/WizardPage'
import { PartiesPage } from './features/parties/PartiesPage'

// Auth guard component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const autoRefresh = useAutoRefresh()
  const [hasTriedRefresh, setHasTriedRefresh] = React.useState(false)

  useEffect(() => {
    if (!isAuthenticated && !hasTriedRefresh && !autoRefresh.isPending) {
      // Try to refresh token on app start (only once)
      setHasTriedRefresh(true)
      autoRefresh.mutate()
    }
  }, [isAuthenticated, hasTriedRefresh, autoRefresh])

  if (!isAuthenticated && (autoRefresh.isPending || !hasTriedRefresh)) {
    return <div>Loading...</div>
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Public route component (redirects to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth()

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

// Main app router
export const AppRouter: React.FC = () => {
  const theme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  })

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ProfilePage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/credentials"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CredentialsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/contracts"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ContractsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/creatives"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CreativesPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/media"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <MediaPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/wizard"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <WizardPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/parties"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <PartiesPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </HashRouter>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  )
}

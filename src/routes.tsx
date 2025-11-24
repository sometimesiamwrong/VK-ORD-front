import { Toaster } from "@/components/ui/sonner"
import React, { useEffect, Suspense } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

import { queryClient } from './api/queryClient'
import { useAuth, useAutoRefresh } from './auth/hooks'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PageLoader } from './components/PageLoader'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { ImpersonatePage } from './features/auth/ImpersonatePage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { ProfilePage } from './features/users/ProfilePage'
import { CredentialsPage } from './features/credentials/CredentialsPage'
import { ContractsPage } from './features/contracts/ContractsPage'
import { CreativesPage } from './features/creatives/CreativesPage'
import { MediaPage } from './features/media/MediaPage'
import { WizardPage } from './features/wizard/WizardPage'
import { PartiesPage } from './features/parties/PartiesPage'
import { ActsPage, ActFormPage } from './features/acts';
import { CredentialGuard } from './components/guards/CredentialGuard'

// Auth guard component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const autoRefresh = useAutoRefresh()
  const [hasTriedRefresh, setHasTriedRefresh] = React.useState(false)

  useEffect(() => {
    console.log('ProtectedRoute useEffect: isAuthenticated:', isAuthenticated, 'hasTriedRefresh:', hasTriedRefresh, 'autoRefresh.isPending:', autoRefresh.isPending);
    if (!isAuthenticated && !hasTriedRefresh && !autoRefresh.isPending) {
      // Try to refresh token on app start (only once)
      console.log('ProtectedRoute: Attempting to refresh token');
      setHasTriedRefresh(true)
      autoRefresh.mutate()
    }
  }, [isAuthenticated, hasTriedRefresh, autoRefresh])

  console.log('ProtectedRoute: isAuthenticated:', isAuthenticated, 'autoRefresh.isPending:', autoRefresh.isPending, 'hasTriedRefresh:', hasTriedRefresh);
  
  if (!isAuthenticated && (autoRefresh.isPending || !hasTriedRefresh)) {
    console.log('ProtectedRoute: Showing loading state');
    return <div>Loading...</div>
  }

  console.log('ProtectedRoute: Rendering children or redirecting');
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Public route component (redirects to home page if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth()

  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>
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

  // Fix URL when accessed with pathname instead of hash
  useEffect(() => {
    const { pathname, hash } = window.location
    // If pathname is not root and there's a hash, we need to fix the URL
    if (pathname !== '/' && pathname !== '/index.html') {
      // Move pathname to hash
      const newHash = hash ? `${pathname}${hash}` : pathname
      window.location.replace(`${window.location.origin}/#${newHash}`)
    }
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster />
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <HashRouter>
            <Suspense fallback={<PageLoader />}>
              <CredentialGuard />
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
              <Route
                path="/auth/verify"
                element={<ImpersonatePage />}
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
              <Route
                path="/acts"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ActsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/acts/new"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ActFormPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/acts/:actId/edit"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ActFormPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Default redirect */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <WizardPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </HashRouter>
        </ErrorBoundary>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  )
}

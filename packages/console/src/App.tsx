import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { SnackbarProvider } from './context/SnackbarContext.js';
import ConsoleLayout from './layouts/ConsoleLayout.js';
import LoadingScreen from './components/LoadingScreen.js';

// Lazy-loaded pages (D7: Suspense + Loading)
const SignInPage = lazy(() => import('./pages/auth/SignInPage.js'));
const ResourceListPage = lazy(() => import('./pages/explorer/ResourceListPage.js'));
const ResourceDetailPage = lazy(() => import('./pages/explorer/ResourceDetailPage.js'));
const ResourceCreatePage = lazy(() => import('./pages/crud/ResourceCreatePage.js'));
const BatchPage = lazy(() => import('./pages/crud/BatchPage.js'));
const ServerInfoPage = lazy(() => import('./pages/server/ServerInfoPage.js'));
const AdminProjectPage = lazy(() => import('./pages/admin/AdminProjectPage.js'));
const AdminMembersPage = lazy(() => import('./pages/admin/AdminMembersPage.js'));
const AdminInvitePage = lazy(() => import('./pages/admin/AdminInvitePage.js'));
const CodeSystemListPage = lazy(() => import('./pages/terminology/CodeSystemListPage.js'));
const CodeSystemDetailPage = lazy(() => import('./pages/terminology/CodeSystemDetailPage.js'));
const ValueSetListPage = lazy(() => import('./pages/terminology/ValueSetListPage.js'));
const ValueSetDetailPage = lazy(() => import('./pages/terminology/ValueSetDetailPage.js'));
const ProfileListPage = lazy(() => import('./pages/profiles/ProfileListPage.js'));
const ProfileDetailPage = lazy(() => import('./pages/profiles/ProfileDetailPage.js'));
const ValidationPage = lazy(() => import('./pages/validation/ValidationPage.js'));

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { loading, authenticated } = useAuth();
  if (loading) return <LoadingScreen message="Restoring session..." />;
  if (!authenticated) return <Navigate to="/signin" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public */}
        <Route path="/signin" element={<SignInPage />} />

        {/* Protected — inside ConsoleLayout */}
        <Route element={<RequireAuth><ConsoleLayout /></RequireAuth>}>
          <Route index element={<Navigate to="/Patient" replace />} />
          <Route path="/batch" element={<BatchPage />} />
          <Route path="/server" element={<ServerInfoPage />} />
          <Route path="/admin" element={<AdminProjectPage />} />
          <Route path="/admin/members" element={<AdminMembersPage />} />
          <Route path="/admin/invite" element={<AdminInvitePage />} />
          <Route path="/terminology/codesystems" element={<CodeSystemListPage />} />
          <Route path="/terminology/codesystems/:id" element={<CodeSystemDetailPage />} />
          <Route path="/terminology/valuesets" element={<ValueSetListPage />} />
          <Route path="/terminology/valuesets/:id" element={<ValueSetDetailPage />} />
          <Route path="/profiles" element={<ProfileListPage />} />
          <Route path="/profiles/:id" element={<ProfileDetailPage />} />
          <Route path="/validation" element={<ValidationPage />} />
          <Route path="/:resourceType/new" element={<ResourceCreatePage />} />
          <Route path="/:resourceType/:id" element={<ResourceDetailPage />} />
          <Route path="/:resourceType" element={<ResourceListPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

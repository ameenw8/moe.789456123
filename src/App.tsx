import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingSpinner } from '@/components/features/LoadingSpinner';
import { useAuthStore } from '@/stores/authStore';
import { Toaster } from '@/components/ui/toaster';

const Login = lazy(() => import('@/pages/Login'));
const ChangePassword = lazy(() => import('@/pages/ChangePassword'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Projects = lazy(() => import('@/pages/Projects'));
const ProjectForm = lazy(() => import('@/pages/ProjectForm'));
const ProjectDetail = lazy(() => import('@/pages/ProjectDetail'));
const Partners = lazy(() => import('@/pages/Partners'));
const Funders = lazy(() => import('@/pages/Funders'));
const Volunteers = lazy(() => import('@/pages/Volunteers'));
const Reports = lazy(() => import('@/pages/Reports'));
const UserManagement = lazy(() => import('@/pages/UserManagement'));
const AuditLog = lazy(() => import('@/pages/AuditLog'));

function PasswordGuard({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuthStore();
  if (currentUser?.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route
            path="/"
            element={
              <PasswordGuard>
                <AppLayout />
              </PasswordGuard>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/new" element={<ProjectForm />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="projects/:id/edit" element={<ProjectForm />} />
            <Route path="partners" element={<Partners />} />
            <Route path="funders" element={<Funders />} />
            <Route path="volunteers" element={<Volunteers />} />
            <Route path="reports" element={<Reports />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="audit" element={<AuditLog />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
      <Toaster />
    </BrowserRouter>
  );
}

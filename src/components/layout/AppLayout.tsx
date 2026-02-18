import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthStore } from '@/stores/authStore';

export function AppLayout() {
  const { currentUser } = useAuthStore();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

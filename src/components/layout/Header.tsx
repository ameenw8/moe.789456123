import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { LogOut, ArrowRightLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const { currentUser, logout, isImpersonating, stopImpersonation } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) return null;

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {isImpersonating && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <ArrowRightLeft className="size-4" />
            <span>أنت تتصفح كـ: {currentUser.fullName}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={stopImpersonation}
              className="h-6 px-2 text-xs text-amber-800 hover:bg-amber-100"
            >
              العودة للمسؤول
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full" />
        </Button>
        <div className="w-px h-8 bg-border" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="gap-2 text-muted-foreground hover:text-destructive"
        >
          <LogOut className="size-4" />
          <span className="text-sm">خروج</span>
        </Button>
      </div>
    </header>
  );
}

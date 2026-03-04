import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Handshake,
  Wallet,
  UserCheck,
  BarChart3,
  ScrollText,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: ('NormalUser' | 'ProjectManager' | 'Admin')[];
}

const navItems: NavItem[] = [
  { label: 'لوحة التحكم', path: '/dashboard', icon: <LayoutDashboard className="size-5" />, roles: ['NormalUser', 'ProjectManager', 'Admin'] },
  { label: 'المشاريع', path: '/projects', icon: <FolderKanban className="size-5" />, roles: ['NormalUser', 'ProjectManager', 'Admin'] },
  { label: 'الشركاء', path: '/partners', icon: <Handshake className="size-5" />, roles: ['NormalUser', 'ProjectManager', 'Admin'] },
  { label: 'الممولون', path: '/funders', icon: <Wallet className="size-5" />, roles: ['NormalUser', 'ProjectManager', 'Admin'] },
  { label: 'المتطوعون', path: '/volunteers', icon: <UserCheck className="size-5" />, roles: ['NormalUser', 'ProjectManager', 'Admin'] },
  { label: 'التقارير', path: '/reports', icon: <BarChart3 className="size-5" />, roles: ['ProjectManager', 'Admin'] },
  { label: 'إدارة المستخدمين', path: '/users', icon: <Users className="size-5" />, roles: ['Admin'] },
  { label: 'سجل العمليات', path: '/audit', icon: <ScrollText className="size-5" />, roles: ['Admin'] },
];

export function Sidebar() {
  const location = useLocation();
  const { currentUser } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!currentUser) return null;

  const filteredItems = navItems.filter(item => item.roles.includes(currentUser.role));

  const sidebarContent = (
    <>
      {/* Logo area */}
      <div className="h-16 flex items-center justify-between gap-3 px-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img src={palvisionLogo} alt="Palestinian Vision" className="h-9 object-contain brightness-0 invert" />
        </div>
        <button className="lg:hidden text-sidebar-foreground/70" onClick={() => setMobileOpen(false)}>
          <X className="size-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-primary font-bold text-sm">
            {currentUser.fullName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">{currentUser.fullName}</p>
            <p className="text-[10px] text-sidebar-foreground/50">
              {currentUser.role === 'Admin' ? 'مسؤول النظام' : currentUser.role === 'ProjectManager' ? 'مدير مشاريع' : 'مستخدم عادي'}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed top-4 right-4 z-50 bg-sidebar text-sidebar-foreground p-2 rounded-lg shadow-lg"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="size-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={cn(
        'lg:hidden fixed inset-y-0 right-0 z-50 w-64 bg-sidebar flex flex-col border-l border-sidebar-border transition-transform duration-300',
        mobileOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 min-h-screen bg-sidebar flex-col border-l border-sidebar-border shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}


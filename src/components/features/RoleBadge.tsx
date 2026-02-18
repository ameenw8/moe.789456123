import { cn } from '@/lib/utils';
import { UserRole, ROLE_LABELS } from '@/types';

interface RoleBadgeProps {
  role: UserRole;
}

const roleConfig: Record<UserRole, string> = {
  Admin: 'bg-purple-100 text-purple-800 border-purple-200',
  ProjectManager: 'bg-blue-100 text-blue-800 border-blue-200',
  NormalUser: 'bg-slate-100 text-slate-700 border-slate-200',
};

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold border', roleConfig[role])}>
      {ROLE_LABELS[role]}
    </span>
  );
}

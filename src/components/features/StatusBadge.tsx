import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'Pending' | 'Approved' | 'Rejected';
}

const statusConfig = {
  Pending: { label: 'قيد الانتظار', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  Approved: { label: 'معتمد', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  Rejected: { label: 'مرفوض', className: 'bg-red-100 text-red-800 border-red-200' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold border', config.className)}>
      {config.label}
    </span>
  );
}

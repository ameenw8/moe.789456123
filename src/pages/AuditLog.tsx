import { useAuthStore } from '@/stores/authStore';
import { ScrollText, Clock, Shield, AlertCircle, CheckCircle2, XCircle, UserPlus, Ban, LogIn, Pencil, Trash2 } from 'lucide-react';

const ACTION_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  PROJECT_APPROVED: { label: 'اعتماد مشروع', icon: <CheckCircle2 className="size-4" />, color: 'text-emerald-600 bg-emerald-50' },
  PROJECT_REJECTED: { label: 'رفض مشروع', icon: <XCircle className="size-4" />, color: 'text-red-600 bg-red-50' },
  PROJECT_CREATED: { label: 'إنشاء مشروع', icon: <Shield className="size-4" />, color: 'text-blue-600 bg-blue-50' },
  PROJECT_DELETED: { label: 'حذف مشروع', icon: <Trash2 className="size-4" />, color: 'text-red-600 bg-red-50' },
  USER_CREATED: { label: 'إنشاء مستخدم', icon: <UserPlus className="size-4" />, color: 'text-purple-600 bg-purple-50' },
  USER_SUSPENDED: { label: 'تعليق مستخدم', icon: <Ban className="size-4" />, color: 'text-amber-600 bg-amber-50' },
  USER_ACTIVATED: { label: 'تفعيل مستخدم', icon: <CheckCircle2 className="size-4" />, color: 'text-emerald-600 bg-emerald-50' },
  USER_DELETED: { label: 'حذف مستخدم', icon: <Trash2 className="size-4" />, color: 'text-red-600 bg-red-50' },
  IMPERSONATION: { label: 'انتحال هوية', icon: <LogIn className="size-4" />, color: 'text-amber-600 bg-amber-50' },
  DATA_EDITED: { label: 'تعديل بيانات', icon: <Pencil className="size-4" />, color: 'text-blue-600 bg-blue-50' },
};

export default function AuditLog() {
  const { currentUser, auditLogs } = useAuthStore();

  if (!currentUser || currentUser.role !== 'Admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">ليس لديك صلاحية للوصول</p>
      </div>
    );
  }

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    return `${d.toLocaleDateString('ar-EG')} ${d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">سجل العمليات</h1>
        <p className="text-sm text-muted-foreground mt-0.5">تتبع جميع العمليات والتغييرات في النظام</p>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-5 border-b border-border flex items-center gap-2">
          <ScrollText className="size-4 text-primary" />
          <span className="text-sm font-bold text-foreground">السجلات ({auditLogs.length})</span>
        </div>
        <div className="divide-y divide-border">
          {auditLogs.map(log => {
            const config = ACTION_CONFIG[log.action] || { label: log.action, icon: <AlertCircle className="size-4" />, color: 'text-gray-600 bg-gray-50' };
            return (
              <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-muted/20 transition-colors">
                <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-foreground">{config.label}</span>
                    <span className="text-xs text-muted-foreground">بواسطة {log.userName}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{log.details}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                  <Clock className="size-3" />
                  <span className="tabular-nums">{formatTimestamp(log.timestamp)}</span>
                </div>
              </div>
            );
          })}
          {auditLogs.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">لا توجد سجلات</div>
          )}
        </div>
      </div>
    </div>
  );
}

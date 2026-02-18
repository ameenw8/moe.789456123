import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useProjectStore } from '@/stores/projectStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RoleBadge } from '@/components/features/RoleBadge';
import { UserRole, ROLE_LABELS } from '@/types';
import {
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
  Ban,
  CheckCircle2,
  LogIn,
  AlertCircle,
  TrendingUp,
  FolderKanban,
  BarChart3,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function UserManagement() {
  const { currentUser, users, createUser, updateUser, toggleUserStatus, deleteUser, impersonateUser } = useAuthStore();
  const { projects } = useProjectStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    role: '' as UserRole | '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!currentUser || currentUser.role !== 'Admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">ليس لديك صلاحية للوصول</p>
      </div>
    );
  }

  const filteredUsers = users.filter(u => {
    if (search && !u.fullName.includes(search) && !u.username.includes(search)) return false;
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    return true;
  });

  const resetForm = () => {
    setFormData({ username: '', password: '', fullName: '', role: '' });
    setErrors({});
    setEditingId(null);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = 'الاسم مطلوب';
    if (!formData.username.trim()) errs.username = 'اسم المستخدم مطلوب';
    if (!editingId && !formData.password.trim()) errs.password = 'كلمة المرور مطلوبة';
    if (!editingId && formData.password.length > 0 && formData.password.length < 6) errs.password = 'على الأقل 6 أحرف';
    if (!formData.role) errs.role = 'الدور مطلوب';
    if (!editingId && users.some(u => u.username === formData.username)) errs.username = 'اسم المستخدم موجود مسبقاً';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (editingId) {
      const updates: Record<string, string> = {
        fullName: formData.fullName,
        role: formData.role as UserRole,
      };
      if (formData.password) updates.password = formData.password;
      updateUser(editingId, updates);
      toast({ title: 'تم تحديث المستخدم' });
    } else {
      createUser({
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role as UserRole,
      });
      toast({ title: 'تم إنشاء المستخدم بنجاح' });
    }
    setShowDialog(false);
    resetForm();
  };

  const handleImpersonate = (userId: string) => {
    impersonateUser(userId);
    toast({ title: 'تم التبديل', description: 'تتصفح الآن كمستخدم آخر' });
    navigate('/dashboard');
  };

  const getUserProjectCount = (userId: string) => projects.filter(p => p.createdBy === userId).length;
  const getApprovedCount = (userId: string) => projects.filter(p => p.createdBy === userId && p.status === 'Approved').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">إدارة المستخدمين</h1>
          <p className="text-sm text-muted-foreground mt-0.5">إنشاء وإدارة حسابات المستخدمين</p>
        </div>
        <Button className="gap-2" onClick={() => { resetForm(); setShowDialog(true); }}>
          <Plus className="size-4" />
          مستخدم جديد
        </Button>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="size-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{users.length}</p>
              <p className="text-xs text-muted-foreground">إجمالي المستخدمين</p>
            </div>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>نشط: {users.filter(u => u.isActive).length}</span>
            <span>معطل: {users.filter(u => !u.isActive).length}</span>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <FolderKanban className="size-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{projects.length}</p>
              <p className="text-xs text-muted-foreground">إجمالي المشاريع</p>
            </div>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>معتمد: {projects.filter(p => p.status === 'Approved').length}</span>
            <span>مرفوض: {projects.filter(p => p.status === 'Rejected').length}</span>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <BarChart3 className="size-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">
                {users.filter(u => u.role === 'ProjectManager').length}
              </p>
              <p className="text-xs text-muted-foreground">مدراء المشاريع</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="بحث بالاسم..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger><SelectValue placeholder="الدور" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأدوار</SelectItem>
              <SelectItem value="Admin">مسؤول النظام</SelectItem>
              <SelectItem value="ProjectManager">مدير مشاريع</SelectItem>
              <SelectItem value="NormalUser">مستخدم عادي</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-right px-5 py-3 font-semibold text-muted-foreground">المستخدم</th>
              <th className="text-right px-5 py-3 font-semibold text-muted-foreground">اسم الدخول</th>
              <th className="text-right px-5 py-3 font-semibold text-muted-foreground">الدور</th>
              <th className="text-right px-5 py-3 font-semibold text-muted-foreground">الحالة</th>
              <th className="text-right px-5 py-3 font-semibold text-muted-foreground">المشاريع</th>
              <th className="text-right px-5 py-3 font-semibold text-muted-foreground">تاريخ الإنشاء</th>
              <th className="text-center px-5 py-3 font-semibold text-muted-foreground">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
                      {user.fullName.charAt(0)}
                    </div>
                    <span className="font-medium text-foreground">{user.fullName}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{user.username}</td>
                <td className="px-5 py-3"><RoleBadge role={user.role} /></td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${user.isActive ? 'text-emerald-700' : 'text-red-600'}`}>
                    <span className={`size-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {user.isActive ? 'نشط' : 'معطل'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm tabular-nums font-medium">{getUserProjectCount(user.id)}</span>
                    <span className="text-xs text-muted-foreground">({getApprovedCount(user.id)} معتمد)</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground tabular-nums">{user.createdAt}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => {
                        setEditingId(user.id);
                        setFormData({ username: user.username, password: '', fullName: user.fullName, role: user.role });
                        setShowDialog(true);
                      }}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    {user.id !== currentUser.id && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => { toggleUserStatus(user.id); toast({ title: user.isActive ? 'تم تعطيل الحساب' : 'تم تفعيل الحساب' }); }}
                        >
                          {user.isActive ? <Ban className="size-3.5 text-amber-600" /> : <CheckCircle2 className="size-3.5 text-emerald-600" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => handleImpersonate(user.id)}
                          title="تسجيل دخول كمستخدم"
                        >
                          <LogIn className="size-3.5 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive"
                          onClick={() => { deleteUser(user.id); toast({ variant: 'destructive', title: 'تم حذف المستخدم' }); }}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Performance by User */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-5 border-b border-border">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            أداء المستخدمين السنوي
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-right px-5 py-3 font-semibold text-muted-foreground">المستخدم</th>
                <th className="text-right px-5 py-3 font-semibold text-muted-foreground">الدور</th>
                <th className="text-center px-5 py-3 font-semibold text-muted-foreground">المشاريع</th>
                <th className="text-center px-5 py-3 font-semibold text-muted-foreground">معتمدة</th>
                <th className="text-center px-5 py-3 font-semibold text-muted-foreground">مرفوضة</th>
                <th className="text-center px-5 py-3 font-semibold text-muted-foreground">قيد الانتظار</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.filter(u => u.role !== 'Admin').map(user => {
                const userProjects = projects.filter(p => p.createdBy === user.id);
                return (
                  <tr key={user.id} className="hover:bg-muted/20">
                    <td className="px-5 py-3 font-medium">{user.fullName}</td>
                    <td className="px-5 py-3"><RoleBadge role={user.role} /></td>
                    <td className="px-5 py-3 text-center tabular-nums font-bold">{userProjects.length}</td>
                    <td className="px-5 py-3 text-center tabular-nums text-emerald-600 font-medium">{userProjects.filter(p => p.status === 'Approved').length}</td>
                    <td className="px-5 py-3 text-center tabular-nums text-red-600 font-medium">{userProjects.filter(p => p.status === 'Rejected').length}</td>
                    <td className="px-5 py-3 text-center tabular-nums text-amber-600 font-medium">{userProjects.filter(p => p.status === 'Pending').length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'تعديل المستخدم' : 'إنشاء مستخدم جديد'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>الاسم الكامل <span className="text-destructive">*</span></Label>
              <Input value={formData.fullName} onChange={(e) => setFormData(p => ({ ...p, fullName: e.target.value }))} className={errors.fullName ? 'border-destructive' : ''} />
              {errors.fullName && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="size-3" />{errors.fullName}</p>}
            </div>
            <div className="space-y-2">
              <Label>اسم المستخدم <span className="text-destructive">*</span></Label>
              <Input value={formData.username} onChange={(e) => setFormData(p => ({ ...p, username: e.target.value }))} disabled={!!editingId} className={errors.username ? 'border-destructive' : ''} />
              {errors.username && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="size-3" />{errors.username}</p>}
            </div>
            <div className="space-y-2">
              <Label>كلمة المرور {!editingId && <span className="text-destructive">*</span>}</Label>
              <Input type="password" value={formData.password} onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))} placeholder={editingId ? 'اتركه فارغاً لعدم التغيير' : ''} className={errors.password ? 'border-destructive' : ''} />
              {errors.password && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="size-3" />{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label>الدور <span className="text-destructive">*</span></Label>
              <Select value={formData.role} onValueChange={(v) => setFormData(p => ({ ...p, role: v as UserRole }))}>
                <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NormalUser">مستخدم عادي</SelectItem>
                  <SelectItem value="ProjectManager">مدير مشاريع</SelectItem>
                  <SelectItem value="Admin">مسؤول النظام</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="size-3" />{errors.role}</p>}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>إلغاء</Button>
            <Button onClick={handleSubmit}>{editingId ? 'تحديث' : 'إنشاء'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

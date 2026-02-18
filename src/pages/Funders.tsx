import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useProjectStore } from '@/stores/projectStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Wallet, Plus, Search, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Funder } from '@/types';

export default function Funders() {
  const { currentUser } = useAuthStore();
  const { funders, projects, addFunder, updateFunder, deleteFunder } = useProjectStore();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    projectId: searchParams.get('project') || '',
    funderName: '',
    fundingYear: new Date().getFullYear(),
    contactName: '',
    phone: '',
    email: '',
    website: '',
    budgetValue: 0,
    projectDescription: '',
  });

  if (!currentUser) return null;
  const isNormal = currentUser.role === 'NormalUser';
  const userProjects = isNormal ? projects.filter(p => p.createdBy === currentUser.id) : projects;

  const filteredFunders = funders.filter(f => {
    if (isNormal) {
      const projectIds = userProjects.map(p => p.id);
      if (!projectIds.includes(f.projectId)) return false;
    }
    if (search) return f.funderName.includes(search) || f.contactName.includes(search);
    return true;
  });

  const getProjectName = (pid: string) => projects.find(p => p.id === pid)?.name || '';

  const resetForm = () => {
    setFormData({
      projectId: searchParams.get('project') || '',
      funderName: '',
      fundingYear: new Date().getFullYear(),
      contactName: '',
      phone: '',
      email: '',
      website: '',
      budgetValue: 0,
      projectDescription: '',
    });
    setEditingId(null);
  };

  const openEdit = (funder: Funder) => {
    setEditingId(funder.id);
    setFormData({
      projectId: funder.projectId,
      funderName: funder.funderName,
      fundingYear: funder.fundingYear,
      contactName: funder.contactName,
      phone: funder.phone,
      email: funder.email,
      website: funder.website || '',
      budgetValue: funder.budgetValue,
      projectDescription: funder.projectDescription,
    });
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (!formData.projectId || !formData.funderName.trim()) {
      toast({ variant: 'destructive', title: 'يرجى تعبئة الحقول المطلوبة' });
      return;
    }
    const data = {
      ...formData,
      website: formData.website.trim() || undefined,
    };
    if (editingId) {
      updateFunder(editingId, data);
      toast({ title: 'تم تحديث الممول' });
    } else {
      addFunder(data as Omit<Funder, 'id'>);
      toast({ title: 'تم إضافة الممول بنجاح' });
    }
    setShowDialog(false);
    resetForm();
  };

  const canModifyFunder = (funder: Funder) => {
    if (currentUser.role === 'Admin' || currentUser.role === 'ProjectManager') return true;
    const project = projects.find(p => p.id === funder.projectId);
    return project?.createdBy === currentUser.id && project?.status === 'Pending';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">الممولون</h1>
          <p className="text-sm text-muted-foreground mt-0.5">إدارة الجهات المانحة والممولة</p>
        </div>
        <Button className="gap-2" onClick={() => { resetForm(); setShowDialog(true); }}>
          <Plus className="size-4" />
          إضافة ممول
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="بحث بالاسم..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10" />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-right px-5 py-3 font-semibold text-muted-foreground">الممول</th>
              <th className="text-right px-5 py-3 font-semibold text-muted-foreground">المشروع</th>
              <th className="text-right px-5 py-3 font-semibold text-muted-foreground">سنة التمويل</th>
              <th className="text-right px-5 py-3 font-semibold text-muted-foreground">المبلغ</th>
              <th className="text-right px-5 py-3 font-semibold text-muted-foreground">الموقع الإلكتروني</th>
              <th className="text-right px-5 py-3 font-semibold text-muted-foreground">جهة الاتصال</th>
              <th className="text-center px-5 py-3 font-semibold text-muted-foreground">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredFunders.map(funder => (
              <tr key={funder.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Wallet className="size-4 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{funder.funderName}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{getProjectName(funder.projectId)}</td>
                <td className="px-5 py-3 text-muted-foreground tabular-nums">{funder.fundingYear}</td>
                <td className="px-5 py-3 font-bold text-primary tabular-nums">${funder.budgetValue.toLocaleString()}</td>
                <td className="px-5 py-3">
                  {funder.website ? (
                    <a
                      href={funder.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="size-3" />
                      {funder.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-muted-foreground">{funder.contactName}</td>
                <td className="px-5 py-3 text-center">
                  {canModifyFunder(funder) && (
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(funder)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => { deleteFunder(funder.id); toast({ variant: 'destructive', title: 'تم حذف الممول' }); }}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filteredFunders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center">
                  <Wallet className="size-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">لا يوجد ممولون</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'تعديل الممول' : 'إضافة ممول جديد'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>المشروع <span className="text-destructive">*</span></Label>
              <Select value={formData.projectId} onValueChange={(v) => setFormData(p => ({ ...p, projectId: v }))}>
                <SelectTrigger><SelectValue placeholder="اختر المشروع" /></SelectTrigger>
                <SelectContent>
                  {userProjects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>اسم الممول <span className="text-destructive">*</span></Label>
                <Input value={formData.funderName} onChange={(e) => setFormData(p => ({ ...p, funderName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>سنة التمويل</Label>
                <Input type="number" value={formData.fundingYear} onChange={(e) => setFormData(p => ({ ...p, fundingYear: parseInt(e.target.value) || new Date().getFullYear() }))} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>جهة الاتصال</Label>
                <Input value={formData.contactName} onChange={(e) => setFormData(p => ({ ...p, contactName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>الهاتف</Label>
                <Input value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>البريد</Label>
                <Input value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
            {/* Website */}
            <div className="space-y-2">
              <Label >الموقع الإلكتروني</Label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData(p => ({ ...p, website: e.target.value }))}
                placeholder="https://..."
                dir="ltr"
                className="text-left"
              />
            </div>
            <div className="space-y-2">
              <Label>قيمة الميزانية ($)</Label>
              <Input type="number" value={formData.budgetValue} onChange={(e) => setFormData(p => ({ ...p, budgetValue: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-2">
              <Label>وصف التمويل</Label>
              <Textarea value={formData.projectDescription} onChange={(e) => setFormData(p => ({ ...p, projectDescription: e.target.value }))} rows={3} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>إلغاء</Button>
            <Button onClick={handleSubmit}>{editingId ? 'تحديث' : 'إضافة'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

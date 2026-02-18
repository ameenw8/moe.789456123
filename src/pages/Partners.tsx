import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useProjectStore } from '@/stores/projectStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { GOVERNORATES, getGovernorateLabel } from '@/constants/config';
import { Handshake, Plus, Search, Pencil, Trash2, AlertCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Partner, ResponsiblePerson } from '@/types';

export default function Partners() {
  const { currentUser } = useAuthStore();
  const { partners, projects, addPartner, updatePartner, deletePartner } = useProjectStore();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    projectId: searchParams.get('project') || '',
    organizationName: '',
    governorate: '',
    location: '',
    website: '',
    responsiblePersons: [{ name: '', phone: '', email: '' }] as ResponsiblePerson[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!currentUser) return null;
  const isNormal = currentUser.role === 'NormalUser';

  const userProjects = isNormal ? projects.filter(p => p.createdBy === currentUser.id) : projects;
  const filteredPartners = partners.filter(p => {
    if (isNormal) {
      const projectIds = userProjects.map(proj => proj.id);
      if (!projectIds.includes(p.projectId)) return false;
    }
    if (search) {
      return p.organizationName.includes(search) || p.location.includes(search);
    }
    return true;
  });

  const getProjectName = (pid: string) => projects.find(p => p.id === pid)?.name || '';

  const resetForm = () => {
    setFormData({
      projectId: searchParams.get('project') || '',
      organizationName: '',
      governorate: '',
      location: '',
      website: '',
      responsiblePersons: [{ name: '', phone: '', email: '' }],
    });
    setErrors({});
    setEditingId(null);
  };

  const openEdit = (partner: Partner) => {
    setEditingId(partner.id);
    setFormData({
      projectId: partner.projectId,
      organizationName: partner.organizationName,
      governorate: partner.governorate,
      location: partner.location,
      website: partner.website || '',
      responsiblePersons: [...partner.responsiblePersons],
    });
    setShowDialog(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.projectId) errs.projectId = 'اختر المشروع';
    if (!formData.organizationName.trim()) errs.organizationName = 'اسم المؤسسة مطلوب';
    if (!formData.governorate) errs.governorate = 'المحافظة مطلوبة';
    if (!formData.location.trim()) errs.location = 'الموقع مطلوب';
    if (formData.responsiblePersons[0] && !formData.responsiblePersons[0].name.trim()) {
      errs.rpName = 'اسم المسؤول مطلوب';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const data = {
      ...formData,
      website: formData.website.trim() || undefined,
    };
    if (editingId) {
      updatePartner(editingId, data);
      toast({ title: 'تم تحديث الشريك' });
    } else {
      addPartner(data as Omit<Partner, 'id'>);
      toast({ title: 'تم إضافة الشريك بنجاح' });
    }
    setShowDialog(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    deletePartner(id);
    toast({ variant: 'destructive', title: 'تم حذف الشريك' });
  };

  const addResponsiblePerson = () => {
    setFormData(prev => ({
      ...prev,
      responsiblePersons: [...prev.responsiblePersons, { name: '', phone: '', email: '' }],
    }));
  };

  const updateRP = (index: number, field: keyof ResponsiblePerson, value: string) => {
    setFormData(prev => ({
      ...prev,
      responsiblePersons: prev.responsiblePersons.map((rp, i) =>
        i === index ? { ...rp, [field]: value } : rp
      ),
    }));
  };

  const canModifyPartner = (partner: Partner) => {
    if (currentUser.role === 'Admin' || currentUser.role === 'ProjectManager') return true;
    const project = projects.find(p => p.id === partner.projectId);
    return project?.createdBy === currentUser.id && project?.status === 'Pending';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">الشركاء</h1>
          <p className="text-sm text-muted-foreground mt-0.5">إدارة الشركاء والمؤسسات المتعاونة</p>
        </div>
        <Button className="gap-2" onClick={() => { resetForm(); setShowDialog(true); }}>
          <Plus className="size-4" />
          إضافة شريك
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="بحث بالاسم أو الموقع..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10" />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-right px-5 py-3 font-semibold text-muted-foreground">المؤسسة</th>
              <th className="text-right px-5 py-3 font-semibold text-muted-foreground">المشروع</th>
              <th className="text-right px-5 py-3 font-semibold text-muted-foreground">المحافظة</th>
              <th className="text-right px-5 py-3 font-semibold text-muted-foreground">الموقع الإلكتروني</th>
              <th className="text-right px-5 py-3 font-semibold text-muted-foreground">المسؤولون</th>
              <th className="text-center px-5 py-3 font-semibold text-muted-foreground">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredPartners.map(partner => (
              <tr key={partner.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Handshake className="size-4 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{partner.organizationName}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{getProjectName(partner.projectId)}</td>
                <td className="px-5 py-3 text-muted-foreground">{getGovernorateLabel(partner.governorate)}</td>
                <td className="px-5 py-3">
                  {partner.website ? (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="size-3" />
                      {partner.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {partner.responsiblePersons.map(rp => rp.name).join('، ')}
                </td>
                <td className="px-5 py-3 text-center">
                  {canModifyPartner(partner) && (
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(partner)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => handleDelete(partner.id)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filteredPartners.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <Handshake className="size-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">لا يوجد شركاء</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'تعديل الشريك' : 'إضافة شريك جديد'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>المشروع <span className="text-destructive">*</span></Label>
              <Select value={formData.projectId} onValueChange={(v) => setFormData(p => ({ ...p, projectId: v }))}>
                <SelectTrigger className={errors.projectId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="اختر المشروع" />
                </SelectTrigger>
                <SelectContent>
                  {userProjects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>اسم المؤسسة <span className="text-destructive">*</span></Label>
              <Input value={formData.organizationName} onChange={(e) => setFormData(p => ({ ...p, organizationName: e.target.value }))} className={errors.organizationName ? 'border-destructive' : ''} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>المحافظة <span className="text-destructive">*</span></Label>
                <Select value={formData.governorate} onValueChange={(v) => setFormData(p => ({ ...p, governorate: v }))}>
                  <SelectTrigger className={errors.governorate ? 'border-destructive' : ''}>
                    <SelectValue placeholder="اختر" />
                  </SelectTrigger>
                  <SelectContent>
                    {GOVERNORATES.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الموقع <span className="text-destructive">*</span></Label>
                <Input value={formData.location} onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))} className={errors.location ? 'border-destructive' : ''} />
              </div>
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label>الموقع الإلكتروني / صفحة فيسبوك</Label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData(p => ({ ...p, website: e.target.value }))}
                placeholder="https://facebook.com/..."
                dir="ltr"
                className="text-left"
              />
            </div>

            {/* Responsible Persons */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>المسؤولون</Label>
                <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={addResponsiblePerson}>
                  <Plus className="size-3" />إضافة مسؤول
                </Button>
              </div>
              {formData.responsiblePersons.map((rp, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                  <Input placeholder="الاسم" value={rp.name} onChange={(e) => updateRP(i, 'name', e.target.value)} className={i === 0 && errors.rpName ? 'border-destructive' : ''} />
                  <Input placeholder="الهاتف" value={rp.phone} onChange={(e) => updateRP(i, 'phone', e.target.value)} />
                  <Input placeholder="البريد" value={rp.email} onChange={(e) => updateRP(i, 'email', e.target.value)} />
                </div>
              ))}
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

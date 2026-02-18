import { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useProjectStore } from '@/stores/projectStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { GOVERNORATES, DISABILITY_TYPES, ACTIVITY_TYPES, getGovernorateLabel, getActivityLabel, getDisabilityLabel } from '@/constants/config';
import { UserCheck, Plus, Search, Pencil, Trash2, Upload, AlertCircle, Download, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Volunteer, GENDER_LABELS } from '@/types';
import { parseCSVContent, generateTemplateCSV } from '../lib/parseExcel';

export default function Volunteers() {
  const { currentUser } = useAuthStore();
  const { volunteers, projects, addVolunteer, addVolunteers, updateVolunteer, deleteVolunteer } = useProjectStore();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState(searchParams.get('project') || 'all');
  const [showDialog, setShowDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    projectId: searchParams.get('project') || '',
    fullName: '',
    dateOfBirth: '',
    gender: '' as 'Male' | 'Female' | '',
    governorate: '',
    address: '',
    hasDisability: false,
    disabilityType: '',
    mobile: '',
    whatsapp: '',
    email: '',
    activityType: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Upload state
  const [uploadProjectId, setUploadProjectId] = useState(searchParams.get('project') || '');
  const [uploadResult, setUploadResult] = useState<{
    valid: number;
    errors: { row: number; message: string }[];
    total: number;
    data: Omit<Volunteer, 'id'>[];
  } | null>(null);
  const [uploadProcessing, setUploadProcessing] = useState(false);

  if (!currentUser) return null;
  const isNormal = currentUser.role === 'NormalUser';
  const userProjects = isNormal ? projects.filter(p => p.createdBy === currentUser.id) : projects;

  const filteredVolunteers = volunteers.filter(v => {
    if (isNormal) {
      const projectIds = userProjects.map(p => p.id);
      if (!projectIds.includes(v.projectId)) return false;
    }
    if (projectFilter !== 'all' && v.projectId !== projectFilter) return false;
    if (search) {
      return v.fullName.includes(search) || v.email.includes(search) || v.mobile.includes(search);
    }
    return true;
  });

  const getProjectName = (pid: string) => projects.find(p => p.id === pid)?.name || '';

  const resetForm = () => {
    setFormData({
      projectId: searchParams.get('project') || '',
      fullName: '', dateOfBirth: '', gender: '', governorate: '', address: '',
      hasDisability: false, disabilityType: '', mobile: '', whatsapp: '', email: '', activityType: '',
    });
    setErrors({});
    setEditingId(null);
  };

  const openEdit = (vol: Volunteer) => {
    setEditingId(vol.id);
    setFormData({
      projectId: vol.projectId,
      fullName: vol.fullName,
      dateOfBirth: vol.dateOfBirth,
      gender: vol.gender,
      governorate: vol.governorate,
      address: vol.address,
      hasDisability: vol.hasDisability,
      disabilityType: vol.disabilityType || '',
      mobile: vol.mobile,
      whatsapp: vol.whatsapp,
      email: vol.email,
      activityType: vol.activityType,
    });
    setShowDialog(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.projectId) errs.projectId = 'اختر المشروع';
    if (!formData.fullName.trim()) errs.fullName = 'الاسم مطلوب';
    if (!formData.dateOfBirth) errs.dateOfBirth = 'تاريخ الميلاد مطلوب';
    if (!formData.gender) errs.gender = 'الجنس مطلوب';
    if (!formData.governorate) errs.governorate = 'المحافظة مطلوبة';
    if (!formData.mobile.trim()) errs.mobile = 'رقم الجوال مطلوب';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'البريد الإلكتروني غير صحيح';
    }
    if (formData.hasDisability && !formData.disabilityType) {
      errs.disabilityType = 'نوع الإعاقة مطلوب';
    }
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const now = new Date();
      const age = now.getFullYear() - dob.getFullYear();
      if (age < 10 || age > 100) errs.dateOfBirth = 'تاريخ الميلاد غير صحيح';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const data = {
      ...formData,
      gender: formData.gender as 'Male' | 'Female',
      disabilityType: formData.hasDisability ? formData.disabilityType : undefined,
    };
    if (editingId) {
      updateVolunteer(editingId, data);
      toast({ title: 'تم تحديث المتطوع' });
    } else {
      addVolunteer(data);
      toast({ title: 'تم إضافة المتطوع بنجاح' });
    }
    setShowDialog(false);
    resetForm();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!uploadProjectId) {
      toast({ variant: 'destructive', title: 'يرجى اختيار المشروع أولاً' });
      e.target.value = '';
      return;
    }

    setUploadProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const result = parseCSVContent(text, uploadProjectId);
      setUploadResult({
        valid: result.valid.length,
        errors: result.errors,
        total: result.total,
        data: result.valid,
      });
      setUploadProcessing(false);
    };
    reader.onerror = () => {
      toast({ variant: 'destructive', title: 'فشل قراءة الملف' });
      setUploadProcessing(false);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmUpload = () => {
    if (!uploadResult || uploadResult.data.length === 0) return;
    addVolunteers(uploadResult.data);
    toast({ title: `تم استيراد ${uploadResult.data.length} متطوع بنجاح` });
    setUploadResult(null);
    setShowUploadDialog(false);
  };

  const handleDownloadTemplate = () => {
    const csv = generateTemplateCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'قالب_المتطوعين.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const canModifyVolunteer = (vol: Volunteer) => {
    if (currentUser.role === 'Admin' || currentUser.role === 'ProjectManager') return true;
    const project = projects.find(p => p.id === vol.projectId);
    return project?.createdBy === currentUser.id && project?.status === 'Pending';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">المتطوعون</h1>
          <p className="text-sm text-muted-foreground mt-0.5">إدارة بيانات المتطوعين ({filteredVolunteers.length})</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => { setUploadResult(null); setShowUploadDialog(true); }}>
            <Upload className="size-4" />
            رفع CSV
          </Button>
          <Button className="gap-2" onClick={() => { resetForm(); setShowDialog(true); }}>
            <Plus className="size-4" />
            إضافة متطوع
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="بحث بالاسم أو الجوال..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10" />
          </div>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger><SelectValue placeholder="المشروع" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المشاريع</SelectItem>
              {userProjects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">الاسم</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">المشروع</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">الجنس</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">المحافظة</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">الجوال</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">النشاط</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">إعاقة</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredVolunteers.map(vol => (
                <tr key={vol.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <UserCheck className="size-3.5 text-primary" />
                      </div>
                      <span className="font-medium text-foreground text-xs">{vol.fullName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{getProjectName(vol.projectId)}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{GENDER_LABELS[vol.gender]}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{getGovernorateLabel(vol.governorate)}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs tabular-nums">{vol.mobile}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{getActivityLabel(vol.activityType)}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {vol.hasDisability ? getDisabilityLabel(vol.disabilityType || '') : 'لا'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {canModifyVolunteer(vol) && (
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="size-7" onClick={() => openEdit(vol)}>
                          <Pencil className="size-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => { deleteVolunteer(vol.id); toast({ variant: 'destructive', title: 'تم حذف المتطوع' }); }}>
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredVolunteers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <UserCheck className="size-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">لا يوجد متطوعون</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'تعديل المتطوع' : 'إضافة متطوع جديد'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>المشروع <span className="text-destructive">*</span></Label>
              <Select value={formData.projectId} onValueChange={(v) => setFormData(p => ({ ...p, projectId: v }))}>
                <SelectTrigger className={errors.projectId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="اختر المشروع" />
                </SelectTrigger>
                <SelectContent>
                  {userProjects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Personal Info */}
            <div className="border-t border-border pt-4">
              <p className="text-sm font-semibold text-foreground mb-3">المعلومات الشخصية</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-2">
                  <Label>الاسم الكامل <span className="text-destructive">*</span></Label>
                  <Input value={formData.fullName} onChange={(e) => setFormData(p => ({ ...p, fullName: e.target.value }))} className={errors.fullName ? 'border-destructive' : ''} />
                  {errors.fullName && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="size-3" />{errors.fullName}</p>}
                </div>
                <div className="space-y-2">
                  <Label>تاريخ الميلاد <span className="text-destructive">*</span></Label>
                  <Input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData(p => ({ ...p, dateOfBirth: e.target.value }))} className={errors.dateOfBirth ? 'border-destructive' : ''} />
                  {errors.dateOfBirth && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="size-3" />{errors.dateOfBirth}</p>}
                </div>
                <div className="space-y-2">
                  <Label>الجنس <span className="text-destructive">*</span></Label>
                  <Select value={formData.gender} onValueChange={(v) => setFormData(p => ({ ...p, gender: v as 'Male' | 'Female' }))}>
                    <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
                      <SelectValue placeholder="اختر" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">ذكر</SelectItem>
                      <SelectItem value="Female">أنثى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="border-t border-border pt-4">
              <p className="text-sm font-semibold text-foreground mb-3">معلومات الموقع</p>
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
                  <Label>العنوان</Label>
                  <Input value={formData.address} onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))} />
                </div>
              </div>
            </div>

            {/* Disability */}
            <div className="border-t border-border pt-4">
              <p className="text-sm font-semibold text-foreground mb-3">معلومات الإعاقة</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>هل يوجد إعاقة؟</Label>
                  <Select value={formData.hasDisability ? 'yes' : 'no'} onValueChange={(v) => setFormData(p => ({ ...p, hasDisability: v === 'yes', disabilityType: v === 'no' ? '' : p.disabilityType }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">لا</SelectItem>
                      <SelectItem value="yes">نعم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.hasDisability && (
                  <div className="space-y-2">
                    <Label>نوع الإعاقة <span className="text-destructive">*</span></Label>
                    <Select value={formData.disabilityType} onValueChange={(v) => setFormData(p => ({ ...p, disabilityType: v }))}>
                      <SelectTrigger className={errors.disabilityType ? 'border-destructive' : ''}>
                        <SelectValue placeholder="اختر" />
                      </SelectTrigger>
                      <SelectContent>
                        {DISABILITY_TYPES.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {errors.disabilityType && <p className="text-xs text-destructive">{errors.disabilityType}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="border-t border-border pt-4">
              <p className="text-sm font-semibold text-foreground mb-3">معلومات الاتصال</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>الجوال <span className="text-destructive">*</span></Label>
                  <Input value={formData.mobile} onChange={(e) => setFormData(p => ({ ...p, mobile: e.target.value }))} className={errors.mobile ? 'border-destructive' : ''} />
                </div>
                <div className="space-y-2">
                  <Label>واتساب</Label>
                  <Input value={formData.whatsapp} onChange={(e) => setFormData(p => ({ ...p, whatsapp: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>البريد الإلكتروني</Label>
                  <Input value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} className={errors.email ? 'border-destructive' : ''} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
              </div>
            </div>
{/* Activity */}
<div className="border-t border-border pt-4">
  <div className="space-y-2">
    <Label>نوع النشاط</Label>

    <input
      type="text"
      placeholder="اكتب نوع النشاط"
      className="w-full border border-border rounded-md px-3 py-2 text-sm"
      value={formData.activityType}
      onChange={(e) =>
        setFormData((p) => ({
          ...p,
          activityType: e.target.value,
        }))
      }
    />
  </div>
</div>

            
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>إلغاء</Button>
            <Button onClick={handleSubmit}>{editingId ? 'تحديث' : 'إضافة'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={(open) => { setShowUploadDialog(open); if (!open) setUploadResult(null); }}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>رفع ملف متطوعين (CSV)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>المشروع <span className="text-destructive">*</span></Label>
              <Select value={uploadProjectId} onValueChange={setUploadProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المشروع" />
                </SelectTrigger>
                <SelectContent>
                  {userProjects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
              <Upload className="size-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-foreground font-medium mb-1">اختر ملف CSV</p>
              <p className="text-xs text-muted-foreground mb-4">الأعمدة: الاسم، تاريخ الميلاد، الجنس، المحافظة، الجوال، النشاط، العنوان، واتساب، البريد، إعاقة، نوع الإعاقة</p>
              <div className="flex items-center justify-center gap-2">
                <input ref={fileInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileChange} />
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={!uploadProjectId || uploadProcessing}>
                  {uploadProcessing ? 'جاري المعالجة...' : 'اختيار ملف'}
                </Button>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={handleDownloadTemplate}>
                  <Download className="size-3" />
                  تحميل القالب
                </Button>
              </div>
            </div>

            {/* Upload Results */}
            {uploadResult && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold tabular-nums">{uploadResult.total}</p>
                    <p className="text-xs text-muted-foreground">إجمالي الصفوف</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-emerald-700 tabular-nums">{uploadResult.valid}</p>
                    <p className="text-xs text-emerald-600">صالح</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-red-700 tabular-nums">{uploadResult.errors.length}</p>
                    <p className="text-xs text-red-600">أخطاء</p>
                  </div>
                </div>

                {uploadResult.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-[200px] overflow-y-auto">
                    <p className="text-xs font-semibold text-red-800 mb-2 flex items-center gap-1">
                      <XCircle className="size-3" />
                      الأخطاء:
                    </p>
                    {uploadResult.errors.map((err, i) => (
                      <p key={i} className="text-xs text-red-700 mb-1">
                        صف {err.row}: {err.message}
                      </p>
                    ))}
                  </div>
                )}

                {uploadResult.valid > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <p className="text-xs text-emerald-700">
                      {uploadResult.valid} متطوع جاهز للاستيراد إلى مشروع "{getProjectName(uploadProjectId)}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setShowUploadDialog(false); setUploadResult(null); }}>إلغاء</Button>
            <Button
              onClick={handleConfirmUpload}
              disabled={!uploadResult || uploadResult.valid === 0}
              className="gap-2"
            >
              <FileText className="size-4" />
              استيراد {uploadResult?.valid || 0} متطوع
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

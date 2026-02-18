import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useProjectStore } from '@/stores/projectStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GOVERNORATES } from '@/constants/config';
import { ArrowRight, Save, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProjectForm() {
  const { currentUser } = useAuthStore();
  const { addProject, projects, updateProject } = useProjectStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();

  const isEditing = !!id;
  const existingProject = isEditing ? projects.find(p => p.id === id) : null;

  const [formData, setFormData] = useState({
    name: existingProject?.name || '',
    startDate: existingProject?.startDate || '',
    endDate: existingProject?.endDate || '',
    location: existingProject?.location || '',
    governorate: existingProject?.governorate || '',
    description: existingProject?.description || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!currentUser) return null;

  // Check permissions for editing
  if (isEditing && existingProject) {
    const isNormal = currentUser.role === 'NormalUser';
    const canEdit = currentUser.role === 'Admin' || currentUser.role === 'ProjectManager' ||
      (isNormal && existingProject.status === 'Pending' && existingProject.createdBy === currentUser.id);
    if (!canEdit) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">ليس لديك صلاحية لتعديل هذا المشروع</p>
        </div>
      );
    }
  }

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'اسم المشروع مطلوب';
    if (!formData.startDate) errs.startDate = 'تاريخ البدء مطلوب';
    if (!formData.endDate) errs.endDate = 'تاريخ الانتهاء مطلوب';
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      errs.endDate = 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء';
    }
    if (!formData.location.trim()) errs.location = 'الموقع مطلوب';
    if (!formData.governorate) errs.governorate = 'المحافظة مطلوبة';
    if (!formData.description.trim()) errs.description = 'وصف المشروع مطلوب';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing && id) {
      const success = updateProject(id, formData);
      if (success) {
        toast({ title: 'تم تحديث المشروع بنجاح' });
        navigate(`/projects/${id}`);
      } else {
        toast({ variant: 'destructive', title: 'فشل تحديث المشروع', description: 'لا تملك الصلاحية لتعديل هذا المشروع' });
      }
    } else {
      const projectId = addProject({
        ...formData,
        createdBy: currentUser.id,
      });
      if (projectId) {
        toast({ title: 'تم إنشاء المشروع بنجاح', description: 'حالة المشروع: قيد الانتظار' });
        navigate(`/projects/${projectId}`);
      }
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(isEditing ? `/projects/${id}` : '/projects')}>
          <ArrowRight className="size-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">{isEditing ? 'تعديل المشروع' : 'مشروع جديد'}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEditing ? 'تعديل بيانات المشروع' : 'أدخل بيانات المشروع الجديد'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border">
        <div className="p-6 space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name">اسم المشروع <span className="text-destructive">*</span></Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="أدخل اسم المشروع"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="size-3" />{errors.name}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">تاريخ البدء <span className="text-destructive">*</span></Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => updateField('startDate', e.target.value)}
                className={errors.startDate ? 'border-destructive' : ''}
              />
              {errors.startDate && (
                <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="size-3" />{errors.startDate}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">تاريخ الانتهاء <span className="text-destructive">*</span></Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => updateField('endDate', e.target.value)}
                className={errors.endDate ? 'border-destructive' : ''}
              />
              {errors.endDate && (
                <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="size-3" />{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Location + Governorate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">الموقع <span className="text-destructive">*</span></Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="أدخل موقع المشروع"
                className={errors.location ? 'border-destructive' : ''}
              />
              {errors.location && (
                <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="size-3" />{errors.location}</p>
              )}
            </div>
            <div className="space-y-2">
  <Label>
    المحافظة <span className="text-destructive">*</span>
  </Label>

  <Select
    multiple
    value={formData.governorate}
    onValueChange={(v) => updateField("governorate", v)}
  >
    <SelectTrigger className={errors.governorate ? "border-destructive" : ""}>
      <SelectValue placeholder="اختر المحافظة" />
    </SelectTrigger>

    <SelectContent>
      {GOVERNORATES.map((g) => (
        <SelectItem key={g.value} value={g.value}>
          {g.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>

  {errors.governorate && (
    <p className="text-xs text-destructive flex items-center gap-1">
      <AlertCircle className="size-3" />
      {errors.governorate}
    </p>
  )}
</div>

          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">وصف المشروع <span className="text-destructive">*</span></Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="اكتب وصفاً تفصيلياً للمشروع"
              rows={4}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="size-3" />{errors.description}</p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(isEditing ? `/projects/${id}` : '/projects')}>إلغاء</Button>
          <Button type="submit" className="gap-2">
            <Save className="size-4" />
            {isEditing ? 'حفظ التغييرات' : 'إنشاء المشروع'}
          </Button>
        </div>
      </form>
    </div>
  );
}

import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useProjectStore } from '@/stores/projectStore';
import { StatusBadge } from '@/components/features/StatusBadge';
import { Button } from '@/components/ui/button';
import { getGovernorateLabel, getActivityLabel, getDisabilityLabel } from '@/constants/config';
import { GENDER_LABELS } from '@/types';
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  FileText,
  Handshake,
  Wallet,
  UserCheck,
  Pencil,
  Trash2,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, users } = useAuthStore();
  const { projects, changeProjectStatus, deleteProject, partners, funders, volunteers } = useProjectStore();

  const project = projects.find(p => p.id === id);

  if (!project || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">المشروع غير موجود</p>
      </div>
    );
  }

  const isNormal = currentUser.role === 'NormalUser';
  const canApprove = currentUser.role === 'ProjectManager' || currentUser.role === 'Admin';
  const canEdit = canApprove || (isNormal && project.status === 'Pending' && project.createdBy === currentUser.id);
  const isReadOnly = isNormal && project.status !== 'Pending';

  const projectPartners = partners.filter(p => p.projectId === project.id);
  const projectFunders = funders.filter(f => f.projectId === project.id);
  const projectVolunteers = volunteers.filter(v => v.projectId === project.id);

  const creatorName = users.find(u => u.id === project.createdBy)?.fullName || 'غير معروف';

  const handleApprove = () => {
    changeProjectStatus(project.id, 'Approved');
    toast({ title: 'تم اعتماد المشروع', description: project.name });
  };

  const handleReject = () => {
    changeProjectStatus(project.id, 'Rejected');
    toast({ variant: 'destructive', title: 'تم رفض المشروع', description: project.name });
  };

  const handleDelete = () => {
    deleteProject(project.id);
    toast({ variant: 'destructive', title: 'تم حذف المشروع' });
    navigate('/projects');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}>
            <ArrowRight className="size-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground">{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {getGovernorateLabel(project.governorate)} — {project.location}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canApprove && project.status === 'Pending' && (
            <>
              <Button onClick={handleApprove} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle2 className="size-4" />
                اعتماد
              </Button>
              <Button onClick={handleReject} variant="destructive" className="gap-2">
                <XCircle className="size-4" />
                رفض
              </Button>
            </>
          )}
          {canEdit && !isReadOnly && (
            <Link to={`/projects/${project.id}/edit`}>
              <Button variant="outline" className="gap-2">
                <Pencil className="size-4" />
                تعديل
              </Button>
            </Link>
          )}
          {canApprove && (
            <Button variant="outline" size="icon" onClick={handleDelete}>
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Project Info */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              معلومات المشروع
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">تاريخ البدء</p>
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  {project.startDate}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">تاريخ الانتهاء</p>
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  {project.endDate}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">المحافظة</p>
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-muted-foreground" />
                  {getGovernorateLabel(project.governorate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">الموقع</p>
                <p className="text-sm font-medium">{project.location}</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-1">الوصف</p>
              <p className="text-sm text-foreground leading-relaxed">{project.description}</p>
            </div>
            {!isNormal && (
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">أنشئ بواسطة: <span className="font-medium text-foreground">{creatorName}</span></p>
              </div>
            )}
          </div>

          {/* Partners */}
          <div className="bg-card rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Handshake className="size-4 text-primary" />
                الشركاء ({projectPartners.length})
              </h2>
              {canEdit && !isReadOnly && (
                <Link to={`/partners?project=${project.id}`}>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Plus className="size-3" />
                    إضافة شريك
                  </Button>
                </Link>
              )}
            </div>
            <div className="divide-y divide-border">
              {projectPartners.map(partner => (
                <div key={partner.id} className="p-4">
                  <p className="text-sm font-semibold text-foreground">{partner.organizationName}</p>
                  <p className="text-xs text-muted-foreground mt-1">{getGovernorateLabel(partner.governorate)} — {partner.location}</p>
                  {partner.website && (
                    <a href={partner.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-1">
                      <ExternalLink className="size-3" />
                      {partner.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                    </a>
                  )}
                  <div className="mt-2 space-y-1">
                    {partner.responsiblePersons.map((rp, i) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        {rp.name} • {rp.phone} • {rp.email}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
              {projectPartners.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">لا يوجد شركاء</div>
              )}
            </div>
          </div>

          {/* Funders */}
          <div className="bg-card rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Wallet className="size-4 text-primary" />
                الممولون ({projectFunders.length})
              </h2>
              {canEdit && !isReadOnly && (
                <Link to={`/funders?project=${project.id}`}>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Plus className="size-3" />
                    إضافة ممول
                  </Button>
                </Link>
              )}
            </div>
            <div className="divide-y divide-border">
              {projectFunders.map(funder => (
                <div key={funder.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{funder.funderName}</p>
                    <span className="text-sm font-bold text-primary tabular-nums">${funder.budgetValue.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">سنة التمويل: {funder.fundingYear} • {funder.contactName}</p>
                  <p className="text-xs text-muted-foreground">{funder.phone} • {funder.email}</p>
                  {funder.website && (
                    <a href={funder.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-1">
                      <ExternalLink className="size-3" />
                      {funder.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                    </a>
                  )}
                </div>
              ))}
              {projectFunders.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">لا يوجد ممولون</div>
              )}
            </div>
          </div>

          {/* Volunteers */}
          <div className="bg-card rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <UserCheck className="size-4 text-primary" />
                المتطوعون ({projectVolunteers.length})
              </h2>
              {canEdit && !isReadOnly && (
                <Link to={`/volunteers?project=${project.id}`}>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Plus className="size-3" />
                    إضافة متطوع
                  </Button>
                </Link>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground text-xs">الاسم</th>
                    <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground text-xs">الجنس</th>
                    <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground text-xs">المحافظة</th>
                    <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground text-xs">النشاط</th>
                    <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground text-xs">إعاقة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {projectVolunteers.slice(0, 10).map(vol => (
                    <tr key={vol.id} className="hover:bg-muted/20">
                      <td className="px-4 py-2.5 font-medium text-foreground">{vol.fullName}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{GENDER_LABELS[vol.gender]}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{getGovernorateLabel(vol.governorate)}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{getActivityLabel(vol.activityType)}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {vol.hasDisability ? getDisabilityLabel(vol.disabilityType || '') : 'لا'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {projectVolunteers.length > 10 && (
                <div className="p-3 text-center">
                  <Link to={`/volunteers?project=${project.id}`} className="text-xs text-primary hover:underline">
                    عرض الكل ({projectVolunteers.length} متطوع)
                  </Link>
                </div>
              )}
              {projectVolunteers.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">لا يوجد متطوعون</div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-bold text-foreground mb-3">ملخص</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">الشركاء</span>
                <span className="text-sm font-bold tabular-nums">{projectPartners.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">الممولون</span>
                <span className="text-sm font-bold tabular-nums">{projectFunders.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">المتطوعون</span>
                <span className="text-sm font-bold tabular-nums">{projectVolunteers.length}</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">إجمالي التمويل</span>
                  <span className="text-sm font-bold text-primary tabular-nums">
                    ${projectFunders.reduce((sum, f) => sum + f.budgetValue, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-bold text-foreground mb-3">التواريخ</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">تاريخ الإنشاء</span>
                <span className="tabular-nums">{project.createdAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">آخر تحديث</span>
                <span className="tabular-nums">{project.updatedAt}</span>
              </div>
            </div>
          </div>

          {/* Volunteers gender breakdown */}
          {projectVolunteers.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-bold text-foreground mb-3">توزيع المتطوعين</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">ذكور</span>
                  <span className="font-bold tabular-nums">{projectVolunteers.filter(v => v.gender === 'Male').length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">إناث</span>
                  <span className="font-bold tabular-nums">{projectVolunteers.filter(v => v.gender === 'Female').length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">ذوي إعاقة</span>
                  <span className="font-bold tabular-nums">{projectVolunteers.filter(v => v.hasDisability).length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useProjectStore } from '@/stores/projectStore';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GOVERNORATES, DISABILITY_TYPES, getGovernorateLabel, getActivityLabel, getDisabilityLabel } from '@/constants/config';
import { GENDER_LABELS } from '@/types';
import { BarChart3, Download, Filter, FileSpreadsheet, FileText, Users, FolderKanban, UserCheck, Handshake, Wallet, ExternalLink, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportVolunteersToExcel } from '@/lib/exportExcel';
import { exportVolunteersPDF } from '@/lib/exportPdf';
import { SelectGroup } from '@radix-ui/react-select';
import { SelectMultipleContext } from 'react-day-picker';

export default function Reports() {
  const { currentUser } = useAuthStore();
  const { projects, volunteers, funders, partners } = useProjectStore();
  const { toast } = useToast();

  const [filters, setFilters] = useState({
    projectId: '[]',
    governorate: 'all',
    gender: 'all',
    hasDisability: 'all',
    disabilityType: 'all',
    projectYear: 'all',
    fundingYear: 'all',
    dobFrom: '',
    dobTo: '',
  });

  const [activeTab, setActiveTab] = useState('volunteers');

  if (!currentUser || currentUser.role === 'NormalUser') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">ليس لديك صلاحية للوصول إلى التقارير</p>
      </div>
    );
  }

  const approvedProjects = projects.filter(p => p.status === 'Approved');

  // Get approved project IDs matching filters
  const filteredApprovedProjectIds = useMemo(() => {
    let result = approvedProjects;
    if (filters.projectId !== '[]') result = result.filter(p => p.id === filters.projectId);
    if (filters.governorate !== 'all') result = result.filter(p => p.governorate === filters.governorate);
    if (filters.projectYear !== 'all') result = result.filter(p => p.startDate.startsWith(filters.projectYear));
    if (filters.fundingYear !== 'all') {
      const funderProjectIds = funders.filter(f => f.fundingYear === parseInt(filters.fundingYear)).map(f => f.projectId);
      result = result.filter(p => funderProjectIds.includes(p.id));
    }
    return result.map(p => p.id);
  }, [approvedProjects, filters.projectId, filters.governorate, filters.projectYear, filters.fundingYear, funders]);

  const filteredVolunteers = useMemo(() => {
    let result = volunteers.filter(v => filteredApprovedProjectIds.includes(v.projectId));
    if (filters.gender !== 'all') result = result.filter(v => v.gender === filters.gender);
    if (filters.hasDisability !== 'all') {
      result = result.filter(v => filters.hasDisability === 'yes' ? v.hasDisability : !v.hasDisability);
    }
    if (filters.disabilityType !== 'all') result = result.filter(v => v.disabilityType === filters.disabilityType);
    if (filters.dobFrom) result = result.filter(v => v.dateOfBirth >= filters.dobFrom);
    if (filters.dobTo) result = result.filter(v => v.dateOfBirth <= filters.dobTo);
    return result;
  }, [volunteers, filteredApprovedProjectIds, filters.gender, filters.hasDisability, filters.disabilityType, filters.dobFrom, filters.dobTo]);

  const filteredPartners = useMemo(() => {
    return partners.filter(pt => filteredApprovedProjectIds.includes(pt.projectId));
  }, [partners, filteredApprovedProjectIds]);

  const filteredFunders = useMemo(() => {
    let result = funders.filter(f => filteredApprovedProjectIds.includes(f.projectId));
    if (filters.fundingYear !== 'all') {
      result = result.filter(f => f.fundingYear === parseInt(filters.fundingYear));
    }
    return result;
  }, [funders, filteredApprovedProjectIds, filters.fundingYear]);

  const filteredProjects = useMemo(() => {
    return approvedProjects.filter(p => filteredApprovedProjectIds.includes(p.id));
  }, [approvedProjects, filteredApprovedProjectIds]);

  // Statistics
  const maleCount = filteredVolunteers.filter(v => v.gender === 'Male').length;
  const femaleCount = filteredVolunteers.filter(v => v.gender === 'Female').length;
  const disabilityCount = filteredVolunteers.filter(v => v.hasDisability).length;
  const uniqueProjects = filteredApprovedProjectIds.length;
  const totalBudget = filteredFunders.reduce((sum, f) => sum + f.budgetValue, 0);

  const projectYears = [...new Set(projects.map(p => p.startDate.slice(0, 4)))].sort().reverse();
  const fundingYears = [...new Set(funders.map(f => String(f.fundingYear)))].sort().reverse();

  const handleExportExcel = () => {
    exportVolunteersToExcel(filteredVolunteers, projects);
    toast({ title: 'تم تصدير Excel بنجاح', description: `${filteredVolunteers.length} سجل` });
  };

  const handleExportPDF = () => {
    exportVolunteersPDF(filteredVolunteers, projects, {
      total: filteredVolunteers.length,
      male: maleCount,
      female: femaleCount,
      disability: disabilityCount,
      uniqueProjects,
      totalBudget,
    });
    toast({ title: 'تم إنشاء تقرير PDF', description: 'سيتم فتحه في نافذة جديدة' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">التقارير</h1>
          <p className="text-sm text-muted-foreground mt-0.5">إنشاء وتصدير تقارير المشاريع المعتمدة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExportExcel}>
            <FileSpreadsheet className="size-4" />
            تصدير Excel
          </Button>
          <Button className="gap-2" onClick={handleExportPDF}>
            <FileText className="size-4" />
            تصدير PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="size-4 text-primary" />
          <span className="text-sm font-bold text-foreground">فلاتر التقرير</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">المشروع</Label>
            <Select value={filters.projectId} onValueChange={(v) => setFilters(p => ({ ...p, projectId: v }))}>
              <SelectTrigger className="h-9 text-xs"><SelectTrigger /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {approvedProjects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">المحافظة</Label>
            <Select value={filters.governorate} onValueChange={(v) => setFilters(p => ({ ...p, governorate: v }))}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {GOVERNORATES.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">الجنس</Label>
            <Select value={filters.gender} onValueChange={(v) => setFilters(p => ({ ...p, gender: v }))}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="Male">ذكر</SelectItem>
                <SelectItem value="Female">أنثى</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">إعاقة</Label>
            <Select value={filters.hasDisability} onValueChange={(v) => setFilters(p => ({ ...p, hasDisability: v }))}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="yes">نعم</SelectItem>
                <SelectItem value="no">لا</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">نوع الإعاقة</Label>
            <Select value={filters.disabilityType} onValueChange={(v) => setFilters(p => ({ ...p, disabilityType: v }))}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {DISABILITY_TYPES.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">سنة المشروع</Label>
            <Select value={filters.projectYear} onValueChange={(v) => setFilters(p => ({ ...p, projectYear: v }))}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {projectYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">سنة التمويل</Label>
            <Select value={filters.fundingYear} onValueChange={(v) => setFilters(p => ({ ...p, fundingYear: v }))}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {fundingYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">تاريخ الميلاد (من)</Label>
            <Input type="date" value={filters.dobFrom} onChange={(e) => setFilters(p => ({ ...p, dobFrom: e.target.value }))} className="h-9 text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">تاريخ الميلاد (إلى)</Label>
            <Input type="date" value={filters.dobTo} onChange={(e) => setFilters(p => ({ ...p, dobTo: e.target.value }))} className="h-9 text-xs" />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <FolderKanban className="size-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold tabular-nums">{uniqueProjects}</p>
          <p className="text-xs text-muted-foreground">مشروع</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <UserCheck className="size-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold tabular-nums">{filteredVolunteers.length}</p>
          <p className="text-xs text-muted-foreground">متطوع</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <Handshake className="size-6 text-teal-600 mx-auto mb-2" />
          <p className="text-2xl font-bold tabular-nums">{filteredPartners.length}</p>
          <p className="text-xs text-muted-foreground">شريك</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <Wallet className="size-6 text-indigo-600 mx-auto mb-2" />
          <p className="text-2xl font-bold tabular-nums">{filteredFunders.length}</p>
          <p className="text-xs text-muted-foreground">ممول</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <Users className="size-6 text-emerald-600 mx-auto mb-2" />
          <p className="text-lg font-bold tabular-nums">{maleCount} / {femaleCount}</p>
          <p className="text-xs text-muted-foreground">ذكور / إناث</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <Download className="size-6 text-purple-600 mx-auto mb-2" />
          <p className="text-lg font-bold tabular-nums">${totalBudget.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">إجمالي التمويل</p>
        </div>
      </div>

      {/* Tabbed Data Tables */}
      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="volunteers" className="gap-1.5 text-xs">
            <UserCheck className="size-3.5" />
            المتطوعون ({filteredVolunteers.length})
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-1.5 text-xs">
            <FolderKanban className="size-3.5" />
            المشاريع ({filteredProjects.length})
          </TabsTrigger>
          <TabsTrigger value="partners" className="gap-1.5 text-xs">
            <Handshake className="size-3.5" />
            الشركاء ({filteredPartners.length})
          </TabsTrigger>
          <TabsTrigger value="funders" className="gap-1.5 text-xs">
            <Wallet className="size-3.5" />
            الممولون ({filteredFunders.length})
          </TabsTrigger>
        </TabsList>

        {/* Volunteers Tab */}
        <TabsContent value="volunteers">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">#</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">الاسم</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">المشروع</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">الجنس</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">تاريخ الميلاد</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">المحافظة</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">الجوال</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">النشاط</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">إعاقة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredVolunteers.slice(0, 50).map((vol, idx) => (
                    <tr key={vol.id} className="hover:bg-muted/20">
                      <td className="px-3 py-2 text-muted-foreground tabular-nums">{idx + 1}</td>
                      <td className="px-3 py-2 font-medium text-foreground">{vol.fullName}</td>
                      <td className="px-3 py-2 text-muted-foreground">{projects.find(p => p.id === vol.projectId)?.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{GENDER_LABELS[vol.gender]}</td>
                      <td className="px-3 py-2 text-muted-foreground tabular-nums">{vol.dateOfBirth}</td>
                      <td className="px-3 py-2 text-muted-foreground">{getGovernorateLabel(vol.governorate)}</td>
                      <td className="px-3 py-2 text-muted-foreground tabular-nums">{vol.mobile}</td>
                      <td className="px-3 py-2 text-muted-foreground">{getActivityLabel(vol.activityType)}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {vol.hasDisability ? getDisabilityLabel(vol.disabilityType || '') : 'لا'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredVolunteers.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">لا توجد بيانات مطابقة للفلاتر المحددة</div>
              )}
              {filteredVolunteers.length > 50 && (
                <div className="p-3 text-center text-xs text-muted-foreground border-t border-border">
                  يتم عرض أول 50 سجل من أصل {filteredVolunteers.length} — استخدم التصدير لعرض البيانات الكاملة
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">#</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">اسم المشروع</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">المحافظة</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">الموقع</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">تاريخ البدء</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">تاريخ الانتهاء</th>
                    <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground">الشركاء</th>
                    <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground">الممولون</th>
                    <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground">المتطوعون</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">التمويل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProjects.map((proj, idx) => {
                    const pPartners = partners.filter(pt => pt.projectId === proj.id);
                    const pFunders = funders.filter(f => f.projectId === proj.id);
                    const pVols = volunteers.filter(v => v.projectId === proj.id);
                    const pBudget = pFunders.reduce((sum, f) => sum + f.budgetValue, 0);
                    return (
                      <tr key={proj.id} className="hover:bg-muted/20">
                        <td className="px-3 py-2 text-muted-foreground tabular-nums">{idx + 1}</td>
                        <td className="px-3 py-2 font-medium text-foreground">{proj.name}</td>
                        <td className="px-3 py-2 text-muted-foreground">{getGovernorateLabel(proj.governorate)}</td>
                        <td className="px-3 py-2 text-muted-foreground">{proj.location}</td>
                        <td className="px-3 py-2 text-muted-foreground tabular-nums">{proj.startDate}</td>
                        <td className="px-3 py-2 text-muted-foreground tabular-nums">{proj.endDate}</td>
                        <td className="px-3 py-2 text-center font-bold tabular-nums">{pPartners.length}</td>
                        <td className="px-3 py-2 text-center font-bold tabular-nums">{pFunders.length}</td>
                        <td className="px-3 py-2 text-center font-bold tabular-nums">{pVols.length}</td>
                        <td className="px-3 py-2 font-bold text-primary tabular-nums">${pBudget.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredProjects.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">لا توجد مشاريع مطابقة</div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Partners Tab */}
        <TabsContent value="partners">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">#</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">اسم المؤسسة</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">المشروع</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">المحافظة</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">الموقع</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">الموقع الإلكتروني</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">المسؤولون</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">الهاتف</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">البريد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPartners.map((pt, idx) => (
                    <tr key={pt.id} className="hover:bg-muted/20">
                      <td className="px-3 py-2 text-muted-foreground tabular-nums">{idx + 1}</td>
                      <td className="px-3 py-2 font-medium text-foreground">{pt.organizationName}</td>
                      <td className="px-3 py-2 text-muted-foreground">{projects.find(p => p.id === pt.projectId)?.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3 text-teal-500" />
                          {getGovernorateLabel(pt.governorate)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{pt.location}</td>
                      <td className="px-3 py-2">
                        {pt.website ? (
                          <a href={pt.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                            <ExternalLink className="size-3" />
                            <span className="max-w-[120px] truncate">{pt.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</span>
                          </a>
                        ) : '—'}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{pt.responsiblePersons.map(rp => rp.name).join('، ')}</td>
                      <td className="px-3 py-2 text-muted-foreground tabular-nums">{pt.responsiblePersons[0]?.phone || '—'}</td>
                      <td className="px-3 py-2 text-muted-foreground">{pt.responsiblePersons[0]?.email || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPartners.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">لا يوجد شركاء مطابقون</div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Funders Tab */}
        <TabsContent value="funders">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">#</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">اسم الممول</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">المشروع</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">محافظة المشروع</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">سنة التمويل</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">المبلغ</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">الموقع الإلكتروني</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">جهة الاتصال</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">الهاتف</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground">البريد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredFunders.map((f, idx) => {
                    const fProject = projects.find(p => p.id === f.projectId);
                    return (
                      <tr key={f.id} className="hover:bg-muted/20">
                        <td className="px-3 py-2 text-muted-foreground tabular-nums">{idx + 1}</td>
                        <td className="px-3 py-2 font-medium text-foreground">{f.funderName}</td>
                        <td className="px-3 py-2 text-muted-foreground">{fProject?.name}</td>
                        <td className="px-3 py-2 text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3 text-indigo-500" />
                            {fProject ? getGovernorateLabel(fProject.governorate) : '—'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground tabular-nums">{f.fundingYear}</td>
                        <td className="px-3 py-2 font-bold text-primary tabular-nums">${f.budgetValue.toLocaleString()}</td>
                        <td className="px-3 py-2">
                          {f.website ? (
                            <a href={f.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                              <ExternalLink className="size-3" />
                              <span className="max-w-[120px] truncate">{f.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</span>
                            </a>
                          ) : '—'}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{f.contactName}</td>
                        <td className="px-3 py-2 text-muted-foreground tabular-nums">{f.phone}</td>
                        <td className="px-3 py-2 text-muted-foreground">{f.email}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredFunders.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">لا يوجد ممولون مطابقون</div>
              )}
              {filteredFunders.length > 0 && (
                <div className="p-3 border-t border-border flex justify-end">
                  <span className="text-xs font-bold text-foreground">
                    إجمالي التمويل: <span className="text-primary tabular-nums">${totalBudget.toLocaleString()}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

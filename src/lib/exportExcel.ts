import { Volunteer, Project } from '@/types';
import { getGovernorateLabel, getActivityLabel, getDisabilityLabel } from '@/constants/config';
import { GENDER_LABELS } from '@/types';

interface VolunteerFilters {
  projectIds?: string[];
  governorates?: string[];
  activityTypes?: string[];
  genders?: string[];
  hasDisability?: boolean;
}

interface ProjectFilters {
  governorates?: string[];
  statuses?: string[];
}

export function exportVolunteersToExcel(
  volunteers: Volunteer[], 
  projects: Project[], 
  filters?: VolunteerFilters,
  filename: string = 'تقرير_المتطوعين'
) {
  // Apply filters
  let filteredVolunteers = volunteers;
  
  if (filters) {
    filteredVolunteers = volunteers.filter(vol => {
      if (filters.projectIds?.length && !filters.projectIds.includes(vol.projectId)) return false;
      if (filters.governorates?.length && !filters.governorates.includes(vol.governorate)) return false;
      if (filters.activityTypes?.length && !filters.activityTypes.includes(vol.activityType)) return false;
      if (filters.genders?.length && !filters.genders.includes(vol.gender)) return false;
      if (filters.hasDisability !== undefined && vol.hasDisability !== filters.hasDisability) return false;
      return true;
    });
  }

  const headers = ['#', 'الاسم الكامل', 'المشروع', 'الجنس', 'تاريخ الميلاد', 'المحافظة', 'العنوان', 'الجوال', 'واتساب', 'البريد الإلكتروني', 'النشاط', 'إعاقة', 'نوع الإعاقة'];

  const rows = filteredVolunteers.map((vol, idx) => [
    idx + 1,
    vol.fullName,
    projects.find(p => p.id === vol.projectId)?.name || '',
    GENDER_LABELS[vol.gender],
    vol.dateOfBirth,
    getGovernorateLabel(vol.governorate),
    vol.address,
    vol.mobile,
    vol.whatsapp,
    vol.email,
    getActivityLabel(vol.activityType),
    vol.hasDisability ? 'نعم' : 'لا',
    vol.hasDisability ? getDisabilityLabel(vol.disabilityType || '') : '',
  ]);

  // Build CSV with BOM for Arabic support
  const BOM = '\uFEFF';
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export function exportProjectsToExcel(
  projects: Project[], 
  filters?: ProjectFilters,
  filename: string = 'تقرير_المشاريع'
) {
  // Apply filters
  let filteredProjects = projects;
  
  if (filters) {
    filteredProjects = projects.filter(p => {
      if (filters.governorates?.length && !filters.governorates.includes(p.governorate)) return false;
      if (filters.statuses?.length && !filters.statuses.includes(p.status)) return false;
      return true;
    });
  }

  const STATUS_AR: Record<string, string> = { Pending: 'قيد الانتظار', Approved: 'معتمد', Rejected: 'مرفوض' };
  const headers = ['#', 'اسم المشروع', 'المحافظة', 'الموقع', 'تاريخ البدء', 'تاريخ الانتهاء', 'الحالة', 'الوصف'];

  const rows = filteredProjects.map((p, idx) => [
    idx + 1,
    p.name,
    getGovernorateLabel(p.governorate),
    p.location,
    p.startDate,
    p.endDate,
    STATUS_AR[p.status] || p.status,
    p.description,
  ]);

  const BOM = '\uFEFF';
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
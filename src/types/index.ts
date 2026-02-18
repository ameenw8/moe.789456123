export type UserRole = 'NormalUser' | 'ProjectManager' | 'Admin';
export type ProjectStatus = 'Pending' | 'Approved' | 'Rejected';
export type Gender = 'Male' | 'Female';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  fullName: string;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  governorate: string;
  description: string;
  status: ProjectStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResponsiblePerson {
  name: string;
  phone: string;
  email: string;
}

export interface Partner {
  id: string;
  projectId: string;
  organizationName: string;
  governorate: string;
  location: string;
  website?: string;
  responsiblePersons: ResponsiblePerson[];
}

export interface Funder {
  id: string;
  projectId: string;
  funderName: string;
  fundingYear: number;
  contactName: string;
  phone: string;
  email: string;
  website?: string;
  budgetValue: number;
  projectDescription: string;
}

export interface Volunteer {
  id: string;
  projectId: string;
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  governorate: string;
  address: string;
  hasDisability: boolean;
  disabilityType?: string;
  mobile: string;
  whatsapp: string;
  email: string;
  activityType: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface ReportFilters {
  projectNames: string[];
  governorates: string[];
  genders: Gender[];
  hasDisability?: boolean;
  disabilityTypes: string[];
  projectYears: number[];
  fundingYears: number[];
  dobFrom?: string;
  dobTo?: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  NormalUser: 'مستخدم عادي',
  ProjectManager: 'مدير مشاريع',
  Admin: 'مسؤول النظام',
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  Pending: 'قيد الانتظار',
  Approved: 'معتمد',
  Rejected: 'مرفوض',
};

export const GENDER_LABELS: Record<Gender, string> = {
  Male: 'ذكر',
  Female: 'أنثى',
};

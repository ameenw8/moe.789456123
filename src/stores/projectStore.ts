import { create } from 'zustand';
import { Project, Partner, Funder, Volunteer, ProjectStatus } from '@/types';
import { MOCK_PROJECTS, MOCK_PARTNERS, MOCK_FUNDERS, MOCK_VOLUNTEERS } from '@/constants/mockData';
import { useAuthStore } from './authStore';

interface ProjectState {
  projects: Project[];
  partners: Partner[];
  funders: Funder[];
  volunteers: Volunteer[];
  addProject: (project: Omit<Project, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => string;
  updateProject: (id: string, updates: Partial<Project>) => boolean;
  deleteProject: (id: string) => void;
  changeProjectStatus: (id: string, status: ProjectStatus) => boolean;
  addPartner: (partner: Omit<Partner, 'id'>) => void;
  updatePartner: (id: string, updates: Partial<Partner>) => void;
  deletePartner: (id: string) => void;
  addFunder: (funder: Omit<Funder, 'id'>) => void;
  updateFunder: (id: string, updates: Partial<Funder>) => void;
  deleteFunder: (id: string) => void;
  addVolunteer: (volunteer: Omit<Volunteer, 'id'>) => void;
  addVolunteers: (volunteers: Omit<Volunteer, 'id'>[]) => void;
  updateVolunteer: (id: string, updates: Partial<Volunteer>) => void;
  deleteVolunteer: (id: string) => void;
  getProjectsByUser: (userId: string) => Project[];
  getPartnersByProject: (projectId: string) => Partner[];
  getFundersByProject: (projectId: string) => Funder[];
  getVolunteersByProject: (projectId: string) => Volunteer[];
}

const loadFromStorage = <T>(key: string, fallback: T): T => {
  const saved = localStorage.getItem(key);
  if (saved) return JSON.parse(saved);
  return fallback;
};

const saveToStorage = (key: string, data: unknown) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: loadFromStorage<Project[]>('projects', MOCK_PROJECTS),
  partners: loadFromStorage<Partner[]>('partners', MOCK_PARTNERS),
  funders: loadFromStorage<Funder[]>('funders', MOCK_FUNDERS),
  volunteers: loadFromStorage<Volunteer[]>('volunteers', MOCK_VOLUNTEERS),

  addProject: (projectData) => {
    const user = useAuthStore.getState().currentUser;
    if (!user) return '';
    const now = new Date().toISOString().split('T')[0];
    const newProject: Project = {
      ...projectData,
      id: `p${Date.now()}`,
      status: 'Pending',
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...get().projects, newProject];
    set({ projects: updated });
    saveToStorage('projects', updated);
    useAuthStore.getState().addAuditLog('PROJECT_CREATED', `تم إنشاء مشروع ${newProject.name}`);
    return newProject.id;
  },

  updateProject: (id, updates) => {
    const user = useAuthStore.getState().currentUser;
    if (!user) return false;
    const project = get().projects.find(p => p.id === id);
    if (!project) return false;
    if (user.role === 'NormalUser' && project.status !== 'Pending') return false;
    if (user.role === 'NormalUser' && project.createdBy !== user.id) return false;
    const updated = get().projects.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : p
    );
    set({ projects: updated });
    saveToStorage('projects', updated);
    useAuthStore.getState().addAuditLog('DATA_EDITED', `تم تعديل مشروع ${project.name}`);
    return true;
  },

  deleteProject: (id) => {
    const user = useAuthStore.getState().currentUser;
    if (!user || user.role === 'NormalUser') return;
    const project = get().projects.find(p => p.id === id);
    const updated = get().projects.filter(p => p.id !== id);
    set({ projects: updated });
    saveToStorage('projects', updated);
    if (project) {
      useAuthStore.getState().addAuditLog('PROJECT_DELETED', `تم حذف مشروع ${project.name}`);
    }
  },

  changeProjectStatus: (id, status) => {
    const user = useAuthStore.getState().currentUser;
    if (!user || user.role === 'NormalUser') return false;
    const project = get().projects.find(p => p.id === id);
    if (!project) return false;
    const updated = get().projects.map(p =>
      p.id === id ? { ...p, status, updatedAt: new Date().toISOString().split('T')[0] } : p
    );
    set({ projects: updated });
    saveToStorage('projects', updated);
    const actionType = status === 'Approved' ? 'PROJECT_APPROVED' : 'PROJECT_REJECTED';
    const actionText = status === 'Approved' ? 'اعتماد' : 'رفض';
    useAuthStore.getState().addAuditLog(actionType, `تم ${actionText} مشروع ${project.name}`);
    return true;
  },

  addPartner: (partnerData) => {
    const newPartner: Partner = { ...partnerData, id: `pt${Date.now()}` };
    const updated = [...get().partners, newPartner];
    set({ partners: updated });
    saveToStorage('partners', updated);
  },

  updatePartner: (id, updates) => {
    const updated = get().partners.map(p => p.id === id ? { ...p, ...updates } : p);
    set({ partners: updated });
    saveToStorage('partners', updated);
  },

  deletePartner: (id) => {
    const updated = get().partners.filter(p => p.id !== id);
    set({ partners: updated });
    saveToStorage('partners', updated);
  },

  addFunder: (funderData) => {
    const newFunder: Funder = { ...funderData, id: `f${Date.now()}` };
    const updated = [...get().funders, newFunder];
    set({ funders: updated });
    saveToStorage('funders', updated);
  },

  updateFunder: (id, updates) => {
    const updated = get().funders.map(f => f.id === id ? { ...f, ...updates } : f);
    set({ funders: updated });
    saveToStorage('funders', updated);
  },

  deleteFunder: (id) => {
    const updated = get().funders.filter(f => f.id !== id);
    set({ funders: updated });
    saveToStorage('funders', updated);
  },

  addVolunteer: (volunteerData) => {
    const newVolunteer: Volunteer = { ...volunteerData, id: `v${Date.now()}` };
    const updated = [...get().volunteers, newVolunteer];
    set({ volunteers: updated });
    saveToStorage('volunteers', updated);
  },

  addVolunteers: (volunteersData) => {
    const newVolunteers: Volunteer[] = volunteersData.map((v, i) => ({
      ...v,
      id: `v${Date.now()}_${i}`,
    }));
    const updated = [...get().volunteers, ...newVolunteers];
    set({ volunteers: updated });
    saveToStorage('volunteers', updated);
  },

  updateVolunteer: (id, updates) => {
    const updated = get().volunteers.map(v => v.id === id ? { ...v, ...updates } : v);
    set({ volunteers: updated });
    saveToStorage('volunteers', updated);
  },

  deleteVolunteer: (id) => {
    const updated = get().volunteers.filter(v => v.id !== id);
    set({ volunteers: updated });
    saveToStorage('volunteers', updated);
  },

  getProjectsByUser: (userId) => {
    return get().projects.filter(p => p.createdBy === userId);
  },

  getPartnersByProject: (projectId) => {
    return get().partners.filter(p => p.projectId === projectId);
  },

  getFundersByProject: (projectId) => {
    return get().funders.filter(f => f.projectId === projectId);
  },

  getVolunteersByProject: (projectId) => {
    return get().volunteers.filter(v => v.projectId === projectId);
  },
}));

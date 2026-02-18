import { create } from 'zustand';
import { User, UserRole, AuditLog } from '@/types';
import { MOCK_USERS, MOCK_AUDIT_LOGS } from '@/constants/mockData';

interface AuthState {
  currentUser: User | null;
  users: User[];
  auditLogs: AuditLog[];
  isImpersonating: boolean;
  originalAdmin: User | null;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  changePassword: (newPassword: string) => void;
  createUser: (user: Omit<User, 'id' | 'createdAt' | 'isActive' | 'mustChangePassword'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  toggleUserStatus: (id: string) => void;
  deleteUser: (id: string) => void;
  impersonateUser: (userId: string) => void;
  stopImpersonation: () => void;
  addAuditLog: (action: string, details: string) => void;
  isAuthorized: (requiredRoles: UserRole[]) => boolean;
}

const loadFromStorage = <T>(key: string, fallback: T): T => {
  const saved = localStorage.getItem(key);
  if (saved) return JSON.parse(saved);
  return fallback;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: loadFromStorage<User | null>('currentUser', null),
  users: loadFromStorage<User[]>('users', MOCK_USERS),
  auditLogs: loadFromStorage<AuditLog[]>('auditLogs', MOCK_AUDIT_LOGS),
  isImpersonating: loadFromStorage<boolean>('isImpersonating', false),
  originalAdmin: loadFromStorage<User | null>('originalAdmin', null),

  login: (username: string, password: string) => {
    const { users } = get();
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
    if (!user.isActive) return { success: false, error: 'الحساب معطل. تواصل مع مسؤول النظام' };
    set({ currentUser: user });
    localStorage.setItem('currentUser', JSON.stringify(user));
    return { success: true };
  },

  logout: () => {
    set({ currentUser: null, isImpersonating: false, originalAdmin: null });
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isImpersonating');
    localStorage.removeItem('originalAdmin');
  },

  changePassword: (newPassword: string) => {
    const { currentUser, users } = get();
    if (!currentUser) return;
    const updated = users.map(u =>
      u.id === currentUser.id ? { ...u, password: newPassword, mustChangePassword: false } : u
    );
    const updatedUser = { ...currentUser, password: newPassword, mustChangePassword: false };
    set({ users: updated, currentUser: updatedUser });
    localStorage.setItem('users', JSON.stringify(updated));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  },

  createUser: (userData) => {
    const { users, currentUser } = get();
    if (!currentUser || currentUser.role !== 'Admin') return;
    const newUser: User = {
      ...userData,
      id: `u${Date.now()}`,
      isActive: true,
      mustChangePassword: true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [...users, newUser];
    set({ users: updated });
    localStorage.setItem('users', JSON.stringify(updated));
    get().addAuditLog('USER_CREATED', `تم إنشاء حساب ${newUser.fullName}`);
  },

  updateUser: (id, updates) => {
    const { users } = get();
    const updated = users.map(u => u.id === id ? { ...u, ...updates } : u);
    set({ users: updated });
    localStorage.setItem('users', JSON.stringify(updated));
  },

  toggleUserStatus: (id) => {
    const { users, currentUser } = get();
    if (!currentUser || currentUser.role !== 'Admin') return;
    const user = users.find(u => u.id === id);
    if (!user) return;
    const updated = users.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u);
    set({ users: updated });
    localStorage.setItem('users', JSON.stringify(updated));
    get().addAuditLog(
      user.isActive ? 'USER_SUSPENDED' : 'USER_ACTIVATED',
      `تم ${user.isActive ? 'تعليق' : 'تفعيل'} حساب ${user.fullName}`
    );
  },

  deleteUser: (id) => {
    const { users, currentUser } = get();
    if (!currentUser || currentUser.role !== 'Admin') return;
    const user = users.find(u => u.id === id);
    if (!user) return;
    const updated = users.filter(u => u.id !== id);
    set({ users: updated });
    localStorage.setItem('users', JSON.stringify(updated));
    get().addAuditLog('USER_DELETED', `تم حذف حساب ${user.fullName}`);
  },

  impersonateUser: (userId) => {
    const { currentUser, users } = get();
    if (!currentUser || currentUser.role !== 'Admin') return;
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;
    set({ originalAdmin: currentUser, currentUser: targetUser, isImpersonating: true });
    localStorage.setItem('originalAdmin', JSON.stringify(currentUser));
    localStorage.setItem('currentUser', JSON.stringify(targetUser));
    localStorage.setItem('isImpersonating', JSON.stringify(true));
    get().addAuditLog('IMPERSONATION', `تم الدخول كمستخدم ${targetUser.fullName}`);
  },

  stopImpersonation: () => {
    const { originalAdmin } = get();
    if (!originalAdmin) return;
    set({ currentUser: originalAdmin, isImpersonating: false, originalAdmin: null });
    localStorage.setItem('currentUser', JSON.stringify(originalAdmin));
    localStorage.removeItem('isImpersonating');
    localStorage.removeItem('originalAdmin');
  },

  addAuditLog: (action, details) => {
    const { currentUser, auditLogs, originalAdmin } = get();
    const actor = originalAdmin || currentUser;
    if (!actor) return;
    const newLog: AuditLog = {
      id: `al${Date.now()}`,
      userId: actor.id,
      userName: actor.fullName,
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    const updated = [newLog, ...auditLogs];
    set({ auditLogs: updated });
    localStorage.setItem('auditLogs', JSON.stringify(updated));
  },

  isAuthorized: (requiredRoles) => {
    const { currentUser } = get();
    if (!currentUser) return false;
    return requiredRoles.includes(currentUser.role);
  },
}));

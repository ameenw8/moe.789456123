import { useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useProjectStore } from '@/stores/projectStore';
import { Link } from 'react-router-dom';
import { StatusBadge } from '@/components/features/StatusBadge';
import { DashboardCharts } from '@/components/features/DashboardCharts';
import {
  FolderKanban,
  Users,
  Handshake,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  UserCheck,
  Wallet,
  ArrowUpLeft,
  BarChart3,
  MapPin,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROLE_LABELS } from '@/types';
import { getGovernorateLabel } from '@/constants/config';

function StatCard({ icon, label, value, color, to }: { icon: React.ReactNode; label: string; value: number; color: string; to?: string }) {
  const content = (
    <div className={`bg-card rounded-xl border border-border p-5 flex items-start gap-4 hover:shadow-md transition-shadow ${to ? 'cursor-pointer' : ''}`}>
      <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

export default function Dashboard() {
  const { currentUser, users } = useAuthStore();
  const { projects, partners, funders, volunteers } = useProjectStore();

  if (!currentUser) return null;

  const isNormal = currentUser.role === 'NormalUser';
  const isManager = currentUser.role === 'ProjectManager';
  const isAdmin = currentUser.role === 'Admin';

  const userProjects = isNormal ? projects.filter(p => p.createdBy === currentUser.id) : projects;
  const pendingCount = userProjects.filter(p => p.status === 'Pending').length;
  const approvedCount = userProjects.filter(p => p.status === 'Approved').length;
  const rejectedCount = userProjects.filter(p => p.status === 'Rejected').length;

  const recentProjects = [...userProjects].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  const userVolunteers = isNormal
    ? volunteers.filter(v => userProjects.some(p => p.id === v.projectId))
    : volunteers;

  const userPartners = isNormal
    ? partners.filter(pt => userProjects.some(p => p.id === pt.projectId))
    : partners;

  const userFunders = isNormal
    ? funders.filter(f => userProjects.some(p => p.id === f.projectId))
    : funders;

  // Governorate breakdowns for partners and funders
  const partnersByGovernorate = useMemo(() => {
    const map: Record<string, number> = {};
    userPartners.forEach(pt => {
      map[pt.governorate] = (map[pt.governorate] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [userPartners]);

  const fundersByGovernorate = useMemo(() => {
    const map: Record<string, number> = {};
    userFunders.forEach(f => {
      const project = projects.find(p => p.id === f.projectId);
      if (project) {
        map[project.governorate] = (map[project.governorate] || 0) + 1;
      }
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [userFunders, projects]);

  const totalBudget = userFunders.reduce((sum, f) => sum + f.budgetValue, 0);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">مرحباً، {currentUser.fullName}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{ROLE_LABELS[currentUser.role]} — لوحة التحكم</p>
        </div>
        {isNormal && (
          <Link to="/projects/new">
            <Button className="gap-2">
              <FolderKanban className="size-4" />
              مشروع جديد
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FolderKanban className="size-6 text-primary" />}
          label="إجمالي المشاريع"
          value={userProjects.length}
          color="bg-primary/10"
          to="/projects"
        />
        <StatCard
          icon={<Clock className="size-6 text-amber-600" />}
          label="قيد الانتظار"
          value={pendingCount}
          color="bg-amber-50"
        />
        <StatCard
          icon={<CheckCircle2 className="size-6 text-emerald-600" />}
          label="معتمدة"
          value={approvedCount}
          color="bg-emerald-50"
        />
        <StatCard
          icon={<XCircle className="size-6 text-red-500" />}
          label="مرفوضة"
          value={rejectedCount}
          color="bg-red-50"
        />
      </div>

      {/* Second stats row: Partners, Funders, Volunteers, Budget */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Handshake className="size-6 text-teal-600" />}
          label="الشركاء"
          value={userPartners.length}
          color="bg-teal-50"
          to="/partners"
        />
        <StatCard
          icon={<Wallet className="size-6 text-indigo-600" />}
          label="الممولون"
          value={userFunders.length}
          color="bg-indigo-50"
          to="/funders"
        />
        <StatCard
          icon={<UserCheck className="size-6 text-violet-600" />}
          label="المتطوعون"
          value={userVolunteers.length}
          color="bg-violet-50"
          to="/volunteers"
        />
        <div className="bg-card rounded-xl border border-border p-5 flex items-start gap-4">
          <div className="size-12 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50">
            <Globe className="size-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground tabular-nums">${totalBudget.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-0.5">إجمالي التمويل</p>
          </div>
        </div>
      </div>

      {/* Charts (for PM and Admin) */}
      {(isManager || isAdmin) && (
        <DashboardCharts projects={userProjects} volunteers={userVolunteers} />
      )}

      {/* Middle row */}
      <div className="grid grid-cols-12 gap-4">
        {/* Recent Projects */}
        <div className="col-span-12 lg:col-span-8 bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-sm font-bold text-foreground">آخر المشاريع</h2>
            <Link to="/projects" className="text-xs text-primary hover:underline">عرض الكل</Link>
          </div>
          <div className="divide-y divide-border">
            {recentProjects.map(project => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FolderKanban className="size-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{project.name}</p>
                    <p className="text-xs text-muted-foreground">{getGovernorateLabel(project.governorate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={project.status} />
                  <ArrowUpLeft className="size-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
            {recentProjects.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">لا توجد مشاريع بعد</div>
            )}
          </div>
        </div>

        {/* Side stats */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* Partners by Governorate */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Handshake className="size-4 text-teal-600" />
              الشركاء حسب المحافظة
            </h3>
            <div className="space-y-2.5">
              {partnersByGovernorate.slice(0, 6).map(([gov, count]) => (
                <div key={gov} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-3.5 text-teal-500" />
                    <span>{getGovernorateLabel(gov)}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground tabular-nums">{count}</span>
                </div>
              ))}
              {partnersByGovernorate.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">لا يوجد شركاء</p>
              )}
            </div>
          </div>

          {/* Funders by Governorate */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Wallet className="size-4 text-indigo-600" />
              الممولون حسب المحافظة
            </h3>
            <div className="space-y-2.5">
              {fundersByGovernorate.slice(0, 6).map(([gov, count]) => (
                <div key={gov} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-3.5 text-indigo-500" />
                    <span>{getGovernorateLabel(gov)}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground tabular-nums">{count}</span>
                </div>
              ))}
              {fundersByGovernorate.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">لا يوجد ممولون</p>
              )}
            </div>
          </div>

          {isAdmin && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">الأداء السنوي</h3>
              <div className="space-y-3">
                {users.filter(u => u.role === 'NormalUser' && u.isActive).slice(0, 4).map(user => {
                  const count = projects.filter(p => p.createdBy === user.id).length;
                  return (
                    <div key={user.id} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground truncate max-w-[140px]">{user.fullName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground tabular-nums">{count}</span>
                        <TrendingUp className="size-3 text-emerald-500" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(isManager || isAdmin) && pendingCount > 0 && (
            <Link to="/projects?status=Pending" className="block">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <BarChart3 className="size-5 text-amber-700" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-800">{pendingCount} مشروع بانتظار المراجعة</p>
                    <p className="text-xs text-amber-600 mt-0.5">انقر للمراجعة</p>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

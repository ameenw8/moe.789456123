import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useProjectStore } from '@/stores/projectStore';
import { StatusBadge } from '@/components/features/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getGovernorateLabel, GOVERNORATES } from '@/constants/config';
import { FolderKanban, Plus, Search, Eye, Filter } from 'lucide-react';
import { ProjectStatus } from '@/types';

export default function Projects() {
  const { currentUser, users } = useAuthStore();
  const { projects } = useProjectStore();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all');
  const [govFilter, setGovFilter] = useState('all');

  if (!currentUser) return null;

  const isNormal = currentUser.role === 'NormalUser';

  const filteredProjects = useMemo(() => {
    let result = isNormal ? projects.filter(p => p.createdBy === currentUser.id) : projects;

    if (search) {
      result = result.filter(p =>
        p.name.includes(search) || p.description.includes(search) || p.location.includes(search)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }
    if (govFilter !== 'all') {
      result = result.filter(p => p.governorate === govFilter);
    }
    return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [projects, search, statusFilter, govFilter, isNormal, currentUser.id]);

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.fullName || 'غير معروف';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">المشاريع</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isNormal ? 'مشاريعك المقدمة' : 'جميع المشاريع في النظام'}
          </p>
        </div>
        {isNormal && (
          <Link to="/projects/new">
            <Button className="gap-2">
              <Plus className="size-4" />
              مشروع جديد
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="size-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">تصفية</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم أو الوصف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="Pending">قيد الانتظار</SelectItem>
              <SelectItem value="Approved">معتمد</SelectItem>
              <SelectItem value="Rejected">مرفوض</SelectItem>
            </SelectContent>
          </Select>
          <Select value={govFilter} onValueChange={setGovFilter}>
            <SelectTrigger>
              <SelectValue placeholder="المحافظة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المحافظات</SelectItem>
              {GOVERNORATES.map(g => (
                <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-right px-5 py-3 font-semibold text-muted-foreground">اسم المشروع</th>
                <th className="text-right px-5 py-3 font-semibold text-muted-foreground">المحافظة</th>
                <th className="text-right px-5 py-3 font-semibold text-muted-foreground">تاريخ البدء</th>
                <th className="text-right px-5 py-3 font-semibold text-muted-foreground">تاريخ الانتهاء</th>
                {!isNormal && <th className="text-right px-5 py-3 font-semibold text-muted-foreground">المنشئ</th>}
                <th className="text-right px-5 py-3 font-semibold text-muted-foreground">الحالة</th>
                <th className="text-center px-5 py-3 font-semibold text-muted-foreground">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProjects.map(project => (
                <tr key={project.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FolderKanban className="size-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{project.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{getGovernorateLabel(project.governorate)}</td>
                  <td className="px-5 py-3 text-muted-foreground tabular-nums">{project.startDate}</td>
                  <td className="px-5 py-3 text-muted-foreground tabular-nums">{project.endDate}</td>
                  {!isNormal && <td className="px-5 py-3 text-muted-foreground">{getUserName(project.createdBy)}</td>}
                  <td className="px-5 py-3"><StatusBadge status={project.status} /></td>
                  <td className="px-5 py-3 text-center">
                    <Link to={`/projects/${project.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                        <Eye className="size-3.5" />
                        عرض
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={isNormal ? 6 : 7} className="px-5 py-12 text-center">
                    <FolderKanban className="size-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">لا توجد مشاريع مطابقة</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

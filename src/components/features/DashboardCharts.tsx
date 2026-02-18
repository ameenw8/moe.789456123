import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Project, Volunteer } from '@/types';
import { getGovernorateLabel } from '@/constants/config';

interface DashboardChartsProps {
  projects: Project[];
  volunteers: Volunteer[];
}

const STATUS_COLORS = {
  'معتمد': '#059669',
  'قيد الانتظار': '#d97706',
  'مرفوض': '#dc2626',
};

const GOV_COLORS = ['#0d9488', '#0891b2', '#2563eb', '#7c3aed', '#c026d3', '#e11d48', '#ea580c', '#65a30d'];

export function DashboardCharts({ projects, volunteers }: DashboardChartsProps) {
  // Status distribution
  const statusData = [
    { name: 'معتمد', value: projects.filter(p => p.status === 'Approved').length },
    { name: 'قيد الانتظار', value: projects.filter(p => p.status === 'Pending').length },
    { name: 'مرفوض', value: projects.filter(p => p.status === 'Rejected').length },
  ].filter(d => d.value > 0);

  // Projects by governorate (top 8)
  const govCounts: Record<string, number> = {};
  projects.forEach(p => {
    const label = getGovernorateLabel(p.governorate);
    govCounts[label] = (govCounts[label] || 0) + 1;
  });
  const govData = Object.entries(govCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  // Gender distribution of volunteers
  const maleCount = volunteers.filter(v => v.gender === 'Male').length;
  const femaleCount = volunteers.filter(v => v.gender === 'Female').length;
  const genderData = [
    { name: 'ذكور', value: maleCount },
    { name: 'إناث', value: femaleCount },
  ].filter(d => d.value > 0);
  const GENDER_COLORS = ['#2563eb', '#e11d48'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs" dir="rtl">
          <p className="font-semibold text-foreground">{label || payload[0].name}</p>
          <p className="text-muted-foreground">{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Status Pie Chart */}
      <div className="col-span-12 md:col-span-4 bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-bold text-foreground mb-4">حالات المشاريع</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                formatter={(value: string) => <span className="text-xs text-muted-foreground mr-1">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Governorate Bar Chart */}
      <div className="col-span-12 md:col-span-4 bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-bold text-foreground mb-4">المشاريع حسب المحافظة</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={govData} layout="vertical" margin={{ right: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(210 15% 88%)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {govData.map((_, i) => (
                  <Cell key={i} fill={GOV_COLORS[i % GOV_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gender Pie Chart */}
      <div className="col-span-12 md:col-span-4 bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-bold text-foreground mb-4">توزيع المتطوعين (جنس)</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {genderData.map((_, i) => (
                  <Cell key={i} fill={GENDER_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                formatter={(value: string) => <span className="text-xs text-muted-foreground mr-1">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

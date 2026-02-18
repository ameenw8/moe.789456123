import { Volunteer, Project } from '@/types';
import { getGovernorateLabel, getActivityLabel, getDisabilityLabel } from '@/constants/config';
import { GENDER_LABELS } from '@/types';

export function exportVolunteersPDF(
  volunteers: Volunteer[],
  projects: Project[],
  stats: { total: number; male: number; female: number; disability: number; uniqueProjects: number; totalBudget: number },
  filename: string = 'تقرير_المتطوعين'
) {
  // Build HTML report for print
  const rows = volunteers.map((vol, idx) =>
    `<tr>
      <td>${idx + 1}</td>
      <td>${vol.fullName}</td>
      <td>${projects.find(p => p.id === vol.projectId)?.name || ''}</td>
      <td>${GENDER_LABELS[vol.gender]}</td>
      <td>${vol.dateOfBirth}</td>
      <td>${getGovernorateLabel(vol.governorate)}</td>
      <td>${vol.mobile}</td>
      <td>${getActivityLabel(vol.activityType)}</td>
      <td>${vol.hasDisability ? getDisabilityLabel(vol.disabilityType || '') : 'لا'}</td>
    </tr>`
  ).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>${filename}</title>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Cairo', sans-serif; direction: rtl; padding: 32px; color: #1a1a2e; background: #fff; }
        .header { text-align: center; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 3px solid #1a7a6d; }
        .header h1 { font-size: 22px; font-weight: 700; color: #1a7a6d; margin-bottom: 4px; }
        .header p { font-size: 12px; color: #666; }
        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
        .stat-card { background: #f0fdf9; border: 1px solid #d1fae5; border-radius: 8px; padding: 12px; text-align: center; }
        .stat-card .value { font-size: 24px; font-weight: 700; color: #1a7a6d; }
        .stat-card .label { font-size: 11px; color: #666; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 16px; }
        th { background: #1a7a6d; color: #fff; padding: 8px 6px; text-align: right; font-weight: 600; }
        td { padding: 6px; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background: #f9fafb; }
        .footer { margin-top: 24px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #e5e7eb; padding-top: 12px; }
        @media print { body { padding: 16px; } .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>تقرير المتطوعين</h1>
        <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <div class="stats">
        <div class="stat-card"><div class="value">${stats.total}</div><div class="label">إجمالي المتطوعين</div></div>
        <div class="stat-card"><div class="value">${stats.male} / ${stats.female}</div><div class="label">ذكور / إناث</div></div>
        <div class="stat-card"><div class="value">${stats.disability}</div><div class="label">ذوي إعاقة</div></div>
        <div class="stat-card"><div class="value">${stats.uniqueProjects}</div><div class="label">مشاريع</div></div>
        <div class="stat-card"><div class="value">$${stats.totalBudget.toLocaleString()}</div><div class="label">إجمالي التمويل</div></div>
        <div class="stat-card"><div class="value">${((stats.female / (stats.total || 1)) * 100).toFixed(1)}%</div><div class="label">نسبة الإناث</div></div>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th><th>الاسم</th><th>المشروع</th><th>الجنس</th><th>تاريخ الميلاد</th><th>المحافظة</th><th>الجوال</th><th>النشاط</th><th>إعاقة</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="footer">نظام إدارة المشاريع المجتمعية — تم إنشاء التقرير تلقائياً</div>
      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

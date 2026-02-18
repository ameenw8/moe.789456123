import { User, Project, Partner, Funder, Volunteer, AuditLog } from '@/types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    username: 'admin',
    password: 'admin123',
    role: 'Admin',
    fullName: 'Basem',
    isActive: true,
    mustChangePassword: false,
    createdAt: '2024-01-01',
  },
  {
    id: 'u2',
    username: 'manager',
    password: 'manager123',
    role: 'ProjectManager',
    fullName: 'سارة عبد الرحمن',
    isActive: true,
    mustChangePassword: false,
    createdAt: '2024-01-15',
  },
  {
    id: 'u3',
    username: 'user1',
    password: 'user123',
    role: 'NormalUser',
    fullName: 'محمد خالد عيسى',
    isActive: true,
    mustChangePassword: false,
    createdAt: '2024-02-01',
  }
];

export const MOCK_PROJECTS: Project[] = [
  { id: 'p1', name: 'مشروع تمكين الشباب', startDate: '2024-03-01', endDate: '2024-09-30', location: 'وسط المدينة', governorate: 'Ramallah', description: 'برنامج تدريبي لتمكين الشباب في مجال ريادة الأعمال', status: 'Approved', createdBy: 'u3', createdAt: '2024-02-15', updatedAt: '2024-03-01' },
  { id: 'p22', name: 'مشروع ترميم المنازل', startDate: '2025-03-01', endDate: '2025-12-31', location: 'البلدة القديمة', governorate: 'Jerusalem', description: 'ترميم منازل قديمة مهددة بالانهيار', status: 'Approved', createdBy: 'u5', createdAt: '2025-02-15', updatedAt: '2025-03-01' },
];

export const MOCK_PARTNERS: Partner[] = [
  { id: 'pt1', projectId: 'p1', organizationName: 'جمعية الشباب الفلسطيني', governorate: 'Ramallah', location: 'شارع الإرسال', website: 'https://facebook.com/PalYouth', responsiblePersons: [{ name: 'خالد عمران', phone: '0599123456', email: 'khaled@youth.ps' }, { name: 'نور حسين', phone: '0598765432', email: 'nour@youth.ps' }] },
  { id: 'pt10', projectId: 'p18', organizationName: 'مكتبة بلدية الخليل', governorate: 'Hebron', location: 'البلدة القديمة', website: 'https://facebook.com/HebronLibrary', responsiblePersons: [{ name: 'آمال جابر', phone: '0598901234', email: 'amal@library.ps' }] },
];

export const MOCK_FUNDERS: Funder[] = [
  { id: 'f1', projectId: 'p1', funderName: 'الوكالة السويسرية للتنمية', fundingYear: 2024, contactName: 'بيتر مولر', phone: '+41791234567', email: 'peter@sdc.ch', website: 'https://www.eda.admin.ch/sdc', budgetValue: 150000, projectDescription: 'تمويل برنامج تمكين الشباب' },
  { id: 'f2', projectId: 'p2', funderName: 'منظمة الصحة العالمية', fundingYear: 2024, contactName: 'ماري لوران', phone: '+41227654321', email: 'marie@who.int', website: 'https://www.who.int', budgetValue: 200000, projectDescription: 'دعم مبادرات الصحة المجتمعية' },
 
];

const volunteerNames = [
  'أحمد محمد عيسى', 'فاطمة حسن أبو العلا', 'محمود خالد ناصر', 'سمر يوسف الحاج', 'عمر عادل البرغوثي',

];

const governorateKeys = ['Ramallah', 'Jerusalem', 'Hebron', 'Bethlehem', 'Jenin', 'Nablus', 'Tulkarm', 'Qalqilya', 'Salfit', 'Tubas', 'Jericho', 'Gaza_City', 'North_Gaza', 'Deir_Al_Balah', 'Khan_Younis', 'Rafah'];
const activityKeys = ['Training', 'Awareness', 'Support', 'Fieldwork', 'Administrative', 'Technical'];
const projectIds = ['p1', 'p2', 'p4', 'p6', 'p8', 'p10', 'p12', 'p14', 'p16', 'p18', 'p20', 'p22'];

export const MOCK_VOLUNTEERS: Volunteer[] = volunteerNames.map((name, i) => {
  const hasDisability = i % 7 === 0;
  const disabilityTypes = ['Physical', 'Visual', 'Hearing', 'Intellectual', 'Multiple'];
  return {
    id: `v${i + 1}`,
    projectId: projectIds[i % projectIds.length],
    fullName: name,
    dateOfBirth: `${1985 + (i % 20)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    gender: i % 3 === 0 ? 'Female' as const : 'Male' as const,
    governorate: governorateKeys[i % governorateKeys.length],
    address: `شارع ${i + 1}، الحي ${(i % 5) + 1}`,
    hasDisability,
    disabilityType: hasDisability ? disabilityTypes[i % disabilityTypes.length] : undefined,
    mobile: `059${String(1000000 + i * 111111).slice(0, 7)}`,
    whatsapp: `059${String(2000000 + i * 111111).slice(0, 7)}`,
    email: `volunteer${i + 1}@email.com`,
    activityType: activityKeys[i % activityKeys.length],
  };
});

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'al1', userId: 'u2', userName: 'سارة عبد الرحمن', action: 'PROJECT_APPROVED', details: 'تم اعتماد مشروع تمكين الشباب', timestamp: '2024-03-01T10:30:00' },
  { id: 'al10', userId: 'u2', userName: 'سارة عبد الرحمن', action: 'PROJECT_APPROVED', details: 'تم اعتماد برنامج التدريب المهني', timestamp: '2025-01-01T10:15:00' },
];

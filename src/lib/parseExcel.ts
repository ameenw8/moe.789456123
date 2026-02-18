import { Volunteer } from '@/types';

interface ParseResult {
  valid: Omit<Volunteer, 'id'>[];
  errors: { row: number; message: string }[];
  total: number;
}

const GOVERNORATE_MAP: Record<string, string> = {
  'رام الله': 'Ramallah', 'رام الله والبيرة': 'Ramallah', 'Ramallah': 'Ramallah',
  'القدس': 'Jerusalem', 'Jerusalem': 'Jerusalem',
  'الخليل': 'Hebron', 'Hebron': 'Hebron',
  'بيت لحم': 'Bethlehem', 'Bethlehem': 'Bethlehem',
  'جنين': 'Jenin', 'Jenin': 'Jenin',
  'نابلس': 'Nablus', 'Nablus': 'Nablus',
  'طولكرم': 'Tulkarm', 'Tulkarm': 'Tulkarm',
  'قلقيلية': 'Qalqilya', 'Qalqilya': 'Qalqilya',
  'سلفيت': 'Salfit', 'Salfit': 'Salfit',
  'طوباس': 'Tubas', 'Tubas': 'Tubas',
  'أريحا': 'Jericho', 'Jericho': 'Jericho',
  'غزة': 'Gaza_City', 'مدينة غزة': 'Gaza_City', 'Gaza_City': 'Gaza_City',
  'شمال غزة': 'North_Gaza', 'North_Gaza': 'North_Gaza',
  'دير البلح': 'Deir_Al_Balah', 'Deir_Al_Balah': 'Deir_Al_Balah',
  'خان يونس': 'Khan_Younis', 'Khan_Younis': 'Khan_Younis',
  'رفح': 'Rafah', 'Rafah': 'Rafah',
};

const GENDER_MAP: Record<string, 'Male' | 'Female'> = {
  'ذكر': 'Male', 'Male': 'Male', 'male': 'Male', 'M': 'Male', 'm': 'Male',
  'أنثى': 'Female', 'Female': 'Female', 'female': 'Female', 'F': 'Female', 'f': 'Female',
};

const DISABILITY_MAP: Record<string, string> = {
  'حركية': 'Physical', 'Physical': 'Physical',
  'بصرية': 'Visual', 'Visual': 'Visual',
  'سمعية': 'Hearing', 'Hearing': 'Hearing',
  'ذهنية': 'Intellectual', 'Intellectual': 'Intellectual',
  'متعددة': 'Multiple', 'Multiple': 'Multiple',
  'أخرى': 'Other', 'Other': 'Other',
};

export function parseCSVContent(csvText: string, projectId: string): ParseResult {
  const lines = csvText.split('\n').map(line => line.trim()).filter(Boolean);
  if (lines.length < 2) {
    return { valid: [], errors: [{ row: 0, message: 'الملف فارغ أو لا يحتوي على بيانات' }], total: 0 };
  }

  // Skip header
  const dataRows = lines.slice(1);
  const valid: Omit<Volunteer, 'id'>[] = [];
  const errors: { row: number; message: string }[] = [];

  dataRows.forEach((line, idx) => {
    const row = idx + 2; // 1-indexed, skip header
    const cols = parseCSVLine(line);

    if (cols.length < 6) {
      errors.push({ row, message: `صف غير مكتمل - يجب أن يحتوي على 6 أعمدة على الأقل (الاسم، تاريخ الميلاد، الجنس، المحافظة، الجوال، النشاط)` });
      return;
    }

    const [fullName, dateOfBirth, genderRaw, governorateRaw, mobile, activityType, address, whatsapp, email, disabilityRaw, disabilityTypeRaw] = cols;

    // Validate name
    if (!fullName || fullName.trim().length < 3) {
      errors.push({ row, message: 'اسم المتطوع مطلوب (3 أحرف على الأقل)' });
      return;
    }

    // Validate DOB
    if (!dateOfBirth || !isValidDate(dateOfBirth.trim())) {
      errors.push({ row, message: `تاريخ الميلاد غير صحيح: "${dateOfBirth}"` });
      return;
    }

    // Validate gender
    const gender = GENDER_MAP[genderRaw?.trim() || ''];
    if (!gender) {
      errors.push({ row, message: `الجنس غير صحيح: "${genderRaw}" - استخدم: ذكر/أنثى` });
      return;
    }

    // Validate governorate
    const governorate = GOVERNORATE_MAP[governorateRaw?.trim() || ''];
    if (!governorate) {
      errors.push({ row, message: `المحافظة غير صحيحة: "${governorateRaw}"` });
      return;
    }

    // Validate mobile
    if (!mobile || mobile.trim().length < 9) {
      errors.push({ row, message: 'رقم الجوال مطلوب' });
      return;
    }

    // Validate email if provided
    if (email && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.push({ row, message: `البريد الإلكتروني غير صحيح: "${email}"` });
      return;
    }

    const hasDisability = ['نعم', 'yes', 'Yes', 'YES', '1', 'true'].includes(disabilityRaw?.trim() || '');
    const disabilityType = hasDisability ? (DISABILITY_MAP[disabilityTypeRaw?.trim() || ''] || undefined) : undefined;

    if (hasDisability && !disabilityType) {
      errors.push({ row, message: 'نوع الإعاقة مطلوب عند وجود إعاقة' });
      return;
    }

    valid.push({
      projectId,
      fullName: fullName.trim(),
      dateOfBirth: formatDate(dateOfBirth.trim()),
      gender,
      governorate,
      address: address?.trim() || '',
      hasDisability,
      disabilityType,
      mobile: mobile.trim(),
      whatsapp: whatsapp?.trim() || '',
      email: email?.trim() || '',
      activityType: activityType?.trim() || 'Other',
    });
  });

  return { valid, errors, total: dataRows.length };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function isValidDate(dateStr: string): boolean {
  const formatted = formatDate(dateStr);
  const date = new Date(formatted);
  if (isNaN(date.getTime())) return false;
  const age = new Date().getFullYear() - date.getFullYear();
  return age >= 10 && age <= 100;
}

function formatDate(dateStr: string): string {
  // Try YYYY-MM-DD
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateStr)) return dateStr;
  // Try DD/MM/YYYY
  const match = dateStr.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (match) return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
  return dateStr;
}

export function generateTemplateCSV(): string {
  const BOM = '\uFEFF';
  const headers = 'الاسم الكامل,تاريخ الميلاد,الجنس,المحافظة,الجوال,نوع النشاط,العنوان,واتساب,البريد الإلكتروني,إعاقة,نوع الإعاقة';
  const example = 'أحمد محمد,1995-01-15,ذكر,رام الله,0599123456,تدريب,شارع الإرسال,0599123456,ahmed@email.com,لا,';
  return BOM + headers + '\n' + example;
}

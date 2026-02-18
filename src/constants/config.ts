export const GOVERNORATES = [
  { value: 'Ramallah', label: 'رام الله والبيرة' },
  { value: 'Jerusalem', label: 'القدس' },
  { value: 'Hebron', label: 'الخليل' },
  { value: 'Bethlehem', label: 'بيت لحم' },
  { value: 'Jenin', label: 'جنين' },
  { value: 'Nablus', label: 'نابلس' },
  { value: 'Tulkarm', label: 'طولكرم' },
  { value: 'Qalqilya', label: 'قلقيلية' },
  { value: 'Salfit', label: 'سلفيت' },
  { value: 'Tubas', label: 'طوباس' },
  { value: 'Jericho', label: 'أريحا' },
  { value: 'Gaza_City', label: 'مدينة غزة' },
  { value: 'North_Gaza', label: 'شمال غزة' },
  { value: 'Deir_Al_Balah', label: 'دير البلح' },
  { value: 'Khan_Younis', label: 'خان يونس' },
  { value: 'Rafah', label: 'رفح' },
] as const;

export const DISABILITY_TYPES = [
  { value: 'Physical', label: 'إعاقة حركية' },
  { value: 'Visual', label: 'إعاقة بصرية' },
  { value: 'Hearing', label: 'إعاقة سمعية' },
  { value: 'Intellectual', label: 'إعاقة ذهنية' },
  { value: 'Multiple', label: 'إعاقة متعددة' },
  { value: 'Other', label: 'أخرى' },
] as const;

export const ACTIVITY_TYPES = [
  { value: 'Training', label: 'تدريب' },
  { value: 'Awareness', label: 'توعية' },
  { value: 'Support', label: 'دعم' },
  { value: 'Fieldwork', label: 'عمل ميداني' },
  { value: 'Administrative', label: 'إداري' },
  { value: 'Technical', label: 'تقني' },
  { value: 'Other', label: 'أخرى' },
] as const;

export function getGovernorateLabel(value: string): string {
  const gov = GOVERNORATES.find(g => g.value === value);
  return gov ? gov.label : value;
}

export function getDisabilityLabel(value: string): string {
  const dt = DISABILITY_TYPES.find(d => d.value === value);
  return dt ? dt.label : value;
}

export function getActivityLabel(value: string): string {
  const at = ACTIVITY_TYPES.find(a => a.value === value);
  return at ? at.label : value;
}

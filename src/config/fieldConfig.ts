// src/config/fieldConfig.ts
// Centralized field configuration derived from We(1).xlsx color coding.
// This is the single source of truth for field behavior in the data-entry form.

export type FieldColor = 'blue' | 'green' | 'purple';
export type FieldInputType = 'text' | 'number' | 'date' | 'coordinate' | 'currency' | 'select';

export interface FieldConfig {
  /** Exact CSV column header (trimmed) */
  csvColumn: string;
  /** Display label (Arabic or English) */
  label: string;
  /** English label for bilingual UI */
  labelEn: string;
  /** Color from Excel reference → determines UI behavior */
  color: FieldColor;
  /** Input type for purple fields / display hint */
  inputType: FieldInputType;
  /** Whether the field is required for submission */
  required: boolean;
  /** Order in the form (lower = higher) */
  order: number;
  /** Validation regex or range (optional) */
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  /** For cascading dropdowns: which field this depends on */
  dependsOn?: string;
}

// ──────────────────────────────────────────────────────
// BLUE FIELDS — Auto-populated from Site Code, Read Only
// ──────────────────────────────────────────────────────
// GREEN FIELDS — Controlled Dropdown
// ──────────────────────────────────────────────────────
// PURPLE FIELDS — User Editable Input
// ──────────────────────────────────────────────────────

export const FIELD_CONFIG: FieldConfig[] = [
  // ─── BLUE (Read Only, auto-filled from site code) ───
  {
    csvColumn: 'site code',
    label: 'كود الموقع',
    labelEn: 'Site Code',
    color: 'blue',
    inputType: 'text',
    required: true,
    order: 0,
  },
  {
    csvColumn: 'Exc Sectores',
    label: 'رئاسة القطاعات',
    labelEn: 'Executive Sectors',
    color: 'blue',
    inputType: 'text',
    required: false,
    order: 1,
  },
  {
    csvColumn: 'Sectores',
    label: 'القطاعات',
    labelEn: 'Sectors',
    color: 'blue',
    inputType: 'text',
    required: false,
    order: 2,
  },
  {
    csvColumn: 'Exc sector',
    label: 'القطاع التنفيذي',
    labelEn: 'Executive Sector',
    color: 'blue',
    inputType: 'text',
    required: false,
    order: 3,
  },
  {
    csvColumn: 'Sectore',
    label: 'المنطقة',
    labelEn: 'Sector Area',
    color: 'blue',
    inputType: 'text',
    required: false,
    order: 4,
  },
  {
    csvColumn: 'Exc Zone',
    label: 'المنطقة التنفيذية',
    labelEn: 'Executive Zone',
    color: 'blue',
    inputType: 'text',
    required: false,
    order: 5,
  },
  {
    csvColumn: 'Zone',
    label: 'المنطقة / الزون',
    labelEn: 'Zone',
    color: 'blue',
    inputType: 'text',
    required: false,
    order: 6,
  },
  {
    csvColumn: 'السنترال',
    label: 'السنترال',
    labelEn: 'Central',
    color: 'blue',
    inputType: 'text',
    required: false,
    order: 7,
  },
  {
    csvColumn: 'اداره التنفيذ المختصه',
    label: 'إدارة التنفيذ المختصة',
    labelEn: 'Competent Admin',
    color: 'blue',
    inputType: 'text',
    required: false,
    order: 8,
  },
  {
    csvColumn: 'Type',
    label: 'النوع',
    labelEn: 'Type',
    color: 'blue',
    inputType: 'text',
    required: false,
    order: 9,
  },
  {
    csvColumn: 'المسئولية',
    label: 'المسئولية',
    labelEn: 'Responsibility',
    color: 'blue',
    inputType: 'text',
    required: false,
    order: 24,
  },

  // ─── GREEN (Dropdown, controlled selection) ───
  {
    csvColumn: 'التصنيف',
    label: 'التصنيف',
    labelEn: 'Classification',
    color: 'green',
    inputType: 'select',
    required: true,
    order: 10,
  },
  {
    csvColumn: 'اسباب التعذر',
    label: 'أسباب التعذر',
    labelEn: 'Obstacle Reason',
    color: 'green',
    inputType: 'select',
    required: false,
    order: 11,
  },
  {
    csvColumn: 'الجهة المطلوب الدعم منها',
    label: 'الجهة المطلوب الدعم منها',
    labelEn: 'Support Required From',
    color: 'green',
    inputType: 'select',
    required: false,
    order: 12,
  },
  {
    csvColumn: 'خطة',
    label: 'الخطة',
    labelEn: 'Plan',
    color: 'green',
    inputType: 'select',
    required: false,
    order: 13,
  },
  {
    csvColumn: 'مواقع تم اضافتها بتاريخ2',
    label: 'مواقع تم إضافتها بتاريخ',
    labelEn: 'Sites Added Date',
    color: 'green',
    inputType: 'select',
    required: false,
    order: 14,
  },
  {
    csvColumn: 'Site Status',
    label: 'حالة الموقع',
    labelEn: 'Site Status',
    color: 'green',
    inputType: 'select',
    required: true,
    order: 15,
  },

  // ─── PURPLE (User input, editable) ───
  {
    csvColumn: 'التاريخ المتوقع للانتهاء',
    label: 'التاريخ المتوقع للانتهاء',
    labelEn: 'Expected Completion Date',
    color: 'purple',
    inputType: 'text',
    required: false,
    order: 16,
  },
  {
    csvColumn: 'التاريخ الفعلى للانتهاء',
    label: 'التاريخ الفعلي للانتهاء',
    labelEn: 'Actual Completion Date',
    color: 'purple',
    inputType: 'text',
    required: false,
    order: 17,
  },
  {
    csvColumn: 'NLongitude',
    label: 'خط الطول',
    labelEn: 'Longitude',
    color: 'purple',
    inputType: 'coordinate',
    required: false,
    order: 18,
    validation: { min: -180, max: 180, message: 'يجب أن يكون بين -180 و 180' },
  },
  {
    csvColumn: 'NLatitude',
    label: 'خط العرض',
    labelEn: 'Latitude',
    color: 'purple',
    inputType: 'coordinate',
    required: false,
    order: 19,
    validation: { min: -90, max: 90, message: 'يجب أن يكون بين -90 و 90' },
  },
  {
    csvColumn: 'المسافة كم',
    label: 'المسافة (كم)',
    labelEn: 'Distance (km)',
    color: 'purple',
    inputType: 'number',
    required: false,
    order: 20,
    validation: { min: 0, message: 'يجب أن تكون قيمة موجبة' },
  },
  {
    csvColumn: 'تكلفة التوصيل بدون مسار تراسلى بالجنيه',
    label: 'تكلفة التوصيل بدون مسار تراسلي (ج.م)',
    labelEn: 'Connection Cost (No Transit)',
    color: 'purple',
    inputType: 'currency',
    required: false,
    order: 21,
    validation: { min: 0, message: 'يجب أن تكون قيمة موجبة' },
  },
  {
    csvColumn: 'تكلفة التوصيل على المسار التراسلى بالجنيه',
    label: 'تكلفة التوصيل على المسار التراسلي (ج.م)',
    labelEn: 'Connection Cost (Transit)',
    color: 'purple',
    inputType: 'currency',
    required: false,
    order: 22,
    validation: { min: 0, message: 'يجب أن تكون قيمة موجبة' },
  },
  {
    csvColumn: 'المستند',
    label: 'المستند',
    labelEn: 'Document',
    color: 'purple',
    inputType: 'text',
    required: false,
    order: 23,
  },
];

// Helper: get fields by color
export const getBlueFields = () => FIELD_CONFIG.filter(f => f.color === 'blue');
export const getGreenFields = () => FIELD_CONFIG.filter(f => f.color === 'green');
export const getPurpleFields = () => FIELD_CONFIG.filter(f => f.color === 'purple');

// Helper: get all fields sorted by order
export const getSortedFields = () => [...FIELD_CONFIG].sort((a, b) => a.order - b.order);

// Helper: get field config by CSV column name
export const getFieldByColumn = (col: string) => FIELD_CONFIG.find(f => f.csvColumn === col);

// Type for a WE record using the CSV column names as keys
export type WeRecord = Record<string, string>;

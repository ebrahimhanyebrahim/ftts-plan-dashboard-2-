import * as XLSX from 'xlsx';
import type { SiteRecord, StatusType } from '../types/dashboard';

// Status normalizer for handling any Excel variations in Arabic/English
export function normalizeStatus(rawStatus: string): StatusType {
  if (!rawStatus) return 'جاري المعاينة';
  const s = String(rawStatus).trim().toLowerCase();

  if (s.includes('كهرب') || s.includes('elect')) {
    return 'جاري العمل كهربى';
  }
  if (s.includes('متعثر') || s.includes('stall') || s.includes('default')) {
    return 'متعثرات';
  }
  if (s.includes('مدن') || s.includes('civil')) {
    return 'جاري العمل مدني';
  }
  if (s.includes('معوق') || s.includes('عائق') || s.includes('obstac') || s.includes('issue') || s.includes('block')) {
    return 'معوقات';
  }
  if (s.includes('تسليم') || s.includes('تم') || s.includes('complet') || s.includes('finish') || s.includes('deliver') || s.includes('جاهز')) {
    return 'تم التسليم';
  }
  if (s.includes('معاين') || s.includes('survey') || s.includes('فحص')) {
    return 'جاري المعاينة';
  }
  if (s.includes('تصريح') || s.includes('تصاريح') || s.includes('permit') || s.includes('ترخيص')) {
    return 'جاري تصاريح';
  }

  return rawStatus.trim();
}

// Company normalizer (WE, Vodafone, Orange, etc.)
export function normalizeCompany(rawCompany: string): string {
  if (!rawCompany) return 'WE';
  const c = String(rawCompany).trim().toLowerCase();

  if (c.includes('voda') || c.includes('فودافون')) return 'Vodafone';
  if (c.includes('oran') || c.includes('أورانج') || c.includes('اورانج') || c.includes('موبينيل')) return 'Orange';
  if (c.includes('we') || c.includes('وي') || c.includes('مصرية') || c.includes('telecom egypt') || c.includes('te')) return 'WE';
  if (c.includes('etisalat') || c.includes('اتصالات') || c.includes('e&')) return 'Etisalat';

  return String(rawCompany).trim();
}

// Smart column finder
function findColumn(headers: string[], candidates: string[]): string | undefined {
  const normalizedHeaders = headers.map((h) => ({
    original: h,
    clean: String(h).toLowerCase().replace(/[\s\-_.]/g, ''),
  }));

  for (const candidate of candidates) {
    const cleanCand = candidate.toLowerCase().replace(/[\s\-_.]/g, '');
    const found = normalizedHeaders.find((h) => h.clean.includes(cleanCand) || cleanCand.includes(h.clean));
    if (found) return found.original;
  }
  return undefined;
}

export interface ParseExcelResult {
  sites: SiteRecord[];
  fileName: string;
  totalRows: number;
  detectedColumns: string[];
  companies: string[];
}

export function parseExcelFile(
  fileData: ArrayBuffer | string,
  fileName: string
): ParseExcelResult {
  const workbook = XLSX.read(fileData, { type: typeof fileData === 'string' ? 'string' : 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to JSON with headers
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

  if (jsonData.length === 0) {
    throw new Error('الملف فارغ أو لا يحتوي على صفوف بيانات.');
  }

  const detectedColumns = Object.keys(jsonData[0] || {});

  // Find column names
  const colSiteCode = findColumn(detectedColumns, ['sitecode', 'كودالموقع', 'كود', 'code', 'siteid', 'id']);
  const colSiteName = findColumn(detectedColumns, ['sitename', 'اسمالموقع', 'موقع', 'site', 'name', 'الاسم']);
  const colCompany = findColumn(detectedColumns, ['company', 'الشركة', 'مشغل', 'operator', 'telecom', 'جهة']);
  const colStatus = findColumn(detectedColumns, ['status', 'موقفالعام', 'الموقف', 'موقف', 'stage', 'phase', 'حالة']);
  const colLinks = findColumn(detectedColumns, ['nolinks', 'nsites', 'links', 'روابط', 'عددالروابط', 'مسارات', 'مسار']);
  const colSector = findColumn(detectedColumns, ['sector', 'القطاع', 'منطقة', 'محافظة', 'region']);
  const colCentral = findColumn(detectedColumns, ['central', 'الاسترال', 'السنترال', 'سنترال', 'exchange']);
  const colGeneralAdmin = findColumn(detectedColumns, ['generaladmin', 'الإداراتالعامه', 'الادارةالعامة', 'ادارةعامة']);
  const colCompetentAdmin = findColumn(detectedColumns, ['competentadmin', 'الإداراتالمختصة', 'الادارةالمختصة', 'ادارةمختصة']);
  const colClassification = findColumn(detectedColumns, ['classification', 'التصنيف', 'نوع', 'priority']);
  const colObstacle = findColumn(detectedColumns, ['obstaclereason', 'أسبابللتعذر', 'أسبابتأخر', 'سبب', 'معوق', 'تعذر', 'reason']);
  const colExpectedDate = findColumn(detectedColumns, ['expecteddate', 'التاريخالمتوقع', 'تاريخ', 'date', 'duedate']);
  const colContractor = findColumn(detectedColumns, ['contractor', 'المقاول', 'شركةالمقاولات', 'vendor']);

  const sites: SiteRecord[] = [];
  const companiesSet = new Set<string>();

  jsonData.forEach((row, index) => {
    const rawStatus = colStatus ? String(row[colStatus] || '') : 'جاري المعاينة';
    const status = normalizeStatus(rawStatus);

    const rawCompany = colCompany ? String(row[colCompany] || '') : 'WE';
    const company = normalizeCompany(rawCompany);
    companiesSet.add(company);

    let linksCount = 1;
    if (colLinks && row[colLinks]) {
      const parsed = parseInt(String(row[colLinks]), 10);
      if (!isNaN(parsed) && parsed > 0) linksCount = parsed;
    }

    const siteCode = colSiteCode && row[colSiteCode]
      ? String(row[colSiteCode])
      : `${company.substring(0, 3).toUpperCase()}-${String(index + 1).padStart(4, '0')}`;

    const siteName = colSiteName && row[colSiteName]
      ? String(row[colSiteName])
      : `موقع ${siteCode}`;

    const sector = colSector && row[colSector] ? String(row[colSector]) : 'القاهرة الكبرى';
    const central = colCentral && row[colCentral] ? String(row[colCentral]) : 'سنترال رئيسي';
    const generalAdmin = colGeneralAdmin && row[colGeneralAdmin] ? String(row[colGeneralAdmin]) : 'الإدارة العامة للمشروعات';
    const competentAdmin = colCompetentAdmin && row[colCompetentAdmin] ? String(row[colCompetentAdmin]) : 'إدارة التنفيذ والمسارات';
    const classification = colClassification && row[colClassification] ? String(row[colClassification]) : 'اعتيادي';
    const obstacleReason = colObstacle && row[colObstacle] ? String(row[colObstacle]) : (status === 'معوقات' || status === 'متعثرات' ? 'تأخر تصاريح' : 'لا يوجد تعذر');
    
    // Parse date
    let expectedDate = '2026-12-31';
    if (colExpectedDate && row[colExpectedDate]) {
      const val = row[colExpectedDate];
      if (typeof val === 'number') {
        // Excel serial date
        const jsDate = new Date(Math.round((val - 25569) * 86400 * 1000));
        expectedDate = jsDate.toISOString().slice(0, 10);
      } else {
        const str = String(val).trim();
        if (str.match(/^\d{4}-\d{2}-\d{2}$/)) {
          expectedDate = str;
        } else {
          expectedDate = str;
        }
      }
    }

    let progressPercent = 30;
    if (status === 'تم التسليم') progressPercent = 100;
    else if (status === 'جاري العمل كهربى') progressPercent = 85;
    else if (status === 'جاري العمل مدني') progressPercent = 60;
    else if (status === 'جاري تصاريح') progressPercent = 40;
    else if (status === 'جاري المعاينة') progressPercent = 20;
    else if (status === 'معوقات') progressPercent = 35;
    else if (status === 'متعثرات') progressPercent = 15;

    sites.push({
      id: `UPLOAD-${String(index + 1).padStart(4, '0')}`,
      siteCode,
      siteName,
      company,
      status,
      linksCount,
      sector,
      generalAdmin,
      competentAdmin,
      central,
      classification,
      obstacleReason,
      expectedDate,
      progressPercent,
      civilContractor: colContractor && row[colContractor] ? String(row[colContractor]) : 'المقاول المسند',
      notes: 'تم الاستيراد من ملف Excel',
    });
  });

  return {
    sites,
    fileName,
    totalRows: sites.length,
    detectedColumns,
    companies: Array.from(companiesSet),
  };
}

// Download sample Excel template
export function downloadSampleExcelTemplate() {
  const sampleRows = [
    {
      'كود الموقع': 'WE-CAI-001',
      'اسم الموقع': 'موقع سنترال الأوبرا 1',
      'الشركة': 'WE',
      'موقف العام': 'تم التسليم',
      'No. Links': 2,
      'القطاع': 'القاهرة الكبرى',
      'الاسترال': 'سنترال الأوبرا',
      'الإدارات العامه': 'الإدارة العامة لمشروعات FTTS',
      'الإدارات المختصة': 'إدارة تسليم وتشغيل المواقع',
      'التصنيف': 'VIP / فائق الأهمية',
      'التاريخ المتوقع للانتهاء': '2026-11-30',
      'أسباب التعذر': 'لا يوجد تعذر',
      'المقاول': 'المصرية لشبكات الفايبر',
    },
    {
      'كود الموقع': 'VOD-ALX-002',
      'اسم الموقع': 'موقع سموحة التجاري',
      'الشركة': 'Vodafone',
      'موقف العام': 'جاري تصاريح',
      'No. Links': 1,
      'القطاع': 'الإسكندرية ومطروح',
      'الاسترال': 'سنترال سموحة',
      'الإدارات العامه': 'الإدارة العامة لشبكات النقل',
      'الإدارات المختصة': 'إدارة التراخيص والتصاريح',
      'التصنيف': 'استراتيجي / Strategic',
      'التاريخ المتوقع للانتهاء': '2026-12-15',
      'أسباب التعذر': 'لا يوجد تعذر',
      'المقاول': 'المقاولون المتحدون',
    },
    {
      'كود الموقع': 'ORA-GZ-003',
      'اسم الموقع': 'موقع المهندسين الدائري',
      'الشركة': 'Orange',
      'موقف العام': 'معوقات',
      'No. Links': 2,
      'القطاع': 'القاهرة الكبرى',
      'الاسترال': 'سنترال المهندسين',
      'الإدارات العامه': 'الإدارة العامة للبنية التحتية',
      'الإدارات المختصة': 'إدارة التنفيذ المدني والمسارات',
      'التصنيف': 'مسار رئيسي / Backbone',
      'التاريخ المتوقع للانتهاء': '2027-01-20',
      'أسباب التعذر': 'تأخر تصاريح حي وهيئة الطرق',
      'المقاول': 'مصر للمشروعات الهندسية',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'FTTS_Data');

  XLSX.writeFile(workbook, 'FTTS_Plan_Upload_Template.xlsx');
}

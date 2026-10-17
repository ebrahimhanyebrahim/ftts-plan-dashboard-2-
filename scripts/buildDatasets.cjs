const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

function cleanStr(val) {
  if (val === undefined || val === null) return '';
  return String(val).trim();
}

function normalizeFttsStatus(raw) {
  const s = cleanStr(raw);
  if (!s) return 'جاري المعاينة';
  if (s.includes('تسليم') || s.includes('تم الانتهاء')) return 'تم التسليم';
  if (s.includes('تصاريح') || s.includes('تصريح')) return 'جاري تصاريح';
  if (s.includes('معوق')) return 'معوقات';
  if (s.includes('متعذر')) return 'متعثرات';
  if (s.includes('كهرب')) return 'جاري العمل كهربى';
  if (s.includes('مدن')) return 'جاري العمل مدني';
  if (s.includes('معاين')) return 'جاري المعاينة';
  return s;
}

function normalizeWeStatus(rawSiteStatus, rawMawqef) {
  const ss = cleanStr(rawSiteStatus).toUpperCase();
  const maw = cleanStr(rawMawqef);

  if (ss.includes('ON AIR') || maw.includes('تم الانتهاء') || maw.includes('تم التسليم')) {
    return 'تم التسليم';
  }
  if (maw.includes('تصاريح') || ss.includes('RDT') || maw.includes('طلب استخراج')) {
    return 'جاري تصاريح';
  }
  if (maw.includes('معوق') || ss.includes('PROBLEM') || maw.includes('عائق')) {
    return 'معوقات';
  }
  if (maw.includes('متعذر') || maw.includes('رفض') || maw.includes('تتجاوز')) {
    return 'متعثرات';
  }
  if (ss.includes('CWF') || maw.includes('مدن')) {
    return 'جاري العمل مدني';
  }
  if (maw.includes('كهرب')) {
    return 'جاري العمل كهربى';
  }
  if (ss.includes('ONGOING') || maw.includes('جارى العمل')) {
    return 'جاري العمل مدني';
  }
  return 'جاري المعاينة';
}

function normalizeEtahaStatus(tasleem, khareji) {
  const t = cleanStr(tasleem);
  const k = cleanStr(khareji);

  if (t === 'تم التسليم' || k.includes('تم الانتهاء') || k.includes('تم التنفيذ')) {
    return 'تم التسليم';
  }
  if (k.includes('تصاريح')) return 'جاري تصاريح';
  if (k.includes('معوق')) return 'معوقات';
  if (k.includes('متعذر')) return 'متعثرات';
  if (k.includes('كهرب')) return 'جاري العمل كهربى';
  if (k.includes('عمل') || k.includes('مدن')) return 'جاري العمل مدني';
  return 'جاري المعاينة';
}

function normalizeTahawolStatus(khareji, tasleem) {
  const k = cleanStr(khareji);
  const t = cleanStr(tasleem);

  if (t.includes('تم التسليم') || k.includes('تم التنفيذ')) return 'تم التسليم';
  if (k.includes('معاينة')) return 'جاري المعاينة';
  if (k.includes('تصاريح')) return 'جاري تصاريح';
  if (k.includes('مدني')) return 'جاري العمل مدني';
  if (k.includes('متعذر')) return 'متعثرات';
  if (k.includes('معوق')) return 'معوقات';
  return 'جاري المعاينة';
}

console.log('--- Processing ftts.xlsx ---');
const wbFtts = XLSX.readFile('C:/Users/Lap store/Downloads/eslam/ftts.xlsx');
const rawFtts = XLSX.utils.sheet_to_json(wbFtts.Sheets['All Ftts'] || wbFtts.Sheets[wbFtts.SheetNames[0]], { defval: '' });

const fttsSites = rawFtts.map((r, i) => {
  const company = cleanStr(r['الشركة']) || 'Vodafone';
  const status = normalizeFttsStatus(r['موقف العام']);
  const linksCount = parseInt(cleanStr(r['No. Links.'])) || 1;
  const siteCode = cleanStr(r['HUBID']) || `FTTS-${i + 1}`;
  const address = cleanStr(r['العنوان']);
  const siteName = address ? address.slice(0, 60) : `موقع ${siteCode}`;
  const central = cleanStr(r['سنترال الربط']) || cleanStr(r['المحافظه']) || 'سنترال رئيسي';
  const sector = cleanStr(r['القطاع']) || cleanStr(r['رئاسة القطاعات ']) || 'القاهرة الكبرى';
  const generalAdmin = cleanStr(r['الادارة العامة']) || 'الإدارة العامة لتنفيذ الشبكات';
  const competentAdmin = cleanStr(r['مسئوليه التنفيذ']) || 'إدارة التنفيذ والمسارات';
  const classification = cleanStr(r['العميل']) || 'FTTS Rollout';
  const obstacleReason = cleanStr(r['توضيح تفاصيل المعوق و المتعذر ']) || cleanStr(r['نوع المعوق المدني']) || 'لا يوجد تعذر';

  return {
    id: `FTTS-REAL-${i + 1}`,
    siteCode,
    siteName,
    company: company.includes('Orange') || company.includes('اورانج') ? 'Orange' : 'Vodafone',
    status,
    linksCount,
    sector,
    generalAdmin,
    competentAdmin,
    central,
    classification,
    obstacleReason: obstacleReason || 'لا يوجد تعذر',
    expectedDate: '2026-12-31',
    progressPercent: status === 'تم التسليم' ? 100 : status === 'جاري تصاريح' ? 40 : 25,
    civilContractor: cleanStr(r['تم التنفيذ بواسطة ']) || 'المقاول المعتمد',
    notes: cleanStr(r['ملاحظات عامه']),
  };
});
console.log(`Processed ${fttsSites.length} FTTS sites (Vodafone & Orange)`);

console.log('--- Processing We.xlsx ---');
const wbWe = XLSX.readFile('C:/Users/Lap store/Downloads/eslam/We.xlsx');
const rawWe = XLSX.utils.sheet_to_json(wbWe.Sheets['WE'], { defval: '' });

const weSites = rawWe.map((r, i) => {
  const status = normalizeWeStatus(r['Site Status'], r['الموقف طبقا لافادة قطاعات التنفيذ']);
  const siteCode = cleanStr(r['site code']) || `WE-${i + 1}`;
  const region = cleanStr(r['Region']) || 'القاهرة الكبرى';
  const zone = cleanStr(r['Zone']) || 'المنطقة الأولى';
  const area = cleanStr(r['Area']) || 'سنترال رئيسي';
  const obstacleReason = cleanStr(r['اسباب التعذر']) || 'لا يوجد تعذر';

  return {
    id: `WE-REAL-${i + 1}`,
    siteCode,
    siteName: `برج WE رقم ${siteCode} - ${area}`,
    company: 'WE',
    status,
    linksCount: 1,
    sector: region,
    generalAdmin: cleanStr(r['الادارة العامة لتنفيذ الشبكات']) || 'الإدارة العامة لتنفيذ شبكات WE',
    competentAdmin: zone,
    central: area,
    classification: cleanStr(r['التصنيف']) || cleanStr(r['Type']) || 'برج محمول رئيسي',
    obstacleReason: obstacleReason || 'لا يوجد تعذر',
    expectedDate: '2026-12-31',
    progressPercent: status === 'تم التسليم' ? 100 : 35,
    civilContractor: 'المصرية للاتصالات',
    notes: cleanStr(r['الجهة المطلوب الدعم منها']),
  };
});
console.log(`Processed ${weSites.length} WE sites`);

console.log('--- Processing الاتاحه .xlsx ---');
const wbEtaha = XLSX.readFile('C:/Users/Lap store/Downloads/eslam/الاتاحه .xlsx');
const rawEtaha = XLSX.utils.sheet_to_json(wbEtaha.Sheets['Details (2)'], { defval: '' });

const etahaSites = rawEtaha.map((r, i) => {
  const status = normalizeEtahaStatus(r['موقف التسليم'], r['المسار الخارجي']);
  const siteCode = cleanStr(r['Code']) || `ETAH-${i + 1}`;
  const client = cleanStr(r['اسم العميل']) || 'عميل إتاحة';
  const branch = cleanStr(r['اسم الفرع']);
  const siteName = branch && branch !== '0' ? `${client} - ${branch}` : client;
  const obstacleReason = cleanStr(r['سبب المعوق او التعذر']) || cleanStr(r['ملحوظه في حاله عدم الانتهاء']) || 'لا يوجد تعذر';
  let expectedDate = cleanStr(r['تاريخ الانتهاء']) || cleanStr(r['تاريخ التسليم ']) || '2026-12-31';
  if (typeof r['تاريخ التسليم '] === 'number') {
    const jsDate = new Date(Math.round((r['تاريخ التسليم '] - 25569) * 86400 * 1000));
    expectedDate = jsDate.toISOString().slice(0, 10);
  }

  return {
    id: `ETAH-${i + 1}`,
    siteCode,
    siteName: siteName.slice(0, 80),
    company: 'الاتاحة (Availability)',
    status,
    linksCount: 1,
    sector: cleanStr(r['القطاعات']) || 'القاهرة الكبرى',
    generalAdmin: cleanStr(r['الادارة العامة المنفذة']) || 'إدارة تنفيذ شبكات الإتاحة',
    competentAdmin: cleanStr(r['ادارة التنفيذ']) || cleanStr(r['قطاع التنفيذ']) || 'إدارة التنفيذ',
    central: cleanStr(r['المحافظة']) || 'سنترال رئيسي',
    classification: cleanStr(r['التصنيف']) || 'مشروع إتاحة الخدمة',
    obstacleReason: obstacleReason || 'لا يوجد تعذر',
    expectedDate: expectedDate.slice(0, 10),
    progressPercent: status === 'تم التسليم' ? 100 : 30,
    civilContractor: cleanStr(r['مسئوليه التنفيذ']) || 'فريق التنفيذ',
    notes: cleanStr(r['ملحوظه في حاله عدم الانتهاء']),
  };
});
console.log(`Processed ${etahaSites.length} Etaha sites`);

console.log('--- Processing بيان التحول الرقمى.xlsx ---');
const wbTahawol = XLSX.readFile('C:/Users/Lap store/Downloads/eslam/بيان التحول الرقمى.xlsx');
const rawTahawol = XLSX.utils.sheet_to_json(wbTahawol.Sheets['Digital Transformation'], { defval: '' });

const tahawolSites = rawTahawol.map((r, i) => {
  const status = normalizeTahawolStatus(r['المسار الخارجي'], r['موقف التسليم']);
  const siteCode = cleanStr(r['الكود']) || `DIGI-${i + 1}`;
  const ministry = cleanStr(r['اسم الوزارة']) || 'وزارة حكومية';
  const building = cleanStr(r['المبنى']) || cleanStr(r['الجهة']) || 'مبنى حكومي';
  const siteName = `${ministry} - ${building}`;
  const obstacleReason = cleanStr(r[' ( المعوقات / المتعذرات ) المسار الخارجي']) || cleanStr(r[' ( المعوقات / المتعذرات ) المسار الداخلي ']) || 'لا يوجد تعذر';

  return {
    id: `DIGI-${i + 1}`,
    siteCode,
    siteName: siteName.slice(0, 80),
    company: 'التحول الرقمي (Digital)',
    status,
    linksCount: 1,
    sector: cleanStr(r['القطاع']) || cleanStr(r['رئاسة القطاعات']) || 'القاهرة الكبرى',
    generalAdmin: cleanStr(r['الادارة العامة للتنفيذ']) || 'الإدارة العامة للتحول الرقمي',
    competentAdmin: cleanStr(r['اداره التنفيذ المختصة']) || 'إدارة التنفيذ المختصة',
    central: cleanStr(r['سنترال الربط']) || cleanStr(r['المحافظة']) || 'سنترال الربط',
    classification: ministry,
    obstacleReason: obstacleReason || 'لا يوجد تعذر',
    expectedDate: cleanStr(r['تاريخ لنهو الموقع']).slice(0, 10) || '2026-12-31',
    progressPercent: status === 'تم التسليم' ? 100 : 45,
    civilContractor: cleanStr(r['مسئولية المسار الداخلي']) || 'المصرية للاتصالات',
    notes: cleanStr(r['ملاحظات المسار الخارجي']),
  };
});
console.log(`Processed ${tahawolSites.length} Digital Transformation sites`);

// Output ts file
const outContent = `// Pre-loaded datasets directly generated from user Excel files:
// 1. ftts.xlsx (Orange & Vodafone)
// 2. We.xlsx (WE)
// 3. الاتاحه .xlsx (Availability Project)
// 4. بيان التحول الرقمى.xlsx (Digital Transformation Project)

import type { SiteRecord } from '../types/dashboard';

export const FTTS_EXCEL_SITES: SiteRecord[] = ${JSON.stringify(fttsSites, null, 2)};
export const WE_EXCEL_SITES: SiteRecord[] = ${JSON.stringify(weSites, null, 2)};
export const ETAHA_EXCEL_SITES: SiteRecord[] = ${JSON.stringify(etahaSites, null, 2)};
export const TAHAWOL_EXCEL_SITES: SiteRecord[] = ${JSON.stringify(tahawolSites, null, 2)};
`;

fs.writeFileSync('src/data/preloadedProjects.ts', outContent, 'utf-8');
console.log('Successfully written src/data/preloadedProjects.ts!');

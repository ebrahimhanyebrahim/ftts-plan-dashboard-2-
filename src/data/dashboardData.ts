import type { SiteRecord, StatusSummary, StatusType } from '../types/dashboard';

export const STATUS_CONFIG: Record<
  string,
  {
    en: string;
    color: string;
    bgLight: string;
    border: string;
    textColor: string;
  }
> = {
  'جاري تصاريح': {
    en: 'Permits in Progress',
    color: '#0284c7', // Sky Blue
    bgLight: '#e0f2fe',
    border: '#38bdf8',
    textColor: '#0369a1',
  },
  'جاري المعاينة': {
    en: 'Survey in Progress',
    color: '#0d9488', // Teal
    bgLight: '#ccfbf1',
    border: '#2dd4bf',
    textColor: '#0f766e',
  },
  'تم التسليم': {
    en: 'Handed Over / Completed',
    color: '#16a34a', // Emerald Green
    bgLight: '#dcfce7',
    border: '#4ade80',
    textColor: '#15803d',
  },
  'معوقات': {
    en: 'Obstacles',
    color: '#ea580c', // Dark Orange
    bgLight: '#ffedd5',
    border: '#fb923c',
    textColor: '#c2410c',
  },
  'جاري العمل مدني': {
    en: 'Civil Work in Progress',
    color: '#4f46e5', // Indigo
    bgLight: '#e0e7ff',
    border: '#818cf8',
    textColor: '#3730a3',
  },
  'متعثرات': {
    en: 'Stalled / Defaulted',
    color: '#dc2626', // Bright Crimson Red
    bgLight: '#fee2e2',
    border: '#f87171',
    textColor: '#b91c1c',
  },
  'جاري العمل كهربى': {
    en: 'Electrical Work in Progress',
    color: '#d97706', // Amber Gold
    bgLight: '#fef3c7',
    border: '#fcd34d',
    textColor: '#b45309',
  },
};

// Fallback palette for any unexpected statuses in uploaded Excel sheets
export const EXTRA_PALETTE = [
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#64748b', '#14b8a6', '#f43f5e'
];

export const COMPANY_CONFIG: Record<
  string,
  {
    nameAr: string;
    nameEn: string;
    color: string;
    activeBorder: string;
    badgeBg: string;
    badgeText: string;
    brandDot: string;
  }
> = {
  All: {
    nameAr: 'جميع الشركات',
    nameEn: 'All Operators',
    color: 'hover:border-slate-400',
    activeBorder: 'border-slate-800 bg-slate-900 text-white shadow-md ring-2 ring-slate-800/20',
    badgeBg: 'bg-slate-100 text-slate-700',
    badgeText: 'text-slate-600',
    brandDot: 'bg-blue-600',
  },
  WE: {
    nameAr: 'WE',
    nameEn: 'المصرية للاتصالات',
    color: 'hover:border-purple-400',
    activeBorder: 'border-purple-600 bg-gradient-to-br from-purple-700 to-indigo-800 text-white shadow-md ring-2 ring-purple-500/20',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    badgeText: 'text-purple-600',
    brandDot: 'bg-purple-600',
  },
  Vodafone: {
    nameAr: 'Vodafone',
    nameEn: 'فودافون مصر',
    color: 'hover:border-rose-400',
    activeBorder: 'border-rose-600 bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-md ring-2 ring-rose-500/20',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    badgeText: 'text-rose-600',
    brandDot: 'bg-red-600',
  },
  Orange: {
    nameAr: 'Orange',
    nameEn: 'أورانج مصر',
    color: 'hover:border-orange-400',
    activeBorder: 'border-orange-500 bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md ring-2 ring-orange-500/20',
    badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
    badgeText: 'text-orange-600',
    brandDot: 'bg-orange-500',
  },
};

export const SECTORS = [
  'القاهرة الكبرى',
  'الإسكندرية ومطروح',
  'الدلتا',
  'القناة وسيناء',
  'صعيد مصر',
];

export const GENERAL_ADMINS = [
  'الإدارة العامة لمشروعات FTTS',
  'الإدارة العامة لشبكات النقل',
  'الإدارة العامة للبنية التحتية',
  'الإدارة العامة للتشغيل ومراقبة الجودة',
];

export const COMPETENT_ADMINS = [
  'إدارة التراخيص والتصاريح',
  'إدارة المعاينات المساحية والتصميم',
  'إدارة التنفيذ المدني والمسارات',
  'إدارة التركيبات الكهروميكانيكية',
  'إدارة تسليم وتشغيل المواقع',
];

export const CENTRALS = [
  'سنترال الأوبرا',
  'سنترال المعادي',
  'سنترال مدينة نصر',
  'سنترال المهندسين',
  'سنترال سموحة',
  'سنترال المنصورة',
  'سنترال طنطا',
  'سنترال الإسماعيلية',
  'سنترال أسيوط',
  'سنترال الزقازيق',
];

export const CLASSIFICATIONS = [
  'VIP / فائق الأهمية',
  'استراتيجي / Strategic',
  'مسار رئيسي / Backbone',
  'مشروع اعتيادي / Standard',
];

export const OBSTACLE_REASONS = [
  'لا يوجد تعذر',
  'تأخر تصاريح حي وهيئة الطرق',
  'اعتراضات أهالي ومواطنين',
  'تعارض مسار مع خطوط مرافق غاز ومياه',
  'اشتراطات خاصة بالبيئة والآثار',
  'مشاكل تعاقدية وتوريدات مقاول',
];

// Helper to seed deterministic records summing EXACTLY to 121 sites and 185 links
function generateDetailedSites(): SiteRecord[] {
  const records: SiteRecord[] = [];

  const statusDefinitions: {
    status: StatusType;
    count: number;
    targetLinks: number;
    companies: ('Vodafone' | 'Orange' | 'WE')[];
    obstaclePool: string[];
    defaultDates: string[];
  }[] = [
    {
      status: 'جاري العمل كهربى',
      count: 3,
      targetLinks: 5, // 2, 2, 1
      companies: ['WE', 'Vodafone', 'Orange'],
      obstaclePool: ['لا يوجد تعذر'],
      defaultDates: ['2026-11-15', '2026-11-20', '2026-12-05'],
    },
    {
      status: 'متعثرات',
      count: 4,
      targetLinks: 8, // 2, 2, 2, 2
      companies: ['WE', 'Orange', 'Vodafone', 'WE'],
      obstaclePool: [
        'اعتراضات أهالي ومواطنين',
        'تأخر تصاريح حي وهيئة الطرق',
        'تعارض مسار مع خطوط مرافق غاز ومياه',
        'مشاكل تعاقدية وتوريدات مقاول',
      ],
      defaultDates: ['2027-01-30', '2027-02-15', '2027-01-10', '2027-03-01'],
    },
    {
      status: 'جاري العمل مدني',
      count: 5,
      targetLinks: 6, // 2, 1, 1, 1, 1
      companies: ['WE', 'Vodafone', 'Orange', 'WE', 'Vodafone'],
      obstaclePool: ['لا يوجد تعذر'],
      defaultDates: ['2026-11-25', '2026-11-30', '2026-12-10', '2026-12-15', '2026-12-20'],
    },
    {
      status: 'معوقات',
      count: 14,
      targetLinks: 22, // 8 sites with 2 links (16), 6 sites with 1 link (6) -> 22 links
      companies: [
        'WE', 'Orange', 'Vodafone', 'WE', 'Vodafone', 'Orange', 'WE',
        'Orange', 'Vodafone', 'WE', 'Vodafone', 'Vodafone', 'WE', 'Orange'
      ],
      obstaclePool: [
        'تأخر تصاريح حي وهيئة الطرق',
        'اعتراضات أهالي ومواطنين',
        'تعارض مسار مع خطوط مرافق غاز ومياه',
        'اشتراطات خاصة بالبيئة والآثار',
        'مشاكل تعاقدية وتوريدات مقاول',
      ],
      defaultDates: [
        '2026-12-15', '2026-12-20', '2027-01-10', '2026-12-30', '2027-01-15',
        '2027-01-20', '2027-02-01', '2026-12-25', '2027-01-05', '2027-02-10',
        '2026-12-18', '2027-01-25', '2027-02-05', '2027-01-12'
      ],
    },
    {
      status: 'تم التسليم',
      count: 24,
      targetLinks: 28, // 4 sites with 2 links (8), 20 sites with 1 link (20) -> 28 links
      companies: [
        'WE', 'Vodafone', 'Orange', 'WE', 'Vodafone', 'WE', 'Orange', 'Vodafone',
        'Orange', 'WE', 'Vodafone', 'Orange', 'Vodafone', 'WE', 'Vodafone', 'Orange',
        'Vodafone', 'WE', 'Orange', 'Vodafone', 'WE', 'Orange', 'Vodafone', 'WE'
      ],
      obstaclePool: ['لا يوجد تعذر'],
      defaultDates: [
        '2026-09-10', '2026-09-15', '2026-09-20', '2026-09-25', '2026-10-01',
        '2026-10-05', '2026-10-10', '2026-10-12', '2026-10-14', '2026-10-15',
        '2026-10-18', '2026-10-20', '2026-10-22', '2026-10-25', '2026-10-28',
        '2026-10-30', '2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04',
        '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08'
      ],
    },
    {
      status: 'جاري المعاينة',
      count: 30,
      targetLinks: 53, // 23 sites with 2 links (46), 7 sites with 1 link (7) -> 53 links
      companies: [
        'WE', 'Orange', 'Vodafone', 'WE', 'Orange', 'Vodafone', 'WE', 'Orange',
        'Vodafone', 'WE', 'Orange', 'Vodafone', 'Orange', 'WE', 'Vodafone', 'Orange',
        'WE', 'Vodafone', 'WE', 'Orange', 'Vodafone', 'WE', 'Orange', 'Vodafone',
        'WE', 'Orange', 'Vodafone', 'WE', 'Orange', 'Vodafone'
      ],
      obstaclePool: ['لا يوجد تعذر'],
      defaultDates: [
        '2026-11-10', '2026-11-12', '2026-11-14', '2026-11-16', '2026-11-18',
        '2026-11-20', '2026-11-22', '2026-11-24', '2026-11-26', '2026-11-28',
        '2026-11-30', '2026-12-02', '2026-12-04', '2026-12-06', '2026-12-08',
        '2026-12-10', '2026-12-12', '2026-12-14', '2026-12-16', '2026-12-18',
        '2026-12-20', '2026-12-22', '2026-12-24', '2026-12-26', '2026-12-28',
        '2026-12-30', '2027-01-02', '2027-01-04', '2027-01-06', '2027-01-08'
      ],
    },
    {
      status: 'جاري تصاريح',
      count: 41,
      targetLinks: 63, // 22 sites with 2 links (44), 19 sites with 1 link (19) -> 63 links
      companies: [
        'Vodafone', 'WE', 'Orange', 'Vodafone', 'WE', 'Orange', 'Vodafone', 'WE',
        'Orange', 'Vodafone', 'WE', 'Orange', 'Vodafone', 'WE', 'Orange', 'Vodafone',
        'WE', 'Orange', 'Vodafone', 'WE', 'Orange', 'Vodafone', 'WE', 'Orange',
        'Vodafone', 'WE', 'Orange', 'Vodafone', 'WE', 'Orange', 'Vodafone', 'WE',
        'Orange', 'Vodafone', 'WE', 'Orange', 'Vodafone', 'WE', 'Orange', 'Vodafone',
        'WE'
      ],
      obstaclePool: ['لا يوجد تعذر'],
      defaultDates: [
        '2026-12-01', '2026-12-03', '2026-12-05', '2026-12-07', '2026-12-09',
        '2026-12-11', '2026-12-13', '2026-12-15', '2026-12-17', '2026-12-19',
        '2026-12-21', '2026-12-23', '2026-12-25', '2026-12-27', '2026-12-29',
        '2026-12-31', '2027-01-03', '2027-01-05', '2027-01-07', '2027-01-09',
        '2027-01-11', '2027-01-13', '2027-01-15', '2027-01-17', '2027-01-19',
        '2027-01-21', '2027-01-23', '2027-01-25', '2027-01-27', '2027-01-29',
        '2027-01-31', '2027-02-02', '2027-02-04', '2027-02-06', '2027-02-08',
        '2027-02-10', '2027-02-12', '2027-02-14', '2027-02-16', '2027-02-18',
        '2027-02-20'
      ],
    },
  ];

  let idCounter = 1;

  for (const group of statusDefinitions) {
    const linksDistribution: number[] = [];
    const count = group.count;
    const target = group.targetLinks;
    const twoLinksCount = target - count;
    for (let i = 0; i < count; i++) {
      linksDistribution.push(i < twoLinksCount ? 2 : 1);
    }

    for (let i = 0; i < group.count; i++) {
      const company = group.companies[i % group.companies.length];
      const sector = SECTORS[i % SECTORS.length];
      const generalAdmin = GENERAL_ADMINS[i % GENERAL_ADMINS.length];
      const competentAdmin = COMPETENT_ADMINS[i % COMPETENT_ADMINS.length];
      const central = CENTRALS[i % CENTRALS.length];
      const classification = CLASSIFICATIONS[i % CLASSIFICATIONS.length];
      const obstacleReason = group.obstaclePool[i % group.obstaclePool.length];
      const expectedDate = group.defaultDates[i] || '2026-12-31';

      let progressPercent = 0;
      switch (group.status) {
        case 'تم التسليم':
          progressPercent = 100;
          break;
        case 'جاري العمل كهربى':
          progressPercent = 85;
          break;
        case 'جاري العمل مدني':
          progressPercent = 60;
          break;
        case 'جاري تصاريح':
          progressPercent = 35;
          break;
        case 'جاري المعاينة':
          progressPercent = 20;
          break;
        case 'معوقات':
          progressPercent = 40;
          break;
        case 'متعثرات':
          progressPercent = 15;
          break;
      }

      const prefix = company === 'Orange' ? 'ORA' : company === 'Vodafone' ? 'VOD' : 'WE';

      records.push({
        id: `FTTS-${String(idCounter).padStart(4, '0')}`,
        siteCode: `${prefix}-${central.replace('سنترال ', '').substring(0, 3)}-${String(idCounter).padStart(3, '0')}`,
        siteName: `موقع ${central.replace('سنترال ', '')} ${i + 1}`,
        company,
        status: group.status,
        linksCount: linksDistribution[i],
        sector,
        generalAdmin,
        competentAdmin,
        central,
        classification,
        obstacleReason,
        expectedDate,
        progressPercent,
        civilContractor: ['المصرية لشبكات الفايبر', 'المقاولون المتحدون', 'مصر للمشروعات الهندسية', 'سيسكو فايبر'][i % 4],
        notes: group.status === 'معوقات' || group.status === 'متعثرات' 
          ? `متابعة حل ${obstacleReason} مع الجهة المعنية`
          : 'العمل جاري طبقاً للجدول الزمني المعتمد',
      });

      idCounter++;
    }
  }

  return records;
}

export const INITIAL_SITES_DATA: SiteRecord[] = generateDetailedSites();

export const BASELINE_TOTAL_SITES = 121;
export const BASELINE_TOTAL_LINKS = 185;

// Helper to compute status summaries dynamically based on any filtered or uploaded list of sites
export function calculateStatusSummaries(sites: SiteRecord[]): StatusSummary[] {
  const standardOrder: StatusType[] = [
    'جاري العمل كهربى',
    'متعثرات',
    'جاري العمل مدني',
    'معوقات',
    'تم التسليم',
    'جاري المعاينة',
    'جاري تصاريح',
  ];

  // Discover all unique statuses in the dataset
  const uniqueStatusesInSites = Array.from(new Set(sites.map((s) => s.status)));
  
  // Combine standard statuses first, then any extra custom statuses found
  const allStatuses = [
    ...standardOrder,
    ...uniqueStatusesInSites.filter((s) => !standardOrder.includes(s)),
  ];

  const totalSites = sites.length || 1;

  return allStatuses
    .map((status, idx) => {
      const matching = sites.filter((s) => s.status === status);
      const sitesCount = matching.length;
      const linksCount = matching.reduce((sum, s) => sum + s.linksCount, 0);
      const percentage = Number(((sitesCount / totalSites) * 100).toFixed(1));

      const config = STATUS_CONFIG[status] || {
        en: status,
        color: EXTRA_PALETTE[idx % EXTRA_PALETTE.length],
        bgLight: '#f1f5f9',
        border: '#cbd5e1',
        textColor: '#334155',
      };

      return {
        status,
        statusEn: config.en,
        sitesCount,
        linksCount,
        percentage,
        color: config.color,
        badgeBg: config.bgLight,
        borderColor: config.border,
      };
    })
    .filter((s) => s.sitesCount > 0 || standardOrder.includes(s.status));
}

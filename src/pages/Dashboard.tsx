import { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { KpiCards } from '../components/KpiCards';
import { CompanySelector } from '../components/CompanySelector';
import type { CompanyStatItem } from '../components/CompanySelector';
import { DonutChart } from '../components/DonutChart';
import { SummaryTable } from '../components/SummaryTable';
import { Filters } from '../components/Filters';
import { SiteDetailsModal } from '../components/SiteDetailsModal';
import { ExcelUploaderModal } from '../components/ExcelUploaderModal';
import { ProjectTabs } from '../components/ProjectTabs';
import type { ActiveProjectScope } from '../components/ProjectTabs';
import { WeAddDataModal } from '../components/WeAddDataModal';
import { WeDataAnalysisModal } from '../components/WeDataAnalysisModal';
import { WeDataManagerModal } from '../components/WeDataManagerModal';
import { useWeRecords, useWeSiteCodes, exportToCSV } from '../hooks/useWeAPI';
import type { WeRecord } from '../config/fieldConfig';


import { 
  calculateStatusSummaries 
} from '../data/dashboardData';
import {
  FTTS_EXCEL_SITES,
  WE_EXCEL_SITES,
  ETAHA_EXCEL_SITES,
  TAHAWOL_EXCEL_SITES,
} from '../data/preloadedProjects';
import type { 
  FilterState, 
  KpiData,
  SiteRecord,
  StatusType,
  UploadedFileMetadata
} from '../types/dashboard';

const initialFilters: FilterState = {
  company: 'All',
  sector: '',
  generalAdmin: '',
  competentAdmin: '',
  central: '',
  classification: '',
  obstacleReason: '',
  status: '',
  expectedDate: '',
  searchQuery: '',
};

// Helper: Map a dynamic WeRecord from Supabase to SiteRecord format for dashboard
function mapWeRecordToSiteRecord(r: WeRecord, index = 0): SiteRecord {
  const siteCode = r['site code'] || (r as any).site_code || `WE-${index + 1}`;
  const rawStatus = r['Site Status'] || '';
  const rawTasneef = r['التصنيف'] || '';
  
  let status: StatusType = 'جاري المعاينة';
  const ss = String(rawStatus).toUpperCase();
  const tasneef = String(rawTasneef);

  if (tasneef.includes('معوق')) {
    status = 'معوقات';
  } else if (tasneef.includes('متعذر') || tasneef.includes('متعثر') || tasneef.includes('رفض')) {
    status = 'متعثرات';
  } else if (tasneef.includes('تصاريح') || ss.includes('RDT') || tasneef.includes('طلب استخراج')) {
    status = 'جاري تصاريح';
  } else if (tasneef.includes('كهرب')) {
    status = 'جاري العمل كهربى';
  } else if (tasneef.includes('مدن') || ss.includes('CWF') || ss.includes('ONGOING')) {
    status = 'جاري العمل مدني';
  } else if (tasneef.includes('معاين')) {
    status = 'جاري المعاينة';
  } else if (tasneef.includes('تشغيل') || tasneef.includes('انتهاء') || tasneef.includes('تسليم') || ss.includes('ON AIR')) {
    status = 'تم التسليم';
  }

  const central = r['السنترال'] || r['اداره التنفيذ المختصه'] || r['Zone'] || 'سنترال رئيسي';
  const sector = r['Exc sector'] || r['Sectores'] || r['Exc Sectores'] || 'القاهرة الكبرى';
  const generalAdmin = r['اداره التنفيذ المختصه'] || r['Exc Zone'] || 'الإدارة العامة لتنفيذ شبكات WE';
  const competentAdmin = r['Zone'] || r['Sectore'] || 'المنطقة الأولى';
  const classification = r['التصنيف'] || r['Type'] || 'برج محمول رئيسي';
  const obstacleReason = r['اسباب التعذر'] || 'لا يوجد تعذر';
  const expectedDate = r['التاريخ المتوقع للانتهاء'] || '2026-12-31';

  return {
    id: r._id || `WE-LIVE-${index + 1}`,
    siteCode,
    siteName: central && central !== 'سنترال رئيسي' ? `برج WE رقم ${siteCode} - ${central}` : `برج WE رقم ${siteCode}`,
    company: 'WE',
    status,
    linksCount: 1,
    sector,
    generalAdmin,
    competentAdmin,
    central,
    classification,
    obstacleReason,
    expectedDate,
    progressPercent: status === 'تم التسليم' ? 100 : status === 'جاري تصاريح' ? 40 : status === 'جاري العمل مدني' ? 60 : 35,
    civilContractor: 'المصرية للاتصالات',
    notes: r['الجهة المطلوب الدعم منها'] || r['المستند'] || '',
  };
}

export const Dashboard: React.FC = () => {
  // Current active project scope: FTTS, ETAHA, TAHAWOL, or UPLOADED
  const [activeScope, setActiveScope] = useState<ActiveProjectScope>('FTTS');

  // Custom uploaded file states
  const [uploadedSites, setUploadedSites] = useState<SiteRecord[]>([]);
  const [uploadedMetadata, setUploadedMetadata] = useState<UploadedFileMetadata | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // WE specific UI states
  const [isWeAnalysisOpen, setIsWeAnalysisOpen] = useState(false);
  const [isWeAddDataOpen, setIsWeAddDataOpen] = useState(false);
  const [isWeManagerOpen, setIsWeManagerOpen] = useState(false);
  const [editingSiteCode, setEditingSiteCode] = useState<string | undefined>(undefined);

  // Live WE records and site codes from Supabase cloud database
  const { records: weCentralRecords, loading: weRecordsLoading, refetch: refetchWeRecords } = useWeRecords();
  const { codes: weCentralCodes, loading: weCodesLoading, refetch: refetchWeCodes } = useWeSiteCodes();

  // Convert live Supabase WE records to SiteRecord format
  const liveWeSites = useMemo<SiteRecord[]>(() => {
    if (weCentralRecords && weCentralRecords.length > 0) {
      return weCentralRecords.map((r, i) => mapWeRecordToSiteRecord(r, i));
    }
    return WE_EXCEL_SITES;
  }, [weCentralRecords]);

  // Combined FTTS dataset: Vodafone + Orange + Live dynamic WE dataset
  const combinedFttsSites = useMemo<SiteRecord[]>(() => {
    return [...FTTS_EXCEL_SITES, ...liveWeSites];
  }, [liveWeSites]);

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [modalFilterStatus, setModalFilterStatus] = useState<string | undefined>(undefined);

  // Active base dataset according to selected project scope
  const currentScopeData = useMemo(() => {
    switch (activeScope) {
      case 'FTTS':
        return combinedFttsSites;
      case 'ETAHA':
        return ETAHA_EXCEL_SITES;
      case 'TAHAWOL':
        return TAHAWOL_EXCEL_SITES;
      case 'UPLOADED':
        return uploadedSites.length > 0 ? uploadedSites : combinedFttsSites;
      default:
        return combinedFttsSites;
    }
  }, [activeScope, uploadedSites, combinedFttsSites]);

  // Dynamic filter application across current scope
  const filteredSites = useMemo(() => {
    return currentScopeData.filter((site) => {
      // 1. Company / Category Filter
      if (filters.company !== 'All') {
        if (activeScope === 'FTTS') {
          if (site.company !== filters.company) return false;
        } else if (activeScope === 'ETAHA') {
          // Filter by client category or classification
          if (filters.company === 'التعليم' && !site.siteName.includes('التربية والتعليم') && !site.classification.includes('تعليم')) return false;
          if (filters.company === 'البنوك' && !site.siteName.includes('بنك') && !site.siteName.includes('مصرف') && !site.siteName.includes('الأهلي') && !site.siteName.includes('مصر')) return false;
          if (filters.company === 'الجمارك والضرائب' && !site.siteName.includes('جمارك') && !site.siteName.includes('ضرائب')) return false;
        } else if (activeScope === 'TAHAWOL') {
          // Filter by ministry
          if (filters.company === 'الداخلية' && !site.siteName.includes('الداخلية') && !site.classification.includes('الداخلية')) return false;
          if (filters.company === 'العدل' && !site.siteName.includes('العدل') && !site.classification.includes('العدل')) return false;
          if (filters.company === 'الصحة' && !site.siteName.includes('الصحة') && !site.classification.includes('الصحة')) return false;
        } else if (site.company !== filters.company) {
          return false;
        }
      }

      // 2. Status Filter
      if (filters.status && site.status !== filters.status) {
        return false;
      }
      // 3. Expected Date Filter
      if (filters.expectedDate && site.expectedDate > filters.expectedDate) {
        return false;
      }
      // 4. Sector Filter
      if (filters.sector && site.sector !== filters.sector) {
        return false;
      }
      // 5. General Admin Filter
      if (filters.generalAdmin && site.generalAdmin !== filters.generalAdmin) {
        return false;
      }
      // 6. Competent Admin Filter
      if (filters.competentAdmin && site.competentAdmin !== filters.competentAdmin) {
        return false;
      }
      // 7. Central / Exchange Filter
      if (filters.central && site.central !== filters.central) {
        return false;
      }
      // 8. Classification Filter
      if (filters.classification && site.classification !== filters.classification) {
        return false;
      }
      // 9. Obstacle Reason Filter
      if (filters.obstacleReason && site.obstacleReason !== filters.obstacleReason) {
        return false;
      }

      return true;
    });
  }, [currentScopeData, filters, activeScope]);

  // Compute status breakdown table and donut chart data
  const statusSummaries = useMemo(() => {
    return calculateStatusSummaries(filteredSites);
  }, [filteredSites]);

  // Compute live KPIs
  const kpis: KpiData = useMemo(() => {
    const totalSites = filteredSites.length;
    const totalLinks = filteredSites.reduce((sum, s) => sum + s.linksCount, 0);
    const completedSites = filteredSites.filter((s) => s.status === 'تم التسليم').length;
    const permitsCount = filteredSites.filter((s) => s.status === 'جاري تصاريح').length;
    const obstaclesCount = filteredSites.filter((s) => s.status === 'معوقات').length;
    const stalledCount = filteredSites.filter((s) => s.status === 'متعثرات').length;
    const inProgressSites = totalSites - completedSites;
    const completionRate = totalSites > 0 
      ? Number(((completedSites / totalSites) * 100).toFixed(1)) 
      : 0;

    return {
      totalSites,
      totalLinks,
      completedSites,
      permitsCount,
      obstaclesCount,
      stalledCount,
      completionRate,
      inProgressSites,
    };
  }, [filteredSites]);

  // FTTS Operator cards stats
  const companyStats = useMemo(() => {
    const weSites = combinedFttsSites.filter((s) => s.company === 'WE');
    const vodafoneSites = combinedFttsSites.filter((s) => s.company === 'Vodafone');
    const orangeSites = combinedFttsSites.filter((s) => s.company === 'Orange');

    return {
      allCount: combinedFttsSites.length,
      allLinks: combinedFttsSites.reduce((sum, s) => sum + s.linksCount, 0),
      weCount: weSites.length,
      weLinks: weSites.reduce((sum, s) => sum + s.linksCount, 0),
      vodafoneCount: vodafoneSites.length,
      vodafoneLinks: vodafoneSites.reduce((sum, s) => sum + s.linksCount, 0),
      orangeCount: orangeSites.length,
      orangeLinks: orangeSites.reduce((sum, s) => sum + s.linksCount, 0),
    };
  }, [combinedFttsSites]);

  // Custom cards for Etaha and Tahawol scopes
  const customScopeCards: CompanyStatItem[] | undefined = useMemo(() => {
    if (activeScope === 'ETAHA') {
      const allCount = ETAHA_EXCEL_SITES.length;
      const eduSites = ETAHA_EXCEL_SITES.filter((s) => s.siteName.includes('التربية والتعليم') || s.classification.includes('تعليم'));
      const bankSites = ETAHA_EXCEL_SITES.filter((s) => s.siteName.includes('بنك') || s.siteName.includes('مصرف') || s.siteName.includes('الأهلي') || s.siteName.includes('مصر'));
      const customsSites = ETAHA_EXCEL_SITES.filter((s) => s.siteName.includes('جمارك') || s.siteName.includes('ضرائب'));

      return [
        {
          id: 'All',
          nameAr: 'جميع الجهات والعملاء',
          nameEn: 'All Clients',
          sites: allCount,
          links: allCount,
          color: 'hover:border-slate-400',
          activeBorder: 'border-teal-700 bg-gradient-to-r from-teal-800 to-emerald-900 text-white shadow-md ring-2 ring-teal-500/20',
          badgeBg: 'bg-teal-50 text-teal-700',
          badgeText: 'text-teal-600',
          brandDot: 'bg-teal-600',
        },
        {
          id: 'التعليم',
          nameAr: 'وزارة التربية والتعليم',
          nameEn: 'Schools & Education',
          sites: eduSites.length,
          links: eduSites.length,
          color: 'hover:border-sky-400',
          activeBorder: 'border-sky-600 bg-gradient-to-br from-sky-600 to-blue-700 text-white shadow-md ring-2 ring-sky-500/20',
          badgeBg: 'bg-sky-50 text-sky-700',
          badgeText: 'text-sky-600',
          brandDot: 'bg-sky-500',
        },
        {
          id: 'البنوك',
          nameAr: 'القطاع المصرفي والبنوك',
          nameEn: 'Banking Sector',
          sites: bankSites.length,
          links: bankSites.length,
          color: 'hover:border-emerald-400',
          activeBorder: 'border-emerald-600 bg-gradient-to-br from-emerald-600 to-green-700 text-white shadow-md ring-2 ring-emerald-500/20',
          badgeBg: 'bg-emerald-50 text-emerald-700',
          badgeText: 'text-emerald-600',
          brandDot: 'bg-emerald-600',
        },
        {
          id: 'الجمارك والضرائب',
          nameAr: 'الجمارك والضرائب',
          nameEn: 'Customs & Tax Offices',
          sites: customsSites.length,
          links: customsSites.length,
          color: 'hover:border-indigo-400',
          activeBorder: 'border-indigo-600 bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-md ring-2 ring-indigo-500/20',
          badgeBg: 'bg-indigo-50 text-indigo-700',
          badgeText: 'text-indigo-600',
          brandDot: 'bg-indigo-600',
        },
      ];
    }

    if (activeScope === 'TAHAWOL') {
      const allCount = TAHAWOL_EXCEL_SITES.length;
      const dakhleya = TAHAWOL_EXCEL_SITES.filter((s) => s.siteName.includes('الداخلية') || s.classification.includes('الداخلية'));
      const adl = TAHAWOL_EXCEL_SITES.filter((s) => s.siteName.includes('العدل') || s.classification.includes('العدل'));
      const seha = TAHAWOL_EXCEL_SITES.filter((s) => s.siteName.includes('الصحة') || s.classification.includes('الصحة'));

      return [
        {
          id: 'All',
          nameAr: 'جميع الوزارات والجهات',
          nameEn: 'All Ministries',
          sites: allCount,
          links: allCount,
          color: 'hover:border-slate-400',
          activeBorder: 'border-amber-700 bg-gradient-to-r from-amber-800 to-orange-900 text-white shadow-md ring-2 ring-amber-500/20',
          badgeBg: 'bg-amber-50 text-amber-700',
          badgeText: 'text-amber-600',
          brandDot: 'bg-amber-600',
        },
        {
          id: 'الداخلية',
          nameAr: 'وزارة الداخلية',
          nameEn: 'Interior & Law Enforcement',
          sites: dakhleya.length,
          links: dakhleya.length,
          color: 'hover:border-blue-400',
          activeBorder: 'border-blue-700 bg-gradient-to-br from-blue-700 to-indigo-900 text-white shadow-md ring-2 ring-blue-500/20',
          badgeBg: 'bg-blue-50 text-blue-700',
          badgeText: 'text-blue-600',
          brandDot: 'bg-blue-600',
        },
        {
          id: 'العدل',
          nameAr: 'وزارة العدل والمحاكم',
          nameEn: 'Justice & Courts',
          sites: adl.length,
          links: adl.length,
          color: 'hover:border-emerald-400',
          activeBorder: 'border-emerald-600 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md ring-2 ring-emerald-500/20',
          badgeBg: 'bg-emerald-50 text-emerald-700',
          badgeText: 'text-emerald-600',
          brandDot: 'bg-emerald-600',
        },
        {
          id: 'الصحة',
          nameAr: 'وزارة الصحة والمستشفيات',
          nameEn: 'Health & Hospitals',
          sites: seha.length,
          links: seha.length,
          color: 'hover:border-rose-400',
          activeBorder: 'border-rose-600 bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-md ring-2 ring-rose-500/20',
          badgeBg: 'bg-rose-50 text-rose-700',
          badgeText: 'text-rose-600',
          brandDot: 'bg-red-500',
        },
      ];
    }

    return undefined;
  }, [activeScope]);


  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.company !== 'All') count++;
    if (filters.status) count++;
    if (filters.expectedDate) count++;
    if (filters.sector) count++;
    if (filters.generalAdmin) count++;
    if (filters.competentAdmin) count++;
    if (filters.central) count++;
    if (filters.classification) count++;
    if (filters.obstacleReason) count++;
    return count;
  }, [filters]);

  const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  const handleScopeChange = (scope: ActiveProjectScope) => {
    setActiveScope(scope);
    setFilters(initialFilters);
  };

  const handleStatusSelect = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status === status ? '' : status,
    }));
  };

  const handleOpenDetails = (status?: string) => {
    setModalFilterStatus(status);
    setIsDetailsModalOpen(true);
  };

  // Switch to uploaded Excel data
  const handleApplyUploadedData = (newSites: SiteRecord[], metadata: UploadedFileMetadata) => {
    setUploadedSites(newSites);
    setUploadedMetadata(metadata);
    setActiveScope('UPLOADED');
    setFilters(initialFilters);
  };

  // Reset to original baseline data
  const handleResetToDefault = () => {
    setActiveScope('FTTS');
    setUploadedMetadata(null);
    setFilters(initialFilters);
  };

  // CSV Export
  const handleExportFullCsv = () => {
    const headers = [
      'Site ID',
      'Site Code',
      'Site Name',
      'Company / Entity',
      'Status',
      'Links Count',
      'Sector',
      'Central / Governorate',
      'General Admin',
      'Competent Admin',
      'Classification',
      'Expected Date',
      'Progress %',
      'Contractor',
      'Obstacle Reason',
      'Notes',
    ];

    const rows = filteredSites.map((s) => [
      s.id,
      s.siteCode,
      `"${s.siteName}"`,
      `"${s.company}"`,
      `"${s.status}"`,
      s.linksCount,
      `"${s.sector}"`,
      `"${s.central}"`,
      `"${s.generalAdmin}"`,
      `"${s.competentAdmin}"`,
      `"${s.classification}"`,
      s.expectedDate,
      `${s.progressPercent}%`,
      `"${s.civilContractor || ''}"`,
      `"${s.obstacleReason || ''}"`,
      `"${s.notes || ''}"`,
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Project_${activeScope}_Export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100/70 p-3 sm:p-5 lg:p-7 text-slate-800 font-sans">
      <div className="max-w-[1600px] mx-auto">
        {/* 1. Header with Upload Action */}
        <Header
          onResetFilters={handleResetFilters}
          activeFiltersCount={activeFiltersCount}
          totalFilteredSites={filteredSites.length}
          totalBaselineSites={currentScopeData.length}
          onExportCsv={handleExportFullCsv}
          onPrint={handlePrint}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
          activeUploadedMetadata={uploadedMetadata}
          onResetToDefault={handleResetToDefault}
        />

        {/* 2. Project Scope Navigation Tabs (FTTS, Etaha, Tahawol, Uploaded) */}
        <ProjectTabs
          activeScope={activeScope}
          onChangeScope={handleScopeChange}
          counts={{
            ftts: combinedFttsSites.length,
            etaha: ETAHA_EXCEL_SITES.length,
            tahawol: TAHAWOL_EXCEL_SITES.length,
            uploaded: uploadedSites.length,
          }}
          hasUploadedFile={Boolean(uploadedMetadata)}
          uploadedFileName={uploadedMetadata?.fileName}
        />

        {/* 3. Top KPI Cards */}
        <KpiCards
          kpis={kpis}
          activeStatusFilter={filters.status}
          onSelectStatusFilter={handleStatusSelect}
        />

        {/* 4. Company / Client Category Selector (Full Width) */}
        <div className="mb-6">
          <CompanySelector
            selectedCompany={filters.company}
            onChangeCompany={(c) => handleFilterChange('company', c)}
            title={
              activeScope === 'FTTS'
                ? 'مشغلو شبكات المحمول (ftts.xlsx + We.xlsx)'
                : activeScope === 'ETAHA'
                ? 'تصنيف الجهات والعملاء (الاتاحه .xlsx)'
                : activeScope === 'TAHAWOL'
                ? 'الوزارات والهيئات الحكومية (بيان التحول الرقمى.xlsx)'
                : 'تحديد المشغل / الكيان'
            }
            subtitle={
              activeScope === 'FTTS'
                ? 'انقر على Vodafone أو Orange لعرض ftts.xlsx أو WE لعرض We.xlsx'
                : activeScope === 'ETAHA'
                ? 'تصفية مواقع وفروع الإتاحة بحسب القطاع المستفيد'
                : 'تصفية مواقع التحول الرقمي بحسب الوزارة المعنية'
            }
            customCards={customScopeCards}
            stats={companyStats}
          />
          {/* WE Action Buttons */}
          {filters.company === 'WE' && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium text-sm flex items-center gap-1.5"
              onClick={() => setIsWeAnalysisOpen(true)}
            >
              📊 عرض تحليل WE
            </button>
            <button
              className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900 font-medium text-sm flex items-center gap-1.5"
              onClick={() => setIsWeAddDataOpen(true)}
              disabled={weCodesLoading}
            >
              {weCodesLoading ? '⏳ تحميل...' : '➕ إضافة / تحديث بيانات WE'}
            </button>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium text-sm flex items-center gap-1.5"
              onClick={() => exportToCSV()}
              title="تصدير قاعدة البيانات المركزية كاملة إلى CSV"
            >
              📥 تصدير البيانات المركزية (CSV)
            </button>
            <button
              className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 font-medium text-sm flex items-center gap-1.5 shadow-sm"
              onClick={() => setIsWeManagerOpen(true)}
              title="إدارة وتعديل السجلات وحذف البيانات غير المهمة أو تصدير CSV نظيف"
            >
              🧹 إدارة وحذف بيانات WE (CSV)
            </button>
            <button
              className="px-3 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 font-medium text-sm flex items-center gap-1.5 transition"
              onClick={() => {
                refetchWeRecords();
                refetchWeCodes();
              }}
              title="تحديث البيانات من السحابة"
            >
              🔄 {weRecordsLoading ? 'جارِ المزامنة...' : 'تحديث مباشر'}
            </button>
            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
              ⚡ سحابي: {liveWeSites.length} موقع
            </span>
          </div>
        )}
        </div>

        {/* 5. Core Power BI Visuals: Donut Chart + Summary Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
          {/* Donut Chart */}
          <div className="lg:col-span-6 xl:col-span-6">
            <DonutChart
              data={statusSummaries}
              totalSites={kpis.totalSites}
              activeStatusFilter={filters.status}
              onSelectStatus={handleStatusSelect}
            />
          </div>

          {/* Summary Table */}
          <div className="lg:col-span-6 xl:col-span-6">
            <SummaryTable
              data={statusSummaries}
              totalSites={kpis.totalSites}
              totalLinks={kpis.totalLinks}
              activeStatusFilter={filters.status}
              onSelectStatus={handleStatusSelect}
              onOpenDetailsModal={handleOpenDetails}
            />
          </div>
        </div>

        {/* 6. Bottom Filter Slicers */}
        <Filters
          filters={filters}
          onChangeFilter={handleFilterChange}
          onResetFilters={handleResetFilters}
          sitesData={currentScopeData}
        />

        {/* Footer info bar */}
        <footer className="mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            منظومة متابعة المشروعات القومية للاتصالات والفايبر • FTTS • الإتاحة • التحول الرقمي
          </span>
          <span className="font-mono text-[11px]">
            {activeScope === 'FTTS'
              ? 'مصدر البيانات: ftts.xlsx (Orange/Vodafone) & We.xlsx (WE)'
              : activeScope === 'ETAHA'
              ? 'مصدر البيانات: الاتاحه .xlsx (1,374 موقع)'
              : activeScope === 'TAHAWOL'
              ? 'مصدر البيانات: بيان التحول الرقمى.xlsx (380 موقع)'
              : `ملف مخصص: ${uploadedMetadata?.fileName}`}
          </span>
        </footer>
      </div>

      {/* Drill-down Modal */}
      <SiteDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        sites={filteredSites}
        activeStatusFilter={modalFilterStatus || filters.status || undefined}
      />

      <WeDataAnalysisModal
        isOpen={isWeAnalysisOpen}
        onClose={() => setIsWeAnalysisOpen(false)}
        weSites={liveWeSites}
      />
      <WeDataManagerModal
        isOpen={isWeManagerOpen}
        onClose={() => setIsWeManagerOpen(false)}
        records={weCentralRecords}
        onRefresh={async () => {
          await Promise.all([refetchWeRecords(), refetchWeCodes()]);
        }}
        onEditRecord={(siteCode) => {
          setEditingSiteCode(siteCode);
          setIsWeAddDataOpen(true);
        }}
      />
      <WeAddDataModal
        isOpen={isWeAddDataOpen}
        onClose={() => {
          setIsWeAddDataOpen(false);
          setEditingSiteCode(undefined);
        }}
        allSiteCodes={weCentralCodes.length > 0 ? weCentralCodes : liveWeSites.map(s => s.siteCode)}
        initialSiteCode={editingSiteCode}
        onSaved={async () => {
          await Promise.all([refetchWeRecords(), refetchWeCodes()]);
        }}
      />
      {/* Excel Uploader Modal */}
      <ExcelUploaderModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onApplyData={handleApplyUploadedData}
        onResetToDefault={handleResetToDefault}
        activeMetadata={uploadedMetadata}
      />
    </div>
  );
};

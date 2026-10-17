export type StatusType =
  | 'جاري تصاريح'
  | 'جاري المعاينة'
  | 'تم التسليم'
  | 'معوقات'
  | 'جاري العمل مدني'
  | 'متعثرات'
  | 'جاري العمل كهربى'
  | string;

export type CompanyType = 'All' | 'Vodafone' | 'Orange' | 'WE' | string;

export interface SiteRecord {
  id: string;
  siteCode: string;
  siteName: string;
  company: 'Orange' | 'Vodafone' | 'WE' | string;
  status: StatusType;
  linksCount: number;
  sector: string;
  generalAdmin: string;
  competentAdmin: string;
  central: string;
  classification: string;
  obstacleReason: string;
  expectedDate: string;
  progressPercent: number;
  civilContractor?: string;
  notes?: string;
}

export interface StatusSummary {
  status: string;
  statusEn: string;
  sitesCount: number;
  linksCount: number;
  percentage: number;
  color: string;
  badgeBg: string;
  borderColor: string;
}

export interface FilterState {
  company: CompanyType;
  sector: string;
  generalAdmin: string;
  competentAdmin: string;
  central: string;
  classification: string;
  obstacleReason: string;
  status: string; // 'All' or specific status
  expectedDate: string;
  searchQuery: string;
}

export interface KpiData {
  totalSites: number;
  totalLinks: number;
  completedSites: number;
  permitsCount: number;
  obstaclesCount: number;
  stalledCount: number;
  completionRate: number;
  inProgressSites: number;
}

export interface UploadedFileMetadata {
  fileName: string;
  uploadTime: string;
  totalRows: number;
  detectedColumns: string[];
}

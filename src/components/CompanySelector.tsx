import { Signal } from 'lucide-react';
import type { CompanyType } from '../types/dashboard';

export interface CompanyStatItem {
  id: string;
  nameAr: string;
  nameEn: string;
  sites: number;
  links: number;
  color: string;
  activeBorder: string;
  badgeBg: string;
  badgeText: string;
  brandDot: string;
}

interface CompanySelectorProps {
  selectedCompany: CompanyType;
  onChangeCompany: (company: CompanyType) => void;
  title?: string;
  subtitle?: string;
  customCards?: CompanyStatItem[];
  stats: {
    allCount: number;
    allLinks: number;
    weCount: number;
    weLinks: number;
    vodafoneCount: number;
    vodafoneLinks: number;
    orangeCount: number;
    orangeLinks: number;
    extraCompanies?: {
      name: string;
      sites: number;
      links: number;
    }[];
  };
}

export const CompanySelector: React.FC<CompanySelectorProps> = ({
  selectedCompany,
  onChangeCompany,
  title,
  subtitle,
  customCards,
  stats,
}) => {
  const defaultOptions: CompanyStatItem[] = [
    {
      id: 'All',
      nameAr: 'جميع المشغلين',
      nameEn: 'All Operators',
      sites: stats.allCount,
      links: stats.allLinks,
      color: 'hover:border-slate-400',
      activeBorder: 'border-slate-800 bg-slate-900 text-white shadow-md ring-2 ring-slate-800/20',
      badgeBg: 'bg-slate-100 text-slate-700',
      badgeText: 'text-slate-600',
      brandDot: 'bg-blue-600',
    },
    {
      id: 'WE',
      nameAr: 'WE',
      nameEn: 'المصرية للاتصالات',
      sites: stats.weCount,
      links: stats.weLinks,
      color: 'hover:border-purple-400',
      activeBorder: 'border-purple-600 bg-gradient-to-br from-purple-700 to-indigo-900 text-white shadow-md ring-2 ring-purple-500/20',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      badgeText: 'text-purple-600',
      brandDot: 'bg-purple-600',
    },
    {
      id: 'Vodafone',
      nameAr: 'Vodafone',
      nameEn: 'فودافون مصر',
      sites: stats.vodafoneCount,
      links: stats.vodafoneLinks,
      color: 'hover:border-rose-400',
      activeBorder: 'border-rose-600 bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-md ring-2 ring-rose-500/20',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      badgeText: 'text-rose-600',
      brandDot: 'bg-red-600',
    },
    {
      id: 'Orange',
      nameAr: 'Orange',
      nameEn: 'أورانج مصر',
      sites: stats.orangeCount,
      links: stats.orangeLinks,
      color: 'hover:border-orange-400',
      activeBorder: 'border-orange-500 bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md ring-2 ring-orange-500/20',
      badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
      badgeText: 'text-orange-600',
      brandDot: 'bg-orange-500',
    },
  ];

  // Add any extra companies detected in an uploaded Excel file
  const extraOptions: CompanyStatItem[] = (stats.extraCompanies || []).map((extra) => ({
    id: extra.name,
    nameAr: extra.name,
    nameEn: extra.name,
    sites: extra.sites,
    links: extra.links,
    color: 'hover:border-emerald-400',
    activeBorder: 'border-emerald-600 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md ring-2 ring-emerald-500/20',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeText: 'text-emerald-600',
    brandDot: 'bg-emerald-500',
  }));

  const allOptions = customCards && customCards.length > 0
    ? customCards
    : [...defaultOptions, ...extraOptions];

  return (
    <div className="pbi-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Signal className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-bold text-slate-800">
            {title || 'تحديد مشغل الاتصالات (Company / Scope Filter)'}
          </h3>
        </div>
        <span className="text-[11px] font-medium text-slate-400">
          {subtitle || 'اختر لعزل المؤشرات'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {allOptions.map((option) => {
          const isSelected = selectedCompany === option.id;

          return (
            <button
              key={option.id}
              type="button"
              id={`company-btn-${option.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              onClick={() => onChangeCompany(option.id)}
              className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border text-right transition-all duration-200 cursor-pointer ${
                isSelected
                  ? option.activeBorder
                  : `bg-white border-slate-200 ${option.color} hover:bg-slate-50/80`
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    isSelected ? 'bg-white ring-2 ring-white/40' : option.brandDot
                  }`}
                />
                <div className="truncate">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-sm leading-tight truncate">
                      {option.nameAr}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] block mt-0.5 leading-none truncate ${
                      isSelected ? 'text-white/80' : 'text-slate-400'
                    }`}
                  >
                    {option.nameEn}
                  </span>
                </div>
              </div>

              <div className="text-left flex-shrink-0 mr-1">
                <span
                  className={`inline-block font-mono text-sm font-bold ${
                    isSelected ? 'text-white' : 'text-slate-800'
                  }`}
                >
                  {option.sites}
                </span>
                <span
                  className={`text-[10px] block leading-none font-medium ${
                    isSelected ? 'text-white/75' : 'text-slate-400'
                  }`}
                >
                  {option.links} موقع
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

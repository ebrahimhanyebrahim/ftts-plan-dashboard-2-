import { 
  Building2, 
  GitFork, 
  CheckCircle2, 
  FileCheck2, 
  AlertTriangle 
} from 'lucide-react';

import type { KpiData } from '../types/dashboard';

interface KpiCardsProps {
  kpis: KpiData;
  activeStatusFilter: string;
  onSelectStatusFilter: (status: string) => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  kpis,
  activeStatusFilter,
  onSelectStatusFilter,
}) => {
  const cards = [
    {
      id: 'kpi-total-sites',
      title: 'إجمالي المواقع',
      titleEn: 'Total Sites',
      value: kpis.totalSites,
      subValue: `${kpis.completionRate}% نسبة الإنجاز الكلي`,
      icon: Building2,
      color: 'from-blue-600 to-indigo-700',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50/70',
      borderColor: 'border-blue-200',
      ringColor: 'ring-blue-500',
      filterTarget: 'All',
      isActive: activeStatusFilter === 'All' || activeStatusFilter === '',
    },
    {
      id: 'kpi-total-links',
      title: 'إجمالي الروابط',
      titleEn: 'Total Links',
      value: kpis.totalLinks,
      subValue: `${(kpis.totalLinks / (kpis.totalSites || 1)).toFixed(2)} متوسط الرابط/موقع`,
      icon: GitFork,
      color: 'from-slate-700 to-slate-900',
      textColor: 'text-slate-800',
      bgColor: 'bg-slate-50/70',
      borderColor: 'border-slate-200',
      ringColor: 'ring-slate-500',
      filterTarget: null,
      isActive: false,
    },
    {
      id: 'kpi-completed-sites',
      title: 'تم التسليم',
      titleEn: 'Completed Sites',
      value: kpis.completedSites,
      subValue: `${kpis.completionRate}% من المواقع المعتمدة`,
      icon: CheckCircle2,
      color: 'from-emerald-500 to-green-600',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50/80',
      borderColor: 'border-emerald-200',
      ringColor: 'ring-emerald-500',
      filterTarget: 'تم التسليم',
      isActive: activeStatusFilter === 'تم التسليم',
    },
    {
      id: 'kpi-permits',
      title: 'جاري تصاريح',
      titleEn: 'Permits in Progress',
      value: kpis.permitsCount,
      subValue: `${((kpis.permitsCount / (kpis.totalSites || 1)) * 100).toFixed(1)}% من الإجمالي`,
      icon: FileCheck2,
      color: 'from-sky-500 to-blue-600',
      textColor: 'text-sky-700',
      bgColor: 'bg-sky-50/80',
      borderColor: 'border-sky-200',
      ringColor: 'ring-sky-500',
      filterTarget: 'جاري تصاريح',
      isActive: activeStatusFilter === 'جاري تصاريح',
    },
    {
      id: 'kpi-obstacles',
      title: 'معوقات العمل',
      titleEn: 'Obstacles',
      value: kpis.obstaclesCount,
      subValue: `${((kpis.obstaclesCount / (kpis.totalSites || 1)) * 100).toFixed(1)}% تتطلب متابعة`,
      icon: AlertTriangle,
      color: 'from-amber-500 to-rose-600',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50/80',
      borderColor: 'border-amber-200',
      ringColor: 'ring-amber-500',
      filterTarget: 'معوقات',
      isActive: activeStatusFilter === 'معوقات',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      {cards.map((card) => {
        const IconComponent = card.icon;
        const isClickable = Boolean(card.filterTarget);

        return (
          <div
            key={card.id}
            id={card.id}
            onClick={() => {
              if (card.filterTarget) {
                onSelectStatusFilter(card.filterTarget);
              }
            }}
            className={`pbi-card p-4 flex flex-col justify-between relative overflow-hidden transition-all duration-200 ${
              card.bgColor
            } ${card.borderColor} ${
              isClickable ? 'cursor-pointer hover:-translate-y-0.5' : ''
            } ${
              card.isActive && card.filterTarget !== 'All'
                ? 'ring-2 ring-offset-1 ' + card.ringColor + ' shadow-md'
                : ''
            }`}
          >
            {/* Top decorative gradient bar */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`}
            />

            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">
                  {card.titleEn}
                </span>
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                  {card.title}
                </h3>
              </div>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-xs border border-slate-100 ${card.textColor}`}
              >
                <IconComponent className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-1">
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl sm:text-3xl font-extrabold font-sans tracking-tight ${card.textColor}`}>
                  {card.value.toLocaleString()}
                </span>
                {card.filterTarget && (
                  <span className="text-[11px] font-medium text-slate-400">
                    {card.isActive && card.filterTarget !== 'All' ? 'محدد' : 'انقر للتصفية'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium truncate">
                {card.subValue}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

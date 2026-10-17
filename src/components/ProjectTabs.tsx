import { Radio, Globe, Landmark, FileSpreadsheet, Sparkles } from 'lucide-react';

export type ActiveProjectScope = 'FTTS' | 'ETAHA' | 'TAHAWOL' | 'UPLOADED';

interface ProjectTabsProps {
  activeScope: ActiveProjectScope;
  onChangeScope: (scope: ActiveProjectScope) => void;
  counts: {
    ftts: number;
    etaha: number;
    tahawol: number;
    uploaded?: number;
  };
  hasUploadedFile: boolean;
  uploadedFileName?: string;
}

export const ProjectTabs: React.FC<ProjectTabsProps> = ({
  activeScope,
  onChangeScope,
  counts,
  hasUploadedFile,
  uploadedFileName,
}) => {
  const tabs = [
    {
      id: 'FTTS' as ActiveProjectScope,
      title: 'خطة FTTS المشغلين',
      titleEn: 'FTTS Operators (Orange, Vodafone, WE)',
      count: counts.ftts,
      icon: Radio,
      badge: 'ftts.xlsx + We.xlsx',
      activeColor: 'bg-gradient-to-r from-blue-700 to-indigo-900 text-white shadow-md ring-2 ring-blue-500/30',
      tagColor: 'bg-blue-500/20 text-blue-200 border-blue-400/30',
      countColor: 'bg-white/20 text-white',
    },
    {
      id: 'ETAHA' as ActiveProjectScope,
      title: 'مشروع الإتاحة',
      titleEn: 'Network & FTTH Availability',
      count: counts.etaha,
      icon: Globe,
      badge: 'الاتاحه .xlsx',
      activeColor: 'bg-gradient-to-r from-teal-700 to-emerald-900 text-white shadow-md ring-2 ring-emerald-500/30',
      tagColor: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
      countColor: 'bg-white/20 text-white',
    },
    {
      id: 'TAHAWOL' as ActiveProjectScope,
      title: 'بيان التحول الرقمي',
      titleEn: 'Digital Transformation Project',
      count: counts.tahawol,
      icon: Landmark,
      badge: 'بيان التحول الرقمى.xlsx',
      activeColor: 'bg-gradient-to-r from-amber-700 to-orange-900 text-white shadow-md ring-2 ring-amber-500/30',
      tagColor: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
      countColor: 'bg-white/20 text-white',
    },
  ];

  if (hasUploadedFile) {
    tabs.push({
      id: 'UPLOADED' as ActiveProjectScope,
      title: 'تحليل ملف Excel المرفوع',
      titleEn: uploadedFileName || 'Custom Excel File',
      count: counts.uploaded || 0,
      icon: FileSpreadsheet,
      badge: 'ملف مخصص',
      activeColor: 'bg-gradient-to-r from-purple-700 to-fuchsia-900 text-white shadow-md ring-2 ring-purple-500/30',
      tagColor: 'bg-purple-500/20 text-purple-200 border-purple-400/30',
      countColor: 'bg-white/20 text-white',
    });
  }

  return (
    <div className="pbi-card p-2 sm:p-3 mb-6 bg-white/95">
      <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-100 mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-600" />
          <h2 className="text-xs sm:text-sm font-extrabold text-slate-800">
            أقسام المشروعات القومية وقواعد البيانات (Project Scope)
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          انقر للتبديل بين المشروعات وشيتات الإكسيل
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeScope === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              id={`tab-scope-${tab.id.toLowerCase()}`}
              onClick={() => onChangeScope(tab.id)}
              className={`flex items-center justify-between p-3 rounded-xl border text-right transition-all duration-200 cursor-pointer ${
                isActive
                  ? tab.activeColor
                  : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isActive ? 'bg-white/15' : 'bg-white text-slate-600 shadow-2xs border border-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-extrabold text-xs sm:text-sm leading-tight truncate">
                      {tab.title}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] block mt-0.5 truncate ${
                      isActive ? 'text-white/80' : 'text-slate-400'
                    }`}
                  >
                    {tab.titleEn}
                  </span>
                </div>
              </div>

              <div className="text-left flex-shrink-0 mr-1.5">
                <span
                  className={`inline-block font-mono text-xs sm:text-sm font-extrabold px-2 py-0.5 rounded-full ${
                    isActive ? tab.countColor : 'bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {tab.count.toLocaleString()}
                </span>
                <span
                  className={`text-[9px] block text-center mt-0.5 leading-none font-medium ${
                    isActive ? 'text-white/70' : 'text-slate-400'
                  }`}
                >
                  موقع/فرع
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

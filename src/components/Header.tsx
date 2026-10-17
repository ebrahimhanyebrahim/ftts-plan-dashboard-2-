import { 
  Radio, 
  RotateCcw, 
  Download, 
  Printer, 
  Calendar,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import type { UploadedFileMetadata } from '../types/dashboard';

interface HeaderProps {
  onResetFilters: () => void;
  activeFiltersCount: number;
  totalFilteredSites: number;
  totalBaselineSites: number;
  onExportCsv: () => void;
  onPrint: () => void;
  onOpenUploadModal: () => void;
  activeUploadedMetadata?: UploadedFileMetadata | null;
  onResetToDefault?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onResetFilters,
  activeFiltersCount,
  totalFilteredSites,
  totalBaselineSites,
  onExportCsv,
  onPrint,
  onOpenUploadModal,
  activeUploadedMetadata,
  onResetToDefault,
}) => {
  return (
    <header className="pbi-header-banner text-white rounded-2xl shadow-lg p-5 mb-6 border border-slate-700/50">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Title & Telecom Branding */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-md shadow-sky-500/20 text-white font-bold ring-2 ring-white/20">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans text-white">
                FTTS Plan Overall
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                لوحة المتابعة الشاملة
              </span>
              {activeUploadedMetadata ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-semibold bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/40">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  بيانات إكسيل مرفوعة: {activeUploadedMetadata.fileName}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  الخطة الأساسية (121 موقع)
                </span>
              )}
            </div>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 flex items-center gap-2 flex-wrap">
              <span>Fiber To The Site (FTTS) • WE • Vodafone • Orange Rollout Dashboard</span>
              <span className="text-slate-400 hidden sm:inline">•</span>
              <span className="text-sky-300 font-medium">
                عرض {totalFilteredSites} من أصل {totalBaselineSites} موقع
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls & Utilities */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap self-stretch lg:self-auto justify-end">
          {/* Upload Excel Button */}
          <button
            onClick={onOpenUploadModal}
            id="btn-upload-excel"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 rounded-lg border border-emerald-500/40 transition-all shadow-md cursor-pointer"
            title="رفع وتحليل أي شيت إكسيل"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>رفع ملف Excel للتحليل</span>
          </button>

          {/* Reset to default data if uploaded */}
          {activeUploadedMetadata && onResetToDefault && (
            <button
              onClick={onResetToDefault}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-purple-200 bg-purple-900/60 hover:bg-purple-800/80 rounded-lg border border-purple-400/30 transition-colors shadow-sm"
              title="العودة لبيانات الخطة الأصلية (121 موقع)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>الخطة الافتراضية</span>
            </button>
          )}

          {/* Active Filters Indicator & Reset */}
          {activeFiltersCount > 0 && (
            <button
              onClick={onResetFilters}
              id="btn-reset-filters"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg border border-amber-400/40 transition-colors shadow-sm"
              title="إعادة ضبط كافة الفلاتر"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط ({activeFiltersCount})</span>
            </button>
          )}

          {/* Export CSV Button */}
          <button
            onClick={onExportCsv}
            id="btn-export-csv"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-600/60 transition-colors shadow-sm"
            title="تصدير البيانات الحالية بصيغة CSV"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>تصدير Excel/CSV</span>
          </button>

          {/* Print/Report Button */}
          <button
            onClick={onPrint}
            id="btn-print-report"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-600/60 transition-colors shadow-sm"
            title="طباعة أو تصدير التقرير"
          >
            <Printer className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">طباعة</span>
          </button>

          {/* Current Date Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-900/60 rounded-lg border border-slate-700">
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-mono text-xs dir-ltr">
              {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

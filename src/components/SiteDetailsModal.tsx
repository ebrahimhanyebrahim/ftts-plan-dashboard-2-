import { useState } from 'react';
import { 
  X, 
  Search, 
  Download, 
  Building2, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

import type { SiteRecord } from '../types/dashboard';
import { STATUS_CONFIG } from '../data/dashboardData';

interface SiteDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: SiteRecord[];
  activeStatusFilter?: string;
}

export const SiteDetailsModal: React.FC<SiteDetailsModalProps> = ({
  isOpen,
  onClose,
  sites,
  activeStatusFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  if (!isOpen) return null;

  const filteredSites = sites.filter((site) => {
    const q = searchTerm.toLowerCase();
    return (
      site.siteCode.toLowerCase().includes(q) ||
      site.siteName.toLowerCase().includes(q) ||
      site.central.toLowerCase().includes(q) ||
      site.sector.toLowerCase().includes(q) ||
      site.company.toLowerCase().includes(q) ||
      site.status.toLowerCase().includes(q) ||
      (site.civilContractor && site.civilContractor.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredSites.length / pageSize) || 1;
  const pagedSites = filteredSites.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportCsv = () => {
    const headers = [
      'Site ID',
      'Site Code',
      'Site Name',
      'Company',
      'Status',
      'Links Count',
      'Sector',
      'Central',
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
      s.company,
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
      `FTTS_Sites_Export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="pbi-header-banner p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ring-1 ring-white/20">
              <Building2 className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">
                  سجل تفاصيل المواقع الميدانية (Site Detailed Records)
                </h3>
                {activeStatusFilter && (
                  <span className="text-xs bg-sky-500/30 text-sky-200 px-2.5 py-0.5 rounded-full border border-sky-400/30 font-medium">
                    {activeStatusFilter}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                عرض {filteredSites.length} موقع مطابق للتصفية المطبقة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Toolbar: Search and Export */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute inset-y-0 right-3 my-auto text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="بحث بكود الموقع، السنترال، المقاول..."
              className="w-full pr-9 pl-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-sky-600" />
              <span>تصدير النتائج (CSV)</span>
            </button>
          </div>
        </div>

        {/* Modal Table Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">كود الموقع</th>
                  <th className="py-2.5 px-3">اسم الموقع / السنترال</th>
                  <th className="py-2.5 px-3">الشركة</th>
                  <th className="py-2.5 px-3">موقف العام</th>
                  <th className="py-2.5 px-3 text-center">الروابط</th>
                  <th className="py-2.5 px-3">القطاع</th>
                  <th className="py-2.5 px-3">التاريخ المستهدف</th>
                  <th className="py-2.5 px-3">المقاول / الملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedSites.map((site) => {
                  const cfg = STATUS_CONFIG[site.status];

                  return (
                    <tr key={site.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-sky-800">
                        {site.siteCode}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold block text-slate-800">
                          {site.siteName}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          {site.central}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${
                            site.company === 'WE'
                              ? 'bg-purple-100 text-purple-800 border-purple-200'
                              : site.company === 'Orange'
                              ? 'bg-orange-100 text-orange-800 border-orange-200'
                              : site.company === 'Vodafone'
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {site.company}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                          style={{
                            backgroundColor: cfg.bgLight,
                            color: cfg.textColor,
                            borderColor: cfg.border,
                            borderWidth: 1,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: cfg.color }}
                          />
                          {site.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">
                        {site.linksCount}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {site.sector}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {site.expectedDate}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        <span className="block font-medium text-slate-700">
                          {site.civilContractor || 'المقاول العام'}
                        </span>
                        {site.obstacleReason !== 'لا يوجد تعذر' && (
                          <span className="text-[10px] text-rose-600 block mt-0.5">
                            {site.obstacleReason}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {pagedSites.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">
                      لا توجد مواقع مطابقة للبحث أو التصفية الحالية
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Pagination Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            صفحة <strong className="text-slate-700">{currentPage}</strong> من{' '}
            <strong className="text-slate-700">{totalPages}</strong> (إجمالي {filteredSites.length} موقع)
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              className="px-2.5 py-1 rounded bg-white border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors flex items-center gap-1"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              <span>السابق</span>
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="px-2.5 py-1 rounded bg-white border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors flex items-center gap-1"
            >
              <span>التالي</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

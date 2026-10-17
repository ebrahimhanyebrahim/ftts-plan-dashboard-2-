import { useState } from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Table as TableIcon, 
  Eye, 
  CheckCircle2 
} from 'lucide-react';

import type { StatusSummary } from '../types/dashboard';

interface SummaryTableProps {
  data: StatusSummary[];
  totalSites: number;
  totalLinks: number;
  activeStatusFilter: string;
  onSelectStatus: (status: string) => void;
  onOpenDetailsModal?: (status?: string) => void;
}

type SortField = 'status' | 'sitesCount' | 'linksCount';
type SortDirection = 'asc' | 'desc';

export const SummaryTable: React.FC<SummaryTableProps> = ({
  data,
  totalSites,
  totalLinks,
  activeStatusFilter,
  onSelectStatus,
  onOpenDetailsModal,
}) => {
  const [sortField, setSortField] = useState<SortField>('sitesCount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [tableSearch, setTableSearch] = useState<string>('');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredData = data.filter((row) =>
    row.status.toLowerCase().includes(tableSearch.toLowerCase()) ||
    row.statusEn.toLowerCase().includes(tableSearch.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'status') {
      comparison = a.status.localeCompare(b.status, 'ar');
    } else if (sortField === 'sitesCount') {
      comparison = a.sitesCount - b.sitesCount;
    } else if (sortField === 'linksCount') {
      comparison = a.linksCount - b.linksCount;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const maxSites = Math.max(...data.map((d) => d.sitesCount), 1);
  const maxLinks = Math.max(...data.map((d) => d.linksCount), 1);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-sky-600 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-sky-600 font-bold" />
    );
  };

  return (
    <div className="pbi-card p-5 flex flex-col justify-between h-full">
      {/* Table Title and Actions */}
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 border border-sky-100">
              <TableIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 leading-tight">
                جدول حصر الموقف والمسارات (Summary Table)
              </h3>
              <p className="text-xs text-slate-400">
                موقف العام • عدد المواقع (N.Sites) • عدد الروابط (No. Links)
              </p>
            </div>
          </div>

          {onOpenDetailsModal && (
            <button
              onClick={() => onOpenDetailsModal(activeStatusFilter || undefined)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>عرض تفاصيل المواقع</span>
            </button>
          )}
        </div>

        {/* Search Input for Table */}
        <div className="relative mb-3">
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            id="table-search-input"
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            placeholder="بحث داخل الجدول..."
            className="w-full pr-8 pl-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white text-slate-700"
          />
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-2xs">
          <table className="w-full text-right border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-bold select-none">
                <th
                  onClick={() => handleSort('status')}
                  className="py-2.5 px-3 cursor-pointer group hover:bg-slate-200/70 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>موقف العام</span>
                    {renderSortIcon('status')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('sitesCount')}
                  className="py-2.5 px-3 text-center cursor-pointer group hover:bg-slate-200/70 transition-colors w-28 sm:w-36"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>N.Sites</span>
                    {renderSortIcon('sitesCount')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('linksCount')}
                  className="py-2.5 px-3 text-center cursor-pointer group hover:bg-slate-200/70 transition-colors w-28 sm:w-36"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>No. Links</span>
                    {renderSortIcon('linksCount')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedData.map((row) => {
                const isSelected = activeStatusFilter === row.status;
                const siteBarWidth = Math.round((row.sitesCount / maxSites) * 100);
                const linkBarWidth = Math.round((row.linksCount / maxLinks) * 100);

                return (
                  <tr
                    key={row.status}
                    id={`table-row-${row.status.replace(/\s+/g, '-')}`}
                    onClick={() => onSelectStatus(isSelected ? '' : row.status)}
                    className={`cursor-pointer transition-colors duration-150 group ${
                      isSelected
                        ? 'bg-sky-50/90 font-semibold text-sky-950 ring-1 ring-inset ring-sky-300'
                        : 'hover:bg-slate-50/80 text-slate-700'
                    }`}
                  >
                    {/* Status Column */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: row.color }}
                        />
                        <div>
                          <span className="font-semibold block text-slate-800">
                            {row.status}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-sans">
                            {row.statusEn}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* N.Sites Column with Data-bar */}
                    <td className="py-2 px-3 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-mono font-bold text-slate-800 text-sm">
                          {row.sitesCount}
                        </span>
                        {/* Power BI style mini data-bar */}
                        <div className="w-16 sm:w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${siteBarWidth}%`,
                              backgroundColor: row.color,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* No. Links Column with Data-bar */}
                    <td className="py-2 px-3 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-mono font-bold text-slate-800 text-sm">
                          {row.linksCount}
                        </span>
                        {/* Power BI style mini data-bar */}
                        <div className="w-16 sm:w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-slate-600 rounded-full transition-all duration-300"
                            style={{
                              width: `${linkBarWidth}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Prominent Total Row as in Power BI */}
            <tfoot>
              <tr className="bg-slate-800 text-white font-extrabold border-t-2 border-slate-900">
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-400" />
                    <span className="text-sm">Total (الإجمالي)</span>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-center font-mono text-base font-extrabold text-sky-300">
                  {totalSites}
                </td>
                <td className="py-2.5 px-3 text-center font-mono text-base font-extrabold text-sky-300">
                  {totalLinks}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Table Footer info */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>* انقر فوق أي صف للتصفية الفورية لكامل الداشبورد</span>
        <span className="font-mono">7 فئات مرحلية</span>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { PieChart, Info, RotateCcw } from 'lucide-react';
import type { StatusSummary } from '../types/dashboard';


interface DonutChartProps {
  data: StatusSummary[];
  totalSites: number;
  activeStatusFilter: string;
  onSelectStatus: (status: string) => void;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  totalSites,
  activeStatusFilter,
  onSelectStatus,
}) => {
  const [hoveredStatus, setHoveredStatus] = useState<StatusSummary | null>(null);

  // Compute angles for SVG Donut slices
  let cumulativeAngle = -90; // Start at top (12 o'clock)
  const validTotal = totalSites > 0 ? totalSites : 1;

  const slices = data
    .filter((d) => d.sitesCount > 0)
    .map((item) => {
      const sliceAngle = (item.sitesCount / validTotal) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + sliceAngle;
      cumulativeAngle += sliceAngle;

      return {
        ...item,
        startAngle,
        endAngle,
        sliceAngle,
      };
    });

  // Helper function to create SVG arc path
  const createArc = (
    centerX: number,
    centerY: number,
    radius: number,
    innerRadius: number,
    startDeg: number,
    endDeg: number
  ) => {
    // If it's a full circle or almost full circle
    const isFull = endDeg - startDeg >= 359.99;
    const effectiveEndDeg = isFull ? startDeg + 359.99 : endDeg;

    const startRad = (startDeg * Math.PI) / 180;
    const endRad = (effectiveEndDeg * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const x3 = centerX + innerRadius * Math.cos(endRad);
    const y3 = centerY + innerRadius * Math.sin(endRad);
    const x4 = centerX + innerRadius * Math.cos(startRad);
    const y4 = centerY + innerRadius * Math.sin(startRad);

    const largeArcFlag = endDeg - startDeg > 180 ? 1 : 0;

    return `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
      Z
    `;
  };

  const activeDisplay = hoveredStatus || (activeStatusFilter ? data.find((d) => d.status === activeStatusFilter) : null);

  return (
    <div className="pbi-card p-5 flex flex-col justify-between h-full">
      {/* Visual Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 border border-sky-100">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 leading-tight">
              الموقف العام لتنفيذ المواقع (Overall View)
            </h3>
            <p className="text-xs text-slate-400">
              توزيع المواقع حسب مراحل التنفيذ ونسب الإنجاز
            </p>
          </div>
        </div>

        {activeStatusFilter && (
          <button
            onClick={() => onSelectStatus('')}
            className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md hover:bg-amber-100 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>عرض الكل</span>
          </button>
        )}
      </div>

      {/* Main Visual: SVG Donut + Center Stats */}
      <div className="flex flex-col xl:flex-row items-center justify-center gap-6 my-2">
        <div className="relative flex items-center justify-center">
          <svg
            viewBox="0 0 320 320"
            className="w-64 h-64 sm:w-72 sm:h-72 drop-shadow-sm select-none"
          >
            {/* Background ring */}
            <circle
              cx="160"
              cy="160"
              r="135"
              fill="none"
              stroke="#f8fafc"
              strokeWidth="2"
            />

            {/* Slices */}
            {slices.map((slice) => {
              const isSelected = activeStatusFilter === slice.status;
              const isHovered = hoveredStatus?.status === slice.status;
              const isDimmed =
                (activeStatusFilter && !isSelected) ||
                (hoveredStatus && !isHovered && !isSelected);

              const outerR = isHovered || isSelected ? 142 : 135;
              const innerR = isHovered || isSelected ? 84 : 88;

              return (
                <path
                  key={slice.status}
                  d={createArc(160, 160, outerR, innerR, slice.startAngle, slice.endAngle)}
                  fill={slice.color}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="cursor-pointer transition-all duration-200"
                  style={{
                    opacity: isDimmed ? 0.35 : 1,
                    filter: isHovered || isSelected ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' : 'none',
                  }}
                  onMouseEnter={() => setHoveredStatus(slice)}
                  onMouseLeave={() => setHoveredStatus(null)}
                  onClick={() => onSelectStatus(isSelected ? '' : slice.status)}
                />
              );
            })}

            {/* Center Circle fill for clean contrast */}
            <circle cx="160" cy="160" r="82" fill="#ffffff" />
          </svg>

          {/* Center Info Overlay */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4"
          >
            {activeDisplay ? (
              <div className="animate-fade-in">
                <span
                  className="text-2xl sm:text-3xl font-extrabold font-sans tracking-tight block"
                  style={{ color: activeDisplay.color }}
                >
                  {activeDisplay.sitesCount}
                </span>
                <span className="text-[11px] font-bold text-slate-800 line-clamp-1 block max-w-[120px]">
                  {activeDisplay.status}
                </span>
                <span
                  className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded-full font-mono"
                  style={{
                    backgroundColor: activeDisplay.badgeBg,
                    color: activeDisplay.color,
                  }}
                >
                  {activeDisplay.percentage}%
                </span>
              </div>
            ) : (
              <div>
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-800 font-sans tracking-tight block">
                  {totalSites}
                </span>
                <span className="text-xs font-bold text-slate-500 block mt-0.5">
                  إجمالي المواقع
                </span>
                <span className="text-[10px] text-slate-400 font-medium block">
                  N.Sites
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Legend List */}
        <div className="flex-1 w-full space-y-1.5 max-w-md">
          {data.map((item) => {
            const isSelected = activeStatusFilter === item.status;
            const isHovered = hoveredStatus?.status === item.status;

            return (
              <div
                key={item.status}
                id={`legend-item-${item.status.replace(/\s+/g, '-')}`}
                onMouseEnter={() => setHoveredStatus(item)}
                onMouseLeave={() => setHoveredStatus(null)}
                onClick={() => onSelectStatus(isSelected ? '' : item.status)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all text-xs ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-800'
                    : isHovered
                    ? 'bg-slate-100/90 text-slate-900'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold truncate">
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono flex-shrink-0">
                  <span
                    className={`font-bold ${
                      isSelected ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {item.sitesCount}
                  </span>
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-white/20 text-white font-bold'
                        : 'bg-slate-100 text-slate-500 font-medium'
                    }`}
                  >
                    {item.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Helper Text */}
      <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-sky-500" />
          انقر فوق أي قطاع من الدائرة أو من دليل الألوان لتصفية لوحة التحكم
        </span>
        {activeStatusFilter && (
          <span className="text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded">
            تم تطبيق التصفية: {activeStatusFilter}
          </span>
        )}
      </div>
    </div>
  );
};

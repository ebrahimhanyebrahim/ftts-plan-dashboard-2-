import { Calendar, Clock, X, Filter } from 'lucide-react';


interface DateSelectorProps {
  selectedDate: string;
  onChangeDate: (date: string) => void;
  filteredDueCount: number;
  totalSites: number;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onChangeDate,
  filteredDueCount,
  totalSites,
}) => {
  const presets = [
    { label: 'الكل (بدون تحديد)', value: '' },
    { label: 'نهاية 2026', value: '2026-12-31' },
    { label: 'يناير 2027', value: '2027-01-31' },
    { label: 'نهاية Q1 2027', value: '2027-03-31' },
  ];

  return (
    <div className="pbi-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-bold text-slate-800">
            التاريخ المتوقع للانتهاء (Expected Completion Date)
          </h3>
        </div>
        {selectedDate && (
          <button
            onClick={() => onChangeDate('')}
            className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-medium transition-colors"
          >
            <X className="w-3 h-3" />
            <span>إلغاء فلتر التاريخ</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Date Input with Icon */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <input
            type="date"
            id="expected-completion-date-input"
            value={selectedDate}
            onChange={(e) => onChangeDate(e.target.value)}
            className="w-full pr-10 pl-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono text-slate-700 shadow-xs"
            placeholder="حدد تاريخ الانتهاء المستهدف"
          />
        </div>

        {/* Preset quick buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {presets.map((preset) => {
            const isPresetActive = selectedDate === preset.value;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChangeDate(preset.value)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                  isPresetActive
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Summary Status */}
      {selectedDate ? (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-sky-500" />
            المواقع المستهدفة حتى تاريخ <strong className="text-slate-700 font-mono">{selectedDate}</strong>:
          </span>
          <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
            {filteredDueCount} من أصل {totalSites} موقع ({((filteredDueCount / (totalSites || 1)) * 100).toFixed(1)}%)
          </span>
        </div>
      ) : (
        <p className="mt-2 text-[11px] text-slate-400">
          * يتم عرض كافة المواقع. حدد تاريخاً لعرض المواقع المطلوب إنجازها بحلول ذلك الموعد.
        </p>
      )}
    </div>
  );
};

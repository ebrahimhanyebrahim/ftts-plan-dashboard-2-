import { useState, useRef, useEffect, useMemo } from 'react';


import { 
  Filter, 
  ChevronDown, 
  Search, 
  X, 
  RotateCcw, 
  Check, 
  MapPin, 
  Building, 
  Briefcase, 
  Layers, 
  Tag, 
  AlertCircle 
} from 'lucide-react';
import type { FilterState, SiteRecord } from '../types/dashboard';
import { 
  SECTORS, 
  GENERAL_ADMINS, 
  COMPETENT_ADMINS, 
  CENTRALS, 
  CLASSIFICATIONS, 
  OBSTACLE_REASONS 
} from '../data/dashboardData';

interface FiltersProps {
  filters: FilterState;
  onChangeFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onResetFilters: () => void;
  sitesData: SiteRecord[];
}

interface FilterDropdownProps {
  id: string;
  label: string;
  labelEn: string;
  icon: React.ElementType;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  sitesData: SiteRecord[];
  filterKey: keyof SiteRecord;
}

const SingleFilterDropdown: React.FC<FilterDropdownProps> = ({
  id,
  label,
  labelEn,
  icon: Icon,
  value,
  options,
  onChange,
  sitesData,
  filterKey,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Count items for each option in current context
  const getOptionCount = (optVal: string) => {
    if (!optVal) return sitesData.length;
    return sitesData.filter((s) => s[filterKey] === optVal).length;
  };

  const isSelected = Boolean(value);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Label and Header */}
      <div className="flex items-center justify-between mb-1.5">
        <label
          htmlFor={id}
          className="text-xs font-bold text-slate-700 flex items-center gap-1.5 truncate"
        >
          <Icon className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
          <span className="truncate">{label}</span>
        </label>
        {isSelected && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="text-[10px] text-rose-500 hover:text-rose-700 flex items-center gap-0.5"
            title="إلغاء التحديد"
          >
            <X className="w-2.5 h-2.5" />
            <span>مسح</span>
          </button>
        )}
      </div>

      {/* Button to toggle dropdown */}
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl border transition-all text-right cursor-pointer shadow-2xs ${
          isSelected
            ? 'bg-sky-50 border-sky-400 text-sky-900 font-semibold ring-1 ring-sky-300'
            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/50'
        }`}
      >
        <span className="truncate flex-1">
          {isSelected ? value : `الكل (${labelEn})`}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180 text-sky-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full sm:w-64 max-w-[90vw] right-0 bg-white border border-slate-200 rounded-xl shadow-xl p-2 animate-in fade-in zoom-in-95 duration-150">
          {/* Search box inside dropdown */}
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 absolute inset-y-0 right-2.5 my-auto text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`بحث في ${label}...`}
              className="w-full pr-8 pl-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700"
              autoFocus
            />
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto space-y-1">
            {/* "All" Option */}
            <div
              onClick={() => {
                onChange('');
                setIsOpen(false);
                setSearchTerm('');
              }}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                !value
                  ? 'bg-sky-100 text-sky-900 font-bold'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {!value && <Check className="w-3 h-3 text-sky-700" />}
                <span>الكل (عرض الجميع)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {sitesData.length}
              </span>
            </div>

            {/* Individual Options */}
            {filteredOptions.map((opt) => {
              const isOptionActive = value === opt;
              const count = getOptionCount(opt);

              return (
                <div
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    isOptionActive
                      ? 'bg-sky-100 text-sky-900 font-bold'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {isOptionActive && <Check className="w-3 h-3 text-sky-700 flex-shrink-0" />}
                    <span className="truncate">{opt}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isOptionActive
                        ? 'bg-sky-200/60 text-sky-900 font-bold'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </div>
              );
            })}

            {filteredOptions.length === 0 && (
              <div className="text-center py-3 text-xs text-slate-400">
                لا توجد نتائج مطابقة
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const Filters: React.FC<FiltersProps> = ({
  filters,
  onChangeFilter,
  onResetFilters,
  sitesData,
}) => {
  const activeCount = [
    filters.sector,
    filters.generalAdmin,
    filters.competentAdmin,
    filters.central,
    filters.classification,
    filters.obstacleReason,
  ].filter(Boolean).length;

  const dynamicSectors = useMemo(() => {
    const list = Array.from(new Set(sitesData.map((s) => s.sector).filter(Boolean)));
    return list.length > 0 ? list : SECTORS;
  }, [sitesData]);

  const dynamicGeneralAdmins = useMemo(() => {
    const list = Array.from(new Set(sitesData.map((s) => s.generalAdmin).filter(Boolean)));
    return list.length > 0 ? list : GENERAL_ADMINS;
  }, [sitesData]);

  const dynamicCompetentAdmins = useMemo(() => {
    const list = Array.from(new Set(sitesData.map((s) => s.competentAdmin).filter(Boolean)));
    return list.length > 0 ? list : COMPETENT_ADMINS;
  }, [sitesData]);

  const dynamicCentrals = useMemo(() => {
    const list = Array.from(new Set(sitesData.map((s) => s.central).filter(Boolean)));
    return list.length > 0 ? list : CENTRALS;
  }, [sitesData]);

  const dynamicClassifications = useMemo(() => {
    const list = Array.from(new Set(sitesData.map((s) => s.classification).filter(Boolean)));
    return list.length > 0 ? list : CLASSIFICATIONS;
  }, [sitesData]);

  const dynamicObstacleReasons = useMemo(() => {
    const list = Array.from(new Set(sitesData.map((s) => s.obstacleReason).filter(Boolean)));
    return list.length > 0 ? list : OBSTACLE_REASONS;
  }, [sitesData]);

  return (
    <div className="pbi-card p-5 mt-6">
      {/* Filters Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 border border-sky-100">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 leading-tight">
              فلاتر التصفية التفاعلية (Dashboard Slicers)
            </h3>
            <p className="text-xs text-slate-400">
              تصفية المؤشرات والرسوم البيانية طبقاً للهيكل الإداري والجغرافي
            </p>
          </div>
        </div>

        {activeCount > 0 && (
          <button
            onClick={onResetFilters}
            id="btn-reset-bottom-filters"
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>إلغاء تصفية الفلاتر ({activeCount})</span>
          </button>
        )}
      </div>

      {/* Grid of the 6 Slicers requested */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. القطاع */}
        <SingleFilterDropdown
          id="filter-sector"
          label="القطاع"
          labelEn="Sector"
          icon={MapPin}
          value={filters.sector}
          options={dynamicSectors}
          onChange={(val) => onChangeFilter('sector', val)}
          sitesData={sitesData}
          filterKey="sector"
        />

        {/* 2. الإدارات العامه */}
        <SingleFilterDropdown
          id="filter-general-admin"
          label="الإدارات العامه"
          labelEn="General Admin"
          icon={Building}
          value={filters.generalAdmin}
          options={dynamicGeneralAdmins}
          onChange={(val) => onChangeFilter('generalAdmin', val)}
          sitesData={sitesData}
          filterKey="generalAdmin"
        />

        {/* 3. الإدارات المختصة */}
        <SingleFilterDropdown
          id="filter-competent-admin"
          label="الإدارات المختصة"
          labelEn="Competent Admin"
          icon={Briefcase}
          value={filters.competentAdmin}
          options={dynamicCompetentAdmins}
          onChange={(val) => onChangeFilter('competentAdmin', val)}
          sitesData={sitesData}
          filterKey="competentAdmin"
        />

        {/* 4. الاسترال */}
        <SingleFilterDropdown
          id="filter-central"
          label="الاسترال (السنترال)"
          labelEn="Central / Exchange"
          icon={Layers}
          value={filters.central}
          options={dynamicCentrals}
          onChange={(val) => onChangeFilter('central', val)}
          sitesData={sitesData}
          filterKey="central"
        />

        {/* 5. التصنيف */}
        <SingleFilterDropdown
          id="filter-classification"
          label="التصنيف"
          labelEn="Classification"
          icon={Tag}
          value={filters.classification}
          options={dynamicClassifications}
          onChange={(val) => onChangeFilter('classification', val)}
          sitesData={sitesData}
          filterKey="classification"
        />

        {/* 6. أسباب التعذر */}
        <SingleFilterDropdown
          id="filter-obstacle-reason"
          label="أسباب التعذر"
          labelEn="Stall / Obstacle Reason"
          icon={AlertCircle}
          value={filters.obstacleReason}
          options={dynamicObstacleReasons}
          onChange={(val) => onChangeFilter('obstacleReason', val)}
          sitesData={sitesData}
          filterKey="obstacleReason"
        />
      </div>
    </div>
  );
};

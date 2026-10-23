// src/components/WeDataManagerModal.tsx
// Data Management & Cleaning Modal for WE Central Records (Supabase)
// Supports searching, editing, individual delete, bulk delete, and custom clean CSV export

import React, { useState, useMemo } from 'react';
import type { WeRecord } from '../config/fieldConfig';
import { FIELD_CONFIG } from '../config/fieldConfig';
import { deleteRecord, deleteRecordsBulk, exportCleanCSV } from '../hooks/useWeAPI';
import { 
  Trash2, 
  Edit3, 
  Download, 
  Search, 
  Filter, 
  CheckSquare, 
  Square, 
  AlertTriangle, 
  X, 
  Columns,
  RefreshCw
} from 'lucide-react';

interface WeDataManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: WeRecord[];
  onRefresh: () => Promise<void>;
  onEditRecord: (siteCode: string) => void;
}

export const WeDataManagerModal: React.FC<WeDataManagerModalProps> = ({
  isOpen,
  onClose,
  records,
  onRefresh,
  onEditRecord,
}) => {
  if (!isOpen) return null;

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'incomplete' | 'obstacles' | 'stalled' | 'completed'>('all');
  
  // Selection State for Bulk Delete
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; ids: string[]; message: string } | null>(null);
  
  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Column Customizer State for CSV Export
  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false);
  
  // Default selected columns for clean CSV (hide empty or internal technical keys)
  const defaultColumns = useMemo(() => {
    return FIELD_CONFIG.map(f => f.csvColumn);
  }, []);

  const [selectedColumns, setSelectedColumns] = useState<string[]>(defaultColumns);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Filtered Records ──
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const siteCode = String(r['site code'] || '').toLowerCase();
        const sector = String(r['Exc sector'] || r['Sectore'] || '').toLowerCase();
        const central = String(r['السنترال'] || r['Zone'] || '').toLowerCase();
        const tasneef = String(r['التصنيف'] || '').toLowerCase();
        const obstacle = String(r['اسباب التعذر'] || '').toLowerCase();
        const notes = String(r['المستند'] || r['الجهة المطلوب الدعم منها'] || '').toLowerCase();

        const matches = siteCode.includes(q) || sector.includes(q) || central.includes(q) || tasneef.includes(q) || obstacle.includes(q) || notes.includes(q);
        if (!matches) return false;
      }

      // 2. Category Filter
      if (selectedFilter === 'incomplete') {
        const hasMissingCode = !r['site code'] || r['site code'].trim() === '';
        const hasMissingStatus = !r['التصنيف'] && !r['Site Status'];
        return hasMissingCode || hasMissingStatus;
      }

      if (selectedFilter === 'obstacles') {
        const t = String(r['التصنيف'] || '');
        return t.includes('معوق') || String(r['Site Status'] || '').toUpperCase().includes('PROBLEM');
      }

      if (selectedFilter === 'stalled') {
        const t = String(r['التصنيف'] || '');
        return t.includes('متعذر') || t.includes('متعثر') || t.includes('رفض');
      }

      if (selectedFilter === 'completed') {
        const t = String(r['التصنيف'] || '');
        const ss = String(r['Site Status'] || '').toUpperCase();
        return t.includes('تشغيل') || t.includes('انتهاء') || ss.includes('ON AIR');
      }

      return true;
    });
  }, [records, searchQuery, selectedFilter]);

  // ── Selection Handlers ──
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const allFilteredIds = filteredRecords.map((r) => r._id).filter(Boolean);
    if (selectedIds.length === allFilteredIds.length && allFilteredIds.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allFilteredIds);
    }
  };

  // ── Delete Actions ──
  const handleTriggerSingleDelete = (record: WeRecord) => {
    setDeleteConfirm({
      isOpen: true,
      ids: [record._id],
      message: `هل أنت متأكد من حذف موقع WE رقم (${record['site code'] || 'بدون كود'}) نهائياً من قاعدة البيانات السحابية؟`,
    });
  };

  const handleTriggerBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setDeleteConfirm({
      isOpen: true,
      ids: selectedIds,
      message: `هل أنت متأكد من حذف (${selectedIds.length}) سجلات محددة نهائياً من قاعدة البيانات السحابية؟ لن يمكنك التراجع بعد الحذف.`,
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);

    try {
      if (deleteConfirm.ids.length === 1) {
        const res = await deleteRecord(deleteConfirm.ids[0]);
        if (res.success) {
          showToast('تم حذف السجل بنجاح من قاعدة البيانات السحابية');
          setSelectedIds((prev) => prev.filter((id) => id !== deleteConfirm.ids[0]));
          await onRefresh();
        } else {
          showToast(res.error || 'فشل في حذف السجل', 'error');
        }
      } else {
        const res = await deleteRecordsBulk(deleteConfirm.ids);
        if (res.success) {
          showToast(`تم حذف ${res.count || deleteConfirm.ids.length} سجل بنجاح`);
          setSelectedIds([]);
          await onRefresh();
        } else {
          showToast(res.error || 'فشل في حذف السجلات', 'error');
        }
      }
    } catch {
      showToast('حدث خطأ أثناء محاولة الحذف', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  // ── CSV Export with Selected Columns ──
  const handleExportCleanCSV = () => {
    exportCleanCSV(filteredRecords, selectedColumns, 'WE_Clean_Data');
    showToast(`تم تصدير ${filteredRecords.length} سجل إلى CSV بالأعمدة المحددة`);
  };

  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) => 
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const selectAllColumns = () => setSelectedColumns(defaultColumns);
  const deselectAllColumns = () => setSelectedColumns(['site code', 'التصنيف', 'Site Status']);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/30 border border-blue-400/30 rounded-xl text-blue-300">
              <Filter className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">إدارة وتعديل سجلات WE وتنظيف البيانات (CSV Manager)</h2>
                <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-200 text-xs rounded-full border border-blue-400/30 font-mono">
                  {records.length} سجل إجمالي
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                تعديل السجلات، حذف البيانات غير المهمة أو المكررة، واختيار الأعمدة لتصدير CSV نظيف
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Alert */}
        {toast && (
          <div
            className={`px-4 py-2.5 text-sm font-medium flex items-center justify-between ${
              toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-white/80 hover:text-white">✕</button>
          </div>
        )}

        {/* Toolbar & Filters */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              placeholder="بحث بكود الموقع، السنترال، التصنيف، المعوقات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                selectedFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              الكل ({records.length})
            </button>
            <button
              onClick={() => setSelectedFilter('obstacles')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                selectedFilter === 'obstacles'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-amber-700 hover:bg-amber-50 border border-slate-200'
              }`}
            >
              معوقات
            </button>
            <button
              onClick={() => setSelectedFilter('stalled')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                selectedFilter === 'stalled'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white text-rose-700 hover:bg-rose-50 border border-slate-200'
              }`}
            >
              متعثرات
            </button>
            <button
              onClick={() => setSelectedFilter('completed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                selectedFilter === 'completed'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-slate-200'
              }`}
            >
              تم التشغيل
            </button>
            <button
              onClick={() => setSelectedFilter('incomplete')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                selectedFilter === 'incomplete'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-purple-700 hover:bg-purple-50 border border-slate-200'
              }`}
              title="سجلات تفتقد لكود الموقع أو الحالة"
            >
              بيانات ناقصة
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Bulk Delete Button */}
            {selectedIds.length > 0 && (
              <button
                onClick={handleTriggerBulkDelete}
                className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 flex items-center gap-1.5 shadow-sm transition animate-pulse"
              >
                <Trash2 className="w-3.5 h-3.5" />
                حذف المحدد ({selectedIds.length})
              </button>
            )}

            {/* Customize Columns Button */}
            <button
              onClick={() => setIsColumnsModalOpen(true)}
              className="px-3 py-1.5 bg-white text-slate-700 border border-slate-300 text-xs font-medium rounded-lg hover:bg-slate-100 flex items-center gap-1.5 transition"
              title="تحديد الأعمدة المهمة لتصديرها"
            >
              <Columns className="w-3.5 h-3.5 text-slate-500" />
              أعمدة CSV ({selectedColumns.length})
            </button>

            {/* Clean CSV Export Button */}
            <button
              onClick={handleExportCleanCSV}
              className="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm transition"
              title="تصدير السجلات المفلترة بالأعمدة المحددة فقط"
            >
              <Download className="w-3.5 h-3.5" />
              تصدير CSV نظيف ({filteredRecords.length})
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              className="p-1.5 bg-white text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-100 transition"
              title="تحديث البيانات"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Selection summary bar if active */}
        {selectedIds.length > 0 && (
          <div className="px-6 py-2 bg-blue-50 border-b border-blue-200 text-xs text-blue-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold">تم تحديد {selectedIds.length} من أصل {filteredRecords.length} سجل</span>
              <button
                onClick={() => setSelectedIds([])}
                className="text-blue-600 underline hover:text-blue-800 mr-2"
              >
                إلغاء التحديد
              </button>
            </div>
            <span className="text-slate-500">
              يمكنك الآن حذف السجلات المحددة بضغطة واحدة من زر "حذف المحدد"
            </span>
          </div>
        )}

        {/* Data Table */}
        <div className="flex-1 overflow-auto bg-white">
          <table className="w-full text-right text-xs border-collapse">
            <thead className="bg-slate-100/90 text-slate-700 sticky top-0 z-10 shadow-sm border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-3 w-10 text-center">
                  <button
                    onClick={handleSelectAllFiltered}
                    className="text-slate-500 hover:text-slate-800"
                    title="تحديد الكل"
                  >
                    {filteredRecords.length > 0 && selectedIds.length === filteredRecords.length ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-3">كود الموقع</th>
                <th className="p-3">التصنيف</th>
                <th className="p-3">حالة الموقع (Site Status)</th>
                <th className="p-3">القطاع والمنطقة</th>
                <th className="p-3">السنترال / إدارة التنفيذ</th>
                <th className="p-3">أسباب التعذر / المعوقات</th>
                <th className="p-3">التاريخ المتوقع</th>
                <th className="p-3 w-28 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-400">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    لا توجد سجلات تطابق البحث أو الفلتر المحدد
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => {
                  const isSelected = selectedIds.includes(r._id);
                  const siteCode = r['site code'] || (r as any).site_code || '---';
                  const tasneef = r['التصنيف'] || '';
                  const status = r['Site Status'] || '';
                  const sector = r['Exc sector'] || r['Sectore'] || r['Exc Sectores'] || '';
                  const central = r['السنترال'] || r['اداره التنفيذ المختصه'] || r['Zone'] || '';
                  const obstacle = r['اسباب التعذر'] || '';
                  const expectedDate = r['التاريخ المتوقع للانتهاء'] || '';

                  return (
                    <tr
                      key={r._id || `we-row-${idx}`}
                      className={`hover:bg-blue-50/40 transition ${isSelected ? 'bg-blue-50/70' : ''}`}
                    >
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleToggleSelect(r._id)}
                          className="text-slate-400 hover:text-blue-600"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-800">
                        {siteCode}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            tasneef.includes('تشغيل')
                              ? 'bg-emerald-100 text-emerald-800'
                              : tasneef.includes('معوق')
                              ? 'bg-amber-100 text-amber-800'
                              : tasneef.includes('متعذر') || tasneef.includes('متعثر')
                              ? 'bg-rose-100 text-rose-800'
                              : tasneef.includes('تصاريح')
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {tasneef || 'غير محدد'}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-700">
                        {status || '---'}
                      </td>
                      <td className="p-3 text-slate-600 max-w-[160px] truncate" title={sector}>
                        {sector || '---'}
                      </td>
                      <td className="p-3 text-slate-600 max-w-[160px] truncate" title={central}>
                        {central || '---'}
                      </td>
                      <td className="p-3 text-slate-500 max-w-[180px] truncate" title={obstacle}>
                        {obstacle || 'لا يوجد'}
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">
                        {expectedDate || '---'}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit Row */}
                          <button
                            onClick={() => {
                              onEditRecord(siteCode);
                              onClose();
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition"
                            title="تعديل هذا السجل في النموذج"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {/* Delete Row */}
                          <button
                            onClick={() => handleTriggerSingleDelete(r)}
                            className="p-1.5 text-red-500 hover:bg-red-100 hover:text-red-700 rounded transition"
                            title="حذف هذا السجل نهائياً"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info & close */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            إجمالي السجلات المعروضة: <span className="font-bold text-slate-800">{filteredRecords.length}</span> من أصل <span className="font-bold text-slate-800">{records.length}</span> موقع
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 transition"
          >
            إغلاق
          </button>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 text-right animate-in fade-in">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center mb-2">
              تأكيد حذف البيانات نهائياً
            </h3>
            <p className="text-xs text-slate-600 text-center mb-6 leading-relaxed">
              {deleteConfirm.message}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-2"
              >
                {isDeleting ? 'جارِ الحذف من السحابة...' : 'نعم، حذف نهائي'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Columns Selector Modal for Clean CSV */}
      {isColumnsModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 text-right max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Columns className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  تحديد الأعمدة المهمة لتضمينها في ملف الـ CSV
                </h3>
              </div>
              <button
                onClick={() => setIsColumnsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              قم بإلغاء تحديد الأعمدة غير المهمة (مثل الإحداثيات أو الحقول الفارغة) ليتم تصدير ملف إكسل نظيف ومختصر:
            </p>

            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={selectAllColumns}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded transition"
              >
                تحديد جميع الأعمدة
              </button>
              <button
                onClick={deselectAllColumns}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded transition"
              >
                الأعمدة الأساسية فقط
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 p-1 border border-slate-100 rounded-lg">
              {defaultColumns.map((col) => {
                const isChecked = selectedColumns.includes(col);
                return (
                  <label
                    key={col}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition ${
                      isChecked ? 'bg-blue-50/60 font-semibold text-blue-900' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span>{col}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleColumn(col)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                تم اختيار {selectedColumns.length} من {defaultColumns.length} عمود
              </span>
              <button
                onClick={() => setIsColumnsModalOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                حفظ الاختيارات
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

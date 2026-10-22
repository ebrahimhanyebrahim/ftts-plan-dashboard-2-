// src/components/WeAddDataModal.tsx
// Dynamic data-entry modal driven by fieldConfig.ts color mapping.
// Site Code → auto-populate Blue → dropdown Green → editable Purple → Save

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getBlueFields,
  getGreenFields,
  getPurpleFields,
  getSortedFields,
} from '../config/fieldConfig';
import type { WeRecord } from '../config/fieldConfig';
import { fetchSiteRecord, fetchDropdownValues, saveRecord } from '../hooks/useWeAPI';

interface WeAddDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void; // callback to refresh dashboard after save
  allSiteCodes: string[]; // full list of site codes for search
}

type FormStep = 'select-site' | 'fill-form';

export const WeAddDataModal: React.FC<WeAddDataModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  allSiteCodes,
}) => {
  // ── State ──
  const [step, setStep] = useState<FormStep>('select-site');
  const [siteCodeSearch, setSiteCodeSearch] = useState('');
  const [selectedSiteCode, setSelectedSiteCode] = useState('');
  const [masterRecord, setMasterRecord] = useState<WeRecord | null>(null);
  const [formData, setFormData] = useState<WeRecord>({});
  const [dropdownValues, setDropdownValues] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<{
    message: string;
    existingRecord: WeRecord;
  } | null>(null);

  // Field groups
  const blueFields = useMemo(() => getBlueFields(), []);
  const greenFields = useMemo(() => getGreenFields(), []);
  const purpleFields = useMemo(() => getPurpleFields(), []);
  const sortedFields = useMemo(() => getSortedFields(), []);

  // Filtered site codes based on search
  const filteredCodes = useMemo(() => {
    if (!siteCodeSearch.trim()) return allSiteCodes.slice(0, 50); // Show first 50
    const q = siteCodeSearch.trim().toLowerCase();
    return allSiteCodes.filter(c => c.toLowerCase().includes(q)).slice(0, 50);
  }, [allSiteCodes, siteCodeSearch]);

  // ── Load dropdown values for green fields ──
  const loadDropdownValues = useCallback(async () => {
    const values: Record<string, string[]> = {};
    for (const field of greenFields) {
      try {
        const vals = await fetchDropdownValues(field.csvColumn);
        values[field.csvColumn] = vals;
      } catch {
        values[field.csvColumn] = [];
      }
    }
    setDropdownValues(values);
  }, [greenFields]);

  useEffect(() => {
    if (isOpen) {
      loadDropdownValues();
    }
  }, [isOpen, loadDropdownValues]);

  // ── Handle Site Code Selection ──
  const handleSelectSiteCode = async (code: string) => {
    setSelectedSiteCode(code);
    setLoading(true);
    setErrors({});
    setSuccessMessage('');
    setDuplicateWarning(null);

    const record = await fetchSiteRecord(code);
    if (record) {
      setMasterRecord(record);

      // Pre-populate form data with all values from master record
      const initial: WeRecord = {};
      sortedFields.forEach(f => {
        initial[f.csvColumn] = record[f.csvColumn] || '';
      });
      setFormData(initial);
      setStep('fill-form');
    } else {
      setErrors({ _general: `لم يتم العثور على بيانات للموقع: ${code}` });
    }
    setLoading(false);
  };

  // ── Handle form field change ──
  const handleFieldChange = (csvColumn: string, value: string) => {
    setFormData(prev => ({ ...prev, [csvColumn]: value }));
    // Clear error for this field
    if (errors[csvColumn]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[csvColumn];
        return next;
      });
    }
  };

  // ── Validate form ──
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Check required fields
    sortedFields.forEach(field => {
      if (field.required && field.color !== 'blue') {
        const val = formData[field.csvColumn]?.trim();
        if (!val) {
          newErrors[field.csvColumn] = `${field.label} مطلوب`;
        }
      }
    });

    // Validate numeric fields
    purpleFields.forEach(field => {
      const val = formData[field.csvColumn]?.trim();
      if (val) {
        if (field.inputType === 'number' || field.inputType === 'currency' || field.inputType === 'coordinate') {
          const num = parseFloat(val);
          if (isNaN(num)) {
            newErrors[field.csvColumn] = `${field.label}: يجب أن يكون رقماً`;
          } else if (field.validation) {
            if (field.validation.min !== undefined && num < field.validation.min) {
              newErrors[field.csvColumn] = field.validation.message || `القيمة أقل من الحد الأدنى`;
            }
            if (field.validation.max !== undefined && num > field.validation.max) {
              newErrors[field.csvColumn] = field.validation.message || `القيمة أكبر من الحد الأقصى`;
            }
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Handle Save ──
  const handleSave = async (forceUpdate = false) => {
    if (!validateForm()) return;

    setSaving(true);
    setDuplicateWarning(null);

    const result = await saveRecord(formData, forceUpdate);

    if (result.success) {
      setSuccessMessage(result.message || 'تم الحفظ بنجاح ✅');
      setTimeout(() => {
        resetForm();
        onSaved?.();
        onClose();
      }, 1500);
    } else if (result.error === 'DUPLICATE_RECORD') {
      setDuplicateWarning({
        message: result.message || 'سجل مكرر',
        existingRecord: result.existingRecord!,
      });
    } else {
      setErrors({ _general: result.error || 'حدث خطأ أثناء الحفظ' });
    }

    setSaving(false);
  };

  // ── Reset form ──
  const resetForm = () => {
    setStep('select-site');
    setSiteCodeSearch('');
    setSelectedSiteCode('');
    setMasterRecord(null);
    setFormData({});
    setErrors({});
    setSuccessMessage('');
    setDuplicateWarning(null);
  };

  // ── Handle close ──
  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        dir="rtl"
      >
        {/* ── Header ── */}
        <div className="bg-gradient-to-l from-blue-700 to-blue-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">إضافة / تحديث بيانات WE</h2>
            <p className="text-blue-200 text-sm mt-0.5">
              {step === 'select-site'
                ? 'الخطوة ١: اختر كود الموقع'
                : `الخطوة ٢: تعديل بيانات الموقع ${selectedSiteCode}`}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white text-2xl leading-none hover:bg-white/10 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* ── Success Message ── */}
        {successMessage && (
          <div className="bg-green-50 border-b border-green-200 px-6 py-3 flex items-center gap-2 text-green-800">
            <span className="text-xl">✅</span>
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* ── General Error ── */}
        {errors._general && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center gap-2 text-red-800">
            <span className="text-xl">❌</span>
            <span className="font-medium">{errors._general}</span>
          </div>
        )}

        {/* ── Duplicate Warning ── */}
        {duplicateWarning && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
            <div className="flex items-center gap-2 text-amber-800 mb-2">
              <span className="text-xl">⚠️</span>
              <span className="font-medium">{duplicateWarning.message}</span>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleSave(true)}
                className="px-4 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium transition-colors"
              >
                تحديث السجل الموجود
              </button>
              <button
                onClick={() => setDuplicateWarning(null)}
                className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* ── Content ── */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* ── Step 1: Site Code Selection ── */}
          {step === 'select-site' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                🔍 بحث كود الموقع (Site Code)
              </label>
              <input
                type="text"
                className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="ابدأ الكتابة للبحث عن كود الموقع... مثال: LALXN33439"
                value={siteCodeSearch}
                onChange={(e) => setSiteCodeSearch(e.target.value)}
                autoFocus
              />

              {/* Loading indicator */}
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="mr-3 text-gray-600">جاري تحميل بيانات الموقع...</span>
                </div>
              )}

              {/* Site code list */}
              {!loading && (
                <div className="mt-3 max-h-80 overflow-y-auto border border-gray-200 rounded-xl">
                  {filteredCodes.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      لا توجد نتائج مطابقة
                    </div>
                  ) : (
                    filteredCodes.map(code => (
                      <button
                        key={code}
                        onClick={() => handleSelectSiteCode(code)}
                        className="w-full text-right px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors flex items-center justify-between group"
                      >
                        <span className="font-mono text-blue-700 font-medium text-lg">{code}</span>
                        <span className="text-gray-400 group-hover:text-blue-500 text-sm">
                          اختر ←
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}

              <p className="text-xs text-gray-400 mt-3">
                يتم عرض أول 50 نتيجة. استخدم البحث لتضييق النتائج.
              </p>
            </div>
          )}

          {/* ── Step 2: Data Entry Form ── */}
          {step === 'fill-form' && masterRecord && (
            <div className="space-y-6">
              {/* Back button */}
              <button
                onClick={resetForm}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 transition-colors"
              >
                → العودة لاختيار موقع آخر
              </button>

              {/* ── BLUE FIELDS: Master Data (Read Only) ── */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                  <h3 className="font-bold text-blue-800 text-lg">
                    البيانات الأساسية (تلقائية - للقراءة فقط)
                  </h3>
                </div>
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {blueFields.map(field => (
                      <div key={field.csvColumn} className="flex flex-col">
                        <label className="text-xs font-medium text-blue-600 mb-1">
                          {field.label}
                          <span className="text-blue-400 mr-1">({field.labelEn})</span>
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={formData[field.csvColumn] || '—'}
                          className="bg-blue-100/50 border border-blue-200 rounded-lg px-3 py-2 text-gray-800 cursor-not-allowed text-sm"
                          tabIndex={-1}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── GREEN FIELDS: Dropdown Selections ── */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                  <h3 className="font-bold text-green-800 text-lg">
                    اختيارات محكومة (قوائم منسدلة)
                  </h3>
                </div>
                <div className="bg-green-50/70 border border-green-200 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {greenFields.map(field => (
                      <div key={field.csvColumn} className="flex flex-col">
                        <label className="text-xs font-medium text-green-700 mb-1">
                          {field.label}
                          <span className="text-green-500 mr-1">({field.labelEn})</span>
                          {field.required && <span className="text-red-500 mr-1">*</span>}
                        </label>
                        <select
                          value={formData[field.csvColumn] || ''}
                          onChange={(e) => handleFieldChange(field.csvColumn, e.target.value)}
                          className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all ${
                            errors[field.csvColumn]
                              ? 'border-red-400 bg-red-50 focus:ring-red-200'
                              : 'border-green-300 bg-white focus:border-green-500 focus:ring-green-200'
                          }`}
                        >
                          <option value="">-- اختر {field.label} --</option>
                          {(dropdownValues[field.csvColumn] || []).map(val => (
                            <option key={val} value={val}>
                              {val}
                            </option>
                          ))}
                        </select>
                        {errors[field.csvColumn] && (
                          <span className="text-red-500 text-xs mt-1">{errors[field.csvColumn]}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── PURPLE FIELDS: User Input ── */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 bg-purple-500 rounded-sm"></div>
                  <h3 className="font-bold text-purple-800 text-lg">
                    بيانات يدوية (إدخال المستخدم)
                  </h3>
                </div>
                <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {purpleFields.map(field => {
                      const inputProps: React.InputHTMLAttributes<HTMLInputElement> = {
                        type: 'text',
                      };

                      if (field.inputType === 'number' || field.inputType === 'currency') {
                        inputProps.type = 'number';
                        inputProps.step = 'any';
                        if (field.validation?.min !== undefined) inputProps.min = field.validation.min;
                        if (field.validation?.max !== undefined) inputProps.max = field.validation.max;
                      }
                      if (field.inputType === 'coordinate') {
                        inputProps.type = 'number';
                        inputProps.step = '0.000001';
                        if (field.validation?.min !== undefined) inputProps.min = field.validation.min;
                        if (field.validation?.max !== undefined) inputProps.max = field.validation.max;
                      }
                      if (field.inputType === 'date') {
                        inputProps.type = 'date';
                      }

                      return (
                        <div key={field.csvColumn} className="flex flex-col">
                          <label className="text-xs font-medium text-purple-700 mb-1">
                            {field.label}
                            <span className="text-purple-500 mr-1">({field.labelEn})</span>
                            {field.required && <span className="text-red-500 mr-1">*</span>}
                          </label>
                          <input
                            {...inputProps}
                            value={formData[field.csvColumn] || ''}
                            onChange={(e) => handleFieldChange(field.csvColumn, e.target.value)}
                            placeholder={field.labelEn}
                            className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all ${
                              errors[field.csvColumn]
                                ? 'border-red-400 bg-red-50 focus:ring-red-200'
                                : 'border-purple-300 bg-white focus:border-purple-500 focus:ring-purple-200'
                            }`}
                          />
                          {errors[field.csvColumn] && (
                            <span className="text-red-500 text-xs mt-1">{errors[field.csvColumn]}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer / Actions ── */}
        {step === 'fill-form' && (
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></span> تلقائي
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-sm"></span> قائمة منسدلة
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                <span className="w-2.5 h-2.5 bg-purple-500 rounded-sm"></span> إدخال يدوي
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-medium text-sm transition-colors"
                disabled={saving}
              >
                إلغاء
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-l from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium text-sm shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    جاري الحفظ...
                  </>
                ) : (
                  <>💾 حفظ وإرسال</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

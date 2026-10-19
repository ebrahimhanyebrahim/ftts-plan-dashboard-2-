// src/components/WeAddDataModal.tsx
import React, { useState, useMemo } from 'react';
import type { SiteRecord } from '../types/dashboard';

interface WeAddDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingSites: SiteRecord[]; // existing WE sites (including custom)
  onAddSite: (site: SiteRecord) => void;
}

// Cascading fields (displayed in blue selects)
const cascadeFields: (keyof SiteRecord)[] = [
  'classification', // Type
  'competentAdmin', // إدارة التنفيذ المختصة
  'central', // السنترال
  'zone', // Zone
  'sector', // Sectore (region)
  'status', // Site Status
];

export const WeAddDataModal: React.FC<WeAddDataModalProps> = ({ isOpen, onClose, existingSites, onAddSite }) => {
  const [selections, setSelections] = useState<Partial<Record<keyof SiteRecord, string>>>({});
  const [notes, setNotes] = useState('');

  // Compute available options for each field based on previous selections
  const options = useMemo(() => {
    const opts: Partial<Record<keyof SiteRecord, string[]>> = {};
    let filtered = existingSites;
    cascadeFields.forEach((field) => {
      const values = Array.from(new Set(filtered.map((s) => s[field] ?? '').filter(Boolean)));
      opts[field] = values;
      const chosen = selections[field];
      if (chosen) {
        filtered = filtered.filter((s) => s[field] === chosen);
      }
    });
    return opts;
  }, [existingSites, selections]);

  const handleChange = (field: keyof SiteRecord, value: string) => {
    setSelections((prev) => ({ ...prev, [field]: value }));
    // Reset downstream selections
    const idx = cascadeFields.indexOf(field);
    const downstream = cascadeFields.slice(idx + 1);
    const cleared = { ...prev } as Partial<Record<keyof SiteRecord, string>>;
    downstream.forEach((f) => delete cleared[f]);
    setSelections(cleared);
  };

  const handleSubmit = () => {
    const siteCode = `WE-${Date.now()}`;
    const siteName = `برج WE رقم ${siteCode} - ${selections['central'] || ''}`;
    const newSite: SiteRecord = {
      id: `WE-CUSTOM-${Date.now()}`,
      siteCode,
      siteName,
      company: 'WE',
      status: selections['status'] || 'جاري المعاينة',
      linksCount: 1,
      sector: selections['sector'] || '',
      generalAdmin: selections['competentAdmin'] || '',
      competentAdmin: selections['competentAdmin'] || '',
      central: selections['central'] || '',
      classification: selections['classification'] || '',
      obstacleReason: '',
      expectedDate: '2026-12-31',
      progressPercent: 0,
      civilContractor: '',
      notes,
    };
    onAddSite(newSite);
    // Reset form
    setSelections({});
    setNotes('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">إضافة بيانات WE</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {cascadeFields.map((field) => (
            <div key={field} className="mb-3">
              <label className="block mb-1 capitalize text-sm font-medium">
                {field === 'classification' ? 'Type' :
                  field === 'competentAdmin' ? 'إدارة التنفيذ المختصة' :
                  field === 'central' ? 'السنترال' :
                  field === 'zone' ? 'Zone' :
                  field === 'sector' ? 'Sectore' :
                  field === 'status' ? 'Site Status' : field}
              </label>
              <select
                className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500 bg-blue-50"
                value={selections[field] || ''}
                onChange={(e) => handleChange(field, e.target.value)}
                required
              >
                <option value="" disabled>
                  اختر {field}
                </option>
                {options[field]?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <div className="mb-3">
            <label className="block mb-1 text-sm font-medium">الملاحظات</label>
            <textarea
              className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أدخل ملاحظاتك هنا..."
            />
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              onClick={onClose}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              حفظ وإضافة الموقع
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

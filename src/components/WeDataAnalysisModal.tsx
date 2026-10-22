// src/components/WeDataAnalysisModal.tsx
import React from 'react';
import { WeDataAnalysis } from './WeDataAnalysis';
import type { SiteRecord } from '../types/dashboard';

interface WeDataAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  weSites: SiteRecord[];
}

export const WeDataAnalysisModal: React.FC<WeDataAnalysisModalProps> = ({ isOpen, onClose, weSites }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-200">
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">📊 تحليل وتوزيع بيانات WE</h2>
            <p className="text-xs text-slate-500 mt-1">ملخص حالات المواقع ومسارات الربط التراسلي</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>
        <WeDataAnalysis weSites={weSites} />
        <div className="mt-6 pt-3 border-t border-slate-100 text-left">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

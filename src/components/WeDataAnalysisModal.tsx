// src/components/WeDataAnalysisModal.tsx
import React from 'react';
import { WeDataAnalysis } from './WeDataAnalysis';

interface WeDataAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Pass the WE sites data for analysis
  weSites: any[]; // Using any for simplicity; actual type matches SiteRecord[]
}

export const WeDataAnalysisModal: React.FC<WeDataAnalysisModalProps> = ({ isOpen, onClose, weSites }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">تحليل بيانات WE</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>
        <WeDataAnalysis sites={weSites} />
      </div>
    </div>
  );
};

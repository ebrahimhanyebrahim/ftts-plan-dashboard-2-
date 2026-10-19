// src/components/WeDataAnalysis.tsx
import React from 'react';
import { DonutChart } from './DonutChart';
import { SummaryTable } from './SummaryTable';
import type { SiteRecord } from '../types/dashboard';

interface WeDataAnalysisProps {
  isOpen: boolean;
  onClose: () => void;
  weSites: SiteRecord[];
}

export const WeDataAnalysis: React.FC<WeDataAnalysisProps> = ({ isOpen, onClose, weSites }) => {
  if (!isOpen) return null;

  // Compute simple status breakdown for WE sites
  const statusCounts: Record<string, number> = {};
  weSites.forEach((s) => {
    statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
  });
  const data = Object.entries(statusCounts).map(([status, count]) => ({ name: status, value: count }));

  const totalSites = weSites.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">تحليل بيانات WE</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DonutChart data={data} totalSites={totalSites} activeStatusFilter="" onSelectStatus={() => {}} />
          <SummaryTable
            data={data}
            totalSites={totalSites}
            totalLinks={weSites.reduce((sum, s) => sum + (s.linksCount ?? 0), 0)}
            activeStatusFilter=""
            onSelectStatus={() => {}}
            onOpenDetailsModal={() => {}}
          />
        </div>
        <div className="mt-4 text-right">
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

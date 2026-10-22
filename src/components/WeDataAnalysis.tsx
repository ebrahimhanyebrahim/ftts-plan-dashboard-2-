// src/components/WeDataAnalysis.tsx
import React from 'react';
import { DonutChart } from './DonutChart';
import { SummaryTable } from './SummaryTable';
import type { SiteRecord } from '../types/dashboard';
import { calculateStatusSummaries } from '../data/dashboardData';

export interface WeDataAnalysisProps {
  weSites: SiteRecord[];
}

export const WeDataAnalysis: React.FC<WeDataAnalysisProps> = ({ weSites }) => {
  const data = calculateStatusSummaries(weSites);
  const totalSites = weSites.length;

  return (
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
  );
};

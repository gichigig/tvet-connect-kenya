// Stub components to resolve missing component prop errors

import React from 'react';

interface StatsWidgetProps {
  stats: any;
}

export const StatsWidget: React.FC<StatsWidgetProps> = ({ stats }) => (
  <div>Stats Widget - {JSON.stringify(stats)}</div>
);

interface UnitDetailProps {
  unit: any;
  onBack: () => void;
}

export const UnitDetail: React.FC<UnitDetailProps> = ({ unit, onBack }) => (
  <div>
    <button onClick={onBack}>Back</button>
    <h1>Unit: {unit?.name}</h1>
  </div>
);

interface LecturerStatsProps {
  stats: any;
}

export const LecturerStats: React.FC<LecturerStatsProps> = ({ stats }) => (
  <div>Lecturer Stats - {JSON.stringify(stats)}</div>
);

interface StudentStatsProps {
  stats: any;
}

export const StudentStats: React.FC<StudentStatsProps> = ({ stats }) => (
  <div>Student Stats - {JSON.stringify(stats)}</div>
);
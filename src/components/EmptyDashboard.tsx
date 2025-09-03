import React from 'react';

interface EmptyDashboardProps {
  role: string;
  firstName: string;
}

export const EmptyDashboard: React.FC<EmptyDashboardProps> = ({ role, firstName }) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Welcome, {firstName}!
        </h2>
        <p className="text-muted-foreground mb-4">Role: {role}</p>
        <p className="text-sm text-muted-foreground">
          Your dashboard is being developed and will be available soon.
        </p>
      </div>
    </div>
  );
};
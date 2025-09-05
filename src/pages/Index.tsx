import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import SimpleAdminDashboard from '@/components/SimpleAdminDashboard';
import { EmptyDashboard } from '@/components/EmptyDashboard';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Protected route will handle redirect if user is not authenticated

  // Render different dashboards based on role
  switch (user.role) {
    case 'admin':
    case 'registrar':
      return <SimpleAdminDashboard />;
    
    case 'student':
    case 'lecturer':
    case 'finance':
    case 'hod':
      return <EmptyDashboard role={user.role} firstName={user.firstName} />;
    
    default:
      return <EmptyDashboard role={user.role} firstName={user.firstName} />;
  }
};

export default Index;
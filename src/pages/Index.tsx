import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import SimpleAdminDashboard from '@/components/SimpleAdminDashboard';
import { StudentDashboard } from '@/components/StudentDashboard';
import { LecturerDashboard } from '@/components/LecturerDashboard';
import { FinanceDashboard } from '@/components/FinanceDashboard';
import { HodDashboard } from '@/components/HodDashboard';
import { RegistrarDashboard } from '@/components/RegistrarDashboard';

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
      return <SimpleAdminDashboard />;
    
    case 'registrar':
      return <RegistrarDashboard />;
    
    case 'student':
      return <StudentDashboard />;
    
    case 'lecturer':
      return <LecturerDashboard />;
    
    case 'finance':
      return <FinanceDashboard />;
    
    case 'hod':
      return <HodDashboard />;
    
    default:
      return <SimpleAdminDashboard />; // Default to simple admin dashboard for any unknown roles
  }
};

export default Index;
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">TVET Connect Kenya</h1>
          <p className="text-xl text-gray-600 mb-8">Student Management System</p>
          <div className="space-y-4">
            <a 
              href="/simple-login" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login to Continue
            </a>
            <p className="text-sm text-gray-500">
              Please login to access the system
            </p>
          </div>
        </div>
      </div>
    );
  }

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
import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import SimpleAdminDashboard from '@/components/SimpleAdminDashboard';

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
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome, {user.firstName}!</h2>
            <p className="text-gray-600">Student dashboard coming soon...</p>
          </div>
        </div>
      );
    
    case 'lecturer':
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome, {user.firstName}!</h2>
            <p className="text-gray-600">Lecturer dashboard coming soon...</p>
          </div>
        </div>
      );
    
    default:
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome, {user.firstName}!</h2>
            <p className="text-gray-600">Role: {user.role}</p>
            <p className="text-gray-500 mt-2">Dashboard for your role is being developed...</p>
          </div>
        </div>
      );
  }
};

export default Index;
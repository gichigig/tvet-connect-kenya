import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Navigate } from "react-router-dom";

interface SupabaseProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'lecturer' | 'admin' | 'hod' | 'registrar' | 'finance';
  requireApproval?: boolean;
}

export const SupabaseProtectedRoute = ({ 
  children, 
  requiredRole,
  requireApproval = true 
}: SupabaseProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user needs approval and isn't approved
  if (requireApproval && !user.approved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-lg">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Account Pending Approval</h1>
          <p className="text-gray-600 mb-4">
            Your account is pending approval by an administrator. Please contact support if you need assistance.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              <strong>Name:</strong> {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-gray-500">
              <strong>Role:</strong> {user.role}
            </p>
            <p className="text-sm text-gray-500">
              <strong>Email:</strong> {user.email}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check role requirement
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-lg">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">
            You don't have permission to access this page. Required role: {requiredRole}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

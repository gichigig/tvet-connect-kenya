import { useAuth } from '@/contexts/SupabaseAuthContext';

export const debugUserState = () => {
  console.log('=== USER DEBUG ===');
  
  // Get auth context
  const auth = useAuth();
  
  console.log('Auth context:', auth);
  console.log('User:', auth?.user);
  console.log('User role:', auth?.user?.role);
  console.log('Is authenticated:', auth?.isAuthenticated);
  console.log('Is admin:', auth?.isAdmin);
  
  // Log all users
  const allUsers = auth?.getAllUsers ? auth.getAllUsers() : [];
  console.log('All users:', allUsers);
  
  // Log users by role
  const registrarUsers = allUsers.filter(u => u.role === 'registrar');
  console.log('Registrar users:', registrarUsers);
  
  return {
    currentUser: auth?.user,
    allUsers,
    registrarUsers
  };
};

export const createTestRegistrarUser = () => {
  // This would be used to create a test registrar user
  const testRegistrar = {
    id: 'test-registrar-001',
    email: 'registrar@tvet.edu',
    name: 'Test Registrar',
    role: 'registrar' as const,
    approved: true,
    active: true,
    profilePicture: '',
    phone: '+254700000000'
  };
  
  console.log('Test registrar user structure:', testRegistrar);
  return testRegistrar;
};

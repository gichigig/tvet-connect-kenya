import React from 'react';
import AdminCreator from '../components/admin/AdminCreator';

const CreateAdminPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Admin User
          </h1>
          <p className="text-gray-600">
            Create an admin user that will appear in your Supabase Users dashboard
          </p>
        </div>
        
        <AdminCreator />
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Manual Creation (Alternative)</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>If the form above doesn't work, you can create admin manually:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Go to <a href="https://supabase.com/dashboard/project/ympnvccreuhxouyovszg/auth/users" 
                  target="_blank" rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline">
                  Supabase Users Dashboard
                </a></li>
              <li>Click "Add user" button</li>
              <li>Fill in:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Email: admin@tvetkenya.com</li>
                  <li>Password: admin123</li>
                  <li>Auto Confirm User: ✅ Yes</li>
                  <li>Send Email Confirmation: ❌ No</li>
                </ul>
              </li>
              <li>Click "Create user"</li>
              <li>The user will appear in your Users dashboard immediately</li>
              <li>Test login at <a href="/supabase-login" className="text-blue-600 hover:underline">/supabase-login</a></li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAdminPage;

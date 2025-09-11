import React from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Bell, LogOut, Settings, User } from "lucide-react";

export const StudentDashboardTopbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.firstName?.charAt(0) || 'S'}
          </div>
          <div>
            <h2 className="font-semibold text-lg">
              Welcome, {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm text-gray-600">Student Dashboard</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <User className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

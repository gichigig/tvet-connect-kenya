import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  LogOut, 
  User, 
  Settings, 
  Bell, 
  GraduationCap,
  Menu
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  showNotifications?: boolean;
  notificationCount?: number;
  additionalActions?: React.ReactNode;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  showNotifications = true,
  notificationCount = 0,
  additionalActions
}) => {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Logout error",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const firstInitial = user.firstName?.[0] || '';
    const lastInitial = user.lastName?.[0] || '';
    return `${firstInitial}${lastInitial}`.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U';
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'registrar': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'lecturer': return 'bg-green-100 text-green-800 border-green-200';
      case 'student': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'hod': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'finance': return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-600">{subtitle}</p>
                )}
              </div>
            </div>
          </div>

          {/* Center - Mobile Title */}
          <div className="md:hidden flex-1 text-center">
            <h1 className="text-lg font-semibold text-gray-900 truncate px-4">{title}</h1>
          </div>

          {/* Right side - Actions and User Menu */}
          <div className="flex items-center space-x-3">
            {/* Additional Actions */}
            {additionalActions && (
              <div className="hidden sm:flex items-center space-x-2">
                {additionalActions}
              </div>
            )}

            {/* Notifications */}
            {showNotifications && (
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
                  >
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Badge>
                )}
              </Button>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={user?.firstName || 'User'} />
                    <AvatarFallback className="text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={user?.firstName || 'User'} />
                      <AvatarFallback className="text-xs">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium leading-none">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground mt-1">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-start pt-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getRoleBadgeColor(user?.role || '')}`}
                    >
                      {user?.role?.toUpperCase() || 'USER'}
                    </Badge>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                {showNotifications && (
                  <DropdownMenuItem>
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Notifications</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu (if needed for additional actions) */}
            {additionalActions && (
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="p-2">
                      {additionalActions}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

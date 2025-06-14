
import { Button } from "@/components/ui/button";
import { BookOpen, User, Search, LogOut, Shield, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onSearch: (query: string) => void;
}

export const Header = ({ onSearch }: HeaderProps) => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    if (path === '/admin') {
      window.location.reload();
    } else if (path === '/courses') {
      window.location.reload();
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">TVET Kenya</h1>
          </Link>
          
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search TVET courses..."
                className="pl-10"
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {isAdmin && (
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleNavigation('/admin')}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Panel
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleNavigation('/courses')}
                    >
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Courses
                    </Button>
                  </div>
                )}
                {!isAdmin && (
                  <Button variant="ghost" size="sm">
                    My Courses
                  </Button>
                )}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {user.role.toUpperCase()}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

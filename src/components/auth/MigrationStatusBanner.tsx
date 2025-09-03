/**
 * Migration Status Banner Component
 * Shows users their migration progress and allows manual migration
 */

import React from 'react';
import { AlertCircle, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useHybridAuth } from '@/hooks/useHybridAuth';
import { useToast } from '@/hooks/use-toast';

export const MigrationStatusBanner: React.FC = () => {
  const { user, authProvider, isUserMigrated, forceMigration, loading } = useHybridAuth();
  const { toast } = useToast();
  const [migrating, setMigrating] = React.useState(false);

  // Don't show banner if not logged in or already fully migrated
  if (!user || (authProvider === 'supabase' && isUserMigrated)) {
    return null;
  }

  const handleForceMigration = async () => {
    try {
      setMigrating(true);
      const success = await forceMigration();
      
      if (success) {
        toast({
          title: 'Migration Successful!',
          description: 'Your account has been fully migrated to our new system.',
        });
      }
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setMigrating(false);
    }
  };

  const getMigrationStatus = () => {
    if (authProvider === 'firebase' && !isUserMigrated) {
      return {
        status: 'pending',
        progress: 25,
        title: 'Account Migration In Progress',
        description: 'Your account is being migrated to our improved system.',
        action: 'Complete Migration',
        variant: 'default' as const,
        icon: AlertCircle,
        color: 'bg-yellow-500'
      };
    }
    
    if (authProvider === 'firebase' && isUserMigrated) {
      return {
        status: 'partial',
        progress: 75,
        title: 'Migration Nearly Complete',
        description: 'Switch to the new system for the best experience.',
        action: 'Switch Now',
        variant: 'default' as const,
        icon: ArrowRight,
        color: 'bg-blue-500'
      };
    }
    
    if (authProvider === 'supabase' && !isUserMigrated) {
      return {
        status: 'new-user',
        progress: 100,
        title: 'Welcome to Our New System!',
        description: 'You\'re using our latest authentication system.',
        action: null,
        variant: 'default' as const,
        icon: CheckCircle,
        color: 'bg-green-500'
      };
    }

    return null;
  };

  const migrationInfo = getMigrationStatus();
  
  if (!migrationInfo) return null;

  const Icon = migrationInfo.icon;

  return (
    <Alert className="mb-4 border-l-4" style={{ borderLeftColor: migrationInfo.color }}>
      <Icon className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium">{migrationInfo.title}</h4>
            <Badge variant="outline" className="text-xs">
              {authProvider === 'firebase' ? 'Firebase' : 'New System'}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            {migrationInfo.description}
          </p>
          
          <div className="flex items-center gap-2 mb-2">
            <Progress value={migrationInfo.progress} className="flex-1" />
            <span className="text-xs text-muted-foreground">
              {migrationInfo.progress}%
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${migrationInfo.progress >= 25 ? 'bg-green-500' : 'bg-gray-300'}`} />
              Account Created
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${migrationInfo.progress >= 50 ? 'bg-green-500' : 'bg-gray-300'}`} />
              Data Synced
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${migrationInfo.progress >= 75 ? 'bg-green-500' : 'bg-gray-300'}`} />
              Ready to Switch
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${migrationInfo.progress >= 100 ? 'bg-green-500' : 'bg-gray-300'}`} />
              Complete
            </div>
          </div>
        </div>
        
        {migrationInfo.action && (
          <div className="ml-4">
            <Button
              onClick={handleForceMigration}
              disabled={migrating || loading}
              size="sm"
              className="gap-2"
            >
              {migrating ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Migrating...
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3" />
                  {migrationInfo.action}
                </>
              )}
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

/**
 * Migration Notice Component for Login/Signup pages
 */
export const MigrationNotice: React.FC = () => {
  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50">
      <AlertCircle className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <strong>System Upgrade in Progress</strong>
        <br />
        We're migrating to a new and improved authentication system. 
        Your existing credentials will work, and your account will be 
        automatically upgraded for better performance and security.
      </AlertDescription>
    </Alert>
  );
};

/**
 * Admin Migration Dashboard Component
 */
interface MigrationDashboardProps {
  className?: string;
}

export const MigrationDashboard: React.FC<MigrationDashboardProps> = ({ className }) => {
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    migratedUsers: 0,
    pendingMigrations: 0,
    failedMigrations: 0
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchMigrationStats();
  }, []);

  const fetchMigrationStats = async () => {
    try {
      const response = await fetch('/api/auth/migration-stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch migration stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const migrationProgress = stats.totalUsers > 0 
    ? (stats.migratedUsers / stats.totalUsers) * 100 
    : 0;

  return (
    <div className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Migration Progress</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <div className="text-sm text-muted-foreground">Total Users</div>
        </div>
        
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.migratedUsers}</div>
          <div className="text-sm text-muted-foreground">Migrated</div>
        </div>
        
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{stats.pendingMigrations}</div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </div>
        
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold text-red-600">{stats.failedMigrations}</div>
          <div className="text-sm text-muted-foreground">Failed</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Migration Progress</span>
          <span>{migrationProgress.toFixed(1)}%</span>
        </div>
        <Progress value={migrationProgress} />
      </div>
    </div>
  );
};

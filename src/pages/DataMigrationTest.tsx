import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { FirestoreToSupabaseMigration } from '@/services/FirestoreToSupabaseMigration';
import { Badge } from '@/components/ui/badge';

const DataMigrationTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [migrationResults, setMigrationResults] = useState(null);
  const [migrationStatus, setMigrationStatus] = useState({});
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [logs, setLogs] = useState([]);
  const { toast } = useToast();

  const migration = FirestoreToSupabaseMigration.getInstance();

  useEffect(() => {
    checkMigrationStatus();
  }, []);

  const checkMigrationStatus = async () => {
    try {
      const status = await migration.getMigrationStatus();
      setMigrationStatus(status);
    } catch (error) {
      console.error('Failed to check migration status:', error);
    }
  };

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, timestamp }]);
    setCurrentStep(message);
  };

  const startMigration = async () => {
    setIsLoading(true);
    setLogs([]);
    setProgress(0);
    setMigrationResults(null);

    try {
      addLog('🚀 Starting complete data migration...');

      const results = await migration.migrateAllData((progressMessage) => {
        addLog(progressMessage);
        
        // Estimate progress based on message content
        if (progressMessage.includes('Starting')) {
          setProgress(5);
        } else if (progressMessage.includes('Migrating')) {
          setProgress(prev => Math.min(prev + 10, 90));
        } else if (progressMessage.includes('complete')) {
          setProgress(100);
        }
      });

      setMigrationResults(results);
      setProgress(100);

      const successCount = results.successes.reduce((sum, item) => sum + item.count, 0);
      
      toast({
        title: 'Migration Complete!',
        description: `Successfully migrated ${successCount} records from ${results.successes.length} collections.`,
        duration: 5000,
      });

      // Refresh status
      await checkMigrationStatus();

    } catch (error) {
      addLog(`💥 Migration failed: ${error.message}`);
      toast({
        title: 'Migration Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const migrateSpecificCollection = async (firestoreCollection, supabaseTable) => {
    try {
      setLogs([]);
      addLog(`🔄 Migrating ${firestoreCollection} to ${supabaseTable}...`);

      const result = await migration.migrateCollection(firestoreCollection, supabaseTable);
      
      if (result.success) {
        addLog(`✅ Successfully migrated ${result.count} records`);
        toast({
          title: 'Collection Migrated',
          description: `${firestoreCollection}: ${result.count} records migrated`,
        });
      } else {
        addLog(`❌ Migration failed: ${result.error}`);
        toast({
          title: 'Migration Failed',
          description: result.error,
          variant: 'destructive',
        });
      }

      await checkMigrationStatus();
    } catch (error) {
      addLog(`💥 Error: ${error.message}`);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getMigrationStatusBadge = (collectionStatus) => {
    if (collectionStatus.error) {
      return <Badge variant="destructive">Error</Badge>;
    }
    if (collectionStatus.migrated) {
      return <Badge variant="default">✅ Migrated</Badge>;
    }
    if (collectionStatus.supabase > 0) {
      return <Badge variant="secondary">⚠️ Partial</Badge>;
    }
    return <Badge variant="outline">❌ Not Migrated</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle>Firestore to Supabase Data Migration</CardTitle>
            <CardDescription>
              Migrate units, assignments, semester plans, and other data from Firestore to Supabase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button 
                onClick={startMigration} 
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? 'Migrating...' : 'Start Complete Migration'}
              </Button>
              <Button 
                variant="outline" 
                onClick={checkMigrationStatus}
              >
                Refresh Status
              </Button>
            </div>

            {isLoading && (
              <div className="mt-4">
                <div className="mb-2">
                  <span className="text-sm text-gray-600">{currentStep}</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Migration Status */}
        <Card>
          <CardHeader>
            <CardTitle>Migration Status</CardTitle>
            <CardDescription>
              Current status of data collections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(migrationStatus).map(([collection, status]) => {
                const collectionStatus = status as any;
                return (
                <Card key={collection} className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold capitalize">{collection}</h3>
                    {getMigrationStatusBadge(collectionStatus)}
                  </div>
                  <div className="text-sm space-y-1">
                    <div>Firestore: <span className="font-mono">{collectionStatus.firestore}</span></div>
                    <div>Supabase: <span className="font-mono">{collectionStatus.supabase}</span></div>
                    {collectionStatus.error && (
                      <div className="text-red-600 text-xs">{collectionStatus.error}</div>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-2 w-full"
                    onClick={() => migrateSpecificCollection(collection, collection)}
                  >
                    Migrate Collection
                  </Button>
                </Card>
              )})}
            </div>
          </CardContent>
        </Card>

        {/* Migration Results */}
        {migrationResults && (
          <Card>
            <CardHeader>
              <CardTitle>Migration Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Card className="bg-green-50">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {migrationResults.successes.length}
                    </div>
                    <div className="text-sm text-green-600">Collections Migrated</div>
                  </CardContent>
                </Card>
                <Card className="bg-red-50">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-red-600">
                      {migrationResults.failures.length}
                    </div>
                    <div className="text-sm text-red-600">Failed Collections</div>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {migrationResults.successes.reduce((sum, item) => sum + item.count, 0)}
                    </div>
                    <div className="text-sm text-blue-600">Total Records</div>
                  </CardContent>
                </Card>
              </div>

              {/* Success Details */}
              {migrationResults.successes.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2 text-green-600">Successfully Migrated:</h3>
                  <div className="space-y-1">
                    {migrationResults.successes.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.collection}</span>
                        <Badge variant="outline">{item.count} records</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Failure Details */}
              {migrationResults.failures.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-red-600">Failed Migrations:</h3>
                  <div className="space-y-2">
                    {migrationResults.failures.map((item, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium">{item.collection}</div>
                        <div className="text-red-600 text-xs">{item.error}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Migration Log */}
        <Card>
          <CardHeader>
            <CardTitle>Migration Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet. Start a migration to see progress...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index}>
                    <span className="text-gray-400">[{log.timestamp}]</span> {log.message}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Important Notes:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Make sure Supabase database schema is deployed before migration</li>
              <li>• This migration will copy data from Firestore to Supabase</li>
              <li>• Original Firestore data will remain unchanged</li>
              <li>• Duplicate records will be skipped automatically</li>
              <li>• Check your Supabase dashboard after migration to verify data</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataMigrationTest;

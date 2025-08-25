/**
 * Fallback Storage Indicator
 * Shows users when files are stored in fallback mode due to infrastructure issues
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, HardDrive, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FallbackUploadService } from '@/services/FallbackUploadService';

interface FallbackStorageIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export const FallbackStorageIndicator: React.FC<FallbackStorageIndicatorProps> = ({
  className = '',
  showDetails = false
}) => {
  const [storageInfo, setStorageInfo] = useState<{
    count: number;
    sizeBytes: number;
    maxSizeBytes: number;
  } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check for fallback storage on mount
    const info = FallbackUploadService.getStorageInfo();
    if (info.count > 0) {
      setStorageInfo(info);
    }
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleClearStorage = () => {
    if (confirm('Clear all temporary files? This cannot be undone.')) {
      FallbackUploadService.clearFallbackStorage();
      setStorageInfo(null);
      setIsExpanded(false);
    }
  };

  // Don't show if no fallback storage or if dismissed
  if (!storageInfo || storageInfo.count === 0 || isDismissed) {
    return null;
  }

  return (
    <div className={`fallback-storage-indicator ${className}`}>
      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            <span className="text-sm">
              <strong>{storageInfo.count}</strong> files stored temporarily 
              ({formatBytes(storageInfo.sizeBytes)})
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {showDetails && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 text-xs"
              >
                {isExpanded ? 'Hide' : 'Details'}
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDismissed(true)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      {isExpanded && (
        <div className="mt-2 p-3 bg-amber-25 dark:bg-amber-975 border border-amber-200 dark:border-amber-800 rounded-md">
          <div className="text-sm text-amber-800 dark:text-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <span>Files stored locally:</span>
              <span className="font-mono">{storageInfo.count}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Storage used:</span>
              <span className="font-mono">{formatBytes(storageInfo.sizeBytes)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Storage limit:</span>
              <span className="font-mono">{formatBytes(storageInfo.maxSizeBytes)}</span>
            </div>
            
            <div className="w-full bg-amber-200 dark:bg-amber-800 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (storageInfo.sizeBytes / storageInfo.maxSizeBytes) * 100)}%`
                }}
              />
            </div>
            
            <div className="pt-2 border-t border-amber-200 dark:border-amber-700">
              <p className="text-xs mb-2">
                These files are stored temporarily in your browser due to server issues. 
                They will be automatically uploaded when the service is restored.
              </p>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearStorage}
                className="h-6 text-xs text-amber-700 dark:text-amber-300 border-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear All Temporary Files
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FallbackStorageIndicator;

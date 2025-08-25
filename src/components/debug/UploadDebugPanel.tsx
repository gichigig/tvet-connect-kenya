// Debug panel for upload configuration
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCourseContent } from '@/contexts/CourseContentContext';

export const UploadDebugPanel: React.FC = () => {
  const { allContent } = useCourseContent();
  
  const config = {
    lambdaEndpoint: import.meta.env.VITE_LAMBDA_ENDPOINT,
    awsRegion: import.meta.env.VITE_AWS_REGION,
    s3Bucket: import.meta.env.VITE_S3_BUCKET_NAME,
    hasAccessKey: !!import.meta.env.VITE_***REMOVED***,
    hasSecretKey: !!import.meta.env.VITE_***REMOVED***,
    environment: import.meta.env.MODE,
    totalContent: allContent.length
  };

  return (
    <Card className="mb-4 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-sm text-yellow-800">Upload Configuration (Debug)</CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-gray-600">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <strong>Environment:</strong> <Badge variant="outline">{config.environment}</Badge>
          </div>
          <div>
            <strong>AWS Region:</strong> {config.awsRegion || 'Not set'}
          </div>
          <div>
            <strong>S3 Bucket:</strong> {config.s3Bucket || 'Not set'}
          </div>
          <div>
            <strong>Lambda Endpoint:</strong> {config.lambdaEndpoint ? 'Configured' : 'Not set'}
          </div>
          <div>
            <strong>AWS Access Key:</strong> {config.hasAccessKey ? '✅ Present' : '❌ Missing'}
          </div>
          <div>
            <strong>AWS Secret Key:</strong> {config.hasSecretKey ? '✅ Present' : '❌ Missing'}
          </div>
          <div>
            <strong>Stored Content:</strong> <Badge variant="secondary">{config.totalContent} items</Badge>
          </div>
        </div>
        <div className="mt-2 text-xs text-yellow-700">
          Upload will try: Lambda → Direct S3 → Local Storage (fallback)
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadDebugPanel;

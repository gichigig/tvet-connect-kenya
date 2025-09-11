import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, RefreshCw } from "lucide-react";

interface EmptyUnitsStateProps {
  onRefresh?: () => void;
  onBrowseUnits?: () => void;
  message?: string;
}

export const EmptyUnitsState: React.FC<EmptyUnitsStateProps> = ({
  onRefresh,
  onBrowseUnits,
  message = "You haven't enrolled in any units yet"
}) => {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="h-8 w-8 text-gray-400" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">No Units Found</h3>
            <p className="text-gray-600 max-w-md">{message}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            {onBrowseUnits && (
              <Button onClick={onBrowseUnits} className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Browse Available Units
              </Button>
            )}
            
            {onRefresh && (
              <Button variant="outline" onClick={onRefresh} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            )}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Getting Started:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>Ã¢â‚¬Â¢ Contact your academic advisor for unit recommendations</li>
              <li>Ã¢â‚¬Â¢ Check prerequisite requirements before enrolling</li>
              <li>Ã¢â‚¬Â¢ Ensure you meet the enrollment deadlines</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

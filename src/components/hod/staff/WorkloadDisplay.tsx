// Workload Display Component
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Briefcase, Clock, Users, BookOpen } from "lucide-react";

interface WorkloadData {
  totalHours: number;
  maxHours: number;
  subjects: number;
  students: number;
  classes: number;
}

interface WorkloadDisplayProps {
  workload: WorkloadData;
  displayType?: 'compact' | 'detailed';
  className?: string;
}

export const WorkloadDisplay = ({ 
  workload, 
  displayType = 'compact', 
  className 
}: WorkloadDisplayProps) => {
  const utilizationPercentage = Math.min((workload.totalHours / workload.maxHours) * 100, 100);
  
  const getWorkloadStatus = (percentage: number) => {
    if (percentage >= 90) return { label: 'Overloaded', color: 'red', bgColor: 'bg-red-100' };
    if (percentage >= 80) return { label: 'High', color: 'orange', bgColor: 'bg-orange-100' };
    if (percentage >= 60) return { label: 'Normal', color: 'green', bgColor: 'bg-green-100' };
    if (percentage >= 40) return { label: 'Light', color: 'blue', bgColor: 'bg-blue-100' };
    return { label: 'Very Light', color: 'gray', bgColor: 'bg-gray-100' };
  };

  const status = getWorkloadStatus(utilizationPercentage);

  if (displayType === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className || ''}`}>
        <Badge 
          variant="outline" 
          className={`${status.bgColor} text-${status.color}-800 border-${status.color}-300`}
        >
          <Briefcase className="h-3 w-3 mr-1" />
          {status.label}
        </Badge>
        <span className="text-sm text-gray-600">
          {workload.totalHours}h/{workload.maxHours}h
        </span>
      </div>
    );
  }

  return (
    <div className={`space-y-3 p-4 border rounded-lg ${className || ''}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Workload Summary</h4>
        <Badge 
          variant="outline" 
          className={`${status.bgColor} text-${status.color}-800 border-${status.color}-300`}
        >
          {status.label}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Teaching Hours
          </span>
          <span className="font-medium">
            {workload.totalHours}/{workload.maxHours} hours
          </span>
        </div>
        
        <Progress 
          value={utilizationPercentage} 
          className="h-2"
        />
        
        <div className="text-xs text-gray-500 text-right">
          {utilizationPercentage.toFixed(1)}% utilization
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-2 border-t">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <BookOpen className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-lg font-semibold text-gray-900">{workload.subjects}</div>
          <div className="text-xs text-gray-500">Subjects</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Users className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-lg font-semibold text-gray-900">{workload.students}</div>
          <div className="text-xs text-gray-500">Students</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Briefcase className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-lg font-semibold text-gray-900">{workload.classes}</div>
          <div className="text-xs text-gray-500">Classes</div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Clock, GraduationCap, Calendar } from "lucide-react";
import { Unit } from './types';

interface UnitCardProps {
  unit: Unit;
  onViewDetails?: (unit: Unit) => void;
  onEnroll?: (unit: Unit) => void;
  showActions?: boolean;
}

export const UnitCard: React.FC<UnitCardProps> = ({ 
  unit, 
  onViewDetails, 
  onEnroll, 
  showActions = true 
}) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'enrolled': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendanceColor = (attendance?: number) => {
    if (!attendance) return 'text-gray-500';
    if (attendance >= 75) return 'text-green-600';
    if (attendance >= 65) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{unit.name}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <span>{unit.code}</span>
              <Badge variant="outline">{unit.course}</Badge>
            </CardDescription>
          </div>
          {unit.status && (
            <Badge className={getStatusColor(unit.status)}>
              {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {unit.description && (
          <p className="text-sm text-gray-600">{unit.description}</p>
        )}
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-gray-500" />
            <span>Year {unit.year}, Sem {unit.semester}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{unit.credits} Credits</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span>{unit.enrolled}/{unit.capacity} Students</span>
          </div>
          {unit.attendance !== undefined && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className={getAttendanceColor(unit.attendance)}>
                {unit.attendance}% Attendance
              </span>
            </div>
          )}
        </div>

        {unit.grade && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Grade:</span>
              <Badge variant="secondary">{unit.grade}</Badge>
            </div>
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 pt-2 border-t">
            {onViewDetails && (
              <Button size="sm" variant="outline" onClick={() => onViewDetails(unit)}>
                <BookOpen className="h-4 w-4 mr-2" />
                View Details
              </Button>
            )}
            {onEnroll && unit.status !== 'enrolled' && (
              <Button size="sm" onClick={() => onEnroll(unit)}>
                Enroll
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, AlertCircle, BookOpen } from "lucide-react";
import { Unit } from '../units/types';

interface RegisteredUnit extends Unit {
  registrationStatus: 'pending' | 'approved' | 'rejected';
  registrationDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
}

interface RegisteredUnitsDisplayProps {
  onViewDetails?: (unit: RegisteredUnit) => void;
}

export const RegisteredUnitsDisplay: React.FC<RegisteredUnitsDisplayProps> = ({ onViewDetails }) => {
  // Mock registered units data
  const [registeredUnits] = useState<RegisteredUnit[]>([
    {
      id: '1',
      name: 'Programming Fundamentals',
      code: 'CP101',
      course: 'Computer Programming',
      courseCode: 'CP101',
      semester: 1,
      year: 1,
      credits: 3,
      enrolled: 25,
      capacity: 30,
      registrationStatus: 'approved',
      registrationDate: '2025-09-01',
      approvedBy: 'Academic Office',
      approvedDate: '2025-09-02',
      status: 'active',
      lecturer: 'Dr. Smith',
      progress: 75,
      nextClass: 'Monday 9AM'
    },
    {
      id: '2',
      name: 'Database Systems',
      code: 'CP201',
      course: 'Computer Programming',
      courseCode: 'CP101',
      semester: 2,
      year: 1,
      credits: 4,
      enrolled: 20,
      capacity: 25,
      registrationStatus: 'pending',
      registrationDate: '2025-09-05',
      status: 'pending',
      lecturer: 'Dr. Johnson',
      progress: 0,
      nextClass: 'Tuesday 10AM'
    },
    {
      id: '3',
      name: 'Advanced Mathematics',
      code: 'MT301',
      course: 'Engineering Mathematics',
      courseCode: 'MT301',
      semester: 1,
      year: 2,
      credits: 4,
      enrolled: 15,
      capacity: 20,
      registrationStatus: 'rejected',
      registrationDate: '2025-09-03',
      rejectionReason: 'Prerequisites not met',
      status: 'pending',
      lecturer: 'Dr. Wilson',
      progress: 0,
      nextClass: 'Wednesday 11AM'
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingCount = registeredUnits.filter(unit => unit.registrationStatus === 'pending').length;
  const approvedCount = registeredUnits.filter(unit => unit.registrationStatus === 'approved').length;
  const rejectedCount = registeredUnits.filter(unit => unit.registrationStatus === 'rejected').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Unit Registrations</h2>
          <p className="text-gray-600">Track your unit registration status</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-600" />
            {approvedCount} Approved
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-yellow-600" />
            {pendingCount} Pending
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <XCircle className="h-3 w-3 text-red-600" />
            {rejectedCount} Rejected
          </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {registeredUnits.map((unit) => (
          <Card key={unit.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {unit.name}
                  </CardTitle>
                  <CardDescription>{unit.code} - {unit.course}</CardDescription>
                </div>
                <Badge className={getStatusColor(unit.registrationStatus)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(unit.registrationStatus)}
                    {unit.registrationStatus.charAt(0).toUpperCase() + unit.registrationStatus.slice(1)}
                  </div>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Credits:</span>
                    <span className="ml-2 font-medium">{unit.credits}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Year/Semester:</span>
                    <span className="ml-2 font-medium">Year {unit.year}, Sem {unit.semester}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Registration Date:</span>
                    <span className="ml-2 font-medium">{new Date(unit.registrationDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Capacity:</span>
                    <span className="ml-2 font-medium">{unit.enrolled}/{unit.capacity}</span>
                  </div>
                </div>

                {unit.registrationStatus === 'approved' && unit.approvedDate && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-800">
                        Approved on {new Date(unit.approvedDate).toLocaleDateString()}
                        {unit.approvedBy && ` by ${unit.approvedBy}`}
                      </span>
                    </div>
                  </div>
                )}

                {unit.registrationStatus === 'pending' && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        Registration is being reviewed. You will be notified once approved.
                      </span>
                    </div>
                  </div>
                )}

                {unit.registrationStatus === 'rejected' && unit.rejectionReason && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-800">
                        Rejected: {unit.rejectionReason}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t">
                  {onViewDetails && (
                    <Button size="sm" variant="outline" onClick={() => onViewDetails(unit)}>
                      View Details
                    </Button>
                  )}
                  {unit.registrationStatus === 'rejected' && (
                    <Button size="sm" variant="outline">
                      Re-apply
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {registeredUnits.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Registrations Yet</h3>
            <p className="text-gray-600 text-center mb-4">
              You haven't registered for any units yet. Browse available units to get started.
            </p>
            <Button>Browse Units</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
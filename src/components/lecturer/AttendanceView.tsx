import React from 'react';
import type { StudentData, GeolocationData } from '@/types/attendance';

interface AttendanceViewProps {
  student: StudentData | null;
  location: GeolocationData | null;
  isInsideGeofence: boolean;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ student, location, isInsideGeofence }) => {
  return (
    <div className="p-4 border rounded-lg bg-muted/50 mb-4">
      <h3 className="font-semibold mb-2">Attendance View</h3>
      <div className="text-sm">
        <p>Student: {student ? student.name : 'N/A'}</p>
        <p>Location: {location ? `${location.latitude}, ${location.longitude}` : 'N/A'}</p>
        <p>Status: {isInsideGeofence ? <span className="text-green-600">Inside Allowed Zone</span> : <span className="text-red-600">Outside Allowed Zone</span>}</p>
      </div>
    </div>
  );
};

export default AttendanceView;

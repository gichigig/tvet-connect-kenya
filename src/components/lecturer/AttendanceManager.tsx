
// @ts-nocheck
import { useState } from "react";
import { Calendar } from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { AttendanceForm } from "./attendance-manager/AttendanceForm";
import { AttendanceHistory } from "./attendance-manager/AttendanceHistory";
import { useDashboardSync } from "@/hooks/useDashboardSync";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AttendanceRecord {
  id: string;
  unitCode: string;
  unitName: string;
  date: string;
  totalStudents: number;
  presentStudents: number;
  attendanceRate: number;
}

export const AttendanceManager = () => {
  const { user, createdUnits } = useAuth();
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  
  // Get synced attendance sessions from semester plans
  const { getContentByType } = useDashboardSync('lecturer');
  const syncedAttendanceSessions = getContentByType('attendance');

  // Get units assigned to current lecturer
  const assignedUnits = createdUnits.filter(unit => unit.lecturerId === user?.id);

  console.log('AttendanceManager Debug:', {
    syncedAttendanceCount: syncedAttendanceSessions.length,
    assignedUnitsCount: assignedUnits.length,
    syncedSample: syncedAttendanceSessions.slice(0, 2)
  });

  const handleSaveAttendance = (record: AttendanceRecord) => {
    setAttendanceHistory([record, ...attendanceHistory]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Attendance Management</h2>
          <p className="text-gray-600">
            Take attendance for your classes
            {syncedAttendanceSessions.length > 0 && (
              <span className="text-blue-600 ml-1">
                Ã¢â‚¬Â¢ {syncedAttendanceSessions.length} sessions synced from semester plans
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600">Today: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Show synced attendance sessions from semester plans */}
      {syncedAttendanceSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Attendance Sessions</CardTitle>
            <CardDescription>
              Sessions created in semester plans that require attendance tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {syncedAttendanceSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{session.title}</h4>
                    <p className="text-sm text-gray-600">{session.unitCode} - {session.unitName}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(session.date).toLocaleDateString()} at {session.startTime} - {session.endTime}
                    </p>
                    {session.venue && (
                      <p className="text-xs text-gray-500">Venue: {session.venue}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs ${
                      session.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {session.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Week {session.weekNumber}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <AttendanceForm 
        assignedUnits={assignedUnits}
        onSaveAttendance={handleSaveAttendance}
      />

      <AttendanceHistory attendanceHistory={attendanceHistory} />
    </div>
  );
};
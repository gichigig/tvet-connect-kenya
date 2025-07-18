
import { useState } from "react";
import { Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AttendanceForm } from "./attendance-manager/AttendanceForm";
import { AttendanceHistory } from "./attendance-manager/AttendanceHistory";

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

  // Get units assigned to current lecturer
  const assignedUnits = createdUnits.filter(unit => unit.lecturerId === user?.id);

  const handleSaveAttendance = (record: AttendanceRecord) => {
    setAttendanceHistory([record, ...attendanceHistory]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manual Attendance</h2>
          <p className="text-gray-600">Take attendance for your classes</p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600">Today: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <AttendanceForm 
        assignedUnits={assignedUnits}
        onSaveAttendance={handleSaveAttendance}
      />

      <AttendanceHistory attendanceHistory={attendanceHistory} />
    </div>
  );
};